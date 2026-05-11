import simpleGit, { SimpleGit } from "simple-git";
import * as vscode from "vscode";
import * as path from "path";
import { Logger } from "../logging/Logger";
import { Notifications } from "../notifications/Notifications";

export class GitService {
  private git: SimpleGit;

  constructor();
  constructor(repoPath: string);

  constructor(repoPath?: string) {
    const finalPath =
      repoPath ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    this.git = simpleGit(finalPath);
  }

  async getStatus() {
    return this.git.status();
  }

  async getBranches() {
    return this.git.branch();
  }

  async getLocalBranches() {
    const branches = await this.git.branchLocal();
    return branches.all.map((name) => ({
      name,
      current: name === branches.current,
      ahead: branches.branches[name].label.match(/ahead (\d+)/)
        ? parseInt(branches.branches[name].label.match(/ahead (\d+)/)![1], 10)
        : 0,
      behind: branches.branches[name].label.match(/behind (\d+)/)
        ? parseInt(branches.branches[name].label.match(/behind (\d+)/)![1], 10)
        : 0,
    }));
  }

  async getRemotes() {
    return this.git.getRemotes();
  }

  async getRemoteBranches(remote: string) {
    const branches = await this.git.branch({ '--remotes': null });
    return branches.all
      .filter((name) => name.startsWith(`${remote}/`))
      .map((name) => ({
        name: name.substring(remote.length + 1),
        remote: remote,
      }));
  }

  async getLog() {
    const log = await this.git.log();
    return log.all;
  }

  async checkout(branch: string) {    
    try {
      await this.git.checkout(branch);
      Logger.info(`Checked out to ${branch}`);
      Notifications.info(`Checked out to ${branch}`);
    } catch (error: unknown) {
      const message = Logger.getErrorMessage(error);
      Logger.error(`Checkout failed: ${message}`);
      Notifications.errorWithOutput("Checkout failed. See details in output");
    }
  }

  async commit(message: string) {
    return this.git.commit(message);
  }

  async pull() {
    return this.git.pull();
  }

  async push() {
    return this.git.push();
  }

  async createBranch(branchName: string) {
    return this.git.checkoutLocalBranch(branchName);
  }

  async getRepoName(): Promise<string> {
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
}
