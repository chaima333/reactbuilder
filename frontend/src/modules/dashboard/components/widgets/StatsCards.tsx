import React from 'react';
import { Grid, Paper, Typography, Box, Skeleton } from '@mui/material';
import {
  Web as SitesIcon,
  Description as PagesIcon,
  Visibility as ViewsIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { useLanguage } from '../../../../app/providers/LanguageProvider';
interface StatsCardsProps {
  stats?: {
    totalSites?: number;
    totalPages?: number;
    totalViews?: number;
    performance?: {
      avgLoadTime?: number;
      uptime?: number;
      storageUsed?: string;
    };
  };
  isLoading?: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, isLoading }) => {
  const { t } = useLanguage();

  const cards = [
    {
      title: t.totalSites,
      value: stats?.totalSites || 0,
      icon: <SitesIcon sx={{ fontSize: 40, color: '#6366f1' }} />,
      color: '#6366f1',
    },
    {
      title: t.totalPages,
      value: stats?.totalPages || 0,
      icon: <PagesIcon sx={{ fontSize: 40, color: '#ec489a' }} />,
      color: '#ec489a',
    },
    {
      title: t.totalViews,
      value: stats?.totalViews || 0,
      icon: <ViewsIcon sx={{ fontSize: 40, color: '#10b981' }} />,
      color: '#10b981',
    },
    {
      title: t.storage,
      value: stats?.performance?.storageUsed || '0 MB',
      icon: <StorageIcon sx={{ fontSize: 40, color: '#f59e0b' }} />,
      color: '#f59e0b',
    },
  ];

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Paper sx={{ p: 3 }}>
              <Skeleton variant="rectangular" height={60} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} md={3} key={card.title}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              },
            }}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {card.title}
              </Typography>
            </Box>
            <Box>{card.icon}</Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards;