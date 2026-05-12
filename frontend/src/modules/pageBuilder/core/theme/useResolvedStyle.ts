// src/modules/pageBuilder/core/theme/useResolvedStyle.ts

import { useTheme }
from "./ThemeProvider";

import { resolveBlockStyles }
from "../../runtime/resolveStyles";

export const useResolvedStyle = (
  style: any,
  device:
    | "desktop"
    | "tablet"
    | "mobile"
) => {

  const { tokens } =
    useTheme();

  return resolveBlockStyles(
    style,
    device,
    tokens
  );
};