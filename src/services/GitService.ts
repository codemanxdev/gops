import simpleGit, { SimpleGit } from "simple-git";
import * as vscode from "vscode";

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

  async getLog() {
    const log = await this.git.log();
    return log.all;
  }

  async checkout(branch: string) {
    return this.git.checkout(branch);
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
}
