import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Web as WebIcon,
  Edit as EditIcon,
  CloudUpload as UploadIcon,
  ArrowForward as ArrowIcon,
  CheckCircle as CheckIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  const [email, setEmail] = React.useState('');

  const features = [
    {
      icon: <SpeedIcon sx={{ fontSize: 35 }} />,
      title: 'Ultra Rapide',
      description: 'Temps de chargement optimisé',
    },
    {
      icon: <WebIcon sx={{ fontSize: 35 }} />,
      title: 'Responsive',
      description: 'S\'adapte à tous les écrans',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 35 }} />,
      title: 'Sécurisé',
      description: 'Hébergement sécurisé SSL',
    },
    {
      icon: <EditIcon sx={{ fontSize: 35 }} />,
      title: 'Sans Code',
      description: 'Glisser-déposer facile',
    },
  ];

  const stats = [
    { value: '10k+', label: 'Sites créés' },
    { value: '50k+', label: 'Utilisateurs' },
    { value: '99.9%', label: 'Disponibilité' },
    { value: '24/7', label: 'Support' },
  ];

  return (
    <Box>
      {/* Navigation */}
      <AppBar position="fixed" color="transparent" elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
            ReactBuilder
          </Typography>
          <Button color="inherit" component={Link} to="/login" sx={{ mr: 2, fontWeight: 500 }}>Connexion</Button>
          <Button variant="contained" component={Link} to="/register" sx={{ bgcolor: '#667eea', borderRadius: '50px', px: 3 }}>Commencer</Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section - Design épuré */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          pt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography 
                variant="h1" 
                sx={{ 
                  fontSize: { xs: '2.5rem', md: '4rem', lg: '4.5rem' }, 
                  fontWeight: 800, 
                  mb: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Créateur de site Web
              </Typography>
              <Typography variant="h5" sx={{ color: '#4a5568', mb: 4, fontWeight: 400 }}>
                Créez un magnifique site Web en quelques secondes
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  placeholder="Saisir le nom de votre entreprise"
                  variant="outlined"
                  size="medium"
                  sx={{ flex: 1, minWidth: 250, bgcolor: 'white', borderRadius: '50px' }}
                  InputProps={{
                    sx: { borderRadius: '50px' }
                  }}
                />
                <Button 
                  variant="contained" 
                  size="large"
                  endIcon={<ArrowIcon />}
                  sx={{ bgcolor: '#667eea', borderRadius: '50px', px: 4, py: 1.5 }}
                >
                  Commencer Maintenant
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  bgcolor: 'white',
                  borderRadius: 4,
                  p: 4,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Aperçu du tableau de bord
                </Typography>
                <Box sx={{ bgcolor: '#f7f7f7', borderRadius: 2, p: 2, mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" align="left">
                    📊 Dashboard • 🌐 Mes Sites • 🖼️ Médiathèque
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4} justifyContent="center">
          {stats.map((stat, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Box textAlign="center">
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#667eea' }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Construire Votre Vision */}
      <Box sx={{ bgcolor: '#f8f9fa', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
            Construire Votre Vision
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 400 }}>
            Nous ne construisons pas seulement des structures, nous bâtissons des rêves.
          </Typography>
          
          {/* Features grid */}
          <Grid container spacing={3} sx={{ mt: 4 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ textAlign: 'center', p: 2, boxShadow: 0, bgcolor: 'transparent' }}>
                  <Box sx={{ color: '#667eea', mb: 1 }}>{feature.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{feature.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{feature.description}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Restez connecté */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Restez connecté
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            La beauté est sur le point de s'épanouir
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <TextField
              placeholder="Votre email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ flex: 1, minWidth: 250, bgcolor: 'white' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button 
              variant="contained" 
              sx={{ bgcolor: '#667eea', borderRadius: '50px', px: 4 }}
            >
              S'abonner
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#1a1a2e', color: 'white', py: 4 }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            © {new Date().getFullYear()} ReactBuilder. Tous droits réservés.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;