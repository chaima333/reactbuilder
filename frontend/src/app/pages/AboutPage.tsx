// frontend/src/app/pages/AboutPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import {
  EmojiObjects as MissionIcon,
  History as HistoryIcon,
  TrendingUp as GrowthIcon,
  Security as TrustIcon,
  Speed as SpeedIcon,
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

export const AboutPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const team = [
    {
      name: 'Ahmed Ben Ali',
      role: 'CEO & Fondateur',
      avatar: 'AB',
      bio: 'Expert en développement web avec 15 ans d\'expérience',
    },
    {
      name: 'Sara Mansouri',
      role: 'CTO',
      avatar: 'SM',
      bio: 'Architecte logiciel spécialisée en SaaS',
    },
    {
      name: 'Mehdi Chaabane',
      role: 'Lead Designer',
      avatar: 'MC',
      bio: 'Designer UI/UX primé',
    },
    {
      name: 'Nadia Khelifi',
      role: 'Product Manager',
      avatar: 'NK',
      bio: 'Passionnée par l\'innovation produit',
    },
  ];

  const values = [
    {
      icon: <TrustIcon sx={{ fontSize: 40 }} />,
      title: 'Confiance',
      description: 'Nous bâtissons des relations durables avec nos clients',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: 'Performance',
      description: 'Des solutions rapides et efficaces',
    },
    {
      icon: <GrowthIcon sx={{ fontSize: 40 }} />,
      title: 'Innovation',
      description: 'Nous repoussons les limites de la technologie',
    },
  ];

  const features = [
    'Design personnalisé',
    'Support 24/7',
    'Sans code',
    'SEO optimisé',
  ];

  return (
    <Box>
      <PublicTopbar />

      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '70vh',
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
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,196,154,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -200,
            left: -200,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,196,154,0.06) 0%, transparent 70%)',
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
                    label="✨ Notre histoire"
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
                    Nous rendons le web{' '}
                    <Box
                      component="span"
                      sx={{
                        color: '#00C49A',
                        position: 'relative',
                        display: 'inline-block',
                      }}
                    >
                      accessible
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
                    <br />
                    pour tous
                  </Typography>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#4a5568',
                      mb: 3,
                      fontWeight: 400,
                      lineHeight: 1.8,
                    }}
                  >
                    Nous croyons que chaque entreprise mérite un site web professionnel,
                    sans avoir besoin de compétences techniques.
                  </Typography>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Stack direction="row" spacing={1} sx={{ mb: 4, flexWrap: 'wrap', gap: 1 }}>
                    {features.map((feature, index) => (
                      <Chip
                        key={index}
                        icon={<CheckIcon sx={{ fontSize: 16 }} />}
                        label={feature}
                        sx={{
                          bgcolor: 'white',
                          borderRadius: '50px',
                          border: '1px solid #e8f5e9',
                          '& .MuiChip-icon': {
                            color: '#00C49A',
                          },
                        }}
                      />
                    ))}
                  </Stack>
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
                      Contactez-nous
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </Grid>

            {/* ✅ Stats Section Supprimée */}
          </Grid>
        </Container>
      </Box>

      {/* Mission & Histoire */}
      <Box sx={{ py: 10, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -8 }}
              >
                <Box
                  sx={{
                    bgcolor: '#f8fdf9',
                    borderRadius: 4,
                    p: 5,
                    textAlign: 'center',
                    border: '1px solid #e8f5e9',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#00C49A',
                      boxShadow: '0 8px 32px rgba(0,196,154,0.08)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: '#e8f5e9',
                      color: '#00C49A',
                      mb: 2,
                    }}
                  >
                    <MissionIcon sx={{ fontSize: 50 }} />
                  </Box>
                  <Typography variant="h4" gutterBottom fontWeight={700}>
                    Notre Mission
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    Démocratiser la création de sites web professionnels.
                    Nous offrons des outils simples et puissants pour que
                    chacun puisse donner vie à ses idées en ligne.
                  </Typography>
                </Box>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ y: -8 }}
              >
                <Box
                  sx={{
                    bgcolor: '#f8fdf9',
                    borderRadius: 4,
                    p: 5,
                    textAlign: 'center',
                    border: '1px solid #e8f5e9',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#00C49A',
                      boxShadow: '0 8px 32px rgba(0,196,154,0.08)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: '#e8f5e9',
                      color: '#00C49A',
                      mb: 2,
                    }}
                  >
                    <HistoryIcon sx={{ fontSize: 50 }} />
                  </Box>
                  <Typography variant="h4" gutterBottom fontWeight={700}>
                    Notre Histoire
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    Fondée en 2020, ReactBuilder est née de la volonté de
                    simplifier la création web. Aujourd'hui, nous accompagnons
                    plus de 50 000 utilisateurs dans le monde.
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Nos Valeurs */}
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
              Nos Valeurs
            </Typography>
            <Typography
              variant="h6"
              align="center"
              color="text.secondary"
              sx={{ mb: 6, fontWeight: 400 }}
            >
              Ce qui nous guide au quotidien
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} md={4} key={index}>
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
                      p: 4,
                      borderRadius: 4,
                      height: '100%',
                      border: '1px solid transparent',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
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
                        p: 2,
                        borderRadius: '50%',
                        bgcolor: '#e8f5e9',
                        color: '#00C49A',
                        mb: 2,
                      }}
                    >
                      {value.icon}
                    </Box>
                    <Typography variant="h5" gutterBottom fontWeight={700}>
                      {value.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {value.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* L'Équipe */}
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
              👥 L'Équipe
            </Typography>
            <Typography
              variant="h6"
              align="center"
              color="text.secondary"
              sx={{ mb: 6, fontWeight: 400 }}
            >
              Des passionnés au service de votre projet
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {team.map((member, index) => (
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
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: '#00C49A',
                        fontSize: 32,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      {member.avatar}
                    </Avatar>
                    <Typography variant="h6" fontWeight={700}>
                      {member.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="#00C49A"
                      fontWeight={600}
                      display="block"
                    >
                      {member.role}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1, lineHeight: 1.6 }}
                    >
                      {member.bio}
                    </Typography>
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
              Prêt à commencer ?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, fontWeight: 400 }}>
              Rejoignez des milliers d'utilisateurs qui créent déjà leur site
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
                to="/register"
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

export default AboutPage;