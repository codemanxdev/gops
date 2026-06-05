import * as assert from "node:assert";
import * as vscode from "vscode";
import { COMMANDS } from "../../src/commands/Commands";

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
      COMMANDS.REFRESH,
      COMMANDS.PULL,
      COMMANDS.PUSH,
      COMMANDS.CHECKOUT_BRANCH,
      COMMANDS.DELETE_BRANCH,
      COMMANDS.RENAME_BRANCH,
      COMMANDS.CREATE_BRANCH,
      COMMANDS.CREATE_BRANCH_FROM_CURRENT,
      COMMANDS.CREATE_TAG,
      COMMANDS.SHOW_DIFF,
      COMMANDS.STAGE_FILE,
      COMMANDS.UNSTAGE_FILE,
      COMMANDS.UNSTAGE_ALL_FILES,
      COMMANDS.COMMIT,
      COMMANDS.SHOW_GIT_GRAPH,
      COMMANDS.PUBLISH_BRANCH,
      COMMANDS.FETCH,
      COMMANDS.POP_STASH,
    ];

    for (const command of expectedCommands) {
      assert.ok(
        commands.includes(command),
        `Command ${command} must be registered`,
      );
    }
  });

  test(`${COMMANDS.REFRESH} should execute without error`, async function () {
    await vscode.commands.executeCommand(COMMANDS.REFRESH);
    assert.ok(true, "${COMMANDS.REFRESH} completed without error");
  });

  test(`${COMMANDS.PULL} should execute without error`, async function () {
    try {
      await vscode.commands.executeCommand(COMMANDS.PULL);
      assert.ok(true, `${COMMANDS.PULL} completed without error`);
    } catch (err: any) {
      assert.ok(
        err.message.includes("remote") || err.message.includes("origin"),
        `${COMMANDS.PULL} failed with unexpected error: ${err.message}`,
      );
    }
  });

  test(`${COMMANDS.PUSH} should execute without error`, async function () {
    try {
      await vscode.commands.executeCommand(COMMANDS.PUSH);
      assert.ok(true, `${COMMANDS.PUSH} completed without error`);
    } catch (err: any) {
      assert.ok(
        err.message.includes("remote") || err.message.includes("origin"),
        `${COMMANDS.PUSH} failed with unexpected error: ${err.message}`,
      );
    }
  });

  test("gops.fetch should execute without error", async function () {
    await vscode.commands.executeCommand("gops.fetch");
    assert.ok(true, "gops.fetch completed without error");
  });

  test("gops.popStash should execute without error", async function () {
    await vscode.commands.executeCommand(COMMANDS.POP_STASH);
    assert.ok(true, "gops.popStash completed without error");
  });

  test(`${COMMANDS.STASH_CHANGES} should execute without error`, async function () {
    await vscode.commands.executeCommand(COMMANDS.STASH_CHANGES);
    assert.ok(true, `${COMMANDS.STASH_CHANGES} completed without error`);
  });

  test(`${COMMANDS.POP_STASH} should execute without error`, async function () {
    await vscode.commands.executeCommand(COMMANDS.POP_STASH);
    assert.ok(true, `${COMMANDS.POP_STASH} completed without error`);
  });
});
