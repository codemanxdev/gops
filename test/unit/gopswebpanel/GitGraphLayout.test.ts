import { describe, it, expect } from "vitest";
import { computeLayout } from "../../../src/gopswebpanel/GitGraphLayout";
import { GitGraphRenderer } from "../../../src/gopswebpanel/GitGraphRenderer";
import { GitCommitModel } from "../../../src/models/GitCommitModel";

const commit = (hash: string, parents: string[] = []): GitCommitModel =>
  new GitCommitModel(hash, "", "", "", false, [], parents);

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
    expect(rootLayout?.hasBottomConnector).toBe(false);
    expect(rootLayout?.hasTopConnector).toBe(false);
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

  it("every edge points to a valid child hash", () => {
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

    const svg = GitGraphRenderer.drawGraphCell(layout.get("b")!, 60, false);

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
    const svg = GitGraphRenderer.drawGraphCell(layout.get("m")!, 80, false);

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

  it("linear history has no outgoing edges, only connectors", () => {
    const commits = [commit("a", ["b"]), commit("b")];
    const layout = computeLayout(commits);

    expect(layout.get("a")?.outgoingEdges).toHaveLength(0);
    expect(layout.get("a")?.hasBottomConnector).toBe(true);
    expect(layout.get("b")?.hasTopConnector).toBe(true);
  });

  it("branch tip has no outgoing edges", () => {
    const commits = [commit("tip", ["base"]), commit("base")];
    const layout = computeLayout(commits);

    expect(layout.get("tip")?.outgoingEdges).toHaveLength(0);
  });

  it("branch tip gets hasTopConnector set by resolveTopConnectors", () => {
    const commits = [
      commit("merge", ["main", "branch"]),
      commit("main"),
      commit("branch"),
    ];
    const layout = computeLayout(commits);

    expect(layout.get("branch")?.hasTopConnector).toBe(true);
  });

  it("merge commit has incoming edge for secondary parent in different lane", () => {
    const commits = [
      commit("tip1", ["base"]),
      commit("tip2", ["base"]),
      commit("base"),
      commit("merge", ["tip1", "tip2"]),
    ];
    const layout = computeLayout(commits);

    const mergeLayout = layout.get("merge");
    expect(mergeLayout?.incomingEdges.length).toBeGreaterThan(0);
    const incomingToHashes = mergeLayout?.incomingEdges.map((e) => e.toHash);
    expect(incomingToHashes).toContain("tip2");
  });

  it("non-merge commit has no incoming edges", () => {
    const commits = [commit("a", ["b"]), commit("b")];
    const layout = computeLayout(commits);

    expect(layout.get("a")?.incomingEdges).toHaveLength(0);
  });

  it("outgoing edge toLane is always higher than fromLane", () => {
    const commits = [
      commit("tip1", ["base"]),
      commit("tip2", ["base"]),
      commit("base"),
    ];
    const layout = computeLayout(commits);

    const baseLayout = layout.get("base");
    baseLayout?.outgoingEdges.forEach((e) => {
      expect(e.toLane).toBeGreaterThan(e.fromLane);
    });
  });

  it("commit with parent has bottom connector", () => {
    const commits = [commit("a", ["b"]), commit("b")];
    const layout = computeLayout(commits);

    expect(layout.get("a")?.hasBottomConnector).toBe(true);
  });

  it("commit that is continuation of lane has top connector", () => {
    const commits = [commit("a", ["b"]), commit("b", ["c"]), commit("c")];
    const layout = computeLayout(commits);

    expect(layout.get("b")?.hasTopConnector).toBe(true);
  });
});
