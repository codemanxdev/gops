# Gops (Git Ops - Visual Git Toolkit)

Git Operations - Visual Git Toolkit for VS Code

## Build Status

[![CI Builds](https://github.com/thedev-codeman/gops/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/thedev-codeman/gops/actions/workflows/ci.yml)

[![codecov](https://codecov.io/gh/codemanxdev/gops/branch/develop/graph/badge.svg?token=Edmq5OLxFA)](https://codecov.io/gh/codemanxdev/gops)

## Features

### Tree View

- Toolbar with following options
  - Refresh treeview
  - Push
  - Pull
  - New Branch
- Local and Remote branches
- Ability to interact and perform the following operations
  - Checkout branch
  - Create tag
  - Delete branch
  - Rename branch
- Local Changes
- Tags

## Requirements

Git should be installed

## Extension Settings

This extension contributes the following settings:

- N/A

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.1

Initial release of Gops

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

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
