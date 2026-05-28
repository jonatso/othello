mod game;

use std::sync::Arc;
use std::time::Duration;

use anyhow::{anyhow, Context, Result};
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine;
use game::{apply_move, create_game_state, winner_text, GameSnapshot, GameState, Position};
use iroh::endpoint::{presets, Connection};
use iroh::{Endpoint, EndpointAddr};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Manager, State};
use tokio::sync::Mutex;

const ALPN: &[u8] = b"com.jonatansolheim.othello/1";
const MAX_MESSAGE_SIZE: usize = 64 * 1024;

type SharedState = Arc<Mutex<AppState>>;

#[derive(Default)]
struct AppState {
    endpoint: Option<Endpoint>,
    connection: Option<Connection>,
    game_state: Option<GameState>,
    game_has_started: bool,
    game_is_ended: bool,
    is_player1: Option<bool>,
    status: String,
    game_link: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct PeerEvent {
    snapshot: GameSnapshot,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(tag = "type", rename_all = "camelCase")]
enum WireMessage {
    Hello,
    State {
        game_state: GameState,
        game_is_ended: bool,
        is_player1: Option<bool>,
    },
    Move {
        row: usize,
        col: usize,
    },
    RematchStart,
    Leave,
}

#[tauri::command]
async fn create_game(
    app: AppHandle,
    state: State<'_, SharedState>,
) -> Result<GameSnapshot, String> {
    let endpoint = bind_endpoint().await.map_err(to_command_error)?;
    let game_state = create_game_state();
    let game_link = create_game_link(&endpoint.addr()).map_err(to_command_error)?;

    {
        let mut app_state = state.lock().await;
        app_state.endpoint = Some(endpoint.clone());
        app_state.connection = None;
        app_state.game_state = Some(game_state);
        app_state.game_has_started = false;
        app_state.game_is_ended = false;
        app_state.is_player1 = Some(rand::random());
        app_state.status = "Waiting for opponent".to_string();
        app_state.game_link = Some(game_link);
    }

    start_accept_loop(endpoint, state.inner().clone(), app);
    Ok(snapshot(&state).await)
}

#[tauri::command]
async fn join_game(
    app: AppHandle,
    state: State<'_, SharedState>,
    game_link: String,
) -> Result<GameSnapshot, String> {
    let endpoint_addr = parse_game_link(&game_link).map_err(to_command_error)?;
    let endpoint = bind_endpoint().await.map_err(to_command_error)?;

    {
        let mut app_state = state.lock().await;
        app_state.endpoint = Some(endpoint.clone());
        app_state.connection = None;
        app_state.game_state = Some(create_game_state());
        app_state.game_has_started = false;
        app_state.game_is_ended = false;
        app_state.is_player1 = None;
        app_state.status = "Joining game...".to_string();
        app_state.game_link = Some(game_link);
    }

    let connection = endpoint
        .connect(endpoint_addr, ALPN)
        .await
        .context("failed to connect to peer")
        .map_err(to_command_error)?;

    register_connection(connection, state.inner().clone(), app).await;
    send_message_from_state(state.inner().clone(), WireMessage::Hello)
        .await
        .map_err(to_command_error)?;

    Ok(snapshot(&state).await)
}

#[tauri::command]
async fn make_move(
    state: State<'_, SharedState>,
    row: usize,
    col: usize,
) -> Result<GameSnapshot, String> {
    let connection;
    let snapshot_after_move;

    {
        let mut app_state = state.lock().await;
        if !app_state.game_has_started || app_state.game_is_ended {
            return Err("Game is not active".to_string());
        }

        let is_player1 = app_state
            .is_player1
            .ok_or_else(|| "You are not in a game".to_string())?;
        let game_state = app_state
            .game_state
            .clone()
            .ok_or_else(|| "Game state is unavailable".to_string())?;

        if game_state.is_whites_turn != is_player1 {
            return Err("It is not your turn".to_string());
        }

        let (next_state, game_ended) = apply_move(&game_state, Position { row, col })
            .map_err(|_| "Invalid move".to_string())?;
        app_state.game_state = Some(next_state.clone());
        app_state.game_is_ended = game_ended;
        app_state.status = if game_ended {
            winner_text(&next_state)
        } else {
            "Move sent".to_string()
        };
        connection = app_state.connection.clone();
        snapshot_after_move = app_state.snapshot();
    }

    if let Some(connection) = connection {
        send_message(&connection, WireMessage::Move { row, col })
            .await
            .map_err(to_command_error)?;
    }

    Ok(snapshot_after_move)
}

#[tauri::command]
async fn leave_game(state: State<'_, SharedState>) -> Result<GameSnapshot, String> {
    let connection;
    let endpoint;

    {
        let mut app_state = state.lock().await;
        connection = app_state.connection.take();
        endpoint = app_state.endpoint.take();
        app_state.game_state = Some(create_game_state());
        app_state.game_has_started = false;
        app_state.game_is_ended = false;
        app_state.is_player1 = None;
        app_state.status = "Ready".to_string();
        app_state.game_link = None;
    }

    if let Some(connection) = connection {
        let _ = send_message(&connection, WireMessage::Leave).await;
        connection.close(0u8.into(), b"leave");
    }
    if let Some(endpoint) = endpoint {
        endpoint.close().await;
    }

    Ok(snapshot(&state).await)
}

#[tauri::command]
async fn current_game(state: State<'_, SharedState>) -> Result<GameSnapshot, String> {
    Ok(snapshot(&state).await)
}

#[tauri::command]
async fn request_rematch(state: State<'_, SharedState>) -> Result<GameSnapshot, String> {
    let connection;

    {
        let mut app_state = state.lock().await;
        if app_state.connection.is_none() {
            return Err("No opponent is connected".to_string());
        }
        if !app_state.game_is_ended {
            return Err("Rematch is available after the game ends".to_string());
        }

        app_state.start_rematch()?;
        connection = app_state.connection.clone();
    }

    if let Some(connection) = connection {
        send_message(&connection, WireMessage::RematchStart)
            .await
            .map_err(to_command_error)?;
    }

    Ok(snapshot(&state).await)
}

fn start_accept_loop(endpoint: Endpoint, state: SharedState, app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        while let Some(connecting) = endpoint.accept().await {
            match connecting.await {
                Ok(connection) => {
                    register_connection(connection, state.clone(), app.clone()).await;
                    break;
                }
                Err(error) => {
                    emit_snapshot_with_status(&state, &app, format!("Connection failed: {error}"))
                        .await;
                }
            }
        }
    });
}

async fn register_connection(connection: Connection, state: SharedState, app: AppHandle) {
    {
        let mut app_state = state.lock().await;
        app_state.connection = Some(connection.clone());
        if app_state.is_player1 == Some(true) {
            app_state.game_has_started = true;
            app_state.status = "Game started!".to_string();
        }
    }

    emit_snapshot(&state, &app).await;
    start_receive_loop(connection, state, app);
}

fn start_receive_loop(connection: Connection, state: SharedState, app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        loop {
            let message = read_message(&connection).await;

            match message {
                Ok(message) => handle_peer_message(message, state.clone(), app.clone()).await,
                Err(error) => {
                    emit_snapshot_with_status(&state, &app, format!("{error:#}")).await;
                    break;
                }
            }
        }
    });
}

async fn handle_peer_message(message: WireMessage, state: SharedState, app: AppHandle) {
    let response = {
        let mut app_state = state.lock().await;

        match message {
            WireMessage::Hello => {
                app_state.game_has_started = true;
                app_state.status = "Game started!".to_string();
                let peer_is_player1 = app_state.is_player1.map(|is_player1| !is_player1);
                app_state
                    .game_state
                    .as_ref()
                    .map(|game_state| WireMessage::State {
                        game_state: game_state.clone(),
                        game_is_ended: app_state.game_is_ended,
                        is_player1: peer_is_player1,
                    })
            }
            WireMessage::State {
                game_state,
                game_is_ended,
                is_player1,
            } => {
                app_state.game_state = Some(game_state.clone());
                app_state.game_has_started = true;
                app_state.game_is_ended = game_is_ended;
                app_state.is_player1 = is_player1;
                app_state.status = if game_is_ended {
                    winner_text(&game_state)
                } else {
                    "Game started!".to_string()
                };
                None
            }
            WireMessage::Move { row, col } => {
                match apply_remote_move(&mut app_state, Position { row, col }) {
                    Ok(()) => {}
                    Err(error) => app_state.status = error,
                }
                None
            }
            WireMessage::RematchStart => {
                if let Err(error) = app_state.start_rematch() {
                    app_state.status = error;
                }
                None
            }
            WireMessage::Leave => {
                app_state.connection = None;
                app_state.game_has_started = false;
                app_state.game_is_ended = false;
                app_state.is_player1 = None;
                app_state.status = "Opponent left the game".to_string();
                None
            }
        }
    };

    emit_snapshot(&state, &app).await;

    if let Some(response) = response {
        let _ = send_message_from_state(state, response).await;
    }
}

fn apply_remote_move(app_state: &mut AppState, position: Position) -> Result<(), String> {
    let is_player1 = app_state
        .is_player1
        .ok_or_else(|| "Peer move ignored: no local player role".to_string())?;
    let game_state = app_state
        .game_state
        .clone()
        .ok_or_else(|| "Peer move ignored: no game state".to_string())?;

    if game_state.is_whites_turn == is_player1 {
        return Err("Peer move ignored: not their turn".to_string());
    }

    let (next_state, game_ended) =
        apply_move(&game_state, position).map_err(|_| "Peer sent an invalid move".to_string())?;
    app_state.game_state = Some(next_state.clone());
    app_state.game_is_ended = game_ended;
    app_state.status = if game_ended {
        winner_text(&next_state)
    } else {
        "Opponent moved".to_string()
    };
    Ok(())
}

async fn send_message_from_state(state: SharedState, message: WireMessage) -> Result<()> {
    let connection = {
        let app_state = state.lock().await;
        app_state
            .connection
            .clone()
            .ok_or_else(|| anyhow!("no peer connection"))?
    };

    send_message(&connection, message).await
}

async fn send_message(connection: &Connection, message: WireMessage) -> Result<()> {
    let payload = serde_json::to_vec(&message)?;
    let mut stream = connection
        .open_uni()
        .await
        .context("failed to open peer stream")?;
    stream
        .write_all(&payload)
        .await
        .context("failed to write peer message")?;
    stream.finish().context("failed to finish peer message")?;
    Ok(())
}

async fn read_message(connection: &Connection) -> Result<WireMessage> {
    match connection.accept_uni().await {
        Ok(mut stream) => match stream.read_to_end(MAX_MESSAGE_SIZE).await {
            Ok(bytes) => serde_json::from_slice::<WireMessage>(&bytes)
                .context("failed to decode peer message"),
            Err(error) => Err(anyhow!(error).context("failed to read peer message")),
        },
        Err(error) => Err(anyhow!(error).context("peer disconnected")),
    }
}

async fn bind_endpoint() -> Result<Endpoint> {
    let endpoint = Endpoint::builder(presets::N0)
        .alpns(vec![ALPN.to_vec()])
        .bind()
        .await
        .context("failed to bind iroh endpoint")?;

    let endpoint_for_online = endpoint.clone();
    tauri::async_runtime::spawn(async move {
        let _ = tokio::time::timeout(Duration::from_secs(30), endpoint_for_online.online()).await;
    });
    Ok(endpoint)
}

fn create_game_link(endpoint_addr: &EndpointAddr) -> Result<String> {
    let json = serde_json::to_vec(endpoint_addr)?;
    let payload = URL_SAFE_NO_PAD.encode(json);
    Ok(format!("othello://join/{payload}"))
}

fn parse_game_link(link: &str) -> Result<EndpointAddr> {
    let payload = link
        .trim()
        .strip_prefix("othello://join/")
        .or_else(|| link.trim().strip_prefix("othello://"))
        .ok_or_else(|| anyhow!("expected an othello:// link"))?;
    let bytes = URL_SAFE_NO_PAD
        .decode(payload)
        .context("game link payload is not valid base64")?;
    serde_json::from_slice(&bytes).context("game link payload is not a valid iroh address")
}

async fn emit_snapshot(state: &SharedState, app: &AppHandle) {
    let snapshot = {
        let app_state = state.lock().await;
        app_state.snapshot()
    };
    let _ = app.emit("peer-event", PeerEvent { snapshot });
}

async fn emit_snapshot_with_status(state: &SharedState, app: &AppHandle, status: String) {
    let snapshot = {
        let mut app_state = state.lock().await;
        app_state.status = status;
        app_state.snapshot()
    };
    let _ = app.emit("peer-event", PeerEvent { snapshot });
}

async fn snapshot(state: &State<'_, SharedState>) -> GameSnapshot {
    let app_state = state.lock().await;
    app_state.snapshot()
}

impl AppState {
    fn snapshot(&self) -> GameSnapshot {
        GameSnapshot {
            game_state: self.game_state.clone().unwrap_or_else(create_game_state),
            game_has_started: self.game_has_started,
            game_is_ended: self.game_is_ended,
            is_player1: self.is_player1,
            status: if self.status.is_empty() {
                "Ready".to_string()
            } else {
                self.status.clone()
            },
            game_link: self.game_link.clone(),
        }
    }
}

fn to_command_error(error: anyhow::Error) -> String {
    format!("{error:#}")
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            let urls = argv
                .into_iter()
                .filter(|arg| arg.starts_with("othello://"))
                .collect::<Vec<_>>();
            if !urls.is_empty() {
                let _ = app.emit("deep-link", urls);
            }
        }))
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            app.manage(Arc::new(Mutex::new(AppState {
                game_state: Some(create_game_state()),
                status: "Ready".to_string(),
                ..Default::default()
            })));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            create_game,
            join_game,
            make_move,
            leave_game,
            current_game,
            request_rematch
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

impl AppState {
    fn start_rematch(&mut self) -> Result<(), String> {
        if !self.game_is_ended {
            return Ok(());
        }

        let is_player1 = self
            .is_player1
            .map(|is_player1| !is_player1)
            .ok_or_else(|| "You are not in a game".to_string())?;

        self.game_state = Some(create_game_state());
        self.game_has_started = true;
        self.game_is_ended = false;
        self.is_player1 = Some(is_player1);
        self.status = "Rematch started!".to_string();
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use game::Color;

    #[tokio::test]
    async fn production_endpoint_creates_a_join_link_without_blocking_on_relay() {
        let endpoint = tokio::time::timeout(Duration::from_secs(3), bind_endpoint())
            .await
            .expect("host endpoint should bind without a long online wait")
            .unwrap();
        let game_link = create_game_link(&endpoint.addr()).unwrap();

        assert!(game_link.starts_with("othello://join/"));
        parse_game_link(&game_link).unwrap();

        endpoint.close().await;
    }

    #[tokio::test]
    async fn iroh_link_handshake_and_move_sync_work_locally() {
        let host_endpoint = bind_loopback_endpoint().await;
        let join_endpoint = bind_loopback_endpoint().await;
        let host_link = create_game_link(&host_endpoint.addr()).unwrap();
        let host_addr = parse_game_link(&host_link).unwrap();

        let host_endpoint_for_accept = host_endpoint.clone();
        let accept_task = tokio::spawn(async move {
            tokio::time::timeout(Duration::from_secs(10), async {
                host_endpoint_for_accept
                    .accept()
                    .await
                    .expect("host should accept a connection")
                    .await
                    .expect("incoming connection should establish")
            })
            .await
            .expect("host should accept within timeout")
        });
        let join_connection = tokio::time::timeout(Duration::from_secs(10), async {
            join_endpoint
                .connect(host_addr, ALPN)
                .await
                .expect("joiner should connect to host")
        })
        .await
        .expect("joiner should connect within timeout");
        let host_connection = accept_task.await.expect("accept task should finish");

        let mut host_state = AppState {
            connection: Some(host_connection.clone()),
            game_state: Some(create_game_state()),
            game_has_started: true,
            game_is_ended: false,
            is_player1: Some(false),
            status: "Game started!".to_string(),
            game_link: Some(host_link),
            ..Default::default()
        };
        let mut join_state = AppState {
            connection: Some(join_connection.clone()),
            game_state: Some(create_game_state()),
            game_has_started: false,
            game_is_ended: false,
            is_player1: Some(false),
            status: "Joining game...".to_string(),
            ..Default::default()
        };

        send_message(&join_connection, WireMessage::Hello)
            .await
            .expect("joiner should send hello");
        assert!(matches!(
            tokio::time::timeout(Duration::from_secs(5), read_message(&host_connection))
                .await
                .expect("host should receive hello within timeout")
                .unwrap(),
            WireMessage::Hello
        ));

        let initial_state = host_state.game_state.clone().unwrap();
        send_message(
            &host_connection,
            WireMessage::State {
                game_state: initial_state.clone(),
                game_is_ended: false,
                is_player1: Some(true),
            },
        )
        .await
        .expect("host should send state");

        match tokio::time::timeout(Duration::from_secs(5), read_message(&join_connection))
            .await
            .expect("joiner should receive state within timeout")
            .unwrap()
        {
            WireMessage::State {
                game_state,
                game_is_ended,
                is_player1,
            } => {
                join_state.game_state = Some(game_state);
                join_state.game_has_started = true;
                join_state.game_is_ended = game_is_ended;
                join_state.is_player1 = is_player1;
            }
            message => panic!("expected state message, got {message:?}"),
        }

        let (host_next_state, host_game_ended) =
            apply_move(&initial_state, Position { row: 2, col: 4 }).unwrap();
        host_state.game_state = Some(host_next_state.clone());
        host_state.game_is_ended = host_game_ended;
        send_message(&host_connection, WireMessage::Move { row: 2, col: 4 })
            .await
            .expect("host should send move");

        match tokio::time::timeout(Duration::from_secs(5), read_message(&join_connection))
            .await
            .expect("joiner should receive move within timeout")
            .unwrap()
        {
            WireMessage::Move { row, col } => {
                apply_remote_move(&mut join_state, Position { row, col }).unwrap();
            }
            message => panic!("expected move message, got {message:?}"),
        }

        assert_eq!(join_state.game_state, Some(host_next_state));
        assert_eq!(join_state.game_is_ended, host_game_ended);
        assert_eq!(
            join_state.game_state.unwrap().board[3][4],
            Some(Color::B),
            "the joined peer should apply the host move and flip the captured piece",
        );

        host_connection.close(0u8.into(), b"test done");
        join_connection.close(0u8.into(), b"test done");
        host_endpoint.close().await;
        join_endpoint.close().await;
    }

    #[test]
    fn rematch_start_resets_game_state_immediately() {
        let mut host_state = AppState {
            game_state: Some(create_game_state()),
            game_has_started: true,
            game_is_ended: true,
            is_player1: Some(true),
            status: "White wins!".to_string(),
            ..Default::default()
        };

        host_state.start_rematch().unwrap();

        let snapshot = host_state.snapshot();
        assert!(snapshot.game_has_started);
        assert!(!snapshot.game_is_ended);
        assert_eq!(snapshot.is_player1, Some(false));
        assert_eq!(snapshot.status, "Rematch started!");
        assert_eq!(snapshot.game_state, create_game_state());
    }

    #[test]
    fn rematch_message_swaps_the_receiving_player_role() {
        let mut join_state = AppState {
            game_state: Some(create_game_state()),
            game_has_started: true,
            game_is_ended: true,
            is_player1: Some(false),
            status: "Black wins!".to_string(),
            ..Default::default()
        };

        match WireMessage::RematchStart {
            WireMessage::RematchStart => join_state.start_rematch().unwrap(),
            _ => unreachable!(),
        }

        let snapshot = join_state.snapshot();
        assert!(snapshot.game_has_started);
        assert!(!snapshot.game_is_ended);
        assert_eq!(snapshot.is_player1, Some(true));
        assert_eq!(snapshot.game_state, create_game_state());
    }

    #[test]
    fn remote_rematch_is_ignored_after_local_rematch_started() {
        let mut host_state = AppState {
            game_state: Some(create_game_state()),
            game_has_started: true,
            game_is_ended: true,
            is_player1: Some(true),
            status: "White wins!".to_string(),
            ..Default::default()
        };

        host_state.start_rematch().unwrap();
        host_state.start_rematch().unwrap();

        assert_eq!(host_state.snapshot().is_player1, Some(false));
    }

    async fn bind_loopback_endpoint() -> Endpoint {
        Endpoint::builder(presets::N0)
            .alpns(vec![ALPN.to_vec()])
            .clear_ip_transports()
            .bind_addr("127.0.0.1:0")
            .unwrap()
            .bind()
            .await
            .unwrap()
    }
}
