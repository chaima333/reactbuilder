export type ImportedAuthFormKind =
  | "visitorLogin"
  | "visitorRegister";

export type ImportedAuthFormDetection =
  | {
      kind: ImportedAuthFormKind;
      confidence: "strong";
      reasons: string[];
    }
  | {
      kind: null;
      confidence: "weak" | "none";
      reasons: string[];
    };

const normalize = (
  value: string
) =>
  value
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const anyIncludes = (
  haystack: string,
  needles: string[]
) =>
  needles.some((needle) =>
    haystack.includes(needle)
  );

const getInputText = (
  input: HTMLInputElement
) =>
  normalize(
    [
      input.type,
      input.name,
      input.id,
      input.autocomplete,
      input.placeholder,
      input.getAttribute("aria-label") || ""
    ].join(" ")
  );

const getSubmitText = (
  form: HTMLFormElement
) =>
  normalize(
    Array.from(
      form.querySelectorAll(
        "button,input[type='submit']"
      )
    )
      .map((element) => {
        const input =
          element as HTMLInputElement;

        return (
          input.value ||
          element.textContent ||
          element.getAttribute("aria-label") ||
          ""
        );
      })
      .join(" ")
  );

const getComputedStyleSafe = (
  element: Element | null | undefined
) => {
  if (!element) {
    return null;
  }

  const view =
    element.ownerDocument?.defaultView;

  return view?.getComputedStyle
    ? view.getComputedStyle(element)
    : null;
};

const getImportedLoginStyleVars = (
  form: HTMLFormElement
) => {
  const formStyle =
    getComputedStyleSafe(form);
  const titleStyle =
    getComputedStyleSafe(
      form.querySelector("h1,h2,h3")
    );
  const subtitleStyle =
    getComputedStyleSafe(
      form.querySelector(".sub,p")
    );
  const labelStyle =
    getComputedStyleSafe(
      form.querySelector("label")
    );
  const inputStyle =
    getComputedStyleSafe(
      form.querySelector("input")
    );
 const buttonElement =
  form.querySelector(
    "button,input[type='submit']"
  ) as HTMLElement | null;

const buttonStyle =
  getComputedStyleSafe(
    buttonElement
  );
  const linkStyle =
    getComputedStyleSafe(
      form.querySelector("a")
    );

  const desktop:
    Record<string, string> = {
      width: "100%",
      maxWidth:
        formStyle?.maxWidth &&
        formStyle.maxWidth !== "none"
          ? formStyle.maxWidth
          : "460px"
    };
const formIdentity =
  normalize(
    [
      form.className || "",
      form.textContent || ""
    ].join(" ")
  );

const isImportedClientLoginBox =
  formIdentity.includes("login box") &&
  formIdentity.includes("espace client");

  const setIfPresent = (
    key: string,
    value?: string | null
  ) => {
    if (
      value &&
      value !== "normal" &&
      value !== "none" &&
      value !== "rgba(0, 0, 0, 0)"
    ) {
      desktop[key] = value;
    }
  };

  setIfPresent(
    "--visitor-auth-card-bg",
    formStyle?.backgroundColor
  );
  setIfPresent(
    "--visitor-auth-card-border",
    formStyle?.border
  );
  setIfPresent(
    "--visitor-auth-card-radius",
    formStyle?.borderRadius
  );
  setIfPresent(
    "--visitor-auth-card-padding",
    formStyle?.padding
  );
  setIfPresent(
    "--visitor-auth-title-color",
    titleStyle?.color ||
      formStyle?.color
  );
  setIfPresent(
    "--visitor-auth-title-font-size",
    titleStyle?.fontSize
  );
  setIfPresent(
    "--visitor-auth-title-font-weight",
    titleStyle?.fontWeight
  );
  setIfPresent(
    "--visitor-auth-subtitle-color",
    subtitleStyle?.color
  );
  setIfPresent(
    "--visitor-auth-label-color",
    labelStyle?.color
  );
  setIfPresent(
    "--visitor-auth-label-font-size",
    labelStyle?.fontSize
  );
  setIfPresent(
    "--visitor-auth-label-letter-spacing",
    labelStyle?.letterSpacing
  );
  setIfPresent(
    "--visitor-auth-label-text-transform",
    labelStyle?.textTransform
  );
  setIfPresent(
    "--visitor-auth-input-bg",
    inputStyle?.backgroundColor
  );
  setIfPresent(
    "--visitor-auth-input-color",
    inputStyle?.color
  );
  setIfPresent(
    "--visitor-auth-input-border",
    inputStyle?.border
  );
  setIfPresent(
    "--visitor-auth-input-radius",
    inputStyle?.borderRadius
  );
  setIfPresent(
    "--visitor-auth-input-padding",
    inputStyle?.padding
  );
  setIfPresent(
    "--visitor-auth-placeholder-color",
    inputStyle?.color
  );

const readComputedStyleValue = (
  style: CSSStyleDeclaration | null,
  camelKey: keyof CSSStyleDeclaration,
  cssKey: string
): string => {
  const directValue =
    style?.[camelKey];

  if (
    typeof directValue === "string" &&
    directValue.trim() &&
    directValue !== "none"
  ) {
    return directValue.trim();
  }

  const propertyValue =
    style?.getPropertyValue?.(
      cssKey
    );

  return propertyValue?.trim() || "";
};

const inlineButtonStyle =
  buttonElement?.getAttribute?.(
    "style"
  ) || "";

const inlineBackgroundMatch =
  inlineButtonStyle.match(
    /(?:^|;)\s*background(?:-image)?\s*:\s*([^;]+)/i
  );

const backgroundCandidates = [
  readComputedStyleValue(
    buttonStyle,
    "backgroundImage",
    "background-image"
  ),

  readComputedStyleValue(
    buttonStyle,
    "background",
    "background"
  ),

  buttonElement?.style?.backgroundImage ||
    "",

  buttonElement?.style?.background ||
    "",

  inlineBackgroundMatch?.[1]?.trim() ||
    "",

  readComputedStyleValue(
    buttonStyle,
    "backgroundColor",
    "background-color"
  )
].filter(
  value =>
    value &&
    value !== "normal" &&
    value !== "none" &&
    value !== "transparent" &&
    value !== "rgba(0, 0, 0, 0)"
);

const buttonBackground =
  backgroundCandidates.find(
    value =>
      /(?:linear|radial|conic)-gradient\(/i.test(
        value
      )
  ) ||
  backgroundCandidates[0];

setIfPresent(
  "--visitor-auth-button-bg",
  buttonBackground
);

if (
  isImportedClientLoginBox &&
  !desktop[
    "--visitor-auth-button-bg"
  ]
) {
  desktop[
    "--visitor-auth-button-bg"
  ] =
    "linear-gradient(135deg, #F77F00 0%, #E85D04 100%)";
}

setIfPresent(
  "--visitor-auth-button-color",
  buttonStyle?.color
);

if (
  isImportedClientLoginBox &&
  !desktop[
    "--visitor-auth-button-color"
  ]
) {
  desktop[
    "--visitor-auth-button-color"
  ] = "#0A0A0A";
}

  setIfPresent(
    "--visitor-auth-button-radius",
    buttonStyle?.borderRadius
  );
  setIfPresent(
    "--visitor-auth-button-font-size",
    buttonStyle?.fontSize
  );
  setIfPresent(
    "--visitor-auth-button-letter-spacing",
    buttonStyle?.letterSpacing
  );
  setIfPresent(
    "--visitor-auth-link-color",
    linkStyle?.color
  );

  return desktop;
};

const getElementText = (
  element: Element | null | undefined
) =>
  String(
    element?.textContent || ""
  )
    .replace(/\s+/g, " ")
    .trim();

const getRawSubmitText = (
  form: HTMLFormElement
) =>
  Array.from(
    form.querySelectorAll(
      "button,input[type='submit']"
    )
  )
    .map((element) => {
      const input =
        element as HTMLInputElement;

      return (
        input.value ||
        element.textContent ||
        element.getAttribute("aria-label") ||
        ""
      );
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

const getNearbyFieldText = (
  input: HTMLInputElement | null
) => {
  if (!input) {
    return "";
  }

  const id =
    input.getAttribute("id");

  if (id) {
    const escaped =
      typeof CSS !== "undefined" &&
      CSS.escape
        ? CSS.escape(id)
        : id.replace(/"/g, "\\\"");

    const explicit =
      input.ownerDocument.querySelector(
        `label[for="${escaped}"]`
      );

    const explicitText =
      getElementText(explicit);

    if (explicitText) {
      return explicitText;
    }
  }

  const parentLabel =
    input.closest("label");

  const parentText =
    getElementText(parentLabel);

  if (parentText) {
    return parentText;
  }

  return getElementText(
    input.previousElementSibling
  );
};

const getImportedLoginProps = (
  form: HTMLFormElement,
  submitText: string
) => {
  const title =
    getElementText(
      form.querySelector("h1,h2,h3")
    );

  const subtitle =
    getElementText(
      form.querySelector(".sub,p")
    );

  const emailInput =
    form.querySelector(
      "input[type='email'],input[name*='email' i],input[id*='email' i]"
    ) as HTMLInputElement | null;

  const passwordInput =
    form.querySelector(
      "input[type='password']"
    ) as HTMLInputElement | null;

  const emailLabel =
    getNearbyFieldText(emailInput);

  const passwordLabel =
    getNearbyFieldText(passwordInput);

  const rawSubmitText =
    getRawSubmitText(form);
const formIdentity =
  normalize(
    [
      form.className || "",
      form.textContent || ""
    ].join(" ")
  );

const dividerText =
  formIdentity.includes("login box") &&
  formIdentity.includes("espace client")
    ? "ou"
    : "";

  return {
    ...(title ? { title } : {}),
    ...(subtitle ? { subtitle } : {}),
    ...(dividerText ? { dividerText }: {}),
    ...(emailLabel
      ? { emailLabel }
      : {}),
    ...(emailInput?.placeholder
      ? {
          emailPlaceholder:
            emailInput.placeholder
        }
      : {}),
    ...(passwordLabel
      ? { passwordLabel }
      : {}),
    ...(passwordInput?.placeholder
      ? {
          passwordPlaceholder:
            passwordInput.placeholder
        }
      : {}),
    ...(rawSubmitText || submitText
      ? {
          submitText:
            rawSubmitText || submitText
        }
      : {})
  };
};

export const detectImportedAuthForm = ({
  form,
  pageTitle,
  slug,
  sourceFile
}: {
  form: HTMLFormElement;
  pageTitle?: string;
  slug?: string;
  sourceFile?: string;
}): ImportedAuthFormDetection => {
  const inputs =
    Array.from(
      form.querySelectorAll("input")
    ) as HTMLInputElement[];

  const inputText =
    inputs.map(getInputText).join(" ");

  const submitText =
    getSubmitText(form);

  const pageHints =
    normalize(
      [
        pageTitle || "",
        slug || "",
        sourceFile || "",
        typeof document !== "undefined"
          ? document.title
          : ""
      ].join(" ")
    );

  const fullText =
    normalize(
      [
        form.textContent || "",
        inputText,
        submitText,
        pageHints
      ].join(" ")
    );

  const hasPassword =
    inputs.some(
      (input) =>
        input.type === "password"
    );

  const hasEmailOrUsername =
    inputs.some((input) => {
      const text =
        getInputText(input);

      return input.type === "email" ||
        anyIncludes(text, [
          "email",
          "e mail",
          "username",
          "user name",
          "identifiant"
        ]);
    });

  const hasName =
    inputs.some((input) =>
      anyIncludes(getInputText(input), [
        "full name",
        "fullname",
        "name",
        "nom",
        "prenom",
        "prénom"
      ])
    );

  const hasConfirmPassword =
    inputs.some((input) =>
      anyIncludes(getInputText(input), [
        "confirm",
        "confirmation",
        "repeat"
      ])
    );

  const loginSubmit =
    anyIncludes(submitText, [
      "login",
      "log in",
      "sign in",
      "signin",
      "se connecter",
      "connexion"
    ]);

  const loginPageHint =
    anyIncludes(pageHints, [
      "login",
      "signin",
      "sign in",
      "sign-in",
      "connexion",
      "client portal",
      "customer portal",
      "espace client"
    ]);

  const registerSubmit =
    anyIncludes(submitText, [
      "signup",
      "sign up",
      "register",
      "create account",
      "inscription",
      "s inscrire"
    ]);

  const registerText =
    anyIncludes(fullText, [
      "signup",
      "sign up",
      "register",
      "create account",
      "inscription"
    ]);

  const reasons: string[] = [];

  if (hasPassword) reasons.push("password-input");
  if (hasEmailOrUsername) reasons.push("email-or-username-input");
  if (loginSubmit) reasons.push("login-submit-text");
  if (loginPageHint) reasons.push("login-page-hint");
  if (hasName) reasons.push("name-input");
  if (hasConfirmPassword) reasons.push("confirm-password-input");
  if (registerSubmit) reasons.push("register-submit-text");

  if (
    hasPassword &&
    hasEmailOrUsername &&
    (registerSubmit || (registerText && hasName))
  ) {
    return {
      kind: "visitorRegister",
      confidence: "strong",
      reasons
    };
  }

  if (
    hasPassword &&
    hasEmailOrUsername &&
    (loginSubmit || loginPageHint)
  ) {
    return {
      kind: "visitorLogin",
      confidence: "strong",
      reasons
    };
  }

  return {
    kind: null,
    confidence:
      hasPassword || hasEmailOrUsername
        ? "weak"
        : "none",
    reasons
  };
};

export const createVisitorAuthBlockFromForm = (
  form: HTMLFormElement,
  path: Array<string | number>,
  kind: ImportedAuthFormKind
) => {
  const submitText =
    getSubmitText(form);

  const title =
    normalize(form.textContent || "")
      .slice(0, 80) ||
    (kind === "visitorLogin"
      ? "Log in"
      : "Create account");

  return {
    id: `${kind}-${path.join("-")}`,
    type: kind,
    meta: {
      importSource: "html",
      semanticType:
        kind === "visitorLogin"
          ? "VISITOR_LOGIN_FORM"
          : "VISITOR_REGISTER_FORM"
    },
    data: {
      props: {
        title:
          kind === "visitorLogin"
            ? "Log in"
            : "Create account",
        subtitle: title,
        ...(kind === "visitorLogin"
          ? getImportedLoginProps(
              form,
              submitText
            )
          : {}),
        submitText:
          submitText ||
          (kind === "visitorLogin"
            ? "Log in"
            : "Create account")
      },
      style: {
        desktop: {
          ...getImportedLoginStyleVars(
            form
          )
        },
        tablet: {},
        mobile: {}
      }
    },
    children: []
  };
};
