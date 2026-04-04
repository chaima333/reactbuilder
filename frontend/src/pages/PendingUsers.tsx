import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useGetPendingUsersQuery, useApproveUserMutation, useRejectUserMutation } from '../redux/api/apiSlice';

export const PendingUsers: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { data, isLoading, refetch } = useGetPendingUsersQuery(undefined);
  const [approveUser] = useApproveUserMutation();
  const [rejectUser] = useRejectUserMutation();
  
  const pendingUsers = data?.data || [];

  const handleApprove = async (id: number, name: string) => {
    try {
      await approveUser(id).unwrap();
      enqueueSnackbar(`Utilisateur "${name}" approuvé`, { variant: 'success' });
      refetch();
    } catch (error) {
      console.error('Approve error:', error);
      enqueueSnackbar('Erreur lors de l\'approbation', { variant: 'error' });
    }
  };

  const handleReject = async (id: number, name: string) => {
    if (window.confirm(`Refuser l'utilisateur "${name}" ?`)) {
      try {
        await rejectUser(id).unwrap();
        enqueueSnackbar(`Utilisateur "${name}" refusé`, { variant: 'success' });
        refetch();
      } catch (error) {
        console.error('Reject error:', error);
        enqueueSnackbar('Erreur lors du refus', { variant: 'error' });
      }
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Approbation des utilisateurs</Typography>
      
      {pendingUsers.length === 0 ? (
        <Alert severity="info">Aucun utilisateur en attente d'approbation</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rôle demandé</TableCell>
                <TableCell>Date d'inscription</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingUsers.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      size="small" 
                      color={user.role === 'Admin' ? 'error' : user.role === 'Editor' ? 'warning' : 'info'}
                    />
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => handleApprove(user.id, user.name)}
                      sx={{ mr: 1 }}
                    >
                      Approuver
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => handleReject(user.id, user.name)}
                    >
                      Refuser
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default PendingUsers;