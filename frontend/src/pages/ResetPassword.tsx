import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Alert, 
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  CheckCircleOutline 
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUpdateProfileMutation } from '../redux/api/apiSlice'; // Ou un endpoint spécifique resetPassword si tu l'as créé

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token'); // Récupère le ?token=XYZ de l'URL

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Simulation ou appel API (Remplace par ton endpoint resetPassword réel si existant)
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
      // Remplace ceci par ton appel API réel :
      // await resetPassword({ token, password }).unwrap();
      
      console.log("Token utilisé:", token);
      console.log("Nouveau mot de passe:", password);

      // Simulation de succès
      setTimeout(() => {
        setStatus('success');
      }, 1500);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.data?.message || 'Le lien est invalide ou a expiré');
    }
  };

  if (status === 'success') {
    return (
      <Container maxWidth="xs">
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
          <Paper sx={{ p: 4, width: '100%', textAlign: 'center', borderRadius: 3 }}>
            <CheckCircleOutline sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>Réussi !</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Votre mot de passe a été réinitialisé avec succès.
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
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Choisissez un mot de passe robuste pour votre compte.
          </Typography>

          {!token && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Token manquant. Veuillez utiliser le lien reçu par email.
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
              {status === 'loading' ? <CircularProgress size={24} /> : "Réinitialiser"}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};