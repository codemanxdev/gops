import * as vscode from "vscode";
import { NodeType } from "./NodeType";

export class TreeItemModel extends vscode.TreeItem {
  constructor(
    public readonly label: vscode.TreeItemLabel,
    public readonly type: NodeType,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command,
    public readonly children: TreeItemModel[] = [],
    public contextValue?: string,
  ) {
    super(label, collapsibleState);

    this.command = command;
    this.contextValue = contextValue;
  }
}
