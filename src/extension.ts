import * as vscode from "vscode";
import { TreeDataProvider } from "./gopstree/TreeDataProvider";
import { GitService } from "./services/GitService";
import { CommandRegistrar } from "./commands/CommandRegistrar";
import { DiffService } from "./services/DiffService";
import { FileService } from "./services/FileService";

export function activate(context: vscode.ExtensionContext) {
  const gitService = new GitService();
  const fileService = new FileService(context.globalStorageUri.fsPath);
  const diffService = new DiffService(fileService, gitService);
  const treeDataProvider = new TreeDataProvider(gitService);
  const treeView = vscode.window.createTreeView("gitOpsTreeview", { treeDataProvider });
  
  // Register commands
  const registrar = new CommandRegistrar(
    context,
    treeDataProvider,
    gitService,
    diffService,
  );
  registrar.registerAll();

  context.subscriptions.push(treeView);
	console.log("Gops extension activated.");
}

export function deactivate() {}
