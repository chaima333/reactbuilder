// frontend/src/pages/Dashboard/components/AdminDashboard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
} from '@mui/material';
import {
  Web as SitesIcon,
  Edit as EditIcon,
  Visibility as ViewsIcon,
  People as UsersIcon,
} from '@mui/icons-material';
import { MonthlyChart } from './widgets/MonthlyChart';
import { ActivityFeed } from './widgets/ActivityFeed';
import { colors } from '../styles/colors';

interface AdminDashboardProps {
  stats: any;
  activities: any[];
  userName: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats, activities, userName }) => {
  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: colors.slate }}>
          Tableau de bord
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenue, {userName || 'ADMIN'}
        </Typography>
      </Box>

      {/* Cartes stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderTop: `4px solid ${colors.primary}`, boxShadow: 1 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: colors.primary }}>
                    {stats?.totalSites || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Sites</Typography>
                </Box>
                <SitesIcon sx={{ fontSize: 40, color: colors.primary, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderTop: `4px solid ${colors.success}`, boxShadow: 1 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: colors.success }}>
                    {stats?.totalPages || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Pages</Typography>
                </Box>
                <EditIcon sx={{ fontSize: 40, color: colors.success, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderTop: `4px solid ${colors.warning}`, boxShadow: 1 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: colors.warning }}>
                    {stats?.totalViews || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Vues</Typography>
                </Box>
                <ViewsIcon sx={{ fontSize: 40, color: colors.warning, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderTop: `4px solid ${colors.purple}`, boxShadow: 1 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: colors.purple }}>
                    {stats?.totalUsers || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Utilisateurs</Typography>
                </Box>
                <UsersIcon sx={{ fontSize: 40, color: colors.purple, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Graphique et Activité */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, boxShadow: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ color: colors.slate }}>
              Évolution des pages
            </Typography>
            <MonthlyChart data={stats?.monthlyStats || []} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, boxShadow: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ color: colors.slate }}>
              Activité récente
            </Typography>
            <ActivityFeed activities={activities} />
          </Paper>
        </Grid>
      </Grid>

      {/* Actions rapides */}
      <Paper sx={{ p: 3, mt: 4, boxShadow: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ color: colors.slate }}>
          Actions rapides
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          <Button variant="contained" component={Link} to="/users" sx={{ bgcolor: colors.primary }}>
            Utilisateurs
          </Button>
          <Button variant="outlined" component={Link} to="/settings" sx={{ borderColor: colors.secondary, color: colors.secondary }}>
            Paramètres
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};