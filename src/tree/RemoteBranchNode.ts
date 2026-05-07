import * as vscode from "vscode";
import { TreeItemModel } from "./TreeItemModel";
import { NodeType } from "./NodeType";
import { ContextValue } from "./ContextValue";

export class RemoteBranchNode extends TreeItemModel {
  constructor(
    public readonly remoteName: string, // e.g. origin/main
    public readonly branchName: string, // e.g. main
    public readonly isTracking: boolean = false,
  ) {
    super(
      RemoteBranchNode.formatLabel(remoteName, branchName),
      NodeType.Branch,
      vscode.TreeItemCollapsibleState.None,
      undefined,
      [],
      ContextValue.RemoteBranches,
    );

    this.iconPath = new vscode.ThemeIcon("cloud");
    this.tooltip = RemoteBranchNode.createTooltip(
      remoteName,
      branchName,
      isTracking,
    );
  }

  // ----------------------------
  // Label formatting
  // ----------------------------
  private static formatLabel(remote: string, branch: string): string {
    return `${remote}/${branch}`;
  }

  // ----------------------------
  // Tooltip (hover info)
  // ----------------------------
  private static createTooltip(
    remote: string,
    branch: string,
    isTracking: boolean,
  ): string {
    return [
      `Remote: ${remote}`,
      `Branch: ${branch}`,
      isTracking ? "Tracking enabled" : "Not tracking",
    ].join("\n");
  }
}
