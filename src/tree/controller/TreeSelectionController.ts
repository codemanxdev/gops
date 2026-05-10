import * as vscode from "vscode";
import { MenuContextService } from "../context/MenuContexttService";
import { CONTEXTS } from "../context/Contexts";
import { GitTreeNode } from "../types";
import { NodeType } from "../nodes/NodeType";
import { LocalBranchNode } from "../nodes/LocalBranchNode";

export class TreeSelectionController {
  constructor(
    private treeView: vscode.TreeView<GitTreeNode>,
    private menuContext: MenuContextService,
  ) {}

  register() {
    return this.treeView.onDidChangeSelection((e) => {
      const node = e.selection[0];

      const isCurrent = this.isLocalBranchNode(node) && node.isCurrent === true;      

      if (node.type === NodeType.Local) {
        this.menuContext.set(
          CONTEXTS.IS_CURRENT_BRANCH,
          isCurrent,
        );
      }
    });
  }

  private isLocalBranchNode(node: GitTreeNode): node is LocalBranchNode {
    return node.type === NodeType.Local;
  }
}
