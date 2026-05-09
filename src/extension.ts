import * as vscode from "vscode";
import { TreeDataProvider } from "./tree/TreeDataProvider";
import { GitService } from "./services/GitService";
import { CommandRegistrar } from "./commands/CommandRegistrar";

export function activate(context: vscode.ExtensionContext) {
  const gitService = new GitService();
  const treeDataProvider = new TreeDataProvider(gitService);
  vscode.window.registerTreeDataProvider("gitOpsTreeview", treeDataProvider);
	const registrar = new CommandRegistrar(context, treeDataProvider, gitService);
  registrar.registerAll();
	console.log("Gops extension activated.");
}

export function deactivate() {}
