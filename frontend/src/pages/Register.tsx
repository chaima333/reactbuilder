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
import { useRegisterMutation } from '../redux/api/apiSlice';

export const Register: React.FC = () => {
  const navigate = useNavigate();
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