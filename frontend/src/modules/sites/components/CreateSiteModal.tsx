import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';

interface CreateSiteModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
  isLoading?: boolean;
}

export const CreateSiteModal: React.FC<CreateSiteModalProps> = ({ 
  open, 
  onClose, 
  onCreate, 
  isLoading 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    title: '',
    description: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.subdomain || !formData.title) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    

    // 2. Assainissement strict (on enlève tout ce qui n'est pas lettre, chiffre ou tiret)
  const cleanSubdomain = formData.subdomain
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Enlève les accents
    .replace(/[^a-z0-9-]/g, ''); // Enlève tout sauf a-z, 0-9 et -

  const finalData = {
    ...formData,
    subdomain: cleanSubdomain
  };
  

    onCreate(formData);
    setFormData({ name: '', subdomain: '', title: '', description: '' });
    setError('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Créer un nouveau site</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Nom du site *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
            disabled={isLoading}
          />
          <TextField
            fullWidth
            label="Sous-domaine *"
            value={formData.subdomain}
            onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/\s/g, '') })}
            margin="normal"
            required
            disabled={isLoading}
            helperText="exemple: monsite (cela donnera monsite.reactbuilder.com)"
          />
          <TextField
            fullWidth
            label="Titre du site *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
            required
            disabled={isLoading}
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
            disabled={isLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>Annuler</Button>
          <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Créer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};