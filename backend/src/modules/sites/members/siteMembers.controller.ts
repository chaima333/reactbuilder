// backend/src/modules/sites/members/siteMembers.controller.ts

import {
  Request,
  Response
} from "express";

import {
  SiteMembersService
} from "./siteMembers.service";

type AuthRequest = Request & {
  user?: any;
  siteContext?: {
    siteId: number;
    role: string;
  };
};

const getSiteId = (
  req: AuthRequest
) => {
  return Number(
    req.siteContext?.siteId ||
    req.params.siteId
  );
};

const getActorSiteRole = (
  req: AuthRequest
) => {
  return String(
    req.siteContext?.role || ""
  ).toUpperCase();
};

const handleError = (
  res: Response,
  err: any
) => {
  return res
    .status(err.status || 500)
    .json({
      success: false,
      message:
        err.message ||
        "Site members operation failed"
    });
};

export const listSiteMembers = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const siteId =
      getSiteId(req);

    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: "Site context missing"
      });
    }

    const members =
      await SiteMembersService.listMembers(
        siteId
      );

    return res.json({
      success: true,
      data: members
    });

  } catch (err: any) {
    return handleError(
      res,
      err
    );
  }
};

export const addSiteMember = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const siteId =
      getSiteId(req);

    const actorSiteRole =
      getActorSiteRole(req);

    const {
      email,
      role
    } = req.body;

    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: "Site context missing"
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const result =
      await SiteMembersService.addMemberByEmail({
        siteId,
        email,
        role,
        actorSiteRole,
        actorUserId: req.user.id
      });

    return res.status(201).json({
      success: true,
      type: result.type,
      message:
        result.type === "INVITATION_SENT"
          ? "Invitation email sent successfully"
          : "Member added successfully",
      data: result.data
    });

  } catch (err: any) {
    return handleError(
      res,
      err
    );
  }
};

export const updateSiteMemberRole = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const siteId =
      getSiteId(req);

    const targetUserId =
      Number(req.params.userId);

    const {
      role
    } = req.body;

    if (
      !siteId ||
      !targetUserId
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid site or member"
      });
    }

    const member =
      await SiteMembersService.updateMemberRole({
        siteId,
        targetUserId,
        role
      });

    return res.json({
      success: true,
      message: "Member role updated successfully",
      data: member
    });

  } catch (err: any) {
    return handleError(
      res,
      err
    );
  }
};

export const removeSiteMember = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const siteId =
      getSiteId(req);

    const targetUserId =
      Number(req.params.userId);

    if (
      !siteId ||
      !targetUserId
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid site or member"
      });
    }

    await SiteMembersService.removeMember({
      siteId,
      targetUserId
    });

    return res.json({
      success: true,
      message: "Member removed successfully"
    });

  } catch (err: any) {
    return handleError(
      res,
      err
    );
  }
};