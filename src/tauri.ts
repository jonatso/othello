import { invoke } from "@tauri-apps/api/core";

export const isTauriRuntime = () => "__TAURI_INTERNALS__" in window;

export async function invokeTauri<T>(command: string, args?: Record<string, unknown>) {
  if (!isTauriRuntime()) {
    throw new Error("Open the app with `pnpm dev` or the built OthelloP2P.app. Tauri commands are not available in a normal browser tab.");
  }

  return invoke<T>(command, args);
}
