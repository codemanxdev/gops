import * as assert from "node:assert";
import * as vscode from "vscode";
import { COMMANDS } from "../../src/commands/Commands";

suite("Branch", function () {
  this.timeout(30000);

  suiteSetup(async function () {
    const extension = vscode.extensions.getExtension("codemanxdev.gops");
    if (!extension?.isActive) {
      await extension?.activate();
    }
  });

  test(`${COMMANDS.CREATE_BRANCH_FROM_CURRENT} should execute without error`, async function () {
    // Mock input box to simulate cancel
    const stub = vscode.window.showInputBox;
    (vscode.window as any).showInputBox = async () => undefined;

    await vscode.commands.executeCommand(COMMANDS.CREATE_BRANCH_FROM_CURRENT);

    (vscode.window as any).showInputBox = stub;
    assert.ok(
      true,
      `${COMMANDS.CREATE_BRANCH_FROM_CURRENT} completed without error`,
    );
  });

  test(`${COMMANDS.DELETE_BRANCH} should execute without error`, async function () {
    await vscode.commands.executeCommand(COMMANDS.DELETE_BRANCH);
    assert.ok(true, `${COMMANDS.DELETE_BRANCH} completed without error`);
  });

  test(`${COMMANDS.RENAME_BRANCH} should execute without error`, async function () {
    await vscode.commands.executeCommand(COMMANDS.RENAME_BRANCH);
    assert.ok(true, `${COMMANDS.RENAME_BRANCH} completed without error`);
  });

  test(`${COMMANDS.CHECKOUT_BRANCH} should execute without error`, async function () {
    await vscode.commands.executeCommand(COMMANDS.CHECKOUT_BRANCH);
    assert.ok(true, `${COMMANDS.CHECKOUT_BRANCH} completed without error`);
  });

  test(`${COMMANDS.PUBLISH_BRANCH} should execute without error`, async function () {
    await vscode.commands.executeCommand(COMMANDS.PUBLISH_BRANCH);
    assert.ok(true, `${COMMANDS.PUBLISH_BRANCH} completed without error`);
  });
});
