import { RefKind } from "./RefKind";

export interface ParsedRef {
  label: string;
  kind: RefKind;
}

export class GitCommitModel {
  constructor(
    public hash: string,
    public message: string,
    public author: string,
    public date: string,
    public isMergeCommit: boolean,
    public refs: ParsedRef[],
    public parents: string[],
  ) {}

  private static readonly HASH_WIDTH = 8;
  private static readonly DATE_WIDTH = 25;
  private static readonly REFS_WIDTH = 40;

  public toString(): string {
    const refsStr = this.refs.map((r) => `${r.kind}:${r.label}`).join(", ");
    return [
      `hash=${this.fixedWidth(this.hash, GitCommitModel.HASH_WIDTH)}`,
      `merge=${this.fixedWidth(this.isMergeCommit, 5)}`,
      `date=${this.fixedWidth(this.date, GitCommitModel.DATE_WIDTH)}`,
      `refs=${this.fixedWidth(refsStr, GitCommitModel.REFS_WIDTH)}`,
      `parentCount=${this.parents.length}`,
      `parents=[${this.parents
        .map((p) => p.substring(0, GitCommitModel.HASH_WIDTH))
        .join(", ")}]`,
    ].join(" | ");
  }

  private fixedWidth(value: unknown, width: number): string {
    return String(value).substring(0, width).padEnd(width);
  }
}
