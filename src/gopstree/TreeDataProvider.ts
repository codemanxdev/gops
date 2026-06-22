import * as vscode from "vscode";
import { TreeItemModel } from "./TreeItemModel";
import { GitService } from "../services/GitService";
import { NodeType } from "./nodes/NodeType";
import { RepositoryNode } from "./nodes/RepositoryNode";
import { LocalBranchNode } from "./nodes/LocalBranchNode";
import { RemoteBranchNode } from "./nodes/RemoteBranchNode";
import { GitTreeNode } from "./types";
import { Notifications } from "../notifications/Notifications";
import { ChangedFileNode } from "./nodes/ChangedFileNode";
import { StagedFileNode } from "./nodes/StagedFileNode";
import { LocalBranchesSection } from "./nodes/LocalBranchesSection";
import { RemoteBranchesSection } from "./nodes/RemoteBranchesSection";
import { ChangesSection } from "./nodes/ChangesSection";
import { StagedChangesSection } from "./nodes/StagedChangesSection";
import { TagsSection } from "./nodes/TagsSection";
import { StashSection } from "./nodes/StashSection";
import { ContextValue } from "./ContextValue";
import { CONTEXT_KEYS } from "../constants/ContextKeys";
import { StashNode } from "./nodes/StashNode";

export class TreeDataProvider implements vscode.TreeDataProvider<GitTreeNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<
    GitTreeNode | undefined
  >();
  private _onDidChangeBadge = new vscode.EventEmitter<void>();

  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  readonly onDidChangeBadge = this._onDidChangeBadge.event;

  private _badge: vscode.ViewBadge | undefined;
  get badge(): vscode.ViewBadge | undefined {
    return this._badge;
  }

  private rootNode: RepositoryNode | undefined;
  private localBranchesNode: LocalBranchesSection | undefined;
  private remoteBranchesNode: RemoteBranchesSection | undefined;
  private changesNode: ChangesSection | undefined;
  private stagedNode: StagedChangesSection | undefined;
  private tagsNode: TagsSection | undefined;
  private stashNode: StashSection | undefined;

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
        return await this.getRepositoryChildren();
      case NodeType.Local:
        return await this.getLocalBranches(element);
      case NodeType.Remote:
        return await this.getRemoteBranches();
      case NodeType.Changes:
        return await this.getChanges();
      case NodeType.StagedChanges:
        return await this.getStagedChanges();
      case NodeType.Tags:
        return await this.getTags();
      case NodeType.Stash:
        return await this.getStash();
      default:
        return [];
    }
  }

  private async getLocalBranches(
    parent: TreeItemModel,
  ): Promise<TreeItemModel[]> {
    const branches = await this.gitService.getLocalBranches();
    const allLocalBranches = branches.map((b) => {
      const node = new LocalBranchNode(
        b.name,
        b.current,
        b.ahead,
        b.behind,
        b.hasUpstream,
      );
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
    const changedFiles = await this.gitService.getChangedFiles();
    const untrackedFiles = await this.gitService.getUntrackedFiles();
    const untrackedSet = new Set(untrackedFiles);

    return changedFiles.map((f) => {
      const node = new ChangedFileNode(f, untrackedSet.has(f));
      console.debug(node.toString());
      return node;
    });
  }

  private async getStagedChanges(): Promise<TreeItemModel[]> {
    const stagedFiles = await this.gitService.getStagedFiles();
    return stagedFiles.map((f) => {
      const node = new StagedFileNode(f);
      console.debug(node.toString());
      return node;
    });
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
    return stash.map((s) => {
      const node = new StashNode(s.ref, s.message);
      console.debug(node.toString());
      return node;
    });
  }

  private async getRepositoryChildren(): Promise<TreeItemModel[]> {
    const [stagedFiles, changedFiles] = await Promise.all([
      this.gitService.getStagedFiles(),
      this.gitService.getChangedFiles(),
    ]);

    const hasStagedFiles = stagedFiles.length > 0;
    const hasChangedFiles = changedFiles.length > 0;

    await Promise.all([
      this.setContext(CONTEXT_KEYS.HAS_STAGED_FILES, hasStagedFiles),
      this.setContext(CONTEXT_KEYS.HAS_CHANGED_FILES, hasChangedFiles),
    ]);

    this.updateBadge(changedFiles.length);

    const localBranchesItem = new LocalBranchesSection(
      this.localBranchesNode?.collapsibleState ||
        vscode.TreeItemCollapsibleState.Collapsed,
    );
    this.localBranchesNode = localBranchesItem;

    const remoteBranchesItem = new RemoteBranchesSection(
      this.remoteBranchesNode?.collapsibleState ||
        vscode.TreeItemCollapsibleState.Collapsed,
    );
    this.remoteBranchesNode = remoteBranchesItem;

    const changesItem = new ChangesSection(
      this.changesNode?.collapsibleState ||
        vscode.TreeItemCollapsibleState.Collapsed,
    );
    changesItem.contextValue = hasChangedFiles
      ? ContextValue.ChangesSection
      : ContextValue.ChangesSectionEmpty;
    this.changesNode = changesItem;

    const stagedItem = new StagedChangesSection(
      this.stagedNode?.collapsibleState ||
        vscode.TreeItemCollapsibleState.Collapsed,
    );
    stagedItem.contextValue = hasStagedFiles
      ? ContextValue.StagedChangesSection
      : ContextValue.StagedChangesSectionEmpty;
    this.stagedNode = stagedItem;

    const tagsItem = new TagsSection(
      this.tagsNode?.collapsibleState ||
        vscode.TreeItemCollapsibleState.Collapsed,
    );
    this.tagsNode = tagsItem;

    const stashItem = new StashSection(
      this.stashNode?.collapsibleState ||
        vscode.TreeItemCollapsibleState.Collapsed,
    );
    this.stashNode = stashItem;

    return [
      localBranchesItem,
      remoteBranchesItem,
      changesItem,
      stagedItem,
      tagsItem,
      stashItem,
    ];
  }

  private updateBadge(changedFilesCount: number): void {
    this._badge =
      changedFilesCount > 0
        ? {
            value: changedFilesCount,
            tooltip: `${changedFilesCount} changed file${changedFilesCount === 1 ? "" : "s"}`,
          }
        : undefined;
    this._onDidChangeBadge.fire();
  }

  private async setContext(key: string, value: boolean): Promise<void> {
    await vscode.commands.executeCommand("setContext", key, value);
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

  async refreshRemoteBranchesNode(): Promise<void> {
    if (!this.remoteBranchesNode) {
      return;
    }
    this._onDidChangeTreeData.fire(this.remoteBranchesNode);
  }

  async refreshChangesNode(): Promise<void> {
    if (!this.changesNode) {
      return;
    }
    const changedFiles = await this.gitService.getChangedFiles();
    const hasChangedFiles = changedFiles.length > 0;
    await this.setContext(CONTEXT_KEYS.HAS_CHANGED_FILES, hasChangedFiles);
    this.changesNode.contextValue = hasChangedFiles
      ? ContextValue.ChangesSection
      : ContextValue.ChangesSectionEmpty;
    this.updateBadge(changedFiles.length);
    this._onDidChangeTreeData.fire(this.changesNode);
  }

  async refreshStagedNode(): Promise<void> {
    if (!this.stagedNode) {
      return;
    }
    const stagedFiles = await this.gitService.getStagedFiles();
    const hasStagedFiles = stagedFiles.length > 0;
    await this.setContext(CONTEXT_KEYS.HAS_STAGED_FILES, hasStagedFiles);
    this.stagedNode.contextValue = hasStagedFiles
      ? ContextValue.StagedChangesSection
      : ContextValue.StagedChangesSectionEmpty;
    this._onDidChangeTreeData.fire(this.stagedNode);
  }
}
