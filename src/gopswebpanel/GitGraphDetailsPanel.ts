export function renderDetailPanel(): string {
  return `
    <div id="detail-panel">
      <div id="detail-header">
        <div id="detail-header-meta">
          <span id="detail-hash"></span>
          <span id="detail-message"></span>
          <span id="detail-author-date"></span>
        </div>
        <div id="detail-actions">
          <button class="detail-action-btn primary" id="detail-action-tag">🏷 Create Tag</button>
          <button class="detail-action-btn" id="detail-action-checkout">⎇ Checkout</button>
        </div>
        <button id="detail-close" title="Close">✕</button>
      </div>
      <div id="detail-body">
        <div id="detail-loading">Loading diff…</div>
        <div id="detail-content" style="display:none;">
          <div id="detail-diff"></div>
        </div>
      </div>
    </div>
  `;
}
