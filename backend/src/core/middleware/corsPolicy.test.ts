import type {
  Request
} from "express";

import type {
  CorsOptions
} from "cors";

import {
  describe,
  expect,
  it
} from "vitest";

import {
  createCorsOptionsDelegate,
  isPublicCorsPath,
  normalizeCorsOrigin,
  resolvePrivateCorsOrigins
} from "./corsPolicy";

const resolveOptions = async (
  path: string,
  environment: {
    NODE_ENV?: string;
    FRONTEND_URL?: string;
    CORS_ALLOWED_ORIGINS?: string;
  }
): Promise<CorsOptions> =>
  new Promise(
    (resolve, reject) => {
      const delegate =
        createCorsOptionsDelegate(
          environment
        );

      delegate(
        {
          originalUrl: path,
          path,
          method: "GET",
          headers: {}
        } as Request,
        (
          error,
          options
        ) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(options || {});
        }
      );
    }
  );

const resolveOriginDecision = async (
  options: CorsOptions,
  origin?: string
): Promise<boolean | string | RegExp | undefined> => {
  if (
    typeof options.origin !== "function"
  ) {
    return options.origin;
  }

  return new Promise(
    (resolve, reject) => {
      options.origin!(
        origin,
        (
          error,
          decision
        ) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(decision);
        }
      );
    }
  );
};

describe(
  "CORS policy",
  () => {
    it(
      "normalizes origins and removes paths and trailing slashes",
      () => {
        expect(
          normalizeCorsOrigin(
            "HTTPS://Example.COM/path/"
          )
        ).toBe(
          "https://example.com"
        );
      }
    );

    it(
      "identifies all public runtime route groups",
      () => {
        expect(
          isPublicCorsPath(
            "/api/public/sites/10/forms/20/submit"
          )
        ).toBe(true);

        expect(
          isPublicCorsPath(
            "/p/public/pages/10/home"
          )
        ).toBe(true);

        expect(
          isPublicCorsPath(
            "/api/sites/10/pages/20/public"
          )
        ).toBe(true);

        expect(
          isPublicCorsPath(
            "/api/sites/10/pages"
          )
        ).toBe(false);
      }
    );

    it(
      "loads production origins from the environment",
      () => {
        const origins =
          resolvePrivateCorsOrigins({
            NODE_ENV: "production",
            FRONTEND_URL:
              "https://frontend.example.com/",
            CORS_ALLOWED_ORIGINS:
              "https://preview.example.com, https://admin.example.com/"
          });

        expect(
          origins
        ).toEqual(
          new Set([
            "https://frontend.example.com",
            "https://preview.example.com",
            "https://admin.example.com"
          ])
        );
      }
    );

    it(
      "adds local frontend origins outside production",
      () => {
        const origins =
          resolvePrivateCorsOrigins({
            NODE_ENV: "development"
          });

        expect(
          origins.has(
            "http://localhost:5173"
          )
        ).toBe(true);

        expect(
          origins.has(
            "http://127.0.0.1:5173"
          )
        ).toBe(true);
      }
    );

    it(
      "reflects any origin for public runtime APIs",
      async () => {
        const options =
          await resolveOptions(
            "/api/public/sites/10/visitor-auth/login",
            {
              NODE_ENV: "production",
              FRONTEND_URL:
                "https://frontend.example.com"
            }
          );

        expect(
          options.origin
        ).toBe(true);

        expect(
          options.credentials
        ).toBe(false);
      }
    );

    it(
      "allows configured origins and requests without Origin on private APIs",
      async () => {
        const options =
          await resolveOptions(
            "/api/sites/10/pages",
            {
              NODE_ENV: "production",
              FRONTEND_URL:
                "https://frontend.example.com"
            }
          );

        expect(
          await resolveOriginDecision(
            options,
            "https://frontend.example.com/"
          )
        ).toBe(true);

        expect(
          await resolveOriginDecision(
            options,
            undefined
          )
        ).toBe(true);
      }
    );

    it(
      "does not allow an unknown browser origin on private APIs",
      async () => {
        const options =
          await resolveOptions(
            "/api/admin/users",
            {
              NODE_ENV: "production",
              FRONTEND_URL:
                "https://frontend.example.com"
            }
          );

        expect(
          await resolveOriginDecision(
            options,
            "https://unknown.example.com"
          )
        ).toBe(false);
      }
    );
  }
);