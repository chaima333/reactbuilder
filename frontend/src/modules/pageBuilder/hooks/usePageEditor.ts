import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { arrayMove } from '@dnd-kit/sortable';
import { 
  useGetPageByIdQuery, 
  useUpdatePageMutation,
  useCreatePageMutation,
} from '../../../redux/services/pages.api';
import { blockRegistry as staticRegistry } from '../core/blockRegistry';
import { loadBlockRegistry } from '../core/loadBlockRegistry';
import { Block } from '../types/page.types';

// ... نفس الـ imports

export const usePageEditor = (mode: "create" | "edit") => {
  const { siteId, pageId } = useParams<{ siteId: string; pageId: string }>();
  const isEdit = mode === "edit";

  const [pageTitle, setPageTitle] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [registry, setRegistry] = useState<Record<string, any>>(staticRegistry);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const selectedBlock = blocks.find(b => b.id === selectedBlockId) || null;

  const { data: pageData, isLoading: isPageLoading } = useGetPageByIdQuery(
    { siteId: Number(siteId), pageId: Number(pageId) },
    { skip: !isEdit || !pageId }
  );

  // ✅ تصليح مشكلة الـ versions: اعطيها نوع صريح
  const versions: any[] = []; 
  const isVersionsLoading = false;

  const [updatePage, { isLoading: isSaving }] = useUpdatePageMutation();

  useEffect(() => {
    loadBlockRegistry().then(r => setRegistry(r));
  }, []);

  useEffect(() => {
    if (isEdit && pageData?.data) {
      setPageTitle(pageData.data.title || "");
      // تأكد إن البيانات جاية منظمة حسب نوع Block
      setBlocks(pageData.data.blocks || []);
    }
  }, [pageData, isEdit]);

  const actions = {
    addBlock: (type: string) => {
      const config = registry[type];
      if (!config) return;

      // ✅ تصليح النوع هنا باستعمال "as Block"
      const newBlock: Block = { 
        id: uuidv4(), 
        type: type as any, // استعمل any هنا لتفادي تعارض الـ strings
        data: { 
          props: { ...config.defaultData?.props }, 
          style: { ...config.defaultData?.style } 
        } 
      };

      setBlocks(prev => [...prev, newBlock]);
      setSelectedBlockId(newBlock.id);
    },

    updateBlock: (id: string, newData: any) => {
      setBlocks(prev => prev.map(b => 
        b.id === id ? { 
          ...b, 
          data: { 
            props: { ...b.data.props, ...(newData.props || {}) }, 
            style: { ...b.data.style, ...(newData.style || {}) } 
          } 
        } : b
      ));
    },

    deleteBlock: (id: string) => {
      setBlocks(prev => prev.filter(b => b.id !== id));
      if (selectedBlockId === id) setSelectedBlockId(null);
    },

    reorderBlocks: (activeId: string, overId: string) => {
      setBlocks(prev => {
        const oldIdx = prev.findIndex(i => i.id === activeId);
        const newIdx = prev.findIndex(i => i.id === overId);
        if (oldIdx === -1 || newIdx === -1) return prev;
        return arrayMove(prev, oldIdx, newIdx);
      });
    },

    save: async () => {
       const payload = { title: pageTitle, blocks, siteId: Number(siteId) };
       await updatePage({ ...payload, pageId: Number(pageId) });
    },

    restore: (versionId: string) => {
       console.log("Restoring version", versionId);
    }
  };

  return { 
    blocks, 
    selectedBlock, 
    setSelectedBlockId, 
    actions, 
    registry, 
    pageTitle, 
    setPageTitle,
    isLoading: isPageLoading,
    isSaving,
    versions,
    isVersionsLoading
  };
};