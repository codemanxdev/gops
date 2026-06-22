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
    this.register(COMMANDS.CHECKOUT_REMOTE_BRANCH, (node) =>
      this.delegate.checkoutRemoteBranch(node),
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
    this.register(COMMANDS.UNSTAGE_FILE, (node) =>
      this.delegate.unstageFile(node),
    );
    this.register(COMMANDS.UNSTAGE_ALL_FILES, () =>
      this.delegate.unstageAllFiles(),
    );
    this.register(COMMANDS.STAGE_ALL_FILES, () =>
      this.delegate.stageAllFiles(),
    );
    this.register(COMMANDS.COMMIT, () => this.delegate.commit());
    this.register(COMMANDS.CREATE_TAG, () => this.delegate.createTag());
    this.register(COMMANDS.SHOW_GIT_GRAPH, (node) =>
      this.delegate.showGitGraph(node),
    );
    this.register(COMMANDS.PUBLISH_BRANCH, (node) =>
      this.delegate.publishBranch(node),
    );
    this.register(COMMANDS.FETCH, () => this.delegate.fetch());
    this.register(COMMANDS.POP_STASH, (node) => this.delegate.popStash(node));
    this.register(COMMANDS.STASH_CHANGES, () => this.delegate.stashChanges());
    this.register(COMMANDS.DISCARD_FILE, (node) =>
      this.delegate.discardFile(node),
    );
    this.register(COMMANDS.DISCARD_ALL_FILES, () =>
      this.delegate.discardAllFiles(),
    );
    this.register(COMMANDS.DELETE_UNTRACKED_FILE, (node) =>
      this.delegate.deleteUntrackedFile(node),
    );
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
