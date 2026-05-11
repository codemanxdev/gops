import * as vscode from "vscode";
import { TreeItemModel } from "./TreeItemModel";
import { GitService } from "../services/GitService";
import { NodeType } from "./nodes/NodeType";
import { RepositoryNode } from "./nodes/RepositoryNode";
import { LocalBranchNode } from "./nodes/LocalBranchNode";
import { RemoteBranchNode } from "./nodes/RemoteBranchNode";
import { Constants } from "../constants/Constants";
import { GitTreeNode } from "./types";
import { Notifications } from "../notifications/Notifications";

export class TreeDataProvider implements vscode.TreeDataProvider<GitTreeNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<
    GitTreeNode | undefined
  >();

  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private readonly gitService: GitService) {}

  getTreeItem(element: TreeItemModel): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: TreeItemModel): Promise<TreeItemModel[]> {
    //Root level: show repository
    if (!element) {
      const repoName = await this.gitService.getRepoName();
      const currentBranch = await this.gitService.getCurrentBranch();
      return [new RepositoryNode(repoName, currentBranch)];
    }

    //Routing based on node type
    switch (element.type) {
      case NodeType.Repository:
        return this.getRepositoryChildren();
      case NodeType.Local:
        return this.getLocalBranches(element);
      case NodeType.Remote:
        return this.getRemoteBranches();
      default:
        return [];
    }
  }

  private async getLocalBranches(parent: TreeItemModel): Promise<TreeItemModel[]> {
    const branches = await this.gitService.getLocalBranches();
    const allLocalBranches = branches.map(
      (b) => {
        const node = new LocalBranchNode(b.name, b.current, b.ahead, b.behind);
        node.parent = parent;
        return node;
      }
    );
    for (const branch of allLocalBranches) {
      console.debug(branch.toString());
    }
    return allLocalBranches;
  }

  private async getRemoteBranches(): Promise<TreeItemModel[]> {
    const remoteBranches = await this.gitService.getRemoteBranches("origin");
    return remoteBranches.map(
      (b) => new RemoteBranchNode(b.remote, b.name, false),
    );
  }

  private getRepositoryChildren(): TreeItemModel[] {
    const localBranchesItem = new TreeItemModel(
      { label: Constants.LOCAL_BRANCHES_LABEL },
      NodeType.Local,
      vscode.TreeItemCollapsibleState.Collapsed,
    );
    localBranchesItem.iconPath = new vscode.ThemeIcon("go-to-file");

    const remoteBranchesItem = new TreeItemModel(
      { label: Constants.REMOTE_BRANCHES_LABEL },
      NodeType.Remote,
      vscode.TreeItemCollapsibleState.Collapsed,
    );
    remoteBranchesItem.iconPath = new vscode.ThemeIcon("cloud");

    const changesItem = new TreeItemModel(
      { label: Constants.CHANGES_LABEL },
      NodeType.Section,
      vscode.TreeItemCollapsibleState.Collapsed,
    );
    changesItem.iconPath = new vscode.ThemeIcon("diff");

    const tagsItem = new TreeItemModel(
      { label: Constants.TAGS_LABEL },
      NodeType.Section,
      vscode.TreeItemCollapsibleState.Collapsed,
    );
    tagsItem.iconPath = new vscode.ThemeIcon("tag");

    return [localBranchesItem, remoteBranchesItem, changesItem, tagsItem];
  }

  refresh(node?: GitTreeNode): void {
    this._onDidChangeTreeData.fire(node);

    //Show notification for parent node refresh
    if (node === undefined) {
      Notifications.info("Git Ops tree view refreshed");
    }
  }
}
