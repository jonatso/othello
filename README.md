# Othello

A Tauri + React Othello app that connects two desktop clients directly over iroh.

## Development

```sh
pnpm install
pnpm dev
```

## Tests

```sh
pnpm test
```

Game rules live in the Tauri Rust backend. The React frontend talks to Rust through Tauri commands and receives peer/game updates through Tauri events.

Hosting creates an `othello://join/...` link. Opening that link in another installed app instance auto-joins the game through the deep-link plugin.
