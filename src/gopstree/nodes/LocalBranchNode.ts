import { ContextValue } from "../ContextValue";
import { NodeType } from "./NodeType";
import { TreeItemModel } from "../TreeItemModel";
import * as vscode from 'vscode';
import { formatLocalBranchLabel } from "./utils/nodeUtils";

export class LocalBranchNode extends TreeItemModel<NodeType.Local> {
  constructor(
    public readonly branchName: string,
    public readonly isCurrent: boolean,
    public readonly ahead?: number,
    public readonly behind?: number,
  ) {
    const fomatted = formatLocalBranchLabel(branchName, isCurrent, ahead, behind);
    super(
      {
        label: fomatted.label,
        highlights: fomatted.highlights,
      },
      NodeType.Local,
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