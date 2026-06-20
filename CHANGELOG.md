# Change Log

All notable changes to the "gops" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [0.0.15]

### Added

- Visual git graph rendered in a webview panel
- Commit rows with hash, message, author, and date columns
- Graph column showing branch lanes and edges with color-coded lines
- Commit markers: diamond for HEAD, double-ring for merge commits, filled circle for normal commits
- Alternating row backgrounds for readability
- Ref pills per commit showing all associated refs
- Color-coded ref pills by kind: HEAD (amber), local branch (blue), remote (light blue), tag (orange)
- Tag pills prefixed with 🎯 bookmark emoji
- Merge commits styled in grey with [MERGE] prefix

## [0.0.12]

### Added

- Added git commit graph
- Added options to stage and unstage all files
- Added option to stage and unstage individual files
- Added commit icon
- Added context menu for renaming and deleting branch

### Fixed

- Improved logic to refresh treeview in various stages

## [0.0.5]

- Added ability to perform diff checks on changed files
