import * as vscode from "vscode";
import { TreeDataProvider } from "../tree/TreeDataProvider";
import { GitService } from "../services/GitService";

export class CommandRegistrar {
  constructor(
    private context: vscode.ExtensionContext,
    private treeDataProvider: TreeDataProvider,
    private gitService: GitService,
  ) {}

  registerAll() {
    this.register("gops.refresh", () => {
      console.debug("executed command: gops.refresh");
      this.treeDataProvider.refresh();
    });

    this.register("gops.checkout", (node) => {
      console.debug("executed command: gops.checkout");
      this.gitService.checkout(node.branchName);
    });

    this.register("gops.deleteBranch", (node) => {
      console.debug("executed command: gops.deleteBranch");
      //this.gitService.deleteBranch(node);
    });

    this.register("gops.renameBranch", (node) => {
      console.debug("executed command: gops.renameBranch");
      //this.gitService.renameBranch(node);
    });

    this.register("gops.push", () => {
      console.debug("executed command: gops.push");
      this.gitService.push();
    });   
    
    this.register("gops.pull", () => {
      console.debug("executed command: gops.pull");
      this.gitService.pull();
    });
    
    this.register("gops.branch", (node) => {
      console.debug("executed command: gops.branch");
      this.gitService.createBranch(node);
    });
  }

  private register(command: string, handler: (...args: any[]) => any) {
    const disposable = vscode.commands.registerCommand(command, handler);
    this.context.subscriptions.push(disposable);
  }
}
