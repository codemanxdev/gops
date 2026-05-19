import { FileRevision } from "./FileRevision";

export interface DiffRequest {
  left: FileRevision;
  right: FileRevision;
  title?: string;
}
