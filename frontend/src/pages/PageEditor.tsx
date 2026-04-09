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

// Import DnD Kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const blockTypes = [
  { type: 'title', label: 'Titre', icon: '📌' },
  { type: 'text', label: 'Texte', icon: '📝' },
  { type: 'image', label: 'Image', icon: '🖼️' },
  { type: 'button', label: 'Bouton', icon: '🔘' },
  { type: 'gallery', label: 'Galerie', icon: '📸' },
];

// Composant pour un bloc déplaçable
const SortableBlockItem = ({ block, updateBlock, deleteBlock }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginBottom: '16px',
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case 'title':
        return (
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Titre de la section"
            value={block.content}
            onChange={(e) => updateBlock(block.id, e.target.value)}
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
          />
        );
      case 'image':
        return (
          <Box sx={{ p: 2, border: '1px dashed #ccc', textAlign: 'center' }}>
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
          <TextField
            fullWidth
            placeholder="Texte du bouton"
            value={block.content}
            onChange={(e) => updateBlock(block.id, e.target.value)}
          />
        );
      case 'gallery':
        return (
          <Box sx={{ p: 2, border: '1px dashed #ccc', textAlign: 'center' }}>
            <Typography color="text.secondary">📸 Galerie d'images</Typography>
            <TextField
              fullWidth
              placeholder="URLs des images (séparées par des virgules)"
              value={block.content}
              onChange={(e) => updateBlock(block.id, e.target.value)}
              sx={{ mt: 1 }}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Paper sx={{ p: 2, position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <IconButton size="small" {...listeners} sx={{ cursor: 'grab' }}>
            <DragIcon />
          </IconButton>
          <Chip label={block.type} size="small" sx={{ ml: 1 }} />
          <Box sx={{ flexGrow: 1 }} />
          <IconButton size="small" onClick={() => deleteBlock(block.id)} color="error">
            🗑️
          </IconButton>
        </Box>
        {renderBlockContent()}
      </Paper>
    </div>
  );
};

export const PageEditor: React.FC = () => {
  const { siteId, pageId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [pageTitle, setPageTitle] = useState('');
  const [blocks, setBlocks] = useState<any[]>([]);
  const [isPreview, setIsPreview] = useState(false);

  // Configurer les capteurs pour DnD
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Déclencher après 5px de mouvement
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: pageData, isLoading: isLoadingPage, error: pageError } = useGetPageByIdQuery(
    { siteId: Number(siteId), pageId: Number(pageId) },
    { skip: !pageId || pageId === 'new' }
  );

  const [createPage, { isLoading: isCreating }] = useCreatePageMutation();
  const [updatePage, { isLoading: isUpdating }] = useUpdatePageMutation();
  const [deletePage, { isLoading: isDeleting }] = useDeletePageMutation();

  const isNewPage = !pageId || pageId === 'new';

  useEffect(() => {
    if (pageData?.data && !isNewPage) {
      const page = pageData.data;
      console.log('Page chargée:', page);
      setPageTitle(page.title || '');
      
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

  // Gestion du drag & drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      const newIndex = blocks.findIndex((block) => block.id === over.id);
      setBlocks(arrayMove(blocks, oldIndex, newIndex));
    }
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={blocks.map(b => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {blocks.map((block) => (
                    <SortableBlockItem
                      key={block.id}
                      block={block}
                      updateBlock={updateBlock}
                      deleteBlock={deleteBlock}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};