/// <reference types="vitest" />
import { describe, it, expect, beforeEach } from "vitest";
import { renderDetailPanel } from "../../../src/gopswebpanel/GitGraphDetailsPanel";

describe("renderDetailPanel", () => {
  let html: string;

  beforeEach(() => {
    html = renderDetailPanel();
  });

  it("returns a string", () => {
    expect(typeof html).toBe("string");
  });

  it("renders the detail panel with hidden display style", () => {
    expect(html).toContain('id="detail-panel"');
    expect(html).toContain('style="display:none;"');
  });

  it("renders the detail header", () => {
    expect(html).toContain('id="detail-header"');
    expect(html).toContain('id="detail-header-meta"');
  });

  it("renders the hash and message spans", () => {
    expect(html).toContain('id="detail-hash"');
    expect(html).toContain('id="detail-message"');
  });

  it("renders the close button", () => {
    expect(html).toContain('id="detail-close"');
    expect(html).toContain("✕");
  });

  it("renders the sidebar", () => {
    expect(html).toContain('id="detail-sidebar"');
  });

  it("renders the Create Tag button", () => {
    expect(html).toContain('id="detail-action-tag"');
    expect(html).toContain("Create Tag");
  });

  it("renders the Checkout button", () => {
    expect(html).toContain('id="detail-action-checkout"');
    expect(html).toContain("Checkout");
  });

  it("renders the Copy Hash button", () => {
    expect(html).toContain('id="detail-action-copy-hash"');
    expect(html).toContain("Copy Hash");
  });

  it("renders the Cherry Pick button", () => {
    expect(html).toContain('id="detail-action-cherry-pick"');
    expect(html).toContain("Cherry Pick");
  });

  it("renders the detail main section", () => {
    expect(html).toContain('id="detail-main"');
  });

  it("renders the loading indicator hidden by default", () => {
    expect(html).toContain('id="detail-loading"');
    expect(html).toContain("Loading diff…");
  });

  it("renders the detail content hidden by default", () => {
    expect(html).toContain('id="detail-content"');
    expect(html).toContain('id="detail-diff"');
  });

  it("renders the Create Tag button with primary class", () => {
    expect(html).toContain('class="detail-action-btn primary"');
  });

  it("renders secondary action buttons with correct class", () => {
    const secondaryCount = (html.match(/class="detail-action-btn"/g) ?? [])
      .length;
    expect(secondaryCount).toBe(3);
  });
});
