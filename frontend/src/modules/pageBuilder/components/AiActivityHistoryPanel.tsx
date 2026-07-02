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

type Props = {
  siteId: number;
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
              <Box>
                <Typography fontWeight={700} fontSize={14}>
                  {event.details?.suggestionTitle || event.eventType}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short"
                  }).format(new Date(event.createdAt))}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip
                  size="small"
                  label={`${event.details?.actionsCount ?? actions.length} actions`}
                />
                <Chip
                  size="small"
                  variant="outlined"
                  label={`Page ${event.pageId ?? "—"}`}
                />
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
