import {
  CSSProperties,
  useEffect,
  useRef
} from "react";

import {
  useResolvedStyle
} from "../../../../core/theme/useResolvedStyle";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

export const TitleBlock = ({
  data,
  device
}: any) => {
  const titleRef =
    useRef<HTMLHeadingElement | null>(
      null
    );


  const resolvedStyle =
    useResolvedStyle(
      data?.style,
      (
        device ||
        "desktop"
      ) as Device
    );

  const content =
    data?.props?.content ||
    "Title Text Content";

  const segments =
    Array.isArray(
      data?.props?.segments
    )
      ? data.props.segments
      : [];

  const hasSegments =
    segments.length > 0;

  const hasMargin =
    !!resolvedStyle.margin ||
    !!resolvedStyle.marginTop ||
    !!resolvedStyle.marginBottom ||
    !!resolvedStyle.marginLeft ||
    !!resolvedStyle.marginRight;

  const finalStyle: CSSProperties  = {
    ...resolvedStyle,

    width:
      resolvedStyle.width || "auto",

    maxWidth:
      resolvedStyle.maxWidth || "100%",
      display:
  resolvedStyle.display || "block",

    minWidth:
      0,

    margin:
      hasMargin
        ? resolvedStyle.margin
        : 0,

    marginTop:
      resolvedStyle.margin
        ? undefined
        : resolvedStyle.marginTop,

    marginBottom:
      resolvedStyle.margin
        ? undefined
        : resolvedStyle.marginBottom,

    marginLeft:
      resolvedStyle.margin
        ? undefined
        : resolvedStyle.marginLeft,

    marginRight:
      resolvedStyle.margin
        ? undefined
        : resolvedStyle.marginRight,

    overflowWrap:
      "break-word",

    wordBreak:
      "break-word",

    whiteSpace:
      "normal",

    boxSizing:
      "border-box"
  };

  console.log(
    "RUNTIME TITLE STYLE TRACE",
    {
      content,
      rawStyle:
        data?.style,
      resolvedStyle,
      finalStyle
    }
  );

  if (hasSegments) {
    console.log(
      "TITLE_SEGMENTS_RENDERED",
      {
        content,
        segments
      }
    );
  }

  if (
    String(
      content
    ).includes(
      "Prêt à passer"
    )
  ) {
    console.log(
      "CTA_TITLE_RUNTIME",
      {
        content,
        rawStyle:
          data?.style,
        resolvedStyle,
        finalStyle,
        resolvedWidth:
          resolvedStyle.width,
        resolvedMaxWidth:
          resolvedStyle.maxWidth,
        resolvedFontSize:
          resolvedStyle.fontSize,
        resolvedLineHeight:
          resolvedStyle.lineHeight,
        textAlign:
          resolvedStyle.textAlign
      }
    );
  }

  useEffect(
    () => {
      console.log(
        "TITLE_DOM_REPORT_EFFECT_START",
        content
      );

      console.log(
        "TITLE_DOM_REPORT_REF",
        !!titleRef.current
      );

      if (
        !String(
          content
        ).includes(
          "Prêt à passer"
        ) ||
        !titleRef.current
      ) {
        return;
      }

      const element =
        titleRef.current;

      const computed =
        window.getComputedStyle(
          element
        );

      console.log(
        "TITLE_DOM_REPORT",
        {
          content,
          tagName:
            element.tagName,
          clientWidth:
            element.clientWidth,
          scrollWidth:
            element.scrollWidth,
          computedWidth:
            computed.width,
          computedMaxWidth:
            computed.maxWidth,
          computedDisplay:
            computed.display,
          computedWhiteSpace:
            computed.whiteSpace,
          computedWordBreak:
            computed.wordBreak,
          computedOverflowWrap:
            computed.overflowWrap
        }
      );
    },
    [
      content,
      finalStyle
    ]
  );

  return (
    <h2
      ref={titleRef}
      style={finalStyle}
    >
      {hasSegments
        ? segments.map(
            (
              segment: any,
              index: number
            ) => (
              <span
                key={`${index}-${segment?.text || ""}`}
                style={
                  segment?.variant === "accent"
                    ? {
                        background:
                          "linear-gradient(90deg, #0A84FF, #F77F00)",
                        WebkitBackgroundClip:
                          "text",
                        backgroundClip:
                          "text",
                        WebkitTextFillColor:
                          "transparent"
                      }
                    : undefined
                }
              >
                {segment?.text || ""}
              </span>
            )
          )
        : content}
    </h2>
  );
};
