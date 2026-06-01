import * as vscode from 'vscode';

export class GitGraphPanel {
  private static currentPanel: GitGraphPanel | undefined;

  private constructor(private readonly panel: vscode.WebviewPanel) {}

  public static async createOrShow(
    extensionUri: vscode.Uri,
    branchName: string,
  ) {
    const panel = vscode.window.createWebviewPanel(
      "gitGraph",
      `Git Graph: ${branchName}`,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
      },
    );

    GitGraphPanel.currentPanel = new GitGraphPanel(panel);

    await GitGraphPanel.currentPanel.render(extensionUri, branchName);
  }

  private async render(extensionUri: vscode.Uri, branchName: string) {
    this.panel.webview.html = `
      <html>
      <body>
        <h1>${branchName}</h1>
        <div id="graph"></div>
      </body>
      </html>
    `;
  }
}
