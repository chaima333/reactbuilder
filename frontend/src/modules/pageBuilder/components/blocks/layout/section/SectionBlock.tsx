import React from "react";

import type {
  CSSProperties
} from "react";

import {
  SectionShell
} from "../../semantic/shared/SectionShell";

import {
  useRuntimeNode
} from "../../../../hooks/useRuntimeNode";

import {
  useResolvedStyle
} from "../../../../core/theme/useResolvedStyle";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

type ResolvedStyleInput =
  NonNullable<
    Parameters<
      typeof useResolvedStyle
    >[0]
  >;

interface SectionBlockProps {
  block?: any;

  children?: React.ReactNode;

  data?: any;

  device?: Device;
}

export const SectionBlock = ({
  block,
  children,
  data,
  device = "desktop"
}: SectionBlockProps) => {
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

  const hasChildren =
    React.Children.count(
      children
    ) > 0;

  const semanticIcons = {
    HERO_SECTION: "✦",
    VALUES_GRID: "◆",
    OFFICES_TABLE: "▦",
    CTA_SECTION: "→",
    NAVBAR: "☰"
  };

  const confidence =
    block?.meta?.confidence;

  const blockData =
    data ||
    block?.data ||
    {};

  /*
   * Important:
   * useResolvedStyle fusionne desktop,
   * tablet et mobile correctement.
   *
   * Avant, SectionBlock sélectionnait
   * uniquement style[device], donc les
   * propriétés desktop pouvaient disparaître.
   */
  const styleInput:
    ResolvedStyleInput =
      blockData?.style ??
      ({} as ResolvedStyleInput);

  const resolvedStyle =
    useResolvedStyle(
      styleInput,
      device
    ) as CSSProperties;

  const sectionShellStyle:
    CSSProperties = {
      ...resolvedStyle,

      width: "100%",

      maxWidth:
        resolvedStyle.maxWidth ||
        "1200px",

      minWidth: 0,

      minHeight:
        resolvedStyle.minHeight,

      boxSizing:
        "border-box",

      transition:
        "all 0.15s ease-in-out"
    };

  return (
    <div
      {...rootProps}
      style={{
        width: "100%",
        position: "relative",
        pointerEvents: "auto",
        marginBottom: 0,
        boxSizing: "border-box"
      }}
    >
      {block?.meta?.semanticType && (
        <div
          style={{
            position: "absolute",

            top: "12px",
            right: "12px",

            display: "flex",
            alignItems: "center",
            gap: "6px",

            padding:
              "6px 12px",

            borderRadius:
              "999px",

            background:
              "rgba(17, 24, 39, 0.92)",

            color:
              "#ffffff",

            fontSize:
              "11px",

            fontWeight:
              700,

            letterSpacing:
              "0.04em",

            textTransform:
              "uppercase",

            boxShadow:
              "0 4px 12px rgba(0, 0, 0, 0.12)",

            backdropFilter:
              "blur(6px)",

            zIndex:
              9999,

            pointerEvents:
              "none"
          }}
        >
          <span>
            {
              semanticIcons[
                block.meta
                  .semanticType as keyof typeof semanticIcons
              ]
            }
          </span>

          <span>
            {block.meta.semanticType}
          </span>

          {typeof confidence ===
            "number" && (
            <span
              style={{
                opacity: 0.72
              }}
            >
              ·{" "}
              {(
                confidence * 100
              ).toFixed(0)}
              %
            </span>
          )}
        </div>
      )}

      <SectionShell
        style={
          sectionShellStyle
        }
        device={device}
      >
        {children}

        {!hasChildren && (
          <div
            style={{
              width: "100%",

              minHeight:
                "220px",

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              border:
                isOver
                  ? "2px dashed #3b82f6"
                  : "1px dashed #d1d5db",

              borderRadius:
                "16px",

              color:
                isOver
                  ? "#2563eb"
                  : "#6b7280",

              background:
                isOver
                  ? "#eff6ff"
                  : "#fafafa",

              fontSize:
                "14px",

              boxSizing:
                "border-box",

              transition:
                "all 0.15s ease-in-out"
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