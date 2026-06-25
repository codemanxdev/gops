import { PassThrough } from "../models/Passthrough";
import { CommitLayout } from "../models/CommitLayout";
import { GitCommitModel } from "../models/GitCommitModel";
import { LaneManager } from "./LaneManager";

const LANE_COLORS = [
  "#569cd6", // blue
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

  // Second pass: for each commit, find children in different lanes
  // and add an outgoing edge. Children appear earlier in the log
  // (newer first), so they're already in the layout when this runs.
  private static computeOutgoingEdges(
    layout: Map<string, CommitLayout>,
    childMap: Map<string, string[]>,
  ): void {
    layout.forEach((cl) => {
      const children = childMap.get(cl.hash) || [];
      children.forEach((childHash) => {
        const child = layout.get(childHash);
        if (!child) {
          return;
        }
        if (child.lane === cl.lane) {
          return;
        } // same lane — handled by connector
        if (child.lane < cl.lane) {
          return;
        } // child converges back — incoming edge, not outgoing
        cl.outgoingEdges.push({
          fromLane: cl.lane,
          toLane: child.lane,
          fromHash: cl.hash,
          toHash: childHash,
          color: getColor(child.lane),
        });
      });
    });
  }

  private static computeIncomingEdges(
    layout: Map<string, CommitLayout>,
    commits: GitCommitModel[],
  ): void {
    commits.forEach((commit) => {
      const cl = layout.get(commit.hash);
      if (!cl) {
        return;
      }
      const isMergeCommit = commit.parents.length > 1;
      if (!isMergeCommit) {
        return;
      } // only merge commits have incoming edges
      commit.parents.forEach((p, index) => {
        if (index === 0) {
          return;
        } // primary parent — handled by bottom connector
        const parent = layout.get(p);
        if (!parent) {
          return;
        }
        if (parent.lane === cl.lane) {
          return;
        } // same lane — handled by connector
        cl.incomingEdges.push({
          fromLane: cl.lane,
          toLane: parent.lane,
          fromHash: cl.hash,
          toHash: p,
          color: getColor(parent.lane),
        });
      });
    });
  }

  private static resolveTopConnectors(
    layout: Map<string, CommitLayout>,
    commits: GitCommitModel[],
  ): void {
    commits.forEach((commit) => {
      if (commit.parents.length > 1) {
        commit.parents.slice(1).forEach((p) => {
          const target = layout.get(p);
          if (target) {
            target.hasTopConnector = true;
          }
        });
      }
    });
  }

  private static calculateChildMap(
    commits: GitCommitModel[],
  ): Map<string, string[]> {
    const childMap = new Map<string, string[]>();
    commits.forEach((commit) => {
      commit.parents.forEach((p) => {
        if (!childMap.has(p)) {
          childMap.set(p, []);
        }
        childMap.get(p)!.push(commit.hash);
      });
    });
    return childMap;
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

    // Build child map: parent hash → list of child hashes
    // Needed for computing outgoing edges in the second pass.
    const childMap = this.calculateChildMap(commits);

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

      const commitLayout: CommitLayout = {
        hash: commit.hash,
        lane: lane,
        color: color,
        outgoingEdges: [],
        incomingEdges: [],
        passThroughs: passThroughs,
        hasTopConnector: hasTopConnector,
        hasBottomConnector: hasBottomConnector,
      };

      layout.set(commit.hash, commitLayout);
    }

    //SECOND PASS ACTIVITIES:
    //second pass needed because branch tip parents appear later in the log than the merge commit that references them.
    this.resolveTopConnectors(layout, commits);
    //Outgoing edges computed after all commits are placed so all child lanes are known.
    this.computeOutgoingEdges(layout, childMap);
    this.computeIncomingEdges(layout, commits);
    console.log("LAYOUT:");
    layout.forEach((cl, hash) => {
      console.log(
        `Commit ${hash}: lane=${cl.lane}, outgoingEdges=[${cl.outgoingEdges.map((e) => `from ${e.fromLane} to ${e.toLane}`).join(", ")}], incomingEdges=[${cl.incomingEdges.map((e) => `from ${e.fromLane} to ${e.toLane}`).join(", ")}]`,
      );
    });

    return layout;
  }
}

export const computeLayout = GitGraphLayout.computeLayout.bind(GitGraphLayout);
