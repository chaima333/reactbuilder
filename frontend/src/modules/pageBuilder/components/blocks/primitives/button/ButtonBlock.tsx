import {
  Box
} from "@mui/material";

import {
  useResolvedStyle
} from "../../../../core/theme/useResolvedStyle";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

export const ButtonBlock = ({
  data,
  device = "desktop"
}: any) => {

  // =====================================
  // PROPS
  // =====================================

  const props =
    data?.props || {};

  // =====================================
  // RESOLVED STYLE
  // =====================================

  const resolvedStyle =
    useResolvedStyle(
      data?.style,
      device as Device
    );

  console.log(
    "BUTTON_RENDER_REPORT",
    {
      label:
        data?.props?.label,
      text:
        data?.props?.text,
      href:
        data?.props?.href,
      url:
        data?.props?.url,
      link:
        data?.props?.link,
      propsKeys:
        Object.keys(
          data?.props || {}
        )
    }
  );

  const targetHref =
    props.href ||
    props.url ||
    props.link ||
    "";

  const label =
    props.label ||
    props.text ||
    "Button";

  const renderStyle = {
    ...resolvedStyle,

    cursor:
      resolvedStyle.cursor ||
      "pointer"
  };

  console.log(
    "BUTTON_RENDER_MODE",
    {
      label,
      targetHref,
      renderedAs:
        targetHref
          ? "a"
          : "button"
    }
  );

  // =====================================
  // RENDER
  // =====================================

  return (

    <Box>

      {targetHref
        ? (
            <a
              href={targetHref}
              style={{
                textDecoration:
                  "none",
                display:
                  "inline-block",
                ...renderStyle
              }}
            >
              {label}
            </a>
          )
        : (
            <button
              style={renderStyle}
            >
              {label}
            </button>
          )}

    </Box>
  );
};
