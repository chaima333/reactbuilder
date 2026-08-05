// frontend/src/app/pages/Home.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowForward as ArrowIcon,
  Email as EmailIcon,
  CheckCircle as CheckIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Storefront as StorefrontIcon,
  Support as SupportIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicTopbar } from './PublicTopbar';
import { PublicFooter } from './PublicFooter';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../modules/auth/hooks/useAuth';

// ✅ Animation variants corrects
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: "easeOut" as const 
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    }
  }
};

export const Home: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [companyNameError, setCompanyNameError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
  } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleStart = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const normalizedCompanyName =
      companyName.trim();

    if (!normalizedCompanyName) {
      setCompanyNameError(
        "Veuillez saisir le nom de votre entreprise."
      );

      return;
    }

    setCompanyNameError('');

    sessionStorage.setItem(
      'reactbuilder.pendingCompanyName',
      normalizedCompanyName
    );

    const encodedCompanyName =
      encodeURIComponent(
        normalizedCompanyName
      );

    if (!isAuthenticated) {
      const nextRoute =
        encodeURIComponent(
          '/sites?create=1'
        );

      navigate(
        `/register?next=${nextRoute}&companyName=${encodedCompanyName}`
      );

      return;
    }

    const canCreateSite =
      user?.role === 'ADMIN' ||
      user?.role === 'EDITOR';

    if (canCreateSite) {
      navigate(
        `/sites?create=1&name=${encodedCompanyName}`
      );

      return;
    }

    navigate('/dashboard');
  };

  const features = [
    {
      icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
      title: 'Performance Optimale',
      description: 'Temps de chargement ultra-rapide pour une expérience fluide',
      color: '#00C49A',
    },
    {
      icon: <StorefrontIcon sx={{ fontSize: 32 }} />,
      title: 'Design Responsive',
      description: "S'adapte parfaitement à tous les écrans et appareils",
      color: '#00C49A',
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 32 }} />,
      title: 'Sans Code',
      description: 'Créez votre site sans écrire une seule ligne de code',
      color: '#00C49A',
    },
    {
      icon: <SupportIcon sx={{ fontSize: 32 }} />,
      title: 'Support 24/7',
      description: 'Une équipe dédiée à votre disposition en permanence',
      color: '#00C49A',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Sites créés', icon: <StorefrontIcon /> },
    { value: '50,000+', label: 'Utilisateurs actifs', icon: <PeopleIcon /> },
    { value: '99.9%', label: 'Taux de disponibilité', icon: <TrendingUpIcon /> },
    { value: '24/7', label: 'Support client', icon: <SupportIcon /> },
  ];

  const testimonials = [
    {
      name: 'Jean Dupont',
      role: 'CEO, TechStart',
      avatar: 'JD',
      text: 'Une révolution dans la création de sites web. ReactBuilder nous a permis de lancer notre site en moins d\'une heure.',
      rating: 5,
      company: 'TechStart',
    },
    {
      name: 'Marie Martin',
      role: 'Fondatrice, EcoSolutions',
      avatar: 'MM',
      text: 'La simplicité d\'utilisation est incroyable. Je recommande vivement à tous les entrepreneurs.',
      rating: 5,
      company: 'EcoSolutions',
    },
    {
      name: 'Pierre Durand',
      role: 'Freelance Designer',
      avatar: 'PD',
      text: 'Les templates sont d\'une qualité exceptionnelle. Un outil indispensable pour les créatifs.',
      rating: 5,
      company: 'DesignStudio',
    },
  ];

  return (
    <Box>
      <PublicTopbar />

      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f8fdf9 0%, #e8f5e9 50%, #c8e6c9 100%)',
          pt: 8,
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,196,154,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,196,154,0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <motion.div
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp}>
                  <Chip
                    label="✨ Nouvelle version 2.0"
                    sx={{
                      bgcolor: '#00C49A',
                      color: 'white',
                      fontWeight: 600,
                      mb: 3,
                      borderRadius: '50px',
                      px: 2,
                    }}
                  />
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '2.5rem', md: '4rem', lg: '4.5rem' },
                      fontWeight: 800,
                      mb: 2,
                      color: '#0D0D0D',
                      lineHeight: 1.1,
                    }}
                  >
                    Créez votre site web{' '}
                    <Box
                      component="span"
                      sx={{
                        color: '#00C49A',
                        position: 'relative',
                        display: 'inline-block',
                      }}
                    >
                      en quelques secondes
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          bgcolor: '#00C49A',
                          borderRadius: '50px',
                          opacity: 0.3,
                        }}
                      />
                    </Box>
                  </Typography>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#4a5568',
                      mb: 4,
                      fontWeight: 400,
                      lineHeight: 1.8,
                      maxWidth: 600,
                    }}
                  >
                    La plateforme de création de sites web la plus intuitive.
                    Design moderne, performances optimales, sans aucune compétence technique.
                  </Typography>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Box
                    component="form"
                    onSubmit={handleStart}
                    noValidate
                    sx={{
                      display: 'flex',
                      gap: 2,
                      flexWrap: 'wrap',
                    }}
                  >
                    <TextField
                      placeholder="Saisir le nom de votre entreprise"
                      value={companyName}
                      onChange={(event) => {
                        setCompanyName(
                          event.target.value
                        );

                        if (companyNameError) {
                          setCompanyNameError('');
                        }
                      }}
                      error={Boolean(companyNameError)}
                      helperText={companyNameError}
                      inputProps={{
                        maxLength: 80,
                      }}
                      variant="outlined"
                      size="medium"
                      sx={{
                        flex: 1,
                        minWidth: 250,
                        bgcolor: 'white',
                        borderRadius: '50px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '50px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        },
                      }}
                    />
                    <motion.div 
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }}
                      style={{ display: 'inline-block' }}
                    >
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        endIcon={<ArrowIcon />}
                        sx={{
                          bgcolor: '#00C49A',
                          borderRadius: '50px',
                          px: 4,
                          py: 1.5,
                          '&:hover': {
                            bgcolor: '#009e7c',
                            boxShadow: '0 8px 24px rgba(0,196,154,0.4)',
                          },
                        }}
                      >
                        Commencer Maintenant
                      </Button>
                    </motion.div>
                  </Box>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<CheckIcon sx={{ fontSize: 16 }} />}
                      label="Sans engagement"
                      sx={{
                        bgcolor: 'white',
                        borderRadius: '50px',
                        py: 1,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      }}
                    />
                    <Chip
                      icon={<CheckIcon sx={{ fontSize: 16 }} />}
                      label="Essai gratuit 14 jours"
                      sx={{
                        bgcolor: 'white',
                        borderRadius: '50px',
                        py: 1,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      }}
                    />
                    <Chip
                      icon={<CheckIcon sx={{ fontSize: 16 }} />}
                      label="Annulation facile"
                      sx={{
                        bgcolor: 'white',
                        borderRadius: '50px',
                        py: 1,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      }}
                    />
                  </Box>
                </motion.div>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={5}>
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Box
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 4,
                    p: 4,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: 'linear-gradient(90deg, #00C49A, #009e7c)',
                    }}
                  />
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                    Aperçu du tableau de bord
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: '#f8fdf9',
                      borderRadius: 2,
                      p: 3,
                      mt: 2,
                      border: '1px solid #e8f5e9',
                    }}
                  >
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#00C49A' }} />
                        <Typography variant="body2" color="text.secondary">📊 Dashboard</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#00C49A' }} />
                        <Typography variant="body2" color="text.secondary">🌐 Mes Sites</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#00C49A' }} />
                        <Typography variant="body2" color="text.secondary">🖼️ Médiathèque</Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 8, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8 }}
                >
                  <Card
                    sx={{
                      textAlign: 'center',
                      p: 3,
                      borderRadius: 4,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                      border: '1px solid #e8f5e9',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#00C49A',
                        boxShadow: '0 8px 24px rgba(0,196,154,0.12)',
                      },
                    }}
                  >
                    <Box sx={{ color: '#00C49A', mb: 1 }}>{stat.icon}</Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        color: '#0D0D0D',
                        fontSize: { xs: '1.8rem', md: '2.5rem' },
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      {stat.label}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ bgcolor: '#f8fdf9', py: 10 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h2"
              align="center"
              gutterBottom
              sx={{
                fontWeight: 800,
                color: '#0D0D0D',
                fontSize: { xs: '2rem', md: '3rem' },
                mb: 2,
              }}
            >
              Pourquoi choisir ReactBuilder ?
            </Typography>
            <Typography
              variant="h6"
              align="center"
              color="text.secondary"
              sx={{ mb: 6, fontWeight: 400 }}
            >
              Une plateforme complète pour créer un site web professionnel
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8 }}
                >
                  <Card
                    sx={{
                      textAlign: 'center',
                      p: 3,
                      borderRadius: 4,
                      height: '100%',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                      border: '1px solid transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#00C49A',
                        boxShadow: '0 8px 32px rgba(0,196,154,0.12)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'inline-flex',
                        p: 1.5,
                        borderRadius: '50%',
                        bgcolor: '#e8f5e9',
                        color: '#00C49A',
                        mb: 2,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 10, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h2"
              align="center"
              gutterBottom
              sx={{
                fontWeight: 800,
                color: '#0D0D0D',
                fontSize: { xs: '2rem', md: '3rem' },
                mb: 2,
              }}
            >
              Ce que disent nos utilisateurs
            </Typography>
            <Typography
              variant="h6"
              align="center"
              color="text.secondary"
              sx={{ mb: 6, fontWeight: 400 }}
            >
              Des milliers d'entreprises nous font confiance
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      height: '100%',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                      border: '1px solid #f0f0f0',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#00C49A',
                        boxShadow: '0 8px 32px rgba(0,196,154,0.1)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 50,
                          height: 50,
                          bgcolor: '#00C49A',
                          mr: 2,
                          fontWeight: 700,
                          fontSize: '1rem',
                        }}
                      >
                        {testimonial.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontStyle: 'italic',
                        lineHeight: 1.8,
                        mb: 2,
                      }}
                    >
                      "{testimonial.text}"
                    </Typography>
                    <Box sx={{ color: '#ffc107' }}>
                      {'★'.repeat(testimonial.rating)}
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 10,
          background: 'linear-gradient(135deg, #00C49A 0%, #009e7c 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            pointerEvents: 'none',
          }}
        />
        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography variant="h2" gutterBottom fontWeight={800} sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
              Prêt à créer votre site web ?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, fontWeight: 400 }}>
              Rejoignez des milliers d'entreprises qui utilisent ReactBuilder
            </Typography>
            <motion.div 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              style={{ display: 'inline-block' }}
            >
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowIcon />}
                sx={{
                  bgcolor: 'white',
                  color: '#00C49A',
                  borderRadius: '50px',
                  px: 5,
                  py: 1.8,
                  fontWeight: 700,
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  },
                }}
              >
                Commencer gratuitement
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </Box>

      <PublicFooter />
    </Box>
  );
};

export default Home;