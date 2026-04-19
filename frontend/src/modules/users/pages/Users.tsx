import React, { useState, useEffect } from 'react';
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
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  EditNote as EditorIcon,
  Visibility as ViewerIcon,
  CheckCircle as CheckIcon,
  DoDisturbOn as RejectIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
  useChangeUserRoleMutation,
} from '../../../redux/services/users.api';

const roleColors = {
  Admin: 'error',
  Editor: 'warning',
  Viewer: 'info',
};

const roleIcons = {
  Admin: <AdminIcon fontSize="small" />,
  Editor: <EditorIcon fontSize="small" />,
  Viewer: <ViewerIcon fontSize="small" />,
};

export const Users: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Viewer',
  });

  // RTK Query hooks
  const { data, isLoading, refetch } = useGetUsersQuery(undefined);
  const [deleteUser] = useDeleteUserMutation();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [changeRole] = useChangeUserRoleMutation();

  const users = data?.data || [];

  // --- API CALLS MANUELS (PENDING USERS) ---
  
  const fetchPendingUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('https://backend-rmfq.onrender.com/api/admin/pending-users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setPendingUsers(result.data || []);
      }
    } catch (err) {
      console.error('Erreur chargement pending users:', err);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`https://backend-rmfq.onrender.com/api/admin/approve-user/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        enqueueSnackbar('Utilisateur approuvé avec succès!', { variant: 'success' });
        fetchPendingUsers();
        refetch();
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
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        enqueueSnackbar('Utilisateur refusé et supprimé', { variant: 'success' });
        fetchPendingUsers();
      } else {
        enqueueSnackbar(result.message || 'Erreur', { variant: 'error' });
      }
    } catch (err) {
      enqueueSnackbar('Erreur lors du refus', { variant: 'error' });
    }
  };

  // --- GESTION DES DIALOGUES ET ACTIONS CLASSIQUES ---

  const handleOpenDialog = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'Viewer' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await updateUser({ id: editingUser.id, ...formData }).unwrap();
        enqueueSnackbar('Utilisateur mis à jour', { variant: 'success' });
      } else {
        await createUser(formData).unwrap();
        enqueueSnackbar('Utilisateur créé', { variant: 'success' });
      }
      handleCloseDialog();
      refetch();
    } catch (error: any) {
      enqueueSnackbar(error?.data?.message || 'Erreur', { variant: 'error' });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Supprimer définitivement l'utilisateur "${name}" ?`)) {
      try {
        await deleteUser(id).unwrap();
        enqueueSnackbar('Utilisateur supprimé', { variant: 'success' });
        refetch();
        fetchPendingUsers();
      } catch (error) {
        enqueueSnackbar('Erreur lors de la suppression', { variant: 'error' });
      }
    }
  };

  const handleChangeRole = async (id: number, currentRole: string) => {
    const roles = ['Admin', 'Editor', 'Viewer'];
    const currentIndex = roles.indexOf(currentRole);
    const nextRole = roles[(currentIndex + 1) % roles.length];
    
    try {
      await changeRole({ id, role: nextRole }).unwrap();
      enqueueSnackbar(`Rôle changé en ${nextRole}`, { variant: 'success' });
      refetch();
    } catch (error) {
      enqueueSnackbar('Erreur lors du changement de rôle', { variant: 'error' });
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Gestion des Utilisateurs</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Ajouter un utilisateur
        </Button>
      </Box>

      {/* --- SECTION EN ATTENTE --- */}
      {pendingUsers.length > 0 && (
        <Paper sx={{ p: 2, mb: 4, bgcolor: '#fff8e1', border: '1px solid #ffcc02' }}>
          <Typography variant="h6" sx={{ color: '#ed6c02', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CheckIcon /> Demandes en attente ({pendingUsers.length})
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Nom</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingUsers.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Box display="flex" justifyContent="flex-end" gap={1}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckIcon />}
                          onClick={() => handleApprove(user.id)}
                        >
                          Approuver
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<RejectIcon />}
                          onClick={() => {
                            if (window.confirm(`Refuser l'accès à ${user.name} ?`)) {
                              handleReject(user.id);
                            }
                          }}
                        >
                          Refuser
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* --- SECTION LISTE PRINCIPALE --- */}
      <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>📋 Utilisateurs actifs</Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nom</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rôle</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Sites</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Inscription</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user: any) => (
              <TableRow key={user.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    icon={roleIcons[user.role as keyof typeof roleIcons]}
                    label={user.role}
                    color={roleColors[user.role as keyof typeof roleColors] as any}
                    size="small"
                    onClick={() => handleChangeRole(user.id, user.role)}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  />
                </TableCell>
                
                {/* ✅ Correction : Utilisation de siteCount renvoyé par le backend */}
                <TableCell align="center">
                  <Chip 
                    label={user.siteCount || 0} 
                    size="small" 
                    variant="outlined" 
                    color={user.siteCount > 0 ? "secondary" : "default"}
                    sx={{ minWidth: 40, fontWeight: 'bold' }}
                  />
                </TableCell>

                <TableCell>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center">
                    <IconButton size="small" color="primary" onClick={() => handleOpenDialog(user)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(user.id, user.name)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* --- DIALOGUE AJOUT/MODIFICATION --- */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth label="Nom" margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            fullWidth label="Email" type="email" margin="normal"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            fullWidth margin="normal"
            label={editingUser ? 'Changer mot de passe (optionnel)' : 'Mot de passe'}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <TextField
            fullWidth select label="Rôle" margin="normal"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <MenuItem value="Admin">Administrateur</MenuItem>
            <MenuItem value="Editor">Éditeur</MenuItem>
            <MenuItem value="Viewer">Visiteur</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={isCreating || isUpdating}>
            {isCreating || isUpdating ? <CircularProgress size={24} /> : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;