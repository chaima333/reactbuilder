import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File, alt: string) => Promise<void>;
  isLoading: boolean;
}

export const UploadModal: React.FC<UploadModalProps> = ({ open, onClose, onUpload, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError('Le fichier est trop volumineux (max 50MB)');
        return;
      }
      
      setError('');
      setSelectedFile(file);
      
      if (file.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview('');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      await onUpload(selectedFile, altText);
      // Reset après succès
      setSelectedFile(null);
      setAltText('');
      setPreview('');
      setError('');
      onClose();
    } catch (err) {
      setError("Une erreur est survenue lors de l'envoi.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Uploader un fichier</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {preview && (
          <Box textAlign="center" mb={2} sx={{ bgcolor: '#f0f0f0', p: 1, borderRadius: 2 }}>
            <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4 }} />
          </Box>
        )}
        
        <Button
          variant="outlined"
          component="label"
          fullWidth
          startIcon={isLoading ? <CircularProgress size={20} /> : <UploadIcon />}
          disabled={isLoading}
          sx={{ mb: 2, py: 3, borderStyle: 'dashed', borderWidth: 2 }}
        >
          {selectedFile ? 'Changer de fichier' : 'Choisir un fichier (Images, PDF, Vidéos...)'}
          <input
            type="file"
            hidden
            onChange={handleFileSelect}
          />
        </Button>

        {selectedFile && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1, color: 'white' }}>
            <Typography variant="subtitle2" noWrap>📄 {selectedFile.name}</Typography>
            <Typography variant="caption">Taille : {(selectedFile.size / 1024).toFixed(0)} KB</Typography>
          </Box>
        )}

        <TextField
          fullWidth
          label="Texte Alternatif / Nom SEO"
          placeholder="Ex: Logo entreprise, Capture tableau de bord..."
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          margin="normal"
          disabled={isLoading}
          helperText="Le texte ALT aide au référencement et à l'accessibilité."
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>Annuler</Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!selectedFile || isLoading}
          startIcon={isLoading && <CircularProgress size={16} color="inherit" />}
        >
          {isLoading ? 'Envoi en cours...' : 'Lancer l\'upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};