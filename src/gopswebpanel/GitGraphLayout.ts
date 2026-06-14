import { Edge } from "../models/Edge";
import { PassThrough } from "../models/Passthrough";
import { CommitLayout } from "../models/CommitLayout";
import { GitCommitModel } from "../models/GitCommitModel";
import { LaneManager } from "./LaneManager";

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

export class GitGraphLayout {
  /**
   * Uses the list of commits from git log and computes a layout
   * that assigns each commit to a lane and determines the branching
   * and merging edges between them.
   */
  public static computeLayout(
    commits: GitCommitModel[],
  ): Map<string, CommitLayout> {
    const layout = new Map<string, CommitLayout>();
    const laneManager = new LaneManager();

    console.log("ALL COMMITS:");
    commits.forEach((c) => console.log(c.toString()));

    const hashToIndex = new Map<string, number>();
    commits.forEach((c, i) => hashToIndex.set(c.hash, i));
    console.log("HASH TO INDEX:");
    hashToIndex.forEach((i, h) => console.log(`hash=${h} -> ${i}`));

    for (let i = 0; i < commits.length; i++) {
      const commit = commits[i];
      //snashot lane state before the commit is assigned
      const snapshot = [...laneManager.getLanes()];
      const lane = laneManager.findLaneForCommit(commit.hash);
      const color = getColor(lane);
      const parent = commit.parents[0] || null;

      console.log(
        `Commit ${commit.hash} parents=${commit.parents.length} ${commit.parents.join(", ")}`,
      );

      laneManager.next(lane, parent);

      // calculate passthroughs for all other lanes that are still occupied
      // TODO: passthroughs still add a line for cases where the lane is merging back or branching out.
      // TODO: we should detect this and not add a passthrough in that case
      const passThroughs: PassThrough[] = [];
      snapshot.forEach((hash, idx) => {
        if (idx !== lane && hash !== null) {
          passThroughs.push({ lane: idx, color: getColor(idx) });
        }
      });

      const commitLayout: CommitLayout = {
        hash: commit.hash,
        lane: lane,
        color: color,
        edges: [],
        passThroughs: passThroughs,
      };

      layout.set(commit.hash, commitLayout);
    }

    console.log("LAYOUT:");
    layout.forEach((cl, hash) => {
      console.log(
        `Commit ${hash}: lane=${cl.lane}, edges=[${cl.edges.map((e) => `from ${e.fromLane} to ${e.toLane}`).join(", ")}]`,
      );
    });

    return layout;
  }
}
