import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

export const resolveAuthHero = (
  node: StructuralNode
) => {

  const element =
    node.element;

  // =====================================
  // FORM
  // =====================================

  const form =

    element.querySelector(
      "form"
    );

  if (!form) {

    return null;
  }

  // =====================================
  // FORM TEXT
  // =====================================

  const text =

    form.innerText
      ?.toLowerCase() || "";

  // =====================================
  // INPUTS
  // =====================================

  const inputs =

    Array.from(
      form.querySelectorAll(
        "input"
      )
    );

  // =====================================
  // PASSWORD FIELD
  // =====================================

  const hasPasswordInput =

    inputs.some(input =>

      input.type ===
      "password"
    );

  // =====================================
  // EMAIL FIELD
  // =====================================

  const hasEmailInput =

    inputs.some(input =>

      input.type ===
      "email"
    );

  // =====================================
  // AUTH KEYWORDS
  // =====================================

  const authKeywords = [

    "password",
    "mot de passe",

    "connexion",
    "login",

    "sign in",
    "se connecter",

    "authentification"
  ];

  const keywordScore =

    authKeywords.filter(
      keyword =>

        text.includes(
          keyword
        )
    ).length;

  // =====================================
  // DETECTION SCORE
  // =====================================

  const score =

    Number(
      hasPasswordInput
    )

    +

    Number(
      hasEmailInput
    )

    +

    keywordScore;

  // =====================================
  // DETECT
  // =====================================

  if (
    score >= 3
  ) {

    console.log(
      "🔐 AUTH HERO DETECTED",
      {
        score,
        keywords:
          keywordScore
      }
    );

    return {

      type:
        "AUTH_HERO",

      claimedNode:
        node
    };
  }

  return null;
};