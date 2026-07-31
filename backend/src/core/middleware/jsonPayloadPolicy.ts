import express from "express";

import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response
} from "express";

export const JSON_PAYLOAD_LIMITS = {
  standard: "1mb",
  ai: "2mb",
  builder: "10mb",
  figma: "50mb"
} as const;

export type JsonPayloadProfile =
  keyof typeof JSON_PAYLOAD_LIMITS;

type JsonPayloadParsers =
  Record<
    JsonPayloadProfile,
    RequestHandler
  >;

const WRITE_METHODS =
  new Set([
    "POST",
    "PUT",
    "PATCH"
  ]);

const normalizePath = (
  value: string
) => {
  const pathWithoutQuery =
    String(value || "/")
      .split("?")[0]
      .replace(/\/+$/, "");

  return pathWithoutQuery || "/";
};

const isAiRequest = (
  path: string
) =>
  /^\/api\/sites\/[^/]+\/ia(?:\/|$)/
    .test(path) ||
  /^\/api\/ai\/assistant(?:\/|$)/
    .test(path);

const isBuilderPageWrite = (
  method: string,
  path: string
) =>
  WRITE_METHODS.has(method) &&
  /^\/api\/sites\/[^/]+\/pages(?:\/[^/]+)?$/
    .test(path);

const isBuilderSiteWrite = (
  method: string,
  path: string
) =>
  (
    method === "PUT" ||
    method === "PATCH"
  ) &&
  /^\/api\/sites\/[^/]+(?:\/(?:global-layout|theme))?$/
    .test(path);

export const resolveJsonPayloadProfile = (
  method: string,
  path: string
): JsonPayloadProfile => {
  const normalizedMethod =
    String(method || "GET")
      .toUpperCase();

  const normalizedPath =
    normalizePath(path);

  if (
    normalizedMethod === "POST" &&
    normalizedPath ===
      "/api/figma-plugin/import/raw"
  ) {
    return "figma";
  }

  if (isAiRequest(normalizedPath)) {
    return "ai";
  }

  if (
    isBuilderPageWrite(
      normalizedMethod,
      normalizedPath
    ) ||
    isBuilderSiteWrite(
      normalizedMethod,
      normalizedPath
    )
  ) {
    return "builder";
  }

  return "standard";
};

const defaultParsers:
  JsonPayloadParsers = {
    standard:
      express.json({
        limit:
          JSON_PAYLOAD_LIMITS.standard
      }),

    ai:
      express.json({
        limit:
          JSON_PAYLOAD_LIMITS.ai
      }),

    builder:
      express.json({
        limit:
          JSON_PAYLOAD_LIMITS.builder
      }),

    figma:
      express.json({
        limit:
          JSON_PAYLOAD_LIMITS.figma
      })
  };

export const createJsonPayloadPolicy = (
  parsers:
    JsonPayloadParsers =
      defaultParsers
): RequestHandler =>
  (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const profile =
      resolveJsonPayloadProfile(
        req.method,
        req.path ||
          req.originalUrl ||
          req.url ||
          "/"
      );

    return parsers[profile](
      req,
      res,
      next
    );
  };

export const jsonPayloadPolicy =
  createJsonPayloadPolicy();

type JsonParserError = {
  type?: unknown;
};

export const isJsonPayloadTooLargeError = (
  error: unknown
) =>
  Boolean(
    error &&
    typeof error === "object" &&
    (
      error as JsonParserError
    ).type ===
      "entity.too.large"
  );

export const handleJsonPayloadError:
  ErrorRequestHandler =
  (
    error,
    _req,
    res,
    next
  ) => {
    if (
      !isJsonPayloadTooLargeError(
        error
      )
    ) {
      next(error);
      return;
    }

    res.status(413).json({
      success: false,
      message:
        "JSON request payload is too large",
      code:
        "JSON_PAYLOAD_TOO_LARGE"
    });
  };