// backend/src/modules/invitations/invitation.service.ts

import SiteInvitation from "../../../models/SiteInvitation";
import SiteMember from "../../../models/SiteMember";
import User from "../../../models/User";

export class InvitationService {
  static async acceptInvitation(params: {
    token: string;
    userId: number;
  }) {
    const {
      token,
      userId
    } = params;

    if (!token) {
      const error: any =
        new Error("Invitation token is required");

      error.status = 400;

      throw error;
    }

    const user =
      await User.findByPk(userId);

    if (!user) {
      const error: any =
        new Error("User not found");

      error.status = 404;

      throw error;
    }

    const invitation =
      await SiteInvitation.findOne({
        where: {
          token,
          status: "PENDING"
        }
      });

    if (!invitation) {
      const error: any =
        new Error("Invitation not found or already used");

      error.status = 404;

      throw error;
    }

    if (
      invitation.expiresAt &&
      invitation.expiresAt < new Date()
    ) {
      await invitation.update({
        status: "EXPIRED"
      });

      const error: any =
        new Error("Invitation expired");

      error.status = 400;

      throw error;
    }

    const userEmail =
      String(user.email || "")
        .trim()
        .toLowerCase();

    const invitationEmail =
      String(invitation.email || "")
        .trim()
        .toLowerCase();

    if (userEmail !== invitationEmail) {
      const error: any =
        new Error(
          "This invitation belongs to another email"
        );

      error.status = 403;

      throw error;
    }

    const existingMember =
      await SiteMember.findOne({
        where: {
          siteId: invitation.siteId,
          userId: user.id
        }
      });

    if (!existingMember) {
      await SiteMember.create({
        siteId: invitation.siteId,
        userId: user.id,
        role: invitation.role
      } as any);
    }

    await invitation.update({
      status: "ACCEPTED",
      acceptedBy: user.id,
      acceptedAt: new Date()
    });

    return {
      siteId: invitation.siteId,
      role: invitation.role
    };
  }
}