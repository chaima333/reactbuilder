// src/modules/pageBuilder/core/theme/useResolvedStyle.ts

import { useTheme }
from "./ThemeProvider";

import {
  applyStyles
} from "../styles/applyStyles";

import type {
  ResponsiveStyle
} from "../../types/page.types";

// =========================
// Empty Safe Contract
// =========================

const EMPTY_STYLE:
ResponsiveStyle = {

  desktop: {},

  tablet: {},

  mobile: {}
};

// =========================
// Hook
// =========================

export const useResolvedStyle = (
  style:
    ResponsiveStyle | undefined,

  device:
    | "desktop"
    | "tablet"
    | "mobile"
) => {

  const { tokens } =
    useTheme();

  // 👑 Runtime Fault Tolerance
  const safeStyle = {

    ...EMPTY_STYLE,

    ...(style || {})
  };

  return applyStyles(
    safeStyle,
    device,
    tokens
  );
};