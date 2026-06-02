export interface LocalBranchModel {
  name: string;
  current: boolean;
  ahead: number;
  behind: number;
  hasUpstream: boolean;
}
