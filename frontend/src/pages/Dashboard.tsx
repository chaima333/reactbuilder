import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Navigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Web as SitesIcon,
  Image as MediaIcon,
  TrendingUp as TrendingIcon,
  Visibility as ViewsIcon,
  Edit as EditIcon,
  RocketLaunch as LaunchIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as PendingIcon,
  Star as StarIcon,
  People as UsersIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

import {
  useGetDashboardStatsQuery,
  useGetActivityLogQuery,
  useGetSitesQuery,
} from '../redux/api/apiSlice';

import { StatsCards } from '../components/Dashboard/StatsCards';
import { ActivityFeed } from '../components/Dashboard/ActivityFeed';
import { MonthlyChart } from '../components/Dashboard/MonthlyChart';

// Palette de couleurs sobres et élégantes
const colors = {
  primary: '#3b82f6',      // Bleu
  secondary: '#64748b',     // Gris bleuté
  success: '#22c55e',       // Vert doux
  warning: '#f59e0b',       // Orange doux
  info: '#06b6d4',          // Cyan doux
  purple: '#8b5cf6',        // Violet doux
  slate: '#475569',         // Ardoise
};

export const Dashboard: React.FC = () => {
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  const userName = useSelector((state: RootState) => state.auth.user?.name);

  const { data: statsData, isLoading, error } = useGetDashboardStatsQuery(undefined);
  const { data: activityData } = useGetActivityLogQuery({ limit: 10 });
  const { data: sitesData, isLoading: sitesLoading } = useGetSitesQuery(undefined);

  const stats = statsData?.data;
  const totalSites = stats?.totalSites || 0;
  const sites = sitesData?.data || [];
  const recentSites = sites.slice(0, 3);

  if (isLoading || sitesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">Error loading dashboard</Typography>
      </Box>
    );
  }

  if (userRole === 'Editor' && totalSites === 0) {
    return <Navigate to="/sites" replace />;
  }

  // ===================== ADMIN DASHBOARD =====================
  if (userRole === 'Admin') {
    return (
      <Box>
        {/* En-tête */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: colors.slate }}>
            Tableau de bord
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bienvenue, {userName || 'Admin'}
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
              <ActivityFeed activities={activityData?.data?.activities || []} />
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
  }

  // ===================== EDITOR DASHBOARD =====================
  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: colors.slate }}>
          Bonjour, {userName || 'Créateur'} 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gérez vos sites et suivez leurs performances
        </Typography>
      </Box>

      {/* Cartes statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderTop: `4px solid ${colors.primary}`, boxShadow: 1 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: colors.primary }}>
                    {totalSites}
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
                    {stats?.completedTasks || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Tâches</Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: colors.purple, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Création rapide */}
      <Paper sx={{ p: 3, mb: 4, boxShadow: 1, bgcolor: '#f8fafc' }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h6" gutterBottom sx={{ color: colors.slate }}>
              Créer un nouveau site
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lancez votre prochain projet en quelques clics
            </Typography>
          </Grid>
          <Grid item>
            <Button variant="contained" component={Link} to="/sites" startIcon={<AddIcon />} sx={{ bgcolor: colors.primary }}>
              Nouveau site
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Sites récents */}
      {recentSites.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: colors.slate, mb: 2 }}>
            Vos sites récents
          </Typography>

          <Grid container spacing={3}>
            {recentSites.map((site: any) => (
              <Grid item xs={12} md={4} key={site.id}>
                <Card sx={{ boxShadow: 1, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                  <CardActionArea component={Link} to={`/sites/${site.id}/edit`}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{site.name}</Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {site.subdomain}.reactbuilder.com
                      </Typography>
                      <Box display="flex" gap={2} mt={2}>
                        <Chip size="small" label={`${site.pages?.length || 0} pages`} />
                        <Chip size="small" label={`${site.totalViews || 0} vues`} />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((site.pages?.length || 0) * 20, 100)}
                        sx={{ mt: 2, height: 4, borderRadius: 2 }}
                      />
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button component={Link} to="/sites" sx={{ color: colors.primary }}>
              Voir tous mes sites →
            </Button>
          </Box>
        </Box>
      )}

      {/* Conseils et Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, boxShadow: 1 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1} sx={{ color: colors.slate }}>
              <TrendingIcon sx={{ color: colors.warning }} /> Conseils
            </Typography>
            <List dense>
              <ListItem>
                <ListItemAvatar><Avatar sx={{ bgcolor: `${colors.primary}20`, color: colors.primary }}><LaunchIcon /></Avatar></ListItemAvatar>
                <ListItemText primary="Ajoutez des images" secondary="Attire 94% de vues en plus" />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemAvatar><Avatar sx={{ bgcolor: `${colors.success}20`, color: colors.success }}><EditIcon /></Avatar></ListItemAvatar>
                <ListItemText primary="Optimisez le SEO" secondary="Remplissez les meta descriptions" />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemAvatar><Avatar sx={{ bgcolor: `${colors.warning}20`, color: colors.warning }}><PendingIcon /></Avatar></ListItemAvatar>
                <ListItemText primary="Publiez régulièrement" secondary="Au moins 1 page par semaine" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, boxShadow: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ color: colors.slate }}>
              Prochaines étapes
            </Typography>
            <Box sx={{ mt: 2 }}>
              {totalSites === 0 ? (
                <Button fullWidth variant="outlined" component={Link} to="/sites" startIcon={<AddIcon />} sx={{ borderColor: colors.primary, color: colors.primary }}>
                  Créer votre premier site
                </Button>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button fullWidth variant="outlined" component={Link} to="/media" startIcon={<MediaIcon />} sx={{ borderColor: colors.info, color: colors.info }}>
                    Ajouter des médias
                  </Button>
                  <Button fullWidth variant="contained" component={Link} to={`/sites/${recentSites[0]?.id}/pages/new`} sx={{ bgcolor: colors.primary }}>
                    Ajouter une page
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;