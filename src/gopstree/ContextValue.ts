export enum ContextValue {
  Repository = "repository",

  //Context related to Local Branches
  LocalBranchesSection = "localBranchesSection",
  LocalBranches = "localBranches",
  LocalBranchesCurrent = "localBranches.current",
  LocalBranchesNoUpstream = "localBranches.noUpstream",

  //Context related to Remote Branches
  RemoteBranchesSection = "remoteBranchesSection",
  RemoteBranches = "remoteBranches",
  Branch = "branch",
  File = "file",
  Stash = "stash",
  Commit = "commit",

  //Context related to Changes
  ChangesSection = "changesSection",
  ChangesSectionEmpty = "changesSectionEmpty",
  Changes = "changedFile",
  UntrackedFile = "untrackedFile",

  //Context related to Staged Changes
  StagedChangesSection = "stagedChangesSection",
  StagedChangesSectionEmpty = "stagedChangesSectionEmpty",
  StagedChanges = "stagedFile",

  //Context related to Tags
  TagsSection = "tagsSection",

  //Context related to Stash
  StashSection = "stashSection",
}
