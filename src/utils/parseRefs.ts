import { RefKind } from "../models/RefKind";
import { ParsedRef } from "../models/GitCommitModel";

export function parseRefs(raw: string): ParsedRef[] {
  if (!raw) {
    return [];
  }
  return raw.split(",").map((r) => {
    const trimmed = r.trim();
    if (trimmed.startsWith("HEAD ->")) {
      return { label: trimmed.slice(8).trim(), kind: RefKind.Head };
    }
    if (trimmed === "HEAD") {
      return { label: "HEAD", kind: RefKind.Head };
    }
    if (trimmed.startsWith("tag:")) {
      return { label: trimmed.slice(4).trim(), kind: RefKind.Tag };
    }
    if (/^[^/]+\//.test(trimmed) && trimmed.startsWith("origin/")) {
      return { label: trimmed, kind: RefKind.Remote };
    }
    return { label: trimmed, kind: RefKind.Local };
  });
}
