import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
} from "@mui/material";

import {
  DndContext,
  closestCenter,
  DragEndEvent,
  useDraggable,
} from "@dnd-kit/core";

import { EditorLayout } from "../components/editor/EditorLayout";
import { PageHeader } from "../components/editor/PageHeader";
import { EditorCanvas } from "../components/editor/EditorCanvas";
import { usePageEditor } from "../hooks/usePageEditor";
import { ThemeEditorPanel } from "../components/sidebar/ThemeEditorPanel";
import { ThemeContext } from "../core/theme/ThemeContext";

import AddBoxIcon from '@mui/icons-material/AddBox';
import TextFieldsIcon from '@mui/icons-material/TextFields';

import { Block } from "../types/page.types";
import { moveBlockInTree } from "../core/tree/move";
import { canDrop } from "../adapters/pageAdapter";

// --- 🛠️ Helpers ---
const findBlockInTree = (blocks: Block[], id: string): Block | null => {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children && block.children.length > 0) {
      const found = findBlockInTree(block.children, id);
      if (found) return found;
    }
  }
  return null;
};

const getDropPosition = (clientY: number, targetRect: DOMRect): "before" | "after" | "inside" => {
  const threshold = 0.25; 
  const relativeY = (clientY - targetRect.top) / targetRect.height;
  if (relativeY < threshold) return "before";
  if (relativeY > 1 - threshold) return "after";
  return "inside";
};

// --- 🧱 Sidebar Component ---
const DraggableSidebarItem = ({ type, label, icon: Icon }: any) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-${type}`,
    data: { type, isNew: true }
  });

  return (
    <Button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      variant="outlined" 
      startIcon={<Icon />} 
      fullWidth
      sx={{ 
        justifyContent: 'flex-start', 
        cursor: 'grab', 
        mb: 1,
        opacity: isDragging ? 0.5 : 1 
      }}
    >
      {label}
    </Button>
  );
};

// --- 👻 Ghost Preview Component ---
const DragGhost = ({ type, isAllowed }: { type: string, isAllowed: boolean }) => (
  <Box
    sx={{
      p: "12px 20px",
      bgcolor: isAllowed ? "#fff" : "#ffebee",
      border: isAllowed ? "2px solid #4caf50" : "2px solid #f44336",
      borderRadius: "8px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      display: "flex",
      alignItems: "center",
      gap: 1,
      pointerEvents: "none",
    }}
  >
    <Typography variant="subtitle2" sx={{ color: isAllowed ? "#2e7d32" : "#c62828", fontWeight: 'bold' }}>
      {isAllowed ? "Ready to Drop" : "Can't Place Here"}
    </Typography>
    <Typography variant="caption" sx={{ opacity: 0.7 }}>
      [{type.toUpperCase()}]
    </Typography>
  </Box>
);

// --- 🚀 Main Editor ---
export const PageEditor = ({ mode }: { mode: "create" | "edit" }) => {
  const {
    blocks, pageTitle, tokens, updateToken, actions,
    isLoading, registry, selectedBlockId, setSelectedBlockId,
    isSaving, canUndo, canRedo,
  } = usePageEditor(mode);

  // Drag States
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeData, setActiveData] = useState<any>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | "inside" | null>(null);
  const [isAllowed, setIsAllowed] = useState<boolean>(true);
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);

  // UI States
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isPreview, setIsPreview] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // 🎹 Shortcuts Effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "z": e.preventDefault(); actions.undo(); break;
          case "y": e.preventDefault(); actions.redo(); break;
          case "d": e.preventDefault(); if (selectedBlockId) actions.duplicate(selectedBlockId); break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBlockId, actions]);

  // 🖱️ Mouse Tracking for Ghost
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!activeId) return;
      setGhost({ x: e.clientX + 15, y: e.clientY + 15 });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [activeId]);

  // --- 🧠 Drag Handlers ---
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
    setActiveData(event.active.data.current);
  };

  const handleDragOver = (event: any) => {
    const { over, active } = event;
    if (!over) {
      setOverId(null);
      setDropPosition(null);
      setIsAllowed(true);
      return;
    }

    const targetId = over.id.toString();
    const draggedType = active.data.current?.type;
    setOverId(targetId);

    const overElement = document.getElementById(targetId);
    if (overElement) {
      const rect = overElement.getBoundingClientRect();
      const clientY = (event.activatorEvent as MouseEvent).clientY || 0;
      const position = getDropPosition(clientY, rect);
      setDropPosition(position);

      const targetBlock = findBlockInTree(blocks, targetId);
      if (targetBlock) {
        setIsAllowed(position === "inside" ? canDrop(targetBlock.type, draggedType) : true);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const finalPosition = dropPosition;
    const finalIsAllowed = isAllowed;

    // Reset All Drag States
    setActiveId(null);
    setActiveData(null);
    setOverId(null);
    setDropPosition(null);
    setIsAllowed(true);
    setGhost(null);

    if (!over || !finalIsAllowed) return;

    const activeIdStr = active.id.toString();
    const targetIdStr = over.id.toString();
    const isNew = active.data.current?.isNew;
    const type = active.data.current?.type;
    const position = finalPosition || "inside";

    if (isNew) {
      actions.addBlock(type, targetIdStr, position); 
    } else if (activeIdStr !== targetIdStr) {
      try {
        const updatedTree = moveBlockInTree(blocks, activeIdStr, { 
          targetId: targetIdStr, 
          type: position 
        });
        actions.updateTree(updatedTree); 
      } catch (error) {
        console.error("❌ Move failed:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeContext.Provider value={{ tokens, updateToken }}>
      <EditorLayout
        header={
          <PageHeader 
            title={pageTitle} 
            onSave={actions.save} 
            loading={isSaving} 
            canUndo={canUndo} 
            canRedo={canRedo} 
            onUndo={actions.undo} 
            onRedo={actions.redo} 
            device={device} 
            onDeviceChange={setDevice} 
            isPreview={isPreview} 
            onPreview={() => setIsPreview(!isPreview)} 
          />
        }
        leftSidebar={!isPreview && (
          <Paper square sx={{ width: 240, height: "100%", borderRight: "1px solid #ddd", p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>Components</Typography>
            <Box>
              <DraggableSidebarItem type="section" label="Section" icon={AddBoxIcon} />
              <DraggableSidebarItem type="text" label="Text Block" icon={TextFieldsIcon} />
            </Box>
          </Paper>
        )}
        rightSidebar={!isPreview && (
          <Paper square sx={{ width: 320, height: "100%", display: "flex", flexDirection: "column", borderLeft: "1px solid #ddd" }}>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
              <Tab label="Style" /><Tab label="Theme" />
            </Tabs>
            <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
              {activeTab === 0 ? (
                selectedBlockId ? 
                  <Box p={2}><Typography variant="subtitle2">Style Settings</Typography></Box> : 
                  <Box p={4} textAlign="center"><Typography color="text.secondary">Select a block</Typography></Box>
              ) : <ThemeEditorPanel />}
            </Box>
          </Paper>
        )}
        content={
          <DndContext 
            onDragStart={handleDragStart} 
            onDragOver={handleDragOver} 
            onDragEnd={handleDragEnd} 
            collisionDetection={closestCenter}
          >
            <EditorCanvas
              blocks={blocks} 
              registry={registry} 
              selectedId={selectedBlockId} 
              onSelect={setSelectedBlockId}
              onUpdate={actions.updateBlock} 
              onDelete={actions.deleteBlock}
              device={device} 
              preview={isPreview} 
              tokens={tokens}
              activeId={activeId}
              hoverData={{ overId, dropPosition, isAllowed }}
            />

            {/* 🔥 Custom Ghost Overlay */}
            {ghost && activeId && (
              <Box
                sx={{
                  position: "fixed",
                  top: ghost.y,
                  left: ghost.x,
                  zIndex: 9999,
                  pointerEvents: "none",
                  transition: "transform 0.05s linear",
                }}
              >
                <DragGhost 
                  type={activeData?.type || "block"} 
                  isAllowed={isAllowed} 
                />
              </Box>
            )}
          </DndContext>
        }
      />
    </ThemeContext.Provider>
  );
};