import { Edge } from "./Edge";
import { PassThrough } from "./Passthrough";

export interface CommitLayout {
  hash: string;
  lane: number;
  color: string;
  edges: Edge[];
  passThroughs: PassThrough[];
}
