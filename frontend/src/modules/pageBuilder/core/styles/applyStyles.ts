import {
  mergeResponsiveStyles
} from "./mergeResponsiveStyles";

import {
  resolveTokens
} from "./resolveTokens";

import type {
  Device,
  ResponsiveStyle
} from "../../types/page.types";

export const applyStyles = (
  styles: ResponsiveStyle,
  device: Device,
  tokens: Record<string, any>
) => {

  const merged =
    mergeResponsiveStyles(
      styles,
      device
    );

  return resolveTokens(
    merged,
    tokens
  );
};