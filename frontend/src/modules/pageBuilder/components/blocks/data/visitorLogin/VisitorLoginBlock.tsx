import {
  Box,
  Typography
} from "@mui/material";

import {
  useState
} from "react";

import {
  useParams
} from "react-router-dom";

import type {
  CSSProperties,
  FormEvent
} from "react";

import {
  useLoginVisitorMutation
} from "../../../../../../redux/services/visitorAuth.api";

import {
  useResolvedStyle
} from "../../../../core/theme/useResolvedStyle";

import {
  useRuntime
} from "../../../../runtime/context/RuntimeProvider";

import {
  submitVisitorLogin
} from "../visitorAuth/actions";

import {
  buildVisitorAuthPath,
  getRedirectFromLocation
} from "../visitorAuth/redirect";

import {
  VisitorAuthCard,
  VisitorAuthLink,
  VisitorAuthTextField
} from "../visitorAuth/VisitorAuthCard";

import type {
  Device
} from "../../../../types/page.types";

const parseSiteId = (
  value: unknown
) => {
  const parsed =
    Number(value);

  return Number.isFinite(parsed) &&
    parsed > 0
    ? parsed
    : null;
};

export const VisitorLoginBlock = ({
  block,
  data,
  device = "desktop"
}: any) => {
  const params =
    useParams();

  const runtime =
    useRuntime();

  const sourceData =
    block?.data ||
    data ||
    {};

  const props =
    sourceData.props || {};

  const resolvedStyle =
    useResolvedStyle(
      sourceData.style || {},
      device as Device
    ) as CSSProperties;

  const siteId =
    parseSiteId(runtime.siteId) ||
    parseSiteId(params.siteId);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [
    loginVisitor,
    loginState
  ] =
    useLoginVisitorMutation();

const canSubmit =
  (runtime.mode === "public" ||
    runtime.mode === "export") &&
  Boolean(siteId);

  const redirect =
    getRedirectFromLocation(siteId);

  const registerHref =
    siteId
      ? buildVisitorAuthPath(
          siteId,
          "register",
          redirect,
         runtime.mode
        )
      : "#";

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!siteId || !canSubmit) {
      return;
    }

    setError(null);

    try {
      const result =
        await submitVisitorLogin({
          mode: runtime.mode,
          siteId,
          email,
          password,
          loginVisitor,
          redirect
        });

      if (
        result.submitted &&
        typeof window !== "undefined"
      ) {
        window.location.assign(
          result.redirect
        );
      }
    } catch {
      setError(
        props.invalidCredentialsMessage ||
          "Invalid email or password."
      );
    }
  };

  return (
    <VisitorAuthCard
      title={props.title || "Log in"}
      subtitle={props.subtitle}
      submitText={props.submitText || "Log in"}
      disabled={!canSubmit}
      loading={loginState?.isLoading}
      error={error}
      onSubmit={handleSubmit}
      variant={props.layoutVariant || "card"}
      style={resolvedStyle}
      preSubmit={
        <Typography
          component="span"
          sx={{
            fontSize:
              "var(--visitor-auth-forgot-font-size, 14px)",
            color:
              "var(--visitor-auth-forgot-color, var(--visitor-auth-link-color, text.secondary))"
          }}
        >
          {props.forgotPasswordText ||
            "Forgot password?"}
        </Typography>
      }
      footer={
        <Box
          sx={{
            width: "100%",
            textAlign:
              "var(--visitor-auth-register-text-align, left)"
          }}
        >
          {props.dividerText && (
            <Typography
              component="div"
              sx={{
                display: "flex",
                alignItems: "center",
                gap:
                  "var(--visitor-auth-divider-gap, 14px)",
                my:
                  "var(--visitor-auth-divider-margin, 10px)",
                color:
                  "var(--visitor-auth-divider-color, var(--visitor-auth-subtitle-color, text.secondary))",
                fontSize:
                  "var(--visitor-auth-divider-font-size, 12px)",
                letterSpacing:
                  "var(--visitor-auth-divider-letter-spacing, 0.15em)",
                textTransform:
                  "var(--visitor-auth-divider-text-transform, uppercase)",
                "&::before, &::after": {
                  content: "\"\"",
                  flex: 1,
                  height: "1px",
                  background:
                    "var(--visitor-auth-divider-line-bg, rgba(0,0,0,0.12))"
                }
              }}
            >
              {props.dividerText}
            </Typography>
          )}

          {props.registerPromptText && (
            <Typography
              component="span"
              sx={{
                color:
                  "var(--visitor-auth-register-prompt-color, var(--visitor-auth-subtitle-color, text.secondary))",
                fontSize:
                  "var(--visitor-auth-register-font-size, 14px)",
                mr: 0.5
              }}
            >
              {props.registerPromptText}
            </Typography>
          )}

          <VisitorAuthLink href={registerHref}>
            {props.registerLinkText ||
              "Create an account"}
          </VisitorAuthLink>
        </Box>
      }
    >
      <VisitorAuthTextField
        label={props.emailLabel || "Email"}
        placeholder={props.emailPlaceholder}
        type="email"
        value={email}
        onChange={setEmail}
        disabled={!canSubmit}
      />

      <VisitorAuthTextField
        label={props.passwordLabel || "Password"}
        placeholder={props.passwordPlaceholder}
        type="password"
        value={password}
        onChange={setPassword}
        disabled={!canSubmit}
      />
    </VisitorAuthCard>
  );
};
