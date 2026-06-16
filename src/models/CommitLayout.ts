import { Edge } from "./Edge";
import { PassThrough } from "./Passthrough";

export interface CommitLayout {
  hash: string;
  lane: number;
  color: string;
  outgoingEdges: Edge[];
  incomingEdges: Edge[];
  passThroughs: PassThrough[];
  hasTopConnector: boolean;
  hasBottomConnector: boolean;
}
