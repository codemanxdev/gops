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

export const formatRemoteBranchLabel = (
  remote: string,
  branch: string,
  isTracking: boolean,
): LabelWithHighlights => {
  const label = `${remote}/${branch}`;

  if (isTracking) {
    return {
      label,
      highlights: [[remote.length + 1, label.length]],
    };
  } else {
    return { label, highlights: [] };
  }
};

export const createLocalBranchTooltip = (
  branch: string,
  isCurrent: boolean,
  ahead?: number,
  behind?: number,
): string => {
  return [
    `Branch: ${branch}`,
    isCurrent ? "Current branch" : "Not current",
    ahead !== undefined ? `Ahead by ${ahead} commits` : "",
    behind !== undefined ? `Behind by ${behind} commits` : "",
  ].join("\n");
};

export const createRemoteBranchTooltip = (
  remote: string,
  branch: string,
  isTracking: boolean,
): string => {
  return [

    `Remote: ${remote}`,
    `Branch: ${branch}`,
    isTracking ? "Tracking enabled" : "Not tracking",
  ].join("\n");
};
