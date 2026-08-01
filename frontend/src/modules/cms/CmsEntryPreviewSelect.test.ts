import {
  describe,
  expect,
  it
} from "vitest";

import {
  findTemplateCollection,
  getCmsEntryPreviewReadOnly,
  getCmsEntryPreviewLabel,
  getCmsPreviewSaveBlocks,
  isCmsPreviewMutationAllowed,
  runUnlessCmsPreviewActive,
  selectPreviewBlocks
} from "./CmsEntryPreviewSelect";

import {
  resolveCmsBindingsInTree
} from "./utils/cmsBinding.resolver";

import {
  getEditorCanvasMutationHandlers,
  getEditorCanvasRuntimeMode
} from "../pageBuilder/components/editor/EditorCanvas";

describe("CmsEntryPreviewSelect helpers", () => {
  it("finds only collections assigned to the current page template", () => {
    const collections: any[] = [
      {
        id: 1,
        templatePageId: 10
      },
      {
        id: 2,
        templatePageId: 20
      }
    ];

    expect(
      findTemplateCollection(
        collections,
        20
      )?.id
    ).toBe(2);

    expect(
      findTemplateCollection(
        collections,
        30
      )
    ).toBeUndefined();
  });

  it("labels entries by title, name, slug, then id", () => {
    expect(
      getCmsEntryPreviewLabel({
        id: 1,
        siteId: 1,
        collectionId: 1,
        status: "draft",
        slug: "slug",
        data: {
          title: "Title"
        }
      })
    ).toBe("Title");

    expect(
      getCmsEntryPreviewLabel({
        id: 2,
        siteId: 1,
        collectionId: 1,
        status: "draft",
        slug: "slug",
        data: {
          name: "Name"
        }
      })
    ).toBe("Name");

    expect(
      getCmsEntryPreviewLabel({
        id: 3,
        siteId: 1,
        collectionId: 1,
        status: "draft",
        slug: "slug",
        data: {}
      })
    ).toBe("slug");
  });

  it("uses preview blocks only when present", () => {
    const original = [
      {
        id: "original"
      }
    ];

    const preview = [
      {
        id: "preview"
      }
    ];

    expect(
      selectPreviewBlocks(
        original,
        preview
      )
    ).toBe(preview);

    expect(
      selectPreviewBlocks(
        original,
        null
      )
    ).toBe(original);
  });

  it("marks the canvas read-only only when a CMS entry preview is active", () => {
    const preview: any = {
      collection: {
        id: 1
      },
      entry: {
        id: 2
      }
    };

    expect(
      getCmsEntryPreviewReadOnly(
        preview
      )
    ).toBe(true);

    expect(
      getCmsEntryPreviewReadOnly(
        null
      )
    ).toBe(false);

    expect(
      getEditorCanvasRuntimeMode(
        true
      )
    ).toBe("preview");

    expect(
      getEditorCanvasRuntimeMode(
        false
      )
    ).toBe("editor");
  });

  it("does not expose canvas update, delete, or duplicate handlers in read-only preview", () => {
    const handlers =
      getEditorCanvasMutationHandlers(
        true,
        {
          onUpdate: () => undefined,
          onDelete: () => undefined,
          onDuplicate: () => undefined
        }
      );

    expect(
      handlers.onUpdate
    ).toBeUndefined();

    expect(
      handlers.onDelete
    ).toBeUndefined();

    expect(
      handlers.onDuplicate
    ).toBeUndefined();
  });

  it("restores canvas editing when CMS entry preview is cleared", () => {
    const onUpdate = () => undefined;
    const onDelete = () => undefined;
    const onDuplicate = () => undefined;

    const handlers =
      getEditorCanvasMutationHandlers(
        false,
        {
          onUpdate,
          onDelete,
          onDuplicate
        }
      );

    expect(
      handlers.onUpdate
    ).toBe(onUpdate);

    expect(
      handlers.onDelete
    ).toBe(onDelete);

    expect(
      handlers.onDuplicate
    ).toBe(onDuplicate);
  });

  it("ignores update, delete, duplicate, drag/drop, and inspector mutations during preview", () => {
    const preview: any = {
      collection: {
        id: 1
      },
      entry: {
        id: 2
      }
    };

    const calls: string[] = [];

    expect(
      isCmsPreviewMutationAllowed(
        preview
      )
    ).toBe(false);

    expect(
      runUnlessCmsPreviewActive(
        preview,
        () => calls.push("update")
      )
    ).toBe(false);

    expect(
      runUnlessCmsPreviewActive(
        preview,
        () => calls.push("delete")
      )
    ).toBe(false);

    expect(
      runUnlessCmsPreviewActive(
        preview,
        () => calls.push("duplicate")
      )
    ).toBe(false);

    expect(
      runUnlessCmsPreviewActive(
        preview,
        () => calls.push("drag-drop")
      )
    ).toBe(false);

    expect(
      runUnlessCmsPreviewActive(
        preview,
        () => calls.push("inspector")
      )
    ).toBe(false);

    expect(calls).toEqual([]);
  });

  it("allows mutation guards again after clearing preview", () => {
    const calls: string[] = [];

    expect(
      isCmsPreviewMutationAllowed(
        null
      )
    ).toBe(true);

    expect(
      runUnlessCmsPreviewActive(
        null,
        () => calls.push("edit")
      )
    ).toBe(true);

    expect(calls).toEqual([
      "edit"
    ]);
  });

  it("keeps the canonical cms token tree unchanged while preview resolves values", () => {
    const originalBlocks = [
      {
        id: "title",
        type: "title",
        props: {
          text: "{{cms.title}}"
        },
        children: []
      }
    ];

    const previewBlocks =
      resolveCmsBindingsInTree(
        originalBlocks,
        {
          title: "Resolved title"
        },
        [
          {
            id: 1,
            key: "title",
            name: "Title",
            type: "text"
          } as any
        ]
      );

    expect(
      previewBlocks[0].props.text
    ).toBe("Resolved title");

    expect(
      originalBlocks[0].props.text
    ).toBe("{{cms.title}}");
  });

  it("saving uses the original unresolved blocks instead of preview blocks", () => {
    const originalBlocks = [
      {
        id: "title",
        props: {
          text: "{{cms.title}}"
        }
      }
    ];

    const saveBlocks =
      getCmsPreviewSaveBlocks(
        originalBlocks
      );

    expect(saveBlocks).toBe(
      originalBlocks
    );

    expect(
      saveBlocks[0].props.text
    ).toBe("{{cms.title}}");
  });
});
