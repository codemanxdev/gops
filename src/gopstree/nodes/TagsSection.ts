import { ContextValue } from "../ContextValue";
import { NodeType } from "./NodeType";
import { TreeItemModel } from "../TreeItemModel";
import * as vscode from "vscode";
import { Constants } from "../../constants/Constants";

export class TagsSection extends TreeItemModel<NodeType.Tags> {
  constructor(collapsibleState: vscode.TreeItemCollapsibleState) {
    super({ label: Constants.TAGS_LABEL }, NodeType.Tags, collapsibleState);
    this.contextValue = ContextValue.TagsSection;
    this.iconPath = new vscode.ThemeIcon("tag");
  }
}
