import React, { useState, useEffect, useCallback } from 'react';
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
  Delete as DeleteIcon,
  AutoAwesome as MagicIcon,
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
import { AIGenerator } from '../components/AIGenerator';

const blockTypes = [
  { type: 'title', label: 'Titre', icon: '📌', description: 'Titre de section' },
  { type: 'text', label: 'Texte', icon: '📝', description: 'Paragraphe de texte' },
  { type: 'image', label: 'Image', icon: '🖼️', description: 'Image simple' },
  { type: 'button', label: 'Bouton', icon: '🔘', description: 'Bouton cliquable' },
  { type: 'gallery', label: 'Galerie', icon: '📸', description: 'Galerie d\'images' },
  { type: 'video', label: 'Vidéo', icon: '🎬', description: 'Vidéo YouTube/Vimeo' },
  { type: 'separator', label: 'Séparateur', icon: '➖', description: 'Ligne de séparation' },
];

// --- COMPOSANT ITEM MÉMOÏSÉ ---
const SortableBlockItem = React.memo(({ block, index, totalBlocks, updateBlock, deleteBlock, duplicateBlock, moveUp, moveDown }: any) => {
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
    opacity: isDragging ? 0.6 : 1,
    marginBottom: '16px',
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as const,
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case 'title':
        return (
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Titre de la section"
            value={block.content || ''}
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
            value={block.content || ''}
            onChange={(e) => updateBlock(block.id, e.target.value)}
          />
        );
      case 'image':
        return (
          <Box sx={{ p: 2, border: '1px dashed #ccc', textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>URL de l'image</Typography>
            <TextField
              fullWidth
              placeholder="https://exemple.com/image.jpg"
              value={block.content || ''}
              onChange={(e) => updateBlock(block.id, e.target.value)}
              size="small"
            />
            {block.content && (
              <Box sx={{ mt: 2 }}>
                <img 
                  src={block.content} 
                  alt="Prévisualisation" 
                  style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+Invalide'; }}
                />
              </Box>
            )}
          </Box>
        );
      case 'button':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Texte du bouton"
              value={block.content || ''}
              onChange={(e) => updateBlock(block.id, e.target.value, block.link)}
              size="small"
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
            <Typography variant="caption" color="text.secondary">URLs des images (une par ligne)</Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="https://image1.jpg&#10;https://image2.jpg"
              value={block.content || ''}
              onChange={(e) => updateBlock(block.id, e.target.value)}
            />
          </Box>
        );
      case 'video':
        return (
          <TextField
            fullWidth
            label="URL Vidéo (YouTube/Vimeo)"
            placeholder="https://www.youtube.com/watch?v=..."
            value={block.content || ''}
            onChange={(e) => updateBlock(block.id, e.target.value)}
            size="small"
          />
        );
      case 'separator':
        return <Divider sx={{ my: 1 }}><Chip label="Séparateur" size="small" variant="outlined" /></Divider>;
      default:
        return null;
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Paper sx={{ p: 2, border: isDragging ? '2px solid #1976d2' : '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, borderBottom: '1px solid #f0f0f0', pb: 1 }}>
          <IconButton size="small" {...attributes} {...listeners} sx={{ cursor: 'grab' }}>
            <DragIcon />
          </IconButton>
          <Chip label={block.type.toUpperCase()} size="small" sx={{ ml: 1, fontWeight: 'bold' }} color="primary" variant="outlined" />
          
          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title="Monter">
            <span>
              <IconButton size="small" onClick={() => moveUp(block.id)} disabled={index === 0}>
                <ArrowUpIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Descendre">
            <span>
              <IconButton size="small" onClick={() => moveDown(block.id)} disabled={index === totalBlocks - 1}>
                <ArrowDownIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Dupliquer">
            <IconButton size="small" onClick={() => duplicateBlock(block)}>
              <DuplicateIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Supprimer">
            <IconButton size="small" onClick={() => deleteBlock(block.id)} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        {renderBlockContent()}
      </Paper>
    </div>
  );
});

// --- COMPOSANT PRINCIPAL ---

export const PageEditor: React.FC = () => {
  const { siteId, pageId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [pageTitle, setPageTitle] = useState('');
  const [blocks, setBlocks] = useState<any[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiGeneratorOpen, setAiGeneratorOpen] = useState(false); // État pour l'IA

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { data: pageData, isLoading: isLoadingPage } = useGetPageByIdQuery(
    { siteId: Number(siteId), pageId: Number(pageId) },
    { skip: !pageId || pageId === 'new' }
  );

  const [createPage] = useCreatePageMutation();
  const [updatePage] = useUpdatePageMutation();

  const isNewPage = !pageId || pageId === 'new';

  useEffect(() => {
    if (pageData?.data && !isNewPage) {
      const page = pageData.data;
      setPageTitle(page.title || '');
      let parsedBlocks = page.blocks;
      if (typeof parsedBlocks === 'string') {
        try { parsedBlocks = JSON.parse(parsedBlocks); } catch (e) { parsedBlocks = []; }
      }
      setBlocks(parsedBlocks || []);
    }
  }, [pageData, isNewPage]);

  // Fonctions de manipulation (add, update, delete, move...)
  const addBlock = (type: string) => {
    const newBlock = { id: uuidv4(), type, content: '', ...(type === 'button' && { link: '' }) };
    setBlocks(prev => [...prev, newBlock]);
  };

  const updateBlock = useCallback((id: string, content: string, link?: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content, ...(link !== undefined && { link }) } : b));
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  }, []);

  const duplicateBlock = useCallback((block: any) => {
    const newBlock = { ...block, id: uuidv4() };
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === block.id);
      const copy = [...prev];
      copy.splice(idx + 1, 0, newBlock);
      return copy;
    });
  }, []);

  const moveBlockUp = useCallback((id: string) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx <= 0) return prev;
      return arrayMove(prev, idx, idx - 1);
    });
  }, []);

  const moveBlockDown = useCallback((id: string) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx >= prev.length - 1) return prev;
      return arrayMove(prev, idx, idx + 1);
    });
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

const savePage = async () => {
  if (!pageTitle.trim()) {
    enqueueSnackbar('Titre requis', { variant: 'error' });
    return false;
  }

  setSaving(true);

  try {
    const payload = {
      title: pageTitle,
      blocks,
      status: 'published',
    };

    if (!isNewPage) {
      await updatePage({
        siteId: Number(siteId),
        pageId: Number(pageId),
        ...payload,
      }).unwrap();
    } else {
      await createPage({
        siteId: Number(siteId),
        ...payload,
      }).unwrap();
    }

    enqueueSnackbar('Saved', { variant: 'success' });
    return true; // ✅ important

  } catch (err) {
    enqueueSnackbar('Erreur de sauvegarde', { variant: 'error' });
    return false; // ❌
  } finally {
    setSaving(false);
  }
}; 

  if (isLoadingPage) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <Box sx={{ pb: 10 }}>
      {/* Header collant */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <Button onClick={() => navigate(`/sites/${siteId}`)}>Retour</Button>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>{isNewPage ? 'Nouvelle Page' : pageTitle}</Typography>
        
        <Button 
          startIcon={<MagicIcon />} 
          onClick={() => setAiGeneratorOpen(true)}
          sx={{ color: '#6366f1', borderColor: '#6366f1' }}
          variant="outlined"
        >
          Générer avec IA
        </Button>
        
        <Button startIcon={<PreviewIcon />} onClick={() => setIsPreview(!isPreview)}>
          {isPreview ? 'Éditer' : 'Aperçu'}
        </Button>
       <Button variant="contained" onClick={async () => { const ok = await savePage();
             if (ok) navigate(`/sites/${siteId}`); }}>
               Save & Exit</Button>
      </Paper>

      {isPreview ? (
        <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h3" gutterBottom>{pageTitle}</Typography>
          {blocks.map(b => (
            <Box key={b.id} sx={{ mb: 2 }}>
              {b.type === 'title' && <Typography variant="h4">{b.content}</Typography>}
              {b.type === 'text' && <Typography>{b.content}</Typography>}
              {b.type === 'image' && b.content && <img src={b.content} style={{ width: '100%' }} alt="" />}
              {b.type === 'button' && <Button variant="contained" href={b.link}>{b.content}</Button>}
              {b.type === 'separator' && <Divider sx={{ my: 4 }} />}
            </Box>
          ))}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, position: 'sticky', top: 80 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>Composants</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {blockTypes.map(t => (
                  <Button key={t.type} variant="outlined" startIcon={t.icon} onClick={() => addBlock(t.type)} sx={{ justifyContent: 'flex-start' }}>
                    {t.label}
                  </Button>
                ))}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={9}>
            <TextField 
              fullWidth 
              label="Titre de la page" 
              value={pageTitle} 
              onChange={(e) => setPageTitle(e.target.value)} 
              sx={{ mb: 4, bgcolor: 'white' }}
            />
            
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
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

            {blocks.length === 0 && (
              <Box sx={{ textAlign: 'center', p: 10, border: '2px dashed #ccc', borderRadius: 2 }}>
                <Typography color="text.secondary">Cliquez sur un composant pour l'ajouter ou utilisez l'IA</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      )}

      {/* COMPOSANT IA - BIEN PLACÉ ICI */}
      <AIGenerator
        open={aiGeneratorOpen}
        onClose={() => setAiGeneratorOpen(false)}
        onContentGenerated={(content) => {
          if (content.title) setPageTitle(content.title);
          
          // Utilisation de .blocks car ton backend renvoie maintenant "blocks"
          if (content.blocks && content.blocks.length > 0) {
            const newBlocks = content.blocks.map((block: any) => ({
              id: block.id || uuidv4(), // Priorité à l'ID du backend
              type: block.type,
              content: block.content,
              link: block.link || '',
            }));
            
            // On ajoute les nouveaux blocs à la liste existante
            setBlocks(prev => [...prev, ...newBlocks]);
            enqueueSnackbar(`${newBlocks.length} blocs générés par l'IA`, { variant: 'success' });
          }
        }}
      />
    </Box>
  );
};

export default PageEditor;