import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import {
  useGetMediaQuery,
  useUploadMediaMutation,
  useDeleteMediaMutation,
  useUpdateMediaAltMutation,
} from '../redux/api/apiSlice';
import { MediaGrid } from '../components/Media/MediaGrid';
import { UploadModal } from '../components/Media/UploadModal';

export const Media: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [altDialogOpen, setAltDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ id: number; alt: string } | null>(null);
  const [newAlt, setNewAlt] = useState('');

  const { data, isLoading, refetch } = useGetMediaQuery(undefined);
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();
  const [deleteMedia] = useDeleteMediaMutation();
  const [updateAlt] = useUpdateMediaAltMutation();

  const mediaList = data?.data || [];

  // ✅ Gestion de l'upload
  const handleUpload = async (file: File, alt: string) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('alt', alt);

    try {
      await uploadMedia(formData).unwrap();
      enqueueSnackbar('Image uploadée avec succès!', { variant: 'success' });
      setUploadModalOpen(false); // Fermer le modal après succès
      
    } catch (error) {
      enqueueSnackbar("Erreur lors de l'upload", { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Supprimer cette image définitivement ?')) {
      try {
        await deleteMedia(id).unwrap();
        enqueueSnackbar('Image supprimée!', { variant: 'success' });
      
      } catch (error) {
        enqueueSnackbar('Erreur lors de la suppression', { variant: 'error' });
      }
    }
  };

  const handleEditAlt = (id: number, currentAlt: string) => {
    setSelectedMedia({ id, alt: currentAlt });
    setNewAlt(currentAlt || '');
    setAltDialogOpen(true);
  };

  const handleUpdateAlt = async () => {
    if (!selectedMedia) return;
    try {
      await updateAlt({ id: selectedMedia.id, alt: newAlt }).unwrap();
      enqueueSnackbar('Texte ALT mis à jour!', { variant: 'success' });
      setAltDialogOpen(false);
      setSelectedMedia(null);
    } catch (error) {
      enqueueSnackbar('Erreur lors de la mise à jour', { variant: 'error' });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">Médiathèque</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            sx={{ mr: 2 }}
          >
            Rafraîchir
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setUploadModalOpen(true)}
          >
            Nouveau Fichier
          </Button>
        </Box>
      </Box>

      {/* IMPORTANT : La correction du lien http://localhost:5000 
          se passe à l'intérieur de MediaGrid ! 
      */}
      <MediaGrid
        media={mediaList}
        isLoading={isLoading}
        onDelete={handleDelete}
        onEditAlt={handleEditAlt}
      />

      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUpload}
        isLoading={isUploading}
      />

      <Dialog open={altDialogOpen} onClose={() => setAltDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>SEO & Accessibilité</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Texte alternatif (Alt)"
            value={newAlt}
            onChange={(e) => setNewAlt(e.target.value)}
            margin="normal"
            variant="outlined"
            helperText="Décrivez l'image pour les malvoyants et les moteurs de recherche."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAltDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleUpdateAlt} variant="contained" color="primary">
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Media;