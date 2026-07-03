import {
  Response
} from "express";

import {
  eventStore
} from "../../../core/plugins/events/event.store";

import {
  AuthRequest
} from "../../../shared/auth.util";

const getEventSiteId = (
  event: any
) => {
  return Number(
    event?.context?.siteId ??
    event?.payload?.context?.siteId ??
    event?.data?.context?.siteId ??
    event?.siteId
  );
};

export const getLiveEvents = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const siteId =
      Number(req.siteContext?.siteId);

    if (!Number.isFinite(siteId)) {
      return res.status(403).json({
        success: false,
        message: "Site context missing"
      });
    }

    const events =
      await eventStore.getLatest();

    const siteEvents =
      (events || []).filter(
        (event: any) =>
          getEventSiteId(event) === siteId
      );

    return res.json({
      success: true,
      data: siteEvents
    });

  } catch (err) {
    console.error(
      "🚨 monitor error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load events"
    });
  }
};