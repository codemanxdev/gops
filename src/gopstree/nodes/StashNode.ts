import { ContextValue } from "../ContextValue";
import { NodeType } from "./NodeType";
import { TreeItemModel } from "../TreeItemModel";
import * as vscode from "vscode";

export class StashNode extends TreeItemModel<NodeType.Stash> {
  constructor(
    public readonly stashRef: string,
    public readonly stashMessage: string,
  ) {
    super(
      { label: stashMessage },
      NodeType.Stash,
      vscode.TreeItemCollapsibleState.None,
    );
    this.contextValue = ContextValue.Stash;
    this.iconPath = new vscode.ThemeIcon("save");
  }

  public toString(): string {
    return `StashNode(${this.stashRef}, ${this.stashMessage})`;
  }
}
