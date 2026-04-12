import React, { useState, useEffect } from 'react';
import {
  Box, Paper, TextField, Button, Typography,
  Container, Alert, CircularProgress, Divider, Link
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { setCredentials } from '../redux/features/authSlice';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const BACKEND = 'https://backend-rmfq.onrender.com';

export const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Récupérer le message envoyé par navigate('/login', { state: { message: '...' } })
  const successMessage = location.state?.message;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${BACKEND}/api/auth/login`, { email, password });
      if (res.data.accessToken) {
        dispatch(setCredentials(res.data));
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

      const googleLogin = useGoogleLogin({
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

      console.log("LOGIN GOOGLE:", res.data);

      // 🔥 APPROVED
      if (res.data.state === "APPROVED") {
        dispatch(setCredentials({
          user: res.data.user,
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken
        }));

        navigate('/dashboard');
        return;
      }

      // 🔥 PENDING → GO TO WAITING PAGE (IMPORTANT FIX)
      if (res.data.state === "PENDING") {
        navigate('/waiting-approval', {
          state: { message: res.data.message }
        });
        return;
      }

    } catch (err) {
      console.log(err);
    }
  }
});

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography variant="h4" textAlign="center" gutterBottom>Login</Typography>

          {/* Affichage du message de succès venant de Register */}
          {successMessage && !error && (
            <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
          )}

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleLogin}>
            <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" required />
            <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" required />
            <Button fullWidth type="submit" variant="contained" disabled={loading} sx={{ mt: 3 }}>
              {loading ? <CircularProgress size={22} /> : 'Login'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>OR</Divider>
          <Button fullWidth variant="outlined" onClick={() => googleLogin()}>Continue with Google</Button>
          <Box textAlign="center" mt={2}>
            <Link component={RouterLink} to="/register">Create account</Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};