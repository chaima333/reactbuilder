import type {
  Request,
  Response
} from "express";

import { ZodError } from "zod";

import {
  createPartnerApplicationSchema
} from "./partnerApplication.validation";

import {
  partnerApplicationService
} from "./partnerApplication.service";

type ControllerError =
  Error & {
    status?: number;
  };

const toNumber = (
  value: string
): number => {
  const parsed =
    Number(value);

  if (
    Number.isNaN(parsed)
  ) {
    throw Object.assign(
      new Error("Invalid numeric parameter"),
      {
        status: 400
      }
    );
  }

  return parsed;
};

const getUserId = (
  req: Request
): number => {
  const user =
    (req as any).user;

  const userId =
    user?.id ||
    user?.userId;

  if (!userId) {
    throw Object.assign(
      new Error("Authenticated user not found"),
      {
        status: 401
      }
    );
  }

  return Number(userId);
};

const handleError = (
  res: Response,
  error: unknown
) => {
  if (
    error instanceof ZodError
  ) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.flatten()
    });
  }

  const typedError =
    error as ControllerError;

  return res
    .status(
      typedError.status || 500
    )
    .json({
      success: false,
      message:
        typedError.message ||
        "Internal server error"
    });
};

export const partnerApplicationController = {
  async createPublicApplication(
    req: Request,
    res: Response
  ) {
    try {
      const siteId =
        toNumber(
          req.params.siteId
        );

      const payload =
        createPartnerApplicationSchema.parse(
          req.body
        );

      const application =
        await partnerApplicationService
          .createApplication(
            siteId,
            payload
          );

      return res.status(201).json({
        success: true,
        data: application
      });
    } catch (error) {
      return handleError(
        res,
        error
      );
    }
  },

  async listApplications(
    req: Request,
    res: Response
  ) {
    try {
      const siteId =
        toNumber(
          req.params.siteId
        );

      const applications =
        await partnerApplicationService
          .listApplications(siteId);

      return res.json({
        success: true,
        data: applications
      });
    } catch (error) {
      return handleError(
        res,
        error
      );
    }
  },

  async getApplicationById(
    req: Request,
    res: Response
  ) {
    try {
      const siteId =
        toNumber(
          req.params.siteId
        );

      const applicationId =
        toNumber(
          req.params.applicationId
        );

      const application =
        await partnerApplicationService
          .getApplicationById(
            siteId,
            applicationId
          );

      return res.json({
        success: true,
        data: application
      });
    } catch (error) {
      return handleError(
        res,
        error
      );
    }
  },

  async approveApplication(
    req: Request,
    res: Response
  ) {
    try {
      const siteId =
        toNumber(
          req.params.siteId
        );

      const applicationId =
        toNumber(
          req.params.applicationId
        );

      const reviewedByUserId =
        getUserId(req);

      const application =
        await partnerApplicationService
          .approveApplication(
            siteId,
            applicationId,
            reviewedByUserId
          );

      return res.json({
        success: true,
        data: application
      });
    } catch (error) {
      return handleError(
        res,
        error
      );
    }
  },

  async rejectApplication(
    req: Request,
    res: Response
  ) {
    try {
      const siteId =
        toNumber(
          req.params.siteId
        );

      const applicationId =
        toNumber(
          req.params.applicationId
        );

      const reviewedByUserId =
        getUserId(req);

      const application =
        await partnerApplicationService
          .rejectApplication(
            siteId,
            applicationId,
            reviewedByUserId
          );

      return res.json({
        success: true,
        data: application
      });
    } catch (error) {
      return handleError(
        res,
        error
      );
    }
  }
};