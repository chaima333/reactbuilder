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
  MenuItem,
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
    role: 'Viewer',
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
        setError(result.message || 'Erreur lors de l\'inscription');
      }
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  const roles = [
    { value: 'Viewer', label: 'Visiteur' },
    { value: 'Editor', label: 'Éditeur' },
    { value: 'Admin', label: 'Administrateur' },
  ];

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Paper sx={{ p: 4, width: '100%', borderRadius: 3 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700 }}>
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

            <TextField
              fullWidth
              select
              label="Rôle"
              name="role"
              value={formData.role}
              onChange={handleChange}
              margin="normal"
              helperText="Ce rôle détermine vos permissions"
            >
              {roles.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </TextField>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 3 }}
            >
              {isLoading ? <CircularProgress size={24} /> : "S'inscrire"}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Vous avez déjà un compte ?{' '}
              <Link component={RouterLink} to="/login" style={{ color: '#6366f1', textDecoration: 'none' }}>
                Se connecter
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

// ✅ AJOUTER L'EXPORT DEFAULT À LA FIN
export default Register;