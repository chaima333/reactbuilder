import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  CircularProgress, 
  Divider, 
  Card, 
  CardContent, 
  CardMedia,
  CardActionArea
} from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  useGetDashboardStatsQuery, 
  useGetActivityLogQuery 
} from '../redux/api/apiSlice';
import { StatsCards } from '../components/Dashboard/StatsCards';
import { ActivityFeed } from '../components/Dashboard/ActivityFeed';
import { MonthlyChart } from '../components/Dashboard/MonthlyChart';
import { 
  Add as AddIcon, 
  Explore as ExploreIcon, 
  AutoAwesome as MagicIcon,
  Collections as TemplateIcon 
} from '@mui/icons-material';

export const Dashboard: React.FC = () => {
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  
  const { 
    data: statsData, 
    isLoading: statsLoading, 
    error: statsError 
  } = useGetDashboardStatsQuery(undefined);
  
  const { data: activityData } = useGetActivityLogQuery({ limit: 10 });

  if (statsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (statsError) {
    return (
      <Box p={3} textAlign="center">
        <Typography color="error">Erreur lors du chargement des données en temps réel.</Typography>
        <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>Réessayer</Button>
      </Box>
    );
  }

  // 👑 VUE ADMIN : Gestion totale et statistiques globales
  if (userRole === 'Admin') {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>Console Administrateur</Typography>
        <StatsCards stats={statsData?.data} isLoading={statsLoading} />
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Évolution de la plateforme</Typography>
              <MonthlyChart data={statsData?.data?.monthlyStats || []} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 2, maxHeight: 500, overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>Flux d'activité général</Typography>
              <ActivityFeed activities={activityData?.data?.activities || []} />
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, p: 3, bgcolor: '#fff4e5', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body1">Il y a des utilisateurs en attente d'approbation.</Typography>
          <Button variant="contained" color="warning" component={Link} to="/admin/users">
            Gérer les utilisateurs
          </Button>
        </Box>
      </Box>
    );
  }

  // ✍️ VUE EDITOR : Focus sur la création et la performance des sites
  if (userRole === 'Editor') {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight="bold">Mon Espace Créateur</Typography>
          <Button variant="contained" startIcon={<AddIcon />} component={Link} to="/sites">
            Nouveau Site
          </Button>
        </Box>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center', borderTop: '4px solid #6366f1' }}>
              <Typography variant="h3" fontWeight="bold">{statsData?.data?.totalSites || 0}</Typography>
              <Typography color="text.secondary">Mes Projets</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center', borderTop: '4px solid #10b981' }}>
              <Typography variant="h3" fontWeight="bold">{statsData?.data?.totalPages || 0}</Typography>
              <Typography color="text.secondary">Pages Publiées</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center', borderTop: '4px solid #f59e0b' }}>
              <Typography variant="h3" fontWeight="bold">{statsData?.data?.totalViews || 0}</Typography>
              <Typography color="text.secondary">Vues cumulées</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>Actions rapides</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth variant="outlined" startIcon={<MagicIcon />} sx={{ py: 2 }}>Générer avec IA</Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth variant="outlined" startIcon={<TemplateIcon />} component={Link} to="/media">Médiathèque</Button>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // 👀 VUE VIEWVER : Exploration et incitation à la création
  return (
    <Box>
      {/* Header Héro */}
      <Paper 
        sx={{ 
          p: { xs: 4, md: 6 }, 
          textAlign: 'center', 
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
          color: 'white',
          borderRadius: 4,
          mb: 5
        }}
      >
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Prêt à lancer votre projet ?
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
          Explorez les possibilités ou commencez à créer votre propre site dès maintenant.
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          startIcon={<AddIcon />}
          component={Link} 
          to="/sites"
          sx={{ 
            bgcolor: 'white', 
            color: '#6366f1', 
            fontWeight: 'bold',
            '&:hover': { bgcolor: '#f8faff' },
            px: 4,
            py: 1.5,
            borderRadius: 3
          }}
        >
          Créer mon premier site
        </Button>
      </Paper>

      <Grid container spacing={4}>
        {/* Section Templates */}
        <Grid item xs={12} md={8}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight="bold">Modèles populaires</Typography>
            <Button color="primary">Voir tout</Button>
          </Box>
          <Grid container spacing={2}>
            {[
              { t: 'Portfolio Pro', i: '🎨' },
              { t: 'Blog Moderne', i: '✍️' },
              { t: 'Landing Page', i: '🚀' },
              { t: 'CV Interactif', i: '📄' }
            ].map((item) => (
              <Grid item xs={12} sm={6} key={item.t}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardActionArea sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <Typography variant="h3" sx={{ mr: 2 }}>{item.i}</Typography>
                    <Box>
                      <Typography fontWeight="bold">{item.t}</Typography>
                      <Typography variant="caption" color="text.secondary">Utilisé par +1k créateurs</Typography>
                    </Box>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Section Sidebar Aide/Tendances */}
        <Grid item xs={12} md={4}>
          <Typography variant="h5" fontWeight="bold" mb={2}>Tendances 🔥</Typography>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Inspiration du jour</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Découvrez comment "EcoShop" a augmenté son trafic de 40% avec nos outils SEO.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" flexDirection="column" gap={1}>
              <Button fullWidth startIcon={<ExploreIcon />} sx={{ justifyContent: 'flex-start' }}>
                Explorer les sites publics
              </Button>
              <Button fullWidth startIcon={<TemplateIcon />} sx={{ justifyContent: 'flex-start' }}>
                Bibliothèque de composants
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;