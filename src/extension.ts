import * as vscode from "vscode";
import { CommandRegistrar } from "./commands/CommandRegistrar";
import { GitOperationsDelegate } from "./commands/GitOperationsDelegate";
import { GitService } from "./services/GitService";
import { FileService } from "./services/FileService";
import { DiffService } from "./services/DiffService";
import { TreeDataProvider } from "./gopstree/TreeDataProvider";
import { Notifications } from "./notifications/Notifications";

export async function activate(context: vscode.ExtensionContext) {
  const gitService = new GitService();

  // Check git availability
  const isGitAvailable = await GitService.isGitAvailable();
  if (!isGitAvailable) {
    Notifications.error(
      "Gops requires Git to be installed and available in PATH. Please install Git and restart VS Code.",
      true,
    );
    return;
  }

  const fileService = new FileService(context.globalStorageUri.fsPath);
  const diffService = new DiffService(fileService, gitService);
  const treeDataProvider = new TreeDataProvider(gitService);
  const treeView = vscode.window.createTreeView("gitOpsTreeview", {
    treeDataProvider,
    showCollapseAll: true,
  });

  treeView.badge = treeDataProvider.badge;
  treeDataProvider.onDidChangeBadge(() => {
    treeView.badge = treeDataProvider.badge;
  });

  const delegate = new GitOperationsDelegate(
    gitService,
    diffService,
    treeDataProvider,
    treeView,
  );
  const registrar = new CommandRegistrar(context, delegate);
  registrar.registerAll();

  const onSave = vscode.workspace.onDidSaveTextDocument(() => {
    treeDataProvider.refreshChangesNode();
    treeDataProvider.refreshStagedNode();
  });

  const gitWatcher = vscode.workspace.createFileSystemWatcher("**/.git/index");
  gitWatcher.onDidChange(() => {
    treeDataProvider.refreshChangesNode();
    treeDataProvider.refreshStagedNode();
  });

  context.subscriptions.push(treeView, onSave, gitWatcher);
  console.log("Gops extension activated.");
}
