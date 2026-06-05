import * as vscode from "vscode";
import { Logger } from "../logging/Logger";

export class Notifications {
  static info(
    message: string,
    modal: boolean = false,
  ): Thenable<string | undefined> {
    return vscode.window.showInformationMessage(message, { modal });
  }

  static success(
    message: string,
    modal: boolean = false,
  ): Thenable<string | undefined> {
    return vscode.window.showInformationMessage(`✓ ${message}`, { modal });
  }

  static warning(
    message: string,
    modal: boolean = false,
  ): Thenable<string | undefined> {
    return vscode.window.showWarningMessage(message, { modal });
  }

  static error(
    message: string,
    modal: boolean = false,
  ): Thenable<string | undefined> {
    return vscode.window.showErrorMessage(message, { modal });
  }

  static async errorWithOutput(
    message: string,
    modal: boolean = false,
  ): Promise<void> {
    const selection = await vscode.window.showErrorMessage(
      message,
      { modal },
      "Show Output",
    );

    if (selection === "Show Output") {
      Logger.show();
    }
  }

  static async choice(
    message: string,
    buttons: string[],
    modal: boolean = true,
  ): Promise<string | undefined> {
    return vscode.window.showWarningMessage(message, { modal }, ...buttons);
  }
}
