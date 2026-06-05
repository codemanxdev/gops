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
      <div id="table-container">
        <table>
          <thead>
            <tr>
              <th class="graph-cell"></th>
              <th>Hash</th>
              <th>Message</th>
              <th>Author</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody id="commits">
          </tbody>
        </table>
      </div>
      <script>
        const commits = ${JSON.stringify(commits)};
        const tbody = document.getElementById('commits');
        const ROW_HEIGHT = 37;
        const CX = 12;
        const CR = 5;

        commits.forEach((commit, i) => {
          const tr = document.createElement('tr');

          const graphTd = document.createElement('td');
          graphTd.className = 'graph-cell';
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

          graphTd.appendChild(svg);
          tr.appendChild(graphTd);

          const hashTd = document.createElement('td');
          hashTd.innerHTML = '<span class="hash">' + commit.hash + '</span>';
          tr.appendChild(hashTd);

          const msgTd = document.createElement('td');
          let msgText = commit.message;
          if (commit.isMergeCommit) {
            msgText = '[MERGE] ' + msgText;
          }
          msgTd.innerHTML = '<span class="message" title="' + commit.message + '">' + 
            (msgText.length > 60 ? msgText.substring(0, 60) + '...' : msgText) + 
            '</span>';
          if (commit.refs) {
            msgTd.innerHTML += ' <span class="refs">' + commit.refs + '</span>';
          }
          tr.appendChild(msgTd);

          const authorTd = document.createElement('td');
          authorTd.innerHTML = '<span class="author">' + commit.author + '</span>';
          tr.appendChild(authorTd);

          const dateTd = document.createElement('td');
          const d = new Date(commit.date);
          dateTd.innerHTML = '<span class="date">' + d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + '</span>';
          tr.appendChild(dateTd);

          tbody.appendChild(tr);
        });
      </script>
    </body>
    </html>
  `;
}
