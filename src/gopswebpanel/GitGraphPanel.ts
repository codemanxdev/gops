import * as vscode from "vscode";
import { GitService } from "../services/GitService";
import { renderGitGraph } from "./GitGraphWebview";

export class GitGraphPanel {
  private static currentPanel: GitGraphPanel | undefined;

  private constructor(private readonly panel: vscode.WebviewPanel) {}

  public static async createOrShow(branchName: string, gitService: GitService) {
    const extensionUri =
      vscode.extensions.getExtension("codemanxdev.gops")!.extensionUri;
    const panel = vscode.window.createWebviewPanel(
      "gitGraph",
      `Git Graph: ${branchName}`,
      vscode.ViewColumn.One,
      { enableScripts: true },
    );

    panel.onDidDispose(() => {
      GitGraphPanel.currentPanel = undefined;
    });

    GitGraphPanel.currentPanel = new GitGraphPanel(panel);
    await GitGraphPanel.currentPanel.render(
      extensionUri,
      branchName,
      gitService,
    );
  }

  private async render(
    extensionUri: vscode.Uri,
    branchName: string,
    gitService: GitService,
  ) {
    const commits = await gitService.getBranchCommits(branchName);

    console.log(
      "GRAPH ORDER:",
      commits.slice(0, 5).map((c) => c.hash),
    );

    const cssUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, "media", "gitGraph.css"),
    );
    this.panel.webview.html = renderGitGraph(branchName, commits, cssUri);
  }
}
