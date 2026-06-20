## Core Features

**Branch Management**

- Create, checkout, delete, and rename branches
- Publish local branches to remote with upstream tracking
- Visual git graph showing commit history per branch
- Ahead/behind tracking for local branches

**File Operations**

- Stage and unstage files individually or all at once
- View diffs for changed files
- Auto-refresh on file save

**Remote Operations**

- Push, pull, and fetch changes
- Fetch with automatic pruning of deleted remote branches

**Commit Workflow**

- Commit staged files with custom messages
- Commit button only appears when files are staged

**User Interface**

- Clean tree view with organized sections (branches, changes, staged, tags, stash)
- Context-aware inline buttons and menus
- Modal dialogs for confirmations
- Syntax highlighting and VSCode theme integration

**Git Graph**

- Visual git graph rendered in a webview panel
- Commit rows with hash, message, author, and date columns
- Graph column showing branch lanes and edges with color-coded lines
- Commit markers: diamond for HEAD, double-ring for merge commits, filled circle for normal commits
- Alternating row backgrounds for readability
- Ref pills per commit showing all associated refs
- Color-coded ref pills by kind: HEAD (amber), local branch (blue), remote (light blue), tag (orange)
- Tag pills prefixed with 🎯 bookmark emoji
- Merge commits styled in grey with [MERGE] prefix

## Developer Features

**Logging Features**

- Comprehensive logging and error reporting

**Testing**

- 80+ unit and integration tests
