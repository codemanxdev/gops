/// <reference types="vitest" />
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import * as vscode from "vscode";
import { DiffService } from "../../../src/services/DiffService";
import { FileService } from "../../../src/services/FileService";
import { GitService } from "../../../src/services/GitService";
import { DiffRequest } from "../../../src/models/DiffRequest";

vi.mock("vscode", () => ({
  commands: {
    executeCommand: vi.fn(),
  },
  Uri: {
    file: (value: string) => ({ fsPath: value }),
  },
}));

describe("DiffService", () => {
  let fileService: FileService;
  let gitService: GitService;
  let diffService: DiffService;

  beforeEach(() => {
    fileService = { createTempFile: vi.fn() } as unknown as FileService;
    gitService = { getFileContent: vi.fn() } as unknown as GitService;
    diffService = new DiffService(fileService, gitService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens a diff with temporary left content and workspace right file", async () => {
    const request: DiffRequest = {
      left: { repositoryPath: "/repo", fileName: "left.txt" },
      right: { repositoryPath: "/repo", fileName: "right.txt" },
      title: "My Diff",
    };

    (gitService.getFileContent as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      "left content",
    );
    (fileService.createTempFile as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      "/tmp/left.txt",
    );

    await diffService.openDiff(request);

    expect(gitService.getFileContent).toHaveBeenCalledWith("HEAD", "left.txt");
    expect(fileService.createTempFile).toHaveBeenCalledWith("left.txt", "left content");
    expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
      "vscode.diff",
      { fsPath: "/tmp/left.txt" },
      { fsPath: "/repo/right.txt" },
      "My Diff",
    );
  });
});
