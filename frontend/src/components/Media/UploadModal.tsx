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

const ACCEPTED_TYPES = {
  images: 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml',
  documents: 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  videos: 'video/mp4,video/webm,video/quicktime',
  archives: 'application/zip,application/x-rar-compressed',
};

export const UploadModal: React.FC<UploadModalProps> = ({ open, onClose, onUpload, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier la taille (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        setError('Le fichier est trop volumineux (max 50MB)');
        return;
      }
      
      setError('');
      setSelectedFile(file);
      
      // Preview pour les images seulement
      if (file.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview('');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    await onUpload(selectedFile, altText);
    setSelectedFile(null);
    setAltText('');
    setPreview('');
    setError('');
    onClose();
  };

  const getFileTypeLabel = (file: File) => {
    if (file.type.startsWith('image/')) return 'Image';
    if (file.type === 'application/pdf') return 'PDF';
    if (file.type.startsWith('video/')) return 'Vidéo';
    if (file.type.startsWith('audio/')) return 'Audio';
    if (file.type.includes('word') || file.type.includes('document')) return 'Document';
    if (file.type.includes('zip') || file.type.includes('rar')) return 'Archive';
    return 'Fichier';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Uploader un fichier</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {preview && (
          <Box textAlign="center" mb={2}>
            <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
          </Box>
        )}
        
        <Button
          variant="outlined"
          component="label"
          fullWidth
          startIcon={<UploadIcon />}
          sx={{ mb: 2, py: 2 }}
        >
          Choisir un fichier
          <input
            type="file"
            hidden
            accept="image/*,application/pdf,application/msword,video/mp4,audio/mp3,application/zip"
            onChange={handleFileSelect}
          />
        </Button>

        {selectedFile && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Fichier: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
            </Typography>
            <Typography variant="body2" color="primary">
              Type: {getFileTypeLabel(selectedFile)}
            </Typography>
          </Box>
        )}

        <TextField
          fullWidth
          label="Description / Texte ALT"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          margin="normal"
          helperText="Description du fichier (important pour le SEO)"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!selectedFile || isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Uploader'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};