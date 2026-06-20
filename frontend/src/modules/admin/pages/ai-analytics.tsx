import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Paper,
  Chip,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";

import {
  AutoAwesome,
  Image,
  Category,
  Public,
  TrendingUp,
  Timeline,
} from "@mui/icons-material";

import { useGetAIStatsQuery, useGetAdminStatsQuery } from "../../../redux/services/admin.api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ==================== TYPES ====================
interface AIStats {
  generatedPages: number;
  generatedImages: number;
  lastGenerationAt: string | null;
  dailyGenerations: { date: string; count: number }[];
  topCategories: { category: string; count: number }[];
  topSites?: { siteId: string; siteName: string; count: number }[];
  generatedToday: number;
  generatedThisWeek: number;
  recentGenerations?: { id: string; siteId: string; siteName?: string; category: string; createdAt: string }[];
  lastActiveSites?: {
    siteId: string;
    siteName: string;
    count: number;
    lastActivityAt: string | null;
  }[];
}

// ==================== COLORS ====================
const COLORS = ["#00C49A", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

// ==================== COMPONENTS ====================
const SectionCard = ({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: 4,
      boxShadow: "0 10px 30px rgba(0,0,0,0.07)",
      border: "1px solid rgba(0,0,0,0.06)",
      height: "100%",
    }}
  >
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      mb={2}
    >
      <Typography variant="h6" fontWeight={800}>
        {title}
      </Typography>
      {action}
    </Stack>
    {children}
  </Paper>
);

// ==================== MAIN COMPONENT ====================
export default function AdminAIAnalytics() {
  // ===== STATE =====
  const [days, setDays] = useState<number>(7);

  // ===== HOOKS =====
  const { data: aiStats, isLoading: aiLoading, isError: aiError } = useGetAIStatsQuery(days);
  const { data: stats, isLoading: statsLoading } = useGetAdminStatsQuery(days);

  // ===== HELPERS =====
  const timeAgo = (dateString: string | null) => {
    if (!dateString) return "No AI activity";

    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No AI activity";

    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    return isToday
      ? `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      : date.toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };
const formatRelativeTime = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime();

  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} h ago`;

  return new Date(dateString).toLocaleDateString();
};
  // ===== LOADING =====
  if (aiLoading || statsLoading) {
    return (
      <Box
        minHeight="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={48} sx={{ color: "#00C49A" }} />
        <Typography variant="body2" color="text.secondary">
          Loading AI Analytics...
        </Typography>
      </Box>
    );
  }

  // ===== ERROR =====
  if (aiError) {
    return (
      <Box
        minHeight="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {/* @ts-ignore */}
          {aiError?.data?.message || "Failed to load AI analytics data. Please try again later."}
        </Alert>
      </Box>
    );
  }

  // ===== SAFE DATA =====
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

  // ===== AI ADOPTION RATE =====
  const aiAdoptionRate = stats?.totalPages && stats?.totalPages > 0
    ? Math.round((safeAiStats.generatedPages / stats.totalPages) * 100)
    : 0;

  // ===== CALCULS =====
  const totalGenerations = safeAiStats.generatedPages + safeAiStats.generatedImages;
  const hasData = safeAiStats.generatedPages > 0 || 
                  safeAiStats.generatedImages > 0 ||
                  safeAiStats.dailyGenerations.length > 0 || 
                  safeAiStats.topCategories.length > 0 || 
                  (safeAiStats.topSites?.length ?? 0) > 0;

  // ===== RENDER =====
  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        minHeight: "100vh",
        backgroundColor: "#F4F7FE",
      }}
    >
      {/* ===== HEADER ===== */}
      <Box mb={4}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight={900} color="#1B2559">
              🤖 AI Analytics
            </Typography>
            <Typography color="text.secondary" mt={0.5}>
              AI content generation insights and trends from real data
            </Typography>
            {totalGenerations > 0 && (
              <Chip
                label={`${totalGenerations} total generations`}
                size="small"
                sx={{
                  mt: 1,
                  bgcolor: "rgba(0,196,154,0.12)",
                  color: "#00C49A",
                  fontWeight: 600,
                }}
              />
            )}
          </Box>

          {/* ===== DATE FILTER ===== */}
          <Stack direction="row" spacing={1}>
            <Button
              variant={days === 7 ? "contained" : "outlined"}
              size="small"
              onClick={() => setDays(7)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                ...(days === 7 && {
                  bgcolor: "#00C49A",
                  "&:hover": {
                    bgcolor: "#009E7C",
                  },
                }),
              }}
            >
              7 Days
            </Button>
            <Button
              variant={days === 30 ? "contained" : "outlined"}
              size="small"
              onClick={() => setDays(30)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                ...(days === 30 && {
                  bgcolor: "#00C49A",
                  "&:hover": {
                    bgcolor: "#009E7C",
                  },
                }),
              }}
            >
              30 Days
            </Button>
            <Button
              variant={days === 90 ? "contained" : "outlined"}
              size="small"
              onClick={() => setDays(90)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                ...(days === 90 && {
                  bgcolor: "#00C49A",
                  "&:hover": {
                    bgcolor: "#009E7C",
                  },
                }),
              }}
            >
              90 Days
            </Button>
            <Button
              variant={days === 365 ? "contained" : "outlined"}
              size="small"
              onClick={() => setDays(365)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                ...(days === 365 && {
                  bgcolor: "#00C49A",
                  "&:hover": {
                    bgcolor: "#009E7C",
                  },
                }),
              }}
            >
              All Time
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* ===== AI SUMMARY CARDS ===== */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              height: "100%",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
              },
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    AI Generated Pages
                  </Typography>
                  <Typography variant="h4" fontWeight={900} color="#1B2559" mt={0.5}>
                    {safeAiStats.generatedPages}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: 3,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(0,196,154,0.12)",
                    color: "#00C49A",
                  }}
                >
                  <AutoAwesome />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              height: "100%",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
              },
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    AI Generated Images
                  </Typography>
                  <Typography variant="h4" fontWeight={900} color="#1B2559" mt={0.5}>
                    {safeAiStats.generatedImages}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: 3,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(255,187,40,0.12)",
                    color: "#FFBB28",
                  }}
                >
                  <Image />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              height: "100%",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
              },
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Last Generation
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="#1B2559" mt={0.5}>
                    {timeAgo(safeAiStats.lastGenerationAt)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(safeAiStats.lastGenerationAt)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: 3,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(136,132,216,0.12)",
                    color: "#8884d8",
                  }}
                >
                  <Timeline />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              height: "100%",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
              },
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Top Category
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="#1B2559" mt={0.5}>
                    {safeAiStats.topCategories.length > 0 
                      ? safeAiStats.topCategories[0].category 
                      : "N/A"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {safeAiStats.topCategories.length > 0 
                      ? `${safeAiStats.topCategories[0].count} generations` 
                      : "No data"}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: 3,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(130,202,157,0.12)",
                    color: "#82ca9d",
                  }}
                >
                  <Category />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ===== CHARTS ===== */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <SectionCard title={`Daily Generations (Last ${days} Days)`}>
            <Box sx={{ height: 280, width: "100%" }}>
              {safeAiStats.dailyGenerations.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={safeAiStats.dailyGenerations}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => {
                        const d = new Date(date);
                        return d.toLocaleDateString([], { day: "numeric" });
                      }}
                      stroke="#9e9e9e"
                    />
                    <YAxis allowDecimals={false} stroke="#9e9e9e" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "none",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      }}
                      labelFormatter={(date) => {
                        const d = new Date(date);
                        return d.toLocaleDateString([], {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        });
                      }}
                    />
                    <Bar dataKey="count" fill="#00C49A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                  gap={1}
                >
                  <TrendingUp sx={{ fontSize: 40, color: "#e0e0e0" }} />
                  <Typography color="text.secondary">No data available</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Start generating AI content to see trends
                  </Typography>
                </Box>
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
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                      label={({ category, percent }) =>
                        `${category} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={{ stroke: "#9e9e9e", strokeWidth: 1 }}
                    >
                      {safeAiStats.topCategories.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "none",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value, name) => [
                        `${value} generations`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                  gap={1}
                >
                  <Category sx={{ fontSize: 40, color: "#e0e0e0" }} />
                  <Typography color="text.secondary">No data available</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Categories will appear when AI content is generated
                  </Typography>
                </Box>
              )}
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      {/* ===== TOP AI SITES & AI USAGE OVERVIEW ===== */}
      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} md={6}>
          <SectionCard
            title="Top AI Sites"
            action={
              <Chip
                label={`${safeAiStats.topSites?.length || 0} sites`}
                size="small"
                sx={{
                  bgcolor: "rgba(0,196,154,0.12)",
                  color: "#00C49A",
                  fontWeight: 600,
                }}
              />
            }
          >
            {safeAiStats.topSites && safeAiStats.topSites.length > 0 ? (
              <Stack spacing={2}>
                {safeAiStats.topSites.slice(0, 5).map((site, index) => {
                  const maxCount = safeAiStats.topSites?.[0]?.count || 1;
                  const percentage = (site.count / maxCount) * 100;

                  return (
                    <Box key={site.siteId}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 0.5 }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: index === 0 ? "#00C49A" : "text.primary",
                              minWidth: 24,
                            }}
                          >
                            #{index + 1}
                          </Typography>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 2,
                              bgcolor: index === 0 
                                ? "rgba(0,196,154,0.12)" 
                                : "rgba(0,0,0,0.04)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Public
                              sx={{
                                fontSize: 16,
                                color: index === 0 ? "#00C49A" : "#9e9e9e",
                              }}
                            />
                          </Box>
                          <Typography fontWeight={600} noWrap>
                            {site.siteName || `Site #${site.siteId}`}
                          </Typography>
                        </Stack>
                        <Typography fontWeight={700} color="#00C49A">
                          {site.count}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          bgcolor: "rgba(0,0,0,0.06)",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: index === 0 
                              ? "#00C49A" 
                              : index === 1 
                                ? "#FFBB28" 
                                : index === 2 
                                  ? "#FF8042" 
                                  : "#8884d8",
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                py={4}
                gap={1}
              >
                <Public sx={{ fontSize: 40, color: "#e0e0e0" }} />
                <Typography color="text.secondary" fontWeight={500}>
                  No AI sites yet
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sites will appear here when AI content is generated
                </Typography>
              </Box>
            )}
          </SectionCard>
        </Grid>

        {/* ===== AI USAGE OVERVIEW ===== */}
        <Grid item xs={12} md={6}>
          <SectionCard title="AI Usage Overview">
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    p: 2,
                    textAlign: "center",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  <Typography variant="h4" fontWeight={900} color="#00C49A">
                    {safeAiStats.generatedPages}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    AI Pages
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    p: 2,
                    textAlign: "center",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  <Typography variant="h4" fontWeight={900} color="#FFBB28">
                    {safeAiStats.generatedImages}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    AI Images
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    p: 2,
                    textAlign: "center",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  <Typography variant="h4" fontWeight={900} color="#8884d8">
                    {safeAiStats.topCategories.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Categories
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    p: 2,
                    textAlign: "center",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  <Typography variant="h4" fontWeight={900} color="#FF8042">
                    {safeAiStats.topSites?.length || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Active Sites
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    p: 2,
                    textAlign: "center",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  <Typography variant="h4" fontWeight={900} color="#2196F3">
                    {safeAiStats.generatedToday}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    AI Today
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    p: 2,
                    textAlign: "center",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  <Typography variant="h4" fontWeight={900} color="#9C27B0">
                    {safeAiStats.generatedThisWeek}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    AI This Week
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    p: 2,
                    textAlign: "center",
                    transition: "transform 0.2s",
                    bgcolor: "rgba(156,39,176,0.04)",
                    borderColor: "rgba(156,39,176,0.2)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  <Typography variant="h4" fontWeight={900} color="#9C27B0">
                    {aiAdoptionRate}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    AI Adoption
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    p: 2,
                    textAlign: "center",
                    visibility: "hidden",
                  }}
                >
                  <Typography variant="h4" fontWeight={900}>
                    -
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    -
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </SectionCard>
        </Grid>
      </Grid>

      {/* ===== LAST ACTIVE AI SITES ===== */}
      <Grid container spacing={3} mt={1}>
        <Grid item xs={12}>
          <SectionCard
            title="Last Active AI Sites"
            action={
              <Chip
                label={`${safeAiStats.lastActiveSites?.length || 0} sites`}
                size="small"
                sx={{
                  bgcolor: "rgba(136,132,216,0.12)",
                  color: "#8884d8",
                  fontWeight: 600,
                }}
              />
            }
          >
            {safeAiStats.lastActiveSites && safeAiStats.lastActiveSites.length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Site</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Generations</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Last Activity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {safeAiStats.lastActiveSites.slice(0, 10).map((row) => (
                    <TableRow key={row.siteId} hover>
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.siteName}
                          sx={{
                            bgcolor: "rgba(0,196,154,0.08)",
                            color: "#00C49A",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={`${row.count} generations`}
                          sx={{
                            bgcolor: "rgba(136,132,216,0.08)",
                            color: "#8884d8",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {row.lastActivityAt ? formatRelativeTime(row.lastActivityAt): "N/A"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                py={4}
                gap={1}
              >
                <AutoAwesome sx={{ fontSize: 40, color: "#e0e0e0" }} />
                <Typography color="text.secondary" fontWeight={500}>
                  No recent AI generations
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Recent AI content will appear here when generated
                </Typography>
              </Box>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      {/* ===== EMPTY STATE ===== */}
      {!hasData && (
        <Alert
          severity="info"
          sx={{
            mt: 3,
            borderRadius: 3,
            "& .MuiAlert-icon": {
              fontSize: 24,
            },
          }}
        >
          <Stack>
            <Typography fontWeight={600}>No AI generation data available yet</Typography>
            <Typography variant="body2">
              Start generating content with AI to see analytics here.
              Go to any site dashboard and use the AI content generator.
            </Typography>
          </Stack>
        </Alert>
      )}
    </Box>
  );
}