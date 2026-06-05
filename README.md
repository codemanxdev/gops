# Gops (Git Ops - Visual Git Toolkit)

Git Operations - Visual Git Toolkit for VS Code

## Build Status

[![CI Builds](https://github.com/thedev-codeman/gops/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/thedev-codeman/gops/actions/workflows/ci.yml)

[![Unit Coverage](https://codecov.io/gh/codemanxdev/gops/branch/develop/graph/badge.svg?flag=unit)](https://codecov.io/gh/codemanxdev/gops)

[![Integration Coverage](https://codecov.io/gh/codemanxdev/gops/branch/develop/graph/badge.svg?flag=integration)](https://codecov.io/gh/codemanxdev/gops)

## Features

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

**Developer Features**
- Comprehensive logging and error reporting
- 80+ unit and integration tests
- Auto-refresh watchers for git state changes

## Requirements

Git should be installed

## Extension Settings

This extension contributes the following settings:

- N/A

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Refer to CHANGELOG.md

## Build Process

#### Install Dependences

- npm install

#### Compile

- npm run compile

#### Build

- npm run build

#### Check the files that will be packaged

- vsce ls

#### Package

- vsce package --no-dependencies

#### Publish

- vsce publish --no-dependencies
