import { LocalBranchNode } from "./nodes/LocalBranchNode";
import { RemoteBranchNode } from "./nodes/RemoteBranchNode";
import { RepositoryNode } from "./nodes/RepositoryNode";
import { TreeItemModel } from "./TreeItemModel";

export type GitTreeNode =
  | LocalBranchNode
  | RemoteBranchNode
  | RepositoryNode
  | TreeItemModel;
