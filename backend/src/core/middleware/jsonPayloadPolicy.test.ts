import type {
  NextFunction,
  Request,
  RequestHandler,
  Response
} from "express";

import {
  describe,
  expect,
  it,
  vi
} from "vitest";

import {
  createJsonPayloadPolicy,
  handleJsonPayloadError,
  isJsonPayloadTooLargeError,
  JSON_PAYLOAD_LIMITS,
  resolveJsonPayloadProfile
} from "./jsonPayloadPolicy";

const makeResponse = () => {
  const response = {
    status: vi.fn(),
    json: vi.fn()
  };

  response.status.mockReturnValue(
    response
  );

  response.json.mockReturnValue(
    response
  );

  return response;
};

const makeParser =
  () =>
    vi.fn(
      (
        _req: Request,
        _res: Response,
        next: NextFunction
      ) => next()
    ) as RequestHandler;

describe(
  "JSON payload policy",
  () => {
    it(
      "defines route-specific limits",
      () => {
        expect(
          JSON_PAYLOAD_LIMITS
        ).toEqual({
          standard: "1mb",
          ai: "2mb",
          builder: "10mb",
          figma: "50mb"
        });
      }
    );

    it(
      "selects the Figma profile",
      () => {
        expect(
          resolveJsonPayloadProfile(
            "POST",
            "/api/figma-plugin/import/raw"
          )
        ).toBe("figma");
      }
    );

    it(
      "selects the AI profile",
      () => {
        expect(
          resolveJsonPayloadProfile(
            "POST",
            "/api/sites/42/ia/generate-page"
          )
        ).toBe("ai");

        expect(
          resolveJsonPayloadProfile(
            "POST",
            "/api/ai/assistant"
          )
        ).toBe("ai");
      }
    );

    it(
      "selects the Builder profile for page writes",
      () => {
        expect(
          resolveJsonPayloadProfile(
            "POST",
            "/api/sites/42/pages"
          )
        ).toBe("builder");

        expect(
          resolveJsonPayloadProfile(
            "PUT",
            "/api/sites/42/pages/99"
          )
        ).toBe("builder");
      }
    );

    it(
      "selects the Builder profile for site layout writes",
      () => {
        expect(
          resolveJsonPayloadProfile(
            "PUT",
            "/api/sites/42/global-layout"
          )
        ).toBe("builder");

        expect(
          resolveJsonPayloadProfile(
            "PUT",
            "/api/sites/42/theme"
          )
        ).toBe("builder");
      }
    );

    it(
      "uses the standard profile for ordinary APIs",
      () => {
        expect(
          resolveJsonPayloadProfile(
            "POST",
            "/api/auth/login"
          )
        ).toBe("standard");
      }
    );

    it(
      "ignores query strings and trailing slashes",
      () => {
        expect(
          resolveJsonPayloadProfile(
            "POST",
            "/api/figma-plugin/import/raw/?source=plugin"
          )
        ).toBe("figma");
      }
    );

    it(
      "dispatches to the selected parser",
      () => {
        const standard =
          makeParser();

        const ai =
          makeParser();

        const builder =
          makeParser();

        const figma =
          makeParser();

        const policy =
          createJsonPayloadPolicy({
            standard,
            ai,
            builder,
            figma
          });

        policy(
          {
            method: "POST",
            path:
              "/api/figma-plugin/import/raw"
          } as Request,
          {} as Response,
          vi.fn()
        );

        expect(
          figma
        ).toHaveBeenCalledOnce();

        expect(
          standard
        ).not.toHaveBeenCalled();

        expect(
          ai
        ).not.toHaveBeenCalled();

        expect(
          builder
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "detects oversized JSON parser errors",
      () => {
        expect(
          isJsonPayloadTooLargeError({
            type:
              "entity.too.large"
          })
        ).toBe(true);

        expect(
          isJsonPayloadTooLargeError(
            new Error("other")
          )
        ).toBe(false);
      }
    );

    it(
      "returns JSON 413 for oversized bodies",
      () => {
        const response =
          makeResponse();

        const next =
          vi.fn();

        handleJsonPayloadError(
          {
            type:
              "entity.too.large"
          },
          {} as Request,
          response as unknown as Response,
          next as NextFunction
        );

        expect(
          response.status
        ).toHaveBeenCalledWith(
          413
        );

        expect(
          response.json
        ).toHaveBeenCalledWith({
          success: false,
          message:
            "JSON request payload is too large",
          code:
            "JSON_PAYLOAD_TOO_LARGE"
        });

        expect(
          next
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "forwards unrelated errors",
      () => {
        const error =
          new Error(
            "Database unavailable"
          );

        const response =
          makeResponse();

        const next =
          vi.fn();

        handleJsonPayloadError(
          error,
          {} as Request,
          response as unknown as Response,
          next as NextFunction
        );

        expect(
          next
        ).toHaveBeenCalledWith(
          error
        );

        expect(
          response.status
        ).not.toHaveBeenCalled();
      }
    );
  }
);