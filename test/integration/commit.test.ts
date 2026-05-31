import * as assert from "node:assert";
import * as vscode from "vscode";
import { COMMANDS } from "../../src/commands/Commands";

suite("Commit", function () {
  this.timeout(30000);

  suiteSetup(async function () {
    const extension = vscode.extensions.getExtension("codemanxdev.gops");
    if (!extension?.isActive) {
      await extension?.activate();
    }
  });

  test(`${COMMANDS.COMMIT} should execute without error when no files staged`, async function () {
    // Mock the input box to return undefined (simulating cancel)
    const stub = vscode.window.showInputBox;
    (vscode.window as any).showInputBox = async () => undefined;

    await vscode.commands.executeCommand(COMMANDS.COMMIT);

    (vscode.window as any).showInputBox = stub;
    assert.ok(true, `${COMMANDS.COMMIT} completed without error`);
  });

  test(`${COMMANDS.REFRESH} should complete after commit attempt`, async function () {
    await vscode.commands.executeCommand(COMMANDS.REFRESH);
    await new Promise((resolve) => setTimeout(resolve, 500));
    assert.ok(true, `${COMMANDS.REFRESH} completed after commit attempt`);
  });
});
