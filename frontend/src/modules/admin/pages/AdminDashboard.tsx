import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Alert,
} from "@mui/material";

import {
  People,
  Language,
  Article,
  Extension,
  Publish,
  CheckCircle,
  PendingActions,
  Timeline,
} from "@mui/icons-material";

import {
  useApproveUserMutation,
  useGetAdminActivityLogsQuery,
  useGetAdminPluginsQuery,
  useGetAdminSitesQuery,
  useGetAdminUsersQuery,
  useGetPendingUsersQuery,
  useRejectUserMutation,
  useGetAdminStatsQuery,
} from "../../../redux/services/admin.api";

import React from "react";

// ==================== COMPONENTS ====================
const StatCard = ({
  title,
  value,
  icon,
  highlight = false,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  highlight?: boolean;
}) => (
  <Card
    sx={{
      height: "100%",
      borderRadius: 4,
      background: highlight
        ? "linear-gradient(135deg, #00C49A 0%, #009E7C 100%)"
        : "background.paper",
      color: highlight ? "#fff" : "text.primary",
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      border: highlight ? "none" : "1px solid rgba(0,0,0,0.06)",
    }}
  >
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography
            variant="body2"
            sx={{
              opacity: 0.75,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            {title}
          </Typography>

          <Typography variant="h4" fontWeight={900} mt={1}>
            {value}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: 3,
            display: "grid",
            placeItems: "center",
            bgcolor: highlight
              ? "rgba(255,255,255,0.18)"
              : "rgba(0,196,154,0.12)",
            color: highlight ? "#fff" : "primary.main",
          }}
        >
          {icon}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

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
export default function AdminDashboard() {
  // ===== HOOKS =====
  const { data: stats, isLoading: statsLoading, isError: statsError } = useGetAdminStatsQuery(30);
  const { data: users = [] } = useGetAdminUsersQuery();
  const { data: sites = [] } = useGetAdminSitesQuery();
  const { data: plugins = [] } = useGetAdminPluginsQuery();
  const { data: logs = [] } = useGetAdminActivityLogsQuery();
  const { data: pendingUsers = [] } = useGetPendingUsersQuery();

  const [approveUser] = useApproveUserMutation();
  const [rejectUser] = useRejectUserMutation();

  // ===== HELPERS =====
  const timeAgo = (dateString: string | null) => {
    if (!dateString) return "No activity";

    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  // ===== ACTION MAPPER =====
  const actionMap: Record<string, string> = {
    ai_page_generated: "AI Page Generated",
    media_ai_uploaded: "AI Image Generated",
    page_updated: "Page Updated",
    page_published: "Page Published",
    page_deleted: "Page Deleted",
    site_created: "Site Created",
    user_registered: "User Registered",
    user_approved: "User Approved",
    plugin_installed: "Plugin Installed",
  };

  const colorMap: Record<string, string> = {
    ai_page_generated: "#00C49A",
    media_ai_uploaded: "#FFBB28",
    page_updated: "#8884d8",
    page_published: "#4CAF50",
    site_created: "#2196F3",
    user_registered: "#FF8042",
    user_approved: "#4CAF50",
    plugin_installed: "#9C27B0",
  };

  // ===== EARLY RETURNS =====
  if (statsLoading) {
    return (
      <Box
        minHeight="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (statsError) {
    return (
      <Box
        minHeight="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          Failed to load dashboard data. Please try again later.
        </Alert>
      </Box>
    );
  }

  // ===== RENDER =====
  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        minHeight: "100vh",
      }}
    >
      {/* ===== HEADER ===== */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={900}>
          Super Admin Dashboard
        </Typography>

        <Typography color="text.secondary" mt={1}>
          Platform overview, users, sites, plugins and activity monitoring.
        </Typography>
      </Box>

      {/* ===== STATS CARDS ===== */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Users"
            value={stats?.totalUsers ?? 0}
            icon={<People />}
            highlight
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Sites"
            value={stats?.totalSites ?? 0}
            icon={<Language />}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Pages"
            value={stats?.totalPages ?? 0}
            icon={<Article />}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Plugins"
            value={stats?.totalPlugins ?? 0}
            icon={<Extension />}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Published Pages"
            value={stats?.publishedPages ?? 0}
            icon={<Publish />}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Active Sites"
            value={stats?.activeSites ?? 0}
            icon={<CheckCircle />}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Pending Users"
            value={stats?.pendingUsers ?? 0}
            icon={<PendingActions />}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Activity Logs"
            value={stats?.totalActivityLogs ?? 0}
            icon={<Timeline />}
          />
        </Grid>
      </Grid>

      {/* ===== PENDING USERS & ACTIVITY ===== */}
      <Grid container spacing={3} mt={3}>
        <Grid item xs={12} lg={5}>
          <SectionCard title="Pending Users Approval">
            {pendingUsers.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                ✅ No pending users.
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {pendingUsers.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                        >
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => approveUser(user.id)}
                          >
                            Approve
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => rejectUser(user.id)}
                          >
                            Reject
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={7}>
          <SectionCard title="Recent Activity">
            <Stack spacing={1.5}>
              {logs.slice(0, 6).map((log: any) => {
                const actionLabel = actionMap[log.action] || log.action;
                const color = colorMap[log.action] || "#9e9e9e";

                return (
                  <Box key={log.id}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography fontWeight={700} sx={{ color }}>
                          {actionLabel}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {log.entityType} #{log.entityId ?? "-"}
                        </Typography>
                      </Box>

                      <Typography variant="caption" color="text.secondary">
                        {timeAgo(log.createdAt)}
                      </Typography>
                    </Stack>
                    <Divider sx={{ mt: 1.5 }} />
                  </Box>
                );
              })}
            </Stack>
          </SectionCard>
        </Grid>

        {/* ===== LATEST USERS ===== */}
        <Grid item xs={12} md={6}>
          <SectionCard title="Latest Users">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {users.slice(0, 5).map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={user.role}
                        color={user.role === "ADMIN" ? "success" : "default"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </Grid>

        {/* ===== LATEST SITES ===== */}
        <Grid item xs={12} md={6}>
          <SectionCard title="Latest Sites">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Subdomain</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {sites.slice(0, 5).map((site: any) => (
                  <TableRow key={site.id}>
                    <TableCell>{site.name}</TableCell>
                    <TableCell>{site.subdomain}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={site.status}
                        color={site.status === "active" ? "success" : "default"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </Grid>

        {/* ===== PLUGINS ===== */}
        <Grid item xs={12}>
          <SectionCard title="Registered Plugins">
            <Grid container spacing={2}>
              {plugins.map((plugin: any) => (
                <Grid item xs={12} md={4} key={plugin.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 3,
                      height: "100%",
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontWeight={800}>{plugin.name}</Typography>

                        <Chip
                          size="small"
                          label={plugin.isActive ? "Active" : "Disabled"}
                          color={plugin.isActive ? "success" : "default"}
                        />
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={1}
                      >
                        {plugin.description || "No description"}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        Key: {plugin.slug}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
