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

  // Reserve lane 0 for the primary branch from the start
  if (commits.length > 0) {
    lanes[0] = commits[0].hash;
  }

  const occupyLane = (hash: string): number => {
    const existing = lanes.indexOf(hash);
    if (existing !== -1) {
      return existing;
    }

    // Skip lane 0 — reserved for the primary branch
    const free = lanes.indexOf(null, 1);
    if (free !== -1) {
      lanes[free] = hash;
      return free;
    }

    lanes.push(hash);
    return lanes.length - 1;
  };

  const releaseLane = (hash: string) => {
    const idx = lanes.indexOf(hash);
    if (idx !== -1 && idx !== 0) {
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
    const edges: Edge[] = [];

    const lane = occupyLane(commit.hash);
    const color = getColor(lane);

    if (commit.parents.length === 0) {
      // Root commit — keep the lane occupied so the line connects
      // all the way down to this commit (don't release it)
    } else if (commit.parents.length === 1) {
      const parentHash = commit.parents[0];
      const parentIndex = hashToIndex.get(parentHash);

      if (parentIndex !== undefined) {
        const existingParentLane = lanes.indexOf(parentHash);

        if (lane === 0) {
          // Primary lane always keeps the parent on lane 0,
          // even if another lane already tracks this hash
          transferLane(commit.hash, parentHash);
          // Clear stale duplicate references to this commit's hash in other lanes
          for (let li = 1; li < lanes.length; li++) {
            if (lanes[li] === commit.hash) {
              lanes[li] = null;
            }
          }
          edges.push({
            fromLane: lane,
            toLane: lane,
            fromHash: commit.hash,
            toHash: parentHash,
            color,
          });
        } else if (existingParentLane !== -1 && existingParentLane !== lane) {
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

      if (lane === 0) {
        // Primary lane always keeps the first parent on lane 0
        transferLane(commit.hash, firstParent);
        // Clear stale duplicate references to this commit's hash in other lanes
        for (let li = 1; li < lanes.length; li++) {
          if (lanes[li] === commit.hash) {
            lanes[li] = null;
          }
        }
        edges.push({
          fromLane: lane,
          toLane: lane,
          fromHash: commit.hash,
          toHash: firstParent,
          color,
        });
      } else if (firstParentLane !== -1 && firstParentLane !== lane) {
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
          // Parent not yet seen — assign it a new lane now so the
          // edge is diagonal and the lane is reserved for when it appears
          const parentLane = occupyLane(parentHash);
          edges.push({
            fromLane: lane,
            toLane: parentLane,
            fromHash: commit.hash,
            toHash: parentHash,
            color: getColor(parentLane),
          });
        }
      }
    }

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
      `[${i}] ${current.hash} lane=${current.lane} edges=[${current.edges.map((e) => `${e.fromLane}->${e.toLane}(${e.toHash.substring(0, 7)})`).join(", ")}] passThroughs=[${passThroughs.map((p) => p.lane).join(",")}] snapshot=[${current.lanesSnapshot.map((h, idx) => (h ? `${idx}:${h.substring(0, 7)}` : `${idx}:null`)).join(", ")}]`,
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
