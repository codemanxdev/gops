const vscode = acquireVsCodeApi();

const menu = document.getElementById("context-menu");
let activeHash = null;

document
  .getElementById("commits-container")
  .addEventListener("contextmenu", (e) => {
    const hashEl = e.target.closest(".hash");
    if (!hashEl) {
      return;
    }

    const row = hashEl.closest("[data-hash]");
    if (!row) {
      return;
    }

    e.preventDefault();

    activeHash = row.dataset.hash;
    menu.style.display = "block";
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;
  });

document.getElementById("ctx-create-tag").addEventListener("click", () => {
  if (!activeHash) {
    return;
  }

  vscode.postMessage({
    command: "createTag",
    hash: activeHash,
  });

  menu.style.display = "none";
});

document.addEventListener("click", () => {
  menu.style.display = "none";
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    menu.style.display = "none";
    closeDetail();
  }
});

const detailPanel = document.getElementById("detail-panel");

document.getElementById("commits-container").addEventListener("click", (e) => {
  const hashEl = e.target.closest(".hash");
  if (!hashEl) {
    return;
  }

  const row = hashEl.closest("[data-hash]");
  if (!row) {
    return;
  }

  openDetail(row.dataset.hash);
});

function openDetail(hash) {
  detailPanel.classList.add("visible");

  document.getElementById("detail-loading").style.display = "block";
  document.getElementById("detail-content").style.display = "none";

  vscode.postMessage({
    command: "getCommitDetail",
    hash,
  });
}

function closeDetail() {
  detailPanel.classList.remove("visible");
}

document.getElementById("detail-close").addEventListener("click", closeDetail);

document.getElementById("detail-action-tag").addEventListener("click", () => {
  const hash = detailPanel.dataset.hash;
  if (!hash) {
    return;
  }

  vscode.postMessage({
    command: "createTag",
    hash,
  });
});

document
  .getElementById("detail-action-checkout")
  .addEventListener("click", () => {
    const hash = detailPanel.dataset.hash;
    if (!hash) {
      return;
    }

    vscode.postMessage({
      command: "checkoutCommit",
      hash,
    });
  });

window.addEventListener("message", (event) => {
  const msg = event.data;

  if (msg.command === "commitDetail") {
    renderDetail(msg.detail);
  }
});

function renderDetail(detail) {
  detailPanel.dataset.hash = detail.hash;

  document.getElementById("detail-hash").textContent = detail.hash;
  document.getElementById("detail-message").textContent = detail.message;
  document.getElementById("detail-author-date").textContent =
    `${detail.author} · ${detail.date}`;

  const diffContainer = document.getElementById("detail-diff");
  diffContainer.innerHTML = renderDiff(detail.diff);

  document.getElementById("detail-loading").style.display = "none";
  document.getElementById("detail-content").style.display = "block";
}

function renderDiff(diffText) {
  if (!diffText || !diffText.trim()) {
    return '<div style="color: var(--vscode-descriptionForeground); font-size:12px;">No diff available</div>';
  }

  const files = diffText.split(/(?=diff --git )/);

  return files
    .filter(Boolean)
    .map((fileBlock) => {
      const lines = fileBlock.split("\n");

      const headerLine =
        lines.find((line) => line.startsWith("diff --git")) ?? "";

      const match = headerLine.match(/diff --git a\/(.+) b\//);
      const fileName = match ? match[1] : "unknown";

      const diffLines = lines
        .slice(1)
        .map((line) => {
          if (line.startsWith("@@")) {
            return `<div class="diff-line diff-line-hunk">${escapeHtml(line)}</div>`;
          }

          if (line.startsWith("+") && !line.startsWith("+++")) {
            return `<div class="diff-line diff-line-add">${escapeHtml(line)}</div>`;
          }

          if (line.startsWith("-") && !line.startsWith("---")) {
            return `<div class="diff-line diff-line-remove">${escapeHtml(line)}</div>`;
          }

          if (
            line.startsWith("index ") ||
            line.startsWith("--- ") ||
            line.startsWith("+++ ") ||
            line.startsWith("new file") ||
            line.startsWith("deleted file")
          ) {
            return "";
          }

          return `<div class="diff-line diff-line-context">${escapeHtml(line)}</div>`;
        })
        .join("");

      return `
        <div class="diff-file">
          <div class="diff-file-header">${escapeHtml(fileName)}</div>
          <div class="diff-lines">${diffLines}</div>
        </div>
      `;
    })
    .join("");
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
