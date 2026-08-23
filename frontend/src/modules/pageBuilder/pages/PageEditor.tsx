
import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Alert,
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
import { applyThemeToBlocks } from "../core/theme/applyThemeToBlocks";
import { InspectorPanel } from "../components/inspector/InspectorPanel";
import { VersionHistory } from "../components/sidebar/VersionHistory";
import { blockRegistry } from "../core/blockRegistry";
import { ThemeContext } from "../core/theme/themeContext";
import { StructurePanel } from "../components/sidebar/StructurePanel";
import { SettingsPanel } from "../components/inspector/SettingsPanel";
import { useParams, useSearchParams } from "react-router-dom";
import { customCollisionStrategy, useDragAndDrop } from "../hooks/editor/useDragAndDrop";
import {
  canMoveWithinDndSlots,
  DndSlot
} from "../core/dnd/dndSlots";
import { RuntimeProvider } from "../runtime/context/RuntimeProvider";
import { downloadJsonFile, readJsonFile } from "../services/importExport";
import { findBlockById } from "../core/tree/findBlockById";
import { importHtmlDocument } from "../runtime/importers/html/importHtmlDocument";
import {
  useCreatePageMutation,
  useLazyGetPagesQuery,
  usePublishPageMutation,
  useUploadHtmlZipMutation,
  useUpdatePageMutation,
  useUpdateGlobalLayoutMutation,
  useGenerateFigmaPluginTokenMutation,
  useGenerateAiPageMutation,
  useAskAssistantMutation,
  useGetPageByIdQuery,
  useUpdatePageSeoMutation,
} from "../../../redux/services/pages.api";
import { useGetPlatformSettingsQuery } from "../../../redux/services/platform.api";
import { useGetSiteByIdQuery } from "../../../redux/services/sites.api";
import { figmaToSemanticTree } from "../runtime/importers/figma/figmaToSemanticTree";
import { semanticTreeToBlocks } from "../runtime/importers/figma/semanticTreeToBlocks";
import AssistantPanel from "./aiAssistant/AssistantPanel";
import {
  useDesignCopilotApplyMutation,
  useDesignCopilotChatMutation,
  useEditSelectedBlockMutation,
} from "../../../redux/services/ai.api";
import { executeZipWebsiteImport } from "../runtime/importers/html/zip/executeZipWebsiteImport";
import { ZipWebsiteImportError } from "../runtime/importers/html/zip/executeZipWebsiteImport";
import { apiUrl } from "../../../config/api";
import { normalizeTree } from "../runtime/normalize/NormalizeTree";
import { SavePatternDialog } from "../components/patterns/SavePatternDialog";
import { PatternLibraryPanel } from "../components/patterns/PatternLibraryPanel";
import { canSaveBlockAsPattern } from "../components/patterns/patternActions";
import CmsEntryPreviewSelect, {
  CmsTemplatePreview,
  getCmsPreviewSaveBlocks,
  runUnlessCmsPreviewActive
} from "../../cms/CmsEntryPreviewSelect";
import {
  resolveCmsBindingsInTree
} from "../../cms/utils/cmsBinding.resolver";

// ============================================
// CONSTANTS & TYPES
// ============================================

const generateUniqueId = () => Math.random().toString(36).substring(2, 9);

type DeviceType = "desktop" | "tablet" | "mobile";
type TabType = "settings" | "style" | "theme" | "seo" | "history" | "ai";

const TAB_INDEX: Record<TabType, number> = {
  settings: 0,
  style: 1,
  theme: 2,
  seo: 3,
  history: 4,
  ai: 5,
};

const TAB_LABELS: TabType[] = ["settings", "style", "theme", "seo", "history", "ai"];

// ============================================
// UTILITY FUNCTIONS
// ============================================

const hydrateBlocks = (blocks: any[]): any[] => {
  return blocks.map((block) => ({
    ...block,
    id: block.id || `block-${generateUniqueId()}`,
    props: block.props || {},
    style: block.style || {},
    children: block.children ? hydrateBlocks(block.children) : [],
  }));
};

const mergeResponsiveStyle = (
  current: any = {},
  incoming: any = {}
) => ({
  ...current,
  ...incoming,

  desktop:
    incoming.desktop
      ? {
          ...(current.desktop || {}),
          ...incoming.desktop
        }
      : current.desktop,

  tablet:
    incoming.tablet
      ? {
          ...(current.tablet || {}),
          ...incoming.tablet
        }
      : current.tablet,

  mobile:
    incoming.mobile
      ? {
          ...(current.mobile || {}),
          ...incoming.mobile
        }
      : current.mobile
});

const mergeBlockUpdate = (
  block: any,
  update: any
) => {
  const incomingData =
    update?.data || {};

  const incomingProps =
    incomingData.props ??
    update?.props;

  const incomingStyle =
    incomingData.style ??
    update?.style;

  const {
    props: _props,
    style: _style,
    data: _data,
    children,
    ...topLevelUpdate
  } = update || {};

  return {
    ...block,
    ...topLevelUpdate,

    data: {
      ...(block?.data || {}),
      ...incomingData,

      props:
        incomingProps
          ? {
              ...(block?.data?.props || {}),
              ...incomingProps
            }
          : block?.data?.props,

      style:
        incomingStyle
          ? mergeResponsiveStyle(
              block?.data?.style || {},
              incomingStyle
            )
          : block?.data?.style
    },

    children:
      children ??
      block?.children ??
      []
  };
};

const updateBlockInTree = (
  block: any,
  blockId: string,
  update: any
): any => {
  if (!block) {
    return block;
  }

  if (block.id === blockId) {
    return mergeBlockUpdate(
      block,
      update
    );
  }

  return {
    ...block,

    children:
      Array.isArray(block.children)
        ? block.children.map(
            (child: any) =>
              updateBlockInTree(
                child,
                blockId,
                update
              )
          )
        : []
  };
};
const removeBlockFromTree = (
  block: any,
  blockId: string
): any | null => {
  if (!block) {
    return block;
  }

  if (block.id === blockId) {
    return null;
  }

  return {
    ...block,

    children:
      Array.isArray(block.children)
        ? block.children
            .map(
              (child: any) =>
                removeBlockFromTree(
                  child,
                  blockId
                )
            )
            .filter(Boolean)
        : []
  };
};

type DndInsertPosition =
  | "before"
  | "after"
  | "inside";

const collectBlockIds = (
  block: any,
  result = new Set<string>()
): Set<string> => {
  if (!block) {
    return result;
  }

  if (block.id) {
    result.add(
      String(block.id)
    );
  }

  const children =
    Array.isArray(block.children)
      ? block.children
      : [];

  children.forEach(
    (child: any) =>
      collectBlockIds(
        child,
        result
      )
  );

  return result;
};

const normalizeDndPosition = (
  position?: string
): DndInsertPosition => {
  if (
    position === "before" ||
    position === "after" ||
    position === "inside"
  ) {
    return position;
  }

  return "inside";
};

const createDndBlock = (
  type: string,
  presetData?: any
): any => {
  const config =
    blockRegistry[type];

  return {
    id:
      crypto.randomUUID(),

    type,

    data: {
      props:
        structuredClone(
          presetData?.props ??
          config?.defaultData?.props ??
          {}
        ),

      style:
        structuredClone(
          presetData?.style ??
          config?.defaultData?.style ??
          {
            desktop: {}
          }
        )
    },

    children:
      structuredClone(
        presetData?.presetChildren ??
        []
      )
  };
};

const insertBlockIntoTree = (
  root: any,
  newBlock: any,
  targetId: string,
  position: DndInsertPosition,
  requestedIndex?: number
): any => {
  if (!root) {
    return root;
  }

  if (
    root.id === targetId &&
    position === "inside"
  ) {
    const children =
      Array.isArray(root.children)
        ? [...root.children]
        : [];

    const index =
      Math.max(
        0,
        Math.min(
          requestedIndex ??
            children.length,
          children.length
        )
      );

    children.splice(
      index,
      0,
      newBlock
    );

    return {
      ...root,
      children
    };
  }

  const children =
    Array.isArray(root.children)
      ? root.children
      : [];

  const targetIndex =
    children.findIndex(
      (child: any) =>
        child.id === targetId
    );

  if (
    targetIndex !== -1 &&
    position !== "inside"
  ) {
    const nextChildren =
      [...children];

    const insertionIndex =
      position === "before"
        ? targetIndex
        : targetIndex + 1;

    nextChildren.splice(
      insertionIndex,
      0,
      newBlock
    );

    return {
      ...root,
      children:
        nextChildren
    };
  }

  return {
    ...root,

    children:
      children.map(
        (child: any) =>
          insertBlockIntoTree(
            child,
            newBlock,
            targetId,
            position,
            requestedIndex
          )
      )
  };
};
// ============================================
// COMPONENTS
// ============================================

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
        borderColor: "divider",
        color: "text.primary",
        opacity: isDragging ? 0.5 : 1,
        "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
      }}
    >
      {config.icon}
      {!compact && <Box sx={{ ml: 1.5 }}>{config.label}</Box>}
    </Button>
  );
};

interface DragGhostProps {type: string;isAllowed: boolean;}

const DragGhost = ({ type, isAllowed }: DragGhostProps) => (
  <Paper
    elevation={6}
    sx={{
      p: "12px 20px",
      bgcolor: "background.paper",
      border: 2,
      borderStyle: "solid",
      borderColor: isAllowed ? "divider" : "warning.main",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      gap: 1,
      pointerEvents: "none",
    }}
  >
    <Typography variant="subtitle2" sx={{ color: isAllowed ? "text.primary" : "warning.main", fontWeight: "bold" }}>
      {isAllowed ? "Relâcher pour déposer" : "Action impossible"}
    </Typography>
    <Typography variant="caption" sx={{ opacity: 0.7 }}>
      [{type.toUpperCase()}]
    </Typography>
  </Paper>
);

// ============================================
// SEO HOOK
// ============================================

interface SeoFormData {
  metaTitle: string;
  metaDescription: string;
  metaRobots: string;
  canonicalUrl: string;
  ogImage: string;
}

const useSeoManager = (pageId: string | undefined, siteId: string | undefined, pageTitle: string) => {
  const {
    data: loadedPage,
    refetch: refetchPage,
  } = useGetPageByIdQuery(
    { siteId: siteId || "", pageId: pageId || "" },
    { skip: !siteId || !pageId }
  );

  const [updatePageSeo, { isLoading: isSeoSaving }] = useUpdatePageSeoMutation();

  const [seoForm, setSeoForm] = useState<SeoFormData>({
    metaTitle: "",
    metaDescription: "",
    metaRobots: "index,follow",
    canonicalUrl: "",
    ogImage: "",
  });

  useEffect(() => {
    const seo = loadedPage?.seo;
    setSeoForm({
      metaTitle: seo?.metaTitle || loadedPage?.title || pageTitle || "",
      metaDescription: seo?.metaDescription || "",
      metaRobots: seo?.metaRobots || "index,follow",
      canonicalUrl: seo?.canonicalUrl || "",
      ogImage: seo?.ogImage || "",
    });
  }, [loadedPage?.id, loadedPage?.seo, loadedPage?.title, pageTitle]);

  const handleSeoChange = useCallback((field: keyof SeoFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSeoForm((prev) => ({ ...prev, [field]: event.target.value }));
  }, []);

  const handleSeoSave = useCallback(async () => {
    if (!siteId || !pageId) return;

    try {
      await updatePageSeo({ siteId, pageId, ...seoForm }).unwrap();
      await refetchPage();
    } catch (error) {
      console.error("SEO update failed:", error);
      // TODO: Show user notification
    }
  }, [siteId, pageId, seoForm, updatePageSeo, refetchPage]);

  return { seoForm, handleSeoChange, handleSeoSave, isSeoSaving };
};

// ============================================
// FIGMA HOOK
// ============================================

const useFigmaImport = (
  figmaImportId: string | null,
  siteId: string | undefined,
  isEnabled: boolean,
  isLoadingPlatform: boolean,
  setBlocks: (blocks: any[]) => void,
  setSelectedBlockId: (id: string | null) => void
) => {
  useEffect(() => {
    if (!figmaImportId || !siteId || isLoadingPlatform || !isEnabled) return;

    const loadFigmaImport = async () => {
      try {
        console.log("AUTO FIGMA IMPORT", figmaImportId);
        const response = await fetch(apiUrl(`/sites/${siteId}/pages/figma/import/raw/${figmaImportId}`), {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });

        const result = await response.json();
        console.log("FIGMA RESULT", result);

        const payload = result.data.payload;
        const semanticTree = figmaToSemanticTree(payload);
        const figmaBlocks = semanticTreeToBlocks(semanticTree);
        const hydrated = hydrateBlocks(
          figmaBlocks.map((block: any) => ({
            ...block,
            props: block.data?.props || {},
            style: block.data?.style || {},
            children: block.children || [],
          }))
        );

        setBlocks(hydrated as any);
        setSelectedBlockId(hydrated[0]?.id || null);
      } catch (error) {
        console.error("AUTO FIGMA IMPORT FAILED", error);
      }
    };

    loadFigmaImport();
  }, [figmaImportId, siteId, isLoadingPlatform, isEnabled, setBlocks, setSelectedBlockId]);
};

// ============================================
// MAIN COMPONENT
// ============================================

interface PageEditorProps {
  mode: "create" | "edit";
}

export const PageEditor = ({ mode }: PageEditorProps) => {
  const { siteId, pageId } = useParams();
  const [searchParams] = useSearchParams();
  const figmaImportId = searchParams.get("figmaImportId");

  // ============================================
  // STATE
  // ============================================

  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [isPreview, setIsPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(TAB_INDEX.style);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(true);
  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [htmlCode, setHtmlCode] = useState<string>("");
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipImporting, setZipImporting] = useState<boolean>(false);
  const [zipImportStep, setZipImportStep] = useState<string>("");
  const [figmaDialogOpen, setFigmaDialogOpen] = useState<boolean>(false);
  const [
    savePatternDialogOpen,
    setSavePatternDialogOpen
  ] = useState<boolean>(false);
  const [
    patternLibraryOpen,
    setPatternLibraryOpen
  ] = useState<boolean>(false);
  const [figmaToken, setFigmaToken] = useState<string>("");
  const [
    selectedCmsPreviewEntryId,
    setSelectedCmsPreviewEntryId
  ] = useState<number | "">("");

  const [
    cmsTemplatePreview,
    setCmsTemplatePreview
  ] = useState<CmsTemplatePreview | null>(null);
  const [
    globalNavbarDraft,
    setGlobalNavbarDraft
  ] = useState<any>(null);

  const [
    globalFooterDraft,
    setGlobalFooterDraft
  ] = useState<any>(null);

  // ============================================
  // HOOKS
  // ============================================

  const editor = usePageEditor(mode);

  const {
    blocks,
    pageTitle,
    tokens,
    updateToken,
    actions,
    isLoading,
    registry,
    selectedBlockId,
    setSelectedBlockId,
    isSaving,
    canUndo,
    canRedo,
    slug,
    setSlug,
    pageVisibility,
    setPageVisibility,
    setPageTitle,
    errors = [],
    versions = [],
    isLoadingVersions,
  } = editor;

  const { seoForm, handleSeoChange, handleSeoSave, isSeoSaving } = useSeoManager(pageId, siteId, pageTitle);

  const {
    data: platformSettings,
    isLoading: isPlatformSettingsLoading,
  } = useGetPlatformSettingsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const isFigmaPluginEnabled = platformSettings?.figmaPlugin !== false;

  useFigmaImport(
    figmaImportId,
    siteId,
    isFigmaPluginEnabled,
    isPlatformSettingsLoading,
    actions.setBlocks,
    setSelectedBlockId
  );

  // ============================================
  // MUTATIONS
  // ============================================

  const [generateFigmaPluginToken] = useGenerateFigmaPluginTokenMutation();
  const [uploadHtmlZip] = useUploadHtmlZipMutation();
  const [createPage] = useCreatePageMutation();
  const [publishPage] = usePublishPageMutation();
  const [getPages] = useLazyGetPagesQuery();
  const [updatePage] = useUpdatePageMutation();
  
  const [
    updateGlobalLayout,
    {
      isLoading: isUpdatingGlobalLayout
    }
  ] = useUpdateGlobalLayoutMutation();
  
  const [generateAiPage] = useGenerateAiPageMutation();
  const [askAssistant] = useAskAssistantMutation();
  const [editSelectedBlock] = useEditSelectedBlockMutation();
  const [designCopilotChat] = useDesignCopilotChatMutation();
  const [designCopilotApply] = useDesignCopilotApplyMutation();

  // ============================================
  // SITE QUERY FOR GLOBAL LAYOUT
  // ============================================
  
  const {
    data: editorSite,
    isLoading: isLoadingEditorSite,
    refetch: refetchEditorSite
  } = useGetSiteByIdQuery(
    Number(siteId || 0),
    {
      skip: !siteId
    }
  );

  useEffect(() => {
    setGlobalNavbarDraft(
      editorSite?.globalLayout
        ?.navbar || null
    );

    setGlobalFooterDraft(
      editorSite?.globalLayout
        ?.footer || null
    );
  }, [
    editorSite?.globalLayout?.navbar,
    editorSite?.globalLayout?.footer
  ]);

  // ============================================
  // SELECTED BLOCK
  // ============================================
 
  const selectedPageBlock =
    useMemo(() => {
      if (!selectedBlockId) {
        return null;
      }

      return findBlockById(
        blocks,
        selectedBlockId
      );
    }, [
      blocks,
      selectedBlockId
    ]);

  const selectedGlobalNavbarBlock =
    useMemo(() => {
      if (
        !selectedBlockId ||
        !globalNavbarDraft
      ) {
        return null;
      }

      return findBlockById(
        [globalNavbarDraft],
        selectedBlockId
      );
    }, [
      globalNavbarDraft,
      selectedBlockId
    ]);

  const selectedGlobalFooterBlock =
    useMemo(() => {
      if (
        !selectedBlockId ||
        !globalFooterDraft
      ) {
        return null;
      }

      return findBlockById(
        [globalFooterDraft],
        selectedBlockId
      );
    }, [
      globalFooterDraft,
      selectedBlockId
    ]);

  const selectedGlobalSlot:
    | "navbar"
    | "footer"
    | null =
    selectedGlobalNavbarBlock
      ? "navbar"
      : selectedGlobalFooterBlock
        ? "footer"
        : null;

  const selectedBlock =
    selectedPageBlock ||
    selectedGlobalNavbarBlock ||
    selectedGlobalFooterBlock ||
    null;

  const canSaveSelectedPageBlockAsPattern =
    canSaveBlockAsPattern(
      selectedPageBlock
    );

  const patternSaveDisabledReason =
    selectedGlobalSlot
      ? "Global navbar and footer blocks cannot be saved as patterns."
      : selectedPageBlock
        ? "Only page sections can be saved as patterns."
        : "Select a page section to save it as a pattern.";

  const numericSiteId =
    Number(siteId || 0);

  const isCmsEntryPreviewActive =
    Boolean(cmsTemplatePreview);

  // ============================================
  // GLOBAL LAYOUT HELPERS
  // ============================================

const getBlockSearchText = (
  block: any
) =>
  [
    block?.type,
    block?.id,

    block?.meta?.semanticType,
    block?.data?.meta?.semanticType,

    block?.props?.tagName,
    block?.data?.props?.tagName,

    block?.props?.className,
    block?.data?.props?.className,

    block?.meta?.originalTagName,
    block?.data?.meta?.originalTagName,

    block?.props?.role,
    block?.data?.props?.role
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const blockTreeMatches = (
  block: any,
  matcher: (
    currentBlock: any
  ) => boolean
): boolean => {
  if (!block) {
    return false;
  }

  if (matcher(block)) {
    return true;
  }

  const children =
    Array.isArray(
      block?.children
    )
      ? block.children
      : [];

  return children.some(
    (child: any) =>
      blockTreeMatches(
        child,
        matcher
      )
  );
};

const isNavbarLikeBlock = (
  block: any
) =>
  blockTreeMatches(
    block,
    (currentBlock) => {
      const searchText =
        getBlockSearchText(
          currentBlock
        );

      return (
        currentBlock?.type ===
          "navbar" ||

        searchText.includes(
          "navbar"
        ) ||

        searchText.includes(
          "site-header"
        ) ||

        searchText.includes(
          "main-nav"
        ) ||

        currentBlock?.props
          ?.tagName === "nav" ||

        currentBlock?.data
          ?.props?.tagName === "nav"
      );
    }
  );

const isFooterLikeBlock = (
  block: any
) =>
  blockTreeMatches(
    block,
    (currentBlock) => {
      const searchText =
        getBlockSearchText(
          currentBlock
        );

      return (
        currentBlock?.type ===
          "footer" ||

        searchText.includes(
          "footer"
        ) ||

        currentBlock?.props
          ?.tagName === "footer" ||

        currentBlock?.data
          ?.props?.tagName ===
          "footer"
      );
    }
  );

  const canSetGlobalNavbar =
    Boolean(
      editorSite &&
      selectedBlock &&
      isNavbarLikeBlock(
        selectedBlock
      )
    );

  const canSetGlobalFooter =
    Boolean(
      editorSite &&
      selectedBlock &&
      isFooterLikeBlock(
        selectedBlock
      )
    );

  const cmsPreviewBlocks =
    useMemo(
      () => {
        if (!cmsTemplatePreview) {
          return null;
        }

        return resolveCmsBindingsInTree(
          blocks,
          cmsTemplatePreview.entry.data || {},
          cmsTemplatePreview.collection.fields || []
        );
      },
      [
        blocks,
        cmsTemplatePreview
      ]
    );
console.log(
  "CMS_TEST",
  cmsPreviewBlocks
);
  const pageBlocksForCanvas =
    cmsPreviewBlocks || blocks;

  const pageOwnsNavbar =
    pageBlocksForCanvas.some(
      (block: any) =>
        isNavbarLikeBlock(block)
    );

  const pageOwnsFooter =
    pageBlocksForCanvas.some(
      (block: any) =>
        isFooterLikeBlock(block)
    );

  const globalNavbar =
    !pageOwnsNavbar
      ? globalNavbarDraft
      : null;

  const globalFooter =
    !pageOwnsFooter
      ? globalFooterDraft
      : null;
 const canvasBlocks =
  useMemo(
    () => [
      ...(globalNavbar
        ? [globalNavbar]
        : []),

      ...pageBlocksForCanvas,

      ...(globalFooter
        ? [globalFooter]
        : [])
    ],
    [
      globalNavbar,
      pageBlocksForCanvas,
      globalFooter
    ]
  );

  const globalNavbarBlockIds =
    useMemo(
      () =>
        collectBlockIds(
          globalNavbar
        ),
      [globalNavbar]
    );

  const globalFooterBlockIds =
    useMemo(
      () =>
        collectBlockIds(
          globalFooter
        ),
      [globalFooter]
    );

  const resolveDndSlot =
    useCallback(
      (
        blockId?: string
      ): DndSlot => {
        if (!blockId) {
          return "page";
        }

        const normalizedId =
          String(blockId);

        if (
          globalNavbarBlockIds.has(
            normalizedId
          )
        ) {
          return "navbar";
        }

        if (
          globalFooterBlockIds.has(
            normalizedId
          )
        ) {
          return "footer";
        }

        return "page";
      },
      [
        globalNavbarBlockIds,
        globalFooterBlockIds
      ]
    );
  // ============================================
  // GLOBAL LAYOUT HANDLER
  // ============================================

  const saveSelectedBlockAsGlobal =
    useCallback(
      async (
        slot:
          | "navbar"
          | "footer"
      ) => {
        if (isCmsEntryPreviewActive) {
          return;
        }

        if (
          !siteId ||
          !selectedBlock ||
          !editorSite
        ) {
          return;
        }

        const sourceBlock =
          slot === "navbar"
            ? selectedGlobalSlot ===
                "navbar"
              ? globalNavbarDraft
              : selectedBlock
            : selectedGlobalSlot ===
                "footer"
              ? globalFooterDraft
              : selectedBlock;

        const validBlock =
          slot === "navbar"
            ? isNavbarLikeBlock(
                sourceBlock
              )
            : isFooterLikeBlock(
                sourceBlock
              );

        if (!validBlock) {
          window.alert(
            slot === "navbar"
              ? "Select a Navbar block first."
              : "Select a Footer block first."
          );

          return;
        }

        const currentLayout =
          editorSite.globalLayout || {
            navbar: null,
            footer: null
          };

        const clonedBlock =
          JSON.parse(
            JSON.stringify(
              sourceBlock
            )
          );

        try {
       await updateGlobalLayout({
  siteId: Number(siteId),

  globalLayout: {
    navbar:
      slot === "navbar"
        ? clonedBlock
        : currentLayout.navbar || null,

    footer:
      slot === "footer"
        ? clonedBlock
        : currentLayout.footer || null
  }
}).unwrap();

// Remove the local Navbar/Footer from the page
// only when the selected block came from the page itself.
if (!selectedGlobalSlot) {
  const nextBlocks = (
    Array.isArray(blocks)
      ? blocks
      : []
  )
    .map((block: any) =>
      removeBlockFromTree(
        block,
        sourceBlock.id
      )
    )
    .filter(Boolean);

  actions.setBlocks(
    nextBlocks as any[]
  );
}

await refetchEditorSite();

window.alert(
  slot === "navbar"
    ? "Global Navbar saved."
    : "Global Footer saved."
);
        } catch (error) {
          console.error(
            "GLOBAL_LAYOUT_SAVE_FAILED",
            error
          );

          window.alert(
            "Failed to save global layout."
          );
        }
      },
      [
        editorSite,
        refetchEditorSite,
        selectedBlock,
        siteId,
        updateGlobalLayout,
        globalNavbarDraft,
        globalFooterDraft,
        selectedGlobalSlot,
        isCmsEntryPreviewActive
      ]
    );

  // ============================================
  // HTML IMPORT HANDLERS
  // ============================================

  const handleHtmlImportExecute = useCallback(async () => {
    if (isCmsEntryPreviewActive) return;
    if (!htmlCode.trim()) return;

    try {
      const imported = await importHtmlDocument(htmlCode);

      if (imported?.blocks) {
        if (imported.designTokens) {
          updateToken({
            colors: { ...(tokens?.colors || {}), ...imported.designTokens.colors },
            spacing: { ...(tokens?.spacing || {}), ...imported.designTokens.spacing },
            radius: { ...(tokens?.radius || {}), ...imported.designTokens.radius },
          });
        }

        const hydrated = hydrateBlocks(
          imported.blocks.map((block: any) => ({
            ...block,
            props: block.data?.props || {},
            style: block.data?.style || {},
            children: block.children || [],
          }))
        );

        actions.setBlocks(
          normalizeTree(hydrated as any) as any
        );
        setIsModalOpen(false);
        setHtmlCode("");
      }
    } catch (error) {
      console.error("HTML import failed", error);
    }
  }, [htmlCode, actions, updateToken, tokens, isCmsEntryPreviewActive]);

  const handleZipImportExecute = useCallback(async () => {
    if (isCmsEntryPreviewActive) return;
    if (!zipFile || zipImporting) return;

    setZipImporting(true);
    setZipImportStep("Starting ZIP import...");

    try {
      await executeZipWebsiteImport({
        zipFile,
        siteId: Number(siteId),
        uploadHtmlZip,
        updateGlobalLayout,
        createPage,
        publishPage,
        getPages,
        updatePage,
        onHomepageImported: (hydrated) => {
          const canonicalHomepage =
            normalizeTree(hydrated as any) as any;

          actions.setBlocks(canonicalHomepage);
          setSelectedBlockId(canonicalHomepage[0]?.id || null);
        },
        onProgress: (message) => {
          setZipImportStep(message);
          console.log("ZIP_IMPORT_PROGRESS", message);
        },
      });

      setZipImportStep("Import completed.");
      setIsModalOpen(false);
      setZipFile(null);
    } catch (error) {
      console.error("ZIP import failed", error);
      if (error instanceof ZipWebsiteImportError) {
        const firstFailure =
          error.result.failedPages[0];

        setZipImportStep(
          firstFailure
            ? `Import failed: ${firstFailure.sourceFile || firstFailure.slug} - ${firstFailure.backendCode || firstFailure.message}`
            : error.message
        );
      } else {
        setZipImportStep(
          error instanceof Error
            ? `Import failed: ${error.message}`
            : "Import failed. Check console."
        );
      }
    } finally {
      setZipImporting(false);
    }
  }, [zipFile, zipImporting, siteId, actions, uploadHtmlZip, updateGlobalLayout, createPage, publishPage, getPages, updatePage, setSelectedBlockId, isCmsEntryPreviewActive]);

  const handleFigmaTokenGenerate = useCallback(async () => {
    if (!isFigmaPluginEnabled) return;
    try {
      const result = await generateFigmaPluginToken().unwrap();
      setFigmaToken(result.data.token);
    } catch (error) {
      console.error("Figma token generation failed", error);
    }
  }, [generateFigmaPluginToken, isFigmaPluginEnabled]);

  const handleExport = useCallback(() => {
    const json = actions.exportPageData();
    downloadJsonFile(`${slug || "page"}-config.json`, json);
  }, [actions, slug]);

  const handlePublish =
    useCallback(
      () => {
        runUnlessCmsPreviewActive(
          cmsTemplatePreview,
          actions.publish
        );
      },
      [
        actions.publish,
        cmsTemplatePreview
      ]
    );

  const handleImport = useCallback(
    async (file: File) => {
      if (isCmsEntryPreviewActive) {
        return;
      }

      try {
        const content = await readJsonFile(file);
        actions.importPageData(content);
      } catch (error) {
        console.error("Failed to read import file", error);
      }
    },
    [
      actions,
      isCmsEntryPreviewActive
    ]
  );

  const handleTabChange = useCallback((index: number) => {
    setActiveTab(index);
    setRightPanelOpen(true);
  }, []);

  const handleApplyThemeToPage = useCallback(() => {
    if (isCmsEntryPreviewActive) {
      return;
    }

    actions.setBlocks(
      applyThemeToBlocks(blocks, tokens)
    );
  }, [
    actions,
    blocks,
    tokens,
    isCmsEntryPreviewActive
  ]);

  useEffect(() => {
    if (!isCmsEntryPreviewActive) {
      return;
    }

    setSavePatternDialogOpen(false);
    setPatternLibraryOpen(false);
  }, [
    isCmsEntryPreviewActive
  ]);

  useEffect(() => {
    if (!isPlatformSettingsLoading && !isFigmaPluginEnabled) {
      setFigmaDialogOpen(false);
    }
  }, [isPlatformSettingsLoading, isFigmaPluginEnabled]);

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  const renderLeftSidebar = () => (
    <Paper
      square
      sx={{
        width: leftSidebarOpen ? 260 : 70,
        height: "100%",
        transition: "width 0.3s",
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 1, display: "flex", justifyContent: leftSidebarOpen ? "flex-end" : "center" }}>
        <IconButton onClick={() => setLeftSidebarOpen((prev) => !prev)} size="small">
          {leftSidebarOpen ? <ChevronLeftIcon /> : <MenuOpenIcon />}
        </IconButton>
      </Box>

      <Box sx={{ p: 2, flexGrow: 1, overflowY: "auto" }}>
        {isCmsEntryPreviewActive && (
          <Alert
            severity="info"
            sx={{ mb: 2 }}
          >
            CMS entry preview is read-only. Clear preview to edit the template.
          </Alert>
        )}

        {leftSidebarOpen && (
          <Typography variant="overline" sx={{ fontWeight: "bold", mb: 2, display: "block" }}>
            COMPOSANTS
          </Typography>
        )}

        {!isCmsEntryPreviewActive && (
          <Stack alignItems={leftSidebarOpen ? "stretch" : "center"}>
            {Object.entries(blockRegistry).map(([type, config]) => (
              <DraggableBlockItem key={type} type={type} config={config} compact={!leftSidebarOpen} />
            ))}
          </Stack>
        )}

        <StructurePanel
          blocks={canvasBlocks}
          selectedId={selectedBlockId}
          onSelect={setSelectedBlockId}
          hoveredId={hoveredBlockId}
          onHover={setHoveredBlockId}
        />
      </Box>
    </Paper>
  );

  const renderRightSidebar = () => (
    <Paper
      square
      sx={{
        width: rightPanelOpen ? 360 : 110,
        minWidth: rightPanelOpen ? 360 : 110,
        maxWidth: rightPanelOpen ? 360 : 110,
        height: "100%",
        borderLeft: 1,
        borderColor: "divider",
        overflow: "hidden",
        transition: "width 0.25s ease",
      }}
    >
      {!rightPanelOpen ? (
        <Stack sx={{ p: 1.5, pt: 3 }} spacing={1}>
          {TAB_LABELS.map((label, index) => (
            <Button
              key={label}
              fullWidth
              onClick={() => handleTabChange(index)}
              sx={{
                justifyContent: "flex-start",
                fontWeight: 800,
                textTransform: "none",
                px: 0.5,
                fontSize: 13,
                color: "primary.main",
              }}
            >
              {label === "ai" ? "AI ✨" : label.charAt(0).toUpperCase() + label.slice(1)}
            </Button>
          ))}
        </Stack>
      ) : (
        <Box sx={{ height: "100%", overflowY: "auto", p: 2 }}>
          <Button onClick={() => setRightPanelOpen(false)} sx={{ mb: 2, textTransform: "none", fontWeight: 700 }}>
            ← Retour
          </Button>

          {activeTab === TAB_INDEX.settings && (
            <SettingsPanel
              pageTitle={pageTitle}
              setPageTitle={setPageTitle}
              slug={slug}
              setSlug={setSlug}
              pageVisibility={pageVisibility}
              setPageVisibility={setPageVisibility}
              onExport={handleExport}
              onImport={handleImport}
              onImportHtml={() => setIsModalOpen(true)}
              onImportFigma={() => isFigmaPluginEnabled && setFigmaDialogOpen(true)}
              figmaPluginEnabled={isFigmaPluginEnabled}
              figmaPluginLoading={isPlatformSettingsLoading}
            />
          )}

          {activeTab === TAB_INDEX.style && (
            isCmsEntryPreviewActive ? (
              <Alert severity="info">
                CMS entry preview is read-only. Clear preview to edit the template.
              </Alert>
            ) : (
              <InspectorPanel
                block={selectedBlock}
                device={device}
                onChange={
                  handleSelectedBlockChange
                }
              />
            )
          )}

          {activeTab === TAB_INDEX.theme && (
            isCmsEntryPreviewActive ? (
              <Alert severity="info">
                CMS entry preview is read-only. Clear preview to edit the template.
              </Alert>
            ) : (
              <ThemeEditorPanel
                onApplyThemeToPage={handleApplyThemeToPage}
              />
            )
          )}

          {activeTab === TAB_INDEX.seo && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  SEO
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Configure search engine and social sharing metadata.
                </Typography>
              </Box>

              <TextField
                label="Meta title"
                fullWidth
                value={seoForm.metaTitle}
                onChange={handleSeoChange("metaTitle")}
                helperText={`${seoForm.metaTitle.length}/60 recommended`}
              />

              <TextField
                label="Meta description"
                fullWidth
                multiline
                rows={4}
                value={seoForm.metaDescription}
                onChange={handleSeoChange("metaDescription")}
                helperText={`${seoForm.metaDescription.length}/160 recommended`}
              />

              <TextField
                label="Robots"
                fullWidth
                value={seoForm.metaRobots}
                onChange={handleSeoChange("metaRobots")}
                helperText="Example: index,follow or noindex,nofollow"
              />

              <TextField
                label="Canonical URL"
                fullWidth
                value={seoForm.canonicalUrl}
                onChange={handleSeoChange("canonicalUrl")}
                helperText="Leave empty to use the public page URL"
              />

              <TextField
                label="Open Graph image"
                fullWidth
                value={seoForm.ogImage}
                onChange={handleSeoChange("ogImage")}
                helperText="Image URL used when sharing the page"
              />

              <Button variant="contained" onClick={handleSeoSave} disabled={!pageId || isSeoSaving}>
                {isSeoSaving ? "Saving SEO..." : "Save SEO"}
              </Button>
            </Stack>
          )}

          {activeTab === TAB_INDEX.history && (
            <VersionHistory
              versions={versions}
              isLoading={isLoadingVersions || isLoading}
              onRestore={(id) =>
                runUnlessCmsPreviewActive(
                  cmsTemplatePreview,
                  () => actions.restoreVersion?.(id)
                )
              }
            />
          )}

          {activeTab === TAB_INDEX.ai && (
            isCmsEntryPreviewActive ? (
              <Alert severity="info">
                CMS entry preview is read-only. Clear preview to edit the template.
              </Alert>
            ) : (
              <AssistantPanel
                siteId={siteId || ""}
                pageId={pageId || undefined}
                blocks={blocks}
                pageTitle={pageTitle}
                slug={slug}
                hasGlobalNavbar={Boolean(globalNavbarDraft)}
                hasGlobalFooter={Boolean(globalFooterDraft)}
                selectedBlockId={selectedBlockId}
                actions={actions}
                setPageTitle={setPageTitle}
                setSelectedBlockId={setSelectedBlockId}
                generateAiPage={generateAiPage}
                askAssistant={askAssistant}
                editSelectedBlock={editSelectedBlock}
                hydrateBlocks={hydrateBlocks}
                designCopilotChat={designCopilotChat}
                designCopilotApply={designCopilotApply}
              />
            )
          )}
        </Box>
      )}
    </Paper>
  );

  const updateGlobalDraftBlock =
    useCallback(
      (
        slot:
          | "navbar"
          | "footer",
        blockId: string,
        update: any
      ) => {
        if (slot === "navbar") {
          setGlobalNavbarDraft(
            (current: any) =>
              current
                ? updateBlockInTree(
                    current,
                    blockId,
                    update
                  )
                : current
          );

          return;
        }

        setGlobalFooterDraft(
          (current: any) =>
            current
              ? updateBlockInTree(
                  current,
                  blockId,
                  update
                )
              : current
        );
      },
      []
    );

  const insertIntoGlobalSlot =
    useCallback(
      (
        slot:
          | "navbar"
          | "footer",
        newBlock: any,
        targetId: string,
        position:
          DndInsertPosition,
        index?: number
      ) => {
        const updateSlot = (
          current: any
        ) => {
          if (!current) {
            return current;
          }

          return insertBlockIntoTree(
            current,
            newBlock,
            targetId,
            position,
            index
          );
        };

        if (slot === "navbar") {
          setGlobalNavbarDraft(
            updateSlot
          );

          return;
        }

        setGlobalFooterDraft(
          updateSlot
        );
      },
      []
    );

  const dndActions =
    useMemo(
      () => ({
        addBlock: (
          type: string,
          targetId?: string,
          position?: string,
          presetData?: any,
          insertIndex?: number
        ) => {
          if (isCmsEntryPreviewActive) {
            return;
          }

          const slot =
            resolveDndSlot(
              targetId
            );
            let effectivePresetData = presetData;

if (
  type === "link" &&
  siteId &&
  presetData?.props?.label
) {
  const label = String(
    presetData.props.label
  ).trim();

  const slug = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  effectivePresetData = {
    ...presetData,
    props: {
      ...(presetData?.props || {}),
      href: `/site/${siteId}/${slug}`,
    },
  };
}

          if (
            slot === "page" ||
            !targetId
          ) {
            actions.addBlock(
              type,
              targetId,
              position,
              effectivePresetData,
              insertIndex
            );

            return;
          }

          const newBlock =
            createDndBlock(
              type,
              effectivePresetData
            );

          insertIntoGlobalSlot(
            slot,
            newBlock,
            targetId,
            normalizeDndPosition(
              position
            ),
            insertIndex
          );
        },

        addBlockTree: (
          tree: any,
          targetId?: string,
          position?: string,
          insertIndex?: number
        ) => {
          if (isCmsEntryPreviewActive) {
            return;
          }

          const slot =
            resolveDndSlot(
              targetId
            );

          if (
            slot === "page" ||
            !targetId
          ) {
            actions.addBlockTree(
              tree,
              targetId,
              position,
              insertIndex
            );

            return;
          }

          insertIntoGlobalSlot(
            slot,
            structuredClone(
              tree
            ),
            targetId,
            normalizeDndPosition(
              position
            ),
            insertIndex
          );
        },

        moveBlock: (
          blockId: string,
          location: {
            targetId?: string;

            position:
              | "before"
              | "after"
              | "inside";

            index?: number;
            wrapperType?: string;
          }
        ) => {
          if (isCmsEntryPreviewActive) {
            return;
          }

          const sourceSlot =
            resolveDndSlot(
              blockId
            );

          const targetSlot =
            resolveDndSlot(
              location.targetId
            );

          if (
            canMoveWithinDndSlots(
              sourceSlot,
              targetSlot,
              location.targetId
            ) &&
            sourceSlot === "page"
          ) {
            actions.moveBlock(
              blockId,
              location
            );

            return;
          }

          if (
            !canMoveWithinDndSlots(
              sourceSlot,
              targetSlot,
              location.targetId
            )
          ) {
            return;
          }

          const updateSlot = (
            current: any
          ) => {
            if (
              !current ||
              current.id === blockId
            ) {
              return current;
            }

            const movingBlock =
              findBlockById(
                [current],
                blockId
              );

            if (!movingBlock) {
              return current;
            }

            const targetInsideMovingBlock =
              findBlockById(
                [movingBlock],
                location.targetId!
              );

            if (targetInsideMovingBlock) {
              return current;
            }

            const treeWithoutBlock =
              removeBlockFromTree(
                current,
                blockId
              );

            if (!treeWithoutBlock) {
              return current;
            }

            const blockToInsert =
              location.wrapperType
                ? createDndBlock(
                    location.wrapperType,
                    {
                      presetChildren: [
                        structuredClone(
                          movingBlock
                        )
                      ]
                    }
                  )
                : structuredClone(
                    movingBlock
                  );

            return insertBlockIntoTree(
              treeWithoutBlock,
              blockToInsert,
              location.targetId!,
              location.position,
              location.index
            );
          };

          if (
            sourceSlot === "navbar"
          ) {
            setGlobalNavbarDraft(
              updateSlot
            );

            return;
          }

          setGlobalFooterDraft(
            updateSlot
          );
        }
      }),
      [
        actions,
        insertIntoGlobalSlot,
        resolveDndSlot,
        isCmsEntryPreviewActive
      ]
    );

  const {
    activeId,
    activeData,
    overId,
    dropPosition,
    isAllowed,
    ghost,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel
  } = useDragAndDrop({
    blocks:
      canvasBlocks,

    rootInsertIndex:
      blocks.length,

    actions:
      dndActions,

    resolveDndSlot
  });

  const guardedHandleDragStart =
    useCallback(
      (event: any) => {
        if (isCmsEntryPreviewActive) {
          return;
        }

        handleDragStart(event);
      },
      [
        handleDragStart,
        isCmsEntryPreviewActive
      ]
    );

  const guardedHandleDragOver =
    useCallback(
      (event: any) => {
        if (isCmsEntryPreviewActive) {
          return;
        }

        handleDragOver(event);
      },
      [
        handleDragOver,
        isCmsEntryPreviewActive
      ]
    );

  const guardedHandleDragEnd =
    useCallback(
      (event: any) => {
        if (isCmsEntryPreviewActive) {
          return;
        }

        handleDragEnd(event);
      },
      [
        handleDragEnd,
        isCmsEntryPreviewActive
      ]
    );

  const guardedHandleDragCancel =
    useCallback(
      () => {
        if (isCmsEntryPreviewActive) {
          return;
        }

        handleDragCancel();
      },
      [
        handleDragCancel,
        isCmsEntryPreviewActive
      ]
    );

 const handleSelectedBlockChange =
  useCallback(
    (update: any) => {
      if (isCmsEntryPreviewActive) {
        return;
      }

      if (!selectedBlockId) {
        return;
      }

      if (selectedGlobalSlot) {
        updateGlobalDraftBlock(
          selectedGlobalSlot,
          selectedBlockId,
          update
        );

        return;
      }

      let nextUpdate = update;

       const updatedLabel =
      update?.data?.props?.label ??
      update?.props?.label;

       if (
       selectedPageBlock?.type === "link" &&
       siteId &&
       updatedLabel
        ) {
        const currentProps =
          selectedPageBlock.data?.props || {};

        const currentHref =
          currentProps.href ||
          currentProps.url ||
          currentProps.link ||
          "";

        const currentLabel =
          String(
            currentProps.label || ""
          ).trim();

        const currentSlug =
          currentLabel
            .toLowerCase()
            .normalize("NFD")
            .replace(
              /[\u0300-\u036f]/g,
              ""
            )
            .replace(
              /[^a-z0-9]+/g,
              "-"
            )
            .replace(
              /^-+|-+$/g,
              "");

        const generatedHref =
          `/site/${siteId}/${currentSlug}`;

        // Only update URL when it is still automatic
        if (
          currentHref === "#" ||
          currentHref === generatedHref
        ) {
         const newLabel =
         String(updatedLabel).trim();

          const newSlug =
            newLabel
              .toLowerCase()
              .normalize("NFD")
              .replace(
                /[\u0300-\u036f]/g,
                ""
              )
              .replace(
                /[^a-z0-9]+/g,
                "-"
              )
              .replace(
                /^-+|-+$/g,
                "");

          nextUpdate = {
            ...update,
            data: {
              ...(update.data || {}),
              props: {
                ...(update.data?.props || {}),
                href:
                  `/site/${siteId}/${newSlug}`
              }
            }
          };
        }
      }

      actions.updateBlock(
        selectedBlockId,
        nextUpdate
      );
    },
    [
      actions,
      selectedBlockId,
      selectedGlobalSlot,
      updateGlobalDraftBlock,
      isCmsEntryPreviewActive,
      selectedPageBlock,
      siteId
    ]
  );

  const handleCanvasUpdate =
  useCallback(
    (
      blockId: string,
      update: any
    ) => {
      if (isCmsEntryPreviewActive) {
        return;
      }

      const navbarBlock =
        globalNavbarDraft
          ? findBlockById(
              [globalNavbarDraft],
              blockId
            )
          : null;

      if (navbarBlock) {
        updateGlobalDraftBlock(
          "navbar",
          blockId,
          update
        );

        return;
      }

      const footerBlock =
        globalFooterDraft
          ? findBlockById(
              [globalFooterDraft],
              blockId
            )
          : null;

      if (footerBlock) {
        updateGlobalDraftBlock(
          "footer",
          blockId,
          update
        );

        return;
      }

      actions.updateBlock(
        blockId,
        update
      );
    },
    [
      actions,
      globalNavbarDraft,
      globalFooterDraft,
      updateGlobalDraftBlock,
      isCmsEntryPreviewActive
    ]
  );

const handleCanvasDelete =
  useCallback(
    (
      blockId: string
    ) => {
      if (isCmsEntryPreviewActive) {
        return;
      }

      const navbarBlock =
        globalNavbarDraft
          ? findBlockById(
              [globalNavbarDraft],
              blockId
            )
          : null;

      if (navbarBlock) {
        setGlobalNavbarDraft(
          (current: any) =>
            current
              ? removeBlockFromTree(
                  current,
                  blockId
                )
              : current
        );

        setSelectedBlockId(null);

        return;
      }

      const footerBlock =
        globalFooterDraft
          ? findBlockById(
              [globalFooterDraft],
              blockId
            )
          : null;

      if (footerBlock) {
        setGlobalFooterDraft(
          (current: any) =>
            current
              ? removeBlockFromTree(
                  current,
                  blockId
                )
              : current
        );

        setSelectedBlockId(null);

        return;
      }

      actions.deleteBlock(
        blockId
      );
    },
    [
      actions,
      globalNavbarDraft,
      globalFooterDraft,
      setSelectedBlockId,
      isCmsEntryPreviewActive
    ]
  );

const handleCanvasDuplicate =
  useCallback(
    (
      blockId: string
    ) => {
      if (isCmsEntryPreviewActive) {
        return;
      }

      const isGlobalNavbarBlock =
        Boolean(
          globalNavbarDraft &&
          findBlockById(
            [globalNavbarDraft],
            blockId
          )
        );

      const isGlobalFooterBlock =
        Boolean(
          globalFooterDraft &&
          findBlockById(
            [globalFooterDraft],
            blockId
          )
        );

      if (
        isGlobalNavbarBlock ||
        isGlobalFooterBlock
      ) {
        return;
      }

      actions.duplicateBlock(
        blockId
      );
    },
    [
      actions,
      globalNavbarDraft,
      globalFooterDraft,
      isCmsEntryPreviewActive
    ]
  );

  const handleCmsPreviewEntryChange =
    useCallback(
      (entryId: number | "") => {
        setSelectedCmsPreviewEntryId(
          entryId
        );
      },
      []
    );

  const handleCmsTemplatePreviewChange =
    useCallback(
      (
        preview:
          | CmsTemplatePreview
          | null
      ) => {
        setCmsTemplatePreview(
          preview
        );
      },
      []
    );

  const cmsRuntimeContext =
    cmsTemplatePreview
      ? {
          collectionId:
            cmsTemplatePreview
              .collection.id,
          collectionSlug:
            cmsTemplatePreview
              .collection.slug,
          entryId:
            cmsTemplatePreview
              .entry.id,
          entrySlug:
            cmsTemplatePreview
              .entry.slug,
          data:
            cmsTemplatePreview
              .entry.data || {},
          fields:
            cmsTemplatePreview
              .collection.fields || []
        }
      : undefined;

  const renderContent = () => (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {!isPreview && errors.length > 0 && (
        <ValidationPanel
          errors={errors}
          onSelectBlock={(blockId) => {
            setSelectedBlockId(blockId);
            setActiveTab(TAB_INDEX.style);
          }}
        />
      )}

      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          overflowX: "hidden",
          bgcolor: "background.default",
          display: "flex",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: device === "desktop" ? 1440 : device === "tablet" ? 768 : 390,
            display: "flex",
            flexDirection: "column"
          }}
        >
        <EditorCanvas
  blocks={canvasBlocks}

  validationBlocks={getCmsPreviewSaveBlocks(blocks)}

  registry={registry}

  selectedId={
    selectedBlockId
  }

  onSelect={
    setSelectedBlockId
  }

  onUpdate={
    handleCanvasUpdate
  }

  onDelete={
    handleCanvasDelete
  }

  device={device}

  preview={isPreview}

  readOnly={isCmsEntryPreviewActive}

  tokens={tokens}

  siteId={
    Number(siteId || 0) ||
    null
  }

  pageId={
    Number(pageId || 0) ||
    null
  }

  cms={cmsRuntimeContext}

  activeId={activeId}

  hoverData={{
    overId,
    dropPosition,
    isAllowed
  }}

  onDuplicate={
    handleCanvasDuplicate
  }

  hoveredId={
    hoveredBlockId
  }

  errors={errors}
/>
        </Box>
      </Box>
    </Box>
  );

  const renderImportModal = () => (
    <Modal
      open={isModalOpen}
      onClose={() => !zipImporting && setIsModalOpen(false)}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Paper sx={{ width: 550, p: 3, borderRadius: "12px", display: "flex", flexDirection: "column", gap: 2, position: "relative" }}>
        <IconButton
          onClick={() => setIsModalOpen(false)}
          disabled={zipImporting}
          sx={{ position: "absolute", top: 12, right: 12 }}
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
          placeholder="<section>\n  <h1>Hello words</h1>\n  <p>I am chaimakabboudi</p>\n</section>"
          value={htmlCode}
          onChange={(e) => setHtmlCode(e.target.value)}
          disabled={zipImporting}
          sx={{ fontFamily: "monospace" }}
        />

        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}>
          <Button variant="outlined" color="inherit" onClick={() => setIsModalOpen(false)} disabled={zipImporting}>
            Cancel
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleHtmlImportExecute}
            disabled={!htmlCode.trim() || zipImporting}
          >
            Parse & Inject
          </Button>

          <Button variant="outlined" component="label" disabled={zipImporting}>
            Upload Website ZIP
            <input hidden type="file" accept=".zip" onChange={(e) => setZipFile(e.target.files?.[0] || null)} />
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={handleZipImportExecute}
            disabled={!zipFile || zipImporting}
          >
            {zipImporting ? "Importing..." : "Import ZIP"}
          </Button>
        </Stack>

        {zipFile && (
          <Typography variant="caption" color="text.secondary">
            Selected: {zipFile.name}
          </Typography>
        )}

        {zipImporting && (
          <Box sx={{ mt: 1, p: 2, border: 1, borderColor: "divider", borderRadius: 2, display: "flex", alignItems: "center", gap: 2, bgcolor: "background.default" }}>
            <CircularProgress size={24} />
            <Box>
              <Typography fontWeight={700}>Importing website...</Typography>
              <Typography variant="body2" color="text.secondary">
                {zipImportStep}
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </Modal>
  );

  const renderFigmaModal = () => (
    <Modal
      open={figmaDialogOpen && isFigmaPluginEnabled}
      onClose={() => setFigmaDialogOpen(false)}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Paper sx={{ width: 520, p: 3, borderRadius: 3, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Connect Figma Plugin
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Generate a plugin token, copy it, then paste it once inside the Figma plugin.
        </Typography>

        <TextField fullWidth label="Plugin Token" value={figmaToken} InputProps={{ readOnly: true }} />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={() => setFigmaDialogOpen(false)}>Close</Button>
          <Button variant="outlined" disabled={!figmaToken} onClick={() => navigator.clipboard.writeText(figmaToken)}>
            Copy
          </Button>
          <Button variant="contained" disabled={!isFigmaPluginEnabled} onClick={handleFigmaTokenGenerate}>
            Generate Token
          </Button>
        </Stack>
      </Paper>
    </Modal>
  );

  const renderGhost = () => {
    if (
      isCmsEntryPreviewActive ||
      !ghost ||
      !activeId
    ) return null;

    return (
      <Box sx={{ position: "fixed", top: ghost.y, left: ghost.x, zIndex: 9999, pointerEvents: "none" }}>
        <DragGhost type={activeData?.type || "block"} isAllowed={isAllowed} />
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <RuntimeProvider
      value={{
        mode: isPreview
          ? "preview"
          : "editor",

        device,

        tokens,

        siteId:
          Number(siteId || 0) ||
          null,

        pageId:
          Number(pageId || 0) ||
          null,

        cms:
          cmsRuntimeContext
      }}
    >
      <ThemeContext.Provider value={{ tokens, updateToken }}>
        <DndContext
          collisionDetection={customCollisionStrategy}
          onDragStart={guardedHandleDragStart}
          onDragOver={guardedHandleDragOver}
          onDragEnd={guardedHandleDragEnd}
          onDragCancel={guardedHandleDragCancel}
        >
          <EditorLayout
            header={
              <PageHeader
                title={pageTitle}
                readOnly={isCmsEntryPreviewActive}
                readOnlyReason="CMS entry preview is read-only. Clear preview to edit the template."
                cmsPreviewControl={
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <CmsEntryPreviewSelect
                      siteId={
                        Number(siteId || 0) ||
                        ""
                      }
                      pageId={
                        Number(pageId || 0) ||
                        null
                      }
                      selectedEntryId={
                        selectedCmsPreviewEntryId
                      }
                      onEntryChange={
                        handleCmsPreviewEntryChange
                      }
                      onPreviewChange={
                        handleCmsTemplatePreviewChange
                      }
                    />

                    {isCmsEntryPreviewActive && (
                      <Alert
                        severity="info"
                        sx={{
                          py: 0,
                          whiteSpace: "nowrap"
                        }}
                      >
                        CMS entry preview is read-only. Clear preview to edit the template.
                      </Alert>
                    )}
                  </Stack>
                }
                onSave={actions.save}
                loading={isSaving || isLoading}
                canUndo={
                  canUndo &&
                  !isCmsEntryPreviewActive
                }
                canRedo={
                  canRedo &&
                  !isCmsEntryPreviewActive
                }
                onUndo={() =>
                  runUnlessCmsPreviewActive(
                    cmsTemplatePreview,
                    actions.undo
                  )
                }
                onRedo={() =>
                  runUnlessCmsPreviewActive(
                    cmsTemplatePreview,
                    actions.redo
                  )
                }
                device={device}
                onDeviceChange={setDevice}
                isPreview={isPreview}
                onPreview={() => setIsPreview((prev) => !prev)}
                onPublish={handlePublish}
                hasPageId={!!pageId}
                errors={errors}
                onExport={handleExport}
                onImport={handleImport}
                onImportHtml={() =>
                  runUnlessCmsPreviewActive(
                    cmsTemplatePreview,
                    () => setIsModalOpen(true)
                  )
                }
                onSetGlobalNavbar={() =>
                  saveSelectedBlockAsGlobal(
                    "navbar"
                  )
                }
                onSetGlobalFooter={() =>
                  saveSelectedBlockAsGlobal(
                    "footer"
                  )
                }
                canSetGlobalNavbar={
                  canSetGlobalNavbar &&
                  !isCmsEntryPreviewActive
                }
                canSetGlobalFooter={
                  canSetGlobalFooter &&
                  !isCmsEntryPreviewActive
                }
                globalLayoutLoading={
                  isUpdatingGlobalLayout ||
                  isLoadingEditorSite
                }
                onSaveAsPattern={() =>
                  runUnlessCmsPreviewActive(
                    cmsTemplatePreview,
                    () => setSavePatternDialogOpen(true)
                  )
                }
                canSaveAsPattern={
                  canSaveSelectedPageBlockAsPattern &&
                  !isCmsEntryPreviewActive
                }
                patternSaveDisabledReason={
                  isCmsEntryPreviewActive
                    ? "CMS entry preview is read-only. Clear preview to edit the template."
                    : patternSaveDisabledReason
                }
                onOpenPatternLibrary={() =>
                  runUnlessCmsPreviewActive(
                    cmsTemplatePreview,
                    () => setPatternLibraryOpen(true)
                  )
                }
                canOpenPatternLibrary={
                  numericSiteId > 0 &&
                  !isCmsEntryPreviewActive
                }
              />
            }
            leftSidebar={!isPreview && renderLeftSidebar()}
            rightSidebar={!isPreview && !isCmsEntryPreviewActive && renderRightSidebar()}
            content={renderContent()}
          />

          {renderImportModal()}
          {renderFigmaModal()}
          {numericSiteId > 0 && !isCmsEntryPreviewActive && (
            <>
              <SavePatternDialog
                open={savePatternDialogOpen}
                onClose={() =>
                  setSavePatternDialogOpen(false)
                }
                siteId={numericSiteId}
                selectedSection={
                  canSaveSelectedPageBlockAsPattern
                    ? selectedPageBlock
                    : null
                }
                onSaved={() =>
                  setSavePatternDialogOpen(false)
                }
              />

              <PatternLibraryPanel
                open={patternLibraryOpen}
                onClose={() =>
                  setPatternLibraryOpen(false)
                }
                siteId={numericSiteId}
                actions={actions}
              />
            </>
          )}
          {renderGhost()}
        </DndContext>
      </ThemeContext.Provider>
    </RuntimeProvider>
  );
};

export default PageEditor;
