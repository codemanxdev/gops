/// <reference types="vitest" />
import { vi, describe, it, expect, beforeEach } from "vitest";
import { GitOperationsDelegate } from "../../../src/commands/GitOperationsDelegate";
import * as vscode from "vscode";
import { Notifications } from "../../../src/notifications/Notifications";

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

vi.mock("../../../src/gopstree/nodes/ChangedFileNode", () => {
  return {
    ChangedFileNode: vi.fn().mockImplementation((fileName: string) => ({
      fileName,
    })),
  };
});

const mockGitService = {
  discardFile: vi.fn(),
  discardAllFiles: vi.fn(),
};

const mockTreeDataProvider = {
  refreshChangesNode: vi.fn(),
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

describe("GitOperationsDelegate.discardFile", () => {
  let delegate: GitOperationsDelegate;

  beforeEach(() => {
    vi.clearAllMocks();
    delegate = makeDelegate();
  });

  it("calls discardFile and refreshes changes node on confirm", async () => {
    vi.mocked(vscode.window.showWarningMessage).mockResolvedValue(
      "Discard" as any,
    );
    mockGitService.discardFile.mockResolvedValue(undefined);
    mockTreeDataProvider.refreshChangesNode.mockResolvedValue(undefined);

    const node = { fileName: "src/file.ts" } as any;
    await delegate.discardFile(node);

    expect(mockGitService.discardFile).toHaveBeenCalledWith("src/file.ts");
    expect(mockTreeDataProvider.refreshChangesNode).toHaveBeenCalled();
  });

  it("does nothing when user cancels the confirm dialog", async () => {
    vi.mocked(vscode.window.showWarningMessage).mockResolvedValue(
      undefined as any,
    );

    const node = { fileName: "src/file.ts" } as any;
    await delegate.discardFile(node);

    expect(mockGitService.discardFile).not.toHaveBeenCalled();
    expect(mockTreeDataProvider.refreshChangesNode).not.toHaveBeenCalled();
  });

  it("does not refresh when discardFile throws", async () => {
    vi.mocked(vscode.window.showWarningMessage).mockResolvedValue(
      "Discard" as any,
    );
    mockGitService.discardFile.mockRejectedValue(new Error("git error"));

    const node = { fileName: "src/file.ts" } as any;
    await expect(delegate.discardFile(node)).rejects.toThrow("git error");
    expect(mockTreeDataProvider.refreshChangesNode).not.toHaveBeenCalled();
  });
});

describe("GitOperationsDelegate.discardAllFiles", () => {
  let delegate: GitOperationsDelegate;

  beforeEach(() => {
    vi.clearAllMocks();
    delegate = makeDelegate();
  });

  it("calls discardAllFiles and refreshes changes node on confirm", async () => {
    vi.spyOn(Notifications, "choice").mockResolvedValue("Discard All");
    mockGitService.discardAllFiles.mockResolvedValue(undefined);
    mockTreeDataProvider.refreshChangesNode.mockResolvedValue(undefined);

    await delegate.discardAllFiles();

    expect(mockGitService.discardAllFiles).toHaveBeenCalled();
    expect(mockTreeDataProvider.refreshChangesNode).toHaveBeenCalled();
  });

  it("does nothing when user cancels discard all", async () => {
    vi.spyOn(Notifications, "choice").mockResolvedValue(undefined);

    await delegate.discardAllFiles();

    expect(mockGitService.discardAllFiles).not.toHaveBeenCalled();
    expect(mockTreeDataProvider.refreshChangesNode).not.toHaveBeenCalled();
  });

  it("does not refresh when discardAllFiles throws", async () => {
    vi.spyOn(Notifications, "choice").mockResolvedValue("Discard All");
    mockGitService.discardAllFiles.mockRejectedValue(new Error("git error"));

    await expect(delegate.discardAllFiles()).rejects.toThrow("git error");
    expect(mockTreeDataProvider.refreshChangesNode).not.toHaveBeenCalled();
  });
});
