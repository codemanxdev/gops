import * as vscode from "vscode";
import { TreeItemModel } from "./TreeItemModel";
import { GitService } from "../services/GitService";
import { NodeType } from "./NodeType";
import { RepositoryNode } from "./RepositoryNode";
import { LocalBranchNode } from "./LocalBranchNode";
import { RemoteBranchNode } from "./RemoteBranchNode";

export class TreeDataProvider implements vscode.TreeDataProvider<TreeItemModel> {
  private _onDidChangeTreeData = new vscode.EventEmitter<
    TreeItemModel | undefined
  >();

  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  // private remoteBranchesNode: TreeItemModel;
  // private changesNode: TreeItemModel;
  // private tagsNode: TreeItemModel;

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
        return this.getLocalBranches();
      case NodeType.Remote:
        return this.getRemoteBranches();
      default:
        return [];
    }
  }

  private async getLocalBranches(): Promise<TreeItemModel[]> {
    const branches = await this.gitService.getLocalBranches();

    return branches.map(
      (b) => new LocalBranchNode(b.name, b.current, 0, 0),
    );
  }

  private async getRemoteBranches(): Promise<TreeItemModel[]> {
    const remoteBranches = await this.gitService.getRemoteBranches("origin");
    return remoteBranches.map((b) => new RemoteBranchNode(b.remote, b.name, false)) ;
  }

  private getRepositoryChildren(): TreeItemModel[] {
    return [
      new TreeItemModel(
        "Local Branches",
        NodeType.Local,
        vscode.TreeItemCollapsibleState.Collapsed,
      ),
      new TreeItemModel(
        "Remote Branches",
        NodeType.Remote,
        vscode.TreeItemCollapsibleState.Collapsed,
      ),

      new TreeItemModel(
        "Changes",
        NodeType.Section,
        vscode.TreeItemCollapsibleState.Collapsed,
      ),

      new TreeItemModel(
        "Tags",
        NodeType.Section,
        vscode.TreeItemCollapsibleState.Collapsed,
      ),
    ];
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }
}
