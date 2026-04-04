import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Grid, Paper, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { StatsCards } from '../components/Dashboard/StatsCards';
import { ActivityFeed } from '../components/Dashboard/ActivityFeed';
import { MonthlyChart } from '../components/Dashboard/MonthlyChart';
import { useGetDashboardStatsQuery, useGetActivityLogQuery } from '../redux/api/apiSlice';

export const Dashboard: React.FC = () => {
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  const { data: statsData, isLoading: statsLoading } = useGetDashboardStatsQuery(undefined);
  const { data: activityData } = useGetActivityLogQuery({ limit: 10 });

  // 👑 ADMIN : voit tout
  if (userRole === 'Admin') {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>Tableau de bord Admin</Typography>
        <StatsCards stats={statsData?.data} isLoading={statsLoading} />
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Évolution des pages</Typography>
              <MonthlyChart data={statsData?.data?.monthlyStats || []} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Activité récente</Typography>
              <ActivityFeed activities={activityData?.data?.activities || []} />
            </Paper>
          </Grid>
        </Grid>
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" component={Link} to="/pending-users">
            Voir les utilisateurs en attente
          </Button>
        </Box>
      </Box>
    );
  }

  // ✍️ EDITOR : voit ses sites uniquement
  if (userRole === 'Editor') {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>Tableau de bord Éditeur</Typography>
        
        {/* Stats personnelles */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3">{statsData?.data?.totalSites || 0}</Typography>
              <Typography>Mes sites</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3">{statsData?.data?.totalPages || 0}</Typography>
              <Typography>Mes pages</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3">{statsData?.data?.totalViews || 0}</Typography>
              <Typography>Vues totales</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Actions rapides */}
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" component={Link} to="/sites" sx={{ mr: 2 }}>
            ➕ Créer un site
          </Button>
          <Button variant="outlined" component={Link} to="/media">
            📷 Médiathèque
          </Button>
        </Box>
      </Box>
    );
  }

  // 👀 VIEWER : message simple
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h4" gutterBottom>Bienvenue 👋</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Vous pouvez consulter les sites publics.
      </Typography>
      <Button variant="contained" component={Link} to="/s/monsite">
        Voir un site public
      </Button>
    </Box>
  );
};