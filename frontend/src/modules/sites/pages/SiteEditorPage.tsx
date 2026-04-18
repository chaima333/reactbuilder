import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useGetSiteByIdQuery, useUpdateSiteMutation } from '../redux/api/apiSlice';

export const SiteEditor: React.FC = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('fr');
  const [timezone, setTimezone] = useState('Europe/Paris');

  // Charger les données du site
  const { data: siteData, isLoading, error } = useGetSiteByIdQuery(Number(siteId));
  const [updateSite, { isLoading: isUpdating }] = useUpdateSiteMutation();

  // Remplir le formulaire avec les données du site
  useEffect(() => {
    if (siteData?.data) {
      const site = siteData.data;
      setName(site.name || '');
      setTitle(site.title || '');
      setDescription(site.description || '');
      setLanguage(site.language || 'fr');
      setTimezone(site.timezone || 'Europe/Paris');
    }
  }, [siteData]);

  const handleSave = async () => {
    if (!name.trim()) {
      enqueueSnackbar('Le nom du site est requis', { variant: 'error' });
      return;
    }

    try {
      await updateSite({
        id: Number(siteId),
        name,
        title,
        description,
        language,
        timezone,
      }).unwrap();
      
      enqueueSnackbar('Site mis à jour avec succès!', { variant: 'success' });
      navigate('/sites');
    } catch (err) {
      console.error('Update error:', err);
      enqueueSnackbar('Erreur lors de la mise à jour', { variant: 'error' });
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
        <Alert severity="error">Erreur lors du chargement du site</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="outlined" onClick={() => navigate('/sites')}>
          ← Retour aux sites
        </Button>
        <Typography variant="h6">Modifier le site</Typography>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <TextField
          fullWidth
          label="Nom du site"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 3 }}
          required
        />
        
        <TextField
          fullWidth
          label="Titre du site"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="Langue"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            sx={{ mb: 3 }}
          />
          
          <TextField
            fullWidth
            label="Fuseau horaire"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            sx={{ mb: 3 }}
          />
        </Box>
      </Paper>
    </Box>
  );
};