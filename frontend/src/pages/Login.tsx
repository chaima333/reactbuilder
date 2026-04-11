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
  Divider
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useLoginMutation } from '../redux/api/apiSlice';
import { setCredentials } from '../redux/features/authSlice';
import { useLanguage } from '../context/LanguageContext';

export const Login: React.FC = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('mouna@test.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    try {
      const result = await login({ email, password }).unwrap();
      
      if (result.success && result.accessToken && result.user) {
        dispatch(setCredentials({
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        }));
        navigate('/dashboard');
      } else {
        setError(t.error || 'Erreur de connexion');
      }
    } catch (err: any) {
      setError(err?.data?.message || t.error || 'Identifiants invalides');
    }
  };

  const handleGoogleLogin = () => {
    // Logique à connecter plus tard avec @react-oauth/google
    console.log("Tentative de connexion Google...");
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 4, width: '100%', borderRadius: 3, boxShadow: 3 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            ReactBuilder
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
            {t.login}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t.email}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              disabled={isLoading}
            />
            <TextField
              fullWidth
              label={t.password}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={isLoading}
            />

            <Box sx={{ textAlign: 'right', mt: 0.5 }}>
              <Link 
                component={RouterLink} 
                to="/forgot-password" 
                sx={{ fontSize: '0.85rem', textDecoration: 'none', color: '#6366f1', fontWeight: 500 }}
              >
                Mot de passe oublié ?
              </Link>
            </Box>

            <Button 
              fullWidth 
              type="submit" 
              variant="contained" 
              size="large" 
              disabled={isLoading} 
              sx={{ mt: 3, py: 1.5, fontWeight: 'bold', textTransform: 'none', borderRadius: 2 }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : t.login}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">OU</Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleLogin}
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
            Continuer avec Google
          </Button>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Pas encore de compte ?{' '}
              <Link component={RouterLink} to="/register" sx={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
                S'inscrire
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;