import * as vscode from "vscode";
import { TreeItemModel } from "../TreeItemModel";
import { NodeType } from "./NodeType";
import { ContextValue } from "../ContextValue";

export class RemoteBranchNode extends TreeItemModel<NodeType.Remote> {
  constructor(
    public readonly remoteName: string, // e.g. origin/main
    public readonly branchName: string, // e.g. main
    public readonly isTracking: boolean = false,
  ) {
    super(
      RemoteBranchNode.formatLabel(remoteName, branchName, isTracking),
      NodeType.Remote,
      vscode.TreeItemCollapsibleState.None,
    );

    this.contextValue = ContextValue.RemoteBranches;
    this.tooltip = RemoteBranchNode.createTooltip(
      remoteName,
      branchName,
      isTracking,
    );
  }

  private static formatLabel(
    remote: string,
    branch: string,
    isTracking: boolean,
  ): vscode.TreeItemLabel {
    const label = `${remote}/${branch}`;

    if (isTracking) {
      return {
        label,
        highlights: [[remote.length + 1, label.length]],
      };
    } else {
      return { label };
    }
  }

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
