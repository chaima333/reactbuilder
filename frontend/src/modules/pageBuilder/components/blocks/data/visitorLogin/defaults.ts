import type {
  BlockConfig
} from "../../../../types/page.types";

export const visitorLoginDefaults = {
  props: {
    title: "Log in",
    subtitle: "Access your member content.",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    submitText: "Log in",
    registerLinkText: "Create an account",
    registerPromptText: "",
    dividerText: "",
    forgotPasswordText: "Forgot password?",
    invalidCredentialsMessage: "Invalid email or password.",
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
