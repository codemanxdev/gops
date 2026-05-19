import * as fs from "fs";
import * as path from "path";

export class FileService {
  constructor(private readonly storagePath: string) {}

  public async createTempFile(
    filePath: string,
    content: string,
  ): Promise<string> {
    const tempDir = this.getTempDir();

    await fs.promises.mkdir(tempDir, { recursive: true });

    const safeName = filePath.replace(/[\/\\]/g, "_");

    const tempFilePath = path.join(tempDir, `${Date.now()}_${safeName}`);

    await fs.promises.writeFile(tempFilePath, content, "utf8");

    return tempFilePath;
  }

  private getTempDir(): string {
    return path.join(this.storagePath, "temp");
  }
}
