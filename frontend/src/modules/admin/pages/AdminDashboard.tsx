import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Stack,
} from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

import {
  useApproveUserMutation,
  useGetAdminActivityLogsQuery,
  useGetAdminPluginsQuery,
  useGetAdminSitesQuery,
  useGetAdminUsersQuery,
  useGetPendingUsersQuery,
  useRejectUserMutation,
} from "../../../redux/services/admin.api";
import {
  useGetAdminStatsQuery,
} from "../../../redux/services/admin.api";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStatsQuery();
  const { data: users = [] } = useGetAdminUsersQuery();
  const { data: sites = [] } = useGetAdminSitesQuery();
  const { data: plugins = [] } = useGetAdminPluginsQuery();
  const { data: logs = [] } = useGetAdminActivityLogsQuery();
const { data: pendingUsers = [] } = useGetPendingUsersQuery();
const [approveUser] = useApproveUserMutation();
const [rejectUser] =useRejectUserMutation();


  if (isLoading) {
    return (
      <Box p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight={700} mb={4}>
        Super Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
         <Grid item xs={12} md={3}>
            <Card>
            <CardContent>
              <Typography color="text.secondary">
                Total Users
              </Typography>

              <Typography variant="h4">
                {stats?.totalUsers ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">
                Total Sites
              </Typography>

              <Typography variant="h4">
                {stats?.totalSites ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">
                Total Pages
              </Typography>

              <Typography variant="h4">
                {stats?.totalPages ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">
                Plugins
              </Typography>

              <Typography variant="h4">
                {stats?.totalPlugins ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">
                Published Pages
              </Typography>

              <Typography variant="h4">
                {stats?.publishedPages ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">
                Active Sites
              </Typography>

              <Typography variant="h4">
                {stats?.activeSites ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">
                Pending Users
              </Typography>

              <Typography variant="h4">
                {stats?.pendingUsers ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">
                Activity Logs
              </Typography>

              <Typography variant="h4">
                {stats?.totalActivityLogs ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Box mt={5}>
  <Typography variant="h5" mb={2}>
    Pending Users Approval
  </Typography>

  <Paper>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {pendingUsers.map((user: any) => (
          <TableRow key={user.id}>
            <TableCell>{user.id}</TableCell>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>

            <TableCell>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() =>
                    approveUser(user.id)
                  }
                >
                  Approve
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  onClick={() =>
                    rejectUser(user.id)
                  }
                >
                  Reject
                </Button>
              </Stack>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>
</Box>
      </Grid>
      <Box mt={5}>
  <Typography variant="h5" mb={2}>
    Users
  </Typography>

  <Paper>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Role</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {users.map((user: any) => (
          <TableRow key={user.id}>
            <TableCell>{user.id}</TableCell>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>
</Box>
<Box mt={5}>
  <Typography variant="h5" mb={2}>
    Sites
  </Typography>

  <Paper>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Subdomain</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {sites.map((site: any) => (
          <TableRow key={site.id}>
            <TableCell>{site.id}</TableCell>
            <TableCell>{site.name}</TableCell>
            <TableCell>{site.subdomain}</TableCell>
            <TableCell>{site.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>
</Box>


<Box mt={5}>
  <Typography variant="h5" mb={2}>
    Plugins
  </Typography>

  <Paper>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Key</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {plugins.map((plugin: any) => (
          <TableRow key={plugin.id}>
            <TableCell>{plugin.id}</TableCell>
            <TableCell>{plugin.name}</TableCell>
            <TableCell>{plugin.slug}</TableCell>
            <TableCell>
              {plugin.isActive ? "Active" : "Disabled"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>
</Box>



<Box mt={5}>
  <Typography variant="h5" mb={2}>
    Recent Activity
  </Typography>

  <Paper>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Action</TableCell>
          <TableCell>Entity</TableCell>
          <TableCell>Date</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {logs.slice(0, 20).map((log: any) => (
          <TableRow key={log.id}>
            <TableCell>{log.id}</TableCell>
            <TableCell>{log.action}</TableCell>
            <TableCell>{log.entityType}</TableCell>
            <TableCell>
              {new Date(log.createdAt).toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>
</Box>
    </Box>
    
  );
}