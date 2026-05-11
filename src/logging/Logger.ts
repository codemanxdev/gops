import * as vscode from "vscode";
import { Constants } from "../constants/Constants";

export class Logger {
  private static channel = vscode.window.createOutputChannel(
    Constants.LOGGER_CHANNEL,
  );

  static info(message: string): void {
    this.channel.appendLine(`[INFO] ${message}`);
  }

  static warn(message: string): void {
    this.channel.appendLine(`[WARN] ${message}`);
  }

  static error(message: string): void {
    this.channel.appendLine(`[ERROR] ${message}`);
  }

  static debug(message: string): void {
    this.channel.appendLine(`[DEBUG] ${message}`);
  }

  static show(): void {
    this.channel.show();
  }

  static dispose(): void {
    this.channel.dispose();
  }

  static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    return "An unknown error occurred.";
  }
}
