import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { v4 as uuidv4 } from 'uuid';
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
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Visibility as PreviewIcon,
  DragIndicator as DragIcon,
  FileCopy as DuplicateIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
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
  { type: 'title', label: 'Titre', icon: '📌', description: 'Titre de section' },
  { type: 'text', label: 'Texte', icon: '📝', description: 'Paragraphe de texte' },
  { type: 'image', label: 'Image', icon: '🖼️', description: 'Image simple' },
  { type: 'button', label: 'Bouton', icon: '🔘', description: 'Bouton cliquable' },
  { type: 'gallery', label: 'Galerie', icon: '📸', description: 'Galerie d\'images' },
  { type: 'video', label: 'Vidéo', icon: '🎬', description: 'Vidéo YouTube/Vimeo' },
  { type: 'separator', label: 'Séparateur', icon: '➖', description: 'Ligne de séparation' },
];

// Composant pour un bloc déplaçable
const SortableBlockItem = ({ block, index, totalBlocks, updateBlock, deleteBlock, duplicateBlock, moveUp, moveDown }: any) => {
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
            size="small"
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
          <Box sx={{ p: 2, border: '1px dashed #ccc', textAlign: 'center', borderRadius: 2 }}>
            <Typography color="text.secondary" gutterBottom>🖼️ URL de l'image</Typography>
            <TextField
              fullWidth
              placeholder="https://exemple.com/image.jpg"
              value={block.content}
              onChange={(e) => updateBlock(block.id, e.target.value)}
              size="small"
            />
            {block.content && (
              <Box sx={{ mt: 2 }}>
                <img 
                  src={block.content} 
                  alt="Prévisualisation" 
                  style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px' }}
                  onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                />
              </Box>
            )}
          </Box>
        );
      case 'button':
        return (
          <Box>
            <TextField
              fullWidth
              placeholder="Texte du bouton"
              value={block.content}
              onChange={(e) => updateBlock(block.id, e.target.value)}
              size="small"
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              placeholder="Lien du bouton (URL)"
              value={block.link || ''}
              onChange={(e) => updateBlock(block.id, block.content, e.target.value)}
              size="small"
            />
          </Box>
        );
      case 'gallery':
        return (
          <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2 }}>
            <Typography color="text.secondary" gutterBottom>📸 Galerie d'images</Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="URLs des images (une par ligne)"
              value={block.content}
              onChange={(e) => updateBlock(block.id, e.target.value)}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Séparez les URLs par des retours à la ligne
            </Typography>
          </Box>
        );
      case 'video':
        return (
          <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2 }}>
            <Typography color="text.secondary" gutterBottom>🎬 URL de la vidéo</Typography>
            <TextField
              fullWidth
              placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
              value={block.content}
              onChange={(e) => updateBlock(block.id, e.target.value)}
              size="small"
            />
          </Box>
        );
      case 'separator':
        return (
          <Divider sx={{ my: 1 }}>
            <Chip label="Séparateur" size="small" />
          </Divider>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Paper sx={{ p: 2, position: 'relative', '&:hover': { boxShadow: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Tooltip title="Glisser pour déplacer">
            <IconButton size="small" {...listeners} sx={{ cursor: 'grab' }}>
              <DragIcon />
            </IconButton>
          </Tooltip>
          <Chip 
            label={block.type} 
            size="small" 
            sx={{ ml: 1 }}
            color={block.type === 'title' ? 'primary' : 'default'}
          />
          <Box sx={{ flexGrow: 1 }} />


         <Tooltip title="Déplacer vers le haut">
  <span>
    <IconButton size="small" onClick={() => moveUp(index)} disabled={index === 0}>
      <ArrowUpIcon fontSize="small" />
    </IconButton>
  </span>
</Tooltip>


          <Tooltip title="Déplacer vers le bas">
              <span>
            <IconButton size="small" onClick={() => moveDown(index)} disabled={index === totalBlocks - 1}>
              <ArrowDownIcon fontSize="small" />
            </IconButton>
              </span>
          </Tooltip>

          <Tooltip title="Dupliquer">
            <span>
            <IconButton size="small" onClick={() => duplicateBlock(block)}>
              <DuplicateIcon fontSize="small" />
            </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Supprimer">
            <span>
            <IconButton size="small" onClick={() => deleteBlock(block.id)} color="error">
              🗑️
            </IconButton>
            </span>
          </Tooltip>
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
  const [saving, setSaving] = useState(false);

  // Configurer les capteurs pour DnD
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
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
      console.log('📄 Page chargée:', page);
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

  // ========== FONCTIONS BLOCS ==========
  
  const addBlock = (type: string) => {
    const newBlock: any = {
      id: uuidv4(),
      type,
      content: '',
    };
    
    if (type === 'button') {
      newBlock.link = '';
    }
    
    setBlocks(prev => [...prev, newBlock]);
    enqueueSnackbar(`Bloc "${type}" ajouté`, { variant: 'info' });
  };

  const updateBlock = (id: string, content: string, link?: string) => {
    setBlocks(prev =>
      prev.map(block => {
        if (block.id === id) {
          const updated = { ...block, content };
          if (link !== undefined) updated.link = link;
          return updated;
        }
        return block;
      })
    );
  };

  const deleteBlock = (id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
    enqueueSnackbar('Bloc supprimé', { variant: 'info' });
  };

  const duplicateBlock = (block: any) => {
    const newBlock = {
      ...block,
      id: uuidv4(),
    };
    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === block.id);
      const newBlocks = [...prev];
      newBlocks.splice(index + 1, 0, newBlock);
      return newBlocks;
    });
    enqueueSnackbar('Bloc dupliqué', { variant: 'success' });
  };

  const moveBlockUp = (index: number) => {
    setBlocks(prev => {
      if (index === 0) return prev;
      const newBlocks = [...prev];
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
      return newBlocks;
    });
  };

  const moveBlockDown = (index: number) => {
    setBlocks(prev => {
      if (index === prev.length - 1) return prev;
      const newBlocks = [...prev];
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
      return newBlocks;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setBlocks(prev => {
        const oldIndex = prev.findIndex((block) => block.id === active.id);
        const newIndex = prev.findIndex((block) => block.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
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

    setSaving(true);
    try {
      const pageDataToSave = {
        title: pageTitle,
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
      navigate('/sites');
    } catch (error: any) {
      console.error('Save error:', error);
      enqueueSnackbar(error?.data?.message || 'Erreur lors de la sauvegarde', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const getPreviewContent = () => {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>{pageTitle || 'Titre de la page'}</Typography>
        {blocks.map((block, idx) => (
          <Box key={idx} sx={{ my: 2 }}>
            {block.type === 'title' && <Typography variant="h5">{block.content || 'Titre'}</Typography>}
            {block.type === 'text' && <Typography variant="body1">{block.content || 'Texte...'}</Typography>}
            {block.type === 'image' && block.content && (
              <img src={block.content} alt="preview" style={{ maxWidth: '100%', borderRadius: 8 }} />
            )}
            {block.type === 'button' && (
              <Button variant="contained">{block.content || 'Bouton'}</Button>
            )}
            {block.type === 'separator' && <Divider />}
          </Box>
        ))}
      </Box>
    );
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

  if (isPreview) {
    return (
      <Box>
        <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Aperçu de la page</Typography>
          <Button variant="outlined" onClick={() => setIsPreview(false)}>
            ← Retour à l'édition
          </Button>
        </Paper>
        <Paper sx={{ p: 3 }}>
          {getPreviewContent()}
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={() => navigate(`/sites/${siteId}`)}>
            ← Retour
          </Button>
          <Typography variant="h6">
            {isNewPage ? '📄 Nouvelle page' : `✏️ Modifier: ${pageTitle || 'Page'}`}
          </Typography>
          <Chip label={isPreview ? 'Aperçu' : 'Édition'} color="primary" size="small" />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
            onClick={() => setIsPreview(true)}
          >
            Aperçu
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={savePage}
            disabled={isCreating || isUpdating || saving}
          >
            {isCreating || isUpdating || saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>➕ Ajouter des blocs</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Cliquez pour ajouter du contenu
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {blockTypes.map((block) => (
                <Tooltip key={block.type} title={block.description} placement="right">
                  <Button
                    variant="outlined"
                    startIcon={<span>{block.icon}</span>}
                    onClick={() => addBlock(block.type)}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    {block.label}
                  </Button>
                </Tooltip>
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
              helperText="Ce titre apparaîtra dans le menu et l'onglet du navigateur"
            />

            {blocks.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Typography color="text.secondary" gutterBottom variant="h6">
                  🎨 Aucun bloc pour le moment
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cliquez sur un bloc à gauche pour ajouter du contenu à votre page
                </Typography>
              </Box>
            ) : (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  📦 Blocs ({blocks.length}) - Glissez pour réorganiser
                </Typography>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={blocks.map(b => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {blocks.map((block, index) => (
                      <SortableBlockItem
                        key={block.id}
                        block={block}
                        index={index}
                        totalBlocks={blocks.length}
                        updateBlock={updateBlock}
                        deleteBlock={deleteBlock}
                        duplicateBlock={duplicateBlock}
                        moveUp={moveBlockUp}
                        moveDown={moveBlockDown}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PageEditor;