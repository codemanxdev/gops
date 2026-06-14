import * as vscode from "vscode";
import { GitCommitModel } from "../models/GitCommitModel";
import { GitGraphLayout } from "./GitGraphLayout";
import { GitGraphRenderer } from "./GitGraphRenderer";
import { CommitLayout } from "../models/CommitLayout";
import { Edge } from "../models/Edge";

export function renderGitGraph(
  branchName: string,
  commits: GitCommitModel[],
  cssUri: vscode.Uri,
): string {
  const layout = GitGraphLayout.computeLayout(commits);

  // Calculate svg width
  let maxLane = 0;
  layout.forEach((entry: CommitLayout) => {
    if (entry.lane > maxLane) {
      maxLane = entry.lane;
    }
    entry.edges.forEach((e: Edge) => {
      if (e.fromLane > maxLane) {
        maxLane = e.fromLane;
      }
      if (e.toLane > maxLane) {
        maxLane = e.toLane;
      }
    });
  });

  const svgWidth = GitGraphRenderer.laneX(maxLane + 2);
  const incomingEdges = GitGraphRenderer.buildIncomingEdges(commits, layout);

  // Pre-render all commit rows
  const rows = commits
    .map((commit, i) => {
      const cl = layout.get(commit.hash);
      if (!cl) {
        return "";
      }
      const incoming = incomingEdges.get(commit.hash) || [];
      return GitGraphRenderer.drawCommitRow(
        commit,
        cl,
        incoming,
        svgWidth,
        i === 0,
        i % 2 !== 0,
      );
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <link rel="stylesheet" href="${cssUri}">
      <style>
        .col-graph { width: ${svgWidth}px; min-width: ${svgWidth}px; }
        #header-graph { width: ${svgWidth}px; min-width: ${svgWidth}px; }
      </style>
    </head>
    <body>
      <div id="header">
        <span style="font-size: 16px;">⎇</span>
        <h2>Git Graph</h2>
        <span class="branch-badge">${branchName}</span>
        <span class="commit-count">${commits.length} commits</span>
      </div>

      <div id="column-headers">
        <div class="col-graph" id="header-graph"></div>
        <div class="col-hash">Hash</div>
        <div class="col-message">Message</div>
        <div class="col-author">Author</div>
        <div class="col-date">Date</div>
      </div>

      <div id="commits-container">
        ${rows}
      </div>
    </body>
    </html>
  `;
}
