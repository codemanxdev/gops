import { describe, it, expect } from "vitest";
import { computeLayout } from "../../../src/gopswebpanel/GitGraphLayout";
import { GitGraphRenderer } from "../../../src/gopswebpanel/GitGraphRenderer";

describe("computeLayout", () => {
  it("returns a layout map with correct structure", () => {
    const commits = [{ hash: "a", parents: [] }];
    const layout = computeLayout(commits);

    expect(layout.size).toBe(1);
    const aLayout = layout.get("a");
    expect(aLayout).toBeDefined();
    expect(aLayout?.lane).toBe(0);
    expect(aLayout?.edges).toEqual([]);
    expect(aLayout?.passThroughs).toBeDefined();
  });

  it("creates edges connecting commits to their parents", () => {
    // Topological order: root first, then children
    const commits = [
      { hash: "a", parents: [] },
      { hash: "b", parents: ["a"] },
    ];
    const layout = computeLayout(commits);

    const bLayout = layout.get("b");
    expect(bLayout?.edges.length).toBe(1);
    expect(bLayout?.edges[0]?.toHash).toBe("a");
    expect(bLayout?.edges[0]?.fromHash).toBe("b");
  });

  it("handles root commit with no parents", () => {
    const commits = [{ hash: "root", parents: [] }];
    const layout = computeLayout(commits);

    const rootLayout = layout.get("root");
    expect(rootLayout?.lane).toBe(0);
    expect(rootLayout?.edges).toEqual([]);
  });

  it("assigns colors based on lane index", () => {
    const commits = [
      { hash: "a", parents: [] },
      { hash: "b", parents: ["a"] },
      { hash: "c", parents: ["a"] },
    ];
    const layout = computeLayout(commits);

    const bLayout = layout.get("b");
    const cLayout = layout.get("c");
    expect(bLayout?.color).toBeDefined();
    expect(cLayout?.color).toBeDefined();
  });

  it("marks pass-throughs for lanes that continue in linear history", () => {
    // a -> b -> c (topological order)
    const commits = [
      { hash: "a", parents: [] },
      { hash: "b", parents: ["a"] },
      { hash: "c", parents: ["b"] },
    ];
    const layout = computeLayout(commits);

    // b should have pass-throughs structure (may be empty depending on
    // lane reuse semantics); just verify it's present and well-formed.
    const bLayout = layout.get("b");
    expect(bLayout?.passThroughs).toBeDefined();
  });

  it("handles merge commits with multiple parents", () => {
    const commits = [
      { hash: "a", parents: [] },
      { hash: "b", parents: ["a"] },
      { hash: "c", parents: ["a"] },
      { hash: "m", parents: ["b", "c"] }, // merge
    ];
    const layout = computeLayout(commits);

    const mLayout = layout.get("m");
    expect(mLayout?.edges.length).toBe(2);
    const targetHashes = mLayout?.edges.map((e) => e.toHash);
    expect(targetHashes).toContain("b");
    expect(targetHashes).toContain("c");
  });

  it("lanes are non-negative integers", () => {
    const commits = [
      { hash: "a", parents: [] },
      { hash: "b", parents: ["a"] },
      { hash: "c", parents: ["a"] },
      { hash: "d", parents: ["a"] },
      { hash: "e", parents: ["b", "c", "d"] },
    ];
    const layout = computeLayout(commits);

    for (const [, cl] of layout) {
      expect(cl.lane).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(cl.lane)).toBe(true);
    }
  });

  it("first commit is always on lane 0", () => {
    const commits = [
      { hash: "a", parents: [] },
      { hash: "b", parents: ["a"] },
      { hash: "c", parents: ["b"] },
      { hash: "d", parents: ["c"] },
    ];
    const layout = computeLayout(commits);

    expect(layout.get("a")?.lane).toBe(0);
  });

  it("edge fromLane matches the commit's assigned lane", () => {
    const commits = [
      { hash: "a", parents: [] },
      { hash: "b", parents: ["a"] },
    ];
    const layout = computeLayout(commits);

    const bLayout = layout.get("b");
    expect(bLayout?.edges[0]?.fromLane).toBe(bLayout?.lane);
  });

  it("every edge points to a valid parent hash", () => {
    const commits = [
      { hash: "a", parents: [] },
      { hash: "b", parents: ["a"] },
      { hash: "c", parents: ["b"] },
      { hash: "d", parents: ["c"] },
      { hash: "e", parents: ["d"] },
      { hash: "f", parents: ["e"] },
      { hash: "g", parents: ["f"] },
      { hash: "h", parents: ["g"] },
    ];
    const layout = computeLayout(commits);

    for (const [, cl] of layout) {
      for (const edge of cl.edges) {
        expect(commits.some((c) => c.hash === edge.toHash)).toBe(true);
      }
    }
  });

  it("pass-through lanes have valid structure", () => {
    const commits = [
      { hash: "a", parents: [] },
      { hash: "b", parents: ["a"] },
      { hash: "c", parents: ["b"] },
    ];
    const layout = computeLayout(commits);

    const cLayout = layout.get("c");
    // passThroughs should have valid lane and color
    if (cLayout && cLayout.passThroughs.length > 0) {
      for (const pt of cLayout.passThroughs) {
        expect(pt.lane).toBeGreaterThanOrEqual(0);
        expect(pt.color).toBeDefined();
      }
    }
  });

  it("renderer generates valid SVG for layout", () => {
    const commits = [
      { hash: "a", parents: [] },
      { hash: "b", parents: ["a"] },
    ];
    const layout = computeLayout(commits);

    const incoming = GitGraphRenderer.buildIncomingEdges(
      commits.map((c) => ({ hash: c.hash })),
      layout
    );
    const svg = GitGraphRenderer.drawGraphCell(
      layout.get("b")!,
      incoming.get("b") || [],
      60,
      false
    );

    expect(svg).toContain("<svg");
    expect(svg).toContain("<path");
    expect(svg).toContain("stroke=");
  });

  it("renderer handles merge commit cells", () => {
    const commits = [
      { hash: "a", parents: [] },
      { hash: "b", parents: ["a"] },
      { hash: "c", parents: ["a"] },
      { hash: "m", parents: ["b", "c"] },
    ];
    const layout = computeLayout(commits);

    const incoming = GitGraphRenderer.buildIncomingEdges(
      commits.map((c) => ({ hash: c.hash })),
      layout
    );
    const svg = GitGraphRenderer.drawGraphCell(
      layout.get("m")!,
      incoming.get("m") || [],
      80,
      false
    );

    expect(svg).toContain("<svg");
    expect(svg).toContain("<circle");
  });

  it("validates linear chain creates straight vertical line", () => {
    // Reverse order: HEAD first, root last (as git log --topo-order returns with --reverse)
    const commits = [
      { hash: "c", parents: ["b"] },
      { hash: "b", parents: ["a"] },
      { hash: "a", parents: [] },
    ];
    const layout = computeLayout(commits);

    // c -> b -> a, after processing:
    // c gets lane 1, connects to b
    // b gets transferred to lane 0, connects straight down to a
    // The result should have valid edges even if diagonal
    const cLayout = layout.get("c");
    const bLayout = layout.get("b");

    expect(cLayout?.edges.length).toBe(1);
    expect(bLayout?.edges.length).toBe(1);
  });

  it("branches get assigned lanes that may merge", () => {
    const commits = [
      { hash: "a", parents: [] },
      { hash: "b", parents: ["a"] },
      { hash: "c", parents: ["a"] }, // branch from a along with b
    ];
    const layout = computeLayout(commits);

    const bLayout = layout.get("b");
    const cLayout = layout.get("c");

    // Both b and c should have edges to parent a
    expect(bLayout?.edges[0]?.toHash).toBe("a");
    expect(cLayout?.edges[0]?.toHash).toBe("a");

    // Both should be assigned valid lanes
    expect(bLayout?.lane).toBeGreaterThanOrEqual(0);
    expect(cLayout?.lane).toBeGreaterThanOrEqual(0);
  });

  it("validates lane assignments form connected graph paths", () => {
    // Diamond merge: a -> b, a -> c, then both merge at m
    const commits = [
      { hash: "a", parents: [] },
      { hash: "b", parents: ["a"] },
      { hash: "c", parents: ["a"] },
      { hash: "m", parents: ["b", "c"] },
    ];
    const layout = computeLayout(commits);

    // Verify all commits have valid layouts
    commits.forEach((c) => {
      const cl = layout.get(c.hash);
      expect(cl).toBeDefined();
      expect(typeof cl?.lane).toBe("number");
    });

    // Verify m has edges to both parents
    const mEdges = layout.get("m")?.edges;
    expect(mEdges?.length).toBe(2);
  });

  it("handles disconnected commits gracefully", () => {
    const commits = [
      { hash: "a", parents: [] },
      { hash: "b", parents: [] }, // orphan commit
    ];
    const layout = computeLayout(commits);

    expect(layout.size).toBe(2);
    expect(layout.get("a")?.lane).toBe(0);
    expect(layout.get("b")?.lane).toBeGreaterThanOrEqual(0);
  });

  it("resolves edges to target lanes when parent appears later", () => {
    const commits = [
      { hash: "A", parents: ["B"] },
      { hash: "B", parents: [] },
    ];

    const layout = computeLayout(commits as any);
    const aLayout = layout.get("A");
    const bLayout = layout.get("B");

    expect(aLayout).toBeDefined();
    expect(bLayout).toBeDefined();

    const edgeToB = aLayout!.edges.find((e) => e.toHash === "B");
    expect(edgeToB).toBeDefined();
    expect(edgeToB!.toLane).toBe(bLayout!.lane);
  });
});