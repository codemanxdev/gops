import { ContextValue } from "../ContextValue";
import { NodeType } from "./NodeType";
import { TreeItemModel } from "../TreeItemModel";
import * as vscode from "vscode";
import {
  createChangedFileTooltip,
  formatChangedFileLabel,
} from "./utils/nodeUtils";
import { COMMANDS } from "../../commands/Commands";

export class ChangedFileNode extends TreeItemModel<NodeType.Changes> {
  public override command?: vscode.Command;
  constructor(public readonly fileName: string) {
    const fomatted = formatChangedFileLabel(fileName);
    super(
      {
        label: fomatted.label,
        highlights: fomatted.highlights,
      },
      NodeType.Changes,
      vscode.TreeItemCollapsibleState.None,
    );
    this.contextValue = ContextValue.Changes;
    this.command = {
      title: "Show Diff",
      command: COMMANDS.SHOW_DIFF,
      arguments: [this],
    };

    this.tooltip = createChangedFileTooltip(fileName);
  }

  public toString(): string {
    return `ChangedFileNode(${this.fileName}, contextValue=${this.contextValue})`;
  }
}
