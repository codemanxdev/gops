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
import { ChangedFileNode } from "./nodes/ChangedFileNode";

export class TreeDataProvider implements vscode.TreeDataProvider<GitTreeNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<
    GitTreeNode | undefined
  >();

  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private rootNode: RepositoryNode | undefined;
  private localBranchesNode: TreeItemModel | undefined;
  private remoteBranchesNode: TreeItemModel | undefined;
  private changesNode: TreeItemModel | undefined;
  private tagsNode: TreeItemModel | undefined;
  private stashNode: TreeItemModel | undefined;

  constructor(private readonly gitService: GitService) {}

  getTreeItem(element: TreeItemModel): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: TreeItemModel): Promise<TreeItemModel[]> {
    //Root level: show repository
    if (!element) {
      const repoName = this.gitService.getRepoName();
      const currentBranch = await this.gitService.getCurrentBranch();
      this.rootNode = new RepositoryNode(repoName, currentBranch);
      return [this.rootNode];
    }

    //Routing based on node type
    switch (element.type) {
      case NodeType.Repository:
        return this.getRepositoryChildren();
      case NodeType.Local:
        return this.getLocalBranches(element);
      case NodeType.Remote:
        return this.getRemoteBranches();
      case NodeType.Changes:
        return this.getChanges();
      case NodeType.Tags:
        return this.getTags();
      case NodeType.Stash:
        return this.getStash();
      default:
        return [];
    }
  }

  private async getLocalBranches(
    parent: TreeItemModel,
  ): Promise<TreeItemModel[]> {
    const branches = await this.gitService.getLocalBranches();
    const allLocalBranches = branches.map((b) => {
      const node = new LocalBranchNode(b.name, b.current, b.ahead, b.behind);
      node.parent = parent;
      return node;
    });
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

  private async getChanges(): Promise<TreeItemModel[]> {
    const status = await this.gitService.getStatus();
    const changedFiles = [
      ...status.modified,
      ...status.not_added,
      ...status.created,
      ...status.deleted,
      ...status.renamed.map((f) => f.to),
    ];

    const allChangedFiles = changedFiles.map((f) => {
      const node = new ChangedFileNode(f);
      console.debug(node.toString());
      return node;
    });

    return allChangedFiles;
  }

  private async getTags(): Promise<TreeItemModel[]> {
    const tags = await this.gitService.getTags();
    return tags.map(
      (t) =>
        new TreeItemModel(
          { label: t },
          NodeType.Tags,
          vscode.TreeItemCollapsibleState.None,
        ),
    );
  }

  private async getStash(): Promise<TreeItemModel[]> {
    const stash = await this.gitService.getStash();
    return stash.map(
      (s) =>
        new TreeItemModel(
          { label: s },
          NodeType.Stash,
          vscode.TreeItemCollapsibleState.None,
        ),
    );
  }

  private getRepositoryChildren(): TreeItemModel[] {
    const localBranchesItem = new TreeItemModel(
      { label: Constants.LOCAL_BRANCHES_LABEL },
      NodeType.Local,
      this.localBranchesNode?.collapsibleState ||
        vscode.TreeItemCollapsibleState.Collapsed,
    );
    localBranchesItem.iconPath = new vscode.ThemeIcon("go-to-file");
    this.localBranchesNode = localBranchesItem;

    const remoteBranchesItem = new TreeItemModel(
      { label: Constants.REMOTE_BRANCHES_LABEL },
      NodeType.Remote,
      this.remoteBranchesNode?.collapsibleState ||
        vscode.TreeItemCollapsibleState.Collapsed,
    );
    remoteBranchesItem.iconPath = new vscode.ThemeIcon("cloud");
    this.remoteBranchesNode = remoteBranchesItem;

    const changesItem = new TreeItemModel(
      { label: Constants.CHANGES_LABEL },
      NodeType.Changes,
      this.changesNode?.collapsibleState ||
        vscode.TreeItemCollapsibleState.Collapsed,
    );
    changesItem.iconPath = new vscode.ThemeIcon("diff");
    this.changesNode = changesItem;

    const tagsItem = new TreeItemModel(
      { label: Constants.TAGS_LABEL },
      NodeType.Tags,
      this.tagsNode?.collapsibleState ||
        vscode.TreeItemCollapsibleState.Collapsed,
    );
    tagsItem.iconPath = new vscode.ThemeIcon("tag");
    this.tagsNode = tagsItem;

    const stashItem = new TreeItemModel(
      { label: Constants.STASH_LABEL },
      NodeType.Stash,
      this.stashNode?.collapsibleState ||
        vscode.TreeItemCollapsibleState.Collapsed,
    );
    stashItem.iconPath = new vscode.ThemeIcon("save");
    this.stashNode = stashItem;

    return [
      localBranchesItem,
      remoteBranchesItem,
      changesItem,
      tagsItem,
      stashItem,
    ];
  }

  refresh(node?: GitTreeNode): void {
    this._onDidChangeTreeData.fire(node);

    //Show notification for parent node refresh
    if (node === undefined) {
      Notifications.info("Git Ops tree view refreshed");
    }
  }

  async refreshRootNode(): Promise<void> {
    if (!this.rootNode) {
      return;
    }

    const currentBranch = await this.gitService.getCurrentBranch();
    this.rootNode.updateActiveBranchLabel(currentBranch);
    this._onDidChangeTreeData.fire(this.rootNode);
  }

  async refreshLocalBranchesNode(): Promise<void> {
    if (!this.localBranchesNode) {
      return;
    }
    this.localBranchesNode.collapsibleState =
      vscode.TreeItemCollapsibleState.Expanded;
    this._onDidChangeTreeData.fire(this.localBranchesNode);
  }

  refreshRemoteBranchesNode(): void {
    if (!this.remoteBranchesNode) {
      return;
    }
    this._onDidChangeTreeData.fire(this.remoteBranchesNode);
  }

  refreshChangesNode(): void {
    if (!this.changesNode) {
      return;
    }
    this._onDidChangeTreeData.fire(this.changesNode);
  }
}
