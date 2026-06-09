import type {
  Device,
  ResponsiveStyle,
  StyleValue
} from "../../types/page.types";

import {
  resolveResponsiveStyle
} from "./resolveResponsiveStyle";

export const mergeResponsiveStyles = (
  styles: ResponsiveStyle,
  device: Device
): StyleValue => {
  return resolveResponsiveStyle(
    styles,
    device
  );
};
