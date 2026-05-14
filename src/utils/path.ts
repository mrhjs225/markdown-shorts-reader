import * as vscode from "vscode";

export function getFileName(uri: vscode.Uri): string {
  return uri.path.split("/").pop() ?? "Markdown";
}
