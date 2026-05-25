import { ContextValue } from "../ContextValue";
import { NodeType } from "./NodeType";
import { TreeItemModel } from "../TreeItemModel";
import * as vscode from 'vscode';

export class RepositoryNode extends TreeItemModel {
  declare label: vscode.TreeItemLabel;

  constructor(
    public readonly repoName: string,
    public readonly branch: string,
  ) {
    super(
      { label: `${repoName} (${branch})` },
      NodeType.Repository,
      vscode.TreeItemCollapsibleState.Expanded,
    );
    this.contextValue = ContextValue.Repository;
    this.iconPath = new vscode.ThemeIcon("repo");
  }

  updateActiveBranchLabel(branchLabel: string): void {
    this.label.label = `${this.repoName} (${branchLabel})`;
  }
}
