import { ContextValue } from "../ContextValue";
import { NodeType } from "./NodeType";
import { TreeItemModel } from "../TreeItemModel";
import * as vscode from "vscode";
import { Constants } from "../../constants/Constants";

export class ChangesSection extends TreeItemModel<NodeType.Changes> {
  constructor(collapsibleState: vscode.TreeItemCollapsibleState) {
    super(
      { label: Constants.CHANGES_LABEL },
      NodeType.Changes,
      collapsibleState,
    );
    this.contextValue = ContextValue.ChangesSection;
    this.iconPath = new vscode.ThemeIcon("diff");
  }
}
