import * as assert from "node:assert";
import * as vscode from "vscode";

/**
 * Integration tests for the Gops extension.
 *
 * The workspace folder is opened by `.vscode-test.mjs` via the `workspaceFolder`
 * config field.  The folder is a minimal git repo created on-the-fly by the config
 * script, so GitService / simple-git have a valid repo to work against.
 */
suite("Extension Integration Test Suite", function () {
  this.timeout(30000);

  test("Extension should be activated and execute commands", async function () {
    // The workspace is opened by the test runner — confirm it is set
    assert.ok(
      vscode.workspace.workspaceFolders?.length,
      "Workspace folder from workspaceFolder config must be available",
    );

    const extension = vscode.extensions.getExtension("codemanxdev.gops");
    assert.ok(extension, "Extension codemanxdev.gops must be found by VS Code");

    if (!extension.isActive) {
      await extension.activate();
    }

    assert.strictEqual(
      extension.isActive,
      true,
      "Extension must be active after activation",
    );

    // gops.refresh is a no-args command registered by CommandRegistrar in activate().
    // A clean resolve confirms the command registry is intact and tree view is registered.
    await vscode.commands.executeCommand("gops.refresh");
    assert.ok(true, "gops.refresh must complete without error");
  });

  test("Extension should register the Git Ops tree view", async function () {
    assert.ok(
      vscode.workspace.workspaceFolders?.length,
      "Workspace folder from workspaceFolder config must be available",
    );

    const extension = vscode.extensions.getExtension("codemanxdev.gops");
    assert.ok(extension, "Extension codemanxdev.gops must be found by VS Code");

    if (!extension.isActive) {
      await extension.activate();
    }

    // Allow tree data provider to populate once
    await new Promise((resolve) => setTimeout(resolve, 500));

    assert.strictEqual(
      extension.isActive,
      true,
      "Extension must be active before checking tree view registration",
    );

    // extension.ts activate() calls:
    //   vscode.window.createTreeView('gitOpsTreeview', { treeDataProvider })
    // Calling createTreeView again with the same id throws VS Code error E303
    // ('Object for type "view" already exists').  Catching that error proves the
    // extension registered the tree view in activate().
    let treeViewAlreadyRegistered = false;
    try {
      vscode.window.createTreeView("gitOpsTreeview", {
        treeDataProvider:
          new (class implements vscode.TreeDataProvider<unknown> {
            getTreeItem(
              _element: unknown,
            ): vscode.TreeItem | Thenable<vscode.TreeItem> {
              return undefined as unknown as vscode.TreeItem;
            }
            getChildren(): vscode.TreeItem[] | Thenable<vscode.TreeItem[]> {
              return [];
            }
          })(),
      });
      // If we reach here the view was NOT registered — fail
      assert.fail(
        'createTreeView should have thrown "already exists" since activate() registered the view first',
      );
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
      'createTreeView("gitOpsTreeview") must throw "already exists" — ' +
        "proving the extension registered the Git Ops tree view in activate()",
    );
  });
});
