/// <reference types="vitest" />
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { GitService } from "../../../src/services/GitService";
import { Logger } from "../../../src/logging/Logger";
import { Notifications } from "../../../src/notifications/Notifications";

vi.mock("vscode", () => ({
  workspace: {
    workspaceFolders: [
      {
        uri: {
          fsPath: "/workspace/gops",
        },
      },
    ],
  },
  window: {
    createOutputChannel: vi.fn(() => ({
      appendLine: vi.fn(),
      show: vi.fn(),
      dispose: vi.fn(),
    })),
    showInformationMessage: vi.fn(),
    showWarningMessage: vi.fn(),
    showErrorMessage: vi.fn(),
  },
  Uri: {
    file: (value: string) => ({ fsPath: value }),
  },
  commands: {
    executeCommand: vi.fn(),
  },
}));

const mockGit = {
  status: vi.fn(),
  branch: vi.fn(),
  branchLocal: vi.fn(),
  getRemotes: vi.fn(),
  tags: vi.fn(),
  stashList: vi.fn(),
  log: vi.fn(),
  show: vi.fn(),
  checkout: vi.fn(),
  checkoutBranch: vi.fn(),
  push: vi.fn(),
  commit: vi.fn(),
  pull: vi.fn(),
  checkoutLocalBranch: vi.fn(),
  add: vi.fn(),
  reset: vi.fn(),
  deleteLocalBranch: vi.fn(),
  raw: vi.fn(),
};

vi.mock("simple-git", () => ({
  __esModule: true,
  default: vi.fn(() => mockGit),
}));

describe("GitService", () => {
  let service: GitService;

  beforeEach(() => {
    Object.values(mockGit).forEach((fn) => fn.mockReset());
    vi.restoreAllMocks();
    service = new GitService("/workspace/gops");
  });

  it("parses ahead/behind values for local branches", async () => {
    mockGit.branchLocal.mockResolvedValue({
      all: ["main", "feature"],
      current: "main",
      branches: {
        main: { label: "behind 3" },
        feature: { label: "ahead 2" },
      },
    });

    const branches = await service.getLocalBranches();

    expect(branches).toEqual([
      { name: "main", current: true, ahead: 0, behind: 3 },
      { name: "feature", current: false, ahead: 2, behind: 0 },
    ]);
  });

  it("filters remote branches by remote prefix", async () => {
    mockGit.branch.mockResolvedValue({
      all: ["origin/main", "origin/feature", "other/ignore"],
    });

    const branches = await service.getRemoteBranches("origin");

    expect(branches).toEqual([
      { name: "main", remote: "origin" },
      { name: "feature", remote: "origin" },
    ]);
  });

  it("returns repository name and path from workspace folder", () => {
    expect(service.getRepoName()).toBe("gops");
    expect(service.getRepoPath()).toBe("/workspace/gops");
  });

  it("logs and notifies on successful checkout", async () => {
    mockGit.checkout.mockResolvedValue("ok");
    const infoSpy = vi.spyOn(Logger, "info");
    const notifySpy = vi.spyOn(Notifications, "info");

    const result = await service.checkout("feature");

    expect(result).toBe("ok");
    expect(infoSpy).toHaveBeenCalledWith(
      "Checked out branch feature successfully",
    );
    expect(notifySpy).toHaveBeenCalledWith(
      "Checked out branch feature successfully",
    );
  });

  it("returns git status from the repository", async () => {
    const statusResult = { isClean: true } as const;
    mockGit.status.mockResolvedValue(statusResult);

    expect(await service.getStatus()).toBe(statusResult);
    expect(mockGit.status).toHaveBeenCalled();
  });

  it("returns branch summary from branch call", async () => {
    const branchSummary = { current: "main", all: ["main"] } as const;
    mockGit.branch.mockResolvedValue(branchSummary);

    expect(await service.getBranches()).toBe(branchSummary);
    expect(mockGit.branch).toHaveBeenCalled();
  });

  it("returns configured remotes", async () => {
    const remotes = [{ name: "origin", refs: {} }];
    mockGit.getRemotes.mockResolvedValue(remotes as any);

    expect(await service.getRemotes()).toBe(remotes);
  });

  it("returns all tags", async () => {
    mockGit.tags.mockResolvedValue({ all: ["v1.0.0", "v1.1.0"] });

    expect(await service.getTags()).toEqual(["v1.0.0", "v1.1.0"]);
  });

  it("returns stash messages from stash list", async () => {
    mockGit.stashList.mockResolvedValue({ all: [{ message: "WIP" }] } as any);

    expect(await service.getStash()).toEqual(["WIP"]);
  });

  it("returns commit log entries", async () => {
    const logEntries = [{ hash: "abc" }] as any;
    mockGit.log.mockResolvedValue({ all: logEntries });

    expect(await service.getLog()).toBe(logEntries);
  });

  it("returns file content from a git ref", async () => {
    mockGit.show.mockResolvedValue("file contents");

    expect(await service.getFileContent("HEAD", "README.md")).toBe(
      "file contents",
    );
    expect(mockGit.show).toHaveBeenCalledWith(["HEAD:README.md"]);
  });

  it("returns the current branch name", async () => {
    mockGit.branch.mockResolvedValue({ current: "develop" });

    expect(await service.getCurrentBranch()).toBe("develop");
  });

  it("logs and notifies on successful push", async () => {
    mockGit.push.mockResolvedValue("ok");
    const infoSpy = vi.spyOn(Logger, "info");
    const notifySpy = vi.spyOn(Notifications, "info");

    const result = await service.push();

    expect(result).toBe("ok");
    expect(infoSpy).toHaveBeenCalledWith("Pushed to remote successfully");
    expect(notifySpy).toHaveBeenCalledWith("Pushed to remote successfully");
  });

  it("logs and notifies on successful commit", async () => {
    mockGit.status.mockResolvedValue({ staged: [], files: [] });
    mockGit.commit.mockResolvedValue("commit-ok");
    const infoSpy = vi.spyOn(Logger, "info");
    const notifySpy = vi.spyOn(Notifications, "info");

    const result = await service.commit("message");

    expect(result).toBe("commit-ok");
    expect(mockGit.commit).toHaveBeenCalledWith("message", []);
    expect(infoSpy).toHaveBeenCalledWith("Commit successful");
    expect(notifySpy).toHaveBeenCalledWith("Commit successful");
  });

  it("logs and notifies on successful pull", async () => {
    mockGit.pull.mockResolvedValue("ok");
    const infoSpy = vi.spyOn(Logger, "info");
    const notifySpy = vi.spyOn(Notifications, "info");

    const result = await service.pull();

    expect(result).toBe("ok");
    expect(infoSpy).toHaveBeenCalledWith("Pull successful");
    expect(notifySpy).toHaveBeenCalledWith("Pull successful");
  });

  it("logs and notifies on successful checkoutBranch", async () => {
    mockGit.checkoutBranch.mockResolvedValue("ok");
    const infoSpy = vi.spyOn(Logger, "info");
    const notifySpy = vi.spyOn(Notifications, "info");

    const result = await service.checkoutBranch("feature", "main");

    expect(result).toBe("ok");
    expect(infoSpy).toHaveBeenCalledWith(
      "Checked out branch feature successfully",
    );
    expect(notifySpy).toHaveBeenCalledWith(
      "Checked out branch feature successfully",
    );
  });

  it("logs and notifies on successful checkoutLocalBranch", async () => {
    mockGit.checkoutLocalBranch.mockResolvedValue("ok");
    const infoSpy = vi.spyOn(Logger, "info");
    const notifySpy = vi.spyOn(Notifications, "info");

    const result = await service.checkoutLocalBranch("feature");

    expect(result).toBe("ok");
    expect(infoSpy).toHaveBeenCalledWith("Branch feature created successfully");
    expect(notifySpy).toHaveBeenCalledWith(
      "Branch feature created successfully",
    );
  });

  it("logs error and rethrows when checkout fails", async () => {
    const error = new Error("checkout failed");
    mockGit.checkout.mockRejectedValue(error);
    const errorSpy = vi.spyOn(Logger, "error");
    const notifySpy = vi.spyOn(Notifications, "errorWithOutput");

    await expect(service.checkout("feature")).rejects.toThrow(error);
    expect(errorSpy).toHaveBeenCalledWith(
      "Checkout failed for branch feature: checkout failed",
    );
    expect(notifySpy).toHaveBeenCalledWith(
      "Checkout failed for branch feature. See details in output",
    );
  });

  it("logs and notifies on successful stageFile", async () => {
    mockGit.add.mockResolvedValue("ok");
    const infoSpy = vi.spyOn(Logger, "info");
    const notifySpy = vi.spyOn(Notifications, "info");

    await service.stageFile("src/file.ts");

    expect(mockGit.add).toHaveBeenCalledWith("src/file.ts");
    expect(infoSpy).toHaveBeenCalledWith(
      "Staged file src/file.ts successfully",
    );
    expect(notifySpy).toHaveBeenCalledWith(
      "Staged file src/file.ts successfully",
    );
  });

  it("logs error and rethrows when stageFile fails", async () => {
    const error = new Error("stage failed");
    mockGit.add.mockRejectedValue(error);
    const errorSpy = vi.spyOn(Logger, "error");
    const notifySpy = vi.spyOn(Notifications, "errorWithOutput");

    await expect(service.stageFile("src/file.ts")).rejects.toThrow(error);
    expect(errorSpy).toHaveBeenCalledWith(
      "Failed to stage file src/file.ts: stage failed",
    );
    expect(notifySpy).toHaveBeenCalledWith(
      "Failed to stage file src/file.ts. See details in output",
    );
  });

  it("logs and notifies on successful unstageFile", async () => {
    mockGit.reset.mockResolvedValue("ok");
    const infoSpy = vi.spyOn(Logger, "info");
    const notifySpy = vi.spyOn(Notifications, "info");

    await service.unstageFile("src/file.ts");

    expect(mockGit.reset).toHaveBeenCalledWith(["HEAD", "src/file.ts"]);
    expect(infoSpy).toHaveBeenCalledWith(
      "Unstaged file src/file.ts successfully",
    );
    expect(notifySpy).toHaveBeenCalledWith(
      "Unstaged file src/file.ts successfully",
    );
  });

  it("logs error and rethrows when unstageFile fails", async () => {
    const error = new Error("unstage failed");
    mockGit.reset.mockRejectedValue(error);
    const errorSpy = vi.spyOn(Logger, "error");
    const notifySpy = vi.spyOn(Notifications, "errorWithOutput");

    await expect(service.unstageFile("src/file.ts")).rejects.toThrow(error);
    expect(errorSpy).toHaveBeenCalledWith(
      "Failed to unstage file src/file.ts: unstage failed",
    );
    expect(notifySpy).toHaveBeenCalledWith(
      "Failed to unstage file src/file.ts. See details in output",
    );
  });

  it("logs and notifies on successful unstageAllFiles", async () => {
    mockGit.reset.mockResolvedValue("ok");
    const infoSpy = vi.spyOn(Logger, "info");
    const notifySpy = vi.spyOn(Notifications, "info");

    await service.unstageAllFiles();

    expect(mockGit.reset).toHaveBeenCalledWith(["HEAD"]);
    expect(infoSpy).toHaveBeenCalledWith("Unstaged all files successfully");
    expect(notifySpy).toHaveBeenCalledWith("Unstaged all files successfully");
  });

  it("logs error and rethrows when unstageAllFiles fails", async () => {
    const error = new Error("unstage all failed");
    mockGit.reset.mockRejectedValue(error);
    const errorSpy = vi.spyOn(Logger, "error");
    const notifySpy = vi.spyOn(Notifications, "errorWithOutput");

    await expect(service.unstageAllFiles()).rejects.toThrow(error);
    expect(errorSpy).toHaveBeenCalledWith(
      "Failed to unstage all files: unstage all failed",
    );
    expect(notifySpy).toHaveBeenCalledWith(
      "Failed to unstage all files. See details in output",
    );
  });

  it("returns only unstaged changed files", async () => {
    mockGit.status.mockResolvedValue({
      files: [
        { path: "src/modified.ts", index: " ", working_dir: "M" },
        { path: "src/staged.ts", index: "M", working_dir: " " },
        { path: "src/untracked.ts", index: "?", working_dir: "?" },
      ],
    });

    const result = await service.getChangedFiles();

    expect(result).toEqual(["src/modified.ts"]);
  });

  it("returns empty array when no unstaged files", async () => {
    mockGit.status.mockResolvedValue({
      files: [{ path: "src/staged.ts", index: "M", working_dir: " " }],
    });

    const result = await service.getChangedFiles();

    expect(result).toEqual([]);
  });

  it("returns only staged files", async () => {
    mockGit.status.mockResolvedValue({
      files: [
        { path: "src/modified.ts", index: " ", working_dir: "M" },
        { path: "src/staged.ts", index: "M", working_dir: " " },
        { path: "src/untracked.ts", index: "?", working_dir: "?" },
      ],
    });

    const result = await service.getStagedFiles();

    expect(result).toEqual(["src/staged.ts"]);
  });

  it("returns empty array when no staged files", async () => {
    mockGit.status.mockResolvedValue({
      files: [{ path: "src/modified.ts", index: " ", working_dir: "M" }],
    });

    const result = await service.getStagedFiles();

    expect(result).toEqual([]);
  });

  it("logs and notifies on successful stageAllFiles", async () => {
    mockGit.add.mockResolvedValue("ok");
    const infoSpy = vi.spyOn(Logger, "info");
    const notifySpy = vi.spyOn(Notifications, "info");

    await service.stageAllFiles();

    expect(mockGit.add).toHaveBeenCalledWith(".");
    expect(infoSpy).toHaveBeenCalledWith("Staged all files successfully");
    expect(notifySpy).toHaveBeenCalledWith("Staged all files successfully");
  });

  it("logs error and rethrows when stageAllFiles fails", async () => {
    const error = new Error("stage all failed");
    mockGit.add.mockRejectedValue(error);
    const errorSpy = vi.spyOn(Logger, "error");
    const notifySpy = vi.spyOn(Notifications, "errorWithOutput");

    await expect(service.stageAllFiles()).rejects.toThrow(error);
    expect(errorSpy).toHaveBeenCalledWith(
      "Failed to stage all files: stage all failed",
    );
    expect(notifySpy).toHaveBeenCalledWith(
      "Failed to stage all files. See details in output",
    );
  });

  it("logs and notifies on successful deleteBranch", async () => {
    mockGit.deleteLocalBranch.mockResolvedValue("ok");
    const infoSpy = vi.spyOn(Logger, "info");
    const notifySpy = vi.spyOn(Notifications, "info");

    await service.deleteBranch("feature/my-branch");

    expect(mockGit.deleteLocalBranch).toHaveBeenCalledWith("feature/my-branch");
    expect(infoSpy).toHaveBeenCalledWith(
      "Branch feature/my-branch deleted successfully",
    );
    expect(notifySpy).toHaveBeenCalledWith(
      "Branch feature/my-branch deleted successfully",
    );
  });

  it("logs error and rethrows when deleteBranch fails", async () => {
    const error = new Error("delete failed");
    mockGit.deleteLocalBranch.mockRejectedValue(error);
    const errorSpy = vi.spyOn(Logger, "error");
    const notifySpy = vi.spyOn(Notifications, "errorWithOutput");

    await expect(service.deleteBranch("feature/my-branch")).rejects.toThrow(
      error,
    );
    expect(errorSpy).toHaveBeenCalledWith(
      "Failed to delete branch feature/my-branch: delete failed",
    );
    expect(notifySpy).toHaveBeenCalledWith(
      "Failed to delete branch feature/my-branch. See details in output",
    );
  });

  it("logs and notifies on successful renameBranch", async () => {
    mockGit.raw.mockResolvedValue("ok");
    const infoSpy = vi.spyOn(Logger, "info");
    const notifySpy = vi.spyOn(Notifications, "info");

    await service.renameBranch("old-branch", "new-branch");

    expect(mockGit.raw).toHaveBeenCalledWith([
      "branch",
      "-m",
      "old-branch",
      "new-branch",
    ]);
    expect(infoSpy).toHaveBeenCalledWith(
      "Branch renamed to new-branch successfully",
    );
    expect(notifySpy).toHaveBeenCalledWith(
      "Branch renamed to new-branch successfully",
    );
  });

  it("logs error and rethrows when renameBranch fails", async () => {
    const error = new Error("rename failed");
    mockGit.raw.mockRejectedValue(error);
    const errorSpy = vi.spyOn(Logger, "error");
    const notifySpy = vi.spyOn(Notifications, "errorWithOutput");

    await expect(
      service.renameBranch("old-branch", "new-branch"),
    ).rejects.toThrow(error);
    expect(errorSpy).toHaveBeenCalledWith(
      "Failed to rename branch old-branch: rename failed",
    );
    expect(notifySpy).toHaveBeenCalledWith(
      "Failed to rename branch old-branch. See details in output",
    );
  });
});
