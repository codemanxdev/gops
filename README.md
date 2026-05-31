# Gops (Git Ops - Visual Git Toolkit)

Git Operations - Visual Git Toolkit for VS Code

## Build Status

[![CI Builds](https://github.com/thedev-codeman/gops/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/thedev-codeman/gops/actions/workflows/ci.yml)

[![Unit Coverage](https://codecov.io/gh/codemanxdev/gops/branch/develop/graph/badge.svg?flag=unit)](https://codecov.io/gh/codemanxdev/gops)

[![Integration Coverage](https://codecov.io/gh/codemanxdev/gops/branch/develop/graph/badge.svg?flag=integration)](https://codecov.io/gh/codemanxdev/gops)

## Features

### Tree View

- Toolbar with following options
  - Commit
  - Create Branch from Current
  - Pull
  - Push
  - Refresh treeview
- Local Branches
  - Checkout
  - Delete
  - New Branch
  - Rename Branch
- Remote Branches
- Local Changes
- Staged Changes
- Tags
- Stash

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
