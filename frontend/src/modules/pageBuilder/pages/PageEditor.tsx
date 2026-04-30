import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Paper, Tabs, Tab, Typography } from "@mui/material";
import { DndContext, closestCenter, DragOverlay, defaultDropAnimationSideEffects } from "@dnd-kit/core";
import { EditorLayout } from "../components/editor/EditorLayout";
import { PageHeader } from "../components/editor/PageHeader";
import { EditorCanvas } from "../components/editor/EditorCanvas";
import { usePageEditor } from "../hooks/usePageEditor";
import { ThemeEditorPanel } from "../components/sidebar/ThemeEditorPanel"; // تأكد من اسم الملف
import { ThemeContext } from "../core/theme/ThemeContext";

export const PageEditor = ({ mode }: { mode: "create" | "edit" }) => {
  const {
    blocks,
    pageTitle,
    setPageTitle,
    tokens, 
    setTokens,
    updateToken, // 🔥 جاية مالـ hook مريغلة
    actions,
    isLoading,
    registry,
    selectedBlockId,
    setSelectedBlockId,
    isSaving,
    canUndo,
    canRedo,
  } = usePageEditor(mode);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverData, setHoverData] = useState<any>(null);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isPreview, setIsPreview] = useState(false);

  // 📑 التبديل بين Style (Inspector) و Theme
  const [activeTab, setActiveTab] = useState(0);

  // ⌨️ Shortcuts (Undo, Redo, Copy, Paste...)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z': e.preventDefault(); actions.undo(); break;
          case 'y': e.preventDefault(); actions.redo(); break;
          case 'd': e.preventDefault(); if (selectedBlockId) actions.duplicate(selectedBlockId); break;
          case 'c': if (selectedBlockId) actions.copy(selectedBlockId); break;
          case 'v': if (selectedBlockId) actions.paste(selectedBlockId); break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBlockId, actions]);

  const handleDragStart = (event: any) => setActiveId(event.active.id);

  const handleDragEnd = (event: any) => {
    const { active } = event;
    if (hoverData && active.id !== hoverData.targetId) {
      actions.moveBlock(active.id, hoverData);
    }
    setActiveId(null);
    setHoverData(null);
  };

  if (isLoading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress />
    </Box>
  );

  return (
    // 🔥 توّة الـ Context Provider هازز الـ tokens والـ updateToken للـ Sidebar والـ Canvas
    <ThemeContext.Provider value={{ tokens, setTokens, updateToken }}>
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
        
        rightSidebar={
          !isPreview ? (
            <Paper square sx={{ width: 320, height: "100%", display: "flex", flexDirection: "column", borderLeft: "1px solid #ddd" }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
                  <Tab label="Style" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
                  <Tab label="Theme" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
                </Tabs>
              </Box>

              <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
                {activeTab === 0 ? (
                  // 🎨 Tab 0: Inspector (تعديل بلوك معين)
                  selectedBlockId ? (
                    <Box p={2}>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Settings ({selectedBlockId.slice(0, 5)}...)
                      </Typography>
                      {/* هنا تحط الـ InspectorPanel متاعك */}
                      <Typography variant="body2" color="text.secondary">
                        Edit block properties here.
                      </Typography>
                    </Box>
                  ) : (
                    <Box p={4} textAlign="center">
                      <Typography color="text.secondary">Select a block to edit</Typography>
                    </Box>
                  )
                ) : (
                  // 🌈 Tab 1: الـ Theme Editor (تعديل ألوان الموقع كامل)
                  <ThemeEditorPanel />
                )}
              </Box>
            </Paper>
          ) : null
        }

        content={
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
            <EditorCanvas
              blocks={blocks}
              registry={registry}
              selectedId={selectedBlockId}
              onSelect={setSelectedBlockId}
              onUpdate={actions.updateBlock}
              onDelete={actions.deleteBlock}
              onDuplicate={actions.duplicate}
              onCopy={actions.copy}
              onPaste={actions.paste}
              hoverData={hoverData}
              setHoverData={setHoverData}
              device={device}
              preview={isPreview}
              tokens={tokens} // مررنا الـ tokens للـ Canvas باش يطبق الـ Styles لايف
            />

            <DragOverlay dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: { active: { opacity: "0.4" } },
              }),
            }}>
              {activeId ? (
                <Box sx={{ p: 2, bgcolor: "white", border: "2px solid #1976d2", borderRadius: "4px", opacity: 0.9, boxShadow: 3 }}>
                  Dragging Block...
                </Box>
              ) : null}
            </DragOverlay>
          </DndContext>
        }
      />
    </ThemeContext.Provider>
  );
};