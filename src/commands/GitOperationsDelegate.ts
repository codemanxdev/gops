import * as vscode from "vscode";
import { GitService } from "../services/GitService";
import { DiffService } from "../services/DiffService";
import { TreeDataProvider } from "../gopstree/TreeDataProvider";
import { GitTreeNode } from "../gopstree/types";
import { ChangedFileNode } from "../gopstree/nodes/ChangedFileNode";

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
    // TODO: implement
  }

  async renameBranch(node: GitTreeNode): Promise<void> {
    if (!node || !("branchName" in node)) {
      return;
    }
    // TODO: implement
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
    if (!node || !(node instanceof ChangedFileNode) || !node.fileName) {
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
    this.treeDataProvider.refreshChangesNode();
    this.treeDataProvider.refreshStagedNode();
  }
}
