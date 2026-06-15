import React from "react";

import {
  Box,
  Typography,
  Button
} from "@mui/material";

import {
  Block,
  ValidationError
} from "../../types/page.types";

import {
  EditorBlockRenderer
} from "../../runtime/renderer/EditorBlockRenderer";

import {
  VirtualOverlayLayer
} from "../../runtime/renderer/VirtualOverlayLayer";

import {
  RuntimeProvider
} from "../../runtime/context/RuntimeProvider";

import {
  validateTreeInvariants
} from "../../runtime/validation/invariants";

import {
  useRuntimeNode
} from "../../hooks/useRuntimeNode";

interface EditorCanvasProps {

  blocks: Block[];

  registry: any;

  preview?: boolean;

  onUpdate: (
    id: string,
    data: any
  ) => void;

  onDelete: (
    id: string
  ) => void;

  onSelect: (
    id: string
  ) => void;

  selectedId: string | null;

  activeId: string | null;

  hoverData: any;

  tokens?: any;

  onDuplicate: (
    id: string
  ) => void;

  hoveredId: string | null;

  device:
    | "mobile"
    | "desktop"
    | "tablet";

  errors: ValidationError[];
}

export const VIRTUAL_ROOT_ID =
  "pb-runtime-root";

// =====================================
// INNER CONTENT
// =====================================

const EditorCanvasContent = ({
  
  blocks = [],
  registry,
  onUpdate,
  onDelete,
  onSelect,
  selectedId,
  device,
  activeId,
  hoverData,
  onDuplicate,
  hoveredId,
  errors = []
}: EditorCanvasProps) => {

  const viewportRef =
    React.useRef<HTMLDivElement | null>(
      null
    );

  const canvasRef =
    React.useRef<HTMLDivElement | null>(
      null
    );

  const hasVisualProfiles =
    React.useMemo(
      () => {
        const visit = (
          block: Block
        ): boolean =>
          !!(block.meta as any)?.visualProfile ||
          (block.children || []).some(
            visit
          );

        return blocks.some(visit);
      },
      [blocks]
    );

 const canvasWidth =
  device === "mobile"
    ? "375px"
    : device === "tablet"
    ? "768px"
    : "1200px";

const canvasMinWidth = 0;

const canvasMaxWidth =
  device === "desktop"
    ? "1200px"
    : canvasWidth;

  React.useEffect(
    () => {
      const getExpectedWidth = () => {
        if (
          device === "mobile"
        ) {
          return 390;
        }

        if (
          device === "tablet"
        ) {
          return 768;
        }

        return 1440;
      };

      const runReport = () => {
            const viewportElement =
              viewportRef.current;

            const canvasElement =
              canvasRef.current;

            const pageRootElement =
              canvasElement?.querySelector(
                "section, [data-page-root], [data-block-type='section'], [id^='editor-']"
              ) as HTMLElement | null;

            const canvasClientWidth =
              canvasElement?.clientWidth || 0;

            const pageRootClientWidth =
              pageRootElement?.clientWidth || 0;

            if (
              !canvasClientWidth ||
              !pageRootClientWidth
            ) {
              return false;
            }

            const computed =
              pageRootElement
                ? window.getComputedStyle(
                    pageRootElement
                  )
                : null;

            const transform =
              computed?.transform || "";

            const zoom =
              computed?.getPropertyValue(
                "zoom"
              ) || "";

            const matrixMatch =
              transform.match(
                /^matrix\(([^,]+),/
              );

            const scaleFromTransform =
              matrixMatch
                ? Number(
                    matrixMatch[1]
                  )
                : transform &&
                    transform !== "none"
                  ? null
                  : 1;

            const expectedDesktopWidth =
              getExpectedWidth();

            console.log(
              "CANVAS_SCALE_REPORT",
              {
                refs: {
                  viewport:
                    viewportElement?.className || "",
                  canvas:
                    canvasElement?.className || "",
                  pageRootTag:
                    pageRootElement?.tagName || "",
                  pageRootId:
                    pageRootElement?.id || "",
                  pageRootClass:
                    pageRootElement?.className || ""
                },
                viewportWidth:
                  viewportElement?.clientWidth || 0,
                canvasClientWidth:
                  canvasClientWidth,
                pageRootClientWidth:
                  pageRootClientWidth,
                pageRootScrollWidth:
                  pageRootElement?.scrollWidth || 0,
                transform,
                zoom,
                scaleFromTransform,
                device,
                expectedWidth:
                  expectedDesktopWidth,
                effectiveScale:
                  Number(
                    (
                      pageRootClientWidth /
                      expectedDesktopWidth
                    ).toFixed(
                      3
                    )
                  )
              }
            );

            return true;
      };

      const frame =
        window.requestAnimationFrame(
          () => {
            if (
              runReport()
            ) {
              return;
            }

            window.setTimeout(
              runReport,
              0
            );
          }
        );

      return () =>
        window.cancelAnimationFrame(
          frame
        );
    },
    [
      blocks,
      canvasWidth,
      device
    ]
  );

  // =====================================
  // INVARIANTS
  // =====================================

  const invariantReport =
    React.useMemo(
      () =>
        validateTreeInvariants(
          blocks || []
        ),
      [blocks]
    );

  // =====================================
  // ROOT RUNTIME NODE
  // =====================================

  const runtime =
    useRuntimeNode({

      id:
        VIRTUAL_ROOT_ID,

      type:
        "root",

      droppable:
        true
    });

  const {
    isOver,
    rootProps
  } = runtime;

  // =====================================
  // RENDER
  // =====================================

  return (
<Box
  {...rootProps}
  ref={(node: HTMLDivElement | null) => {
    viewportRef.current = node;

    if (typeof rootProps.ref === "function") {
      rootProps.ref(node);
    }
  }}
  sx={{

        px: 4,
        py: 4,

        width: "100%",

        minHeight: "100vh",

        display: "flex",

        justifyContent:
          "center",

        alignItems:
          "flex-start",

        overflowX:
          "auto",

        overflowY:
          "auto",

        backgroundColor:

          isOver

            ? "rgba(25,118,210,0.03)"

            : "#f9f9f9",

        transition:
          "all 0.2s ease",

        position:
          "relative"
      }}
    >

      {!invariantReport.valid ? (

       <Box
  ref={canvasRef}
  
    data-droppable-container="true"
  data-block-id={VIRTUAL_ROOT_ID}
  data-block-type="root"
  sx={{


            width:
              "100%",

            p: 2,

            border:
              "1px solid #ef4444",

            bgcolor:
              "#fef2f2",

            color:
              "#991b1b"
          }}
        >

          <Typography
            variant="subtitle2"
            fontWeight="bold"
          >
            Invalid canonical tree
          </Typography>

          {invariantReport.violations.map(
            (violation) => (

              <Typography
                key={`${violation.code}-${violation.path}`}
                variant="caption"
                display="block"
              >

                {violation.path}
                :
                {" "}
                {violation.message}

              </Typography>
            )
          )}

        </Box>

      ) : (

      <Box
  ref={canvasRef}
  data-droppable-container="true"
  data-block-id={VIRTUAL_ROOT_ID}
  data-block-type="root"
 
  sx={{
    width: "100%",

    minWidth: 0,

    maxWidth:
      device === "desktop"
        ? "1200px"
        : canvasWidth,

            minHeight:
              "100vh",

            flexShrink:
              0,

            overflow:
              "visible",

            boxSizing:
              "border-box",

            background:
              "#fff",

            position:
              "relative",

            transition:
              "width 0.25s ease",

            margin:
              "0 auto",

            borderRadius:
              "12px",

            boxShadow:
              "0 0 0 1px rgba(0,0,0,0.05)"
          }}
        >

          {(!blocks ||
            blocks.length === 0) && (

            <Box
              sx={{

                height:
                  "400px",

                border:
                  "2px dashed #ccc",

                borderRadius:
                  4,

                display:
                  "flex",

                flexDirection:
                  "column",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                gap:
                  2,

                opacity:
                  0.6,

                backgroundColor:
                  isOver

                    ? "rgba(25, 118, 210, 0.05)"

                    : "white",

                borderColor:
                  isOver

                    ? "primary.main"

                    : "#ccc",

                transition:
                  "all 0.3s ease",

                "&:hover": {

                  borderColor:
                    "primary.main",

                  bgcolor:
                    "rgba(0,0,0,0.01)"
                }
              }}
            >

              <Typography
                variant="h6"
                color={
                  isOver

                    ? "primary.main"

                    : "text.secondary"
                }
              >

                {isOver

                  ? "Drop to add block"

                  : "Your canvas is empty"}

              </Typography>

              <Typography
                variant="body2"
                color="text.disabled"
              >

                Drag and drop
                components from
                the left sidebar

              </Typography>

            </Box>
          )}

          {blocks.map(
            (block: Block) => {


              const registryEntry =
                registry[
                  block.type
                ];

              const isUnknown =
                !registryEntry;

              if (isUnknown) {

                return (

                  <Box
                    key={block.id}

                    sx={{

                      p: 2,
                      my: 1,

                      border:
                        "2px dashed #f44336",

                      borderRadius:
                        2,

                      bgcolor:
                        "rgba(244, 67, 54, 0.05)",

                      display:
                        "flex",

                      justifyContent:
                        "space-between",

                      alignItems:
                        "center"
                    }}
                  >

                    <Box>

                      <Typography
                        variant="subtitle2"
                        color="error"
                        fontWeight="bold"
                      >

                        ⚠️ Unknown Component:
                        {" "}
                        "{block.type}"

                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >

                        Registry mismatch.
                        This block cannot
                        be rendered.

                      </Typography>

                    </Box>

                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() =>
                        onDelete(
                          block.id
                        )
                      }
                    >
                      Delete
                    </Button>

                  </Box>
                );
              }

              return (

                <EditorBlockRenderer
                  key={block.id}

                  block={block}

                  component={
                    registryEntry.component
                  }

                  device={device}

                  selectedId={
                    selectedId
                  }

                  activeId={
                    activeId
                  }

                  hoveredId={
                    hoveredId
                  }

                  hoverData={{

                    ...hoverData,

                    currentOverId:
                      hoverData?.overId,

                    currentDropPosition:
                      hoverData?.dropPosition,

                    isAllowed:
                      hoverData?.isAllowed
                  }}

                  errors={errors}

                  onUpdate={
                    onUpdate
                  }

                  onDelete={
                    onDelete
                  }

                  onDuplicate={
                    onDuplicate
                  }

                  onSelect={
                    onSelect
                  }

                  onTransform={(id) => {
                    onSelect(id);
                  }}
                />
              );
            }
          )}

          <VirtualOverlayLayer
            activeId={activeId}

            overId={
              hoverData?.overId ||
              null
            }

            dropPosition={
              hoverData?.dropPosition ||
              null
            }

            selectedId={
              selectedId
            }

            hoveredId={
              hoveredId
            }

            blocks={blocks}

            device={device}
          />

        </Box>
      )}

    </Box>
  );
};

// =====================================
// MAIN COMPONENT
// =====================================

export const EditorCanvas = (
  props: EditorCanvasProps
) => {

  return (

    <RuntimeProvider
      value={{
        mode: "editor",
        device:
          props.device,
        tokens:
          props.tokens
      }}
    >

      <EditorCanvasContent
        {...props}
      />

    </RuntimeProvider>
  );
};
