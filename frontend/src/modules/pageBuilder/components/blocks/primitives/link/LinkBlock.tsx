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
  // DEBUG
  // =====================================

  if (
    context.mode ===
    "editor"
  ) {

    console.log(
      "🔥 LINK BLOCK",
      props
    );
  }

  console.log(
    "LINK_RENDER_REPORT",
    {
      label:
        props.label,
      text:
        props.text,
      href:
        props.href,
      url:
        props.url,
      link:
        props.link,
      targetHref,
      renderedAs:
        "a"
    }
  );

  // =====================================
  // RENDER
  // =====================================

  return (

    <LinkPrimitive

      label={
        label
      }

      href={
        targetHref
      }

      style={{
        ...resolvedStyle,

        cursor:
          resolvedStyle.cursor
      }}
    />
  );
};
