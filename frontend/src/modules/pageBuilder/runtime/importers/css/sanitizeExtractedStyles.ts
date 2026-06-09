// frontend/src/modules/pageBuilder/runtime/importers/html/css/sanitizeExtractedStyles.ts

import { normalizeSpacingStyles } from "./normalizeSpacingStyles";

const normalizePxValue = (
  value: string
) => {

  return value
    .split(" ")
    .map(part => {

      if (
        !part.includes("px")
      ) {

        return part;
      }

      const parsed =
        parseFloat(part);

      if (
        isNaN(parsed)
      ) {

        return part;
      }

      return `${Math.round(parsed)}px`;
    })
    .join(" ");
};

export function sanitizeExtractedStyles(
  styles: Record<string, string>
): Record<string, string> {

  const sanitized:
    Record<string, string> = {};

  // =====================================
  // STYLE KEYS TO PRESERVE
  // =====================================

  const preserveKeys = [

    // DISPLAY

    "display",

    // FLEX

    "flex",
    "flexBasis",
    "flexGrow",
    "flexShrink",
    "flexDirection",
    "justifyContent",
    "alignItems",
    "flexWrap",

    // GRID

    "gridTemplateColumns",
    "gridTemplateRows",
    "gridAutoRows",
    "gridColumn",
    "gridRow",

    "gap",
    "rowGap",
    "columnGap",

    // SPACING

    "padding",
    "paddingTop",
    "paddingBottom",
    "paddingLeft",
    "paddingRight",

    "margin",
    "marginTop",
    "marginBottom",
    "marginLeft",
    "marginRight",

    // SIZE

    "width",
    "maxWidth",
    "minWidth",
    "height",
    "minHeight",
    "maxHeight",

    // TYPOGRAPHY

    "fontSize",
    "fontFamily",
    "fontWeight",
    "lineHeight",
    "letterSpacing",
    "textAlign",
    "textTransform",

    // VISUAL

    "background",
    "backgroundColor",
    "border",
    "borderRadius",
    "boxShadow",

    // POSITION

    "position",
    "top",
    "left",
    "right",
    "bottom"
  ];

  Object.keys(styles).forEach(
    (key) => {

      let value =
        styles[key];

      if (
        !value ||
        value === "none" ||
        value.includes(
          "rgba(0, 0, 0, 0)"
        )
      ) {

        return;
      }

      // =====================================
      // INVALID BACKGROUNDS
      // =====================================

      if (

        key === "backgroundColor" ||

        key === "background"

      ) {

        const normalized =

          value
            .replace(/\s/g, "")
            .toLowerCase();

        const invalidBackgrounds = [

          "transparent",

          "rgba(0,0,0,0)",

          "rgb(0,0,0)",

          "#000",

          "#000000",

          "initial",

          "inherit",

          "unset",

          "none"
        ];

        if (
          invalidBackgrounds.includes(
            normalized
          )
        ) {

          return;
        }
      }

      // =====================================
      // IGNORE NON PRESERVED KEYS
      // =====================================

      if (
        !preserveKeys.includes(
          key
        )
      ) {

        return;
      }

      // =====================================
      // PRESERVE ADVANCED CSS EXPRESSIONS
      // =====================================

      const shouldNormalizePx =

        value.includes("px")

        &&

        !value.includes(
          "minmax"
        )

        &&

        !value.includes(
          "repeat"
        )

        &&

        !value.includes(
          "clamp"
        )

        &&

        !value.includes(
          "calc"
        );

      // =====================================
      // PX NORMALIZATION
      // =====================================

      if (
        shouldNormalizePx
      ) {

        value =
          normalizePxValue(
            value
          );
      }

      // =====================================
      // TYPOGRAPHY NORMALIZATION
      // =====================================

      if (
        key === "fontSize"
      ) {

        const size =
          parseFloat(value);

        if (
          !isNaN(size)
        ) {

          if (size >= 60) {

            value = "72px";
          }

          else if (size >= 40) {

            value = "48px";
          }

          else if (size >= 28) {

            value = "32px";
          }

          else if (size < 13) {

            value = "14px";
          }
        }
      }

      // =====================================
      // WIDTH NORMALIZATION
      // =====================================

      if (
        key === "width"
      ) {

        const width =
          parseFloat(value);

        if (

          !isNaN(width)

          &&

          width > 1400
        ) {

          value = "100%";
        }
      }

      if (
        key === "maxWidth"
      ) {

        const maxWidth =
          parseFloat(value);

        if (

          !isNaN(maxWidth)

          &&

          maxWidth > 1400
        ) {

          value = "1200px";
        }
      }

      // =====================================
      // SAVE
      // =====================================

      sanitized[key] =
        value;
    }
  );

  console.log(
    "🧼 SANITIZED",
    sanitized
  );

  // =====================================
  // SHORTHAND COLLISION FIX
  // =====================================

  if (
    sanitized.padding
  ) {

    delete sanitized.paddingTop;
    delete sanitized.paddingBottom;
    delete sanitized.paddingLeft;
    delete sanitized.paddingRight;
  }

  if (
    sanitized.margin
  ) {

    delete sanitized.marginTop;
    delete sanitized.marginBottom;
    delete sanitized.marginLeft;
    delete sanitized.marginRight;
  }

  return normalizeSpacingStyles(
    sanitized
  );
}
