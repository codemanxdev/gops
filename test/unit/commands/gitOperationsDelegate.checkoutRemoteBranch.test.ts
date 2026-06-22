/// <reference types="vitest" />
import { vi, describe, it, expect, beforeEach } from "vitest";
import { GitOperationsDelegate } from "../../../src/commands/GitOperationsDelegate";

vi.mock("vscode", () => ({
  window: {
    showWarningMessage: vi.fn(),
    showInputBox: vi.fn(),
    createOutputChannel: vi.fn(() => ({
      appendLine: vi.fn(),
      show: vi.fn(),
      dispose: vi.fn(),
    })),
  },
  TreeItem: class {
    label: any;
    collapsibleState: any;
    contextValue: any;
    command: any;
    tooltip: any;
    constructor(label: any, collapsibleState?: any) {
      this.label = label;
      this.collapsibleState = collapsibleState;
    }
  },
  TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
  Uri: { file: (v: string) => ({ fsPath: v }) },
  commands: { executeCommand: vi.fn() },
}));

const mockGitService = {
  checkoutRemoteBranch: vi.fn(),
};

const mockTreeDataProvider = {
  refreshRootNode: vi.fn(),
  refreshLocalBranchesNode: vi.fn(),
};

const mockDiffService = {};
const mockTreeView = {};

function makeDelegate() {
  return new GitOperationsDelegate(
    mockGitService as any,
    mockDiffService as any,
    mockTreeDataProvider as any,
    mockTreeView as any,
  );
}

describe("GitOperationsDelegate.checkoutRemoteBranch", () => {
  let delegate: GitOperationsDelegate;

  beforeEach(() => {
    vi.clearAllMocks();
    delegate = makeDelegate();
  });

  it("calls checkoutRemoteBranch and refreshes branches on valid node", async () => {
    mockGitService.checkoutRemoteBranch.mockResolvedValue(undefined);
    mockTreeDataProvider.refreshRootNode.mockResolvedValue(undefined);
    mockTreeDataProvider.refreshLocalBranchesNode.mockResolvedValue(undefined);

    const { RemoteBranchNode } =
      await import("../../../src/gopstree/nodes/RemoteBranchNode");
    const node = new RemoteBranchNode("origin", "feature");

    await delegate.checkoutRemoteBranch(node);

    expect(mockGitService.checkoutRemoteBranch).toHaveBeenCalledWith(
      "feature",
      "origin",
    );
    expect(mockTreeDataProvider.refreshRootNode).toHaveBeenCalled();
    expect(mockTreeDataProvider.refreshLocalBranchesNode).toHaveBeenCalled();
  });

  it("does nothing when node is null", async () => {
    await delegate.checkoutRemoteBranch(null as any);

    expect(mockGitService.checkoutRemoteBranch).not.toHaveBeenCalled();
    expect(mockTreeDataProvider.refreshRootNode).not.toHaveBeenCalled();
    expect(
      mockTreeDataProvider.refreshLocalBranchesNode,
    ).not.toHaveBeenCalled();
  });

  it("does nothing when node is not a RemoteBranchNode", async () => {
    const node = { branchName: "feature", remoteName: "origin" } as any;

    await delegate.checkoutRemoteBranch(node);

    expect(mockGitService.checkoutRemoteBranch).not.toHaveBeenCalled();
    expect(mockTreeDataProvider.refreshRootNode).not.toHaveBeenCalled();
    expect(
      mockTreeDataProvider.refreshLocalBranchesNode,
    ).not.toHaveBeenCalled();
  });

  it("does not refresh when checkoutRemoteBranch throws", async () => {
    mockGitService.checkoutRemoteBranch.mockRejectedValue(
      new Error("local changes would be overwritten"),
    );

    const { RemoteBranchNode } =
      await import("../../../src/gopstree/nodes/RemoteBranchNode");
    const node = new RemoteBranchNode("origin", "feature");

    await expect(delegate.checkoutRemoteBranch(node)).rejects.toThrow(
      "local changes would be overwritten",
    );
    expect(mockTreeDataProvider.refreshRootNode).not.toHaveBeenCalled();
    expect(
      mockTreeDataProvider.refreshLocalBranchesNode,
    ).not.toHaveBeenCalled();
  });
});
