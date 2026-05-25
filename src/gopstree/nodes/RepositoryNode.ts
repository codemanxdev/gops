import { ContextValue } from "../ContextValue";
import { NodeType } from "./NodeType";
import { TreeItemModel } from "../TreeItemModel";
import * as vscode from "vscode";

export class RepositoryNode extends TreeItemModel {
  constructor(
    public readonly repoName: string,
    branch: string,
  ) {
    super(
      { label: `${repoName} (${branch})` },
      NodeType.Repository,
      vscode.TreeItemCollapsibleState.Expanded,
    );
    this.contextValue = ContextValue.Repository;
    this.iconPath = new vscode.ThemeIcon("repo");
  }

  updateActiveBranchLabel(branch: string): void {
    this.label = { label: `${this.repoName} (${branch})` };
  }
}
