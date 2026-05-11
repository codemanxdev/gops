import { describe, it, expect, vi, beforeEach } from "vitest";
import { TreeSelectionController } from "../../../../src/gopstree/controller/TreeSelectionController";
import { CONTEXTS } from "../../../../src/gopstree/context/Contexts";
import { NodeType } from "../../../../src/gopstree/nodes/NodeType";

const createMockNode = (overrides: Record<string, unknown> = {}) => ({
  type: NodeType.Local,
  isCurrent: false,
  ...overrides,
});

const createMockTreeView = (subscriptionCallback: (e: { selection: unknown[] }) => void) => ({
  onDidChangeSelection: vi.fn((cb) => {
    subscriptionCallback.cb = cb;
    return { dispose: vi.fn() };
  }),
  __emitSelection: (selection: unknown[]) => {
    subscriptionCallback.cb?.({ selection });
  },
});

const createMockMenuContext = () => ({
  set: vi.fn(),
});

describe("TreeSelectionController", () => {
  let controller: TreeSelectionController;
  let mockTreeView: ReturnType<typeof createMockTreeView>;
  let mockMenuContext: ReturnType<typeof createMockMenuContext>;

  beforeEach(() => {
    mockMenuContext = createMockMenuContext();
    mockTreeView = createMockTreeView({} as never);
    controller = new TreeSelectionController(
      mockTreeView as never,
      mockMenuContext as never,
    );
  });

  describe("register", () => {
    it("should return a disposable from treeView.onDidChangeSelection", () => {
      const result = controller.register();

      expect(mockTreeView.onDidChangeSelection).toHaveBeenCalled();
      expect(result).toEqual({ dispose: expect.any(Function) });
    });

    it("should set IS_CURRENT_BRANCH context to true when current branch is selected", () => {
      controller.register();
      const currentBranchNode = createMockNode({ type: NodeType.Local, isCurrent: true });

      mockTreeView.__emitSelection([currentBranchNode]);

      expect(mockMenuContext.set).toHaveBeenCalledWith(
        CONTEXTS.IS_CURRENT_BRANCH,
        true,
      );
    });

    it("should set IS_CURRENT_BRANCH context to false when non-current branch is selected", () => {
      controller.register();
      const nonCurrentBranchNode = createMockNode({ type: NodeType.Local, isCurrent: false });

      mockTreeView.__emitSelection([nonCurrentBranchNode]);

      expect(mockMenuContext.set).toHaveBeenCalledWith(
        CONTEXTS.IS_CURRENT_BRANCH,
        false,
      );
    });

    it("should not set context for non-Local node types", () => {
      controller.register();
      const nonLocalNode = createMockNode({ type: NodeType.Remote, isCurrent: true });

      mockTreeView.__emitSelection([nonLocalNode]);

      expect(mockMenuContext.set).not.toHaveBeenCalled();
    });
  });
});