export enum NodeType {
  //Root level
  Repository = "repository",

  //Main sections
  Local = "local",
  Remote = "remote",
  Changes = "changes",
  StagedChanges = "stagedChanges",
  Tags = "tags",
  Stash = "stash",

  //Changes section
  File = "file",

  //Unused
  Section = "section",
  Branch = "branch",
}
