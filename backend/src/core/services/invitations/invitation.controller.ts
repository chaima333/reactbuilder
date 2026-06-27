// backend/src/modules/invitations/invitation.controller.ts

import {
  Request,
  Response
} from "express";

import {
  InvitationService
} from "./invitation.service";

type AuthRequest = Request & {
  user?: any;
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
        "Invitation operation failed"
    });
};

export const acceptInvitation = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      token
    } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const result =
      await InvitationService.acceptInvitation({
        token,
        userId: req.user.id
      });

    return res.json({
      success: true,
      message: "Invitation accepted successfully",
      data: result
    });

  } catch (err: any) {
    return handleError(
      res,
      err
    );
  }
};