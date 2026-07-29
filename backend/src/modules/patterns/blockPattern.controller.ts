import { Response } from "express";

import { AuthRequest } from "../../shared/auth.util";
import { BlockPatternService } from "./blockPattern.service";
import { PATTERN_ERRORS } from "./blockPattern.validation";

const CLIENT_ERROR_STATUS: Record<string, 400 | 404 | 409> = {
  [PATTERN_ERRORS.NAME_REQUIRED]: 400,
  [PATTERN_ERRORS.NAME_TOO_LONG]: 400,
  [PATTERN_ERRORS.ROOT_BLOCK_REQUIRED]: 400,
  [PATTERN_ERRORS.ROOT_MUST_BE_SECTION]: 400,
  [PATTERN_ERRORS.TREE_INVALID]: 400,
  [PATTERN_ERRORS.DUPLICATE_BLOCK_ID]: 409,
  [PATTERN_ERRORS.NOT_FOUND]: 404
};

const sendError = (
  res: Response,
  error: any
) => {
  const code =
    error?.message || PATTERN_ERRORS.TREE_INVALID;

  const status =
    CLIENT_ERROR_STATUS[code];

  if (status) {
    return res.status(status).json({
      success: false,
      message: code,
      code
    });
  }

  return res.status(500).json({
    success: false,
    message: error?.message || "Pattern request failed"
  });
};

const getPatternId = (
  req: AuthRequest
) =>
  Number(req.params.patternId);

export const listPatterns = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const patterns =
      await BlockPatternService.listPatterns(
        req.siteContext.siteId
      );

    return res.json({
      success: true,
      data: patterns
    });
  } catch (error: any) {
    return sendError(res, error);
  }
};

export const createPattern = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const pattern =
      await BlockPatternService.createPattern(
        req.siteContext.siteId,
        req.user?.id ?? null,
        req.body || {}
      );

    return res.status(201).json({
      success: true,
      data: pattern
    });
  } catch (error: any) {
    return sendError(res, error);
  }
};

export const getPattern = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const pattern =
      await BlockPatternService.getPattern(
        req.siteContext.siteId,
        getPatternId(req)
      );

    return res.json({
      success: true,
      data: pattern
    });
  } catch (error: any) {
    return sendError(res, error);
  }
};

export const updatePattern = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const pattern =
      await BlockPatternService.updatePattern(
        req.siteContext.siteId,
        getPatternId(req),
        req.body || {}
      );

    return res.json({
      success: true,
      data: pattern
    });
  } catch (error: any) {
    return sendError(res, error);
  }
};

export const deletePattern = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    await BlockPatternService.deletePattern(
      req.siteContext.siteId,
      getPatternId(req)
    );

    return res.json({
      success: true,
      data: true
    });
  } catch (error: any) {
    return sendError(res, error);
  }
};
