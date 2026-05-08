// src/modules/pageBuilder/core/theme/useResolvedStyle.ts
import { useTheme } from "./ThemeProvider"; // استعملنا useTheme اللي في التصويرة متاعك

import { resolveBlockStyles }
from "../../runtime/resolveStyles";

export const useResolvedStyle = (
  style: any,
  device:
    "desktop"
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