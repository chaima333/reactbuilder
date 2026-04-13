import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  IconButton,
} from '@mui/material';
import {
  AutoAwesome as MagicIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useSnackbar } from 'notistack';

interface AIGeneratorProps {
  open: boolean;
  onClose: () => void;
  onContentGenerated: (content: any) => void;
}

const pageTypes = [
  { value: 'home', label: '🏠 Page d\'accueil' },
  { value: 'about', label: '👤 À propos' },
  { value: 'services', label: '💼 Services' },
  { value: 'contact', label: '📞 Contact' },
  { value: 'portfolio', label: '🎨 Portfolio' },
  { value: 'blog', label: '📝 Blog' },
];

export const AIGenerator: React.FC<AIGeneratorProps> = ({
  open,
  onClose,
  onContentGenerated,
}) => {
  const [topic, setTopic] = useState('');
  const [pageType, setPageType] = useState('home');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [activeStep, setActiveStep] = useState(0);
  const { enqueueSnackbar } = useSnackbar();

  const generatePage = async () => {
    if (!topic.trim()) {
      enqueueSnackbar('Veuillez entrer un sujet', { variant: 'error' });
      return;
    }

    setGenerating(true);
    try {
      const token = localStorage.getItem('accessToken');
      // URL pointant vers ton backend Render
      const response = await axios.post(
        'https://backend-rmfq.onrender.com/api/ai/generate-page',
        { topic, pageType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // IMPORTANT: On stocke la réponse qui contient .blocks (selon le backend)
        setGeneratedContent(response.data.data);
        setActiveStep(1);
        enqueueSnackbar('Contenu généré avec succès!', { variant: 'success' });
      }
    } catch (error: any) {
      console.error('AI error:', error);
      enqueueSnackbar(error.response?.data?.message || 'Erreur lors de la génération', { variant: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedContent) {
      onContentGenerated(generatedContent);
      enqueueSnackbar('Contenu ajouté à la page!', { variant: 'success' });
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setTopic('');
    setGeneratedContent(null);
    setActiveStep(0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <MagicIcon color="primary" />
            <Typography variant="h6">✨ Génération de page par IA</Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
          <Step><StepLabel>Configurer</StepLabel></Step>
          <Step><StepLabel>Vérifier</StepLabel></Step>
          <Step><StepLabel>Appliquer</StepLabel></Step>
        </Stepper>

        {activeStep === 0 && (
          <Box sx={{ py: 2 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Dites-nous ce que vous voulez créer
            </Typography>
            
            <TextField
              select
              fullWidth
              label="Type de page"
              value={pageType}
              onChange={(e) => setPageType(e.target.value)}
              sx={{ mb: 3, mt: 1 }}
            >
              {pageTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Sujet / Thème de votre site"
              placeholder="Ex: Un restaurant de sushis haut de gamme à Paris..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              multiline
              rows={4}
              helperText="Plus vous donnez de détails, meilleur sera le résultat."
            />

            <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                💡 **Conseil** : Précisez votre cible et votre style (moderne, luxueux, minimaliste).
              </Typography>
            </Box>
          </Box>
        )}

        {activeStep === 1 && generatedContent && (
          <Box>
            <Typography variant="h5" color="primary" gutterBottom fontWeight="bold">
              {generatedContent.title}
            </Typography>
            
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" display="block" color="text.secondary" gutterBottom>
                STRUCTURE SEO GÉNÉRÉE
              </Typography>
              <Typography variant="body2"><strong>Titre:</strong> {generatedContent.seoTitle}</Typography>
              <Typography variant="body2"><strong>Description:</strong> {generatedContent.seoDescription}</Typography>
            </Box>

            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              📦 Blocs à insérer ({generatedContent.blocks?.length || 0})
            </Typography>

            <Box sx={{ maxHeight: 350, overflow: 'auto', pr: 1 }}>
              {/* CORRECTION: On utilise .blocks au lieu de .sections */}
              {generatedContent.blocks?.map((block: any, idx: number) => (
                <Paper key={block.id || idx} variant="outlined" sx={{ p: 2, mb: 2, position: 'relative' }}>
                  <Chip 
                    label={block.type.toUpperCase()} 
                    size="small" 
                    color="secondary"
                    variant="outlined"
                    sx={{ position: 'absolute', right: 8, top: 8, fontSize: '0.6rem' }} 
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {block.content}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3 }}>
        {activeStep === 0 ? (
          <>
            <Button onClick={onClose} color="inherit">Annuler</Button>
            <Button
              variant="contained"
              onClick={generatePage}
              disabled={generating || !topic.trim()}
              startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <MagicIcon />}
              sx={{ 
                bgcolor: '#6366f1', 
                '&:hover': { bgcolor: '#4f46e5' },
                px: 4
              }}
            >
              {generating ? 'IA en réflexion...' : 'Générer ma page'}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleReset} color="inherit">Recommencer</Button>
            <Button 
              variant="contained" 
              onClick={handleApply} 
              sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, px: 4 }}
            >
              ✓ Appliquer à l'éditeur
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};