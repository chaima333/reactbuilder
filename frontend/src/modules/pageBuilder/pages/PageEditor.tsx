// frontend/src/modules/pageBuilder/pages/PageEditor.tsx
import React, { useState, useMemo, useEffect } from "react";
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
  Modal,       
  TextField,  
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import CloseIcon from "@mui/icons-material/Close"; 
import { ValidationPanel } from "../components/editor/ValidationPanel";
import { DndContext, useDraggable } from "@dnd-kit/core";
import { EditorLayout } from "../components/editor/EditorLayout";
import { PageHeader } from "../components/editor/PageHeader";
import { EditorCanvas } from "../components/editor/EditorCanvas";
import { usePageEditor } from "../hooks/usePageEditor";
import { ThemeEditorPanel } from "../components/sidebar/ThemeEditorPanel";
import { InspectorPanel } from "../components/inspector/InspectorPanel";
import { VersionHistory } from "../components/sidebar/VersionHistory";
import { blockRegistry } from "../core/blockRegistry";
import { ThemeContext } from "../core/theme/themeContext";
import { StructurePanel } from "../components/sidebar/StructurePanel";
import { SettingsPanel } from "../components/inspector/SettingsPanel";
import { useParams, useSearchParams } from "react-router-dom";
import { customCollisionStrategy, useDragAndDrop } from "../hooks/editor/useDragAndDrop"; // 👑 جلب الخوارزمية الذكية متعك
import { RuntimeProvider } from "../runtime/context/RuntimeProvider";
import { downloadJsonFile, readJsonFile } from "../services/importExport";
import { findBlockById } from "../core/tree/findBlockById";
import { importHtmlDocument } from "../runtime/importers/html/importHtmlDocument";
import { useCreatePageMutation, useImportFigmaMutation, usePublishPageMutation, useUploadHtmlZipMutation, useUpdateGlobalLayoutMutation } from "../../../redux/services/pages.api";
import { figmaToSemanticTree } from "../runtime/importers/figma/figmaToSemanticTree";
import { semanticTreeToBlocks } from "../runtime/importers/figma/semanticTreeToBlocks";

const generateUniqueId = () => Math.random().toString(36).substring(2, 9);
const hydrateBlocks = (blocks: any[]): any[] => {
  return blocks.map(block => ({
    ...block,
    id: block.id || `block-${generateUniqueId()}`,
    props: block.props || {},
    style: block.style || {},
    children: block.children ? hydrateBlocks(block.children) : []
  }));
};

interface DraggableBlockItemProps {
  type: string;
  config: { label: string; icon?: React.ReactNode };
  compact?: boolean;
}

const DraggableBlockItem = ({ type, config, compact }: DraggableBlockItemProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-${type}`,
    data: { type, isNew: true },
  });

  return (
    <Button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      variant="outlined"
      fullWidth
      sx={{
        justifyContent: compact ? "center" : "flex-start",
        minWidth: compact ? "40px" : "auto",
        p: compact ? 1 : "8px 16px",
        cursor: "grab",
        mb: 1.5,
        textTransform: "none",
        borderColor: "#e0e0e0",
        color: "text.primary",
        opacity: isDragging ? 0.5 : 1,
        "&:hover": { borderColor: "primary.main", bgcolor: "rgba(0, 196, 73, 0.04)" },
      }}
    >
      {config.icon}
      {!compact && <Box sx={{ ml: 1.5 }}>{config.label}</Box>}
    </Button>
  );
};

const DragGhost = ({ type, isAllowed }: { type: string; isAllowed: boolean }) => (
  <Paper
    elevation={6}
    sx={{
      p: "12px 20px",
      bgcolor: isAllowed ? "#fff" : "#ffebee",
      border: isAllowed ? "2px solid #4caf50" : "2px solid #f44336",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      gap: 1,
      pointerEvents: "none",
    }}
  >
    <Typography variant="subtitle2" sx={{ color: isAllowed ? "#2e7d32" : "#c62828", fontWeight: "bold" }}>
      {isAllowed ? "Relâcher pour déposer" : "Action impossible"}
    </Typography>
    <Typography variant="caption" sx={{ opacity: 0.7 }}>[{type.toUpperCase()}]</Typography>
  </Paper>
);

export const PageEditor = ({ mode }: { mode: "create" | "edit" }) => {
  const { siteId,pageId } = useParams();
  const editor = usePageEditor(mode);
  const [searchParams] = useSearchParams();
  const figmaImportId = searchParams.get("figmaImportId");

  const {
    blocks, pageTitle, tokens, updateToken, actions, isLoading,
    registry, selectedBlockId, setSelectedBlockId, isSaving,
    canUndo, canRedo, slug, setSlug, setPageTitle, errors = [], 
    versions = [], isLoadingVersions,
  } = editor;

  const {
    activeId, activeData, overId, dropPosition, isAllowed, ghost,
    handleDragStart, handleDragOver, handleDragEnd
  } = useDragAndDrop({ blocks, actions });

  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isPreview, setIsPreview] = useState(false);
  const [activeTab, setActiveTab] = useState(1); 
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [htmlCode, setHtmlCode] = useState("");


//import siteweb
const [zipFile, setZipFile] = useState<File | null>(null);
const [uploadHtmlZip] = useUploadHtmlZipMutation();

const [createPage] = useCreatePageMutation();
const [publishPage] = usePublishPageMutation();
const [updateGlobalLayout] = useUpdateGlobalLayoutMutation();

useEffect(() => {

  if (!figmaImportId || !siteId) {
    return;
  }

  const loadFigmaImport = async () => {

    try {

      console.log(
        "AUTO FIGMA IMPORT",
        figmaImportId
      );

      const response = await fetch(
        `https://backend-rmfq.onrender.com/api/sites/${siteId}/pages/figma/import/raw/${figmaImportId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "accessToken"
            )}`
          }
        }
      );

      const result =
        await response.json();

      console.log(
        "FIGMA RESULT",
        result
      );

      const payload =
        result.data.payload;

      const semanticTree =
        figmaToSemanticTree(payload);

      const figmaBlocks =
        semanticTreeToBlocks(
          semanticTree
        );

      const hydrated =
        hydrateBlocks(
          figmaBlocks.map(
            (block: any) => ({
              ...block,
              props:
                block.data?.props || {},
              style:
                block.data?.style || {},
              children:
                block.children || []
            })
          )
        );

      actions.setBlocks(
        hydrated as any
      );

      setSelectedBlockId(
        hydrated[0]?.id || null
      );

    } catch (error) {

      console.error(
        "AUTO FIGMA IMPORT FAILED",
        error
      );

    }

  };

  loadFigmaImport();

}, [
  figmaImportId,
  siteId
]);

const selectedBlock = useMemo(() => {
    if (!selectedBlockId) return null;
    return findBlockById(blocks, selectedBlockId);
  }, [blocks, selectedBlockId]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleHtmlImportExecute = async () => {
    if (!htmlCode.trim()) return;

    try {
      const imported = await importHtmlDocument(htmlCode);
      
      if (imported && imported.blocks) {
        const hydrated = hydrateBlocks(
          imported.blocks.map((block: any) => ({
            ...block,
            props: block.data?.props || {},
            style: block.data?.style || {},
            children: block.children || []
          }))
        );
console.log(
  "🚨 IMPORTED BLOCKS",
  imported.blocks.map((b: any) => ({
    type: b.type,
    semantic: b.meta?.semanticType
  }))
);

console.log(
  "🚨 HYDRATED BLOCKS",
  hydrated.map((b: any) => ({
    type: b.type,
    semantic: b.meta?.semanticType
  }))
);
       actions.setBlocks(
  hydrated as any
);

setTimeout(() => {
  console.log(
    "🚨 STORE BLOCKS",
    editor.blocks?.map(
      (b: any) => ({
        type: b.type,
        semantic:
          b.meta?.semanticType
      })
    )
  );
}, 1000);
        setIsModalOpen(false);
        setHtmlCode("");
      }
    } catch (error) {
      console.error("HTML import failed", error);
    }
  };
 
const handleZipImportExecute = async () => {
  if (!zipFile) return;

  try {
    const result =
      await uploadHtmlZip({
        siteId: Number(siteId),
        file: zipFile
      }).unwrap();

    if (!result.success || !result.pages?.length) {
      console.error(
        "ZIP import failed",
        result
      );
      return;
    }

    const importGlobalLayoutBlock = async (
      html?: string
    ) => {
      if (!html?.trim()) {
        return null;
      }

      const imported =
        await importHtmlDocument(
          html
        );

      const hydrated =
        hydrateBlocks(
          imported.blocks.map((block: any) => ({
            ...block,
            props:
              block.data?.props || {},
            style:
              block.data?.style || {},
            children:
              block.children || []
          }))
        );

      return hydrated[0] || null;
    };

    const navbarBlock =
      await importGlobalLayoutBlock(
        result.globalLayout?.navHtml
      );

    const footerBlock =
      await importGlobalLayoutBlock(
        result.globalLayout?.footerHtml
      );

    await updateGlobalLayout({
      siteId: Number(siteId),
      globalLayout: {
        navbar: navbarBlock,
        footer: footerBlock
      }
    }).unwrap();

    for (const page of result.pages) {
      const imported =
        await importHtmlDocument(
          page.processedHtml
        );

      const hydrated =
        hydrateBlocks(
          imported.blocks.map((block: any) => ({
            ...block,
            props:
              block.data?.props || {},
            style:
              block.data?.style || {},
            children:
              block.children || []
          }))
        );

      try {
        const createdResponse =
          await createPage({
            siteId: Number(siteId),
            title: page.title,
            slug: page.slug,
            blocks: hydrated as any,
            isHomepage: page.isHomepage
          }).unwrap();

        const createdPage =
          (createdResponse as any).data || createdResponse;

        await publishPage({
          siteId: Number(siteId),
          pageId: createdPage.id
        }).unwrap();

      } catch (error) {
        console.error("FAILED PAGE", page.title, page.slug, error);
        continue;
      }

    }

    setIsModalOpen(false);
    setZipFile(null);

  } catch (error) {
    console.error(
      "ZIP import failed",
      error
    );
  }
};

  return (
    <RuntimeProvider value={{ mode: isPreview ? "preview" : "editor", device, tokens }}>
      <ThemeContext.Provider value={{ tokens, updateToken }}>
        <DndContext
          collisionDetection={customCollisionStrategy}
          onDragStart={handleDragStart} 
          onDragOver={handleDragOver} 
          onDragEnd={handleDragEnd}
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
                hasPageId={!!pageId}
                errors={errors} 
                onExport={() => {
                  const json = actions.exportPageData();
                  downloadJsonFile(`${slug || 'page'}-config.json`, json);
                }}
                onImport={async (file: File) => {
                  try {
                    const content = await readJsonFile(file);
                    actions.importPageData(content);
                  } catch (err) {
                    console.error("Failed to read import file", err);
                  }
                }}
                onImportHtml={() => setIsModalOpen(true)} 
              />
            }
            leftSidebar={
              !isPreview && (
                <Paper square sx={{ width: leftSidebarOpen ? 260 : 70, height: "100%", transition: "width 0.3s", borderRight: "1px solid #ddd", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <Box sx={{ p: 1, display: "flex", justifyContent: leftSidebarOpen ? "flex-end" : "center" }}>
                    <IconButton onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} size="small">
                      {leftSidebarOpen ? <ChevronLeftIcon /> : <MenuOpenIcon />}
                    </IconButton>
                  </Box>
                  <Box sx={{ p: 2, flexGrow: 1, overflowY: "auto" }}>
                    {leftSidebarOpen && (
                      <Typography variant="overline" sx={{ fontWeight: "bold", mb: 2, display: "block" }}>
                        COMPOSANTS
                      </Typography>
                    )}
                    <Stack alignItems={leftSidebarOpen ? "stretch" : "center"}>
                      {Object.entries(blockRegistry).map(([type, config]) => (
                        <DraggableBlockItem key={type} type={type} config={config} compact={!leftSidebarOpen} />
                      ))}
                    </Stack>
                    <StructurePanel blocks={blocks} selectedId={selectedBlockId} onSelect={setSelectedBlockId} hoveredId={hoveredBlockId} onHover={setHoveredBlockId} />
                  </Box>
                </Paper>
              )
            }
            rightSidebar={
              !isPreview && (
                <Paper square sx={{ width: 320, height: "100%", display: "flex", flexDirection: "column", borderLeft: "1px solid #ddd" }}>
                  <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
                    <Tab label="Settings" />
                    <Tab label="Style" />
                    <Tab label="Theme" />
                    <Tab label="History" />
                  </Tabs>
                  <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
                    {activeTab === 0 && (
                      <SettingsPanel
                        pageTitle={pageTitle}
                        setPageTitle={setPageTitle}
                        slug={slug}
                        setSlug={setSlug}
                        onExport={() => {
                          const json = actions.exportPageData();
                          downloadJsonFile(`${slug || 'page'}.json`, json);
                        }}
                        onImport={async (file: File) => {
                          try {
                            const content = await readJsonFile(file);
                            actions.importPageData(content);
                          } catch (err) {
                            console.error("Failed to read settings file", err);
                          }
                        }}
                        onImportHtml={() => setIsModalOpen(true)}
                        onImportFigma={() => {
                        alert("Use the Figma plugin: Analyze Frame → Send To ReactBuilder");}}
                      />
                    )}
                    {activeTab === 1 && (
                      <InspectorPanel block={selectedBlock} device={device} onChange={(newData) => actions.updateBlock(selectedBlockId!, newData)} />
                    )}
                    {activeTab === 2 && <ThemeEditorPanel />}
                    {activeTab === 3 && <VersionHistory versions={versions} isLoading={isLoadingVersions || isLoading} onRestore={(id) => actions.restoreVersion?.(id)} />}
                  </Box>
                </Paper>
              )
            }
            content={
              <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
                {!isPreview && errors.length > 0 && (
                  <ValidationPanel errors={errors} onSelectBlock={(blockId) => { setSelectedBlockId(blockId); setActiveTab(1); }} />
                )}
                <Box sx={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden", bgcolor: "#f5f5f5" }}>
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
                    errors={errors} 
                  />
                </Box>
              </Box>
            }
          />

          <Modal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Paper paper-root="true" sx={{ width: 550, p: 3, borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: 2, position: 'relative' }}>
              <IconButton 
                onClick={() => setIsModalOpen(false)} 
                sx={{ position: 'absolute', top: 12, right: 12 }}
              >
                <CloseIcon />
              </IconButton>

              <Typography variant="h6" fontWeight="bold">
                Import Template from HTML
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Paste your clean HTML snippet below. The compiler will structure it into editable canvas blocks.
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={8}
                variant="outlined"
                placeholder="<section>&#10;  <h1>Hello words</h1>&#10;  <p>I am chaimakabboudi</p>&#10;</section>"
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                sx={{ fontFamily: 'monospace' }}
              />

              <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 1 }}>
                <Button variant="outlined" color="inherit" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleHtmlImportExecute}
                  disabled={!htmlCode.trim()}
                >
                  Parse & Inject
                </Button>
                <Button variant="outlined" component="label">
  Upload Website ZIP
  <input
    hidden
    type="file"
    accept=".zip"
    onChange={(e) =>
      setZipFile(e.target.files?.[0] || null)
    }
  />
</Button>

{zipFile && (
  <Typography variant="caption">
    Selected: {zipFile.name}
  </Typography>
)}
<Button
  variant="contained"
  color="secondary"
  onClick={handleZipImportExecute}
  disabled={!zipFile}
>
  Import ZIP
</Button>
              </Stack>
            </Paper>
          </Modal>
          {ghost && activeId && (
            <Box sx={{ position: "fixed", top: ghost.y, left: ghost.x, zIndex: 9999, pointerEvents: "none" }}>
              <DragGhost type={activeData?.type || "block"} isAllowed={isAllowed} />
            </Box>
          )}
        </DndContext>
      </ThemeContext.Provider>
    </RuntimeProvider>
  );
};
