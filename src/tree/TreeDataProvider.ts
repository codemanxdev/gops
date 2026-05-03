import * as vscode from "vscode";
import { TreeItemModel } from "./TreeItemModel";
import { GitService } from "../services/GitService";

export class TreeDataProvider implements vscode.TreeDataProvider<TreeItemModel> {
  constructor(private gitService: GitService) {}

  getTreeItem(element: TreeItemModel): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: TreeItemModel): Promise<TreeItemModel[]> {
    if (!element) {
      return [
        new TreeItemModel(
          "Branches",
          vscode.TreeItemCollapsibleState.Collapsed,
          "branches",
        ),
        new TreeItemModel(
          "Changes",
          vscode.TreeItemCollapsibleState.Collapsed,
          "changes",
        ),
      ];
    }

    // 🌿 Branches
    if (element.contextValue === "branches") {
      const branches = await this.gitService.getBranches();

      return branches.all.map((branch) => {
        const isCurrent = branch === branches.current;

        return new TreeItemModel(
          isCurrent ? `$(check) ${branch}` : branch,
          vscode.TreeItemCollapsibleState.None,
          "branch",
          {
            command: "gitTools.checkout",
            title: "Checkout",
            arguments: [branch],
          },
        );
      });
    }

    // 📁 Changes
    if (element.contextValue === "changes") {
      return [
        new TreeItemModel(
          "Staged",
          vscode.TreeItemCollapsibleState.Collapsed,
          "staged",
        ),
        new TreeItemModel(
          "Unstaged",
          vscode.TreeItemCollapsibleState.Collapsed,
          "unstaged",
        ),
        new TreeItemModel(
          "Untracked",
          vscode.TreeItemCollapsibleState.Collapsed,
          "untracked",
        ),
      ];
    }

    // 📦 Staged Files
    if (element.contextValue === "staged") {
      const status = await this.gitService.getStatus();

      return status.staged.map(
        (file) =>
          new TreeItemModel(file, vscode.TreeItemCollapsibleState.None, "file"),
      );
    }

    // 📦 Unstaged Files
    if (element.contextValue === "unstaged") {
      const status = await this.gitService.getStatus();

      return status.modified.map(
        (file) =>
          new TreeItemModel(file, vscode.TreeItemCollapsibleState.None, "file"),
      );
    }

    // 📦 Untracked Files
    if (element.contextValue === "untracked") {
      const status = await this.gitService.getStatus();

      return status.not_added.map(
        (file) =>
          new TreeItemModel(file, vscode.TreeItemCollapsibleState.None, "file"),
      );
    }

    return [];
  }
}

