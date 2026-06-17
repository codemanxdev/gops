import { describe, it, expect } from "vitest";
import { computeLayout } from "../../../src/gopswebpanel/GitGraphLayout";
import { GitGraphRenderer } from "../../../src/gopswebpanel/GitGraphRenderer";
import { GitCommitModel } from "../../../src/models/GitCommitModel";

const commit = (hash: string, parents: string[] = []): GitCommitModel =>
  new GitCommitModel(hash, "", "", "", false, "", parents);

describe("computeLayout", () => {
  it("returns a layout map with correct structure", () => {
    const commits = [commit("a")];
    const layout = computeLayout(commits);

    expect(layout.size).toBe(1);
    const aLayout = layout.get("a");
    expect(aLayout).toBeDefined();
    expect(aLayout?.lane).toBe(0);
    expect(aLayout?.outgoingEdges).toEqual([]);
    expect(aLayout?.passThroughs).toBeDefined();
  });

  it("handles root commit with no parents", () => {
    const commits = [commit("root")];
    const layout = computeLayout(commits);

    const rootLayout = layout.get("root");
    expect(rootLayout?.lane).toBe(0);
    expect(rootLayout?.outgoingEdges).toEqual([]);
  });

  it("assigns colors based on lane index", () => {
    const commits = [commit("a"), commit("b", ["a"]), commit("c", ["a"])];
    const layout = computeLayout(commits);

    const bLayout = layout.get("b");
    const cLayout = layout.get("c");
    expect(bLayout?.color).toBeDefined();
    expect(cLayout?.color).toBeDefined();
  });

  it("marks pass-throughs for lanes that continue in linear history", () => {
    const commits = [commit("a"), commit("b", ["a"]), commit("c", ["b"])];
    const layout = computeLayout(commits);

    const bLayout = layout.get("b");
    expect(bLayout?.passThroughs).toBeDefined();
  });

  it("lanes are non-negative integers", () => {
    const commits = [
      commit("a"),
      commit("b", ["a"]),
      commit("c", ["a"]),
      commit("d", ["a"]),
      commit("e", ["b", "c", "d"]),
    ];
    const layout = computeLayout(commits);

    for (const [, cl] of layout) {
      expect(cl.lane).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(cl.lane)).toBe(true);
    }
  });

  it("first commit is always on lane 0", () => {
    const commits = [
      commit("a"),
      commit("b", ["a"]),
      commit("c", ["b"]),
      commit("d", ["c"]),
    ];
    const layout = computeLayout(commits);

    expect(layout.get("a")?.lane).toBe(0);
  });


  it("every edge points to a valid parent hash", () => {
    const commits = [
      commit("a"),
      commit("b", ["a"]),
      commit("c", ["b"]),
      commit("d", ["c"]),
      commit("e", ["d"]),
      commit("f", ["e"]),
      commit("g", ["f"]),
      commit("h", ["g"]),
    ];
    const layout = computeLayout(commits);

    for (const [, cl] of layout) {
      for (const edge of cl.outgoingEdges) {
        expect(commits.some((c) => c.hash === edge.toHash)).toBe(true);
      }
    }
  });

  it("pass-through lanes have valid structure", () => {
    const commits = [commit("a"), commit("b", ["a"]), commit("c", ["b"])];
    const layout = computeLayout(commits);

    const cLayout = layout.get("c");
    if (cLayout && cLayout.passThroughs.length > 0) {
      for (const pt of cLayout.passThroughs) {
        expect(pt.lane).toBeGreaterThanOrEqual(0);
        expect(pt.color).toBeDefined();
      }
    }
  });

  it("renderer generates valid SVG for layout", () => {
    const commits = [commit("a"), commit("b", ["a"])];
    const layout = computeLayout(commits);

    const svg = GitGraphRenderer.drawGraphCell(
      layout.get("b")!,
      60,
      false,
    );

    expect(svg).toContain("<svg");
    expect(svg).toContain("<path");
    expect(svg).toContain("stroke=");
  });

  it("renderer handles merge commit cells", () => {
    const commits = [
      commit("a"),
      commit("b", ["a"]),
      commit("c", ["a"]),
      commit("m", ["b", "c"]),
    ];
    const layout = computeLayout(commits);
    const svg = GitGraphRenderer.drawGraphCell(
      layout.get("m")!,
      80,
      false,
    );

    expect(svg).toContain("<svg");
    expect(svg).toContain("<circle");
  });

  it("handles disconnected commits gracefully", () => {
    const commits = [commit("a"), commit("b")];
    const layout = computeLayout(commits);

    expect(layout.size).toBe(2);
    expect(layout.get("a")?.lane).toBe(0);
    expect(layout.get("b")?.lane).toBeGreaterThanOrEqual(0);
  });
});
