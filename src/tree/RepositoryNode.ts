import { ContextValue } from "./ContextValue";
import { NodeType } from "./NodeType";
import { TreeItemModel } from "./TreeItemModel";
import * as vscode from 'vscode';

export class RepositoryNode extends TreeItemModel {
  constructor(
    public readonly repoName: string,
    public readonly branch: string,
  ) {
    super(`${repoName} (${branch})`, NodeType.Repository, vscode.TreeItemCollapsibleState.Expanded);
    this.contextValue = ContextValue.Repository;
    this.iconPath = new vscode.ThemeIcon("repo");
  }
}
