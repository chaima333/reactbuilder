import React from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import { useGetAiActivityHistoryQuery } from "../../../redux/services/ai.api";
import type { AiActivityEvent } from "../../../redux/services/ai.api";

type Props = {
  siteId: number;
};

const getCardContent = (event: AiActivityEvent) => {
  const details = event.details || {};

  switch (event.eventType) {
    case "AI_PAGE_GENERATED":
      return {
        icon: "🤖",
        title: "Page generated",
        subtitle: details.title || "AI generated a new page"
      };
    case "AI_PAGE_GENERATION_FAILED":
      return {
        icon: "⚠️",
        title: "Generation failed",
        subtitle: details.message || "AI page generation failed"
      };
    case "DESIGN_COPILOT_CHAT":
      return {
        icon: "💬",
        title: "AI design suggestion",
        subtitle: `${details.suggestionsCount ?? 0} suggestions generated`
      };
    case "DESIGN_COPILOT_APPLY":
      return {
        icon: "🎨",
        title: details.suggestionTitle || "Design improved",
        subtitle: `${details.actionsCount ?? 0} actions applied`
      };
    case "AI_BLOCK_EDIT":
      return {
        icon: "✏️",
        title: "Block edited",
        subtitle: details.blockType || details.blockId || "AI updated a block"
      };
    default:
      return {
        icon: "🤖",
        title: event.eventType,
        subtitle: "AI activity"
      };
  }
};

export const AiActivityHistoryPanel: React.FC<Props> = ({ siteId }) => {
  const validSiteId = Number.isFinite(siteId) && siteId > 0;
  const { data: events = [], isLoading, isFetching, isError } =
    useGetAiActivityHistoryQuery(siteId, {
      skip: !validSiteId,
      refetchOnMountOrArgChange: true
    });

  if (!validSiteId) {
    return <Alert severity="info">Select a site to view AI history.</Alert>;
  }

  if (isLoading || isFetching) {
    return (
      <Box display="flex" justifyContent="center" py={5}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (isError) {
    return <Alert severity="error">Unable to load AI activity history.</Alert>;
  }

  if (events.length === 0) {
    return <Alert severity="info">No AI activity recorded yet.</Alert>;
  }

  return (
    <Stack spacing={1.5}>
      {events.map((event) => {
        const card = getCardContent(event);
        const actions = Array.isArray(event.details?.actions)
          ? event.details.actions
          : [];
        const improvements = Array.from(new Set(
          actions
            .map((action) => action?.improvement)
            .filter((value): value is string => Boolean(value))
        ));

        return (
          <Paper key={event.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={1.25}>
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <Typography component="span" fontSize={22} lineHeight={1.2}>
                  {card.icon}
                </Typography>
                <Box minWidth={0}>
                  <Typography fontWeight={700} fontSize={14}>
                    {card.title}
                  </Typography>
                  <Typography fontSize={13} color="text.secondary">
                    {card.subtitle}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Intl.DateTimeFormat(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short"
                    }).format(new Date(event.createdAt))}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip size="small" label={event.eventType} />
                {event.pageId != null && (
                  <Chip size="small" variant="outlined" label={`Page ${event.pageId}`} />
                )}
                {(event.details?.actionsCount != null || actions.length > 0) && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`${event.details?.actionsCount ?? actions.length} actions`}
                  />
                )}
                {improvements.map((improvement) => (
                  <Chip
                    key={improvement}
                    size="small"
                    color="primary"
                    variant="outlined"
                    label={improvement}
                  />
                ))}
              </Stack>
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
};

export default AiActivityHistoryPanel;
