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
  private static computePassThroughs(
    snapshot: (string | null)[],
    lane: number,
    currentHash: string,
  ): PassThrough[] {
    const passThroughs: PassThrough[] = [];
    snapshot.forEach((hash, idx) => {
      if (idx !== lane && hash !== null && hash !== currentHash) {
        passThroughs.push({ lane: idx, color: getColor(idx) });
      }
    });
    return passThroughs;
  }

  private static hasTopConnector(
    snapshot: (string | null)[],
    lane: number,
    currentHash: string,
  ): boolean {
    console.log(
      `hasTopConnector: hash=${currentHash} lane=${lane} snapshot[lane]=${snapshot[lane]}`,
    );
    return snapshot[lane] === currentHash;
  }

  private static hasBottomConnector(parent: string | null): boolean {
    console.log(`hasBottomConnector: parent=${parent}`);
    return parent !== null;
  }

  private static computeOutgoingEdges(
    commit: GitCommitModel,
    lane: number,
    snapshot: (string | null)[],
  ): Edge[] {
    const edges: Edge[] = [];
    commit.parents.forEach((p) => {
      if (snapshot[lane] === p) {
        return; // same lane — handled by connector
      }
      edges.push({
        fromLane: lane,
        toLane: -1,
        fromHash: commit.hash,
        toHash: p,
        color: getColor(lane),
      });
    });
    return edges;
  }

  private static resolveOutgoingEdges(layout: Map<string, CommitLayout>): void {
    layout.forEach((cl) => {
      cl.outgoingEdges = cl.outgoingEdges.filter((e) => {
        if (e.toLane === -1) {
          const target = layout.get(e.toHash);
          console.log(
            `Resolving edge: fromHash=${e.fromHash} toHash=${e.toHash} target lane=${target?.lane}`,
          );
          if (target) {
            e.toLane = target.lane;
            e.color = getColor(e.toLane);
          }
        }
        // Drop unresolved and same-lane edges
        return e.toLane !== -1 && e.toLane !== e.fromLane;
      });
    });
  }

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

      const passThroughs = this.computePassThroughs(
        snapshot,
        lane,
        commit.hash,
      );
      const hasTopConnector = this.hasTopConnector(snapshot, lane, commit.hash);
      const hasBottomConnector = this.hasBottomConnector(parent);
      const outgoingEdges = this.computeOutgoingEdges(commit, lane, snapshot);

      const commitLayout: CommitLayout = {
        hash: commit.hash,
        lane: lane,
        color: color,
        outgoingEdges: outgoingEdges,
        incomingEdges: [],
        passThroughs: passThroughs,
        hasTopConnector: hasTopConnector,
        hasBottomConnector: hasBottomConnector,
      };

      layout.set(commit.hash, commitLayout);
    }

    this.resolveOutgoingEdges(layout);

    console.log("LAYOUT:");
    layout.forEach((cl, hash) => {
      console.log(
        `Commit ${hash}: lane=${cl.lane}, outgoingEdges=[${cl.outgoingEdges.map((e) => `from ${e.fromLane} to ${e.toLane}`).join(", ")}]`,
      );
    });

    return layout;
  }
}

export const computeLayout = GitGraphLayout.computeLayout.bind(GitGraphLayout);
