/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi } from "vitest";
import * as vscode from "vscode";
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

  describe("info", () => {
    it("shows info messages without modal by default", async () => {
      const result = await Notifications.info("info message");
      expect(result).toBe("ok");
      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        "info message",
        { modal: false },
      );
    });

    it("shows info messages with modal when specified", async () => {
      await Notifications.info("info message", true);
      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        "info message",
        { modal: true },
      );
    });
  });

  describe("success", () => {
    it("shows success message with icon", async () => {
      await Notifications.success("Operation successful");
      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        "✓ Operation successful",
        { modal: false },
      );
    });

    it("shows success message with modal when specified", async () => {
      await Notifications.success("Operation successful", true);
      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        "✓ Operation successful",
        { modal: true },
      );
    });
  });

  describe("warning", () => {
    it("shows warning messages without modal by default", async () => {
      const result = await Notifications.warning("warning message");
      expect(result).toBe("warned");
      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
        "warning message",
        { modal: false },
      );
    });

    it("shows warning messages with modal when specified", async () => {
      await Notifications.warning("warning message", true);
      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
        "warning message",
        { modal: true },
      );
    });
  });

  describe("error", () => {
    it("shows error messages without modal by default", async () => {
      await Notifications.error("error message");
      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        "error message",
        { modal: false },
      );
    });

    it("shows error messages with modal when specified", async () => {
      await Notifications.error("error message", true);
      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        "error message",
        { modal: true },
      );
    });
  });

  describe("errorWithOutput", () => {
    it("opens output when the user selects Show Output", async () => {
      const showSpy = vi.spyOn(Logger, "show");

      await Notifications.errorWithOutput("error occurred");

      expect(showSpy).toHaveBeenCalled();
    });

    it("does not open output when the user dismisses the error notification", async () => {
      (vscode.window.showErrorMessage as any).mockResolvedValueOnce(undefined);
      const showSpy = vi.spyOn(Logger, "show");

      await Notifications.errorWithOutput("error occurred");

      expect(showSpy).not.toHaveBeenCalled();
    });

    it("supports modal option", async () => {
      (vscode.window.showErrorMessage as any).mockResolvedValueOnce(undefined);

      await Notifications.errorWithOutput("error occurred", true);

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        "error occurred",
        { modal: true },
        "Show Output",
      );
    });
  });

  describe("choice", () => {
    it("shows choice dialog with buttons and modal true by default", async () => {
      (vscode.window.showWarningMessage as any).mockResolvedValueOnce("Yes");

      const result = await Notifications.choice("Confirm?", ["Yes", "No"]);

      expect(result).toBe("Yes");
      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
        "Confirm?",
        { modal: true },
        "Yes",
        "No",
      );
    });

    it("returns selected button", async () => {
      (vscode.window.showWarningMessage as any).mockResolvedValueOnce("No");

      const result = await Notifications.choice("Choose", [
        "Option A",
        "Option B",
      ]);

      expect(result).toBe("No");
    });
  });
});
