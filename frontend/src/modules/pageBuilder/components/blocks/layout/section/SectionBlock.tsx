import React from "react";

import {
  SectionShell
} from "../../semantic/shared/SectionShell";

import {
  useRuntimeNode
} from "../../../../hooks/useRuntimeNode";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

interface SectionBlockProps {

  block?: any;

  children?: React.ReactNode;

  data: any;

  device?: Device;
}

export const SectionBlock = ({
  block,
  children,
  data,
  device = "desktop"
}: SectionBlockProps) => {

  // =====================================
  // RUNTIME NODE
  // =====================================

  const runtime =
    useRuntimeNode({

      block,

      type: "section",

      droppable: true
    });

  const {
    isOver,
    rootProps
  } = runtime;

  // =====================================
  // CHILDREN
  // =====================================

  const hasChildren =

    React.Children.count(
      children
    ) > 0;

  // =====================================
  // SEMANTIC ICONS
  // =====================================

  const semanticIcons = {

    HERO_SECTION:
      "🔥",

    VALUES_GRID:
      "💎",

    OFFICES_TABLE:
      "🏢",

    CTA_SECTION:
      "🚀",

    NAVBAR:
      "🧭"
  };

  // =====================================
  // CONFIDENCE
  // =====================================

  const confidence =

    block?.meta?.confidence;

  const sectionShellStyle = {
    ...(data?.style || {}),

    minHeight:
      "200px",

    transition:
      "all 0.15s ease-in-out"
  };

  console.log(
    "SECTION_RUNTIME",
    {
      id:
        block?.id,
      semanticType:
        block?.meta?.semanticType,
      rawDataStyle:
        data?.style,
      sectionShellStyle,
      childTypes:
        (block?.children || []).map(
          (child: any) => child.type
        )
    }
  );

  // =====================================
  // RENDER
  // =====================================

  return (

    <div
      {...rootProps}

      style={{
        width: "100%",
        position: "relative",
        pointerEvents: "auto",
        marginBottom: "24px"
      }}
    >

      {/* =====================================
          SEMANTIC OVERLAY
      ====================================== */}

      {
        block?.meta?.semanticType && (

          <div
            style={{
              position: "absolute",

              top: "12px",

              right: "12px",

              background:
                "rgba(17,24,39,0.92)",

              color:
                "#ffffff",

              padding:
                "6px 12px",

              borderRadius:
                "999px",

              fontSize:
                "11px",

              fontWeight:
                700,

              zIndex:
                9999,

              pointerEvents:
                "none",

              letterSpacing:
                "0.04em",

              textTransform:
                "uppercase",

              boxShadow:
                "0 4px 12px rgba(0,0,0,0.12)",

              backdropFilter:
                "blur(6px)",

              display:
                "flex",

              alignItems:
                "center",

              gap:
                "6px"
            }}
          >

            {/* =====================================
                ICON
            ====================================== */}

            <span>

              {
              semanticIcons[ block.meta.semanticType as keyof typeof semanticIcons]
              }

            </span>

            {/* =====================================
                TYPE
            ====================================== */}

            <span>

              {
                block.meta.semanticType
              }

            </span>

            {/* =====================================
                CONFIDENCE
            ====================================== */}

            {
              typeof confidence ===
                "number" && (

                <span
                  style={{
                    opacity: 0.72
                  }}
                >

                  · {

                    (
                      confidence * 100
                    ).toFixed(0)

                  }%

                </span>
              )
            }

          </div>
        )
      }

      {/* =====================================
          SECTION SHELL
      ====================================== */}

      <SectionShell
        style={sectionShellStyle}

        device={device}
      >

        {children}

        {/* =====================================
            EMPTY STATE
        ====================================== */}

        {!hasChildren && (

          <div
            style={{
              width: "100%",

              minHeight:
                "250px",

              border:
                isOver

                  ? "2px dashed #3b82f6"

                  : "1px dashed #d1d5db",

              borderRadius:
                "12px",

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              color:
                isOver

                  ? "#2563eb"

                  : "#6b7280",

              fontSize:
                "14px",

              background:
                isOver

                  ? "#eff6ff"

                  : "#fafafa"
            }}
          >

            Drop blocks here
            (Section)

          </div>
        )}

      </SectionShell>

    </div>
  );
};
