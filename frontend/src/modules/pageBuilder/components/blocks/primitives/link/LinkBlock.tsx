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

  // =====================================
  // ACTION
  // =====================================

  const actionType =
    props.actionType ||
    "custom";

  const hasSiteId =
    context.siteId !== null &&
    context.siteId !== undefined &&
    String(context.siteId).trim() !== "";

  const partnerApplicationHref =
    actionType ===
      "partnerApplication" &&
    hasSiteId
      ? `/partner-apply/${encodeURIComponent(
          String(context.siteId)
        )}`
      : "";

  const targetHref =
    actionType ===
    "partnerApplication"
      ? partnerApplicationHref || "#"
      : (
          props.href ||
          props.url ||
          props.link ||
          "#"
        );

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