import {
  Box,
  Stack,
  Typography,
} from "@mui/material";

import { useTheme }
from "../../core/theme/ThemeProvider";

import {
  useResolvedStyle,
} from "../../core/theme/useResolvedStyle";

import {
  ResponsiveStyle,
  TextAlign,
} from "../../types/page.types";

import {
  ButtonPrimitive,
} from "../primitives/ButtonPrimitive";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

type HeroAction = {
  label: string;
  url: string;
};

type HeroBlockProps = {
  data: {
    props: {
      headline: string;
      subtext: string;

      primaryAction?: HeroAction;

      secondaryAction?: HeroAction;
    };

    style: ResponsiveStyle;
  };

  context?: {
    mode?:
      | "editor"
      | "preview"
      | "public";
  };

  device?: Device;
};

const alignmentMap:
Record<
  TextAlign,
  | "flex-start"
  | "center"
  | "flex-end"
> = {

  left:
    "flex-start",

  center:
    "center",

  right:
    "flex-end",
};

export const HeroBlock = ({
  data,
  context,
  device = "desktop",
}: HeroBlockProps) => {

  console.log(
    "📍 HeroBlock Rendered | Device Context:",
    device
  );

  const isEditor =
    context?.mode ===
    "editor";
  

  const { tokens } =
  useTheme();


  const resolvedStyle =
    useResolvedStyle(
      data.style,
      device
    );

  const textAlign:
    TextAlign =

    resolvedStyle.textAlign ===
      "left"

      ||

    resolvedStyle.textAlign ===
      "right"

      ? resolvedStyle.textAlign

      : "center";

  return (

    <Box
      sx={{

        width: "100%",

        display: "flex",

        flexDirection:
          "column",

        justifyContent:
          "center",

        alignItems:
          alignmentMap[
            textAlign
          ],

        textAlign,

        minHeight:
          resolvedStyle
            .minHeight
          || "50vh",

        backgroundColor:
          resolvedStyle
            .backgroundColor
           || tokens.colors.background.default,
        pt:
          resolvedStyle
            .paddingTop
          || "96px",

        pb:
          resolvedStyle
            .paddingBottom
          || "96px",

        px:
          resolvedStyle
            .paddingX
          || "32px",

        gap:
          resolvedStyle
            .gap
          || "32px",

        overflow:
          "hidden",

        position:
          "relative",

        boxSizing:
          "border-box",

        pointerEvents:
          "auto",
      }}
    >

      {/* ===================== */}
      {/* HEADLINE */}
      {/* ===================== */}

      <Typography
        component="h1"

        sx={{

          maxWidth:
            resolvedStyle
              .headlineMaxWidth
            || "900px",

          fontSize:
            resolvedStyle
              .headlineSize
            || "72px",

          fontWeight:
            resolvedStyle
              .headlineWeight
            || 800,

          lineHeight:
            resolvedStyle
              .headlineLineHeight
            || 1.1,

          letterSpacing:
            resolvedStyle
              .headlineLetterSpacing
            || "-0.03em",

          color:
            resolvedStyle
              .headlineColor
            || tokens.colors.text.primary,

          wordBreak:
            "break-word",

          overflowWrap:
            "break-word",

          pointerEvents:
            isEditor
              ? "none"
              : "auto",
        }}
      >
        {
          data.props
            .headline
        }
      </Typography>

      {/* ===================== */}
      {/* SUBTEXT */}
      {/* ===================== */}

      <Typography
        sx={{

          maxWidth:
            resolvedStyle
              .subtextMaxWidth
            || "700px",

          fontSize:
            resolvedStyle
              .subtextSize
            || "24px",

          fontWeight:
            resolvedStyle
              .subtextWeight
            || 400,

          lineHeight:
            resolvedStyle
              .subtextLineHeight
            || 1.6,

          color:
            resolvedStyle
              .subtextColor
            || tokens.colors.text.muted,

          opacity:
            resolvedStyle
              .subtextOpacity
            || 0.9,

          wordBreak:
            "break-word",

          overflowWrap:
            "break-word",

          pointerEvents:
            isEditor
              ? "none"
              : "auto",
        }}
      >
        {
          data.props
            .subtext
        }
      </Typography>

      {/* ===================== */}
      {/* ACTIONS */}
      {/* ===================== */}

      <Stack
        direction="row"

        spacing={
          resolvedStyle
            .buttonGap
          || 2
        }

        justifyContent={
          alignmentMap[
            textAlign
          ]
        }

        flexWrap="wrap"

        sx={{

          position:
            "relative",

          zIndex: 2,

          width: "100%",
        }}
      >

        {data.props
          .primaryAction && (

          <ButtonPrimitive
            label={
              data.props
                .primaryAction
                .label
            }

            href={
              data.props
                .primaryAction
                .url
            }

            disabled={
              isEditor
            }
          />
        )}

        {data.props
          .secondaryAction && (

          <ButtonPrimitive
            label={
              data.props
                .secondaryAction
                .label
            }

            href={
              data.props
                .secondaryAction
                .url
            }

            disabled={
              isEditor
            }
          />
        )}
      </Stack>
    </Box>
  );
};