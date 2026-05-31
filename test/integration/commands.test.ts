import * as assert from "node:assert";
import * as vscode from "vscode";

suite("Commands", function () {
  this.timeout(30000);

  suiteSetup(async function () {
    const extension = vscode.extensions.getExtension("codemanxdev.gops");
    if (!extension?.isActive) {
      await extension?.activate();
    }
  });

  test("should register all commands", async function () {
    const commands = await vscode.commands.getCommands(true);
    const expectedCommands = [
      "gops.refresh",
      "gops.pull",
      "gops.push",
      "gops.checkout",
      "gops.deleteBranch",
      "gops.renameBranch",
      "gops.branch",
      "gops.branch.current",
      "gops.tag",
      "gops.showDiff",
      "gops.stageFile",
      "gops.unstageFile",
      "gops.unstageAllFiles",
      "gops.commit",
    ];

    for (const command of expectedCommands) {
      assert.ok(
        commands.includes(command),
        `Command ${command} must be registered`,
      );
    }
  });

  test("gops.refresh should execute without error", async function () {
    await vscode.commands.executeCommand("gops.refresh");
    assert.ok(true, "gops.refresh completed without error");
  });

  test("gops.pull should execute without error", async function () {
    try {
      await vscode.commands.executeCommand("gops.pull");
      assert.ok(true, "gops.pull completed without error");
    } catch (err: any) {
      assert.ok(
        err.message.includes("remote") || err.message.includes("origin"),
        `gops.pull failed with unexpected error: ${err.message}`,
      );
    }
  });

  test("gops.push should execute without error", async function () {
    try {
      await vscode.commands.executeCommand("gops.push");
      assert.ok(true, "gops.push completed without error");
    } catch (err: any) {
      assert.ok(
        err.message.includes("remote") || err.message.includes("origin"),
        `gops.push failed with unexpected error: ${err.message}`,
      );
    }
  });
});
