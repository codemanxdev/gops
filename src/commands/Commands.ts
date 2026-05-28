export const COMMANDS = {
  REFRESH: "gops.refresh",
  CHECKOUT_BRANCH: "gops.checkout",
  DELETE_BRANCH: "gops.deleteBranch",
  RENAME_BRANCH: "gops.renameBranch",
  PUSH: "gops.push",
  PULL: "gops.pull",
  CREATE_BRANCH_FROM_CURRENT: "gops.branch.current",
  CREATE_BRANCH: "gops.branch",
  CREATE_TAG: "gops.tag",
  SHOW_DIFF: "gops.showDiff",
  STAGE_FILE: "gops.stageFile",
} as const;
