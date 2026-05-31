import * as assert from "node:assert";
import * as vscode from "vscode";

suite("Extension", function () {
  this.timeout(30000);

  test("should be activated and execute commands", async function () {
    assert.ok(
      vscode.workspace.workspaceFolders?.length,
      "Workspace folder must be available",
    );

    const extension = vscode.extensions.getExtension("codemanxdev.gops");
    assert.ok(extension, "Extension codemanxdev.gops must be found by VS Code");

    if (!extension.isActive) {
      await extension.activate();
    }

    assert.strictEqual(extension.isActive, true, "Extension must be active");

    await vscode.commands.executeCommand("gops.refresh");
    assert.ok(true, "gops.refresh must complete without error");
  });

  test("should register the Git Ops tree view", async function () {
    const extension = vscode.extensions.getExtension("codemanxdev.gops");
    if (!extension?.isActive) {
      await extension?.activate();
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    let treeViewAlreadyRegistered = false;
    try {
      vscode.window.createTreeView("gitOpsTreeview", {
        treeDataProvider:
          new (class implements vscode.TreeDataProvider<unknown> {
            getTreeItem(_element: unknown): vscode.TreeItem {
              return undefined as unknown as vscode.TreeItem;
            }
            getChildren(): vscode.TreeItem[] {
              return [];
            }
          })(),
      });
      assert.fail("createTreeView should have thrown already exists");
    } catch (err: any) {
      if (
        typeof err.message === "string" &&
        err.message.includes("already exists")
      ) {
        treeViewAlreadyRegistered = true;
      } else {
        throw err;
      }
    }

    assert.ok(
      treeViewAlreadyRegistered,
      "Tree view must be registered by activate()",
    );
  });
});
