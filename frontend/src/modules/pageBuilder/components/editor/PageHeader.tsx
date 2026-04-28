// src/modules/pageBuilder/components/PageHeader.tsx
import React from 'react';
import { AppBar, Toolbar, TextField, Button, CircularProgress } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

interface PageHeaderProps {
  title: string;
  onChange: (val: string) => void;
  onSave: () => void;
  loading: boolean;
  onPreview: () => void; 
  isPreview: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, onChange, onSave, loading, onPreview, isPreview }) => {
  return (
    <AppBar position="static" color="inherit" elevation={1}>
      <Toolbar sx={{ gap: 2 }}>
        <TextField
          variant="standard"
          value={title}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Titre de la page..."
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={onSave}
          disabled={loading}
        >
          {loading ? 'Enregistrement...' : 'Sauvegarder'}
        </Button>
        <Button
          variant="outlined"
          onClick={onPreview}
        >
          {isPreview ? 'Quitter le mode aperçu' : 'Mode aperçu'}
        </Button>
      </Toolbar>
    </AppBar>
  );
};