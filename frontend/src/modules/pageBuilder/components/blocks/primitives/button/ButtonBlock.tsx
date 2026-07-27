import {
  Box
} from "@mui/material";

import type {
  CSSProperties
} from "react";

import {
  useResolvedStyle
} from "../../../../core/theme/useResolvedStyle";

import {
  tokens
} from "../../../../core/theme/tokens";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

const resolveLegacyColor = (
  value: unknown
): unknown => {
  const legacyColors:
    Record<string, string> = {
      primary:
        tokens.colors.primary,

      surface:
        tokens.colors.surface,

      text:
        tokens.colors.text,

      muted:
        tokens.colors.muted,

      border:
        tokens.colors.border
    };

  if (
    typeof value === "string" &&
    legacyColors[value]
  ) {
    return legacyColors[value];
  }

  return value;
};

export const ButtonBlock = ({
  data,
  device = "desktop"
}: any) => {
  const props =
    data?.props || {};

  const rawStyle =
    useResolvedStyle(
      data?.style || {},
      device as Device
    ) as CSSProperties;

  const resolvedStyle:
    CSSProperties = {
      ...rawStyle,

      backgroundColor:
        resolveLegacyColor(
          rawStyle.backgroundColor
        ) as string | undefined,

      color:
        resolveLegacyColor(
          rawStyle.color
        ) as string | undefined,

      borderColor:
        resolveLegacyColor(
          rawStyle.borderColor
        ) as string | undefined
    };

  const targetHref =
    props.href ||
    props.url ||
    props.link ||
    "";

  const label =
    props.label ||
    props.text ||
    "Button";

  const variant =
    props.variant ||
    "contained";

  const hasExplicitPaint =
    Boolean(
      resolvedStyle.background ||
      resolvedStyle.backgroundColor ||
      resolvedStyle.border ||
      resolvedStyle.borderColor
    );

  const shouldUseTheme =
    props.useTheme === true ||
    (
      props.useTheme !== false &&
      !hasExplicitPaint
    );

  const variantStyle:
    CSSProperties =
      variant === "outlined"
        ? {
            backgroundColor:
              "transparent",

            color:
              tokens.colors.primary,

            border:
              `1px solid ${tokens.colors.primary}`,

            boxShadow:
              tokens.shadows.none
          }
        : {
            backgroundColor:
              tokens.colors.primary,

            color:
              tokens.colors.textColors.inverse,

            border:
              `1px solid ${tokens.colors.primary}`,

            boxShadow:
              tokens.shadows.primary
          };

const renderStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: tokens.spacing.sm,

  minHeight: "44px",

  paddingTop: "12px",
  paddingBottom: "12px",
  paddingLeft: "24px",
  paddingRight: "24px",

  borderRadius: tokens.radius.full,
  border: "1px solid transparent",

  fontFamily: tokens.fonts.sans,
  fontSize: "15px",
  fontWeight: 700,
  lineHeight: 1.2,

  textAlign: "center",
  textDecoration: "none",
  whiteSpace: "nowrap",
  cursor: "pointer",
  boxSizing: "border-box",
  transition: tokens.transitions.normal,

  ...resolvedStyle,

  ...(shouldUseTheme
    ? variantStyle
    : {})
};

  const interactionSx: any = {
    ...renderStyle,

    "&:hover": {
      transform:
        "translateY(-1px)",

      boxShadow:
        shouldUseTheme
          ? tokens.shadows.lg
          : resolvedStyle.boxShadow,

      backgroundColor:
        shouldUseTheme
          ? variant === "outlined"
            ? tokens.colors.primaryLight
            : tokens.colors.primaryHover
          : resolvedStyle.backgroundColor
    },

    "&:active": {
      transform:
        "translateY(0)",

      backgroundColor:
        shouldUseTheme &&
        variant !== "outlined"
          ? tokens.colors.primaryActive
          : undefined
    },

    "&:focus-visible": {
      outline:
        "none",

      boxShadow:
        tokens.shadows.outline
    }
  };

  if (targetHref) {
    return (
      <Box
        component="a"
        href={targetHref}
        sx={interactionSx}
      >
        {label}
      </Box>
    );
  }

  return (
    <Box
      component="button"
      type={
        props.buttonType ||
        "button"
      }
      sx={interactionSx}
    >
      {label}
    </Box>
  );
};