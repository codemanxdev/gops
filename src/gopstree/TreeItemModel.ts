import * as vscode from "vscode";
import { NodeType } from "./nodes/NodeType";

export class TreeItemModel<T extends NodeType = NodeType> extends vscode.TreeItem {
  readonly type: T;

  constructor(
    public readonly label: vscode.TreeItemLabel,
    type: T,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command,
    public readonly children: TreeItemModel[] = [],
    public parent?: TreeItemModel,
    public contextValue?: string,
  ) {
    super(label, collapsibleState);
    this.type = type;
    this.command = command;
    this.contextValue = contextValue;
  }
}
