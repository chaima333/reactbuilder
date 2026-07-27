// frontend/src/app/pages/ServicesPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import {
  Web as WebIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Devices as DevicesIcon,
  Analytics as AnalyticsIcon,
  ArrowForward as ArrowIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PublicTopbar } from './PublicTopbar';
import { PublicFooter } from './PublicFooter';

// Animation variants
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

export const ServicesPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const services = [
    {
      icon: <WebIcon sx={{ fontSize: 40 }} />,
      title: 'Création de Sites Web',
      description: 'Des sites web modernes, rapides et responsives.',
      features: ['Design personnalisé', 'Responsive', 'Optimisation SEO'],
    },
    {
      icon: <CodeIcon sx={{ fontSize: 40 }} />,
      title: 'Développement Web',
      description: 'Applications web sur mesure avec les technologies récentes.',
      features: ['React/Next.js', 'API REST', 'Base de données'],
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Sécurité & Hébergement',
      description: 'Hébergement sécurisé et protection de vos données.',
      features: ['SSL', 'Sauvegarde', 'Protection DDoS'],
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: 'Optimisation Performance',
      description: 'Améliorez la vitesse de votre site.',
      features: ['Lazy loading', 'Caching', 'CDN'],
    },
    {
      icon: <DevicesIcon sx={{ fontSize: 40 }} />,
      title: 'Design UI/UX',
      description: 'Des interfaces intuitives pour vos utilisateurs.',
      features: ['Maquettes Figma', 'Design System'],
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      title: 'Analytics & Suivi',
      description: 'Analysez les performances de votre site.',
      features: ['Google Analytics', 'Tableaux de bord'],
    },
  ];

  return (
    <Box>
      <PublicTopbar />

      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f8fdf9 0%, #e8f5e9 50%, #c8e6c9 100%)',
          pt: 10,
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -150,
            right: -150,
            width: 500,
            height: 500,
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
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,196,154,0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={8}>
              <motion.div
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp}>
                  <Chip
                    label=" Nos services"
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
                      fontSize: { xs: '2.8rem', md: '4.2rem' },
                      fontWeight: 800,
                      mb: 2,
                      color: '#0D0D0D',
                      lineHeight: 1.1,
                    }}
                  >
                    Des solutions{' '}
                    <Box
                      component="span"
                      sx={{
                        color: '#00C49A',
                        position: 'relative',
                        display: 'inline-block',
                      }}
                    >
                      web sur mesure
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 4,
                          left: 0,
                          right: 0,
                          height: 6,
                          bgcolor: '#00C49A',
                          borderRadius: '50px',
                          opacity: 0.2,
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
                    }}
                  >
                    Nous vous accompagnons dans la création de votre présence en ligne,
                    du design à la mise en production.
                  </Typography>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ display: 'inline-block' }}>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowIcon />}
                      sx={{
                        bgcolor: '#00C49A',
                        borderRadius: '50px',
                        px: 5,
                        py: 1.5,
                        '&:hover': {
                          bgcolor: '#009e7c',
                          boxShadow: '0 8px 24px rgba(0,196,154,0.4)',
                        },
                      }}
                      component={Link}
                      to="/contact"
                    >
                      Demander un devis
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services Grid */}
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
               Nos Services
            </Typography>
            <Typography
              variant="h6"
              align="center"
              color="text.secondary"
              sx={{ mb: 6, fontWeight: 400 }}
            >
              Découvrez tout ce que nous pouvons faire pour vous
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {services.map((service, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8 }}
                >
                  <Card
                    sx={{
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
                      {service.icon}
                    </Box>
                    <Typography variant="h5" gutterBottom fontWeight={700}>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                      {service.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {service.features.map((feature, i) => (
                        <Chip
                          key={i}
                          label={feature}
                          size="small"
                          icon={<CheckIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            bgcolor: '#e8f5e9',
                            color: '#00C49A',
                            fontWeight: 500,
                            '& .MuiChip-icon': {
                              color: '#00C49A',
                            },
                          }}
                        />
                      ))}
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
              Prêt à démarrer votre projet ?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, fontWeight: 400 }}>
              Contactez-nous pour discuter de vos besoins
            </Typography>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ display: 'inline-block' }}>
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
                component={Link}
                to="/contact"
              >
                Nous contacter
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </Box>

      <PublicFooter />
    </Box>
  );
};

export default ServicesPage;