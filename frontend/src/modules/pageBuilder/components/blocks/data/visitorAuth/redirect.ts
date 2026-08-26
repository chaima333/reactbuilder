import type { RuntimeMode } from "../../../../runtime/context/RuntimeProvider";

const DUMMY_ORIGIN =
  "https://reactbuilder.local";

const decodeRepeatedly = (
  value: string
) => {
  let current =
    value;

  for (
    let index = 0;
    index < 5;
    index += 1
  ) {
    try {
      const decoded =
        decodeURIComponent(
          current
        );

      if (
        decoded === current
      ) {
        return decoded;
      }

      current =
        decoded;
    } catch {
      return current;
    }
  }

  return current;
};

const hasExternalShape = (
  value: string
) => {
  const trimmed =
    value.trim();

  return (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("\\") ||
    /^[a-z][a-z0-9+.-]*:/i.test(
      trimmed
    )
  );
};

const hasUnsafeDotSegments = (
  value: string
) => {
  const pathOnly =
    value
      .split("?")[0]
      .split("#")[0];

  const segments =
    pathOnly.split("/");

  return segments.some(
    (segment) =>
      segment === "." ||
      segment === ".."
  );
};

const isAllowedPathname = (
  pathname: string,
  siteId: string,
  mode: RuntimeMode
) => {
  if (
    mode === "export"
  ) {
    return (
      pathname.startsWith("/") &&
      !pathname.startsWith("//")
    );
  }

  const allowedRoots = [
    `/site/${siteId}`,
    `/p/${siteId}`
  ];

  return allowedRoots.some(
    (root) =>
      pathname === root ||
      pathname.startsWith(
        `${root}/`
      )
  );
};

export const getSafeVisitorRedirectPath = (
  value: unknown,
  currentSiteId:
    | number
    | string
    | null
    | undefined,
  mode: RuntimeMode = "public"
) => {
  const siteId =
    String(
      currentSiteId || ""
    ).trim();

  if (
    !/^\d+$/.test(siteId) ||
    Number(siteId) <= 0 ||
    typeof value !== "string"
  ) {
    return null;
  }

  const original =
    value.trim();

  if (!original) {
    return null;
  }

  const decoded =
    decodeRepeatedly(
      original
    ).trim();

  if (
    hasExternalShape(
      original
    ) ||
    hasExternalShape(
      decoded
    ) ||
    hasUnsafeDotSegments(
      decoded
    )
  ) {
    return null;
  }

  try {
    const parsed =
      new URL(
        decoded,
        DUMMY_ORIGIN
      );

    if (
      parsed.origin !==
      DUMMY_ORIGIN
    ) {
      return null;
    }

    if (
      !isAllowedPathname(
        parsed.pathname,
        siteId,
        mode
      )
    ) {
      return null;
    }

    return (
      parsed.pathname +
      parsed.search +
      parsed.hash
    );
  } catch {
    return null;
  }
};

export const getRedirectFromLocation = (
  currentSiteId:
    | number
    | string
    | null
    | undefined,
  mode: RuntimeMode = "public"
) => {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  const params =
    new URLSearchParams(
      window.location.search
    );

  return getSafeVisitorRedirectPath(
    params.get("redirect"),
    currentSiteId,
    mode
  );
};

export const buildVisitorAuthPath = (
  currentSiteId: number | string,
  target: "login" | "register",
  redirect: string | null,
  mode: RuntimeMode = "public"
) => {
  const siteId =
    String(
      currentSiteId
    ).trim();

  const base =
    mode === "export"
      ? `/${target}/`
      : `/site/${siteId}/${target}`;

  const safeRedirect =
    getSafeVisitorRedirectPath(
      redirect,
      siteId,
      mode
    );

  return safeRedirect
    ? `${base}?redirect=${encodeURIComponent(
        safeRedirect
      )}`
    : base;
};