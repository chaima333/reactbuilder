import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Grid,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  Visibility as PreviewIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { 
  useGetPageByIdQuery, 
  useCreatePageMutation, 
  useUpdatePageMutation,
  useDeletePageMutation,
} from '../redux/api/apiSlice';

const blockTypes = [
  { type: 'title', label: 'Titre', icon: '📌' },
  { type: 'text', label: 'Texte', icon: '📝' },
  { type: 'image', label: 'Image', icon: '🖼️' },
  { type: 'button', label: 'Bouton', icon: '🔘' },
  { type: 'gallery', label: 'Galerie', icon: '📸' },
];

export const PageEditor: React.FC = () => {
  const { siteId, pageId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [pageTitle, setPageTitle] = useState('');
  const [blocks, setBlocks] = useState<any[]>([]);
  const [isPreview, setIsPreview] = useState(false);

  // Charger la page depuis l'API - CORRECTION ICI
  const { data: pageData, isLoading: isLoadingPage, error: pageError } = useGetPageByIdQuery(
    { siteId: Number(siteId), pageId: Number(pageId) },
    { skip: !pageId || pageId === 'new' } // Ne pas exécuter si nouvelle page
  );

  const [createPage, { isLoading: isCreating }] = useCreatePageMutation();
  const [updatePage, { isLoading: isUpdating }] = useUpdatePageMutation();
  const [deletePage, { isLoading: isDeleting }] = useDeletePageMutation();

  const isNewPage = !pageId || pageId === 'new';

  // CORRECTION : Charger les données de la page quand pageData change
  useEffect(() => {
    if (pageData?.data && !isNewPage) {
      const page = pageData.data;
      console.log('Page chargée:', page); // Pour déboguer
      setPageTitle(page.title || '');
      
      // Parser les blocks si nécessaire
      let parsedBlocks = page.blocks;
      if (typeof parsedBlocks === 'string') {
        try {
          parsedBlocks = JSON.parse(parsedBlocks);
        } catch (e) {
          parsedBlocks = [];
        }
      }
      setBlocks(parsedBlocks || []);
    }
  }, [pageData, isNewPage]);

  // Réinitialiser pour une nouvelle page
  useEffect(() => {
    if (isNewPage) {
      setPageTitle('');
      setBlocks([]);
    }
  }, [isNewPage, pageId]);

  const addBlock = (type: string) => {
    const newBlock = {
      id: Date.now(),
      type,
      content: '',
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: number, content: string) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, content } : block
    ));
  };

  const deleteBlock = (id: number) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  const handleDeletePage = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) {
      try {
        await deletePage({
          siteId: Number(siteId),
          pageId: Number(pageId),
        }).unwrap();
        enqueueSnackbar('Page supprimée avec succès!', { variant: 'success' });
        navigate(`/sites/${siteId}`);
      } catch (error) {
        console.error('Delete error:', error);
        enqueueSnackbar('Erreur lors de la suppression', { variant: 'error' });
      }
    }
  };

  const savePage = async () => {
    if (!pageTitle.trim()) {
      enqueueSnackbar('Veuillez entrer un titre', { variant: 'error' });
      return;
    }

    try {
      const pageDataToSave = {
        title: pageTitle,
        content: JSON.stringify(blocks),
        blocks: blocks,
        status: 'published',
      };

      if (!isNewPage) {
        await updatePage({
          siteId: Number(siteId),
          pageId: Number(pageId),
          ...pageDataToSave,
        }).unwrap();
        enqueueSnackbar('Page mise à jour avec succès!', { variant: 'success' });
      } else {
        await createPage({
          siteId: Number(siteId),
          ...pageDataToSave,
        }).unwrap();
        enqueueSnackbar('Page créée avec succès!', { variant: 'success' });
      }
      
      navigate(`/sites/${siteId}`);
    } catch (error) {
      console.error('Save error:', error);
      enqueueSnackbar('Erreur lors de la sauvegarde', { variant: 'error' });
    }
  };

  const renderBlock = (block: any) => {
    switch (block.type) {
      case 'title':
        return (
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Titre de la section"
            value={block.content}
            onChange={(e) => updateBlock(block.id, e.target.value)}
            sx={{ mb: 2 }}
          />
        );
      case 'text':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Votre texte ici..."
            value={block.content}
            onChange={(e) => updateBlock(block.id, e.target.value)}
            sx={{ mb: 2 }}
          />
        );
      case 'image':
        return (
          <Box sx={{ mb: 2, p: 2, border: '1px dashed #ccc', textAlign: 'center' }}>
            <Typography color="text.secondary">🖼️ URL de l'image</Typography>
            <TextField
              fullWidth
              placeholder="https://exemple.com/image.jpg"
              value={block.content}
              onChange={(e) => updateBlock(block.id, e.target.value)}
              sx={{ mt: 1 }}
            />
          </Box>
        );
      case 'button':
        return (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Texte du bouton"
              value={block.content}
              onChange={(e) => updateBlock(block.id, e.target.value)}
              sx={{ mb: 1 }}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  if (isLoadingPage) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (pageError && !isNewPage) {
    console.error('Page error:', pageError);
    return (
      <Box p={3}>
        <Alert severity="error">Erreur lors du chargement de la page</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate(`/sites/${siteId}`)}>
          Retour aux sites
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button variant="outlined" onClick={() => navigate(`/sites/${siteId}`)}>
            ← Retour
          </Button>
          <Typography variant="h6">
            {isNewPage ? 'Nouvelle page' : `Modifier: ${pageTitle || 'Page'}`}
          </Typography>
          <Chip label={isPreview ? 'Aperçu' : 'Édition'} color="primary" />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!isNewPage && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleDeletePage}
              disabled={isDeleting}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={() => setIsPreview(!isPreview)}
          >
            Aperçu
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={savePage}
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Ajouter des blocs</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {blockTypes.map((block) => (
                <Button
                  key={block.type}
                  variant="outlined"
                  startIcon={<span>{block.icon}</span>}
                  onClick={() => addBlock(block.type)}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {block.label}
                </Button>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3 }}>
            <TextField
              fullWidth
              label="Titre de la page"
              variant="outlined"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              sx={{ mb: 3 }}
              placeholder="Ex: Accueil, À propos, Contact..."
            />

            {blocks.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Typography color="text.secondary" gutterBottom>
                  Aucun bloc pour le moment
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cliquez sur un bloc à gauche pour ajouter du contenu
                </Typography>
              </Box>
            ) : (
              blocks.map((block) => (
                <Paper key={block.id} sx={{ p: 2, mb: 2, position: 'relative' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DragIcon sx={{ cursor: 'move', mr: 1, color: 'text.secondary' }} />
                    <Chip label={block.type} size="small" />
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton size="small" onClick={() => deleteBlock(block.id)}>
                      🗑️
                    </IconButton>
                  </Box>
                  {renderBlock(block)}
                </Paper>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};