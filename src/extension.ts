import * as vscode from "vscode";
import { TreeDataProvider } from "./tree/TreeDataProvider";
import { GitService } from "./services/GitService";
import { CommandRegistrar } from "./commands/CommandRegistrar";
import { TreeSelectionController } from "./tree/controller/TreeSelectionController";
import { MenuContextService } from "./tree/context/MenuContexttService";

export function activate(context: vscode.ExtensionContext) {
  const gitService = new GitService();
  const treeDataProvider = new TreeDataProvider(gitService);
  const treeView = vscode.window.createTreeView("gitOpsTreeview", {
    treeDataProvider,
  });

  // Register commands
  const registrar = new CommandRegistrar(
    context,
    treeDataProvider,
    gitService,
  );
  registrar.registerAll();
  
  // Register tree selection controller
    const menuContext = new MenuContextService();
  const selectionController = new TreeSelectionController(treeView, menuContext);
  context.subscriptions.push(selectionController.register());  


	console.log("Gops extension activated.");
}

export function deactivate() {}
