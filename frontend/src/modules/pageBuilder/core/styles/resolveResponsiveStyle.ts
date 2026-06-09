import type {
  Device,
  ResponsiveStyle,
  StyleObject
} from "../../types/page.types";

const BREAKPOINT_CHAIN:
Record<Device, Array<keyof ResponsiveStyle>> = {
  desktop: ["desktop"],
  tablet: ["desktop", "tablet"],
  mobile: ["desktop", "tablet", "mobile"]
};

const stripUndefined = (
  style: StyleObject = {}
): StyleObject => {
  return Object.fromEntries(
    Object.entries(style).filter(
      ([, value]) =>
        value !== undefined
    )
  ) as StyleObject;
};

const isResponsiveStyle = (
  style: ResponsiveStyle | StyleObject
) => {
  return !!(
    style &&
    (
      "desktop" in style ||
      "tablet" in style ||
      "mobile" in style
    )
  );
};

export const resolveResponsiveStyle = (
  style: ResponsiveStyle | StyleObject = {},
  device: Device,
  defaults: StyleObject = {}
): StyleObject => {
  if (!isResponsiveStyle(style)) {
    return {
      ...stripUndefined(defaults),
      ...stripUndefined(style as StyleObject)
    };
  }

  const responsiveStyle =
    style as ResponsiveStyle;

  return BREAKPOINT_CHAIN[device].reduce(
    (resolved, breakpoint) => ({
      ...resolved,
      ...stripUndefined(
        responsiveStyle[breakpoint]
      )
    }),
    stripUndefined(defaults)
  );
};

export const resolveResponsiveValue = <
  Key extends keyof StyleObject
>(
  style: ResponsiveStyle | StyleObject = {},
  device: Device,
  key: Key,
  defaults: StyleObject = {}
) => {
  return resolveResponsiveStyle(
    style,
    device,
    defaults
  )[key];
};

export const resolveBreakpointStyle =
  resolveResponsiveStyle;
