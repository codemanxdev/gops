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
    createOutputChannel: vi.fn(() => ({ appendLine: vi.fn(), show: vi.fn(), dispose: vi.fn() })),
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
    expect(infoSpy).toHaveBeenCalledWith("Checked out branch feature successfully");
    expect(notifySpy).toHaveBeenCalledWith("Checked out branch feature successfully");
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

    expect(await service.getFileContent("HEAD", "README.md")).toBe("file contents");
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
    mockGit.commit.mockResolvedValue("commit-ok");
    const infoSpy = vi.spyOn(Logger, "info");
    const notifySpy = vi.spyOn(Notifications, "info");

    const result = await service.commit("message");

    expect(result).toBe("commit-ok");
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

    const result = await service.checkoutBranch("feature","main");

    expect(result).toBe("ok");
    expect(infoSpy).toHaveBeenCalledWith("Checked out branch feature successfully");
    expect(notifySpy).toHaveBeenCalledWith("Checked out branch feature successfully");
  });

  it("logs and notifies on successful checkoutLocalBranch", async () => {
    mockGit.checkoutLocalBranch.mockResolvedValue("ok");
    const infoSpy = vi.spyOn(Logger, "info");
    const notifySpy = vi.spyOn(Notifications, "info");

    const result = await service.checkoutLocalBranch("feature");

    expect(result).toBe("ok");
    expect(infoSpy).toHaveBeenCalledWith("Branch feature created successfully");
    expect(notifySpy).toHaveBeenCalledWith("Branch feature created successfully");
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
});
