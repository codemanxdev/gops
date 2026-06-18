import { PassThrough } from "../models/Passthrough";
import { CommitLayout } from "../models/CommitLayout";
import { GitCommitModel } from "../models/GitCommitModel";
import { Edge } from "../models/Edge";
import { RefKind } from "../models/RefKind";

export const ROW_HEIGHT = 40;
export const LANE_WIDTH = 20;

export const HALF = ROW_HEIGHT / 2;
export const EDGE_STROKE_WIDTH = 2;

const COMMIT_MARKER_RADIUS_NORMAL = 4;
const COMMIT_MARKER_RADIUS_MERGE_INNER = 3;
const COMMIT_MARKER_RADIUS_MERGE_OUTER = 4.5;
const COMMIT_MARKER_RADIUS_HEAD = 7;
const COMMIT_MARKER_STROKE_WIDTH_MERGE = 1;
const COMMIT_MARKER_STROKE_WIDTH_HEAD = 3;
const COMMIT_MARKER_HEAD_COLOR = "#f0a500";
const MERGE_MESSAGE_COLOR = "#888888";
type CommitMarkerKind = "commit" | "merge" | "head";

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

  makeCommitMarker(
    cx: number,
    cy: number,
    color: string,
    kind: CommitMarkerKind,
  ): string {
    if (kind === "merge") {
      // Double ring: outer circle (stroke only) + inner filled circle
      return (
        `<circle cx="${cx}" cy="${cy}" r="${COMMIT_MARKER_RADIUS_MERGE_OUTER}" fill="var(--vscode-editor-background)" stroke="${color}" stroke-width="${COMMIT_MARKER_STROKE_WIDTH_MERGE}"/>` +
        `<circle cx="${cx}" cy="${cy}" r="${COMMIT_MARKER_RADIUS_MERGE_INNER}" fill="${color}" stroke="none"/>`
      );
    }

    if (kind === "head") {
      // Double diamond: outer diamond (stroke only) + inner filled diamond
      const outer = COMMIT_MARKER_RADIUS_HEAD;
      const inner = COMMIT_MARKER_RADIUS_HEAD - 3;
      return (
        `<polygon points="${cx},${cy - outer} ${cx + outer},${cy} ${cx},${cy + outer} ${cx - outer},${cy}" fill="var(--vscode-editor-background)" stroke="${color}" stroke-width="${COMMIT_MARKER_STROKE_WIDTH_HEAD}"/>` +
        `<polygon points="${cx},${cy - inner} ${cx + inner},${cy} ${cx},${cy + inner} ${cx - inner},${cy}" fill="${color}" stroke="none"/>`
      );
    }

    // Normal commit: filled circle with black border
    return `<circle cx="${cx}" cy="${cy}" r="${COMMIT_MARKER_RADIUS_NORMAL}" fill="${color}" stroke="#000000" stroke-width="1"/>`;
  },

  makeSvg(width: number, content: string): string {
    return `<svg class="graph" width="${width}" height="100%" viewBox="0 0 ${width} ${ROW_HEIGHT}" preserveAspectRatio="none">
    ${content}
  </svg>`;
  },

  drawGraphCell(cl: CommitLayout, svgWidth: number, isFirst: boolean): string {
    const isMergeCommit = cl.incomingEdges.length > 0;
    const cx = this.laneX(cl.lane);
    const cy = HALF;
    let svgContent = "";

    // HANDLE PASSTHROUGHS:
    cl.passThroughs.forEach((pt: PassThrough) => {
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
    cl.outgoingEdges.forEach((edge: Edge) => {
      const fromX = this.laneX(edge.fromLane);
      const toX = this.laneX(edge.toLane);
      svgContent += this.makePath(fromX, cy, toX, 0, edge.color);
    });

    // HANDLE INCOMING EDGES:
    if (!isFirst) {
      cl.incomingEdges.forEach((edge: Edge) => {
        const fromX = this.laneX(edge.fromLane);
        const toX = this.laneX(edge.toLane);
        svgContent += this.makePath(fromX, cy, toX, ROW_HEIGHT, edge.color);
      });
    }

    // HANDLE COMMIT CIRCLE:
    let kind: CommitMarkerKind = "commit";
    if (isFirst) {
      kind = "head";
    } else if (isMergeCommit) {
      kind = "merge";
    }
    svgContent += this.makeCommitMarker(
      cx,
      cy,
      isFirst ? COMMIT_MARKER_HEAD_COLOR : cl.color,
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
    commit: GitCommitModel,
    cl: CommitLayout,
    svgWidth: number,
    isFirst: boolean,
    isAlt: boolean,
  ): string {
    const graphCell = this.drawGraphCell(cl, svgWidth, isFirst);
    commit.refs.forEach((ref) =>
      console.log(`kind=${ref.kind} label=${ref.label}`),
    );

    let msgText = commit.isMergeCommit
      ? "[MERGE] " + commit.message
      : commit.message;

    const truncated =
      msgText.length > 60 ? msgText.substring(0, 60) + "..." : msgText;

    const refs =
      commit.refs.length > 0
        ? commit.refs
            .map(
              (ref) => `<span class="ref ref-${ref.kind}">${ref.label}</span>`,
            )
            .join("")
        : "";

    // Merge commit messages are styled grey
    const messageStyle = commit.isMergeCommit
      ? ` style="color:${MERGE_MESSAGE_COLOR}"`
      : "";

    return `
      <div class="commit-row${isAlt ? " commit-row-alt" : ""}">
        ${graphCell}
        <div class="col-hash"><span class="hash">${commit.hash}</span></div>
        <div class="col-message">
          <span class="message" title="${commit.message}"${messageStyle}>${truncated}</span>${refs}
        </div>
        <div class="col-author"><span class="author">${commit.author}</span></div>
        <div class="col-date"><span class="date">${this.formatDate(commit.date)}</span></div>
      </div>
    `;
  },
};
