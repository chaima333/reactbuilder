import React, { useState } from 'react';
import { 
  Box, Paper, TextField, Button, Typography, Container, 
  Alert, CircularProgress, IconButton, InputAdornment 
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircleOutline } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export const ResetPassword = () => {
  const { token } = useParams(); // 🔥 Récupère le :token depuis la route App.tsx
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setErrorMsg('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      // 🚀 Appel API avec le token dans l'URL
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`, { 
        password 
      });
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.response?.data?.message || 'Le lien est invalide ou a expiré');
    }
  };

  if (status === 'success') {
    return (
      <Container maxWidth="xs">
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
          <Paper sx={{ p: 4, width: '100%', textAlign: 'center', borderRadius: 3 }}>
            <CheckCircleOutline sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>Mot de passe mis à jour !</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </Typography>
            <Button fullWidth variant="contained" onClick={() => navigate('/login')}>
              Se connecter
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xs">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper sx={{ p: 4, width: '100%', borderRadius: 3, boxShadow: 3 }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 700 }}>
            Nouveau mot de passe
          </Typography>

          {!token && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Lien invalide (token manquant).
            </Alert>
          )}

          {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nouveau mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={status === 'loading' || !token}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirmer le mot de passe"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={status === 'loading' || !token}
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={status === 'loading' || !token}
              sx={{ py: 1.5, fontWeight: 'bold' }}
            >
              {status === 'loading' ? <CircularProgress size={24} /> : "Changer le mot de passe"}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};