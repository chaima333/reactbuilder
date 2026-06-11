const normalizeCssValue = (
  value: unknown
) =>
  String(value || "")
    .replace(/\s+/g, "")
    .toLowerCase();

const isTransparentBackground = (
  value: unknown
) => {
  const normalized =
    normalizeCssValue(
      value
    );

  return (
    !normalized ||
    normalized === "transparent" ||
    normalized === "none" ||
    normalized === "initial" ||
    normalized === "inherit" ||
    normalized === "unset" ||
    normalized === "rgba(0,0,0,0)" ||
    normalized === "rgb(0,0,0,0)"
  );
};

const isNoneBackgroundImage = (
  value: unknown
) => {
  const normalized =
    normalizeCssValue(
      value
    );

  return (
    !normalized ||
    normalized === "none" ||
    normalized === "initial" ||
    normalized === "inherit" ||
    normalized === "unset"
  );
};

const isMeaningfulWidth = (
  value: unknown
) => {
  const normalized =
    normalizeCssValue(
      value
    );

  return (
    !!normalized &&
    normalized !== "auto" &&
    normalized !== "none" &&
    normalized !== "0px" &&
    normalized !== "initial" &&
    normalized !== "inherit" &&
    normalized !== "unset"
  );
};

const isMeaningfulSpacing = (
  value: unknown
) => {
  const normalized =
    normalizeCssValue(
      value
    );

  return (
    !!normalized &&
    normalized !== "0px" &&
    normalized !== "0" &&
    normalized !== "0px0px" &&
    normalized !== "0px0px0px0px" &&
    normalized !== "initial" &&
    normalized !== "inherit" &&
    normalized !== "unset"
  );
};

const getView = (
  element: HTMLElement
) =>
  element.ownerDocument.defaultView ||
  window;

const describeElement = (
  element?: HTMLElement | null
) =>
  element
    ? {
        tag:
          element.tagName,
        id:
          element.id || "",
        className:
          element.getAttribute(
            "class"
          ) || ""
      }
    : null;

const isStopElement = (
  element: HTMLElement
) => {
  const className =
    element.getAttribute(
      "class"
    ) || "";

  return (
    element.tagName === "BODY" ||
    className.includes(
      "__html_import_sandbox"
    )
  );
};

const walkAncestors = (
  element: HTMLElement,
  visit: (
    ancestor: HTMLElement,
    computed: CSSStyleDeclaration
  ) => any
) => {
  let current =
    element.parentElement;

  while (current) {
    const computed =
      getView(
        current
      ).getComputedStyle(
        current
      );

    const result =
      visit(
        current,
        computed
      );

    if (result) {
      return result;
    }

    if (
      isStopElement(
        current
      )
    ) {
      break;
    }

    current =
      current.parentElement;
  }

  return null;
};

export const resolveInheritedBackground = (
  element?: HTMLElement | null
) => {
  if (!element) {
    return null;
  }

  return walkAncestors(
    element,
    (
      ancestor,
      computed
    ) => {
      const backgroundImage =
        computed.backgroundImage;

      const backgroundColor =
        computed.backgroundColor;

      if (
        !isNoneBackgroundImage(
          backgroundImage
        )
      ) {
        return {
          background:
            computed.background,
          backgroundColor,
          backgroundImage,
          sourceElement:
            describeElement(
              ancestor
            )
        };
      }

      if (
        !isTransparentBackground(
          backgroundColor
        )
      ) {
        return {
          background:
            computed.background,
          backgroundColor,
          backgroundImage:
            "",
          sourceElement:
            describeElement(
              ancestor
            )
        };
      }

      return null;
    }
  );
};

export const resolveInheritedContainerWidth = (
  element?: HTMLElement | null
) => {
  if (!element) {
    return null;
  }

  return walkAncestors(
    element,
    (
      ancestor,
      computed
    ) => {
      if (
        isMeaningfulWidth(
          computed.maxWidth
        ) ||
        isMeaningfulWidth(
          computed.width
        )
      ) {
        return {
          width:
            computed.width,
          maxWidth:
            computed.maxWidth,
          sourceElement:
            describeElement(
              ancestor
            )
        };
      }

      return null;
    }
  );
};

export const resolveInheritedSectionSpacing = (
  element?: HTMLElement | null
) => {
  if (!element) {
    return null;
  }

  return walkAncestors(
    element,
    (
      ancestor,
      computed
    ) => {
      const spacing = {
        padding:
          computed.padding,
        paddingTop:
          computed.paddingTop,
        paddingBottom:
          computed.paddingBottom,
        paddingLeft:
          computed.paddingLeft,
        paddingRight:
          computed.paddingRight,
        margin:
          computed.margin,
        marginTop:
          computed.marginTop,
        marginBottom:
          computed.marginBottom
      };

      if (
        [
          spacing.padding,
          spacing.paddingTop,
          spacing.paddingBottom,
          spacing.marginTop,
          spacing.marginBottom
        ].some(
          isMeaningfulSpacing
        )
      ) {
        return {
          ...spacing,
          sourceElement:
            describeElement(
              ancestor
            )
        };
      }

      return null;
    }
  );
};

export const getLocalVisualContext = (
  element?: HTMLElement | null
) => {
  if (!element) {
    return null;
  }

  const computed =
    getView(
      element
    ).getComputedStyle(
      element
    );

  return {
    background:
      computed.background,
    backgroundColor:
      computed.backgroundColor,
    backgroundImage:
      computed.backgroundImage,
    width:
      computed.width,
    maxWidth:
      computed.maxWidth,
    spacing: {
      padding:
        computed.padding,
      paddingTop:
        computed.paddingTop,
      paddingBottom:
        computed.paddingBottom,
      paddingLeft:
        computed.paddingLeft,
      paddingRight:
        computed.paddingRight,
      margin:
        computed.margin,
      marginTop:
        computed.marginTop,
      marginBottom:
        computed.marginBottom
    },
    sourceElement:
      describeElement(
        element
      )
  };
};

