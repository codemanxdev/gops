import * as vscode from "vscode";

export class MenuContextService {
  async set(key: string, value: any) {
    await vscode.commands.executeCommand("setContext", key, value);
  }
}
