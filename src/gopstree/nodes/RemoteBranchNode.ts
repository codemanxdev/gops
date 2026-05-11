import * as vscode from "vscode";
import { TreeItemModel } from "../TreeItemModel";
import { NodeType } from "./NodeType";
import { ContextValue } from "../ContextValue";
import { createRemoteBranchTooltip, formatRemoteBranchLabel } from "./utils/nodeUtils";

export class RemoteBranchNode extends TreeItemModel<NodeType.Remote> {
  constructor(
    public readonly remoteName: string, // e.g. origin/main
    public readonly branchName: string, // e.g. main
    public readonly isTracking: boolean = false,
  ) {
    super(
      formatRemoteBranchLabel(remoteName, branchName, isTracking),
      NodeType.Remote,
      vscode.TreeItemCollapsibleState.None,
    );

    this.contextValue = ContextValue.RemoteBranches;
    this.tooltip = createRemoteBranchTooltip(
      remoteName,
      branchName,
      isTracking,
    );
  }
}
