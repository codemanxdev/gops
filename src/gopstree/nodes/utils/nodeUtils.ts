import { LabelWithHighlights } from "./LabelWithHighlights";

export const aheadSymbol = "↑";
export const behindSymbol = "↓";

export const formatLocalBranchLabel = (
  name: string,
  isCurrent: boolean,
  ahead?: number,
  behind?: number,
): LabelWithHighlights => {
  let label = name;

  if (ahead !== undefined || behind !== undefined) {
    const a = ahead ? ` ${aheadSymbol}${ahead}` : "";
    const b = behind ? ` ${behindSymbol}${behind}` : "";

    label += `${a}${b}`;
  }

  if (isCurrent) {
    // Highlight the entire branch name (from start to the end of the branch name)
    return {
      label,
      highlights: [[0, name.length]],
    };
  } else {
    return {
      label,
      highlights: [],
    };
  }
};
