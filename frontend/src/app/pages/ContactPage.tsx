// frontend/src/app/pages/ContactPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AccessTime as TimeIcon,
  Send as SendIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
} from '@mui/icons-material';
import { PublicTopbar } from './PublicTopbar';
import { PublicFooter } from './PublicFooter';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici vous pouvez ajouter la logique d'envoi
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const contactInfo = [
    {
      icon: <LocationIcon sx={{ fontSize: 30 }} />,
      title: 'Adresse',
      value: '123 Rue de la Tech, 75000 Paris',
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 30 }} />,
      title: 'Téléphone',
      value: '+33 1 23 45 67 89',
    },
    {
      icon: <EmailIcon sx={{ fontSize: 30 }} />,
      title: 'Email',
      value: 'contact@reactbuilder.com',
    },
    {
      icon: <TimeIcon sx={{ fontSize: 30 }} />,
      title: 'Horaires',
      value: 'Lun - Ven: 9h - 18h',
    },
  ];

  const socials = [
    { icon: <FacebookIcon />, url: '#', color: '#1877F2' },
    { icon: <TwitterIcon />, url: '#', color: '#1DA1F2' },
    { icon: <LinkedInIcon />, url: '#', color: '#0A66C2' },
    { icon: <InstagramIcon />, url: '#', color: '#E4405F' },
  ];

  return (
    <Box>
      <PublicTopbar />

      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '30vh',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
          pt: 12,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography
                variant="overline"
                sx={{
                  color: '#00C49A',
                  fontWeight: 600,
                  letterSpacing: 2,
                }}
              >
                CONTACT
              </Typography>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  fontWeight: 800,
                  mb: 2,
                  color: '#0D0D0D',
                }}
              >
                Nous sommes <br />
                <span style={{ color: '#00C49A' }}>à votre écoute</span>
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#333333',
                  fontWeight: 400,
                }}
              >
                Une question ? Un projet ? N'hésitez pas à nous contacter.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contact Form & Info */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Contact Info */}
            <Grid item xs={12} md={4}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: '#0D0D0D',
                  mb: 4,
                }}
              >
                Informations
              </Typography>

              <Stack spacing={3}>
                {contactInfo.map((item, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Box
                        sx={{
                          bgcolor: '#e8f5e9',
                          borderRadius: '50%',
                          p: 1,
                          color: '#00C49A',
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          color: '#0D0D0D',
                        }}
                      >
                        {item.title}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#333333',
                        ml: 7,
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ my: 4 }} />

              <Typography variant="h6" gutterBottom fontWeight={600}>
                Suivez-nous
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {socials.map((social, index) => (
                  <IconButton
                    key={index}
                    component="a"
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      bgcolor: '#f5f5f5',
                      color: social.color,
                      '&:hover': {
                        bgcolor: social.color,
                        color: 'white',
                      },
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </Grid>

            {/* Contact Form */}
            <Grid item xs={12} md={8}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 4,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                }}
              >
                <Typography variant="h4" gutterBottom fontWeight={700} color="#0D0D0D">
                  Envoyez-nous un message
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Nous vous répondrons dans les plus brefs délais
                </Typography>

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Votre nom"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Votre email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Sujet"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Votre message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        multiline
                        rows={5}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        endIcon={<SendIcon />}
                        sx={{
                          bgcolor: '#00C49A',
                          borderRadius: '50px',
                          px: 4,
                          py: 1.5,
                          '&:hover': {
                            bgcolor: '#009e7c',
                          },
                        }}
                      >
                        {submitted ? 'Message envoyé !' : 'Envoyer'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>

                {submitted && (
                  <Box
                    sx={{
                      mt: 3,
                      p: 2,
                      bgcolor: '#e8f5e9',
                      borderRadius: 2,
                      color: '#00C49A',
                    }}
                  >
                    <Typography variant="body1" fontWeight={600}>
                      ✅ Votre message a été envoyé avec succès !
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <PublicFooter />
    </Box>
  );
};

export default ContactPage;