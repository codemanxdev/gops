import { ContextValue } from "../ContextValue";
import { NodeType } from "./NodeType";
import { TreeItemModel } from "../TreeItemModel";
import * as vscode from "vscode";
import { Constants } from "../../constants/Constants";

export class LocalBranchesSection extends TreeItemModel<NodeType.Local> {
  constructor(collapsibleState: vscode.TreeItemCollapsibleState) {
    super(
      { label: Constants.LOCAL_BRANCHES_LABEL },
      NodeType.Local,
      collapsibleState,
    );
    this.contextValue = ContextValue.LocalBranchesSection;
    this.iconPath = new vscode.ThemeIcon("go-to-file");
  }
}
