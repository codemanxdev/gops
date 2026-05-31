import * as assert from "node:assert";
import * as vscode from "vscode";

suite("Branch", function () {
  this.timeout(30000);

  suiteSetup(async function () {
    const extension = vscode.extensions.getExtension("codemanxdev.gops");
    if (!extension?.isActive) {
      await extension?.activate();
    }
  });

  test("gops.branch.current should execute without error", async function () {
    // Mock input box to simulate cancel
    const stub = vscode.window.showInputBox;
    (vscode.window as any).showInputBox = async () => undefined;

    await vscode.commands.executeCommand("gops.branch.current");

    (vscode.window as any).showInputBox = stub;
    assert.ok(true, "gops.branch.current completed without error");
  });

  test("gops.deleteBranch should execute without error", async function () {
    await vscode.commands.executeCommand("gops.deleteBranch");
    assert.ok(true, "gops.deleteBranch completed without error");
  });

  test("gops.renameBranch should execute without error", async function () {
    await vscode.commands.executeCommand("gops.renameBranch");
    assert.ok(true, "gops.renameBranch completed without error");
  });

  test("gops.checkout should execute without error", async function () {
    await vscode.commands.executeCommand("gops.checkout");
    assert.ok(true, "gops.checkout completed without error");
  });
});
