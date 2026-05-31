import { ContextValue } from "../ContextValue";
import { NodeType } from "./NodeType";
import { TreeItemModel } from "../TreeItemModel";
import * as vscode from "vscode";
import {
  createLocalBranchTooltip,
  formatLocalBranchLabel,
} from "./utils/nodeUtils";
import { COMMANDS } from "../../commands/Commands";

export class LocalBranchNode extends TreeItemModel<NodeType.Local> {
  public override command?: vscode.Command;  
  constructor(
    public readonly branchName: string,
    public readonly isCurrent: boolean,
    public readonly ahead?: number,
    public readonly behind?: number,
  ) {
    const fomatted = formatLocalBranchLabel(
      branchName,
      isCurrent,
      ahead,
      behind,
    );
    super(
      {
        label: fomatted.label,
        highlights: fomatted.highlights,
      },
      NodeType.Local,
      vscode.TreeItemCollapsibleState.None,
    );
    this.contextValue = isCurrent
      ? ContextValue.LocalBranchesCurrent
      : ContextValue.LocalBranches;
    
    this.command = {
      command: COMMANDS.SHOW_GIT_GRAPH,
      title: "Open Git Graph",
      arguments: [this.branchName],
    };

    if (isCurrent) {
      this.iconPath = new vscode.ThemeIcon("check");
    }

    this.tooltip = createLocalBranchTooltip(
      branchName,
      isCurrent,
      ahead,
      behind,
    );
  }

  public toString(): string {
    return `LocalBranchNode(${this.branchName}, current=${this.isCurrent}, ahead=${this.ahead}, behind=${this.behind}, contextValue=${this.contextValue})`;
  }
}
