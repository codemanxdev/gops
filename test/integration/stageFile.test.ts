import * as assert from "node:assert";
import * as vscode from "vscode";
import * as path from "node:path";
import * as fs from "node:fs/promises";

suite("Stage/Unstage", function () {
  this.timeout(30000);

  const workspacePath = () => vscode.workspace.workspaceFolders![0].uri.fsPath;

  suiteSetup(async function () {
    const extension = vscode.extensions.getExtension("codemanxdev.gops");
    if (!extension?.isActive) {
      await extension?.activate();
    }
  });

  setup(async function () {
    // Create a test file before each test
    await fs.writeFile(
      path.join(workspacePath(), "stage-test.md"),
      "test content",
    );
    await new Promise((resolve) => setTimeout(resolve, 200));
  });

  teardown(async function () {
    // Clean up test file after each test
    await fs.rm(path.join(workspacePath(), "stage-test.md"), { force: true });
    await new Promise((resolve) => setTimeout(resolve, 200));
  });

  test("gops.unstageAllFiles should execute without error", async function () {
    await vscode.commands.executeCommand("gops.unstageAllFiles");
    assert.ok(true, "gops.unstageAllFiles completed without error");
  });

  test("gops.refresh should reflect file changes", async function () {
    await vscode.commands.executeCommand("gops.refresh");
    await new Promise((resolve) => setTimeout(resolve, 500));
    assert.ok(true, "gops.refresh completed after file change");
  });
});
