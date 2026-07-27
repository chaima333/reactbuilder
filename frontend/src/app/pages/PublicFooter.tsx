// frontend/src/app/Layout/PublicFooter.tsx
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Divider,
  IconButton,
  Stack,
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
} from '@mui/icons-material';

export const PublicFooter: React.FC = () => {
  const socials = [
    { icon: <FacebookIcon />, url: '#', color: '#1877F2' },
    { icon: <TwitterIcon />, url: '#', color: '#1DA1F2' },
    { icon: <LinkedInIcon />, url: '#', color: '#0A66C2' },
    { icon: <InstagramIcon />, url: '#', color: '#E4405F' },
  ];

  return (
    <Box sx={{ bgcolor: '#0D0D0D', color: 'white', py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: 700, color: '#00C49A' }}
            >
              ReactBuilder
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, lineHeight: 1.8, maxWidth: 300 }}>
              La plateforme de création de sites web la plus intuitive.
              Créez votre site professionnel en quelques minutes.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              {socials.map((social, index) => (
                <IconButton
                  key={index}
                  component="a"
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'white',
                    opacity: 0.5,
                    '&:hover': {
                      opacity: 1,
                      color: social.color,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Grid>
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Produit
            </Typography>
            <Typography variant="body2" component="div" sx={{ opacity: 0.7 }}>
              <Box component={Link} to="/features" sx={{ display: 'block', color: 'inherit', textDecoration: 'none', py: 0.5, '&:hover': { opacity: 1 } }}>Fonctionnalités</Box>
              <Box component={Link} to="/pricing" sx={{ display: 'block', color: 'inherit', textDecoration: 'none', py: 0.5, '&:hover': { opacity: 1 } }}>Tarifs</Box>
              <Box component={Link} to="/faq" sx={{ display: 'block', color: 'inherit', textDecoration: 'none', py: 0.5, '&:hover': { opacity: 1 } }}>FAQ</Box>
            </Typography>
          </Grid>
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Entreprise
            </Typography>
            <Typography variant="body2" component="div" sx={{ opacity: 0.7 }}>
              <Box component={Link} to="/about" sx={{ display: 'block', color: 'inherit', textDecoration: 'none', py: 0.5, '&:hover': { opacity: 1 } }}>À propos</Box>
              <Box component={Link} to="/blog" sx={{ display: 'block', color: 'inherit', textDecoration: 'none', py: 0.5, '&:hover': { opacity: 1 } }}>Blog</Box>
              <Box component={Link} to="/contact" sx={{ display: 'block', color: 'inherit', textDecoration: 'none', py: 0.5, '&:hover': { opacity: 1 } }}>Contact</Box>
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Légal
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              <Box component={Link} to="/terms" sx={{ display: 'block', color: 'inherit', textDecoration: 'none', py: 0.5, '&:hover': { opacity: 1 } }}>Conditions d'utilisation</Box>
              <Box component={Link} to="/privacy" sx={{ display: 'block', color: 'inherit', textDecoration: 'none', py: 0.5, '&:hover': { opacity: 1 } }}>Politique de confidentialité</Box>
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.06)' }} />
        <Typography variant="body2" align="center" sx={{ opacity: 0.5, fontSize: '0.85rem' }}>
          © {new Date().getFullYear()} ReactBuilder. Tous droits réservés.
        </Typography>
      </Container>
    </Box>
  );
};

export default PublicFooter;