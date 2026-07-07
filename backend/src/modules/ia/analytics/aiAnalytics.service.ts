import { AiActivityEvent } from "../../../models/AiActivityEvent";

type CountItem = {
  name: string;
  count: number;
  fallbackCount?: number;
  successCount?: number;
};

const toPlain = (event: any) =>
  typeof event?.get === "function"
    ? event.get({ plain: true })
    : event;

const getTelemetry = (event: any) => {
  const details =
    event?.details || {};

  return (
    details.aiTelemetry ||
    details.telemetry ||
    null
  );
};

const increment = (
  map: Record<string, number>,
  key: string
) => {
  const safeKey =
    key || "unknown";

  map[safeKey] =
    (map[safeKey] || 0) + 1;
};

const toSortedItems = (
  map: Record<string, number>
): CountItem[] =>
  Object.entries(map)
    .map(([name, count]) => ({
      name,
      count
    }))
    .sort((a, b) => b.count - a.count);

export const getAiAnalyticsSummary = async (
  siteId: number
) => {
  const rows =
    await AiActivityEvent.findAll({
      where: {
        siteId
      },
      order: [["createdAt", "DESC"]],
      limit: 500
    });

  const events =
    rows.map(toPlain);

  const byEventType:
    Record<string, number> = {};

  const byTask:
    Record<string, number> = {};

  const byProvider:
    Record<string, number> = {};

  const byModel:
    Record<string, number> = {};

  const fallbackReasons:
    Record<string, number> = {};

  let telemetryEvents = 0;
  let successCount = 0;
  let failedCount = 0;
  let fallbackCount = 0;
  let totalDuration = 0;
  let durationCount = 0;
  let feedbackEvents = 0;
  let positiveFeedback = 0;
  let negativeFeedback = 0;

 for (const event of events) {
  if (event.eventType === "AI_FEEDBACK") {
    feedbackEvents += 1;

    const rating =
      event.details?.rating;

    if (rating === "positive") {
      positiveFeedback += 1;
    }

    if (rating === "negative") {
      negativeFeedback += 1;
    }

    continue;
  }

  increment(
    byEventType,
    event.eventType || "UNKNOWN"
  );

    const telemetry =
      getTelemetry(event);

    if (!telemetry) {
      continue;
    }

    telemetryEvents += 1;

    increment(
      byTask,
      telemetry.task || event.eventType || "UNKNOWN"
    );

    increment(
      byProvider,
      telemetry.provider || "unknown"
    );

    increment(
      byModel,
      telemetry.model || "unknown"
    );

    if (telemetry.success === true) {
      successCount += 1;
    }

    if (telemetry.success === false) {
      failedCount += 1;
    }

    if (telemetry.usedFallback === true) {
      fallbackCount += 1;

      increment(
        fallbackReasons,
        telemetry.fallbackReason || "UNKNOWN"
      );
    }

    if (
      typeof telemetry.durationMs === "number" &&
      Number.isFinite(telemetry.durationMs)
    ) {
      totalDuration += telemetry.durationMs;
      durationCount += 1;
    }
  }

  const averageDurationMs =
    durationCount > 0
      ? Math.round(totalDuration / durationCount)
      : 0;

  const successRate =
    telemetryEvents > 0
      ? Math.round((successCount / telemetryEvents) * 100)
      : 0;

  const fallbackRate =
    telemetryEvents > 0
      ? Math.round((fallbackCount / telemetryEvents) * 100)
      : 0;
      const feedbackRate =
  events.length > 0
    ? Math.round((feedbackEvents / events.length) * 100)
    : 0;

const positiveFeedbackRate =
  feedbackEvents > 0
    ? Math.round((positiveFeedback / feedbackEvents) * 100)
    : 0;

const negativeFeedbackRate =
  feedbackEvents > 0
    ? Math.round((negativeFeedback / feedbackEvents) * 100)
    : 0;
const recentEvents =
  events
    .filter((event) => event.eventType !== "AI_FEEDBACK")
    .slice(0, 20)
    .map((event) => {
      const telemetry =
        getTelemetry(event);

      return {
        id: event.id,
        eventType: event.eventType,
        pageId: event.pageId || null,
        createdAt: event.createdAt,
        title:
          event.details?.title ||
          event.details?.suggestionTitle ||
          event.details?.blockType ||
          null,
        telemetry: telemetry
          ? {
              task: telemetry.task,
              provider: telemetry.provider,
              model: telemetry.model,
              success: telemetry.success,
              usedFallback: telemetry.usedFallback,
              fallbackReason: telemetry.fallbackReason,
              durationMs: telemetry.durationMs
            }
          : null
      };
    });

  return {
    totals: {
  totalEvents: events.length,
  telemetryEvents,
  successCount,
  failedCount,
  fallbackCount,
  successRate,
  fallbackRate,
  averageDurationMs,
  feedbackEvents,
  positiveFeedback,
  negativeFeedback,
  feedbackRate,
  positiveFeedbackRate,
  negativeFeedbackRate
},
    byEventType:
      toSortedItems(byEventType),
    byTask:
      toSortedItems(byTask),
    byProvider:
      toSortedItems(byProvider),
    byModel:
      toSortedItems(byModel),
    fallbackReasons:
      toSortedItems(fallbackReasons),
    recentEvents
  };
};