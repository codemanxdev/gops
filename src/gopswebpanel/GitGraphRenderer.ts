import { Edge } from "../models/Edge";
import { PassThrough } from "../models/Passthrough";
import { CommitLayout } from "../models/CommitLayout";

export const ROW_HEIGHT = 40;
export const LANE_WIDTH = 20;

export const HALF = ROW_HEIGHT / 2;
export const EDGE_STROKE_WIDTH = 2;

//Commit circles have different stroke widths based on type (normal commit, merge commit, HEAD)
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

  buildIncomingEdges(
    commits: { hash: string }[],
    layout: Map<string, CommitLayout>,
  ): Map<string, Edge[]> {
    const incomingEdges = new Map<string, Edge[]>();
    commits.forEach((c) => {
      const cl = layout.get(c.hash);
      if (!cl) {
        return;
      }
      cl.edges.forEach((edge: Edge) => {
        // Skip straight edges — covered by pass-throughs
        if (edge.fromLane === edge.toLane) {
          return;
        }
        if (!incomingEdges.has(edge.toHash)) {
          incomingEdges.set(edge.toHash, []);
        }
        incomingEdges.get(edge.toHash)!.push(edge);
      });
    });
    return incomingEdges;
  },

  drawGraphCell(
    cl: CommitLayout,
    incoming: Edge[],
    svgWidth: number,
    isFirst: boolean,
    isMergeCommit: boolean,
  ): string {
    const cx = this.laneX(cl.lane);
    const cy = HALF;
    let svgContent = "";

    // Draw pass-through lines first (full height — bottom layer)
    cl.passThroughs.forEach((pt: PassThrough) => {
      const x = this.laneX(pt.lane);
      svgContent += this.makePath(x, 0, x, ROW_HEIGHT, pt.color);
    });

    // Draw top connector only if this lane actually continues
    const laneContinues =
      cl.passThroughs.some((pt) => pt.lane === cl.lane) ||
      incoming.some((edge) => edge.toLane === cl.lane) ||
      cl.edges.some((edge) => edge.fromLane === cl.lane);

    if (!isFirst && laneContinues) {
      svgContent += this.makePath(cx, 0, cx, cy, cl.color);
    }

    // Draw bottom connector if lane continues downward
    const laneContinuesDown =
      cl.passThroughs.some((pt) => pt.lane === cl.lane) ||
      cl.edges.some((edge) => edge.fromLane === cl.lane);

    if (laneContinuesDown) {
      svgContent += this.makePath(cx, cy, cx, ROW_HEIGHT, cl.color);
    }

    // Draw outgoing edges (commit → parents, bottom half)
    cl.edges.forEach((edge: Edge) => {
      const fromX = this.laneX(edge.fromLane);
      const toX = this.laneX(edge.toLane);
      svgContent += this.makePath(fromX, cy, toX, ROW_HEIGHT, edge.color);
    });

    // Draw incoming curved edges (top half)
    incoming.forEach((edge: Edge) => {
      const fromX = this.laneX(edge.fromLane);
      const toX = this.laneX(edge.toLane);
      svgContent += this.makePath(fromX, 0, toX, cy, edge.color);
    });

    // Commit circle based on type (merge commits get bigger golden circles, HEAD gets cyan)
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
    incoming: Edge[],
    svgWidth: number,
    isFirst: boolean,
    isAlt: boolean,
  ): string {
    const graphCell = this.drawGraphCell(
      cl,
      incoming,
      svgWidth,
      isFirst,
      commit.isMergeCommit,
    );

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
