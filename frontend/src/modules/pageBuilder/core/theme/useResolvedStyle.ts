import type {
  Device,
  ResponsiveStyle,
  StyleObject
} from "../../types/page.types";

import {
  resolveResponsiveStyle
} from "../styles/resolveResponsiveStyle";

import {
  useRuntime
} from "../../runtime/context/RuntimeProvider";

import {
  resolveRuntimeDesignTokens
} from "../../runtime/design/resolveRuntimeDesignTokens";

export const useResolvedStyle = (
  style: ResponsiveStyle | StyleObject,
  device: Device,
  defaults: StyleObject = {}
) => {

  const runtime =
    useRuntime();

  // =====================================
  // RESOLVE
  // =====================================

  const resolved =

    resolveResponsiveStyle(

      style || {},

      device,

      defaults
    );

  console.log(
    "USE_RESOLVED_STYLE_TRACE",
    {
      device,
      rawStyle:
        style || {},
      defaults,
      runtimeTokens:
        runtime.tokens || {},
      responsiveResolved:
        resolved
    }
  );

    console.log(
  "🚨 BEFORE TOKENS",
  resolved
);

  const tokenResolved =

    resolveRuntimeDesignTokens(
      resolved,
      runtime.tokens || {}
    );

  console.log(
    "USE_RESOLVED_STYLE_AFTER_TOKENS",
    {
      device,
      responsiveResolved:
        resolved,
      tokenResolved
    }
  );
    console.log(
  "🚨 AFTER TOKENS",
  tokenResolved
);

  // =====================================
  // DEBUG
  // =====================================

  console.log(
    "🔥 RESOLVED STYLE OUTPUT",
    tokenResolved
  );

  // =====================================
  // RETURN
  // =====================================

  return tokenResolved;
};
