import * as vscode from "vscode";
import { openReader } from "./commands/openReader";

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand("mdShorts.openReader", () =>
    openReader(context)
  );

  context.subscriptions.push(disposable);
}

export function deactivate(): void {}
