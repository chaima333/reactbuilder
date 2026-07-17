import type {
  Request
} from "express";

import type {
  OptionalSiteVisitorAuthRequest
} from "./siteVisitorAuth.middleware";

export type PublicPageAccessDecision =
  | {
      allowed: true;
    }
  | {
      allowed: false;
      statusCode: 401 | 403;
      code: string;
      message: string;
    };

export const getPublicPageAccessDecision =
  (
    req: Request,
    page: {
      visibility?: string | null;
    }
  ): PublicPageAccessDecision => {
    const visibility =
      page.visibility || "public";

    if (
      visibility !== "members_only"
    ) {
      return {
        allowed: true
      };
    }

    const authRequest =
      req as OptionalSiteVisitorAuthRequest;

    if (authRequest.siteVisitor) {
      return {
        allowed: true
      };
    }

    const authError =
      authRequest.siteVisitorAuthError;

    if (!authError) {
      return {
        allowed: false,
        statusCode: 401,
        code:
          "VISITOR_AUTH_REQUIRED",
        message:
          "Visitor authentication required"
      };
    }

    if (
      authError.code ===
        "VISITOR_SITE_MISMATCH" ||
      authError.code ===
        "VISITOR_NOT_ACTIVE"
    ) {
      return {
        allowed: false,
        statusCode: 403,
        code: authError.code,
        message: authError.message
      };
    }

    return {
      allowed: false,
      statusCode: 401,
      code: authError.code,
      message: authError.message
    };
  };
