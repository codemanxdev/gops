/// <reference types="node" />
/// <reference types="vitest" />
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { FileService } from "../../../src/services/FileService";

describe("FileService", () => {
  let storagePath: string;
  let fileService: FileService;

  beforeEach(async () => {
    storagePath = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "gops-file-service-"),
    );
    fileService = new FileService(storagePath);
  });

  afterEach(async () => {
    await fs.promises.rm(storagePath, { recursive: true, force: true });
  });

  it("creates a temp file under the storage temp directory", async () => {
    const fileName = "path/to/example.txt";
    const content = "hello world";

    const tempFilePath = await fileService.createTempFile(fileName, content);

    expect(tempFilePath).toContain(path.join(storagePath, "temp"));
    expect(tempFilePath).toContain("example.txt");

    const written = await fs.promises.readFile(tempFilePath, "utf8");
    expect(written).toBe(content);
  });

  it("creates a temp file from a path-like file name", async () => {
    const fileName = "nested\\path/example.txt";
    const content = "nested content";

    const tempFilePath = await fileService.createTempFile(fileName, content);

    expect(tempFilePath).toContain(path.join(storagePath, "temp"));
    expect(tempFilePath).toContain("nested_path_example.txt");

    const written = await fs.promises.readFile(tempFilePath, "utf8");
    expect(written).toBe(content);
  });
});
