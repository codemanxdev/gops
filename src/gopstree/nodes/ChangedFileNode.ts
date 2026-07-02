import { ContextValue } from "../ContextValue";
import { NodeType } from "./NodeType";
import { TreeItemModel } from "../TreeItemModel";
import * as vscode from "vscode";
import {
  createChangedFileTooltip,
  createUntrackedFileTooltip,
  formatChangedFileLabel,
} from "./utils/nodeUtils";
import { COMMANDS } from "../../commands/Commands";

export class ChangedFileNode extends TreeItemModel<NodeType.Changes> {
  public override command?: vscode.Command;

  constructor(
    public readonly fileName: string,
    public readonly isUntracked: boolean = false,
  ) {
    const formatted = formatChangedFileLabel(fileName);
    super(
      {
        label: formatted.label,
        highlights: formatted.highlights,
      },
      NodeType.Changes,
      vscode.TreeItemCollapsibleState.None,
    );

    if (isUntracked) {
      this.contextValue = ContextValue.UntrackedFile;
      this.iconPath = new vscode.ThemeIcon("file-add");
      this.tooltip = createUntrackedFileTooltip(fileName);
    } else {
      this.contextValue = ContextValue.Changes;
      this.tooltip = createChangedFileTooltip(fileName);
    }

    this.command = {
      title: "Show Diff",
      command: COMMANDS.SHOW_DIFF,
      arguments: [this],
    };
    this.resourceUri = vscode.Uri.file(fileName);
  }

  public toString(): string {
    return `ChangedFileNode(${this.fileName}, contextValue=${this.contextValue}, isUntracked=${this.isUntracked})`;
  }
}
