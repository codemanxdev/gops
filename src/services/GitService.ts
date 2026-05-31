import simpleGit, {
  BranchSummary,
  DefaultLogFields,
  ListLogLine,
  RemoteWithoutRefs,
  SimpleGit,
  StatusResult,
} from "simple-git";
import * as vscode from "vscode";
import * as path from "path";
import { Logger } from "../logging/Logger";
import { Notifications } from "../notifications/Notifications";
import { LocalBranchModel } from "../models/LocalBranchModel";
import { RemoteBranchModel } from "../models/RemoteBranchModel";
import { AheadBehindModel } from "../models/AheadBehindModel";

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

  async getChangedFiles(): Promise<string[]> {
    const status = await this.git.status();
    return status.files
      .filter((f) => f.working_dir !== " " && f.working_dir !== "?")
      .map((f) => f.path);
  }

  async getStagedFiles(): Promise<string[]> {
    const status = await this.git.status();
    return status.files
      .filter((f) => f.index !== " " && f.index !== "?")
      .map((f) => f.path);
  }

  async stageFile(filePath: string): Promise<void> {
    await this.executeGitAction(
      () => this.git.add(filePath),
      `Staged file ${filePath} successfully`,
      `Failed to stage file ${filePath}`,
    );
  }

  async unstageFile(filePath: string): Promise<void> {
    await this.executeGitAction(
      () => this.git.reset(["HEAD", filePath]),
      `Unstaged file ${filePath} successfully`,
      `Failed to unstage file ${filePath}`,
    );
  }

  async unstageAllFiles(): Promise<void> {
    await this.executeGitAction(
      () => this.git.reset(["HEAD"]),
      "Unstaged all files successfully",
      "Failed to unstage all files",
    );
  }

  async stageAllFiles(): Promise<void> {
    await this.executeGitAction(
      () => this.git.add("."),
      "Staged all files successfully",
      "Failed to stage all files",
    );
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

  public async getFileContent(ref: string, filePath: string): Promise<string> {
    return await this.git.show([`${ref}:${filePath}`]);
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
    const status = await this.git.status();
    Logger.info(`Staged files before commit: ${JSON.stringify(status.staged)}`);
    Logger.info(`All files: ${JSON.stringify(status.files)}`);
    return this.executeGitAction(
      () => this.git.commit(message, []),
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
