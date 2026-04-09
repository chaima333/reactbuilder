import React, { useEffect, useState } from 'react';
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
import { useSnackbar } from 'notistack';

export const PendingUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  // Charger les utilisateurs au montage du composant
  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      console.log('🔍 Token:', token);
      
      const response = await fetch('https://backend-rmfq.onrender.com/api/admin/pending-users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      console.log('📋 API Response:', result);
      
      if (result.success) {
        setUsers(result.data || []);
      } else {
        setError(result.message || 'Erreur de chargement');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError('Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`https://backend-rmfq.onrender.com/api/admin/approve-user/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      if (result.success) {
        enqueueSnackbar('Utilisateur approuvé avec succès!', { variant: 'success' });
        loadPendingUsers(); // Recharger la liste
      } else {
        enqueueSnackbar(result.message || 'Erreur', { variant: 'error' });
      }
    } catch (err) {
      enqueueSnackbar('Erreur lors de l\'approbation', { variant: 'error' });
    }
  };

  const handleReject = async (userId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`https://backend-rmfq.onrender.com/api/admin/reject-user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      if (result.success) {
        enqueueSnackbar('Utilisateur rejeté', { variant: 'success' });
        loadPendingUsers(); // Recharger la liste
      } else {
        enqueueSnackbar(result.message || 'Erreur', { variant: 'error' });
      }
    } catch (err) {
      enqueueSnackbar('Erreur lors du rejet', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} onClick={loadPendingUsers}>Réessayer</Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Utilisateurs en attente d'approbation
      </Typography>
      
      {users.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Aucun utilisateur en attente d'approbation
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Nom</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Rôle</strong></TableCell>
                <TableCell><strong>Date d'inscription</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user: any) => (
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
                      sx={{ mr: 1 }}
                    >
                      Approuver
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleReject(user.id)}
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