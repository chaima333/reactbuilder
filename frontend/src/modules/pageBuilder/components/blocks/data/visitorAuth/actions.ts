import type {
  RuntimeMode
} from "../../../../runtime/context/RuntimeProvider";

type MutationResult<T = unknown> =
  Promise<T> & {
    unwrap?: () => Promise<T>;
  };

type MutationFn<TInput> = (
  input: TInput
) => MutationResult;

const unwrapMutation = async (
  result: MutationResult
) => {
  if (typeof result.unwrap === "function") {
    return result.unwrap();
  }

  return result;
};

export const submitVisitorLogin = async ({
  mode,
  siteId,
  email,
  password,
  loginVisitor,
  redirect
}: {
  mode: RuntimeMode;
  siteId: number;
  email: string;
  password: string;
  loginVisitor: MutationFn<{
    siteId: number;
    email: string;
    password: string;
  }>;
  redirect?: string | null;
}) => {
  if (mode !== "public") {
    return {
      submitted: false as const,
      reason: "DISABLED_IN_NON_PUBLIC_MODE"
    };
  }

  await unwrapMutation(
    loginVisitor({
      siteId,
      email,
      password
    })
  );

  return {
    submitted: true as const,
    redirect: redirect || `/site/${siteId}`
  };
};

export const submitVisitorRegister = async ({
  mode,
  siteId,
  fullName,
  email,
  password,
  confirmPassword,
  registerVisitor,
  redirect
}: {
  mode: RuntimeMode;
  siteId: number;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  registerVisitor: MutationFn<{
    siteId: number;
    fullName: string;
    email: string;
    password: string;
  }>;
  redirect?: string | null;
}) => {
  if (mode !== "public") {
    return {
      submitted: false as const,
      reason: "DISABLED_IN_NON_PUBLIC_MODE"
    };
  }

  if (password !== confirmPassword) {
    return {
      submitted: false as const,
      reason: "PASSWORD_CONFIRMATION_MISMATCH"
    };
  }

  await unwrapMutation(
    registerVisitor({
      siteId,
      fullName,
      email,
      password
    })
  );

  return {
    submitted: true as const,
    redirect:
      `/site/${siteId}/login${
        redirect
          ? `?redirect=${encodeURIComponent(redirect)}`
          : ""
      }`
  };
};
