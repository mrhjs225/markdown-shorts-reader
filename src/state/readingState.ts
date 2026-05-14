import * as vscode from "vscode";
import type { StoredReadingState } from "../markdown/types";

const STORAGE_KEY = "mdShorts.readingState";

export function getReadingState(
  context: vscode.ExtensionContext,
  documentUri: string
): StoredReadingState | undefined {
  const states = context.workspaceState.get<Record<string, StoredReadingState>>(STORAGE_KEY) ?? {};
  return states[documentUri];
}

export async function saveReadingState(
  context: vscode.ExtensionContext,
  state: StoredReadingState
): Promise<void> {
  const states = context.workspaceState.get<Record<string, StoredReadingState>>(STORAGE_KEY) ?? {};

  await context.workspaceState.update(STORAGE_KEY, {
    ...states,
    [state.documentUri]: state
  });
}
