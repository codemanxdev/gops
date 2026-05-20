/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Notifications } from "../../../src/notifications/Notifications";
import { Logger } from "../../../src/logging/Logger";

vi.mock("vscode", () => ({
  window: {
    createOutputChannel: vi.fn(() => ({
      appendLine: vi.fn(),
      show: vi.fn(),
      dispose: vi.fn(),
    })),
    showInformationMessage: vi.fn().mockResolvedValue("ok"),
    showWarningMessage: vi.fn().mockResolvedValue("warned"),
    showErrorMessage: vi.fn().mockResolvedValue("Show Output"),
  },
}));

describe("Notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows info messages", async () => {
    const result = await Notifications.info("info message");
    expect(result).toBe("ok");
  });

  it("shows warning messages", async () => {
    const result = await Notifications.warning("warning message");
    expect(result).toBe("warned");
  });

  it("opens output when the user selects Show Output", async () => {
    const showSpy = vi.spyOn(Logger, "show");

    await Notifications.errorWithOutput("error occurred");

    expect(showSpy).toHaveBeenCalled();
  });

  it("does not open output when the user dismisses the error notification", async () => {
    const vscodeMock = await import("vscode");
    (vscodeMock.window.showErrorMessage as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const showSpy = vi.spyOn(Logger, "show");

    await Notifications.errorWithOutput("error occurred");

    expect(showSpy).not.toHaveBeenCalled();
  });
});
