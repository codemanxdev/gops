import { ContextValue } from "./ContextValue";
import { NodeType } from "./NodeType";
import { TreeItemModel } from "./TreeItemModel";
import * as vscode from 'vscode';

export class LocalBranchNode extends TreeItemModel {
  constructor(
    public readonly branchName: string,
    public readonly isCurrent: boolean,
    public readonly ahead?: number,
    public readonly behind?: number,
  ) {
    super(
      LocalBranchNode.formatLabel(branchName, isCurrent, ahead, behind),
      NodeType.Branch,
      vscode.TreeItemCollapsibleState.Expanded,
    );
    this.contextValue = ContextValue.LocalBranches;
    this.iconPath = new vscode.ThemeIcon("git-branch");
  }

  private static formatLabel(
    name: string,
    isCurrent: boolean,
    ahead?: number,
    behind?: number,
  ): string {
    let label = isCurrent ? `✓ ${name}` : name;

    if (ahead !== undefined || behind !== undefined) {
      const a = ahead ? `↑${ahead}` : "";
      const b = behind ? `↓${behind}` : "";
      label += ` ${a}${b}`;
    }

    return label;
  }
}
