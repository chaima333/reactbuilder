// frontend/src/pages/PendingUsers.tsx
import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useGetPendingUsersQuery, useApproveUserMutation, useRejectUserMutation } from '../redux/api/apiSlice';
import { useSnackbar } from 'notistack';

export const PendingUsers: React.FC = () => {
  const { data, isLoading, error, refetch } = useGetPendingUsersQuery(undefined);
  const [approveUser, { isLoading: isApproving }] = useApproveUserMutation();
  const [rejectUser, { isLoading: isRejecting }] = useRejectUserMutation();
  const { enqueueSnackbar } = useSnackbar();

  const pendingUsers = data?.data || [];

  console.log('🔍 PendingUsers data:', data);
  console.log('🔍 PendingUsers list:', pendingUsers);

  const handleApprove = async (userId: number) => {
    try {
      await approveUser(userId).unwrap();
      enqueueSnackbar('Utilisateur approuvé avec succès!', { variant: 'success' });
      refetch();
    } catch (err: any) {
      enqueueSnackbar(err?.data?.message || 'Erreur lors de l\'approbation', { variant: 'error' });
    }
  };

  const handleReject = async (userId: number) => {
    try {
      await rejectUser(userId).unwrap();
      enqueueSnackbar('Utilisateur rejeté', { variant: 'success' });
      refetch();
    } catch (err: any) {
      enqueueSnackbar(err?.data?.message || 'Erreur lors du rejet', { variant: 'error' });
    }
  };

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
        <Alert severity="error">Erreur lors du chargement des utilisateurs en attente</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Utilisateurs en attente d'approbation
      </Typography>
      
      {pendingUsers.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Aucun utilisateur en attente d'approbation
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Date d'inscription</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingUsers.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => handleApprove(user.id)}
                      disabled={isApproving}
                      sx={{ mr: 1 }}
                    >
                      Approuver
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleReject(user.id)}
                      disabled={isRejecting}
                    >
                      Rejeter
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