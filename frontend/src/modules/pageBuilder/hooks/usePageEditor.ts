import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import {
  useGetPageByIdQuery,
  useUpdatePageMutation,
} from "../../../redux/services/pages.api";

import { blockRegistry as staticRegistry } from "../core/blockRegistry";
import { loadBlockRegistry } from "../core/loadBlockRegistry";

import { Block, BlockType } from "../types/page.types";

import { useHistory } from "../core/history/useHistory"; // تأكد أن هذا الـ Hook يطبق الـ Logic اللي حكينا عليه
import { moveBlockInTree } from "../core/tree/move";
import {
  copyBlock,
  duplicateBlock,
  pasteBlockIntoTree,
} from "../core/tree/clipboard";

import { defaultTokens } from "../core/theme/tokens";
import { fromAPIToUI, fromUIToAPI } from "../adapters/pageAdapter";

export const usePageEditor = (mode: "create" | "edit") => {
  const { siteId, pageId } = useParams<{ siteId: string; pageId: string }>();
  const isEdit = mode === "edit";

  const [pageTitle, setPageTitle] = useState("");
  const [registry, setRegistry] = useState(staticRegistry);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<any | null>(null);
  const [tokens, setTokens] = useState(defaultTokens);

  // 1. إعداد الـ History
  const {
    state: blocks,
    set: setBlocks,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<Block[]>([]);

  const { data: pageData, isLoading } = useGetPageByIdQuery(
    { siteId: Number(siteId), pageId: Number(pageId) },
    { skip: !isEdit || !pageId }
  );

  const [updatePage, { isLoading: isSaving }] = useUpdatePageMutation();

  useEffect(() => {
    loadBlockRegistry().then(setRegistry);
  }, []);

  useEffect(() => {
    if (isEdit && (pageData as any)?.data && blocks.length === 0) {
  const data = (pageData as any).data;
  setPageTitle(data.title || "");
  setBlocks(fromAPIToUI(data.blocks || []));
  setTokens(data.theme || defaultTokens);
}
  }, [pageData, isEdit, setBlocks]);

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

  const selectedBlock = useMemo(() => 
    findBlockInTree(blocks, selectedBlockId || ""), 
    [blocks, selectedBlockId, findBlockInTree]
  );

  const updateToken = (path: string, value: string) => {
    setTokens((prev: any) => {
      const copy = structuredClone(prev);
      const keys = path.split(".");
      let cur = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  // =========================
  // 🛠️ ACTIONS ENGINE
  // =========================
  const actions = {
    updateTree: (newBlocks: Block[]) => {
      setBlocks(newBlocks);
    },

    // ✅ تطوير الـ addBlock لدعم الـ Precise Positioning
    addBlock: (type: string, targetId?: string, position: "before" | "after" | "inside" = "inside") => {
      const config = registry[type];
      const newBlock: Block = {
        id: uuidv4(),
        type: type as BlockType,
        data: {
          props: { ...config?.defaultData?.props },
          style: { ...config?.defaultData?.style },
        },
        children: [],
      };

      if (!targetId) {
        setBlocks([...blocks, newBlock]);
      } else {
        // نستعملوا الـ move logic لزيادة البلوك الجديد في المكان الصحيح
        // بما أن الـ moveBlockInTree مصممة للتحريك، يمكننا استغلالها أو عمل insert logic
        const insertIntoTree = (tree: Block[]): Block[] => {
          return tree.flatMap((b) => {
            if (b.id === targetId) {
              if (position === "before") return [newBlock, b];
              if (position === "after") return [b, newBlock];
              if (position === "inside") {
                return [{ ...b, children: [...(b.children || []), newBlock] }];
              }
            }
            return [{
              ...b,
              children: b.children ? insertIntoTree(b.children) : []
            }];
          });
        };
        setBlocks(insertIntoTree(blocks));
      }
      setSelectedBlockId(newBlock.id);
    },

    updateBlock: (id: string, newData: any) => {
      const update = (tree: Block[]): Block[] =>
        tree.map((b) => {
          if (b.id === id) {
            return {
              ...b,
              data: {
                ...b.data,
                props: { ...b.data.props, ...(newData.props || {}) },
                style: {
                  ...b.data.style,
                  desktop: { ...b.data.style?.desktop, ...newData.style?.desktop },
                  mobile: { ...b.data.style?.mobile, ...newData.style?.mobile },
                },
              },
            };
          }
          return {
            ...b,
            children: b.children ? update(b.children) : [],
          };
        });
      setBlocks(update(blocks));
    },

    deleteBlock: (id: string) => {
      const remove = (tree: Block[]): Block[] =>
        tree
          .filter((b) => b.id !== id)
          .map((b) => ({
            ...b,
            children: b.children ? remove(b.children) : [],
          }));

      setBlocks(remove(blocks));
      if (selectedBlockId === id) setSelectedBlockId(null);
    },

    // ✅ التحريك يستعمل الـ History توّة
    moveBlock: (activeId: string, dropInfo: any) => {
      const updated = moveBlockInTree(blocks, activeId, dropInfo);
      setBlocks(updated);
    },

    duplicate: (id: string) => {
      const block = findBlockInTree(blocks, id);
      if (!block) return;
      const newBlock = duplicateBlock(block);
      const updated = pasteBlockIntoTree(blocks, id, newBlock);
      setBlocks(updated);
    },

    copy: (id: string) => {
      const block = findBlockInTree(blocks, id);
      if (!block) return;
      const cloned = copyBlock(block);
      setClipboard(cloned);
      localStorage.setItem("editor_clipboard", JSON.stringify(cloned));
    },

    paste: (targetId: string) => {
      const saved = localStorage.getItem("editor_clipboard");
      const data = clipboard || (saved ? JSON.parse(saved) : null);
      if (!data) return;
      const newBlock = duplicateBlock(data);
      const updated = pasteBlockIntoTree(blocks, targetId, newBlock);
      setBlocks(updated);
    },

    undo,
    redo,

    save: async () => {
      await updatePage({
        title: pageTitle,
        blocks: fromUIToAPI(blocks),
        theme: tokens,
        siteId: Number(siteId) || 1, 
        pageId: Number(pageId) || 1,
      });
    },
  };

  return {
    blocks,
    selectedBlock,
    selectedBlockId,
    setSelectedBlockId,
    actions,
    registry,
    pageTitle,
    setPageTitle,
    canUndo,
    canRedo,
    isLoading,
    isSaving,
    tokens,
    setTokens,
    updateToken,
    findBlockInTree
  };
};