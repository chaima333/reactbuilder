import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

// API & Services
import {
  useGetPageByIdQuery,
  useGetPageVersionsQuery,
  useRestorePageVersionMutation,
} from "../../../redux/services/pages.api";

// Core Utilities
import { blockRegistry as staticRegistry } from "../core/blockRegistry";
import { loadBlockRegistry } from "../core/loadBlockRegistry";
import { Block, BlockType } from "../types/page.types";
import { useHistory } from "../core/history/useHistory";
import { moveBlockInTree } from "../core/tree/move";
import { insertBlock } from "../core/tree/insert";
import { duplicateBlock as duplicateBlockUtil } from "../core/tree/clipboard";
import { defaultTokens } from "../core/theme/tokens";
import { fromAPIToUI } from "../adapters/pageAdapter";

// Secondary Hooks
import { usePagePersistence } from "./usePagePersistence";
import { useVersionActions } from "./useVersionActions";
import { normalizeTree } from "../runtime/normalizeTree";

export const usePageEditor = (mode: "create" | "edit") => {
  const { siteId, pageId } = useParams<{ siteId: string; pageId: string }>();

  const isEdit = mode === "edit";
  const sId = Number(siteId) || 0;
  const pId = Number(pageId) || 0;

  // =========================
  // 1. API QUERIES
  // =========================
  const { data: pageData, isLoading } = useGetPageByIdQuery(
    { siteId: sId, pageId: pId },
    { skip: !isEdit || sId === 0 || pId === 0 }
  );

  const { data: versions = [], isLoading: isLoadingVersions } = useGetPageVersionsQuery(
    { siteId: sId, pageId: pId },
    { skip: !isEdit }
  );

  const [restorePageVersion] = useRestorePageVersionMutation();

  // =========================
  // 2. STATES & HISTORY
  // =========================
  const [pageTitle, setPageTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [registry, setRegistry] = useState(staticRegistry);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [tokens, setTokens] = useState(defaultTokens);
  const hasLoadedRef = useRef(false);

  const {
    state: blocks,
    set: setBlocks,
    undo,
    redo,
    reset: resetHistory,
    canUndo,
    canRedo,
  } = useHistory<Block[]>([]);

  // =========================
  // 3. VALIDATION (FIXED)
  // =========================
  const errors = useMemo(() => {
    const allErrors: any[] = [];
    
    const validateTree = (tree: Block[]) => {
      if (!tree || !Array.isArray(tree)) return; // 🛡️ Safety check

      tree.forEach((block) => {
        const config = registry[block.type as BlockType];
        if (config?.fields) {
          config.fields.forEach((field: any) => {
            if (field.validation?.required) {
              const value = block.data.props?.[field.key];
              if (value === undefined || value === null || value.toString().trim() === "") {
                allErrors.push({
                  blockId: block.id,
                  field: field.key,
                  message: `${config.label}: الحقل ${field.label} مطلوب`,
                });
              }
            }
          });
        }
        // 🛡️ FIX: Only validate children if they exist and is an array
        if (block.children && Array.isArray(block.children) && block.children.length > 0) {
          validateTree(block.children);
        }
      });
    };

    validateTree(blocks);
    return allErrors;
  }, [blocks, registry]);

  // =========================
  // 4. PERSISTENCE
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
  // 5. HELPERS
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
  // 6. ACTIONS
  // =========================
  const actions = useMemo(
    () => ({
     addBlock: (type: string, targetId?: string, position: string = "inside", presetData?: any) => {
  const createBlockWithChildren = (blockData: any): any => {
    const id = uuidv4();
    return {
      id,
      type: blockData.type,
      data: blockData.data || { props: {}, style: { desktop: {} } },
      children: (blockData.children || []).map((child: any) => createBlockWithChildren(child))
    };
  };

  let newBlock;
  if (presetData) {
    newBlock = createBlockWithChildren(presetData);
  } else {
    const config = registry[type as BlockType];
    newBlock = {
      id: uuidv4(),
      type,
      data: {
        props: structuredClone(config?.defaultData?.props || {}),
        style: structuredClone(config?.defaultData?.style || { desktop: {} }),
      },
      children: [],
    };
  }

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
                
                // 📝 تحسين تحديث الـ Props:
                // نستخدم SpreadOperator باش نحافظو على النص القديم في الحقول اللي متبدلتش
                if (newData.props) {
                   updated.data.props = { 
                     ...updated.data.props, 
                     ...newData.props 
                   };
                }

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

      importPageData: (jsonContent: string) => {
        try {
          const data = JSON.parse(jsonContent);
          const canonicalBlocks = normalizeTree(data.blocks || []);
          setBlocks(canonicalBlocks);
          resetHistory(canonicalBlocks);
          if (data.title) setPageTitle(data.title);
          if (data.slug) setSlug(data.slug);
          if (data.theme) setTokens(data.theme);
        } catch (err) {
          console.error("❌ Import Failed:", err);
          alert("Invalid Page JSON");
        }
      },

      exportPageData: () => {
        return JSON.stringify({
          title: pageTitle,
          slug,
          blocks,
          theme: tokens,
          version: "1.0",
          exportedAt: new Date().toISOString(),
        }, null, 2);
      },

      undo,
      redo,
      save,
      publish,
    }),
    [registry, blocks, pageTitle, tokens, sId, pId, undo, redo, setBlocks, resetHistory, save, publish, findBlockInTree]
  );

  // =========================
  // 7. VERSION CONTROL
  // =========================
  const versionActions = useVersionActions({
    blocks,
    setBlocks,
    setSelectedBlockId,
    pushHistory: setBlocks,
    versions,
    restorePageVersion,
    siteId: sId,
    pageId: pId,
  });

  // =========================
  // 8. LOADERS
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
        const rawBlocks = fromAPIToUI(data.blocks || []);
        const canonicalBlocks = normalizeTree(rawBlocks);
        resetHistory(canonicalBlocks); 
        hasLoadedRef.current = true;
      }
    }
  }, [pageData, isEdit, resetHistory]);

  return {
    blocks,
    pageTitle,
    slug,
    setSlug,
    setPageTitle,
    tokens,
    errors,
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
    isPublishing,
    isLoadingVersions,
    versions,
    canUndo,
    canRedo,
  };
};