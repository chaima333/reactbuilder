import React, { useState } from 'react';
import { 
  Box, Paper, TextField, Button, Typography, Container, 
  Alert, CircularProgress, alpha, useTheme 
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });
      setSent(true);
    } catch (err: any) {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper sx={{ p: 5, width: '100%', borderRadius: 4 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
            Récupération
          </Typography>
          
          {sent ? (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              Si ce compte existe, un email a été envoyé avec les instructions.
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', textAlign: 'center' }}>
                Entrez votre email pour recevoir un lien de réinitialisation.
              </Typography>
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField 
                fullWidth 
                label="Email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                sx={{ mb: 3 }}
                disabled={loading}
              />
              <Button 
                fullWidth 
                type="submit" 
                variant="contained" 
                disabled={loading}
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 600 }}
              >
                {loading ? <CircularProgress size={24} /> : "Envoyer le lien"}
              </Button>
            </form>
          )}
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button 
              component={RouterLink} 
              to="/login" 
              sx={{ textTransform: 'none' }}
            >
              Retour au login
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};