import { defineConfig } from "@vscode/test-cli";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import simpleGit from "simple-git";

const fixturePath = path.join(os.tmpdir(), "gops-integration-test-workspace");

/** Initialise a minimal git repo so `GitService` (extension activate) finds a workspace. */
async function prepareWorkspace() {
  await fs.rm(fixturePath, { recursive: true, force: true }).catch(() => {});
  await fs.mkdir(fixturePath, { recursive: true });
  const git = simpleGit(fixturePath);
  await git.init();
  await git.addConfig("user.email", "test@example.com");
  await git.addConfig("user.name", "Test User");
  await fs.writeFile(path.join(fixturePath, "README.md"), "# Test\n");
  await git.add("README.md");
  await git.commit("Initial commit");
}

await prepareWorkspace();

export default defineConfig({
  files: "out/test/integration/**/*.test.js",
  workspaceFolder: fixturePath,
});
