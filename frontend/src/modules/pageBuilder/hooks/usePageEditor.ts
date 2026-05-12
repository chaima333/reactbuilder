import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  useGetPageByIdQuery,
  useGetPageVersionsQuery,
  useRestorePageVersionMutation,
} from "../../../redux/services/pages.api";
import { blockRegistry as staticRegistry } from "../core/blockRegistry";
import { loadBlockRegistry } from "../core/loadBlockRegistry";
import { Block, BlockType } from "../types/page.types";
import { useHistory } from "../core/history/useHistory";
import { moveBlockInTree } from "../core/tree/move";
import { defaultTokens } from "../core/theme/tokens";
import { fromAPIToUI } from "../adapters/pageAdapter";
import { insertBlock } from "../core/tree/insert";
import { useVersionActions } from "./useVersionActions";
import { duplicateBlock as duplicateBlockUtil } from "../core/tree/clipboard";

// 1. استيراد الـ Hook الجديد اللي صنعناه
import { usePagePersistence } from "./usePagePersistence";

export const usePageEditor = (mode: "create" | "edit") => {
  const { siteId, pageId } = useParams<{ siteId: string; pageId: string }>();

  const isEdit = mode === "edit";
  const sId = Number(siteId) || 0;
  const pId = Number(pageId) || 0;

  // =========================
  // API QUERIES
  // =========================
  const { data: pageData, isLoading } = useGetPageByIdQuery(
    { siteId: sId, pageId: pId },
    { skip: !isEdit || sId === 0 || pId === 0 }
  );

  const { data: versions = [], isLoading: isLoadingVersions } = useGetPageVersionsQuery(
    { siteId: sId, pageId: pId },
    { skip: !isEdit }
  );

  // تم حذف الـ Mutations القديمة من هنا لأنها انتقلت للـ usePagePersistence
  const [restorePageVersion] = useRestorePageVersionMutation();

  // =========================
  // STATES
  // =========================
  const [pageTitle, setPageTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [registry, setRegistry] = useState(staticRegistry);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [tokens, setTokens] = useState(defaultTokens);
  const hasLoadedRef = useRef(false);

  // =========================
  // HISTORY
  // =========================
  const {
    state: blocks,
    set: setBlocks,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<Block[]>([]);

  const pushHistory = (snapshot: Block[]) => {
    setBlocks(structuredClone(snapshot));
  };

  // =========================
  // PERSISTENCE (الربط الجديد) 🚀
  // =========================
  const { save, publish, isSaving, isPublishing } = usePagePersistence({
    sId,
    pId,
    pageTitle,
    slug,
    blocks,
    tokens,
  });

  // =========================
  // VERSIONS
  // =========================
  const versionActions = useVersionActions({
    blocks,
    setBlocks,
    setSelectedBlockId,
    pushHistory,
    versions,
    restorePageVersion,
    siteId: sId,
    pageId: pId,
  });

  // =========================
  // LOADERS
  // =========================
  useEffect(() => {
    loadBlockRegistry().then(setRegistry);
  }, []);

  useEffect(() => {
    if (isEdit && pageData && !hasLoadedRef.current) {
      const data = (pageData as any)?.data || pageData;
      if (data) {
        setPageTitle(data.title || "Untitled Page");
        setTokens(data.theme || defaultTokens);
        setSlug(data.slug || "");
        const uiBlocks = fromAPIToUI(data.blocks || []) as Block[];
        setBlocks(uiBlocks);
        hasLoadedRef.current = true;
      }
    }
  }, [pageData, isEdit, setBlocks]);

  // =========================
  // HELPERS
  // =========================
  const findBlockInTree = useCallback((tree: Block[], id: string): Block | null => {
    for (const node of tree) {
      if (node.id === id) return node;
      if (node.children?.length) {
        const found = findBlockInTree(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const selectedBlock = useMemo(() => {
    return findBlockInTree(blocks, selectedBlockId || "");
  }, [blocks, selectedBlockId, findBlockInTree]);

  // =========================
  // ACTIONS
  // =========================
  const actions = useMemo(
    () => ({
      addBlock: (type: BlockType, targetId?: string, position: "before" | "after" | "inside" = "inside") => {
        const config = registry[type];
        if (!config) return;

        const newBlock: Block = {
          id: uuidv4(),
          type,
          data: {
            props: structuredClone(config.defaultData?.props || {}),
            style: structuredClone(config.defaultData?.style || { desktop: {}, tablet: {}, mobile: {} }),
          },
          children: [],
        };

        setBlocks((currentBlocks) => {
          if (!targetId || targetId === "canvas-root") return [...currentBlocks, newBlock];
          const insertIntoTree = (tree: Block[]): Block[] => {
            return tree.flatMap((b) => {
              if (b.id === targetId) {
                if (position === "before") return [newBlock, b];
                if (position === "after") return [b, newBlock];
                if (position === "inside") return [{ ...b, children: [...(b.children || []), newBlock] }];
              }
              return [{ ...b, children: b.children ? insertIntoTree(b.children) : [] }];
            });
          };
          return insertIntoTree(currentBlocks);
        });
        setSelectedBlockId(newBlock.id);
      },

      updateBlock: (id: string, newData: any) => {
        setBlocks((prevBlocks) => {
          const update = (tree: Block[]): Block[] =>
            tree.map((b) => {
              if (b.id === id) {
                const updated = structuredClone(b);
                if (newData.props) updated.data.props = { ...updated.data.props, ...newData.props };
                if (newData.style) {
                  updated.data.style = {
                    desktop: { ...(updated.data.style.desktop || {}), ...(newData.style.desktop || {}) },
                    tablet: { ...(updated.data.style.tablet || {}), ...(newData.style.tablet || {}) },
                    mobile: { ...(updated.data.style.mobile || {}), ...(newData.style.mobile || {}) },
                  };
                }
                return updated;
              }
              return { ...b, children: b.children ? update(b.children) : [] };
            });
          return update(prevBlocks);
        });
      },

      deleteBlock: (id: string) => {
        setBlocks((prevBlocks) => {
          const remove = (tree: Block[]): Block[] =>
            tree.filter((b) => b.id !== id).map((b) => ({ ...b, children: b.children ? remove(b.children) : [] }));
          return remove(prevBlocks);
        });
        setSelectedBlockId((current) => (current === id ? null : current));
      },

      duplicateBlock: (id: string) => {
        setBlocks((prevBlocks) => {
          const target = findBlockInTree(prevBlocks, id);
          if (!target) return prevBlocks;
          const duplicated = duplicateBlockUtil(target);
          return insertBlock(prevBlocks, { targetId: id, type: "after" }, duplicated);
        });
      },

      moveBlock: (activeId: string, dropInfo: any) => {
        setBlocks((current) => moveBlockInTree(current, activeId, dropInfo));
      },

      undo,
      redo,
      // الـ save و الـ publish جايين مالـ usePagePersistence
      save,
      publish,
    }),
    [registry, blocks, pageTitle, tokens, sId, pId, undo, redo, setBlocks, save, publish, findBlockInTree]
  );

  return {
    blocks,
    pageTitle,
    slug,
    setSlug,
    setPageTitle,
    tokens,
    updateToken: (newTokens: any) => setTokens((prev) => ({ ...prev, ...newTokens })),
    selectedBlock,
    selectedBlockId,
    setSelectedBlockId,
    actions: {
      ...actions,
      restoreVersion: versionActions.restoreVersion,
    },
    registry,
    isLoading,
    isSaving,
    isPublishing, // زدناها في الـ return
    isLoadingVersions,
    versions,
    canUndo,
    canRedo,
  };
};