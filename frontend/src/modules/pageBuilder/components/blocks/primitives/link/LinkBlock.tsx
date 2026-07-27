import {
  useResolvedStyle
} from "../../../../core/theme/useResolvedStyle";

import {
  useRuntime
} from "../../../../runtime/context/RuntimeProvider";

import {
  LinkPrimitive
} from "../../../primitives/LinkPrimitive";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

export const LinkBlock = ({
  data,
  device = "desktop"
}: any) => {

  // =====================================
  // RUNTIME
  // =====================================

  const context =
    useRuntime();

  // =====================================
  // PROPS
  // =====================================

  const props =
    data?.props || {};

  // =====================================
  // RESPONSIVE STYLE
  // =====================================

  const resolvedStyle =
    useResolvedStyle(
      data?.style,
      device as Device
    );

  const targetHref =
    props.href ||
    props.url ||
    props.link ||
    "#";

  const label =
    props.label ||
    props.text ||
    "Link";

  // =====================================
  // RENDER
  // =====================================
  return (
  <LinkPrimitive
    label={label}
    href={targetHref}
    disabledNavigation={
      context.mode === "editor"
    }
    style={{
      ...resolvedStyle,
      cursor:
        context.mode === "editor"
          ? "pointer"
          : resolvedStyle.cursor
    }}
  />
);
};
