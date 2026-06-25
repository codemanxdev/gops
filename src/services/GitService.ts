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
import { BranchInfoModel } from "../models/BranchInfoModel";
import { GitCommitModel } from "../models/GitCommitModel";
import { parseRefs } from "../utils/parseRefs";
import { CommitDetail } from "../models/CommitDetail";

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

  static async isGitAvailable(): Promise<boolean> {
    try {
      const git = simpleGit();
      await git.version();
      return true;
    } catch {
      return false;
    }
  }

  // #region [Branch Operations]

  async getBranches(): Promise<BranchSummary> {
    return this.git.branch();
  }

  async getLocalBranches(): Promise<LocalBranchModel[]> {
    const raw = await this.git.branch(["-vv"]);

    return raw.all.map((name) => {
      const branch = raw.branches[name];

      return {
        name,
        current: name === raw.current,
        ...this.parseBranchInfo(branch.label),
      };
    });
  }

  async getCurrentBranch(): Promise<string> {
    const branchSummary = await this.git.branch();
    return branchSummary.current;
  }

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

  async checkoutLocalBranch(branchName: string) {
    return this.executeGitAction(
      () => this.git.checkoutLocalBranch(branchName),
      `Branch ${branchName} created successfully`,
      `Failed to create branch ${branchName}`,
    );
  }

  async checkoutRemoteBranch(
    branchName: string,
    remoteName: string,
  ): Promise<void> {
    await this.executeGitAction(
      () => this.git.checkoutBranch(branchName, `${remoteName}/${branchName}`),
      `Checked out remote branch ${branchName} successfully`,
      `Failed to checkout remote branch ${branchName}`,
    );
  }

  async renameBranch(oldName: string, newName: string): Promise<void> {
    await this.executeGitAction(
      () => this.git.raw(["branch", "-m", oldName, newName]),
      `Branch renamed to ${newName} successfully`,
      `Failed to rename branch ${oldName}`,
    );
  }

  async deleteBranch(branchName: string): Promise<void> {
    await this.executeGitAction(
      () => this.git.deleteLocalBranch(branchName),
      `Branch ${branchName} deleted successfully`,
      `Failed to delete branch ${branchName}`,
    );
  }

  async getBranchCommits(branchName: string): Promise<GitCommitModel[]> {
    return this.executeGitAction(
      async () => {
        const log = await this.git.log({
          "--all": null,
          "--topo-order": null,
          format: {
            hash: "%h",
            message: "%s",
            author: "%an",
            date: "%ai",
            parents: "%P",
            refs: "%D",
          },
        });
        return log.all.map(
          (c: any) =>
            new GitCommitModel(
              c.hash,
              c.message,
              c.author,
              c.date,
              c.parents
                ? c.parents.trim().split(" ").filter(Boolean).length > 1
                : false,
              parseRefs(c.refs),
              c.parents
                ? c.parents
                    .trim()
                    .split(" ")
                    .filter(Boolean)
                    .map((p: string) => p.substring(0, 7))
                : [],
            ),
        );
      },
      `Loaded commits for branch ${branchName}`,
      `Failed to load commits for branch ${branchName}`,
    );
  }

  // #endregion

  // #region [Remote Operations]

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

  async push() {
    return this.executeGitAction(
      () => this.git.push(),
      "Pushed to remote successfully",
      "Push failed",
    );
  }

  async pull() {
    return this.executeGitAction(
      () => this.git.pull(),
      "Pull successful",
      "Pull failed",
    );
  }

  async fetch(): Promise<void> {
    await this.executeGitAction(
      () => this.git.fetch(["--prune"]),
      "Fetched latest changes",
      "Failed to fetch changes",
    );
  }

  async publishBranch(branchName: string): Promise<void> {
    await this.executeGitAction(
      () => this.git.push(["--set-upstream", "origin", branchName]),
      `Branch ${branchName} published to origin`,
      `Failed to publish branch ${branchName}`,
    );
  }

  // #endregion

  // #region [File Operations]

  async getStatus(): Promise<StatusResult> {
    return this.git.status();
  }

  async getChangedFiles(): Promise<string[]> {
    const status = await this.git.status();
    return status.files.filter((f) => f.working_dir !== " ").map((f) => f.path);
  }

  async getStagedFiles(): Promise<string[]> {
    const status = await this.git.status();
    return status.files
      .filter((f) => f.index !== " " && f.index !== "?")
      .map((f) => f.path);
  }

  async getUntrackedFiles(): Promise<string[]> {
    const status = await this.git.status();
    return status.files
      .filter((f) => f.working_dir === "?" && f.index === "?")
      .map((f) => f.path);
  }

  async stageFile(filePath: string): Promise<void> {
    await this.executeGitAction(
      () => this.git.add(filePath),
      `Staged file ${filePath} successfully`,
      `Failed to stage file ${filePath}`,
    );
  }

  async stageAllFiles(): Promise<void> {
    await this.executeGitAction(
      () => this.git.add("."),
      "Staged all files successfully",
      "Failed to stage all files",
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

  async discardFile(fileName: string): Promise<void> {
    await this.git.checkout(["--", fileName]);
  }

  async discardAllFiles(): Promise<void> {
    await this.executeGitAction(
      () => this.git.checkout(["--", "."]),
      "Discarded all changes successfully",
      "Failed to discard all changes",
    );
  }

  async deleteUntrackedFile(fileName: string): Promise<void> {
    const fs = await import("fs/promises");
    const path = await import("path");
    const repoPath = this.getRepoPath();
    const fullPath = path.join(repoPath, fileName);
    await fs.unlink(fullPath);
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

  // #endregion

  // #region [Stash]

  async getStash(): Promise<{ ref: string; message: string }[]> {
    const stashList = await this.git.stashList();
    return stashList.all.map((s, index) => ({
      ref: `stash@{${index}}`,
      message: s.message,
    }));
  }

  async stashChanges(): Promise<void> {
    await this.executeGitAction(
      () => this.git.stash(),
      "Changes stashed successfully",
      "Failed to stash changes",
    );
  }

  async popStash(stashId: string): Promise<void> {
    await this.executeGitAction(
      () => this.git.stash(["pop", stashId]),
      `Popped stash ${stashId}`,
      `Failed to pop stash ${stashId}`,
    );
  }

  // #endregion

  // #region [Tag Operations]

  async getTags(): Promise<string[]> {
    return (await this.git.tags()).all;
  }

  async createTag(name: string, hash: string, message?: string): Promise<void> {
    await this.executeGitAction(
      () =>
        message
          ? this.git.tag(["-a", name, hash, "-m", message])
          : this.git.tag([name, hash]),
      `Tag ${name} created successfully`,
      `Failed to create tag ${name}`,
    );
  }

  // #endregion

  // #region [Log & History]

  async getLog(): Promise<readonly (DefaultLogFields & ListLogLine)[]> {
    const log = await this.git.log();
    return log.all;
  }

  async getCommitDetail(hash: string): Promise<CommitDetail> {
    return this.executeGitAction(
      async () => {
        const log = await this.git.log({
          maxCount: 1,
          from: hash,
          to: hash,
          format: {
            hash: "%h",
            message: "%B",
            author: "%an",
            date: "%ai",
          },
        });

        const entry = log.latest as any;
        const diff = await this.git.raw(["show", "--stat", "-p", hash]);

        return {
          hash: entry?.hash ?? hash,
          message: entry?.message?.trim() ?? "",
          author: entry?.author ?? "",
          date: entry?.date ?? "",
          diff,
        };
      },
      `Loaded commit detail for ${hash}`,
      `Failed to load commit detail for ${hash}`,
    );
  }

  public async getFileContent(ref: string, filePath: string): Promise<string> {
    return await this.git.show([`${ref}:${filePath}`]);
  }

  // #endregion

  // #region [Utilities]

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

  private parseBranchInfo(label: string): BranchInfoModel {
    const aheadMatch = label.match(/ahead (\d+)/);
    const behindMatch = label.match(/behind (\d+)/);
    const hasUpstream = /^\[[^\]]+\]/.test(label) && !/: gone/.test(label);

    return {
      ahead: aheadMatch ? parseInt(aheadMatch[1], 10) : 0,
      behind: behindMatch ? parseInt(behindMatch[1], 10) : 0,
      hasUpstream,
    };
  }

  // #endregion
}
