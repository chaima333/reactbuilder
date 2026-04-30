import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useGetPageByIdQuery, useUpdatePageMutation } from '../../../redux/services/pages.api';
import { blockRegistry as staticRegistry } from '../core/blockRegistry';
import { loadBlockRegistry } from '../core/loadBlockRegistry';
import { Block } from '../types/page.types';
import { useHistory } from '../core/history/useHistory';
import { moveBlockInTree } from '../core/tree/move';
import { copyBlock, duplicateBlock, pasteBlockIntoTree } from '../core/tree/clipboard';
import { defaultTokens } from '../core/theme/tokens';

export const usePageEditor = (mode: "create" | "edit") => {
  const { siteId, pageId } = useParams<{ siteId: string; pageId: string }>();
  const isEdit = mode === "edit";

  const [pageTitle, setPageTitle] = useState("");
  const [registry, setRegistry] = useState<Record<string, any>>(staticRegistry);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<any | null>(null);

  // 1️⃣ الـ State متاع الـ Blocks والـ Tokens (الألوان والخطوط)
  const { state: blocks, set: setBlocks, undo, redo, canUndo, canRedo } = useHistory<Block[]>([]);
  const [tokens, setTokens] = useState(defaultTokens);

  const { data: pageData, isLoading: isPageLoading } = useGetPageByIdQuery(
    { siteId: Number(siteId), pageId: Number(pageId) },
    { skip: !isEdit || !pageId }
  );

  const [updatePage, { isLoading: isSaving }] = useUpdatePageMutation();

  useEffect(() => {
    loadBlockRegistry().then(r => setRegistry(r));
  }, []);

  // 📥 2️⃣ LOAD: جلب البيانات من الداتابيز (Blocks + Theme)
  useEffect(() => {
    if (isEdit && pageData?.data && blocks.length === 0) {
      setPageTitle(pageData.data.title || "");
      setBlocks(pageData.data.blocks || []);
      // تحميل الـ Theme المخزن أو استعمال الـ Default
      setTokens(pageData.data.theme || defaultTokens);
    }
  }, [pageData, isEdit, blocks.length, setBlocks]);

  const findBlockInTree = (tree: Block[], id: string): Block | null => {
    for (const node of tree) {
      if (node.id === id) return node;
      if (node.children) {
        for (const col of node.children) {
          const found = findBlockInTree(col.blocks, id);
          if (found) return found;
        }
      }
    }
    return null;
  };

  const selectedBlock = findBlockInTree(blocks, selectedBlockId || "");

  // 🔥 دالة تحديث الـ Tokens بذكاء (خارج الـ actions لكنها تُستعمل فيها)
  const updateToken = (path: string, value: string) => {
    setTokens((prev: any) => {
      const newTokens = JSON.parse(JSON.stringify(prev)); 
      const keys = path.split(".");
      let current = newTokens;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newTokens;
    });
  };

  const actions = {
    addBlock: (type: string) => {
      const config = registry[type];
      if (!config) return;
      const newBlock: Block = { 
        id: uuidv4(), 
        type: type as any, 
        data: { 
          props: { ...config.defaultData?.props }, 
          style: { ...config.defaultData?.style } 
        } 
      };
      setBlocks([...blocks, newBlock]);
      setSelectedBlockId(newBlock.id);
    },

    updateBlock: (id: string, newData: any) => {
      const updateRecursive = (tree: Block[]): Block[] => {
        return tree.map(b => {
          if (b.id === id) {
            return {
              ...b,
              data: {
                props: { ...b.data.props, ...(newData.props || {}) },
                style: { ...b.data.style, ...(newData.style || {}) }
              }
            };
          }
          if (b.children) {
            return {
              ...b,
              children: b.children.map(col => ({
                ...col,
                blocks: updateRecursive(col.blocks)
              }))
            };
          }
          return b;
        });
      };
      setBlocks(updateRecursive(blocks));
    },

    deleteBlock: (id: string) => {
      const deleteRecursive = (tree: Block[]): Block[] => {
        return tree
          .filter(b => b.id !== id)
          .map(b => (b.children ? {
            ...b,
            children: b.children.map(col => ({
              ...col,
              blocks: deleteRecursive(col.blocks)
            }))
          } : b));
      };
      setBlocks(deleteRecursive(blocks));
      if (selectedBlockId === id) setSelectedBlockId(null);
    },

    copy: (id: string) => {
      const block = findBlockInTree(blocks, id);
      if (block) {
        const cloned = copyBlock(block);
        setClipboard(cloned);
        localStorage.setItem("editor_clipboard", JSON.stringify(cloned));
      }
    },

    duplicate: (id: string) => {
      const block = findBlockInTree(blocks, id);
      if (block) {
        const newBlock = duplicateBlock(block);
        const newTree = pasteBlockIntoTree(blocks, id, newBlock);
        setBlocks(newTree);
      }
    },

    paste: (targetId: string) => {
      const saved = localStorage.getItem("editor_clipboard");
      const dataToPaste = clipboard || (saved ? JSON.parse(saved) : null);
      if (dataToPaste) {
        const newBlock = duplicateBlock(dataToPaste);
        const newTree = pasteBlockIntoTree(blocks, targetId, newBlock);
        setBlocks(newTree);
      }
    },

    moveBlock: (activeId: string, dropInfo: any) => {
      const newTree = moveBlockInTree(blocks, activeId, dropInfo);
      setBlocks(newTree);
    },

    undo,
    redo,

    // 📤 3️⃣ SAVE: حفظ الـ Blocks والـ Theme مع بعضهم
    save: async () => {
      const payload = { 
        title: pageTitle, 
        blocks, 
        theme: tokens, 
        siteId: Number(siteId) 
      };
      await updatePage({ ...payload, pageId: Number(pageId) });
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
    isLoading: isPageLoading,
    isSaving,
    tokens,     
    setTokens, 
    updateToken, // 🔥 توّة ولات تخرج نظيفة للـ UI
  };
};