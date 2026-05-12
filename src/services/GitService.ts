import simpleGit, { BranchSummary, DefaultLogFields, ListLogLine, RemoteWithoutRefs, SimpleGit, StatusResult } from "simple-git";
import * as vscode from "vscode";
import * as path from "path";
import { Logger } from "../logging/Logger";
import { Notifications } from "../notifications/Notifications";
import { LocalBranchModel } from "./LocalBranchModel";
import { RemoteBranchModel } from "./RemoteBranchModel";
import { AheadBehindModel } from "./AheadBehindModel";

export class GitService {
  private git: SimpleGit;

  constructor();
  constructor(repoPath: string);

  constructor(repoPath?: string) {
    const finalPath =
      repoPath ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

    if (!finalPath) {
      throw new Error("No workspace folder is open");
    }

    this.git = simpleGit(finalPath);
  }

  async getStatus(): Promise<StatusResult> {
    return this.git.status();
  }

  async getBranches(): Promise<BranchSummary> {
    return this.git.branch();
  }

  async getLocalBranches(): Promise<LocalBranchModel[]> {
    const branches = await this.git.branchLocal();

    return branches.all.map((name) => {
      const branch = branches.branches[name];

      return {
        name,
        current: name === branches.current,
        ...this.parseAheadBehind(branch.label),
      };
    });
  }

  async getRemotes(): Promise<RemoteWithoutRefs[]> {
    return this.git.getRemotes();
  }

  async getRemoteBranches(remote: string): Promise<RemoteBranchModel[]> {
    const branches = await this.git.branch({ "--remotes": null });
    return branches.all
      .filter((name) => name.startsWith(`${remote}/`))
      .map((name) => ({
        name: name.substring(remote.length + 1),
        remote: remote,
      }));
  }

  async getTags(): Promise<string[]> {
    return (await this.git.tags()).all;
  }

  async getStash(): Promise<string[]> {
    const stashList = await this.git.stashList();
    return stashList.all.map((s) => s.message);
  }

  async getLog(): Promise<readonly (DefaultLogFields & ListLogLine)[]> {
    const log = await this.git.log();
    return log.all;
  }

  // #region [Branch Operations]

  async checkout(branch: string) {
    return this.executeGitAction(
      () => this.git.checkout(branch),
      `Checked out branch ${branch} successfully`,
      `Checkout failed for branch ${branch}`,
    );
  }

  async checkoutBranch(newBranch: string, baseBranch: string) {
    return this.executeGitAction(
      () => this.git.checkoutBranch(newBranch, baseBranch),
      `Checked out branch ${newBranch} successfully`,
      `Checkout failed for branch ${newBranch}`,
    );
  }

  async push() {
    return this.executeGitAction(
      () => this.git.push(),
      "Pushed to remote successfully",
      "Push failed",
    );
  }

  async commit(message: string) {
    return this.executeGitAction(
      () => this.git.commit(message),
      "Commit successful",
      "Commit failed",
    );
  }

  async pull() {
    return this.executeGitAction(
      () => this.git.pull(),
      "Pull successful",
      "Pull failed",
    );
  }

  async checkoutLocalBranch(branchName: string) {
    return this.executeGitAction(
      () => this.git.checkoutLocalBranch(branchName),
      `Branch ${branchName} created successfully`,
      `Failed to create branch ${branchName}`,
    );
  }
  // #endregion

  getRepoName(): string {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    const repoName = workspaceFolder
      ? path.basename(workspaceFolder.uri.fsPath)
      : "";
    return repoName;
  }

  getRepoPath(): string {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    return workspaceFolder ? workspaceFolder.uri.fsPath : "";
  }

  async getCurrentBranch(): Promise<string> {
    const branchSummary = await this.git.branch();
    return branchSummary.current;
  }

  private async executeGitAction<T>(
    action: () => Promise<T>,
    successMessage: string,
    failurePrefix: string,
  ): Promise<T> {
    try {
      const result = await action();
      Logger.info(successMessage);
      Notifications.info(successMessage);
      return result;
    } catch (error) {
      const message = Logger.getErrorMessage(error);
      Logger.error(`${failurePrefix}: ${message}`);
      Notifications.errorWithOutput(`${failurePrefix}. See details in output`);
      throw error;
    }
  }

  private parseAheadBehind(label: string): AheadBehindModel {
    const aheadMatch = label.match(/ahead (\d+)/);
    const behindMatch = label.match(/behind (\d+)/);

    return {
      ahead: aheadMatch ? parseInt(aheadMatch[1], 10) : 0,
      behind: behindMatch ? parseInt(behindMatch[1], 10) : 0,
    };
  }
}
