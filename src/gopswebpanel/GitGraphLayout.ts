import { Edge } from "../models/Edge";
import { PassThrough } from "../models/Passthrough";
import { CommitLayout } from "../models/CommitLayout";

const LANE_COLORS = [
  "#569cd6", // blue
  "#c586c0", // purple
  "#6a9955", // green
  "#f0883e", // orange
  "#4ec9b0", // teal
  "#ce9178", // brown
  "#dcdcaa", // yellow
  "#9cdcfe", // light blue
];

const getColor = (lane: number) => LANE_COLORS[lane % LANE_COLORS.length];

export function computeLayout(
  commits: { hash: string; parents: string[] }[],
): Map<string, CommitLayout> {
  const layout = new Map<string, CommitLayout>();

  const hashToIndex = new Map<string, number>();
  commits.forEach((c, i) => hashToIndex.set(c.hash, i));

  const lanes: (string | null)[] = [];

  const occupyLane = (hash: string): number => {
    const existing = lanes.indexOf(hash);
    if (existing !== -1) {
      console.log("REUSE EXISTING", hash, "lane", existing);
      return existing;
    }

    const free = lanes.indexOf(null);
    if (free !== -1) {
      console.log("OCCUPY FREE", hash, "lane", free);
      lanes[free] = hash;
      return free;
    }

    lanes.push(hash);
    console.log("NEW LANE", hash, "lane", lanes.length - 1);
    return lanes.length - 1;
  };

  const releaseLane = (hash: string) => {
    const idx = lanes.indexOf(hash);
    if (idx !== -1) {
      console.log("RELEASE", hash, "lane", idx);
      lanes[idx] = null;
    }
  };

  const transferLane = (from: string, to: string) => {
    const idx = lanes.indexOf(from);
    if (idx !== -1) {
      lanes[idx] = to;
    }
  };

  // First pass — compute layouts
  const rawLayouts: {
    hash: string;
    lane: number;
    color: string;
    edges: Edge[];
    lanesSnapshot: (string | null)[];
  }[] = [];

  for (let i = 0; i < commits.length; i++) {
    const commit = commits[i];
    console.log("LAYOUT STEP", i, commit.hash, "LANES BEFORE =", [...lanes]);
    const edges: Edge[] = [];

    const lane = occupyLane(commit.hash);
    const color = getColor(lane);

    if (commit.parents.length === 0) {
      releaseLane(commit.hash);
    } else if (commit.parents.length === 1) {
      const parentHash = commit.parents[0];
      const parentIndex = hashToIndex.get(parentHash);

      if (parentIndex !== undefined) {
        const existingParentLane = lanes.indexOf(parentHash);
        if (existingParentLane !== -1 && existingParentLane !== lane) {
          console.log(
            "DIAGONAL",
            commit.hash,
            "lane",
            lane,
            "->",
            parentHash,
            "parentLane",
            existingParentLane,
          );

          edges.push({
            fromLane: lane,
            toLane: existingParentLane,
            fromHash: commit.hash,
            toHash: parentHash,
            color,
          });
          releaseLane(commit.hash);
        } else {
          transferLane(commit.hash, parentHash);
          edges.push({
            fromLane: lane,
            toLane: lane,
            fromHash: commit.hash,
            toHash: parentHash,
            color,
          });
        }
      } else {
        releaseLane(commit.hash);
      }
    } else {
      const firstParent = commit.parents[0];
      const firstParentLane = lanes.indexOf(firstParent);

      if (firstParentLane !== -1 && firstParentLane !== lane) {
        console.log(
          "MERGE DIAGONAL",
          commit.hash,
          "lane",
          lane,
          "->",
          firstParent,
          "parentLane",
          firstParentLane,
        );
        edges.push({
          fromLane: lane,
          toLane: firstParentLane,
          fromHash: commit.hash,
          toHash: firstParent,
          color,
        });
        releaseLane(commit.hash);
      } else {
        transferLane(commit.hash, firstParent);
        edges.push({
          fromLane: lane,
          toLane: lane,
          fromHash: commit.hash,
          toHash: firstParent,
          color,
        });
      }

      for (let p = 1; p < commit.parents.length; p++) {
        const parentHash = commit.parents[p];
        const existingLane = lanes.indexOf(parentHash);
        console.log(
          `MERGE ${commit.hash} parent[${p}]=${parentHash} lane=${lane} existingLane=${existingLane}`,
        );

        if (existingLane !== -1) {
          // Parent already has a lane — connect to that lane
          edges.push({
            fromLane: lane,
            toLane: existingLane,
            fromHash: commit.hash,
            toHash: parentHash,
            color: getColor(existingLane),
          });
        } else {
          // Parent not yet seen — do NOT assign a lane yet.
          // Draw a temporary straight-down edge; real lane will be assigned when parent appears.
          edges.push({
            fromLane: lane,
            toLane: lane,
            fromHash: commit.hash,
            toHash: parentHash,
            color,
          });
        }
      }
    }

    console.log("SNAPSHOT", commit.hash, "lane", lane, "active", [...lanes]);

    rawLayouts.push({
      hash: commit.hash,
      lane,
      color,
      edges,
      lanesSnapshot: [...lanes],
    });
  }

  // Second pass — compute pass-throughs
  for (let i = 0; i < rawLayouts.length; i++) {
    const current = rawLayouts[i];
    const next = rawLayouts[i + 1];

    const passThroughs: PassThrough[] = [];

    if (next) {
      // Lanes active in both current and next snapshot (excluding this commit's lane)
      current.lanesSnapshot.forEach((hash, idx) => {
        if (
          hash !== null &&
          idx !== current.lane &&
          next.lanesSnapshot[idx] !== null
        ) {
          passThroughs.push({ lane: idx, color: getColor(idx) });
        }
      });

      // Lanes that are NULL in current but OCCUPIED in next (reopened/reactivated)
      current.lanesSnapshot.forEach((hash, idx) => {
        if (
          hash === null &&
          idx !== current.lane &&
          next.lanesSnapshot[idx] !== null
        ) {
          const alreadyAdded = passThroughs.some((pt) => pt.lane === idx);
          if (!alreadyAdded) {
            passThroughs.push({ lane: idx, color: getColor(idx) });
          }
        }
      });

      // Lanes that are targets of this commit's diagonal edges
      current.edges.forEach((edge) => {
        if (edge.fromLane !== edge.toLane && edge.toLane !== current.lane) {
          const alreadyAdded = passThroughs.some(
            (pt) => pt.lane === edge.toLane,
          );
          if (!alreadyAdded) {
            passThroughs.push({ lane: edge.toLane, color: edge.color });
          }
        }
      });
    }

    console.log(
      "LAYOUT",
      current.hash,
      "lane",
      current.lane,
      "passThroughs",
      passThroughs.map((p) => p.lane),
      "edges",
      current.edges.map((e) => `${e.fromLane}->${e.toLane}`),
    );

    layout.set(current.hash, {
      hash: current.hash,
      lane: current.lane,
      color: current.color,
      edges: current.edges,
      passThroughs,
    });
  }

  return layout;
}
