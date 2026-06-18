/// <reference types="vitest" />
import { describe, it, expect } from "vitest";
import { parseRefs } from "../../../src/utils/parseRefs";
import { RefKind } from "../../../src/models/RefKind";

describe("parseRefs", () => {
  it("returns empty array for empty string", () => {
    expect(parseRefs("")).toEqual([]);
  });

  it("classifies HEAD -> branch as head kind", () => {
    expect(parseRefs("HEAD -> main")).toEqual([
      { label: "main", kind: RefKind.Head },
    ]);
  });

  it("classifies bare HEAD as head kind", () => {
    expect(parseRefs("HEAD")).toEqual([{ label: "HEAD", kind: RefKind.Head }]);
  });

  it("classifies tag: prefix as tag kind", () => {
    expect(parseRefs("tag: v1.0.0")).toEqual([
      { label: "v1.0.0", kind: RefKind.Tag },
    ]);
  });

  it("classifies origin/ prefix as remote kind", () => {
    expect(parseRefs("origin/main")).toEqual([
      { label: "origin/main", kind: RefKind.Remote },
    ]);
  });

  it("classifies local branch with slash as local kind not remote", () => {
    expect(parseRefs("feature/baani-order")).toEqual([
      { label: "feature/baani-order", kind: RefKind.Local },
    ]);
  });

  it("classifies plain branch name as local kind", () => {
    expect(parseRefs("main")).toEqual([{ label: "main", kind: RefKind.Local }]);
  });

  it("parses multiple refs from a comma separated string", () => {
    expect(parseRefs("HEAD -> master, origin/master, origin/HEAD")).toEqual([
      { label: "master", kind: RefKind.Head },
      { label: "origin/master", kind: RefKind.Remote },
      { label: "origin/HEAD", kind: RefKind.Remote },
    ]);
  });

  it("parses mixed refs including local branch with slash", () => {
    expect(
      parseRefs("origin/feature/baani-order, feature/baani-order"),
    ).toEqual([
      { label: "origin/feature/baani-order", kind: RefKind.Remote },
      { label: "feature/baani-order", kind: RefKind.Local },
    ]);
  });

  it("parses real world refs string with all kinds", () => {
    expect(
      parseRefs("HEAD -> master, origin/master, origin/HEAD, tag: 3.0.311"),
    ).toEqual([
      { label: "master", kind: RefKind.Head },
      { label: "origin/master", kind: RefKind.Remote },
      { label: "origin/HEAD", kind: RefKind.Remote },
      { label: "3.0.311", kind: RefKind.Tag },
    ]);
  });

  it("trims whitespace around ref entries", () => {
    expect(parseRefs("  main  ,  origin/main  ")).toEqual([
      { label: "main", kind: RefKind.Local },
      { label: "origin/main", kind: RefKind.Remote },
    ]);
  });
});
