/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Logger } from "../../../src/logging/Logger";

vi.mock("vscode", () => ({
  window: {
    createOutputChannel: vi.fn(() => ({
      appendLine: vi.fn(),
      show: vi.fn(),
      dispose: vi.fn(),
    })),
  },
}));

describe("Logger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("writes an info message to the output channel", () => {
    const logChannel = (Logger as any).channel;
    const appendSpy = vi.spyOn(logChannel, "appendLine");

    Logger.info("test info");

    expect(appendSpy).toHaveBeenCalledWith("[INFO] test info");
  });

  it("writes a warning and error message to the output channel", () => {
    const logChannel = (Logger as any).channel;
    const appendSpy = vi.spyOn(logChannel, "appendLine");

    Logger.warn("test warn");
    Logger.error("test error");
    Logger.debug("test debug");

    expect(appendSpy).toHaveBeenCalledWith("[WARN] test warn");
    expect(appendSpy).toHaveBeenCalledWith("[ERROR] test error");
    expect(appendSpy).toHaveBeenCalledWith("[DEBUG] test debug");
  });

  it("parses errors, strings, and unknown values", () => {
    expect(Logger.getErrorMessage(new Error("boom"))).toBe("boom");
    expect(Logger.getErrorMessage("boom")).toBe("boom");
    expect(Logger.getErrorMessage({})).toBe("An unknown error occurred.");
  });
});
