export function renderDetailPanel(): string {
  return `
    <div id="detail-panel" style="display:none;">
      <div id="detail-header">
        <div id="detail-header-meta">
          <span id="detail-hash"></span>
          <span id="detail-message"></span>
        </div>
        <button id="detail-close" title="Close">✕</button>
      </div>
      <div id="detail-body">
        <div id="detail-sidebar">
          <button class="detail-action-btn primary" id="detail-action-tag">Create Tag</button>
          <button class="detail-action-btn" id="detail-action-checkout">Checkout</button>
          <button class="detail-action-btn" id="detail-action-copy-hash">Copy Hash</button>
          <button class="detail-action-btn" id="detail-action-cherry-pick">Cherry Pick</button>          
        </div>
        <div id="detail-main">
          <div id="detail-loading" style="display:none;">Loading diff…</div>
          <div id="detail-content" style="display:none;">
            <div id="detail-diff"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}
