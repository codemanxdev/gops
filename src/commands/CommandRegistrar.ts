import * as vscode from "vscode";
import { COMMANDS } from "./Commands";
import { GitOperationsDelegate } from "./GitOperationsDelegate";
import { Logger } from "../logging/Logger";

export class CommandRegistrar {
  constructor(
    private context: vscode.ExtensionContext,
    private delegate: GitOperationsDelegate,
  ) {}

  registerAll() {
    this.register(COMMANDS.REFRESH, () => this.delegate.refresh());
    this.register(COMMANDS.CHECKOUT_BRANCH, (node) =>
      this.delegate.checkoutBranch(node),
    );
    this.register(COMMANDS.DELETE_BRANCH, (node) =>
      this.delegate.deleteBranch(node),
    );
    this.register(COMMANDS.RENAME_BRANCH, (node) =>
      this.delegate.renameBranch(node),
    );
    this.register(COMMANDS.PUSH, () => this.delegate.push());
    this.register(COMMANDS.PULL, () => this.delegate.pull());
    this.register(COMMANDS.CREATE_BRANCH_FROM_CURRENT, (node) =>
      this.delegate.createBranchFromCurrent(node),
    );
    this.register(COMMANDS.CREATE_BRANCH, (node) =>
      this.delegate.createBranchFrom(node),
    );
    this.register(COMMANDS.SHOW_DIFF, (node) => this.delegate.showDiff(node));
    this.register(COMMANDS.STAGE_FILE, (node) => this.delegate.stageFile(node));
  }

  private register(
    command: string,
    handler: (...args: any[]) => Promise<void> | void,
  ) {
    const disposable = vscode.commands.registerCommand(
      command,
      async (...args) => {
        try {
          await handler(...args);
        } catch (error) {
          Logger.error(
            `Error executing command ${command}: ${Logger.getErrorMessage(error)}`,
          );
        }
      },
    );
    this.context.subscriptions.push(disposable);
  }
}
