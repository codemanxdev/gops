import * as vscode from "vscode";
import * as path from "path";
import { DiffRequest } from "../models/DiffRequest";
import { GitService } from "./GitService";
import { FileService } from "./FileService";

export class DiffService {
  constructor(
    private readonly fileService: FileService,
    private readonly gitService: GitService,
  ) {}

  public async openDiff(request: DiffRequest): Promise<void> {
    const headContent = await this.gitService.getFileContent(
      request.left.ref ?? "HEAD",
      request.left.fileName,
    );

    const tempFile = await this.fileService.createTempFile(
      request.left.fileName,
      headContent,
    );

    const rightUri = vscode.Uri.file(
      path.join(request.right.repositoryPath, request.right.fileName),
    );

    await vscode.commands.executeCommand(
      "vscode.diff",
      vscode.Uri.file(tempFile),
      rightUri,
      request.title,
    );
  }
}
