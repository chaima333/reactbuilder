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
  Link
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
        setError(t.error);
      }
    } catch (err: any) {
      setError(err?.data?.message || t.error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" align="center" gutterBottom>
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
            <Button fullWidth type="submit" variant="contained" size="large" disabled={isLoading} sx={{ mt: 3 }}>
              {isLoading ? <CircularProgress size={24} /> : t.login}
            </Button>
          </form>

          {/* Lien vers l'inscription - À L'INTÉRIEUR du return */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Pas encore de compte ?{' '}
              <Link component={RouterLink} to="/register" style={{ color: '#6366f1', textDecoration: 'none' }}>
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