import { ContextValue } from "../ContextValue";
import { NodeType } from "./NodeType";
import { TreeItemModel } from "../TreeItemModel";
import * as vscode from "vscode";
import { Constants } from "../../constants/Constants";

export class StagedChangesSection extends TreeItemModel<NodeType.StagedChanges> {
  constructor(collapsibleState: vscode.TreeItemCollapsibleState) {
    super(
      { label: Constants.STAGED_LABEL },
      NodeType.StagedChanges,
      collapsibleState,
    );
    this.contextValue = ContextValue.StagedChangesSectionEmpty;
    this.iconPath = new vscode.ThemeIcon("diff-added");
  }
}
