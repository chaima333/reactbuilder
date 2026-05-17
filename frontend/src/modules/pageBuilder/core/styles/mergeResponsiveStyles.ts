import type {
  Device,
  ResponsiveStyle,
  StyleValue
} from "../../types/page.types";

export const mergeResponsiveStyles = (
  styles: ResponsiveStyle,
  device: Device
): StyleValue => {

 const desktop =
  styles?.desktop || {};

 const tablet =
  styles?.tablet || {};

const mobile =
  styles?.mobile || {};

  if (device === "desktop") {
    return desktop;
  }

  if (device === "tablet") {

    return {

      ...desktop,

      ...tablet
    };
  }

  return {

    ...desktop,

    ...tablet,

    ...mobile
  };
};