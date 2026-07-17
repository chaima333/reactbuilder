import bcrypt from "bcrypt";

import {
  UniqueConstraintError
} from "sequelize";

import {
  sequelize
} from "../../core/database/connection";

import {
  Site,
  SiteVisitor,
  SiteVisitorSession
} from "../../models";

import type {
  LoginSiteVisitorInput,
  RefreshSiteVisitorInput,
  RegisterSiteVisitorInput
} from "./siteVisitorAuth.validation";

import {
  generateSiteVisitorAccessToken,
  generateSiteVisitorRefreshToken,
  getRefreshTokenExpiry,
  hashSiteVisitorRefreshToken
} from "./siteVisitorAuth.tokens";

export class SiteVisitorAuthError
  extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string
  ) {
    super(message);

    this.name =
      "SiteVisitorAuthError";
  }
}

export type SiteVisitorSessionMetadata = {
  ipAddress: string | null;
  userAgent: string | null;
};

const normalizeEmail = (
  email: string
): string => {
  return email
    .trim()
    .toLowerCase();
};

const toSafeVisitor = (
  visitor: SiteVisitor
) => {
  return {
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
  };
};

const assertActiveSite = async (
  siteId: number
): Promise<void> => {
  const site =
    await Site.findByPk(siteId);

  if (!site) {
    throw new SiteVisitorAuthError(
      "Site not found",
      404,
      "SITE_NOT_FOUND"
    );
  }

  if (site.status !== "active") {
    throw new SiteVisitorAuthError(
      "Site is not available",
      403,
      "SITE_NOT_ACTIVE"
    );
  }
};

export const registerSiteVisitor =
  async (
    siteId: number,
    input: RegisterSiteVisitorInput
  ) => {
    await assertActiveSite(siteId);

    const email =
      normalizeEmail(input.email);

    const existingVisitor =
      await SiteVisitor.findOne({
        where: {
          siteId,
          email
        }
      });

    if (existingVisitor) {
      throw new SiteVisitorAuthError(
        "An account already exists with this email",
        409,
        "VISITOR_EMAIL_EXISTS"
      );
    }

    const passwordHash =
      await bcrypt.hash(
        input.password,
        12
      );

    try {
      const visitor =
        await SiteVisitor.create({
          siteId,
          fullName:
            input.fullName.trim(),
          email,
          passwordHash,
          status: "active",
          emailVerifiedAt: null,
          lastLoginAt: null
        } as any);

      return toSafeVisitor(
        visitor
      );
    } catch (error) {
      if (
        error instanceof
        UniqueConstraintError
      ) {
        throw new SiteVisitorAuthError(
          "An account already exists with this email",
          409,
          "VISITOR_EMAIL_EXISTS"
        );
      }

      throw error;
    }
  };

export const loginSiteVisitor =
  async (
    siteId: number,
    input: LoginSiteVisitorInput,
    metadata: SiteVisitorSessionMetadata
  ) => {
    await assertActiveSite(siteId);

    const email =
      normalizeEmail(input.email);

    const visitor =
      await SiteVisitor.findOne({
        where: {
          siteId,
          email
        }
      });

    if (!visitor) {
      throw new SiteVisitorAuthError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS"
      );
    }

    const passwordIsValid =
      await bcrypt.compare(
        input.password,
        visitor.passwordHash
      );

    if (!passwordIsValid) {
      throw new SiteVisitorAuthError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS"
      );
    }

    if (visitor.status !== "active") {
      throw new SiteVisitorAuthError(
        "Visitor account is not active",
        403,
        "VISITOR_NOT_ACTIVE"
      );
    }

    const refreshToken =
      generateSiteVisitorRefreshToken();

    const tokenHash =
      hashSiteVisitorRefreshToken(
        refreshToken
      );

    const expiresAt =
      getRefreshTokenExpiry();

    const loginDate =
      new Date();

    await sequelize.transaction(
      async (transaction) => {
        await visitor.update(
          {
            lastLoginAt:
              loginDate
          },
          {
            transaction
          }
        );

        await SiteVisitorSession.create(
          {
            siteId,
            siteVisitorId:
              visitor.id,
            tokenHash,
            expiresAt,
            revokedAt: null,
            ipAddress:
              metadata.ipAddress,
            userAgent:
              metadata.userAgent
          } as any,
          {
            transaction
          }
        );
      }
    );

    const accessToken =
      generateSiteVisitorAccessToken(
        visitor.id,
        siteId
      );

    return {
      visitor:
        toSafeVisitor(visitor),

      accessToken,

      refreshToken,

      tokenType:
        "Bearer",

      accessTokenExpiresIn:
        process.env
          .SITE_VISITOR_ACCESS_TOKEN_EXPIRES_IN ||
        "15m"
    };
  };
export const refreshSiteVisitorTokens =
  async (
    siteId: number,
    input: RefreshSiteVisitorInput,
    metadata: SiteVisitorSessionMetadata
  ) => {
    await assertActiveSite(siteId);

    const oldTokenHash =
      hashSiteVisitorRefreshToken(
        input.refreshToken
      );

    return sequelize.transaction(
      async (transaction) => {
        const oldSession =
          await SiteVisitorSession.findOne({
            where: {
              siteId,
              tokenHash: oldTokenHash
            },
            transaction,
            lock: transaction.LOCK.UPDATE
          });

        if (
          !oldSession ||
          oldSession.revokedAt ||
          oldSession.expiresAt <= new Date()
        ) {
          throw new SiteVisitorAuthError(
            "Invalid or expired refresh token",
            401,
            "INVALID_REFRESH_TOKEN"
          );
        }

        const visitor =
          await SiteVisitor.findOne({
            where: {
              id: oldSession.siteVisitorId,
              siteId
            },
            transaction
          });

        if (
          !visitor ||
          visitor.status !== "active"
        ) {
          throw new SiteVisitorAuthError(
            "Visitor account is not active",
            403,
            "VISITOR_NOT_ACTIVE"
          );
        }

        await oldSession.update(
          {
            revokedAt: new Date()
          },
          {
            transaction
          }
        );

        const newRefreshToken =
          generateSiteVisitorRefreshToken();

        const newTokenHash =
          hashSiteVisitorRefreshToken(
            newRefreshToken
          );

        await SiteVisitorSession.create(
          {
            siteId,
            siteVisitorId: visitor.id,
            tokenHash: newTokenHash,
            expiresAt:
              getRefreshTokenExpiry(),
            revokedAt: null,
            ipAddress:
              metadata.ipAddress,
            userAgent:
              metadata.userAgent
          } as any,
          {
            transaction
          }
        );

        const accessToken =
          generateSiteVisitorAccessToken(
            visitor.id,
            siteId
          );

        return {
          accessToken,
          refreshToken:
            newRefreshToken,
          tokenType: "Bearer",
          accessTokenExpiresIn:
            process.env
              .SITE_VISITOR_ACCESS_TOKEN_EXPIRES_IN ||
            "15m"
        };
      }
    );
  };
  export const logoutSiteVisitor =
  async (
    siteId: number,
    refreshToken: string
  ): Promise<void> => {
    const tokenHash =
      hashSiteVisitorRefreshToken(
        refreshToken
      );

    const session =
      await SiteVisitorSession.findOne({
        where: {
          siteId,
          tokenHash
        }
      });
    if (
      !session ||
      session.revokedAt
    ) {
      return;
    }

    await session.update({
      revokedAt: new Date()
    });
  };