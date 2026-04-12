import React, { useState } from 'react';
import {
  Box, Paper, TextField, Button, Typography,
  Container, Alert, CircularProgress, Divider, Link
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux'; // Ajouté
import axios from 'axios';
import { setCredentials } from '../redux/features/authSlice';

const BACKEND = 'https://backend-rmfq.onrender.com';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Initialisé

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const res = await axios.post(`${BACKEND}/api/auth/register`, form);

    navigate('/waiting-approval', {
      state: { message: res.data.message }
    });

  } catch (err: any) {
    setError(err?.response?.data?.message || 'Erreur inscription');
  } finally {
    setLoading(false);
  }
};
    const googleRegister = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    try {
      const userInfo = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
      );

      const res = await axios.post(`${BACKEND}/api/auth/google`, {
        email: userInfo.data.email,
        name: userInfo.data.name,
        googleId: userInfo.data.sub,
        avatar: userInfo.data.picture
      });

      const { state, accessToken, user, message } = res.data;

      // 🟡 PENDING → WAITING PAGE
     if (res.data.status === "PENDING") {
  navigate('/waiting-approval', {
    state: { message: res.data.message }
  });
  return;
}

      // 🟢 APPROVED → LOGIN
      if (state === "APPROVED") {
        dispatch(setCredentials({
          user,
          accessToken,
          refreshToken: res.data.refreshToken
        }));

        navigate('/dashboard');
      }

    } catch (err: any) {
      console.error(err);
    }
  }
}); 
  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography variant="h4" textAlign="center" gutterBottom>Register</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleRegister}>
            <TextField fullWidth label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} margin="normal" required />
            <TextField fullWidth label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} margin="normal" required />
            <TextField fullWidth label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} margin="normal" required />
            <Button fullWidth type="submit" variant="contained" disabled={loading} sx={{ mt: 3 }}>
              {loading ? <CircularProgress size={22} /> : 'Register'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>OR</Divider>

          <Button fullWidth variant="outlined" onClick={() => googleRegister()}>Continue with Google</Button>
          <Box textAlign="center" mt={2}>
            <Link component={RouterLink} to="/login">Already have an account?</Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};