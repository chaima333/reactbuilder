import type {
  NextFunction,
  Request,
  Response
} from "express";

import {
  SiteVisitor
} from "../../models";

import {
  verifySiteVisitorAccessToken
} from "./siteVisitorAuth.tokens";

export type SiteVisitorAuthRequest =
  Request & {
    siteVisitor?: SiteVisitor;
  };

export const requireSiteVisitorAuth =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const siteId =
        Number(req.params.siteId);

      if (
        !Number.isInteger(siteId) ||
        siteId <= 0
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid siteId",
          code: "INVALID_SITE_ID"
        });

        return;
      }

      const authorization =
        req.header("Authorization");

      if (
        !authorization ||
        !authorization.startsWith(
          "Bearer "
        )
      ) {
        res.status(401).json({
          success: false,
          message:
            "Visitor authentication required",
          code:
            "VISITOR_AUTH_REQUIRED"
        });

        return;
      }

      const token =
        authorization
          .slice("Bearer ".length)
          .trim();

      if (!token) {
        res.status(401).json({
          success: false,
          message:
            "Visitor authentication required",
          code:
            "VISITOR_AUTH_REQUIRED"
        });

        return;
      }

      const payload =
        verifySiteVisitorAccessToken(
          token
        );

      if (!payload) {
        res.status(401).json({
          success: false,
          message:
            "Invalid or expired visitor access token",
          code:
            "INVALID_VISITOR_ACCESS_TOKEN"
        });

        return;
      }

      if (payload.siteId !== siteId) {
        res.status(403).json({
          success: false,
          message:
            "Visitor token does not belong to this site",
          code:
            "VISITOR_SITE_MISMATCH"
        });

        return;
      }

      const siteVisitorId =
        Number(payload.sub);

      const visitor =
        await SiteVisitor.findOne({
          where: {
            id: siteVisitorId,
            siteId
          }
        });

      if (!visitor) {
        res.status(401).json({
          success: false,
          message:
            "Visitor account not found",
          code:
            "VISITOR_NOT_FOUND"
        });

        return;
      }

      if (
        visitor.status !== "active"
      ) {
        res.status(403).json({
          success: false,
          message:
            "Visitor account is not active",
          code:
            "VISITOR_NOT_ACTIVE"
        });

        return;
      }

      (
        req as SiteVisitorAuthRequest
      ).siteVisitor =
        visitor;

      next();
    } catch (error) {
      console.error(
        "SITE_VISITOR_AUTH_MIDDLEWARE_ERROR",
        {
          error:
            error instanceof Error
              ? error.message
              : String(error)
        }
      );

      res.status(401).json({
        success: false,
        message:
          "Visitor authentication failed",
        code:
          "VISITOR_AUTH_FAILED"
      });
    }
  };
export type OptionalSiteVisitorAuthErrorCode =
  | "INVALID_VISITOR_ACCESS_TOKEN"
  | "VISITOR_SITE_MISMATCH"
  | "VISITOR_NOT_FOUND"
  | "VISITOR_NOT_ACTIVE";

export type OptionalSiteVisitorAuthRequest =
  SiteVisitorAuthRequest & {
    siteVisitorAuthError?: {
      code: OptionalSiteVisitorAuthErrorCode;
      message: string;
    };
  };

export const attachOptionalSiteVisitorAuth =
  async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authorization =
        req.header("Authorization");

      /*
       * عدم وجود token عادي للصفحات public.
       * الـcontroller يقرر لاحقًا حسب page.visibility.
       */
      if (!authorization) {
        next();
        return;
      }

      if (
        !authorization.startsWith(
          "Bearer "
        )
      ) {
        (
          req as OptionalSiteVisitorAuthRequest
        ).siteVisitorAuthError = {
          code:
            "INVALID_VISITOR_ACCESS_TOKEN",
          message:
            "Invalid visitor access token"
        };

        next();
        return;
      }

      const token =
        authorization
          .slice("Bearer ".length)
          .trim();

      const payload =
        token
          ? verifySiteVisitorAccessToken(
              token
            )
          : null;

      if (!payload) {
        (
          req as OptionalSiteVisitorAuthRequest
        ).siteVisitorAuthError = {
          code:
            "INVALID_VISITOR_ACCESS_TOKEN",
          message:
            "Invalid or expired visitor access token"
        };

        next();
        return;
      }

      const requestedSiteId =
        Number(req.params.siteId);

      if (
        !Number.isInteger(
          requestedSiteId
        ) ||
        requestedSiteId <= 0 ||
        payload.siteId !==
          requestedSiteId
      ) {
        (
          req as OptionalSiteVisitorAuthRequest
        ).siteVisitorAuthError = {
          code:
            "VISITOR_SITE_MISMATCH",
          message:
            "Visitor token does not belong to this site"
        };

        next();
        return;
      }

      const siteVisitorId =
        Number(payload.sub);

      const visitor =
        await SiteVisitor.findOne({
          where: {
            id: siteVisitorId,
            siteId:
              requestedSiteId
          }
        });

      if (!visitor) {
        (
          req as OptionalSiteVisitorAuthRequest
        ).siteVisitorAuthError = {
          code:
            "VISITOR_NOT_FOUND",
          message:
            "Visitor account not found"
        };

        next();
        return;
      }

      if (
        visitor.status !== "active"
      ) {
        (
          req as OptionalSiteVisitorAuthRequest
        ).siteVisitorAuthError = {
          code:
            "VISITOR_NOT_ACTIVE",
          message:
            "Visitor account is not active"
        };

        next();
        return;
      }

      (
        req as OptionalSiteVisitorAuthRequest
      ).siteVisitor =
        visitor;

      next();
    } catch (error) {
      console.error(
        "OPTIONAL_SITE_VISITOR_AUTH_ERROR",
        {
          error:
            error instanceof Error
              ? error.message
              : String(error)
        }
      );

      (
        req as OptionalSiteVisitorAuthRequest
      ).siteVisitorAuthError = {
        code:
          "INVALID_VISITOR_ACCESS_TOKEN",
        message:
          "Visitor authentication failed"
      };

      next();
    }
  };