use serde::{Deserialize, Serialize};

pub const BOARD_SIZE: usize = 8;

#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Color {
    W,
    B,
}

#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
pub struct Position {
    pub row: usize,
    pub col: usize,
}

pub type Piece = Option<Color>;
pub type Board = [[Piece; BOARD_SIZE]; BOARD_SIZE];

#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GameState {
    pub board: Board,
    pub possible_moves_board: Board,
    pub is_blacks_turn: bool,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GameSnapshot {
    pub game_state: GameState,
    pub game_has_started: bool,
    pub game_is_ended: bool,
    pub is_black: Option<bool>,
    pub status: String,
    pub game_link: Option<String>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum MoveError {
    InvalidMove,
}

const DIRECTIONS: [PositionDelta; 8] = [
    PositionDelta { row: 0, col: 1 },
    PositionDelta { row: 0, col: -1 },
    PositionDelta { row: 1, col: 0 },
    PositionDelta { row: -1, col: 0 },
    PositionDelta { row: 1, col: 1 },
    PositionDelta { row: 1, col: -1 },
    PositionDelta { row: -1, col: 1 },
    PositionDelta { row: -1, col: -1 },
];

#[derive(Clone, Copy)]
struct PositionDelta {
    row: isize,
    col: isize,
}

pub fn create_game_state() -> GameState {
    let mut board = [[None; BOARD_SIZE]; BOARD_SIZE];
    board[3][3] = Some(Color::B);
    board[3][4] = Some(Color::W);
    board[4][3] = Some(Color::W);
    board[4][4] = Some(Color::B);

    create_game_state_from_board(board, Color::B)
}

pub fn create_game_state_from_board(board: Board, current_player: Color) -> GameState {
    GameState {
        board,
        possible_moves_board: create_possible_moves_board(&board, current_player),
        is_blacks_turn: current_player == Color::B,
    }
}

pub fn apply_move(
    game_state: &GameState,
    position: Position,
) -> Result<(GameState, bool), MoveError> {
    let current_player = get_current_player(game_state);
    let flips = get_flips_for_move(&game_state.board, current_player, position);

    if flips.is_empty() {
        return Err(MoveError::InvalidMove);
    }

    let mut board = game_state.board;
    board[position.row][position.col] = Some(current_player);

    for flip in flips {
        board[flip.row][flip.col] = Some(current_player);
    }

    let next_player = get_next_player(&board, current_player);
    let game_ended = !has_any_valid_moves(&board, current_player)
        && !has_any_valid_moves(&board, opponent_of(current_player));

    Ok((create_game_state_from_board(board, next_player), game_ended))
}

pub fn get_current_player(game_state: &GameState) -> Color {
    if game_state.is_blacks_turn {
        Color::B
    } else {
        Color::W
    }
}

pub fn get_flips_for_move(board: &Board, player: Color, position: Position) -> Vec<Position> {
    if !is_on_board(position) || board[position.row][position.col].is_some() {
        return Vec::new();
    }

    let opponent = opponent_of(player);
    let mut flips = Vec::new();

    for direction in DIRECTIONS {
        let mut line_flips = Vec::new();
        let mut cursor = step(position, direction);

        while let Some(current) = cursor {
            match board[current.row][current.col] {
                Some(piece) if piece == opponent => line_flips.push(current),
                Some(piece) if piece == player => {
                    if !line_flips.is_empty() {
                        flips.extend(line_flips);
                    }
                    break;
                }
                _ => break,
            }

            cursor = step(current, direction);
        }
    }

    flips
}

pub fn get_valid_moves(board: &Board, player: Color) -> Vec<Position> {
    let mut moves = Vec::new();

    for row in 0..BOARD_SIZE {
        for col in 0..BOARD_SIZE {
            let position = Position { row, col };
            if !get_flips_for_move(board, player, position).is_empty() {
                moves.push(position);
            }
        }
    }

    moves
}

pub fn has_any_valid_moves(board: &Board, player: Color) -> bool {
    !get_valid_moves(board, player).is_empty()
}

pub fn count_pieces(board: &Board, piece: Color) -> usize {
    board
        .iter()
        .flatten()
        .filter(|cell| **cell == Some(piece))
        .count()
}

pub fn winner_text(state: &GameState) -> String {
    let white = count_pieces(&state.board, Color::W);
    let black = count_pieces(&state.board, Color::B);

    match white.cmp(&black) {
        std::cmp::Ordering::Equal => "It's a tie!".to_string(),
        std::cmp::Ordering::Greater => "White wins!".to_string(),
        std::cmp::Ordering::Less => "Black wins!".to_string(),
    }
}

fn create_possible_moves_board(board: &Board, player: Color) -> Board {
    let mut possible_moves_board = [[None; BOARD_SIZE]; BOARD_SIZE];

    for position in get_valid_moves(board, player) {
        possible_moves_board[position.row][position.col] = Some(player);
    }

    possible_moves_board
}

fn get_next_player(board: &Board, current_player: Color) -> Color {
    let opponent = opponent_of(current_player);
    if has_any_valid_moves(board, opponent) {
        opponent
    } else {
        current_player
    }
}

fn opponent_of(player: Color) -> Color {
    match player {
        Color::W => Color::B,
        Color::B => Color::W,
    }
}

fn is_on_board(position: Position) -> bool {
    position.row < BOARD_SIZE && position.col < BOARD_SIZE
}

fn step(position: Position, direction: PositionDelta) -> Option<Position> {
    let row = position.row as isize + direction.row;
    let col = position.col as isize + direction.col;

    if row < 0 || row >= BOARD_SIZE as isize || col < 0 || col >= BOARD_SIZE as isize {
        None
    } else {
        Some(Position {
            row: row as usize,
            col: col as usize,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn creates_initial_state() {
        let state = create_game_state();

        assert_eq!(state.board[3][3], Some(Color::B));
        assert_eq!(state.board[3][4], Some(Color::W));
        assert_eq!(state.board[4][3], Some(Color::W));
        assert_eq!(state.board[4][4], Some(Color::B));
        assert_eq!(get_valid_moves(&state.board, Color::B).len(), 4);
    }

    #[test]
    fn applies_opening_move() {
        let state = create_game_state();
        let (next, ended) = apply_move(&state, Position { row: 2, col: 4 }).unwrap();

        assert!(!ended);
        assert_eq!(next.board[2][4], Some(Color::B));
        assert_eq!(next.board[3][4], Some(Color::B));
        assert!(!next.is_blacks_turn);
    }

    #[test]
    fn rejects_move_through_empty_gap() {
        let mut board = [[None; BOARD_SIZE]; BOARD_SIZE];
        board[3][2] = Some(Color::B);
        board[3][4] = Some(Color::W);
        let state = create_game_state_from_board(board, Color::W);

        assert!(apply_move(&state, Position { row: 3, col: 0 }).is_err());
        assert!(get_flips_for_move(&state.board, Color::W, Position { row: 3, col: 0 }).is_empty());
    }
}
