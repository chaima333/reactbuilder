import crypto from "crypto";
import jwt, {
  SignOptions
} from "jsonwebtoken";

const visitorJwtSecret =
  process.env.SITE_VISITOR_JWT_SECRET;

if (!visitorJwtSecret) {
  throw new Error(
    "SITE_VISITOR_JWT_SECRET missing"
  );
}

const accessTokenExpiresIn =
  (
    process.env
      .SITE_VISITOR_ACCESS_TOKEN_EXPIRES_IN ||
    "15m"
  ) as SignOptions["expiresIn"];

const configuredRefreshDays =
  Number(
    process.env
      .SITE_VISITOR_REFRESH_TOKEN_DAYS ||
      7
  );

const refreshTokenDays =
  Number.isFinite(configuredRefreshDays) &&
  configuredRefreshDays > 0
    ? configuredRefreshDays
    : 7;

export type SiteVisitorAccessPayload = {
  sub: string;
  siteId: number;
  scope: "site_visitor";
  type: "access";
};

export const generateSiteVisitorAccessToken =
  (
    siteVisitorId: number,
    siteId: number
  ): string => {
    return jwt.sign(
      {
        sub: String(siteVisitorId),
        siteId,
        scope: "site_visitor",
        type: "access"
      },
      visitorJwtSecret,
      {
        expiresIn:
          accessTokenExpiresIn
      }
    );
  };

export const verifySiteVisitorAccessToken =
  (
    token: string
  ): SiteVisitorAccessPayload | null => {
    try {
      const decoded =
        jwt.verify(
          token,
          visitorJwtSecret
        );

      if (
        typeof decoded === "string"
      ) {
        return null;
      }

      const siteVisitorId =
        Number(decoded.sub);

      const siteId =
        Number(decoded.siteId);

      if (
        !Number.isInteger(
          siteVisitorId
        ) ||
        siteVisitorId <= 0 ||
        !Number.isInteger(siteId) ||
        siteId <= 0 ||
        decoded.scope !==
          "site_visitor" ||
        decoded.type !== "access"
      ) {
        return null;
      }

      return {
        sub:
          String(siteVisitorId),
        siteId,
        scope: "site_visitor",
        type: "access"
      };
    } catch {
      return null;
    }
  };

export const generateSiteVisitorRefreshToken =
  (): string => {
    return crypto
      .randomBytes(48)
      .toString("base64url");
  };

export const hashSiteVisitorRefreshToken =
  (
    refreshToken: string
  ): string => {
    return crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
  };

export const getRefreshTokenExpiry =
  (): Date => {
    return new Date(
      Date.now() +
        refreshTokenDays *
          24 *
          60 *
          60 *
          1000
    );
  };

export const getAccessTokenExpiryLabel =
  (): string => {
    return String(
      accessTokenExpiresIn
    );
  };
