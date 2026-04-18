// frontend/src/pages/Dashboard/components/EditorDashboard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Paper,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Web as SitesIcon,
  Edit as EditIcon,
  Visibility as ViewsIcon,
  Image as MediaIcon,
  TrendingUp as TrendingIcon,
  RocketLaunch as LaunchIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as PendingIcon,
} from '@mui/icons-material';
import { colors } from '../styles/colors';

interface EditorDashboardProps {
  stats: any;
  sites: any[];
  userName: string;
}

export const EditorDashboard: React.FC<EditorDashboardProps> = ({ stats, sites, userName }) => {
  const totalSites = stats?.totalSites || 0;
  const recentSites = sites.slice(0, 3);

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