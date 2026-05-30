import { ContextValue } from "../ContextValue";
import { NodeType } from "./NodeType";
import { TreeItemModel } from "../TreeItemModel";
import * as vscode from "vscode";
import { Constants } from "../../constants/Constants";

export class StashSection extends TreeItemModel<NodeType.Stash> {
  constructor(collapsibleState: vscode.TreeItemCollapsibleState) {
    super({ label: Constants.STASH_LABEL }, NodeType.Stash, collapsibleState);
    this.contextValue = ContextValue.StashSection;
    this.iconPath = new vscode.ThemeIcon("save");
  }
}
