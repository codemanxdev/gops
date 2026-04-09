import * as vscode from "vscode";

export class TreeDataProvider implements vscode.TreeDataProvider<MyItem> {
  getTreeItem(element: MyItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: MyItem): Thenable<MyItem[]> {
    vscode.window.showInformationMessage("Debug: getChildren called");
    if (!element) {
      // Root items
      return Promise.resolve([
        new MyItem("APIs", vscode.TreeItemCollapsibleState.Collapsed),
        new MyItem("Logs", vscode.TreeItemCollapsibleState.Collapsed),
      ]);
    }

    if (element.label === "APIs") {
      return Promise.resolve([
        new MyItem("Get Users", vscode.TreeItemCollapsibleState.None),
        new MyItem("Create User", vscode.TreeItemCollapsibleState.None),
      ]);
    }

    if (element.label === "Logs") {
      return Promise.resolve([
        new MyItem("Error Logs", vscode.TreeItemCollapsibleState.None),
        new MyItem("Access Logs", vscode.TreeItemCollapsibleState.None),
      ]);
    }

    return Promise.resolve([]);
  }
}

class MyItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(label, collapsibleState);
  }
}
