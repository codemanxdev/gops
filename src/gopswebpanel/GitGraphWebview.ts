import * as vscode from "vscode";
import { GitCommitModel } from "../models/GitCommitModel";

export function renderGitGraph(
  branchName: string,
  commits: GitCommitModel[],
  cssUri: vscode.Uri,
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <link rel="stylesheet" href="${cssUri}">
    </head>
    <body>
      <div id="header">
        <span style="font-size: 16px;">⎇</span>
        <h2>Git Graph</h2>
        <span class="branch-badge">${branchName}</span>
        <span class="commit-count">${commits.length} commits</span>
      </div>

      <div id="column-headers">
        <div class="col-graph"></div>
        <div class="col-hash">Hash</div>
        <div class="col-message">Message</div>
        <div class="col-author">Author</div>
        <div class="col-date">Date</div>
      </div>

      <div id="commits-container">
      </div>

      <script>
        const commits = ${JSON.stringify(commits)};
        const container = document.getElementById('commits-container');
        const ROW_HEIGHT = 37;
        const CX = 12;
        const CR = 5;

        commits.forEach((commit, i) => {
          const row = document.createElement('div');
          row.className = 'commit-row' + (i % 2 === 0 ? '' : ' commit-row-alt');

          // Graph cell
          const graphDiv = document.createElement('div');
          graphDiv.className = 'col-graph';
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('class', 'graph');
          svg.setAttribute('width', '24');
          svg.setAttribute('height', ROW_HEIGHT);

          if (i > 0) {
            const lineUp = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            lineUp.setAttribute('x1', CX); lineUp.setAttribute('y1', '0');
            lineUp.setAttribute('x2', CX); lineUp.setAttribute('y2', ROW_HEIGHT / 2 - CR);
            lineUp.setAttribute('stroke', '#6a9955');
            lineUp.setAttribute('stroke-width', '2');
            svg.appendChild(lineUp);
          }

          if (i < commits.length - 1) {
            const lineDown = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            lineDown.setAttribute('x1', CX); lineDown.setAttribute('y1', ROW_HEIGHT / 2 + CR);
            lineDown.setAttribute('x2', CX); lineDown.setAttribute('y2', ROW_HEIGHT);
            lineDown.setAttribute('stroke', '#6a9955');
            lineDown.setAttribute('stroke-width', '2');
            svg.appendChild(lineDown);
          }

          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', CX);
          circle.setAttribute('cy', ROW_HEIGHT / 2);
          circle.setAttribute('r', CR);
          circle.setAttribute('fill', i === 0 ? '#f0a500' : '#6a9955');
          circle.setAttribute('stroke', 'var(--vscode-editor-background)');
          circle.setAttribute('stroke-width', '1.5');
          svg.appendChild(circle);

          graphDiv.appendChild(svg);
          row.appendChild(graphDiv);

          // Hash cell
          const hashDiv = document.createElement('div');
          hashDiv.className = 'col-hash';
          hashDiv.innerHTML = '<span class="hash">' + commit.hash + '</span>';
          row.appendChild(hashDiv);

          // Message cell
          const msgDiv = document.createElement('div');
          msgDiv.className = 'col-message';
          let msgText = commit.message;
          if (commit.isMergeCommit) {
            msgText = '[MERGE] ' + msgText;
          }
          msgDiv.innerHTML = '<span class="message" title="' + commit.message + '">' +
            (msgText.length > 60 ? msgText.substring(0, 60) + '...' : msgText) +
            '</span>';
          if (commit.refs) {
            msgDiv.innerHTML += ' <span class="refs">' + commit.refs + '</span>';
          }
          row.appendChild(msgDiv);

          // Author cell
          const authorDiv = document.createElement('div');
          authorDiv.className = 'col-author';
          authorDiv.innerHTML = '<span class="author">' + commit.author + '</span>';
          row.appendChild(authorDiv);

          // Date cell
          const dateDiv = document.createElement('div');
          dateDiv.className = 'col-date';
          const d = new Date(commit.date);
          dateDiv.innerHTML = '<span class="date">' + d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + '</span>';
          row.appendChild(dateDiv);

          container.appendChild(row);
        });
      </script>
    </body>
    </html>
  `;
}
