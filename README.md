# Gops — Visual Git Toolkit for VS Code

A fast, visual Git interface built into VS Code. Manage branches, stage files, view diffs, discard changes, and explore your commit history — all without leaving the editor.

## Build Status

[![CI Builds](https://github.com/thedev-codeman/gops/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/thedev-codeman/gops/actions/workflows/ci.yml)
[![Unit Coverage](https://codecov.io/gh/codemanxdev/gops/branch/develop/graph/badge.svg?flag=unit)](https://codecov.io/gh/codemanxdev/gops)
[![Integration Coverage](https://codecov.io/gh/codemanxdev/gops/branch/develop/graph/badge.svg?flag=integration)](https://codecov.io/gh/codemanxdev/gops)

---

## Features

Gops covers branch management, file staging, diff viewing, discard workflows, remote operations, and a visual git graph.

See [FEATURES.md](./FEATURES.md) for the full feature list.

---

## Requirements

- Git installed and available in `PATH`
- VS Code `^1.125.0`

---

## Getting Started

1. Install the extension from the VS Code Marketplace
2. Open a Git repository in VS Code
3. Click the **Gops** icon in the activity bar
4. Your branches, changes, staged files, tags, and stash are all visible in the tree view

---

## Release Notes

See [CHANGELOG.md](./CHANGELOG.md) for the full history of changes.

---

## Contributing & Development

#### Install dependencies
```bash
npm install
```

#### Compile
```bash
npm run compile
```

#### Watch mode
```bash
npm run watch
```

#### Run unit tests
```bash
npm run test:unit
```

#### Run integration tests
```bash
npm run test:integration
```

#### Build for production
```bash
npm run build
```

#### Preview packaged files
```bash
vsce ls
```

#### Package
```bash
vsce package --no-dependencies
```

#### Publish
```bash
vsce publish --no-dependencies
```

---

## Known Issues

See the [GitHub Issues](https://github.com/codemanxdev/gops/issues) page for open bugs and feature requests.

---

## Feedback

If you find Gops useful, consider leaving a rating on the VS Code Marketplace — it helps others discover the extension.