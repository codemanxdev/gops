import * as vscode from "vscode";
import { Logger } from "../logging/Logger";

export class Notifications {
  static info(message: string): Thenable<string | undefined> {
    return vscode.window.showInformationMessage(message);
  }

  static warning(message: string): Thenable<string | undefined> {
    return vscode.window.showWarningMessage(message);
  }

  static error(message: string): Thenable<string | undefined> {
    return vscode.window.showErrorMessage(message);
  }

  static async errorWithOutput(message: string): Promise<void> {
    const selection = await vscode.window.showErrorMessage(
      message,
      "Show Output",
    );

    if (selection === "Show Output") {
      Logger.show();
    }
  }
}
