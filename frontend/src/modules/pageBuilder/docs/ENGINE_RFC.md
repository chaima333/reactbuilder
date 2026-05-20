# Page Builder Engine RFC

## Canonical Tree Contracts

The runtime tree is the only durable document model. Every block is:

```ts
{
  id: string;
  type: BlockType;
  data: { props: Record<string, unknown>; style: ResponsiveStyle };
  children: Block[];
}
```

Block capabilities live in `core/schema/canonicalSchema.ts`. Each block type defines:

- `accepts`
- `rejects`
- `allowedChildren`
- `wrapperRules`
- `transformRules`

The UI registry may describe icons, labels, fields, and components, but it must not own semantic rules.

## Resolver Contracts

The drop resolver consumes canonical schema rules and returns a pure decision:

```ts
{
  allowed: boolean;
  position: "before" | "after" | "inside";
  index: number;
  wrapperType?: "gridItem" | "flexItem";
}
```

Editor wrappers never participate in collision logic. `elementsFromPoint()` is filtered through `isSemanticDroppableElement()`, which only accepts runtime nodes with:

- `id="pb-runtime-*"`
- `data-droppable-container="true"`
- `data-block-type` in `section | flex | grid | flexItem | gridItem`

## Runtime / Editor Boundary

Runtime components render only from props:

- `block`
- `data`
- `device`
- `children`

Runtime components must not read editor selection, editor history, or DnD state. Editor chrome is visually passive and may wrap runtime output, but it cannot become a semantic target.

## Operation Lifecycle

All durable mutations must flow through operations:

- `INSERT_BLOCK`
- `MOVE_BLOCK`
- `WRAP_BLOCK`
- `DELETE_BLOCK`
- `TRANSFORM_BLOCK`
- `UPDATE_PROPS`
- `UPDATE_STYLE`

The operation gateway validates invariants before and after applying an operation. Operation replay is deterministic and powers undo/redo, serialization replay, and import/export replay.

## Invariants

Before render and before publish, the engine validates:

- no cycles
- no duplicate IDs
- no invalid nesting
- no orphaned semantic ownership
- no illegal wrappers
- no unknown block types

## Publishing Pipeline

Publishing never emits directly from transient editor state.

```txt
Editor blocks
  -> hydrate/normalize canonical tree
  -> validate invariants
  -> serialize document
  -> validate document
  -> static runtime output
```

## AI Boundary

AI systems must generate canonical block trees, not HTML. AI output enters through `acceptAICanonicalTree()`, then normalization and invariants decide whether it can enter the editor.

## Performance Instrumentation

The engine exposes metrics for:

- block count
- max render depth
- recursive cost
- drag collision duration
- semantic candidate count

These metrics are diagnostics only and must not affect rendering behavior.
