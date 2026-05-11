import { describe, it, expect } from "vitest";
import {
  formatLocalBranchLabel,
  aheadSymbol,
  behindSymbol,
} from "../../../../src/gopstree/nodes/utils/nodeUtils";

describe("formatLocalBranchLabel", () => {
  it("formats basic branch name", () => {
    const result = formatLocalBranchLabel("main", false);

    expect(result.label).toBe("main");
    expect(result.highlights).toEqual([]);
  });

  it("adds ahead indicator", () => {
    const result = formatLocalBranchLabel("main", false, 2);

    expect(result.label).toBe(`main ${aheadSymbol}2`);
  });

  it("adds behind indicator", () => {
    const result = formatLocalBranchLabel("main", false, undefined, 3);

    expect(result.label).toBe(`main ${behindSymbol}3`);
  });

  it("adds both ahead and behind indicators", () => {
    const result = formatLocalBranchLabel("main", false, 1, 2);

    expect(result.label).toBe(`main ${aheadSymbol}1 ${behindSymbol}2`);
  });

  it("highlights full label when current branch", () => {
    const result = formatLocalBranchLabel("main", true);

    expect(result.highlights).toEqual([[0, "main".length]]);
  });
});
