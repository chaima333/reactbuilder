import React, { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Container, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici l'appel API vers ton endpoint forgot-password
    setSent(true);
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper sx={{ p: 4, width: '100%', borderRadius: 3, boxShadow: 3 }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 700 }}>
            Récupération
          </Typography>
          
          {sent ? (
            <Alert severity="success">
              Si ce compte existe, un email a été envoyé.
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Entrez votre email pour recevoir un lien de réinitialisation.
              </Typography>
              <TextField 
                fullWidth label="Email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                sx={{ mb: 2 }}
              />
              <Button fullWidth type="submit" variant="contained">Envoyer</Button>
            </form>
          )}
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button component={RouterLink} to="/login" sx={{ textTransform: 'none' }}>
              Retour au login
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};