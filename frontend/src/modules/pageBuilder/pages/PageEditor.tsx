import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  IconButton,
  Stack,
} from "@mui/material";

// --- Icons ---
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";

// --- DND Kit ---
import {
  DndContext,
  DragEndEvent,
  useDraggable,
  pointerWithin,
} from "@dnd-kit/core";

// --- Project Imports ---
import { EditorLayout } from "../components/editor/EditorLayout";
import { PageHeader } from "../components/editor/PageHeader";
import { EditorCanvas } from "../components/editor/EditorCanvas";
import { usePageEditor } from "../hooks/usePageEditor";
import { ThemeEditorPanel } from "../components/sidebar/ThemeEditorPanel";
import { InspectorPanel } from "../components/inspector/InspectorPanel";
import { VersionHistory } from "../components/sidebar/VersionHistory";
import { blockRegistry } from "../core/blockRegistry";
import { Block } from "../types/page.types";
import { canDrop } from "../adapters/pageAdapter";
import { ThemeContext } from "../core/theme/themeContext";
import { StructurePanel } from "../components/sidebar/StructurePanel";
import { SettingsPanel }from "../components/inspector/SettingsPanel";
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

const getDropPosition = (
  clientY: number,
  targetRect: DOMRect
): "before" | "after" | "inside" => {
  const relativeY = (clientY - targetRect.top) / targetRect.height;
  if (relativeY < 0.20) return "before";
  if (relativeY > 0.80) return "after";
  return "inside";
};

// --- 🧱 Draggable Sidebar Item ---
const DraggableBlockItem = ({ type, config, compact }: any) => {
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
      fullWidth
      sx={{
        justifyContent: compact ? 'center' : 'flex-start',
        minWidth: compact ? '40px' : 'auto',
        p: compact ? 1 : '8px 16px',
        cursor: 'grab',
        mb: 1.5,
        textTransform: 'none',
        borderColor: '#e0e0e0',
        color: 'text.primary',
        opacity: isDragging ? 0.5 : 1,
        '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(0, 196, 73, 0.04)' }
      }}
    >
      {config.icon}
      {!compact && <Box sx={{ ml: 1.5 }}>{config.label}</Box>}
    </Button>
  );
};

// --- 👻 Ghost Preview ---
const DragGhost = ({ type, isAllowed }: { type: string, isAllowed: boolean }) => (
  <Paper elevation={6} sx={{
    p: "12px 20px",
    bgcolor: isAllowed ? "#fff" : "#ffebee",
    border: isAllowed ? "2px solid #4caf50" : "2px solid #f44336",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: 1,
    pointerEvents: "none",
  }}>
    <Typography variant="subtitle2" sx={{ color: isAllowed ? "#2e7d32" : "#c62828", fontWeight: 'bold' }}>
      {isAllowed ? "Relâcher pour déposer" : "Action impossible"}
    </Typography>
    <Typography variant="caption" sx={{ opacity: 0.7 }}>[{type.toUpperCase()}]</Typography>
  </Paper>
);

// --- 🚀 Main Editor Component ---
export const PageEditor = ({ mode }: { mode: "create" | "edit" }) => {
  const editor = usePageEditor(mode);
  
  const {
    blocks, pageTitle, tokens, updateToken, actions,
    isLoading, registry, selectedBlockId, setSelectedBlockId,
    isSaving, canUndo, canRedo, slug,setSlug,setPageTitle,
    versions = [], isLoadingVersions 
  } = editor;

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeData, setActiveData] = useState<any>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | "inside" | null>(null);
  const [hoveredBlockId,setHoveredBlockId] = useState<string | null>(null);
  console.log(
  hoveredBlockId
);
  const [isAllowed, setIsAllowed] = useState<boolean>(true);
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isPreview, setIsPreview] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);

  const selectedBlock = useMemo(() => 
    selectedBlockId ? findBlockInTree(blocks, selectedBlockId) : null,
    [blocks, selectedBlockId]
  );

  useEffect(() => {
    if (!activeId) return;
    const handleMove = (e: MouseEvent) => {
      setGhost({ x: e.clientX + 15, y: e.clientY + 15 });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [activeId]);

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

  const targetId =
    over.id.toString();

  // ✅ support:
  // - sidebar blocks
  // - existing runtime blocks

  const runtimeBlock =
    findBlockInTree(
      blocks,
      active.id.toString()
    );

  const draggedType =

    active.data.current?.type ||

    runtimeBlock?.type;

  setOverId(targetId);

  const overElement =
    document.getElementById(
      targetId
    );

  if (!overElement) return;

  const rect =
    overElement.getBoundingClientRect();

  const clientY =
    (event.activatorEvent as MouseEvent)
      ?.clientY || 0;

  const position =
    getDropPosition(
      clientY,
      rect
    );

  const targetBlock =
    findBlockInTree(
      blocks,
      targetId
    );

  const isContainer =
    targetBlock
      ? blockRegistry[
          targetBlock.type
        ]?.isContainer
      : false;

  // ✅ container logic

  if (
    targetBlock &&
    isContainer
  ) {

    setDropPosition(
      "inside"
    );

    setIsAllowed(

      draggedType
        ? canDrop(
            targetBlock.type,
            draggedType
          )
        : true
    );

  } else {

    setDropPosition(
      position
    );

    setIsAllowed(true);
  }
};

const handleDragEnd = (
  event: DragEndEvent
) => {

  const {
    active,
    over
  } = event;

  // ========================
  // NO TARGET
  // ========================

  if (!over) {

    setActiveId(null);
    setActiveData(null);
    setOverId(null);
    setDropPosition(null);
    setIsAllowed(true);
    setGhost(null);

    return;
  }

  // ========================
  // CAPTURE FINAL STATE
  // ========================

  const finalPosition =
    dropPosition;

  const finalAllowed =
    isAllowed;

  const isNew =
    active.data.current
      ?.isNew;

 const runtimeBlock =
  findBlockInTree(
    blocks,
    active.id.toString()
  );

const type =

  active.data.current
    ?.type ||

  runtimeBlock
    ?.type;
  const targetId =
    over.id.toString();

  const activeId =
    active.id.toString();

  // ========================
  // BLOCKED DROP
  // ========================

  if (!finalAllowed) {

    console.warn(
      "DROP BLOCKED"
    );

    setActiveId(null);
    setActiveData(null);
    setOverId(null);
    setDropPosition(null);
    setIsAllowed(true);
    setGhost(null);

    return;
  }

  // ========================
  // TARGET
  // ========================

  const targetBlock =
    findBlockInTree(
      blocks,
      targetId
    );

  const isTargetContainer =

    targetBlock

      ? blockRegistry[
          targetBlock.type
        ]?.isContainer

      : false;

  // ========================
  // POSITION
  // ========================

  const effectivePosition =

    isTargetContainer

      ? "inside"

      : (
          finalPosition ||
          "after"
        );

  // ========================
  // ADD NEW BLOCK
  // ========================

  if (isNew) {

    actions.addBlock(
      type,
      targetId,
      effectivePosition
    );
  }

  // ========================
  // MOVE EXISTING BLOCK
  // ========================

  else if (
    activeId !== targetId
  ) {

    actions.moveBlock(
      activeId,
      {
        targetId,
        type:
          effectivePosition
      }
    );
  }

  // ========================
  // CLEANUP
  // ========================

  setActiveId(null);

  setActiveData(null);

  setOverId(null);

  setDropPosition(null);

  setIsAllowed(true);

  setGhost(null);
};

  return (
    <ThemeContext.Provider value={{ tokens, updateToken }}>
      <DndContext
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        collisionDetection={pointerWithin}
      >
        <EditorLayout
          header={
            <PageHeader
              title={pageTitle}
              onSave={actions.save}
              loading={isSaving || isLoading}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={actions.undo}
              onRedo={actions.redo}
              device={device}
              onDeviceChange={setDevice}
              isPreview={isPreview}
              onPreview={() => setIsPreview(!isPreview)}
              onPublish={actions.publish}
            />
          }
          leftSidebar={
            !isPreview && (
              <Paper square sx={{
                width: leftSidebarOpen ? 260 : 70,
                height: "100%",
                transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                borderRight: "1px solid #ddd",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}>
                <Box sx={{ p: 1, display: "flex", justifyContent: leftSidebarOpen ? "flex-end" : "center" }}>
                  <IconButton onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} size="small">
                    {leftSidebarOpen ? <ChevronLeftIcon /> : <MenuOpenIcon />}
                  </IconButton>
                </Box>
                <Box sx={{ p: 2, flexGrow: 1, overflowY: "auto" }}>
                  {leftSidebarOpen && <Typography variant="overline" sx={{ fontWeight: "bold", mb: 2, display: "block" }}>COMPOSANTS</Typography>}
                  <Stack alignItems={leftSidebarOpen ? "stretch" : "center"}>
                    {Object.entries(blockRegistry).map(([type, config]) => (
                      <DraggableBlockItem key={type} type={type} config={config} compact={!leftSidebarOpen} />
                    ))}
                  </Stack>
                  <StructurePanel blocks={blocks} selectedId={selectedBlockId}
                  onSelect={ setSelectedBlockId}
                  hoveredId={hoveredBlockId} onHover={setHoveredBlockId}
                   />
                </Box>
              </Paper>
            )
          }
          rightSidebar={
            !isPreview && (
              <Paper square sx={{ width: 320, height: "100%", display: "flex", flexDirection: "column", borderLeft: "1px solid #ddd" }}>
                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
                  <Tab label="SETTINGS" />
                  <Tab label="Style" />
                  <Tab label="Theme" />
                  <Tab label="History" />
                </Tabs>
                <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
                  
                  {activeTab === 0 && (<SettingsPanel
                   pageTitle={pageTitle} setPageTitle={setPageTitle}
                 slug={slug}
                  setSlug={setSlug}
                   /> )}
                   {activeTab === 1 && (
                    isLoading ? (
                      <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress size={24} /></Box>
                    ) : (
                      <InspectorPanel
                        block={selectedBlock}
                        device={device}
                        onChange={(newData) => actions.updateBlock(selectedBlockId!, newData)}
                      />
                    )
                  )}
                  {activeTab === 2 && <ThemeEditorPanel />}
                  {activeTab === 3 && (
                    <VersionHistory
                      versions={versions}
                      isLoading={isLoadingVersions || isLoading}
                      onRestore={(id) => actions.restoreVersion?.(id)}
                    />
                  )}
                </Box>
              </Paper>
            )
          }
          content={
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
              onDuplicate={actions.duplicateBlock}
              hoveredId={hoveredBlockId}
              />
            }
        />
        {ghost && activeId && (
          <Box sx={{ position: "fixed", top: ghost.y, left: ghost.x, zIndex: 9999, pointerEvents: "none" }}>
            <DragGhost type={activeData?.type || "block"} isAllowed={isAllowed} />
          </Box>
        )}
      </DndContext>
    </ThemeContext.Provider>
  );
};