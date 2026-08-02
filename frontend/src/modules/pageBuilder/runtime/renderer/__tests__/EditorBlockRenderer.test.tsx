// @vitest-environment jsdom

import React from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import {
  useDraggable,
} from "@dnd-kit/core";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { useDragAndDrop } from "../../../hooks/editor/useDragAndDrop";
import { useRuntimeNode } from "../../../hooks/useRuntimeNode";
import { resolveDropBehavior } from "../../../core/dnd/DropResolver";
import { canMoveWithinDndSlots } from "../../../core/dnd/dndSlots";
import { RuntimeProvider } from "../../context/RuntimeProvider";
import { EditorBlockRenderer } from "../EditorBlockRenderer";

vi.mock("@dnd-kit/core", async () => {
  const actual = await vi.importActual<typeof import("@dnd-kit/core")>(
    "@dnd-kit/core"
  );

  return {
    ...actual,
    useDraggable: vi.fn(),
  };
});

vi.mock("../../../core/blockRegistry", () => ({
  blockRegistry: {
    section: {
      type: "section",
      label: "Section",
      category: "layout",
      isContainer: true,
      fields: [],
      rules: {
        allowedParents: ["root"],
        allowedChildren: ["text"],
      },
      component: ({ children }: { children?: React.ReactNode }) => (
        <section>{children}</section>
      ),
    },
    flex: {
      type: "flex",
      label: "Flex",
      category: "layout",
      isContainer: true,
      fields: [],
      rules: {
        allowedParents: ["root"],
        allowedChildren: ["flexItem"],
      },
      component: ({ children }: { children?: React.ReactNode }) => (
        <div>{children}</div>
      ),
    },
    flexItem: {
      type: "flexItem",
      label: "Flex Item",
      category: "layout",
      isContainer: true,
      fields: [],
      rules: {
        allowedParents: ["flex", "navbar", "footer"],
        allowedChildren: ["text", "button", "section"],
      },
      component: ({ children }: { children?: React.ReactNode }) => (
        <div>{children}</div>
      ),
    },
    grid: {
      type: "grid",
      label: "Grid",
      category: "layout",
      isContainer: true,
      fields: [],
      rules: {
        allowedParents: ["root", "section", "footer"],
        allowedChildren: ["gridItem"],
      },
      component: ({ children }: { children?: React.ReactNode }) => (
        <div>{children}</div>
      ),
    },
    gridItem: {
      type: "gridItem",
      label: "Grid Item",
      category: "layout",
      isContainer: true,
      fields: [],
      rules: {
        allowedParents: ["grid", "footer"],
        allowedChildren: ["text", "button", "section"],
      },
      component: ({ children }: { children?: React.ReactNode }) => (
        <div>{children}</div>
      ),
    },
    navbar: {
      type: "navbar",
      label: "Navbar",
      category: "layout",
      isContainer: true,
      fields: [],
      rules: {
        allowedParents: ["root"],
        allowedChildren: ["flexItem"],
      },
      component: ({ children }: { children?: React.ReactNode }) => (
        <nav>{children}</nav>
      ),
    },
    footer: {
      type: "footer",
      label: "Footer",
      category: "layout",
      isContainer: true,
      fields: [],
      rules: {
        allowedParents: ["root"],
        allowedChildren: [
          "flex",
          "flexItem",
          "grid",
          "gridItem",
          "title",
          "text",
          "image",
          "button",
          "link",
        ],
      },
      component: ({ children }: { children?: React.ReactNode }) => (
        <footer>{children}</footer>
      ),
    },
    text: {
      type: "text",
      label: "Text",
      category: "content",
      isContainer: false,
      fields: [],
      rules: {
        allowedParents: ["root", "section"],
        allowedChildren: [],
      },
      component: () => <div>Text block</div>,
    },
    button: {
      type: "button",
      label: "Button",
      category: "content",
      isContainer: false,
      fields: [],
      rules: {
        allowedParents: ["section", "flexItem", "gridItem"],
        allowedChildren: [],
      },
      component: () => <button>Button</button>,
    },
  },
}));

vi.mock("../RuntimeRenderer", async () => {
  const runtimeContext =
    await vi.importActual<typeof import("../../context/RuntimeProvider")>(
      "../../context/RuntimeProvider"
    );

  return {
    RuntimeRenderer: ({
    block,
    children,
  }: {
    block: { id: string; type: string };
    children?: React.ReactNode;
  }) => {
    const runtime =
      runtimeContext.useRuntime();

    return (
    <div
      ref={(node) =>
        runtime.registerRuntimeNode?.(
          block.id,
          node
        )
      }
      id={`pb-runtime-${block.id}`}
      data-testid="runtime-renderer"
      data-block-id={block.id}
      data-block-type={block.type}
    >
      {children}
    </div>
    );
  },
  };
});

type DragHandlers = ReturnType<typeof useDragAndDrop>;

const textBlock = (id: string) => ({
  id,
  type: "text" as const,
  data: { props: {}, style: {} },
  children: [],
});

const sectionBlock = (id: string) => ({
  id,
  type: "section" as const,
  data: { props: {}, style: {} },
  children: [],
});

const sectionWithChildren = (id: string, children: ReturnType<typeof textBlock>[]) => ({
  ...sectionBlock(id),
  children,
});

const flexWithChildren = (id: string, children: any[]) => ({
  id,
  type: "flex" as const,
  data: { props: {}, style: {} },
  children,
});

const flexItemBlock = (id: string) => ({
  id,
  type: "flexItem" as const,
  data: { props: {}, style: {} },
  children: [],
});

const gridItemBlock = (id: string) => ({
  id,
  type: "gridItem" as const,
  data: { props: {}, style: {} },
  children: [],
});

const gridWithChildren = (id: string, children: ReturnType<typeof gridItemBlock>[]) => ({
  id,
  type: "grid" as const,
  data: { props: {}, style: {} },
  children,
});

const navbarWithChildren = (id: string, children: any[]) => ({
  id,
  type: "navbar" as const,
  data: { props: {}, style: {} },
  children,
});

const footerWithChildren = (id: string, children: any[]) => ({
  id,
  type: "footer" as const,
  data: { props: {}, style: {} },
  children,
});

const renderIntoDom = (element: React.ReactElement) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  act(() => {
    root.render(element);
  });

  return { container, root };
};

const renderEditorBlock = (
  element: React.ReactElement
) =>
  renderIntoDom(
    <RuntimeProvider
      value={{
        mode: "editor",
        device: "desktop",
      }}
    >
      {element}
    </RuntimeProvider>
  );

const RuntimeNodeProbe = ({
  blockId,
  marker,
}: {
  blockId: string;
  marker: string;
}) => {
  const { rootProps } = useRuntimeNode({
    block: {
      id: blockId,
    },
    type: "section",
    droppable: false,
  });

  return (
    <div
      {...rootProps}
      data-testid="runtime-node-probe"
      data-marker={marker}
    />
  );
};

const cleanupRoot = (root: Root, container: HTMLElement) => {
  act(() => {
    root.unmount();
  });
  container.remove();
};

const installSemanticTarget = (
  id: string,
  type: string,
  top = 0,
  height = 100
) => {
  const targetElement = document.createElement("div");

  targetElement.id = `pb-runtime-${id}`;
  targetElement.dataset.blockId = id;
  targetElement.dataset.blockType = type;
  targetElement.dataset.droppableContainer = "true";
  targetElement.getBoundingClientRect = () =>
    ({
      top,
      bottom: top + height,
      left: 0,
      right: 100,
      width: 100,
      height,
      x: 0,
      y: top,
      toJSON: () => undefined,
    }) as DOMRect;
  document.body.appendChild(targetElement);

  Object.defineProperty(document, "elementsFromPoint", {
    configurable: true,
    value: vi.fn(() => [targetElement]),
  });

  return targetElement;
};

const renderDragHarness = (
  blocks: any[],
  moveBlock = vi.fn(),
  resolveDndSlot?: Parameters<typeof useDragAndDrop>[0]["resolveDndSlot"]
) => {
  let handlers: DragHandlers | null = null;

  const Harness = () => {
    handlers = useDragAndDrop({
      blocks,
      actions: {
        addBlock: vi.fn(),
        addBlockTree: vi.fn(),
        moveBlock,
      },
      resolveDndSlot,
    });

    return null;
  };

  const rendered = renderIntoDom(<Harness />);

  return {
    rendered,
    moveBlock,
    getHandlers: () => handlers,
  };
};

const runExistingDrag = (
  handlers: DragHandlers | null,
  activeId: string,
  type: string,
  clientY: number,
  overId: string
) => {
  const active = {
    id: activeId,
    data: { current: { type, isNew: false } },
    rect: { current: { translated: null } },
  };

  act(() => {
    handlers?.handleDragStart({
      active,
      activatorEvent: new MouseEvent("pointerdown", {
        clientX: 10,
        clientY,
      }),
    });
  });

  act(() => {
    handlers?.handleDragOver({
      active,
      over: { id: overId },
    } as any);
  });

  act(() => {
    handlers?.handleDragEnd({ active } as any);
  });
};

const dragActive = (
  id: string,
  type: string
) => ({
  id,
  data: { current: { type, isNew: false } },
  rect: { current: { translated: null } },
});

const beginDrag = (
  handlers: DragHandlers | null,
  active: ReturnType<typeof dragActive>,
  clientY: number
) => {
  act(() => {
    handlers?.handleDragStart({
      active,
      activatorEvent: new MouseEvent("pointerdown", {
        clientX: 10,
        clientY,
      }),
    });
  });
};

const hoverDrag = (
  handlers: DragHandlers | null,
  active: ReturnType<typeof dragActive>,
  overId: string | null
) => {
  act(() => {
    handlers?.handleDragOver({
      active,
      over: overId ? { id: overId } : null,
    } as any);
  });
};

const endDrag = (
  handlers: DragHandlers | null,
  active: ReturnType<typeof dragActive>
) => {
  act(() => {
    handlers?.handleDragEnd({ active } as any);
  });
};

describe("EditorBlockRenderer drag behavior", () => {
  let roots: Array<{ root: Root; container: HTMLElement }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    roots = [];
  });

  afterEach(() => {
    roots.forEach(({ root, container }) => cleanupRoot(root, container));
    roots = [];
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("preserves before or after resolver behavior for flex, grid, navbar, and footer", () => {
    expect(
      resolveDropBehavior({
        draggedType: "flexItem",
        targetType: "flex",
        calculatedPosition: "after",
        calculatedIndex: 2,
        targetChildrenCount: 3,
      })
    ).toMatchObject({
      allowed: true,
      position: "after",
      index: 2,
    });

    expect(
      resolveDropBehavior({
        draggedType: "gridItem",
        targetType: "grid",
        calculatedPosition: "before",
        calculatedIndex: 1,
        targetChildrenCount: 3,
      })
    ).toMatchObject({
      allowed: true,
      position: "before",
      index: 1,
    });

    expect(
      resolveDropBehavior({
        draggedType: "text",
        targetType: "flex",
        calculatedPosition: "before",
        calculatedIndex: 1,
        targetChildrenCount: 2,
      })
    ).toMatchObject({
      allowed: true,
      position: "before",
      index: 1,
      wrapperType: "flexItem",
    });

    expect(
      resolveDropBehavior({
        draggedType: "button",
        targetType: "grid",
        calculatedPosition: "after",
        calculatedIndex: 2,
        targetChildrenCount: 2,
      })
    ).toMatchObject({
      allowed: true,
      position: "after",
      index: 2,
      wrapperType: "gridItem",
    });

    expect(
      resolveDropBehavior({
        draggedType: "text",
        targetType: "navbar",
        calculatedPosition: "before",
        calculatedIndex: 0,
        targetChildrenCount: 1,
      })
    ).toMatchObject({
      allowed: false,
      position: "before",
      index: 0,
    });

    expect(
      resolveDropBehavior({
        draggedType: "input",
        targetType: "footer",
        calculatedPosition: "after",
        calculatedIndex: 1,
        targetChildrenCount: 1,
      })
    ).toMatchObject({
      allowed: false,
      position: "after",
      index: 1,
    });

    expect(
      resolveDropBehavior({
        draggedType: "flexItem",
        targetType: "navbar",
        calculatedPosition: "after",
        calculatedIndex: 1,
        targetChildrenCount: 1,
      })
    ).toMatchObject({
      allowed: true,
      position: "after",
      index: 1,
    });

    expect(
      resolveDropBehavior({
        draggedType: "text",
        targetType: "footer",
        calculatedPosition: "after",
        calculatedIndex: 1,
        targetChildrenCount: 1,
      })
    ).toMatchObject({
      allowed: true,
      position: "after",
      index: 1,
    });
  });

  it("measures the concrete runtime root and uses the toolbar handle as the activator", () => {
    const setNodeRef = vi.fn();
    const setActivatorNodeRef = vi.fn();
    const onPointerDown = vi.fn();

    vi.mocked(useDraggable).mockReturnValue({
      attributes: { role: "button", tabIndex: 0 },
      listeners: { onPointerDown },
      setNodeRef,
      setActivatorNodeRef,
      transform: { x: 12, y: 8, scaleX: 1, scaleY: 1 },
      isDragging: false,
      over: null,
      active: null,
      nodeRef: null,
    } as any);

    const rendered = renderEditorBlock(
      <EditorBlockRenderer
        block={textBlock("card-1")}
        device="desktop"
        selectedId="card-1"
        onSelect={() => undefined}
        onDelete={() => undefined}
        onDuplicate={() => undefined}
      />
    );
    roots.push(rendered);

    const wrapper = rendered.container.querySelector("#editor-card-1");
    const runtimeRoot = rendered.container.querySelector("#pb-runtime-card-1");
    const handle = rendered.container.querySelector(
      "[data-testid='block-drag-handle']"
    );

    expect(wrapper).toBeInstanceOf(HTMLElement);
    expect(runtimeRoot).toBeInstanceOf(HTMLElement);
    expect(handle).toBeInstanceOf(HTMLElement);
    expect(setNodeRef).toHaveBeenCalledWith(runtimeRoot);
    expect(setNodeRef).not.toHaveBeenCalledWith(wrapper);
    expect(setActivatorNodeRef).toHaveBeenCalledWith(handle);
    expect((wrapper as HTMLElement).style.transform).toBe("");

    act(() => {
      wrapper?.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, pointerId: 1 })
      );
    });
    expect(onPointerDown).not.toHaveBeenCalled();

    act(() => {
      handle?.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, pointerId: 1 })
      );
    });
    expect(onPointerDown).toHaveBeenCalledTimes(1);
    expect(
      rendered.container.querySelector("[data-testid='block-drag-handle']")
    ).toBeTruthy();
  });

  it("registers runtime node mount, replacement, and unmount through useRuntimeNode", () => {
    const registerRuntimeNode = vi.fn();
    const rendered = renderIntoDom(
      <RuntimeProvider
        value={{
          mode: "editor",
          device: "desktop",
          registerRuntimeNode,
        }}
      >
        <RuntimeNodeProbe
          key="first"
          blockId="probe-block"
          marker="first"
        />
      </RuntimeProvider>
    );
    roots.push(rendered);

    const firstNode =
      rendered.container.querySelector(
        "[data-testid='runtime-node-probe']"
      );

    expect(firstNode).toBeInstanceOf(HTMLElement);
    expect(registerRuntimeNode).toHaveBeenCalledWith(
      "probe-block",
      firstNode
    );

    act(() => {
      rendered.root.render(
        <RuntimeProvider
          value={{
            mode: "editor",
            device: "desktop",
            registerRuntimeNode,
          }}
        >
          <RuntimeNodeProbe
            key="second"
            blockId="probe-block"
            marker="second"
          />
        </RuntimeProvider>
      );
    });

    const secondNode =
      rendered.container.querySelector(
        "[data-testid='runtime-node-probe']"
      );

    expect(secondNode).toBeInstanceOf(HTMLElement);
    expect(secondNode).not.toBe(firstNode);
    expect(registerRuntimeNode).toHaveBeenCalledWith(
      "probe-block",
      null
    );
    expect(registerRuntimeNode).toHaveBeenLastCalledWith(
      "probe-block",
      secondNode
    );

    act(() => {
      rendered.root.unmount();
    });
    rendered.container.remove();
    roots = roots.filter(
      (entry) => entry !== rendered
    );

    expect(registerRuntimeNode).toHaveBeenLastCalledWith(
      "probe-block",
      null
    );
  });

  it("routes an existing sibling drag over another sibling into the move path", () => {
    installSemanticTarget("card-2", "section");
    const { rendered, moveBlock, getHandlers } = renderDragHarness([
      sectionBlock("card-1"),
      sectionBlock("card-2"),
    ]);
    roots.push(rendered);

    runExistingDrag(getHandlers(), "card-1", "section", 75, "card-2");

    expect(moveBlock).toHaveBeenCalledWith("card-1", {
      targetId: "card-2",
      position: "after",
      index: 1,
      wrapperType: undefined,
    });
  });

  it("calculates sibling indexes for A after C", () => {
    installSemanticTarget("C", "section");
    const { rendered, moveBlock, getHandlers } = renderDragHarness([
      sectionBlock("A"),
      sectionBlock("B"),
      sectionBlock("C"),
    ]);
    roots.push(rendered);

    runExistingDrag(getHandlers(), "A", "section", 75, "C");

    expect(moveBlock).toHaveBeenCalledWith("A", {
      targetId: "C",
      position: "after",
      index: 2,
      wrapperType: undefined,
    });
  });

  it("calculates sibling indexes for C before B", () => {
    installSemanticTarget("B", "section");
    const { rendered, moveBlock, getHandlers } = renderDragHarness([
      sectionBlock("A"),
      sectionBlock("B"),
      sectionBlock("C"),
    ]);
    roots.push(rendered);

    runExistingDrag(getHandlers(), "C", "section", 25, "B");

    expect(moveBlock).toHaveBeenCalledWith("C", {
      targetId: "B",
      position: "before",
      index: 1,
      wrapperType: undefined,
    });
  });

  it("calculates sibling indexes for B after D", () => {
    installSemanticTarget("D", "section");
    const { rendered, moveBlock, getHandlers } = renderDragHarness([
      sectionBlock("A"),
      sectionBlock("B"),
      sectionBlock("C"),
      sectionBlock("D"),
    ]);
    roots.push(rendered);

    runExistingDrag(getHandlers(), "B", "section", 75, "D");

    expect(moveBlock).toHaveBeenCalledWith("B", {
      targetId: "D",
      position: "after",
      index: 3,
      wrapperType: undefined,
    });
  });

  it("moves within the same parent in both directions", () => {
    installSemanticTarget("C", "section");
    const forward = renderDragHarness([
      sectionBlock("A"),
      sectionBlock("B"),
      sectionBlock("C"),
    ]);
    roots.push(forward.rendered);

    runExistingDrag(forward.getHandlers(), "A", "section", 75, "C");

    expect(forward.moveBlock).toHaveBeenCalledWith("A", {
      targetId: "C",
      position: "after",
      index: 2,
      wrapperType: undefined,
    });

    installSemanticTarget("B", "section");
    const backward = renderDragHarness([
      sectionBlock("A"),
      sectionBlock("B"),
      sectionBlock("C"),
    ]);
    roots.push(backward.rendered);

    runExistingDrag(backward.getHandlers(), "C", "section", 25, "B");

    expect(backward.moveBlock).toHaveBeenCalledWith("C", {
      targetId: "B",
      position: "before",
      index: 1,
      wrapperType: undefined,
    });
  });

  it("moves between different valid parents", () => {
    installSemanticTarget("C", "flexItem");
    const { rendered, moveBlock, getHandlers } = renderDragHarness([
      flexWithChildren("parent-1", [flexItemBlock("A")]),
      flexWithChildren("parent-2", [flexItemBlock("C")]),
    ]);
    roots.push(rendered);

    runExistingDrag(getHandlers(), "A", "flexItem", 75, "C");

    expect(moveBlock).toHaveBeenCalledWith("A", {
      targetId: "C",
      position: "after",
      index: 1,
      wrapperType: undefined,
    });
  });

  it("rejects an incompatible before or after destination through the hook", () => {
    installSemanticTarget("child", "text");
    const { rendered, moveBlock, getHandlers } = renderDragHarness([
      sectionWithChildren("parent", [textBlock("child")]),
      sectionBlock("section-to-move"),
    ]);
    roots.push(rendered);

    runExistingDrag(getHandlers(), "section-to-move", "section", 25, "child");

    expect(moveBlock).not.toHaveBeenCalled();
  });

  it("rejects an invalid inside drop through the hook", () => {
    installSemanticTarget("text-target", "text");
    const { rendered, moveBlock, getHandlers } = renderDragHarness([
      textBlock("text-target"),
      sectionBlock("section-to-move"),
    ]);
    roots.push(rendered);

    runExistingDrag(getHandlers(), "section-to-move", "section", 75, "text-target");

    expect(moveBlock).not.toHaveBeenCalled();
  });

  it("rejects moving a block into its own descendant through the hook", () => {
    installSemanticTarget("child", "text");
    const { rendered, moveBlock, getHandlers } = renderDragHarness([
      sectionWithChildren("parent", [textBlock("child")]),
    ]);
    roots.push(rendered);

    runExistingDrag(getHandlers(), "parent", "section", 25, "child");

    expect(moveBlock).not.toHaveBeenCalled();
  });

  it("rejects locked block moves through the hook", () => {
    installSemanticTarget("target", "text");
    const locked = {
      ...textBlock("locked"),
      meta: {
        isLocked: true,
      },
    };
    const { rendered, moveBlock, getHandlers } = renderDragHarness([
      locked,
      textBlock("target"),
    ]);
    roots.push(rendered);

    runExistingDrag(getHandlers(), "locked", "text", 75, "target");

    expect(moveBlock).not.toHaveBeenCalled();
  });

  it("rejects drops into locked destination containers through the hook", () => {
    const lockedParent = {
      ...flexWithChildren("locked-parent", [flexItemBlock("child")]),
      meta: {
        isLocked: true,
      },
    };

    installSemanticTarget("child", "flexItem");

    const { rendered, moveBlock, getHandlers } = renderDragHarness([
      flexItemBlock("moving-item"),
      lockedParent,
    ]);
    roots.push(rendered);

    runExistingDrag(getHandlers(), "moving-item", "flexItem", 25, "child");

    expect(moveBlock).not.toHaveBeenCalled();
  });

  it("does not use a stale valid destination after hovering an invalid target", () => {
    installSemanticTarget("B", "section");
    const { rendered, moveBlock, getHandlers } = renderDragHarness([
      sectionBlock("A"),
      sectionBlock("B"),
      sectionWithChildren("parent", [textBlock("child")]),
    ]);
    roots.push(rendered);

    const active = dragActive("A", "section");

    beginDrag(getHandlers(), active, 75);
    hoverDrag(getHandlers(), active, "B");
    installSemanticTarget("child", "text");
    hoverDrag(getHandlers(), active, "child");
    endDrag(getHandlers(), active);

    expect(moveBlock).not.toHaveBeenCalled();
  });

  it("does not use a stale valid destination after leaving all droppable targets", () => {
    installSemanticTarget("B", "section");
    const { rendered, moveBlock, getHandlers } = renderDragHarness([
      sectionBlock("A"),
      sectionBlock("B"),
    ]);
    roots.push(rendered);

    const active = dragActive("A", "section");

    beginDrag(getHandlers(), active, 75);
    hoverDrag(getHandlers(), active, "B");
    Object.defineProperty(document, "elementsFromPoint", {
      configurable: true,
      value: vi.fn(() => []),
    });
    hoverDrag(getHandlers(), active, null);
    endDrag(getHandlers(), active);

    expect(moveBlock).not.toHaveBeenCalled();
  });

  it("rejects moving global navbar or footer blocks into normal page content", () => {
    expect(
      canMoveWithinDndSlots(
        "navbar",
        "page",
        "page-section"
      )
    ).toBe(false);

    expect(
      canMoveWithinDndSlots(
        "footer",
        "page",
        "page-section"
      )
    ).toBe(false);
  });

  it("rejects moving normal page blocks into global layout", () => {
    expect(
      canMoveWithinDndSlots(
        "page",
        "navbar",
        "global-navbar-child"
      )
    ).toBe(false);

    expect(
      canMoveWithinDndSlots(
        "page",
        "footer",
        "global-footer-child"
      )
    ).toBe(false);
  });

  it.each([
    {
      label: "global navbar block over page content",
      activeId: "navbar-item",
      activeType: "flexItem",
      overId: "page-section",
      overType: "section",
      slots: {
        "navbar-item": "navbar",
        "page-section": "page",
      },
      blocks: [
        navbarWithChildren("navbar", [
          flexItemBlock("navbar-item"),
        ]),
        sectionBlock("page-section"),
      ],
    },
    {
      label: "global footer block over page content",
      activeId: "footer-item",
      activeType: "flexItem",
      overId: "page-section",
      overType: "section",
      slots: {
        "footer-item": "footer",
        "page-section": "page",
      },
      blocks: [
        footerWithChildren("footer", [
          flexItemBlock("footer-item"),
        ]),
        sectionBlock("page-section"),
      ],
    },
    {
      label: "page block over navbar",
      activeId: "page-item",
      activeType: "flexItem",
      overId: "navbar-item",
      overType: "flexItem",
      slots: {
        "page-item": "page",
        "navbar-item": "navbar",
      },
      blocks: [
        flexItemBlock("page-item"),
        navbarWithChildren("navbar", [
          flexItemBlock("navbar-item"),
        ]),
      ],
    },
    {
      label: "page block over footer",
      activeId: "page-item",
      activeType: "flexItem",
      overId: "footer-item",
      overType: "flexItem",
      slots: {
        "page-item": "page",
        "footer-item": "footer",
      },
      blocks: [
        flexItemBlock("page-item"),
        footerWithChildren("footer", [
          flexItemBlock("footer-item"),
        ]),
      ],
    },
    {
      label: "navbar block over footer",
      activeId: "navbar-item",
      activeType: "flexItem",
      overId: "footer-item",
      overType: "flexItem",
      slots: {
        "navbar-item": "navbar",
        "footer-item": "footer",
      },
      blocks: [
        navbarWithChildren("navbar", [
          flexItemBlock("navbar-item"),
        ]),
        footerWithChildren("footer", [
          flexItemBlock("footer-item"),
        ]),
      ],
    },
  ])(
    "denies cross-slot hover resolution for $label",
    ({ activeId, activeType, overId, overType, slots, blocks }) => {
      installSemanticTarget(overId, overType);
      const moveBlock = vi.fn();
      const resolveDndSlot = (blockId?: string) =>
        ((slots as Record<string, any>)[String(blockId)] || "page");
      const { rendered, getHandlers } = renderDragHarness(
        blocks,
        moveBlock,
        resolveDndSlot
      );
      roots.push(rendered);

      const active = dragActive(activeId, activeType);

      beginDrag(getHandlers(), active, 75);
      hoverDrag(getHandlers(), active, overId);

      expect(getHandlers()?.isAllowed).toBe(false);
      expect(getHandlers()?.overId).toBe(overId);
      expect(getHandlers()?.dropPosition).not.toBeNull();

      endDrag(getHandlers(), active);

      expect(moveBlock).not.toHaveBeenCalled();
    }
  );

  it("allows movement within the same navbar slot through the drag pipeline", () => {
    installSemanticTarget("navbar-item-b", "flexItem");
    const moveBlock = vi.fn();
    const resolveDndSlot = () => "navbar" as const;
    const { rendered, getHandlers } = renderDragHarness(
      [
        navbarWithChildren("navbar", [
          flexItemBlock("navbar-item-a"),
          flexItemBlock("navbar-item-b"),
        ]),
      ],
      moveBlock,
      resolveDndSlot
    );
    roots.push(rendered);

    runExistingDrag(
      getHandlers(),
      "navbar-item-a",
      "flexItem",
      75,
      "navbar-item-b"
    );

    expect(getHandlers()?.isAllowed).toBe(true);
    expect(moveBlock).toHaveBeenCalledWith("navbar-item-a", {
      targetId: "navbar-item-b",
      position: "after",
      index: 1,
      wrapperType: undefined,
    });
  });

  it("clears pending drag state on cancel", () => {
    installSemanticTarget("B", "section");
    const { rendered, moveBlock, getHandlers } = renderDragHarness([
      sectionBlock("A"),
      sectionBlock("B"),
    ]);
    roots.push(rendered);

    const active = {
      id: "A",
      data: { current: { type: "section", isNew: false } },
      rect: { current: { translated: null } },
    };

    act(() => {
      getHandlers()?.handleDragStart({
        active,
        activatorEvent: new MouseEvent("pointerdown", {
          clientX: 10,
          clientY: 75,
        }),
      });
    });

    act(() => {
      getHandlers()?.handleDragOver({
        active,
        over: { id: "B" },
      } as any);
    });

    act(() => {
      getHandlers()?.handleDragCancel();
    });

    act(() => {
      getHandlers()?.handleDragEnd({ active } as any);
    });

    expect(moveBlock).not.toHaveBeenCalled();
  });

  it("keeps duplicate and delete controls wired to their existing handlers", () => {
    const setNodeRef = vi.fn();
    const setActivatorNodeRef = vi.fn();
    const onDelete = vi.fn();
    const onDuplicate = vi.fn();

    vi.mocked(useDraggable).mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef,
      setActivatorNodeRef,
      transform: null,
      isDragging: false,
      over: null,
      active: null,
      nodeRef: null,
    } as any);

    const rendered = renderEditorBlock(
      <EditorBlockRenderer
        block={textBlock("card-1")}
        device="desktop"
        selectedId="card-1"
        onSelect={() => undefined}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
      />
    );
    roots.push(rendered);

    const duplicate = rendered.container.querySelector(
      "[data-testid='block-duplicate-button']"
    );
    const deleteButton = rendered.container.querySelector(
      "[data-testid='block-delete-button']"
    );

    act(() => {
      (duplicate as HTMLElement).click();
    });
    expect(onDuplicate).toHaveBeenCalledWith("card-1");

    act(() => {
      (deleteButton as HTMLElement).click();
    });
    expect(onDelete).toHaveBeenCalledWith("card-1");
  });

  it("renders inside, before, and after indicators from hover data", () => {
    const setNodeRef = vi.fn();
    const setActivatorNodeRef = vi.fn();

    vi.mocked(useDraggable).mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef,
      setActivatorNodeRef,
      transform: null,
      isDragging: false,
      over: null,
      active: null,
      nodeRef: null,
    } as any);

    const renderIndicator = (
      dropPosition: "before" | "after" | "inside"
    ) => {
      const rendered = renderEditorBlock(
        <EditorBlockRenderer
          block={textBlock("card-1")}
          device="desktop"
          selectedId="card-1"
          hoverData={{
            overId: "card-1",
            dropPosition,
            isAllowed: false,
          }}
        />
      );
      roots.push(rendered);
      return rendered;
    };

    expect(
      renderIndicator("before").container.querySelector(
        "[data-testid='drop-indicator-before']"
      )
    ).toBeTruthy();
    expect(
      renderIndicator("after").container.querySelector(
        "[data-testid='drop-indicator-after']"
      )
    ).toBeTruthy();
    expect(
      renderIndicator("inside").container.querySelector(
        "[data-testid='drop-indicator-inside']"
      )
    ).toBeTruthy();
  });
});
