// backend/src/modules/sites/members/siteMembers.service.ts

import crypto from "crypto";

import SiteMember from "../../../models/SiteMember";
import User from "../../../models/User";
import SiteInvitation from "../../../models/SiteInvitation";

import {
  Site
} from "../../../models/site";

import {
  sendSiteInvitationEmail
} from "../../../core/services/email.service";

type MemberRole =
  | "ADMIN"
  | "EDITOR"
  | "VIEWER";

const OWNER_ALLOWED_ROLES: MemberRole[] = [
  "ADMIN",
  "EDITOR",
  "VIEWER"
];

const ADMIN_ALLOWED_ROLES: MemberRole[] = [
  "EDITOR",
  "VIEWER"
];

const normalizeRole = (
  role: any,
  allowedRoles: MemberRole[]
): MemberRole => {
  const nextRole =
    String(role || "VIEWER")
      .trim()
      .toUpperCase() as MemberRole;

  if (!allowedRoles.includes(nextRole)) {
    const error: any =
      new Error("Invalid member role");

    error.status = 400;

    throw error;
  }

  return nextRole;
};

const generateInvitationToken = () => {
  return crypto
    .randomBytes(32)
    .toString("hex");
};

const getInvitationExpirationDate = () => {
  const date =
    new Date();

  date.setDate(
    date.getDate() + 7
  );

  return date;
};

const getMemberWithUser = async (
  siteId: number,
  userId: number
) => {
  return SiteMember.findOne({
    where: {
      siteId,
      userId
    },
    include: [
      {
        model: User,
        attributes: [
          "id",
          "name",
          "email",
          "role",
          "avatar",
          "isApproved",
          "createdAt"
        ]
      }
    ]
  });
};

const getSiteName = async (
  siteId: number
) => {
  const site =
    await Site.findByPk(siteId);

  return (
    site?.name ||
    `Site #${siteId}`
  );
};

export class SiteMembersService {
  static async listMembers(
    siteId: number
  ) {
    return SiteMember.findAll({
      where: {
        siteId
      },
      include: [
        {
          model: User,
          attributes: [
            "id",
            "name",
            "email",
            "role",
            "avatar",
            "isApproved",
            "createdAt"
          ]
        }
      ],
      order: [
        ["createdAt", "ASC"]
      ]
    });
  }

  static async addMemberByEmail(params: {
    siteId: number;
    email: string;
    role: string;
    actorSiteRole: string;
    actorUserId: number;
  }) {
    const {
      siteId,
      email,
      role,
      actorSiteRole,
      actorUserId
    } = params;

    const cleanEmail =
      String(email || "")
        .trim()
        .toLowerCase();

    if (!cleanEmail) {
      const error: any =
        new Error("Email is required");

      error.status = 400;

      throw error;
    }

    const allowedRoles =
      actorSiteRole === "OWNER"
        ? OWNER_ALLOWED_ROLES
        : ADMIN_ALLOWED_ROLES;

    const nextRole =
      normalizeRole(
        role,
        allowedRoles
      );

    const user =
      await User.findOne({
        where: {
          email: cleanEmail
        }
      });

    // =========================
    // CASE 1: USER EXISTS
    // =========================

    if (user) {
      const existing =
        await SiteMember.findOne({
          where: {
            siteId,
            userId: user.id
          }
        });

      if (existing) {
        const error: any =
          new Error(
            "User is already a member of this site."
          );

        error.status = 409;

        throw error;
      }

      await SiteMember.create({
        siteId,
        userId: user.id,
        role: nextRole
      } as any);

      return {
        type: "MEMBER_ADDED",
        data:
          await getMemberWithUser(
            siteId,
            user.id
          )
      };
    }

    // =========================
    // CASE 2: USER DOES NOT EXIST
    // SEND REAL EMAIL INVITATION
    // =========================

    const siteName =
      await getSiteName(siteId);

    const token =
      generateInvitationToken();

    const expiresAt =
      getInvitationExpirationDate();

    const existingPendingInvitation =
      await SiteInvitation.findOne({
        where: {
          siteId,
          email: cleanEmail,
          status: "PENDING"
        }
      });

    let invitation: SiteInvitation;

    if (existingPendingInvitation) {
      await existingPendingInvitation.update({
        role: nextRole,
        token,
        invitedBy: actorUserId,
        expiresAt
      });

      invitation =
        existingPendingInvitation;
    } else {
      invitation =
        await SiteInvitation.create({
          siteId,
          email: cleanEmail,
          role: nextRole,
          token,
          status: "PENDING",
          invitedBy: actorUserId,
          expiresAt,
          acceptedBy: null,
          acceptedAt: null
        } as any);
    }

    await sendSiteInvitationEmail({
      to: cleanEmail,
      siteName,
      role: nextRole,
      token
    });

    return {
      type: "INVITATION_SENT",
      data: invitation
    };
  }

  static async updateMemberRole(params: {
    siteId: number;
    targetUserId: number;
    role: string;
  }) {
    const {
      siteId,
      targetUserId,
      role
    } = params;

    const nextRole =
      normalizeRole(
        role,
        OWNER_ALLOWED_ROLES
      );

    const member =
      await SiteMember.findOne({
        where: {
          siteId,
          userId: targetUserId
        }
      });

    if (!member) {
      const error: any =
        new Error("Member not found");

      error.status = 404;

      throw error;
    }

    if (member.role === "OWNER") {
      const error: any =
        new Error(
          "Owner role cannot be changed."
        );

      error.status = 400;

      throw error;
    }

    await member.update({
      role: nextRole
    });

    return getMemberWithUser(
      siteId,
      targetUserId
    );
  }

  static async removeMember(params: {
    siteId: number;
    targetUserId: number;
  }) {
    const {
      siteId,
      targetUserId
    } = params;

    const member =
      await SiteMember.findOne({
        where: {
          siteId,
          userId: targetUserId
        }
      });

    if (!member) {
      const error: any =
        new Error("Member not found");

      error.status = 404;

      throw error;
    }

    if (member.role === "OWNER") {
      const error: any =
        new Error(
          "Owner cannot be removed from the site."
        );

      error.status = 400;

      throw error;
    }

    await member.destroy();

    return true;
  }
}