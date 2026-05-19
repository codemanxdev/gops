import * as vscode from "vscode";
import { TreeDataProvider } from "../gopstree/TreeDataProvider";
import { GitService } from "../services/GitService";
import { COMMANDS } from "./Commands";
import { GitTreeNode } from "../gopstree/types";
import { Logger } from "../logging/Logger";
import { DiffService } from "../services/DiffService";
import { ChangedFileNode } from "../gopstree/nodes/ChangedFileNode";

export class CommandRegistrar {
  constructor(
    private context: vscode.ExtensionContext,
    private treeDataProvider: TreeDataProvider,
    private gitService: GitService,
    private diffService: DiffService,
  ) {}

  registerAll() {
    this.register(COMMANDS.REFRESH, () => {
      console.debug(`executed command: ${COMMANDS.REFRESH}`);
      this.treeDataProvider.refresh();
    });

    this.register(COMMANDS.CHECKOUT_BRANCH, async (node: GitTreeNode) => {
      console.debug(`executed command: ${COMMANDS.CHECKOUT_BRANCH}`);
      if (node && "branchName" in node) {
        await this.gitService.checkout(node.branchName);
        this.treeDataProvider.refresh(node.parent);
      }
    });

    this.register(COMMANDS.DELETE_BRANCH, async (node: GitTreeNode) => {
      console.debug(`executed command: ${COMMANDS.DELETE_BRANCH}`);
      //this.gitService.deleteBranch(node);
    });

    this.register(COMMANDS.RENAME_BRANCH, async (node: GitTreeNode) => {
      console.debug(`executed command: ${COMMANDS.RENAME_BRANCH}`);
      //this.gitService.renameBranch(node);
    });

    this.register(COMMANDS.PUSH, async () => {
      console.debug(`executed command: ${COMMANDS.PUSH}`);
      await this.gitService.push();
    });

    this.register(COMMANDS.PULL, async () => {
      console.debug(`executed command: ${COMMANDS.PULL}`);
      await this.gitService.pull();
    });

    this.register(COMMANDS.CREATE_BRANCH_FROM_CURRENT, async (node: GitTreeNode) => {
      console.debug(`executed command: ${COMMANDS.CREATE_BRANCH_FROM_CURRENT}`);
      const branchName: string | undefined = await vscode.window.showInputBox({
        prompt: "Enter new branch name",
        placeHolder: "feature/my-new-feature",
        ignoreFocusOut: true,
      });

      if (!branchName) {
        return;
      }

      await this.gitService.checkoutLocalBranch(branchName);
      if (node?.parent) {
        this.treeDataProvider.refresh(node.parent);
      }
    });

    this.register(
      COMMANDS.CREATE_BRANCH,
      async (node: GitTreeNode) => {
        console.debug(
          `executed command: ${COMMANDS.CREATE_BRANCH}`,
        );
        if (!node || !("branchName" in node)) {
          return;
        }

        const baseBranch = node?.branchName;
        const branchName: string | undefined = await vscode.window.showInputBox(
          {
            prompt: `Enter new branch name to create from ${baseBranch}`,
            placeHolder: "feature/my-new-feature",
            ignoreFocusOut: true,
          },
        );

        if (!branchName) {
          return;
        }

        await this.gitService.checkoutBranch(branchName, baseBranch);
        if (node?.parent) {
          this.treeDataProvider.refresh(node.parent);
        }
      },
    );

    this.register(COMMANDS.SHOW_DIFF, async (node: GitTreeNode) => {
      console.debug(`executed command: ${COMMANDS.SHOW_DIFF}`);
      if (!node || !(node instanceof ChangedFileNode) || !node.fileName) {
        return;
      }
      const repoPath = this.gitService.getRepoPath();

      await this.diffService.openDiff({
        left: {
          repositoryPath: repoPath,
          fileName: node.fileName,
          ref: "HEAD",
        },
        right: {
          repositoryPath: repoPath,
          fileName: node.fileName,
        },
        title: `Diff: ${node.fileName}`,
      });
    });
  }

  private register(
    command: string,
    handler: (...args: any[]) => Promise<void> | void,
  ) {
    const disposable = vscode.commands.registerCommand(
      command,
      async (...args) => {
        try {
          await handler(...args);
        } catch (error) {
          Logger.error(
            `Error executing command ${command}: ${Logger.getErrorMessage(error)}`,
          );
        }
      },
    );

    this.context.subscriptions.push(disposable);
  }
}
