import { resolveToken }
from "../core/theme/themeResolver";

export const resolveBlockStyles = (
  styleData: any,
  device: "desktop" | "tablet" | "mobile" = "desktop",
  tokens: any = {}
) => {

  if (!styleData) return {};

  // ✅ canonical responsive contract
  const desktop = styleData.desktop || {};
  const tablet = styleData.tablet || {};
  const mobile = styleData.mobile || {};

  let activeStyle = { ...desktop };

  // tablet overrides desktop
  if (device === "tablet") {
    activeStyle = {
      ...desktop,
      ...tablet,
    };
  }

  // mobile overrides tablet + desktop
  if (device === "mobile") {
    activeStyle = {
      ...desktop,
      ...tablet,
      ...mobile,
    };
  }

  const resolved: any = {};

  Object.keys(activeStyle).forEach((key) => {
    resolved[key] =
      resolveToken(activeStyle[key], tokens);
  });

  return resolved;
};