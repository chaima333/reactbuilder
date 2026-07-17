import type {
  Request,
  Response
} from "express";

import {
  loginSiteVisitorSchema,
  refreshSiteVisitorSchema,
  registerSiteVisitorSchema
} from "./siteVisitorAuth.validation";

import {
  loginSiteVisitor,
  logoutSiteVisitor,
  refreshSiteVisitorTokens,
  registerSiteVisitor,
  SiteVisitorAuthError
} from "./siteVisitorAuth.service";
import { SiteVisitorAuthRequest } from "./siteVisitorAuth.middleware";

const getSiteId = (
  req: Request
): number | null => {
  const siteId =
    Number(req.params.siteId);

  if (
    !Number.isInteger(siteId) ||
    siteId <= 0
  ) {
    return null;
  }

  return siteId;
};

const formatValidationErrors = (
  issues: Array<{
    path: PropertyKey[];
    message: string;
  }>
) => {
  return issues.map(
    (issue) => ({
      field:
        issue.path
          .map(String)
          .join("."),

      message:
        issue.message
    })
  );
};

const handleSiteVisitorAuthError = (
  error: unknown,
  res: Response,
  fallbackCode: string,
  fallbackMessage: string,
  siteId: number
) => {
  if (
    error instanceof
    SiteVisitorAuthError
  ) {
    return res
      .status(error.statusCode)
      .json({
        success: false,
        message: error.message,
        code: error.code
      });
  }

  console.error(
    fallbackCode,
    {
      siteId,
      error:
        error instanceof Error
          ? error.message
          : String(error)
    }
  );

  return res.status(500).json({
    success: false,
    message: fallbackMessage,
    code: fallbackCode
  });
};

export const registerSiteVisitorController =
  async (
    req: Request,
    res: Response
  ) => {
    const siteId =
      getSiteId(req);

    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: "Invalid siteId",
        code: "INVALID_SITE_ID"
      });
    }

    const parsed =
      registerSiteVisitorSchema
        .safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid registration data",
        code:
          "VALIDATION_ERROR",
        errors:
          formatValidationErrors(
            parsed.error.issues
          )
      });
    }

    try {
      const visitor =
        await registerSiteVisitor(
          siteId,
          parsed.data
        );

      return res.status(201).json({
        success: true,
        data: {
          visitor
        }
      });
    } catch (error) {
      return handleSiteVisitorAuthError(
        error,
        res,
        "VISITOR_REGISTRATION_FAILED",
        "Visitor registration failed",
        siteId
      );
    }
  };

export const loginSiteVisitorController =
  async (
    req: Request,
    res: Response
  ) => {
    const siteId =
      getSiteId(req);

    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: "Invalid siteId",
        code: "INVALID_SITE_ID"
      });
    }

    const parsed =
      loginSiteVisitorSchema
        .safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid login data",
        code:
          "VALIDATION_ERROR",
        errors:
          formatValidationErrors(
            parsed.error.issues
          )
      });
    }

    try {
      const data =
        await loginSiteVisitor(
          siteId,
          parsed.data,
          {
            ipAddress:
              req.ip || null,

            userAgent:
              req.get(
                "user-agent"
              ) || null
          }
        );

      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      return handleSiteVisitorAuthError(
        error,
        res,
        "VISITOR_LOGIN_FAILED",
        "Visitor login failed",
        siteId
      );
    }
  };
export const refreshSiteVisitorController =
  async (
    req: Request,
    res: Response
  ) => {
    const siteId =
      getSiteId(req);

    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: "Invalid siteId",
        code: "INVALID_SITE_ID"
      });
    }

    const parsed =
      refreshSiteVisitorSchema
        .safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid refresh token data",
        code:
          "VALIDATION_ERROR",
        errors:
          formatValidationErrors(
            parsed.error.issues
          )
      });
    }

    try {
      const data =
        await refreshSiteVisitorTokens(
          siteId,
          parsed.data,
          {
            ipAddress:
              req.ip || null,

            userAgent:
              req.get(
                "user-agent"
              ) || null
          }
        );

      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      return handleSiteVisitorAuthError(
        error,
        res,
        "VISITOR_REFRESH_FAILED",
        "Visitor token refresh failed",
        siteId
      );
    }
  };
  export const logoutSiteVisitorController =
  async (
    req: Request,
    res: Response
  ) => {
    const siteId =
      getSiteId(req);

    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: "Invalid siteId",
        code: "INVALID_SITE_ID"
      });
    }

    const parsed =
      refreshSiteVisitorSchema
        .safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid logout data",
        code:
          "VALIDATION_ERROR",
        errors:
          formatValidationErrors(
            parsed.error.issues
          )
      });
    }

    try {
      await logoutSiteVisitor(
        siteId,
        parsed.data.refreshToken
      );

      return res.status(200).json({
        success: true,
        message:
          "Logged out successfully"
      });
    } catch (error) {
      return handleSiteVisitorAuthError(
        error,
        res,
        "VISITOR_LOGOUT_FAILED",
        "Visitor logout failed",
        siteId
      );
    }
  };
  export const getCurrentSiteVisitorController =
  async (
    req: SiteVisitorAuthRequest,
    res: Response
  ) => {
    const visitor =
      req.siteVisitor;

    if (!visitor) {
      return res.status(401).json({
        success: false,
        message:
          "Visitor authentication required",
        code:
          "VISITOR_AUTH_REQUIRED"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        visitor: {
          id: visitor.id,
          siteId: visitor.siteId,
          fullName: visitor.fullName,
          email: visitor.email,
          status: visitor.status,
          emailVerifiedAt:
            visitor.emailVerifiedAt,
          lastLoginAt:
            visitor.lastLoginAt,
          createdAt:
            visitor.createdAt,
          updatedAt:
            visitor.updatedAt
        }
      }
    });
  };