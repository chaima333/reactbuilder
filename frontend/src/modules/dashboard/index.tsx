// frontend/src/pages/Dashboard/index.tsx

import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../../redux/store';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useDashboardData } from './hooks/useDashboardData';
import { AdminDashboard } from './components/AdminDashboard';
import { EditorDashboard } from './components/EditorDashboard';

export const Dashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.role;

  const { stats, activities, sites, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">Erreur de chargement du tableau de bord</Typography>
      </Box>
    );
  }

  // Editor sans site → redirection vers création
  if (userRole === 'Editor' && (stats?.totalSites || 0) === 0) {
    return <Navigate to="/sites" replace />;
  }

  switch (userRole) {
    case 'ADMIN':
      return <AdminDashboard stats={stats} activities={activities} userName={user?.name || 'ADMIN'} />;
    case 'Editor':
      return <EditorDashboard stats={stats} sites={sites} userName={user?.name || 'EDITOR'} />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default Dashboard;