import * as assert from "node:assert";
import * as vscode from "vscode";

suite("Commit", function () {
  this.timeout(30000);

  suiteSetup(async function () {
    const extension = vscode.extensions.getExtension("codemanxdev.gops");
    if (!extension?.isActive) {
      await extension?.activate();
    }
  });

  test("gops.commit should execute without error when no files staged", async function () {
    // Mock the input box to return undefined (simulating cancel)
    const stub = vscode.window.showInputBox;
    (vscode.window as any).showInputBox = async () => undefined;

    await vscode.commands.executeCommand("gops.commit");

    (vscode.window as any).showInputBox = stub;
    assert.ok(true, "gops.commit completed without error");
  });

  test("gops.refresh should complete after commit attempt", async function () {
    await vscode.commands.executeCommand("gops.refresh");
    await new Promise((resolve) => setTimeout(resolve, 500));
    assert.ok(true, "gops.refresh completed after commit attempt");
  });
});
