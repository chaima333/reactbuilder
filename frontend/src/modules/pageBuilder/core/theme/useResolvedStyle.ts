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

 

  const tokenResolved =

    resolveRuntimeDesignTokens(
      resolved,
      runtime.tokens || {}
    );

  return tokenResolved;
};
