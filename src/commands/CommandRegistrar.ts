import * as vscode from "vscode";
import { TreeDataProvider } from "../gopstree/TreeDataProvider";
import { GitService } from "../services/GitService";
import { COMMANDS } from "./Commands";
import { GitTreeNode } from "../gopstree/types";

export class CommandRegistrar {
  constructor(
    private context: vscode.ExtensionContext,
    private treeDataProvider: TreeDataProvider,
    private gitService: GitService,
  ) {}

  registerAll() {
    this.register(COMMANDS.REFRESH, () => {
      console.debug("executed command: ${COMMANDS.REFRESH}");
      this.treeDataProvider.refresh();
    });

    this.register(COMMANDS.CHECKOUT_BRANCH, (node: GitTreeNode) => {
      console.debug("executed command: ${COMMANDS.CHECKOUT_BRANCH}");
      if (node && "branchName" in node) {
        this.gitService.checkout(node.branchName);
        this.treeDataProvider.refresh(node.parent);
      }
    });

    this.register(COMMANDS.DELETE_BRANCH, (node) => {
      console.debug("executed command: ${COMMANDS.DELETE_BRANCH}");
      //this.gitService.deleteBranch(node);
    });

    this.register(COMMANDS.RENAME_BRANCH, (node) => {
      console.debug("executed command: ${COMMANDS.RENAME_BRANCH}");
      //this.gitService.renameBranch(node);
    });

    this.register(COMMANDS.PUSH, () => {
      console.debug("executed command: ${COMMANDS.PUSH}");
      this.gitService.push();
    });

    this.register(COMMANDS.PULL, () => {
      console.debug("executed command: ${COMMANDS.PULL}");
      this.gitService.pull();
    });

    this.register(COMMANDS.CREATE_BRANCH, (node) => {
      console.debug("executed command: ${COMMANDS.CREATE_BRANCH}");
      this.gitService.createBranch(node);
    });
  }

  private register(command: string, handler: (...args: any[]) => any) {
    const disposable = vscode.commands.registerCommand(command, handler);
    this.context.subscriptions.push(disposable);
  }
}
