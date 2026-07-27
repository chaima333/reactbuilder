// frontend/src/modules/pageBuilder/hooks/usePageEditor.ts

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import {
  PageVisibility,
  useGetPageByIdQuery,
  useGetPageVersionsQuery,
  useRestorePageVersionMutation,
} from "../../../redux/services/pages.api";

import { blockRegistry } from "../core/blockRegistry";
import { Block, BlockType } from "../types/page.types";
import { useHistory } from "../core/history/useHistory";
import { moveBlockInTree } from "../core/tree/move";
import { insertBlock } from "../core/tree/insert";
import { duplicateBlock as duplicateBlockUtil } from "../core/tree/clipboard";
import { tokens as defaultTokens } from "../core/theme/tokens";
import { fromAPIToUI } from "../adapters/pageAdapter";
import { serializePage } from "../runtime/serialization/serializePage";
import { deserializePage } from "../runtime/serialization/deserializePage";
import { canAcceptChild } from "../core/schema/canonicalSchema";

import { usePagePersistence } from "./usePagePersistence";
import { useVersionActions } from "./useVersionActions";
import { hydrateTree } from "../runtime/hydrate/hydrateTree";
import { normalizeTree } from "../runtime/normalize/NormalizeTree";
import { normalizeCanonicalContainers } from "../runtime/normalize/normalizeCanonicalContainers";
import {
  canAddVisitorAuthBlockForPage,
  canDeleteBlockForPage,
  canDuplicateBlockForPage,
  type PageSystemType
} from "../core/visitorAuthBlockPolicy";

const isFooterBlock = (block: Block): boolean => {
  const semanticType =
    (block as any)?.meta?.semanticType ||
    (block as any)?.data?.meta?.semanticType;

  return (
    block.type === "footer" ||
    block.id?.startsWith("footer-section-") ||
    semanticType === "FOOTER" ||
    semanticType === "FOOTER_SECTION"
  );
};

const footerInsertIndex = (blocks: Block[]): number => {
  const index = blocks.findIndex(isFooterBlock);
  return index >= 0 ? index : blocks.length;
};

const treeHasFooter = (blocks: Block[]): boolean =>
  blocks.some(
    (block) =>
      isFooterBlock(block) ||
      treeHasFooter(block.children || [])
  );

const findParentTypeInTree = (
  tree: Block[] | undefined,
  targetId: string,
  parentType: BlockType = "root"
): BlockType | null => {
  if (!Array.isArray(tree)) {
    return null;
  }

  for (const block of tree) {
    if (block.id === targetId) {
      return parentType;
    }

    const found = findParentTypeInTree(
      block.children,
      targetId,
      block.type
    );

    if (found) {
      return found;
    }
  }

  return null;
};

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
  const [pageVisibility,setPageVisibility] = useState<PageVisibility>("public");
  const [pageSystemType, setPageSystemType] = useState<PageSystemType>(null);
  const registry = blockRegistry;
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [tokens, setTokens] = useState(defaultTokens);
  const loadedPageKeyRef = useRef<string | null>(null);

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
  // 3. VALIDATION
  // =========================

  const errors = useMemo(() => {
    const allErrors: any[] = [];
    
    const validateTree = (
      tree: any,
      path = "blocks",
      parentType = "root"
    ) => {
      if (!tree || !Array.isArray(tree)) return; 

      tree.forEach((block, index) => {
        if (!block || typeof block !== 'object') return; 

        const blockPath = `${path}[${index}]`;
        const config = registry[block.type as BlockType];
        
        if (config?.fields) {
          config.fields.forEach((field: any) => {
            if (field.validation?.required) {
              const props = block.data?.props ?? block.props ?? {};
              const value = block.type === "text" && field.key === "content"
                ? props.content ?? props.text
                : props[field.key];

              if (value === undefined || value === null || value.toString().trim() === "") {
                console.log("🚨 INVALID BLOCK", block);
                console.log("🚨 INVALID PATH", blockPath);
                console.log("🚨 INVALID PARENT TYPE", parentType);
                console.log("🚨 INVALID TYPE", block.type);
                console.log("🚨 INVALID CONTENT", block.data?.props?.content);

                allErrors.push({
                  blockId: block.id,
                  field: field.key,
                  message: `${config.label} : le champ "${field.label}" est obligatoire`,
                });
              }
            }
          });
        }
        
        if (block.children && Array.isArray(block.children)) {
          validateTree(block.children, `${blockPath}.children`, block.type);
        }
      });
    };

    validateTree(blocks || []); 
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
    pageVisibility,
    blocks,
    tokens,
  });

  // =========================
  // 5. HELPERS
  // =========================
  const findBlockInTree = useCallback(
    (tree: Block[] | undefined, id: string): Block | null => {
      if (!Array.isArray(tree)) {
        return null;
      }

      for (const node of tree) {
        if (node.id === id) {
          return node;
        }

        if (node.children?.length) {
          const found = findBlockInTree(node.children, id);
          if (found) {
            return found;
          }
        }
      }

      return null;
    },
    []
  );

  const selectedBlock = useMemo(() => {
    return findBlockInTree(blocks || [], selectedBlockId || "");
  }, [blocks, selectedBlockId, findBlockInTree]);

  // =========================
  // 6. ACTIONS
  // =========================
  const actions = useMemo(() => ({
    addBlock: (
      type: string, 
      targetId?: string, 
      position: string = "inside", 
      presetData?: any, 
      insertIndex?: number 
    ) => {
      const isRootTarget =
        !targetId ||
        targetId === "canvas-root" ||
        targetId === "canvas-drop-zone" ||
        targetId === "ROOT" ||
        targetId === "pb-runtime-root";

      const targetBlock =
        !isRootTarget && targetId
          ? findBlockInTree(blocks, targetId)
          : null;

      const parentType: BlockType | null =
        isRootTarget
          ? "root"
          : position === "inside"
            ? targetBlock?.type || null
            : findParentTypeInTree(blocks, targetId!);

      if (!parentType) {
        console.warn(`Block target "${targetId}" was not found`);
        return;
      }

      if (!canAcceptChild(parentType as BlockType, type as BlockType)) {
        console.warn(`❌ Block "${type}" cannot be added to "${parentType}"`);
        return;
      }

      if (
        !canAddVisitorAuthBlockForPage({
          blocks,
          type,
          systemType: pageSystemType
        })
      ) {
        console.warn(
          `Visitor auth block "${type}" cannot be added to this page.`
        );
        return;
      }

      let newBlock: any;
      let focusId: string;

      if (presetData && (presetData.initialChildrenType || presetData.presetChildren)) {
        const configParent = registry[type as BlockType];
        
        let childBlocks = [];
        if (presetData.presetChildren) {
          childBlocks = presetData.presetChildren;
        } else {
          const configChild = registry[presetData.initialChildrenType as BlockType];
          childBlocks = [
            {
              id: uuidv4(),
              type: presetData.initialChildrenType,
              data: {
                props: structuredClone(configChild?.defaultData?.props || {}),
                style: structuredClone(configChild?.defaultData?.style || { desktop: {} }),
              },
              children: []
            }
          ];
        }

        newBlock = {
          id: uuidv4(),
          type: type, 
          data: {
            props: structuredClone(configParent?.defaultData?.props || {}),
            style: structuredClone(configParent?.defaultData?.style || { desktop: {} }),
          },
          children: childBlocks
        };

        focusId = childBlocks?.[0]?.id || newBlock.id;

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
        
        focusId = newBlock.id;
      }

      setBlocks((currentBlocks) => {
        if (isFooterBlock(newBlock) && treeHasFooter(currentBlocks)) {
          return currentBlocks;
        }
        
        if (
          !targetId ||
          targetId === "canvas-root" ||
          targetId === "canvas-drop-zone" ||
          targetId === "ROOT" ||
          targetId === "pb-runtime-root"
        ) {
          const updatedRoot = [...currentBlocks];
          const requestedIndex =
            insertIndex !== undefined
              ? insertIndex
              : isFooterBlock(newBlock)
                ? updatedRoot.length
                : footerInsertIndex(updatedRoot);

          const targetIndex =
            !isFooterBlock(newBlock) &&
            updatedRoot.some(isFooterBlock)
              ? Math.min(requestedIndex, footerInsertIndex(updatedRoot))
              : requestedIndex;
          updatedRoot.splice(targetIndex, 0, newBlock);
          return updatedRoot;
        }

        const insertIntoTree = (tree: Block[]): Block[] => {
          const result: Block[] = [];

          for (const b of tree) {
            if (b.id === targetId) {
              if (position === "before") {
                result.push(newBlock);
                result.push(b);
                continue;
              }

              if (position === "after") {
                result.push(b);
                result.push(newBlock);
                continue;
              }

              if (position === "inside") {
                const children = [...(b.children || [])];
                const targetIndex = insertIndex !== undefined ? insertIndex : children.length;
                children.splice(targetIndex, 0, newBlock);
                result.push({ ...b, children });
                continue;
              }
            }

            if (b.children && b.children.length > 0) {
              result.push({ ...b, children: insertIntoTree(b.children) });
              continue;
            }

            result.push(b);
          }

          return result;
        };

        return insertIntoTree(currentBlocks);
      });
      
      setSelectedBlockId(focusId);
    },
    
    addBlockTree: (
      tree: Block,
      targetId?: string,
      position: string = "inside",
      insertIndex?: number
    ) => {
      const isRootTarget =
        !targetId ||
        targetId === "canvas-root" ||
        targetId === "canvas-drop-zone" ||
        targetId === "ROOT" ||
        targetId === "pb-runtime-root";

      const targetBlock =
        !isRootTarget && targetId
          ? findBlockInTree(blocks, targetId)
          : null;

      const parentType: BlockType | null =
        isRootTarget
          ? "root"
          : position === "inside"
            ? targetBlock?.type || null
            : findParentTypeInTree(blocks, targetId!);

      if (!parentType) {
        console.warn(`Block tree target "${targetId}" was not found`);
        return;
      }

      if (!canAcceptChild(parentType as BlockType, tree.type as BlockType)) {
        console.warn(`❌ Block "${tree.type}" cannot be added to "${parentType}"`);
        return;
      }

      if (
        !canAddVisitorAuthBlockForPage({
          blocks,
          type: tree.type,
          systemType: pageSystemType
        })
      ) {
        console.warn(
          `Visitor auth block "${tree.type}" cannot be added to this page.`
        );
        return;
      }

      setBlocks((currentBlocks) => {
        return insertBlock(
          currentBlocks,
          {
            targetId: targetId || "ROOT",
            type: position,
            index: insertIndex
          },
          tree
        );
      });

      setSelectedBlockId(tree.id);
    },
    
    updateBlock: (id: string, newData: any) => {
      const safeBlocks = Array.isArray(blocks) ? blocks : [];

      const update = (tree: Block[]): Block[] =>
        tree.map((b) => {
          if (b.id === id) {
            const updated = structuredClone(b);

            if (newData.props) {
              updated.data.props = {
                ...(updated.data?.props || {}),
                ...newData.props,
              };
            }

            if (newData.style) {
              updated.data.style = {
                desktop: {
                  ...(updated.data?.style?.desktop || {}),
                  ...(newData.style.desktop || {}),
                },
                tablet: {
                  ...(updated.data?.style?.tablet || {}),
                  ...(newData.style.tablet || {}),
                },
                mobile: {
                  ...(updated.data?.style?.mobile || {}),
                  ...(newData.style.mobile || {}),
                },
              };
            }

            return updated;
          }

          return {
            ...b,
            children: Array.isArray(b.children)
              ? update(b.children)
              : [],
          };
        });

      setBlocks(update(safeBlocks));
    },

    deleteBlock: (id: string) => {
      if (
        !canDeleteBlockForPage({
          blocks,
          blockId: id,
          systemType: pageSystemType
        })
      ) {
        console.warn(
          "Required system visitor auth block cannot be deleted."
        );
        return;
      }

      setBlocks((prevBlocks) => {
        const remove = (tree: Block[]): Block[] =>
          tree.filter((b) => b.id !== id).map((b) => ({ ...b, children: b.children ? remove(b.children) : [] }));
        return remove(prevBlocks);
      });
      setSelectedBlockId((current) => (current === id ? null : current));
    },

    duplicateBlock: (id: string) => {
      if (
        !canDuplicateBlockForPage({
          blocks,
          blockId: id,
          systemType: pageSystemType
        })
      ) {
        console.warn(
          "Visitor auth blocks cannot be duplicated on this page."
        );
        return;
      }

      setBlocks((prevBlocks) => {
        if (!prevBlocks || !Array.isArray(prevBlocks)) return [];
        const duplicateRecursive = (tree: Block[]): Block[] => {
          if (!tree || !Array.isArray(tree)) return [];

          return tree.flatMap((block) => {
            const updatedBlock = {
              ...block,
              children: block.children?.length 
                ? duplicateRecursive(block.children) 
                : []
            };
            if (block.id === id) {
              return [
                updatedBlock,
                duplicateBlockUtil(updatedBlock)
              ];
            }
            return [updatedBlock];
          });
        };
        return duplicateRecursive(structuredClone(prevBlocks));
      });
    },
    
    moveBlock: (activeId: string, dropInfo: any) => {
      setBlocks((current) => moveBlockInTree(current, activeId, dropInfo));
    },

    // ✅ تصحيح importPageData
    importPageData: (jsonContent: string) => {
      try {
        const { blocks: importedBlocks } = deserializePage(jsonContent);

        const canonicalBlocks = normalizeCanonicalContainers(
          normalizeTree(
            hydrateTree(importedBlocks as any) as any
          ) as any
        );

        setBlocks(canonicalBlocks as Block[]);
        resetHistory(canonicalBlocks as Block[]);
      } catch (err) {
        console.error("Import Failed", err);
        alert("Invalid Page JSON");
      }
    },

    exportPageData: () => {
      return JSON.stringify(
        {
          ...serializePage(blocks),
          metadata: {
            updatedAt: new Date().toISOString()
          }
        },
        null,
        2
      );
    },
    setBlocks,
    undo,
    redo,
    save,
    publish,
  }), [registry, blocks, pageTitle, tokens, sId, pId, undo, redo, setBlocks, resetHistory, save, publish, findBlockInTree, pageSystemType]);

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
    const pageKey = `${sId}:${pId}`;

    if (
      isEdit &&
      pageData &&
      loadedPageKeyRef.current !== pageKey
    ) {
      const data = (pageData as any)?.data || pageData;
      if (data) {
        setPageTitle(data.title || "Untitled Page");
        setTokens(data.theme || defaultTokens);
        setSlug(data.slug || "");
        setPageVisibility(data.visibility === "members_only"? "members_only": "public");
        setPageSystemType(data.systemType || null);
        const rawBlocks = fromAPIToUI(data.blocks || []);
        const sanitizeAndFixTree = (tree: any[]): any[] => {
          if (!tree || !Array.isArray(tree)) return [];
          return tree.map((block) => {
            let fixedType = block.type;
            
            if (block.type === "flexitem") {
              fixedType = "flexItem";
            }

            return {
              ...block,
              type: fixedType,
              children: block.children ? sanitizeAndFixTree(block.children) : []
            };
          });
        };

        const cleanedBlocks = sanitizeAndFixTree(rawBlocks);
        
        const canonicalBlocks = normalizeCanonicalContainers(
          normalizeTree(
            hydrateTree(cleanedBlocks) as any
          ) as any
        );

        setBlocks(canonicalBlocks as Block[]);
        resetHistory(canonicalBlocks as Block[]);
        loadedPageKeyRef.current = pageKey;
      }
    }
  }, [pageData, isEdit, sId, pId, resetHistory]);

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
    pageVisibility,
    setPageVisibility,
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
