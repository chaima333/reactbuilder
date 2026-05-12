import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router-dom'; // 👈 ضرورية باش نجيبو الـ siteId

import {
  useGetMediaQuery,
  useUploadMediaMutation,
  useDeleteMediaMutation,
  useUpdateMediaAltMutation,
} from '../../../redux/services/media.api'; 

import { MediaGrid } from '../components/MediaGrid';
import { UploadModal } from '../components/UploadModal';

export const MediaPage: React.FC = () => {
  const { siteId } = useParams<{ siteId: string }>(); // 👈 نجيبو الـ siteId من الـ URL
  const { enqueueSnackbar } = useSnackbar();
  
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [altDialogOpen, setAltDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ id: number; alt: string } | null>(null);
  const [newAlt, setNewAlt] = useState('');

  // 1. Fetching - نبعثو الـ siteId
  const { data, isLoading, refetch } = useGetMediaQuery({ siteId: siteId! }, { skip: !siteId });
  
  // 2. Mutations
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();
  const [deleteMedia] = useDeleteMediaMutation();
  const [updateAlt] = useUpdateMediaAltMutation();

  const mediaList = data?.data || [];

  const handleUpload = async (file: File, alt: string) => {
    if (!siteId) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('alt', alt);

    try {
      // 👈 نبعثو الـ siteId والـ formData مع بعضهم كيف ما صلحنا في الـ API
      await uploadMedia({ siteId, formData }).unwrap();
      enqueueSnackbar('Image uploadée!', { variant: 'success' });
      setUploadModalOpen(false);
    } catch (error) {
      enqueueSnackbar("Erreur d'upload", { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!siteId) return;
    if (window.confirm('Supprimer؟')) {
      try {
        // 👈 نبعثو الـ siteId والـ id
        await deleteMedia({ siteId, id }).unwrap();
        enqueueSnackbar('Supprimé!', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar('Erreur', { variant: 'error' });
      }
    }
  };

  const handleUpdateAlt = async () => {
    if (!selectedMedia || !siteId) return;
    try {
      // 👈 نبعثو الـ siteId والـ id والـ alt
      await updateAlt({ siteId, id: selectedMedia.id, alt: newAlt }).unwrap();
      enqueueSnackbar('Alt mis à jour!', { variant: 'success' });
      setAltDialogOpen(false);
    } catch (error) {
      enqueueSnackbar('Erreur', { variant: 'error' });
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={4}>
        <Typography variant="h4" fontWeight="bold">Médiathèque</Typography>
        <Box>
          <Button startIcon={<RefreshIcon />} onClick={() => refetch()} sx={{ mr: 2 }}>Rafraîchir</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setUploadModalOpen(true)}>Nouveau</Button>
        </Box>
      </Box>

      <MediaGrid 
        media={mediaList} 
        isLoading={isLoading} 
        onDelete={handleDelete} 
        onEditAlt={(id, alt) => {
          setSelectedMedia({ id, alt });
          setNewAlt(alt);
          setAltDialogOpen(true);
        }} 
      />

      <UploadModal 
        open={uploadModalOpen} 
        onClose={() => setUploadModalOpen(false)} 
        onUpload={handleUpload} 
        isLoading={isUploading} 
      />

      <Dialog open={altDialogOpen} onClose={() => setAltDialogOpen(false)}>
        <DialogTitle>Modifier Alt</DialogTitle>
        <DialogContent>
          <TextField 
            fullWidth 
            value={newAlt} 
            onChange={(e) => setNewAlt(e.target.value)} 
            margin="normal" 
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAltDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleUpdateAlt} variant="contained" color="primary">Sauvegarder</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MediaPage;