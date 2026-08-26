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
  useRegisterVisitorMutation
} from "../../../../../../redux/services/visitorAuth.api";

import {
  useRuntime
} from "../../../../runtime/context/RuntimeProvider";

import {
  submitVisitorRegister
} from "../visitorAuth/actions";

import {
  buildVisitorAuthPath,
  getRedirectFromLocation,
  getSafeVisitorRedirectPath
} from "../visitorAuth/redirect";

import {
  VisitorAuthCard,
  VisitorAuthLink,
  VisitorAuthTextField
} from "../visitorAuth/VisitorAuthCard";

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

export const VisitorRegisterBlock = ({
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
    (sourceData.style || {}) as CSSProperties;

  const siteId =
    parseSiteId(runtime.siteId) ||
    parseSiteId(params.siteId);

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword
  ] =
    useState("");

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const registerVisitor = async () => {
  throw new Error("TEST_REGISTER_MUTATION_DISABLED");
};

const registerState = {
  isLoading: false
};

  const canSubmit =
    (runtime.mode === "public" ||
      runtime.mode === "export") &&
    Boolean(siteId);

  const redirect =
    getRedirectFromLocation(
      siteId,
      runtime.mode
    );

  const preferredLoginPath =
    siteId
      ? getSafeVisitorRedirectPath(
          props.loginPath,
          siteId,
          runtime.mode
        )
      : null;

  const loginHref =
    siteId
      ? preferredLoginPath ||
        buildVisitorAuthPath(
          siteId,
          "login",
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
    setMessage(null);

    try {
      const result =
        await submitVisitorRegister({
          mode: runtime.mode,
          siteId,
          fullName,
          email,
          password,
          confirmPassword,
          registerVisitor,
          redirect
        });

      if (
        !result.submitted &&
        result.reason ===
          "PASSWORD_CONFIRMATION_MISMATCH"
      ) {
        setError(
          "Passwords do not match."
        );
        return;
      }

      if (result.submitted) {
        setMessage(
          props.successMessage ||
            "Your account was created. You can now log in."
        );

        if (
          typeof window !==
          "undefined"
        ) {
          window.location.assign(
            result.redirect
          );
        }
      }
    } catch (caught: any) {
      setError(
        caught?.data?.message ||
          caught?.message ||
          "Registration failed."
      );
    }
  };

  return (
    <VisitorAuthCard
      title={
        props.title ||
        "Create account"
      }
      subtitle={
        props.subtitle
      }
      submitText={
        props.submitText ||
        "Create account"
      }
      disabled={!canSubmit}
      loading={
        registerState?.isLoading
      }
      message={message}
      error={error}
      onSubmit={handleSubmit}
      variant={
        props.layoutVariant ||
        "card"
      }
      style={resolvedStyle}
      footer={
        <VisitorAuthLink
          href={loginHref}
        >
          {props.loginLinkText ||
            "Already have an account?"}
        </VisitorAuthLink>
      }
    >
      <VisitorAuthTextField
        label={
          props.fullNameLabel ||
          "Full name"
        }
        placeholder={
          props.fullNamePlaceholder
        }
        value={fullName}
        onChange={setFullName}
        disabled={!canSubmit}
      />

      <VisitorAuthTextField
        label={
          props.emailLabel ||
          "Email"
        }
        placeholder={
          props.emailPlaceholder
        }
        type="email"
        value={email}
        onChange={setEmail}
        disabled={!canSubmit}
      />

      <VisitorAuthTextField
        label={
          props.passwordLabel ||
          "Password"
        }
        placeholder={
          props.passwordPlaceholder
        }
        type="password"
        value={password}
        onChange={setPassword}
        disabled={!canSubmit}
      />

      <VisitorAuthTextField
        label={
          props.confirmPasswordLabel ||
          "Confirm password"
        }
        placeholder={
          props.confirmPasswordPlaceholder
        }
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        disabled={!canSubmit}
      />
    </VisitorAuthCard>
  );
};