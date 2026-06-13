export interface GitCommitModel {
  hash: string;
  message: string;
  author: string;
  date: string;
  isMergeCommit: boolean;
  refs: string;
  parents: string[];
}
