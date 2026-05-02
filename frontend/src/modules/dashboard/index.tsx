// frontend/src/pages/Dashboard/index.tsx

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Box, CircularProgress, Grid, Typography, Container } from '@mui/material';
import { useDashboardLayout } from '../dashboard/hooks/useDashboardLayout';

// استيراد الـ Widgets (لازم تصنعهم أو تعوضهم بـ Components عندك)
// import SeoWidget from '../../components/widgets/SeoWidget';
// import StatsWidget from '../../components/widgets/StatsWidget';

export const Dashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { stats, activity, layout, plugins, loading, error } = useDashboardLayout();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error" align="center">⚠️ Erreur: {error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold">
          Bienvenue, {user?.name || 'Utilisateur'} 👋
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Voici ce qui se passe sur votre plateforme (Role: {user?.role})
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* 1. الـ Stats ديما الفوق (Core Widget) */}
        <Grid item xs={12}>
            {/* <StatsWidget stats={stats} /> */}
            <Box p={2} bgcolor="#f5f5f5" border="1px dashed #ccc">Stats Placeholder (Total Sites: {stats?.totalSites})</Box>
        </Grid>

        {/* 2. 🔥 الـ Dynamic Layout Rendering */}
        {/* هوني الـ Dashboard يبني روحو حسب الـ Plugins اللي مفعّلة */}
        {layout?.blocks?.map((block: any) => (
          <Grid item xs={12} md={block.col || 6} key={block.id}>
            <Box p={2} sx={{ border: '1px solid #eee', borderRadius: 2, bgcolor: 'white', height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ textTransform: 'uppercase', fontSize: '0.8rem', color: 'gray' }}>
                Plugin: {block.id}
              </Typography>
              
              {/* اختيار الـ Widget المناسب حسب الـ Type اللي جاي مالـ Meta */}
              {block.type === 'seo-stats' && (
                <Typography>SEO Widget: Score {plugins?.['seo-plugin']?.averageScore}%</Typography>
              )}
              
              {block.type === 'version-list' && (
                <Typography>Version History: {plugins?.['version-plugin']?.count || 0} versions</Typography>
              )}
            </Box>
          </Grid>
        ))}

        {/* 3. الـ Activity Feed */}
        <Grid item xs={12} md={4}>
           <Box p={2} bgcolor="white" boxShadow={1}>
             <Typography variant="h6">Activité Récente</Typography>
             {activity?.map((log: any) => (
               <Typography key={log.id} variant="body2" sx={{ my: 1 }}>
                 {log.action} par {log.user?.name}
               </Typography>
             ))}
           </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;