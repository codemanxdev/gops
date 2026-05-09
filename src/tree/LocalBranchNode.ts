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
      vscode.TreeItemCollapsibleState.None,
    );
    this.contextValue = ContextValue.LocalBranches.toString();

    if (isCurrent) {
      this.iconPath = new vscode.ThemeIcon("check");
    }
    
    this.tooltip = LocalBranchNode.createTooltip(
      branchName,
      isCurrent,
      ahead,
      behind,
    );
  }

  private static formatLabel(
    name: string,
    isCurrent: boolean,
    ahead?: number,
    behind?: number,
  ): vscode.TreeItemLabel {
    let label = name;

    if (ahead !== undefined || behind !== undefined) {
      const a = ahead ? ` ↑${ahead}` : "";
      const b = behind ? ` ↓${behind}` : "";

      label += `${a}${b}`;
    }

    if (isCurrent) {
      // Highlight the entire branch name (from start to the end of the branch name)
      return {
        label,
        highlights: [[0, name.length]],
      };
    } else {
      return {
        label,
        highlights: [],
      };
    }
  }

  private static createTooltip(
    branch: string,
    isCurrent: boolean,
    ahead?: number,
    behind?: number,
  ): string {
    return [
      `Branch: ${branch}`,
      isCurrent ? "Current branch" : "Not current",
      ahead !== undefined ? `Ahead by ${ahead} commits` : "",
      behind !== undefined ? `Behind by ${behind} commits` : "",
    ].join("\n");
  }

  public toString(): string {
    return `LocalBranchNode(${this.branchName}, current=${this.isCurrent}, ahead=${this.ahead}, behind=${this.behind}, contextValue=${this.contextValue})`;
  }
}