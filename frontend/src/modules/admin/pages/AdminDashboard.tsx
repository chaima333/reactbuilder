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
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: 4,
      boxShadow: "0 10px 30px rgba(0,0,0,0.07)",
      border: "1px solid rgba(0,0,0,0.06)",
    }}
  >
    <Typography variant="h6" fontWeight={800} mb={2}>
      {title}
    </Typography>
    {children}
  </Paper>
);

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStatsQuery();
  const { data: users = [] } = useGetAdminUsersQuery();
  const { data: sites = [] } = useGetAdminSitesQuery();
  const { data: plugins = [] } = useGetAdminPluginsQuery();
  const { data: logs = [] } = useGetAdminActivityLogsQuery();
  const { data: pendingUsers = [] } = useGetPendingUsersQuery();

  const [approveUser] = useApproveUserMutation();
  const [rejectUser] = useRejectUserMutation();

  if (isLoading) {
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

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        minHeight: "100vh",
      }}
    >
      <Box mb={4}>
        <Typography variant="h4" fontWeight={900}>
          Super Admin Dashboard
        </Typography>

        <Typography color="text.secondary" mt={1}>
          Platform overview, users, sites, plugins and activity monitoring.
        </Typography>
      </Box>

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

      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} lg={5}>
          <SectionCard title="Pending Users Approval">
            {pendingUsers.length === 0 ? (
              <Typography color="text.secondary">
                No pending users.
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
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
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
              {logs.slice(0, 6).map((log: any) => (
                <Box key={log.id}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography fontWeight={700}>
                        {log.action}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {log.entityType} #{log.entityId ?? "-"}
                      </Typography>
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      {new Date(log.createdAt).toLocaleString()}
                    </Typography>
                  </Stack>
                  <Divider sx={{ mt: 1.5 }} />
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={6}>
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
                {users.slice(0, 6).map((user: any) => (
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

        <Grid item xs={12} lg={6}>
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
                {sites.slice(0, 6).map((site: any) => (
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
                        <Typography fontWeight={800}>
                          {plugin.name}
                        </Typography>

                        <Chip
                          size="small"
                          label={plugin.isActive ? "Active" : "Disabled"}
                          color={plugin.isActive ? "success" : "default"}
                        />
                      </Stack>

                      <Typography variant="body2" color="text.secondary" mt={1}>
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