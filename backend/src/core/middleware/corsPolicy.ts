import type {
  Request
} from "express";

import type {
  CorsOptions,
  CorsOptionsDelegate
} from "cors";

type CorsEnvironment = {
  NODE_ENV?: string;
  FRONTEND_URL?: string;
  CORS_ALLOWED_ORIGINS?: string;
};

const localDevelopmentOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

export const normalizeCorsOrigin = (
  value: unknown
): string => {
  const raw =
    String(value || "")
      .trim();

  if (!raw) {
    return "";
  }

  try {
    const url =
      new URL(raw);

    return (
      `${url.protocol}//${url.host}`
        .toLowerCase()
    );
  } catch {
    return raw
      .replace(/\/+$/, "")
      .toLowerCase();
  }
};

const parseOriginList = (
  value: unknown
): string[] =>
  String(value || "")
    .split(",")
    .map(normalizeCorsOrigin)
    .filter(Boolean);

export const resolvePrivateCorsOrigins = (
  environment:
    CorsEnvironment = process.env
): Set<string> => {
  const origins =
    new Set<string>();

  for (
    const origin of parseOriginList(
      environment.FRONTEND_URL
    )
  ) {
    origins.add(origin);
  }

  for (
    const origin of parseOriginList(
      environment.CORS_ALLOWED_ORIGINS
    )
  ) {
    origins.add(origin);
  }

  if (
    environment.NODE_ENV !== "production"
  ) {
    for (
      const origin of localDevelopmentOrigins
    ) {
      origins.add(
        normalizeCorsOrigin(origin)
      );
    }
  }

  return origins;
};

export const isPublicCorsPath = (
  value: unknown
): boolean => {
  const pathname =
    String(value || "")
      .split("?")[0];

  if (
    pathname === "/api/public" ||
    pathname.startsWith("/api/public/")
  ) {
    return true;
  }

  if (
    pathname === "/p" ||
    pathname.startsWith("/p/")
  ) {
    return true;
  }

  return (
    /^\/api\/sites\/[^/]+\/pages\/[^/]+\/public(?:\/|$)/
      .test(pathname)
  );
};

export const createCorsOptionsDelegate = (
  environment:
    CorsEnvironment = process.env
): CorsOptionsDelegate<Request> => {
  const privateOrigins =
    resolvePrivateCorsOrigins(
      environment
    );

  const privateOriginPolicy:
    CorsOptions["origin"] =
      (
        requestOrigin,
        callback
      ) => {
       if (
      !requestOrigin ||
      requestOrigin === "null"
      ) {
      callback(null, true);
      return;
      }
        const normalizedOrigin =
          normalizeCorsOrigin(
            requestOrigin
          );

       const isAllowedVercelPreview =
  /^https:\/\/reactbuilder-[a-z0-9-]+-chaima333s-projects\.vercel\.app$/i.test(
    normalizedOrigin
  );

callback(
  null,
  privateOrigins.has(normalizedOrigin) ||
    isAllowedVercelPreview
);
      };

  return (
    req,
    callback
  ) => {
    const requestPath =
      req.originalUrl ||
      req.path ||
      "";

    if (
      isPublicCorsPath(requestPath)
    ) {
      callback(null, {
        origin: true,
        credentials: false
      });

      return;
    }

    callback(null, {
      origin:
        privateOriginPolicy,

      credentials: false
    });
  };
};

export const corsOptionsDelegate =
  createCorsOptionsDelegate();