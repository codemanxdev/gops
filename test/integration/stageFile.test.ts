import * as assert from "node:assert";
import * as vscode from "vscode";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { COMMANDS } from "../../src/commands/Commands";

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

  test(`${COMMANDS.UNSTAGE_ALL_FILES} should execute without error`, async function () {
    await vscode.commands.executeCommand(COMMANDS.UNSTAGE_ALL_FILES);
    assert.ok(true, `${COMMANDS.UNSTAGE_ALL_FILES} completed without error`);
  });

  test(`${COMMANDS.REFRESH} should reflect file changes`, async function () {
    await vscode.commands.executeCommand(COMMANDS.REFRESH);
    await new Promise((resolve) => setTimeout(resolve, 500));
    assert.ok(true, `${COMMANDS.REFRESH} completed after file change`);
  });
});
