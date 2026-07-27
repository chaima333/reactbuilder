import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
InputLabel,
MenuItem,
Select,
  Typography
} from "@mui/material";

import {
  useGetAiAnalyticsQuery,
  type AiAnalyticsCountItem,
  type AiAnalyticsRecentEvent
} from "../../../redux/services/ai.api";
import { useGetAdminSitesQuery } from "../../../redux/services/admin.api";

const getStoredSiteId = () => {
  const value =
    localStorage.getItem("selectedSiteId") ||
    localStorage.getItem("currentSiteId") ||
    localStorage.getItem("siteId") ||
    "";

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : 0;
};

const MetricCard = ({
  title,
  value,
  subtitle
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) => (
  <Card variant="outlined" sx={{ height: "100%", borderRadius: 3 }}>
    <CardContent>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>

      <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
        {value}
      </Typography>

      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const CountTable = ({
  title,
  rows,
  emptyText = "No data yet"
}: {
  title: string;
  rows: AiAnalyticsCountItem[];
  emptyText?: string;
}) => (
  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
    <Typography fontWeight={800} sx={{ mb: 1.5 }}>
      {title}
    </Typography>

    {rows.length === 0 ? (
      <Alert severity="info">{emptyText}</Alert>
    ) : (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="right">Count</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell>{row.name}</TableCell>
              <TableCell align="right">{row.count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )}
  </Paper>
);

const RecentEventsTable = ({
  rows
}: {
  rows: AiAnalyticsRecentEvent[];
}) => (
  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
    <Typography fontWeight={800} sx={{ mb: 1.5 }}>
      Recent AI Events
    </Typography>

    {rows.length === 0 ? (
      <Alert severity="info">No recent AI events yet.</Alert>
    ) : (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Event</TableCell>
            <TableCell>Provider</TableCell>
            <TableCell>Fallback</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((event) => {
            const telemetry = event.telemetry;

            return (
              <TableRow key={event.id}>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography fontWeight={700} fontSize={13}>
                      {event.eventType}
                    </Typography>

                    {event.title && (
                      <Typography variant="caption" color="text.secondary">
                        {event.title}
                      </Typography>
                    )}

                    {event.pageId != null && (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`Page ${event.pageId}`}
                        sx={{ width: "fit-content" }}
                      />
                    )}
                  </Stack>
                </TableCell>

                <TableCell>
                  {telemetry?.provider ? (
                    <Stack spacing={0.5}>
                      <Chip
                        size="small"
                        label={telemetry.provider}
                        variant="outlined"
                      />

                      {telemetry.model && (
                        <Typography variant="caption" color="text.secondary">
                          {telemetry.model}
                        </Typography>
                      )}
                    </Stack>
                  ) : (
                    "-"
                  )}
                </TableCell>

                <TableCell>
                  {telemetry?.usedFallback ? (
                    <Stack spacing={0.5}>
                      <Chip
                        size="small"
                        color="warning"
                        label="Used fallback"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {telemetry.fallbackReason || "UNKNOWN"}
                      </Typography>
                    </Stack>
                  ) : telemetry ? (
                    <Chip size="small" color="success" label="LLM success" />
                  ) : (
                    "-"
                  )}
                </TableCell>

                <TableCell>
                  {telemetry?.durationMs != null
                    ? `${telemetry.durationMs}ms`
                    : "-"}
                </TableCell>

                <TableCell>
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short"
                  }).format(new Date(event.createdAt))}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    )}
  </Paper>
);
type Props = {
  fixedSiteId?: number;
  showSiteSelector?: boolean;
};
export default function AiTelemetryAnalyticsPanel({ fixedSiteId, showSiteSelector = true }: Props) {
  const initialSiteId = useMemo(() => getStoredSiteId(), []);
  const [selectedSiteId, setSelectedSiteId] = useState<number>(initialSiteId);

  const {
    data: sites = [],
    isLoading: sitesLoading
  } = useGetAdminSitesQuery();

  useEffect(() => {
    if (
      selectedSiteId > 0 ||
      !Array.isArray(sites) ||
      sites.length === 0
    ) {
      return;
    }

    const firstSiteId =
      Number((sites[0] as any)?.id || 0);

    if (firstSiteId > 0) {
      setSelectedSiteId(firstSiteId);

      localStorage.setItem(
        "selectedSiteId",
        String(firstSiteId)
      );
    }
  }, [sites, selectedSiteId]);

  const siteId = fixedSiteId && fixedSiteId > 0 ? fixedSiteId : selectedSiteId;

  const validSiteId = Number.isFinite(siteId) && siteId > 0;

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error
  } = useGetAiAnalyticsQuery(siteId, {
    skip: !validSiteId,
    refetchOnMountOrArgChange: true
  });

  return (
    <Box sx={{ p: 0 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={900}>
            🧠 AI Telemetry & Reliability
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Monitor AI usage, fallback rate, provider behavior and latency.
          </Typography>
        </Box>

       {showSiteSelector && (
  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      alignItems={{ xs: "stretch", md: "center" }}
    >
      <FormControl size="small" sx={{ minWidth: 260 }}>
        <InputLabel id="ai-telemetry-site-label">
          Site
        </InputLabel>

        <Select
          labelId="ai-telemetry-site-label"
          value={selectedSiteId || ""}
          label="Site"
          disabled={sitesLoading}
          onChange={(event) => {
            const nextSiteId =
              Number(event.target.value);

            setSelectedSiteId(nextSiteId);

            if (nextSiteId > 0) {
              localStorage.setItem(
                "selectedSiteId",
                String(nextSiteId)
              );
            }
          }}
        >
          {Array.isArray(sites) &&
            sites.map((site: any) => (
              <MenuItem
                key={site.id}
                value={Number(site.id)}
              >
                {site.name ||
                  site.title ||
                  site.siteName ||
                  `Site #${site.id}`}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      <Typography variant="body2" color="text.secondary">
        The dashboard reads telemetry from AI Activity History for the selected site.
      </Typography>
    </Stack>
  </Paper>
)}

        {!validSiteId && (
          <Alert severity="info">
            Select a site to load AI analytics.
          </Alert>
        )}

        {validSiteId && (isLoading || isFetching) && (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress size={30} />
          </Box>
        )}

        {validSiteId && isError && (
          <Alert severity="error">
            Failed to load AI analytics.
            {(error as any)?.data?.message
              ? ` ${(error as any).data.message}`
              : ""}
          </Alert>
        )}

        {validSiteId && data && (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Total AI Events"
                  value={data.totals.totalEvents}
                  subtitle="All recorded AI activity events"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Telemetry Events"
                  value={data.totals.telemetryEvents}
                  subtitle="Events with provider/model telemetry"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Success Rate"
                  value={`${data.totals.successRate}%`}
                  subtitle={`${data.totals.successCount} successful calls`}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Fallback Rate"
                  value={`${data.totals.fallbackRate}%`}
                  subtitle={`${data.totals.fallbackCount} fallback calls`}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Failed Calls"
                  value={data.totals.failedCount}
                  subtitle="Telemetry success=false"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Average Duration"
                  value={`${data.totals.averageDurationMs}ms`}
                  subtitle="Average model/fallback execution time"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
  <MetricCard
    title="Feedback Events"
    value={data.totals.feedbackEvents ?? 0}
    subtitle={`${data.totals.feedbackRate ?? 0}% of AI activity reviewed`}
  />
</Grid>

<Grid item xs={12} sm={6} md={3}>
  <MetricCard
    title="Positive Feedback"
    value={data.totals.positiveFeedback ?? 0}
    subtitle={`${data.totals.positiveFeedbackRate ?? 0}% useful ratings`}
  />
</Grid>

<Grid item xs={12} sm={6} md={3}>
  <MetricCard
    title="Negative Feedback"
    value={data.totals.negativeFeedback ?? 0}
    subtitle={`${data.totals.negativeFeedbackRate ?? 0}% not useful ratings`}
  />
</Grid>
            </Grid>

            <Divider />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <CountTable title="Events by Type" rows={data.byEventType} />
              </Grid>

              <Grid item xs={12} md={6}>
                <CountTable title="Events by AI Task" rows={data.byTask} />
              </Grid>

              <Grid item xs={12} md={6}>
                <CountTable title="Providers" rows={data.byProvider} />
              </Grid>

              <Grid item xs={12} md={6}>
                <CountTable
                  title="Fallback Reasons"
                  rows={data.fallbackReasons}
                />
              </Grid>
            </Grid>

            <RecentEventsTable rows={data.recentEvents} />
          </>
        )}
      </Stack>
    </Box>
  );
}