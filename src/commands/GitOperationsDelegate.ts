import * as vscode from "vscode";
import { GitService } from "../services/GitService";
import { DiffService } from "../services/DiffService";
import { TreeDataProvider } from "../gopstree/TreeDataProvider";
import { GitTreeNode } from "../gopstree/types";
import { ChangedFileNode } from "../gopstree/nodes/ChangedFileNode";
import { StagedFileNode } from "../gopstree/nodes/StagedFileNode";
import { GitGraphPanel } from "../gopswebpanel/GitGraphPanel";

export class GitOperationsDelegate {
  constructor(
    private readonly gitService: GitService,
    private readonly diffService: DiffService,
    private readonly treeDataProvider: TreeDataProvider,
    private readonly treeView: vscode.TreeView<GitTreeNode>,
  ) {}

  refresh(): void {
    this.treeDataProvider.refresh();
  }

  async checkoutBranch(node: GitTreeNode): Promise<void> {
    if (!node || !("branchName" in node)) {
      return;
    }

    await this.gitService.checkout(node.branchName);
    await this.treeDataProvider.refreshRootNode();
    this.treeDataProvider.refreshLocalBranchesNode();
  }

  async deleteBranch(node: GitTreeNode): Promise<void> {
    if (!node || !("branchName" in node)) {
      return;
    }

    const confirm = await vscode.window.showWarningMessage(
      `Are you sure you want to delete branch "${node.branchName}"?`,
      { modal: true },
      "Delete",
    );

    if (confirm !== "Delete") {
      return;
    }

    await this.gitService.deleteBranch(node.branchName);
    await this.treeDataProvider.refreshLocalBranchesNode();
  }

  async renameBranch(node: GitTreeNode): Promise<void> {
    if (!node || !("branchName" in node)) {
      return;
    }

    const newName = await vscode.window.showInputBox({
      prompt: `Enter new name for branch "${node.branchName}"`,
      placeHolder: "feature/my-new-name",
      value: node.branchName,
      ignoreFocusOut: true,
    });

    if (!newName || newName === node.branchName) {
      return;
    }

    await this.gitService.renameBranch(node.branchName, newName);
    await this.treeDataProvider.refreshLocalBranchesNode();
  }

  async push(): Promise<void> {
    await this.gitService.push();
  }

  async pull(): Promise<void> {
    await this.gitService.pull();
    await this.treeDataProvider.refreshRootNode();
    this.treeDataProvider.refreshLocalBranchesNode();
    this.treeDataProvider.refreshRemoteBranchesNode();
  }

  async createBranchFromCurrent(node: GitTreeNode): Promise<void> {
    const branchName = await vscode.window.showInputBox({
      prompt: "Enter new branch name",
      placeHolder: "feature/my-new-feature",
      ignoreFocusOut: true,
    });
    if (!branchName) {
      return;
    }

    await this.gitService.checkoutLocalBranch(branchName);
    this.treeDataProvider.refreshLocalBranchesNode();
  }

  async createBranchFrom(node: GitTreeNode): Promise<void> {
    if (!node || !("branchName" in node)) {
      return;
    }

    const branchName = await vscode.window.showInputBox({
      prompt: `Enter new branch name to create from ${node.branchName}`,
      placeHolder: "feature/my-new-feature",
      ignoreFocusOut: true,
    });
    if (!branchName) {
      return;
    }

    await this.gitService.checkoutBranch(branchName, node.branchName);
    this.treeDataProvider.refreshLocalBranchesNode();
  }

  async showDiff(node: GitTreeNode): Promise<void> {
    if (
      !node ||
      (!(node instanceof ChangedFileNode) &&
        !(node instanceof StagedFileNode)) ||
      !node.fileName
    ) {
      return;
    }

    const repoPath = this.gitService.getRepoPath();
    await this.diffService.openDiff({
      left: { repositoryPath: repoPath, fileName: node.fileName, ref: "HEAD" },
      right: { repositoryPath: repoPath, fileName: node.fileName },
      title: `Diff: ${node.fileName}`,
    });
  }

  async stageFile(node: GitTreeNode): Promise<void> {
    if (!node || !(node instanceof ChangedFileNode) || !node.fileName) {
      return;
    }

    await this.gitService.stageFile(node.fileName);
    await this.treeDataProvider.refreshChangesNode();
    await this.treeDataProvider.refreshStagedNode();
  }

  async unstageFile(node: GitTreeNode): Promise<void> {
    if (!node || !(node instanceof StagedFileNode) || !node.fileName) {
      return;
    }

    await this.gitService.unstageFile(node.fileName);
    await this.treeDataProvider.refreshChangesNode();
    await this.treeDataProvider.refreshStagedNode();
  }

  async unstageAllFiles(): Promise<void> {
    await this.gitService.unstageAllFiles();
    await this.treeDataProvider.refreshChangesNode();
    await this.treeDataProvider.refreshStagedNode();
  }

  async stageAllFiles(): Promise<void> {
    await this.gitService.stageAllFiles();
    await this.treeDataProvider.refreshChangesNode();
    await this.treeDataProvider.refreshStagedNode();
  }

  async commit(): Promise<void> {
    const message = await vscode.window.showInputBox({
      prompt: "Enter commit message",
      placeHolder: "feat: my changes",
      ignoreFocusOut: true,
    });
    if (!message) {
      return;
    }

    await this.gitService.commit(message);
    this.treeDataProvider.refreshChangesNode();
    await this.treeDataProvider.refreshStagedNode();
  }

  async createTag(): Promise<void> {
    // TODO: implement
  }

  async showGitGraph(branchName: string): Promise<void> {
    await GitGraphPanel.createOrShow(branchName, this.gitService);
  }
}
