import * as vscode from "vscode";
import { TreeDataProvider } from "../tree/TreeDataProvider";
import { GitService } from "../services/GitService";
import { COMMANDS } from "./Commands";

export class CommandRegistrar {
  constructor(
    private context: vscode.ExtensionContext,
    private treeDataProvider: TreeDataProvider,
    private gitService: GitService,
  ) {}

  registerAll() {
    this.register(COMMANDS.REFRESH, () => {
      console.debug("executed command: gops.refresh");
      this.treeDataProvider.refresh();
    });

    this.register(COMMANDS.CHECKOUT_BRANCH, (node) => {
      console.debug("executed command: gops.checkout");
      this.gitService.checkout(node.branchName);
    });

    this.register(COMMANDS.DELETE_BRANCH, (node) => {
      console.debug("executed command: gops.deleteBranch");
      //this.gitService.deleteBranch(node);
    });

    this.register(COMMANDS.RENAME_BRANCH, (node) => {
      console.debug("executed command: gops.renameBranch");
      //this.gitService.renameBranch(node);
    });

    this.register(COMMANDS.PUSH, () => {
      console.debug("executed command: gops.push");
      this.gitService.push();
    });   
    
    this.register(COMMANDS.PULL, () => {
      console.debug("executed command: gops.pull");
      this.gitService.pull();
    });
    
    this.register(COMMANDS.CREATE_BRANCH, (node) => {
      console.debug("executed command: gops.branch");
      this.gitService.createBranch(node);
    });
  }

  private register(command: string, handler: (...args: any[]) => any) {
    const disposable = vscode.commands.registerCommand(command, handler);
    this.context.subscriptions.push(disposable);
  }
}
