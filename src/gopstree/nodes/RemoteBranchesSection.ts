import { ContextValue } from "../ContextValue";
import { NodeType } from "./NodeType";
import { TreeItemModel } from "../TreeItemModel";
import * as vscode from "vscode";
import { Constants } from "../../constants/Constants";

export class RemoteBranchesSection extends TreeItemModel<NodeType.Remote> {
  constructor(collapsibleState: vscode.TreeItemCollapsibleState) {
    super(
      { label: Constants.REMOTE_BRANCHES_LABEL },
      NodeType.Remote,
      collapsibleState,
    );
    this.contextValue = ContextValue.RemoteBranchesSection;
    this.iconPath = new vscode.ThemeIcon("cloud");
  }
}
