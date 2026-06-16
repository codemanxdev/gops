import { Edge } from "../models/Edge";
import { PassThrough } from "../models/Passthrough";
import { CommitLayout } from "../models/CommitLayout";

export const ROW_HEIGHT = 40;
export const LANE_WIDTH = 20;

export const HALF = ROW_HEIGHT / 2;
export const EDGE_STROKE_WIDTH = 2;

const COMMIT_CIRCLE_RADIUS_NORMAL = 5;
const COMMIT_CIRCLE_RADIUS_MERGE = 7;
const COMMIT_CIRCLE_RADIUS_HEAD = 9;
const COMMIT_CIRCLE_STROKE_WIDTH_NORMAL = 1.5;
const COMMIT_CIRCLE_STROKE_WIDTH_MERGE = 2.5;
const COMMIT_CIRCLE_STROKE_WIDTH_HEAD = 3;
const COMMIT_CIRCLE_HEAD_COLOR = "#f0a500";
type CommitCircleKind = "commit" | "merge" | "head";

export const GitGraphRenderer = {
  laneX(lane: number): number {
    return lane * LANE_WIDTH + LANE_WIDTH;
  },

  makePath(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string,
  ): string {
    const isVertical = fromX === toX;

    if (isVertical) {
      return `<path d="M ${fromX} ${fromY} L ${toX} ${toY}"
      stroke="${color}" stroke-width="${EDGE_STROKE_WIDTH}" fill="none"
      stroke-linecap="round"/>`;
    }

    const midY = (fromY + toY) / 2;

    return `<path d="M ${fromX} ${fromY}
                   C ${fromX} ${midY},
                     ${toX} ${midY},
                     ${toX} ${toY}"
      stroke="${color}" stroke-width="${EDGE_STROKE_WIDTH}" fill="none"
      stroke-linecap="round"/>`;
  },

  makeCircle(
    cx: number,
    cy: number,
    color: string,
    kind: CommitCircleKind,
  ): string {
    const styles = {
      commit: {
        r: COMMIT_CIRCLE_RADIUS_NORMAL,
        stroke: color,
        strokeWidth: COMMIT_CIRCLE_STROKE_WIDTH_NORMAL,
      },
      merge: {
        r: COMMIT_CIRCLE_RADIUS_MERGE,
        stroke: color,
        strokeWidth: COMMIT_CIRCLE_STROKE_WIDTH_MERGE,
      },
      head: {
        r: COMMIT_CIRCLE_RADIUS_HEAD,
        stroke: color,
        strokeWidth: COMMIT_CIRCLE_STROKE_WIDTH_HEAD,
      },
    };

    const s = styles[kind];

    return `<circle cx="${cx}" cy="${cy}" r="${s.r}" fill="${color}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`;
  },

  makeSvg(width: number, content: string): string {
    return `<svg class="graph" width="${width}" height="100%" viewBox="0 0 ${width} ${ROW_HEIGHT}" preserveAspectRatio="none">
    ${content}
  </svg>`;
  },

  drawGraphCell(cl: CommitLayout, svgWidth: number, isFirst: boolean): string {
    const isMergeCommit = cl.outgoingEdges.length > 1;
    const cx = this.laneX(cl.lane);
    const cy = HALF;
    let svgContent = "";

    const commitHasOutgoingBranch = cl.outgoingEdges.some(
      (edge) => edge.fromLane === cl.lane,
    );

    const commitHasPassingBranch = cl.passThroughs.some(
      (pt) => pt.lane === cl.lane,
    );

    const singleDiagonalNonMerge =
      !isMergeCommit &&
      cl.outgoingEdges.length === 1 &&
      cl.outgoingEdges[0].fromLane === cl.lane &&
      cl.outgoingEdges[0].toLane !== cl.lane;

    const commitBranchesToAnotherLane = cl.outgoingEdges.some(
      (edge) => edge.fromLane === cl.lane && edge.toLane !== cl.lane,
    );

    const commitReceivesBranchFromAnotherLane = cl.incomingEdges.some(
      (edge) => edge.toLane === cl.lane && edge.fromLane !== cl.lane,
    );

    const commitHasDiagonalConnection =
      !singleDiagonalNonMerge &&
      (commitBranchesToAnotherLane || commitReceivesBranchFromAnotherLane);

    // HANDLE PASSTHROUGHS:
    cl.passThroughs.forEach((pt: PassThrough) => {
      if (pt.lane === cl.lane && commitHasDiagonalConnection) {
        return;
      }
      const x = this.laneX(pt.lane);
      svgContent += this.makePath(x, 0, x, ROW_HEIGHT, pt.color);
    });

    // HANDLE CONNECTORS:
    if (cl.hasTopConnector) {
      svgContent += this.makePath(cx, 0, cx, cy, cl.color);
    }

    if (cl.hasBottomConnector) {
      svgContent += this.makePath(cx, cy, cx, ROW_HEIGHT, cl.color);
    }

    // HANDLE OUTGOING EDGES:
    if (!singleDiagonalNonMerge) {
      cl.outgoingEdges.forEach((edge: Edge) => {
        const fromX = this.laneX(edge.fromLane);
        const toX = this.laneX(edge.toLane);
        svgContent += this.makePath(fromX, cy, toX, ROW_HEIGHT, edge.color);
      });
    }

    // HANDLE INCOMING EDGES:
    if (!isFirst) {
      cl.incomingEdges.forEach((edge: Edge) => {
        const fromX = this.laneX(edge.fromLane);
        const toX = this.laneX(edge.toLane);
        svgContent += this.makePath(fromX, 0, toX, cy, edge.color);
      });
    }

    // HANDLE COMMIT CIRCLE:
    let kind: CommitCircleKind = "commit";
    if (isFirst) {
      kind = "head";
    } else if (isMergeCommit) {
      kind = "merge";
    }
    svgContent += this.makeCircle(
      cx,
      cy,
      isFirst ? COMMIT_CIRCLE_HEAD_COLOR : cl.color,
      kind,
    );

    return `<div class="col-graph" style="width:${svgWidth}px;min-width:${svgWidth}px">
    ${this.makeSvg(svgWidth, svgContent)}
  </div>`;
  },

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString() +
      " " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  },

  drawCommitRow(
    commit: {
      hash: string;
      message: string;
      author: string;
      date: string;
      isMergeCommit: boolean;
      refs: string;
    },
    cl: CommitLayout,
    svgWidth: number,
    isFirst: boolean,
    isAlt: boolean,
  ): string {
    const graphCell = this.drawGraphCell(cl, svgWidth, isFirst);

    let msgText = commit.isMergeCommit
      ? "[MERGE] " + commit.message
      : commit.message;

    const truncated =
      msgText.length > 60 ? msgText.substring(0, 60) + "..." : msgText;
    const refs = commit.refs ? ` <span class="refs">${commit.refs}</span>` : "";

    return `
      <div class="commit-row${isAlt ? " commit-row-alt" : ""}">
        ${graphCell}
        <div class="col-hash"><span class="hash">${commit.hash}</span></div>
        <div class="col-message">
          <span class="message" title="${commit.message}">${truncated}</span>${refs}
        </div>
        <div class="col-author"><span class="author">${commit.author}</span></div>
        <div class="col-date"><span class="date">${this.formatDate(commit.date)}</span></div>
      </div>
    `;
  },
};
