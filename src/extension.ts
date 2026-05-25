import * as vscode from "vscode";
import { CommandRegistrar } from "./commands/CommandRegistrar";
import { GitOperationsDelegate } from "./commands/GitOperationsDelegate";
import { GitService } from "./services/GitService";
import { FileService } from "./services/FileService";
import { DiffService } from "./services/DiffService";
import { TreeDataProvider } from "./gopstree/TreeDataProvider";

export function activate(context: vscode.ExtensionContext) {
  const gitService = new GitService();
  const fileService = new FileService(context.globalStorageUri.fsPath);
  const diffService = new DiffService(fileService, gitService);
  const treeDataProvider = new TreeDataProvider(gitService);
  const treeView = vscode.window.createTreeView("gitOpsTreeview", {
    treeDataProvider,
  });

  const delegate = new GitOperationsDelegate(
    gitService,
    diffService,
    treeDataProvider,
    treeView,
  );
  const registrar = new CommandRegistrar(context, delegate);
  registrar.registerAll();

  context.subscriptions.push(treeView);
  console.log("Gops extension activated.");
}
