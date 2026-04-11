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
  Link,
  Divider,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useRegisterMutation } from '../redux/api/apiSlice';
import { setCredentials } from '../redux/features/authSlice';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      const result = await register(formData).unwrap();
      if (result.success) {
        navigate('/login');
      } else {
        setError(result.message || "Erreur lors de l'inscription");
      }
    } catch (err: any) {
      setError(err?.data?.message || "Erreur lors de l'inscription");
    }
  };

  // 🔥 Inscription avec Google
  const googleRegister = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      try {
        // Récupérer les infos utilisateur depuis Google
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
          }
        );

        console.log('Google User Info:', userInfo.data);

        // Envoyer au backend pour création de compte
        const response = await axios.post(
          'https://backend-rmfq.onrender.com/api/auth/google',
          {
            email: userInfo.data.email,
            name: userInfo.data.name,
            googleId: userInfo.data.sub,
            avatar: userInfo.data.picture,
          }
        );

        console.log('Backend response:', response.data);

        if (response.data.success) {
          // Connexion automatique après inscription Google
          dispatch(setCredentials({
            user: response.data.user,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken
          }));
          navigate('/dashboard');
        } else {
          setError(response.data.message || 'Erreur lors de l\'inscription Google');
        }
      } catch (err: any) {
        console.error('Google register error:', err);
        setError(err?.response?.data?.message || 'Erreur lors de l\'inscription Google');
      }
    },
    onError: () => {
      setError('L\'inscription avec Google a échoué');
    },
  });

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Paper sx={{ p: 4, width: '100%', borderRadius: 3, boxShadow: 3 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            ReactBuilder
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Créez votre compte gratuitement
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nom complet"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
              autoFocus
            />
            
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Mot de passe"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              helperText="Minimum 6 caractères"
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 3, py: 1.5, fontWeight: 'bold', textTransform: 'none', borderRadius: 2 }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : "S'inscrire"}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">OU</Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => googleRegister()}
            startIcon={<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="G" />}
            sx={{ 
              py: 1.2, 
              textTransform: 'none', 
              borderColor: '#e0e0e0', 
              color: '#444', 
              borderRadius: 2,
              '&:hover': { borderColor: '#bdbdbd', bgcolor: '#f5f5f5' }
            }}
          >
            S'inscrire avec Google
          </Button>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Vous avez déjà un compte ?{' '}
              <Link component={RouterLink} to="/login" sx={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
                Se connecter
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );    
};

export default Register;