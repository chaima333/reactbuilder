import type {
  BlockConfig
} from "../../../../types/page.types";

export const visitorRegisterDefaults = {
  props: {
    title: "Create account",
    subtitle: "Register to access member content.",
    fullNameLabel: "Full name",
    fullNamePlaceholder: "Your name",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Create a password",
    confirmPasswordLabel: "Confirm password",
    confirmPasswordPlaceholder: "Repeat your password",
    submitText: "Create account",
    loginLinkText: "Already have an account?",
    successMessage: "Your account was created. You can now log in.",
    layoutVariant: "card"
  },
  style: {
    desktop: {
      width: "100%",
      maxWidth: "460px"
    },
    tablet: {
      maxWidth: "460px"
    },
    mobile: {
      maxWidth: "100%"
    }
  }
} satisfies BlockConfig["defaultData"];
