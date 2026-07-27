import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import {
  AutoAwesome,
  Category,
  Image,
  Public,
  Timeline,
  TrendingUp,
} from "@mui/icons-material";

import {
  useGetAIStatsQuery,
  useGetAdminStatsQuery,
} from "../../../redux/services/admin.api";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AiTelemetryAnalyticsPanel from "../components/AiTelemetryAnalyticsPanel";
import { useNavigate } from "react-router-dom";

// ==================== TYPES ====================
interface AIStats {
  generatedPages: number;
  generatedImages: number;
  lastGenerationAt: string | null;
  dailyGenerations: DailyGeneration[];
  topCategories: CategoryCount[];
  topSites?: SiteGeneration[];
  generatedToday: number;
  generatedThisWeek: number;
  recentGenerations?: RecentGeneration[];
  lastActiveSites?: LastActiveSite[];
}

interface DailyGeneration {
  date: string;
  count: number;
}

interface CategoryCount {
  category: string;
  count: number;
}

interface SiteGeneration {
  siteId: string;
  siteName: string;
  count: number;
}

interface RecentGeneration {
  id: string;
  siteId: string;
  siteName?: string;
  category: string;
  createdAt: string;
}

interface LastActiveSite {
  siteId: string;
  siteName: string;
  count: number;
  lastActivityAt: string | null;
}

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

interface MetricCardProps {
  title: string;
  value: React.ReactNode;
  helper?: React.ReactNode;
  icon: React.ReactNode;
  color: string;
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// ==================== CONSTANTS ====================
const RANGE_OPTIONS = [
  { value: 7, label: "7 Days" },
  { value: 30, label: "30 Days" },
  { value: 90, label: "90 Days" },
  { value: 365, label: "365 Days" },
];

// ==================== HELPERS ====================
const isValidDate = (dateString: string | null) => {
  if (!dateString) return false;
  return !Number.isNaN(new Date(dateString).getTime());
};

const formatTimeAgo = (dateString: string | null) => {
  if (!isValidDate(dateString)) return "No AI activity";

  const diff = Date.now() - new Date(dateString as string).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

  return "Just now";
};

const formatDateTime = (dateString: string | null) => {
  if (!isValidDate(dateString)) return "No AI activity";

  const date = new Date(dateString as string);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  if (isToday) {
    return `Today at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatRelativeTime = (dateString: string | null) => {
  if (!isValidDate(dateString)) return "N/A";

  const diff = Date.now() - new Date(dateString as string).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} h ago`;

  return new Date(dateString as string).toLocaleDateString();
};

// ==================== SMALL COMPONENTS ====================
const SectionCard = ({ title, children, action }: SectionCardProps) => {
  const theme = useTheme();

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, md: 2.5 },
        height: "100%",
        borderRadius: 3,
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: theme.palette.mode === "dark" ? "none" : theme.shadows[1],
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        mb={2}
      >
        <Typography variant="h6" fontWeight={800} color="text.primary">
          {title}
        </Typography>
        {action}
      </Stack>

      {children}
    </Paper>
  );
};

const MetricCard = ({ title, value, helper, icon, color }: MetricCardProps) => {
  const theme = useTheme();

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 3,
        bgcolor: "background.paper",
        borderColor: "divider",
        transition: theme.transitions.create(["transform", "border-color"], {
          duration: theme.transitions.duration.short,
        }),
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: alpha(color, 0.5),
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box minWidth={0}>
            <Typography variant="body2" color="text.secondary" fontWeight={700}>
              {title}
            </Typography>

            <Typography
              variant="h4"
              fontWeight={900}
              color="text.primary"
              mt={0.5}
              noWrap
            >
              {value}
            </Typography>

            {helper && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {helper}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              width: 44,
              height: 44,
              flexShrink: 0,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              color,
              bgcolor: alpha(color, theme.palette.mode === "dark" ? 0.16 : 0.1),
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const EmptyState = ({ icon, title, description }: EmptyStateProps) => (
  <Box
    minHeight={220}
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    textAlign="center"
    gap={1}
    px={2}
  >
    <Box sx={{ color: "text.disabled" }}>{icon}</Box>
    <Typography color="text.secondary" fontWeight={700}>
      {title}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {description}
    </Typography>
  </Box>
);

const RangeFilter = ({ days, onChange }: { days: number; onChange: (days: number) => void }) => (
  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
    {RANGE_OPTIONS.map((option) => (
      <Button
        key={option.value}
        size="small"
        color="primary"
        variant={days === option.value ? "contained" : "outlined"}
        onClick={() => onChange(option.value)}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 700,
        }}
      >
        {option.label}
      </Button>
    ))}
  </Stack>
);

// ==================== MAIN COMPONENT ====================
export default function AdminAIAnalytics() {
  const theme = useTheme();
  const [days, setDays] = useState<number>(7);
  const navigate = useNavigate();

  const {
    data: aiStats,
    isLoading: aiLoading,
    isError: aiError,
    error,
  } = useGetAIStatsQuery(days);

  const { data: stats, isLoading: statsLoading } = useGetAdminStatsQuery(days);

  const chartColors = useMemo(
    () => [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.success.main,
    ],
    [theme]
  );

  const safeAiStats: AIStats = {
    generatedPages: aiStats?.generatedPages ?? 0,
    generatedImages: aiStats?.generatedImages ?? 0,
    lastGenerationAt: aiStats?.lastGenerationAt ?? null,
    dailyGenerations: aiStats?.dailyGenerations ?? [],
    topCategories: aiStats?.topCategories ?? [],
    topSites: aiStats?.topSites ?? [],
    generatedToday: aiStats?.generatedToday ?? 0,
    generatedThisWeek: aiStats?.generatedThisWeek ?? 0,
    recentGenerations: aiStats?.recentGenerations ?? [],
    lastActiveSites: aiStats?.lastActiveSites ?? [],
  };

  const totalGenerations =
    safeAiStats.generatedPages + safeAiStats.generatedImages;

  const aiAdoptionRate =
    stats?.totalPages && stats.totalPages > 0
      ? Math.round((safeAiStats.generatedPages / stats.totalPages) * 100)
      : 0;

  const hasData =
    totalGenerations > 0 ||
    safeAiStats.dailyGenerations.length > 0 ||
    safeAiStats.topCategories.length > 0 ||
    (safeAiStats.topSites?.length ?? 0) > 0;

  const tooltipStyle = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 12,
    color: theme.palette.text.primary,
    boxShadow: theme.palette.mode === "dark" ? "none" : theme.shadows[3],
  };

  if (aiLoading || statsLoading) {
    return (
      <Box
        minHeight="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        gap={2}
        sx={{ bgcolor: "background.default", color: "text.primary" }}
      >
        <CircularProgress size={42} color="primary" />
        <Typography variant="body2" color="text.secondary">
          Loading AI Analytics...
        </Typography>
      </Box>
    );
  }

  if (aiError) {
    const errorMessage =
      "data" in ((error as any) ?? {})
        ? (error as any)?.data?.message
        : undefined;

    return (
      <Box
        minHeight="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{ bgcolor: "background.default", px: 2 }}
      >
        <Alert severity="error" sx={{ width: "100%", maxWidth: 560 }}>
          {errorMessage || "Failed to load AI analytics data. Please try again later."}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 2, md: 3 },
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      {/* ===== HEADER ===== */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={900} color="text.primary">
            AI Analytics
          </Typography>

          <Typography color="text.secondary" mt={0.5}>
            Simple overview of AI content generation activity.
          </Typography>

          {totalGenerations > 0 && (
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={`${totalGenerations} total generations`}
              sx={{ mt: 1, fontWeight: 700 }}
            />
          )}
        </Box>

        <RangeFilter days={days} onChange={setDays} />
      </Stack>

      {/* ===== SUMMARY CARDS ===== */}
      <Grid container spacing={2.5} mb={2.5}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="AI Generated Pages"
            value={safeAiStats.generatedPages}
            icon={<AutoAwesome />}
            color={theme.palette.primary.main}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="AI Generated Images"
            value={safeAiStats.generatedImages}
            icon={<Image />}
            color={theme.palette.warning.main}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Last Generation"
            value={formatTimeAgo(safeAiStats.lastGenerationAt)}
            helper={formatDateTime(safeAiStats.lastGenerationAt)}
            icon={<Timeline />}
            color={theme.palette.info.main}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Top Category"
            value={safeAiStats.topCategories[0]?.category || "N/A"}
            helper={
              safeAiStats.topCategories[0]
                ? `${safeAiStats.topCategories[0].count} generations`
                : "No data"
            }
            icon={<Category />}
            color={theme.palette.success.main}
          />
        </Grid>
      </Grid>
      {/* ===== CHARTS ===== */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={6}>
          <SectionCard title={`Daily Generations - ${days} Days`}>
            <Box sx={{ height: 280, width: "100%" }}>
              {safeAiStats.dailyGenerations.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={safeAiStats.dailyGenerations}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis
                      dataKey="date"
                      stroke={theme.palette.text.secondary}
                      tickFormatter={(date) =>
                        new Date(date).toLocaleDateString([], { day: "numeric" })
                      }
                    />
                    <YAxis allowDecimals={false} stroke={theme.palette.text.secondary} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      labelFormatter={(date) =>
                        new Date(date).toLocaleDateString([], {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })
                      }
                    />
                    <Bar
                      dataKey="count"
                      fill={theme.palette.primary.main}
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  icon={<TrendingUp sx={{ fontSize: 42 }} />}
                  title="No data available"
                  description="Start generating AI content to see trends."
                />
              )}
            </Box>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <SectionCard title="Category Distribution">
            <Box sx={{ height: 280, width: "100%" }}>
              {safeAiStats.topCategories.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={safeAiStats.topCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={84}
                      paddingAngle={2}
                      dataKey="count"
                      label={({ category, percent }) =>
                        `${category} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={{
                        stroke: theme.palette.divider,
                        strokeWidth: 1,
                      }}
                    >
                      {safeAiStats.topCategories.map((category, index) => (
                        <Cell
                          key={`${category.category}-${index}`}
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [`${value} generations`, "Count"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  icon={<Category sx={{ fontSize: 42 }} />}
                  title="No data available"
                  description="Categories will appear when AI content is generated."
                />
              )}
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      {/* ===== TOP SITES + USAGE ===== */}
      <Grid container spacing={2.5} mt={0}>
        <Grid item xs={12} md={6}>
          <SectionCard
            title="Top AI Sites"
            action={
              <Chip
                size="small"
                color="primary"
                variant="outlined"
                label={`${safeAiStats.topSites?.length || 0} sites`}
                sx={{ fontWeight: 700 }}
              />
            }
          >
            {safeAiStats.topSites && safeAiStats.topSites.length > 0 ? (
              <Stack spacing={2}>
                {safeAiStats.topSites.slice(0, 5).map((site, index) => {
                  const maxCount = safeAiStats.topSites?.[0]?.count || 1;
                  const percentage = (site.count / maxCount) * 100;
                  const color = chartColors[index % chartColors.length];

                  return (
                    <Box key={site.siteId}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}
                        mb={0.75}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5} minWidth={0}>
                          <Typography variant="body2" fontWeight={800} color="text.secondary">
                            #{index + 1}
                          </Typography>

                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 2,
                              flexShrink: 0,
                              display: "grid",
                              placeItems: "center",
                              color,
                              bgcolor: alpha(color, theme.palette.mode === "dark" ? 0.16 : 0.1),
                            }}
                          >
                            <Public sx={{ fontSize: 16 }} />
                          </Box>
                                <Button
  size="small"
  variant="text"
  onClick={() =>
    navigate(`/admin/ai-analytics/sites/${site.siteId}`)
  }
  sx={{
    textTransform: "none",
    fontWeight: 800,
    px: 0,
    minWidth: 0
  }}
>
  {site.siteName || `Site #${site.siteId}`}
</Button>
                        </Stack>

                        <Typography fontWeight={800} color="text.primary">
                          {site.count}
                        </Typography>
                      </Stack>

                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          height: 5,
                          borderRadius: 99,
                          bgcolor: alpha(color, 0.12),
                          "& .MuiLinearProgress-bar": {
                            bgcolor: color,
                            borderRadius: 99,
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            ) : (
              <EmptyState
                icon={<Public sx={{ fontSize: 42 }} />}
                title="No AI sites yet"
                description="Sites will appear here when AI content is generated."
              />
            )}
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <SectionCard title="AI Usage Overview">
            <Grid container spacing={1.5}>
              {[
                {
                  label: "AI Pages",
                  value: safeAiStats.generatedPages,
                  color: theme.palette.primary.main,
                },
                {
                  label: "AI Images",
                  value: safeAiStats.generatedImages,
                  color: theme.palette.warning.main,
                },
                {
                  label: "Categories",
                  value: safeAiStats.topCategories.length,
                  color: theme.palette.info.main,
                },
                {
                  label: "Active Sites",
                  value: safeAiStats.topSites?.length || 0,
                  color: theme.palette.success.main,
                },
                {
                  label: "AI Today",
                  value: safeAiStats.generatedToday,
                  color: theme.palette.secondary.main,
                },
                {
                  label: "AI This Week",
                  value: safeAiStats.generatedThisWeek,
                  color: theme.palette.info.main,
                },
                {
                  label: "AI Adoption",
                  value: `${aiAdoptionRate}%`,
                  color: theme.palette.primary.main,
                },
              ].map((item) => (
                <Grid item xs={6} sm={4} key={item.label}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2,
                      height: "100%",
                      borderRadius: 2.5,
                      textAlign: "center",
                      bgcolor: alpha(item.color, theme.palette.mode === "dark" ? 0.08 : 0.04),
                      borderColor: alpha(item.color, theme.palette.mode === "dark" ? 0.22 : 0.18),
                    }}
                  >
                    <Typography variant="h5" fontWeight={900} color="text.primary">
                      {item.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      {item.label}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        </Grid>
      </Grid>

      {/* ===== LAST ACTIVE SITES ===== */}
      <Grid container spacing={2.5} mt={0}>
        <Grid item xs={12}>
          <SectionCard
            title="Last Active AI Sites"
            action={
              <Chip
                size="small"
                color="secondary"
                variant="outlined"
                label={`${safeAiStats.lastActiveSites?.length || 0} sites`}
                sx={{ fontWeight: 700 }}
              />
            }
          >
            {safeAiStats.lastActiveSites && safeAiStats.lastActiveSites.length > 0 ? (
              <Box sx={{ width: "100%", overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, color: "text.secondary" }}>
                        Site
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "text.secondary" }}>
                        Generations
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: "text.secondary" }}>
                        Last Activity
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {safeAiStats.lastActiveSites.slice(0, 10).map((row) => (
                      <TableRow key={row.siteId} hover>
                        <TableCell>
                          <Button
  size="small"
  variant="text"
  onClick={() =>
    navigate(`/admin/ai-analytics/sites/${row.siteId}`)
  }
  sx={{
    textTransform: "none",
    fontWeight: 800,
    px: 0,
    minWidth: 0
  }}
>
  {row.siteName || `Site #${row.siteId}`}
</Button>
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            color="primary"
                            variant="outlined"
                            label={`${row.count} generations`}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatRelativeTime(row.lastActivityAt)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <EmptyState
                icon={<AutoAwesome sx={{ fontSize: 42 }} />}
                title="No recent AI generations"
                description="Recent AI content will appear here when generated."
              />
            )}
          </SectionCard>
        </Grid>
      </Grid>

      {/* ===== EMPTY STATE ===== */}
      {!hasData && (
        <Alert severity="info" sx={{ mt: 2.5, borderRadius: 3 }}>
          <Typography fontWeight={800}>No AI generation data available yet</Typography>
          <Typography variant="body2">
            Start generating content with AI to see analytics here.
          </Typography>
        </Alert>
      )}
    </Box>
  );
}
