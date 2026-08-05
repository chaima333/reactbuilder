// frontend/src/app/pages/Home.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  TextField,
  Avatar,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  Paper,
  IconButton,
} from '@mui/material';
import {
  ArrowForward as ArrowIcon,
  CheckCircle as CheckIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Storefront as StorefrontIcon,
  Support as SupportIcon,
  Speed as SpeedIcon,
  DesignServices as DesignIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  ChevronRight as ChevronRightIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import {
  motion,
  useScroll,
  useTransform,
  type Variants,
  type TargetAndTransition,
} from 'framer-motion';
import { PublicTopbar } from './PublicTopbar';
import { PublicFooter } from './PublicFooter';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../modules/auth/hooks/useAuth';

// ✅ Animations Framer Motion typées
const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

const floatAnimation: TargetAndTransition = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const Home: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [companyNameError, setCompanyNameError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const theme = useTheme();

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // ✅ Function pour le bouton "Commencer gratuitement" (CTA)
  const handleBottomStart = () => {
    if (!isAuthenticated) {
      navigate("/register");
      return;
    }

    const canCreateSite = user?.role === "ADMIN" || user?.role === "EDITOR";

    if (canCreateSite) {
      navigate("/sites");
      return;
    }

    navigate("/dashboard");
  };

  // ✅ Function pour le formulaire principal
  const handleStart = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedCompanyName = companyName.trim();

    if (!normalizedCompanyName) {
      setCompanyNameError("Veuillez saisir le nom de votre entreprise.");
      return;
    }

    setCompanyNameError('');

    sessionStorage.setItem(
      'reactbuilder.pendingCompanyName',
      normalizedCompanyName
    );

    const encodedCompanyName = encodeURIComponent(normalizedCompanyName);

    if (!isAuthenticated) {
      const nextRoute = encodeURIComponent('/sites?create=1');
      navigate(`/register?next=${nextRoute}&companyName=${encodedCompanyName}`);
      return;
    }

    const canCreateSite = user?.role === 'ADMIN' || user?.role === 'EDITOR';

    if (canCreateSite) {
      navigate(`/sites?create=1&name=${encodedCompanyName}`);
      return;
    }

    navigate('/dashboard');
  };

  const features = [
    {
      icon: <SpeedIcon sx={{ fontSize: 32 }} />,
      title: 'Performance Ultra-Rapide',
      description: 'Temps de chargement optimisé pour une expérience utilisateur exceptionnelle',
      color: '#00C49A',
      bg: '#E8F5E9',
    },
    {
      icon: <DesignIcon sx={{ fontSize: 32 }} />,
      title: 'Design Moderne & Élégant',
      description: 'Des templates premium qui captivent vos visiteurs dès le premier regard',
      color: '#6C63FF',
      bg: '#EDE7F6',
    },
    {
      icon: <CodeIcon sx={{ fontSize: 32 }} />,
      title: '100% Sans Code',
      description: 'Créez votre site professionnel sans aucune compétence technique requise',
      color: '#FF6B6B',
      bg: '#FFEBEE',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 32 }} />,
      title: 'Sécurité & Fiabilité',
      description: 'Protection avancée et sauvegarde automatique pour votre tranquillité',
      color: '#4ECDC4',
      bg: '#E0F7FA',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Sites Créés', icon: <StorefrontIcon sx={{ fontSize: 28 }} />, delay: 0.1 },
    { value: '50,000+', label: 'Utilisateurs Actifs', icon: <PeopleIcon sx={{ fontSize: 28 }} />, delay: 0.2 },
    { value: '99.9%', label: 'Disponibilité', icon: <TrendingUpIcon sx={{ fontSize: 28 }} />, delay: 0.3 },
    { value: '24/7', label: 'Support Client', icon: <SupportIcon sx={{ fontSize: 28 }} />, delay: 0.4 },
  ];

  const testimonials = [
    {
      name: 'Jean Dupont',
      role: 'CEO, TechStart',
      avatar: 'JD',
      text: 'Une révolution dans la création de sites web. ReactBuilder nous a permis de lancer notre site en moins d\'une heure.',
      rating: 5,
    },
    {
      name: 'Marie Martin',
      role: 'Fondatrice, EcoSolutions',
      avatar: 'MM',
      text: 'La simplicité d\'utilisation est incroyable. Je recommande vivement à tous les entrepreneurs.',
      rating: 5,
    },
    {
      name: 'Pierre Durand',
      role: 'Freelance Designer',
      avatar: 'PD',
      text: 'Les templates sont d\'une qualité exceptionnelle. Un outil indispensable pour les créatifs.',
      rating: 5,
    },
  ];

  return (
    <Box ref={containerRef}>
      <PublicTopbar />

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #f8fdf9 0%, #f0faf5 30%, #e8f5e9 70%, #dcedc8 100%)',
          pt: { xs: 8, md: 10 },
          pb: { xs: 6, md: 10 },
        }}
      >
        {/* Éléments décoratifs flottants */}
        <motion.div
          style={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,196,154,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
          animate={floatAnimation}
        />
        <motion.div
          style={{
            position: 'absolute',
            bottom: '15%',
            left: '5%',
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(108,99,255,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
          animate={{
            y: [0, 15, 0],
            transition: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }
          }}
        />
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60%',
            height: '60%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,196,154,0.03) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
          animate={{
            scale: [1, 1.2, 1],
            transition: {
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        />

        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center" justifyContent="center">
            <Grid
              item
              xs={12}
              md={10}
              lg={9}
              sx={{
                mx: 'auto',
                textAlign: 'center',
              }}
            >
              <motion.div
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp}>
                  <Chip
                    icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
                    label="✨ Nouvelle Version 2.0"
                    sx={{
                      bgcolor: 'white',
                      color: '#00C49A',
                      fontWeight: 600,
                      mb: 3,
                      borderRadius: '50px',
                      px: 3,
                      py: 2.5,
                      border: '1px solid rgba(0,196,154,0.2)',
                      boxShadow: '0 4px 20px rgba(0,196,154,0.15)',
                      '& .MuiChip-label': {
                        fontSize: '0.85rem',
                        px: 1,
                      },
                      '&:hover': {
                        boxShadow: '0 6px 28px rgba(0,196,154,0.25)',
                      },
                    }}
                  />
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '2.5rem', sm: '3.2rem', md: '3.6rem', lg: '4.2rem' },
                      fontWeight: 800,
                      mb: 2,
                      color: '#0D0D0D',
                      lineHeight: 1.1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Créez votre site web{' '}
                    <Box
                      component="span"
                      sx={{
                        background: 'linear-gradient(135deg, #00C49A 0%, #00A67E 50%, #6C63FF 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        position: 'relative',
                        display: 'inline-block',
                      }}
                    >
                      en quelques secondes
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 4,
                          left: 0,
                          right: 0,
                          height: 4,
                          background: 'linear-gradient(90deg, #00C49A, #6C63FF)',
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
                      color: '#5A6B7C',
                      mb: 4,
                      fontWeight: 400,
                      lineHeight: 1.8,
                      maxWidth: 700,
                      mx: 'auto',
                      fontSize: { xs: '1rem', md: '1.1rem' },
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
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 2,
                      maxWidth: 760,
                      mx: 'auto',
                      bgcolor: 'white',
                      p: 1,
                      borderRadius: '60px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 12px 40px rgba(0,196,154,0.12)',
                        borderColor: 'rgba(0,196,154,0.2)',
                      },
                    }}
                  >
                    <TextField
                      placeholder="Nom de votre entreprise"
                      value={companyName}
                      onChange={(event) => {
                        setCompanyName(event.target.value);
                        if (companyNameError) {
                          setCompanyNameError('');
                        }
                      }}
                      error={Boolean(companyNameError)}
                      helperText={companyNameError}
                      inputProps={{
                        maxLength: 80,
                      }}
                      variant="standard"
                      size="medium"
                      sx={{
                        flex: 1,
                        minWidth: 200,
                        '& .MuiInput-root': {
                          fontSize: '1rem',
                          px: 2,
                          py: 1,
                          '&:before': {
                            borderBottom: 'none',
                          },
                          '&:after': {
                            borderBottom: 'none',
                          },
                          '&:hover:not(.Mui-disabled):before': {
                            borderBottom: 'none',
                          },
                        },
                        '& .MuiFormHelperText-root': {
                          position: 'absolute',
                          bottom: -24,
                          left: 16,
                        },
                      }}
                    />
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={{ display: 'inline-block', flexShrink: 0 }}
                    >
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        endIcon={<ArrowIcon sx={{ transition: 'transform 0.3s ease' }} />}
                        sx={{
                          bgcolor: '#00C49A',
                          borderRadius: '50px',
                          px: { xs: 4, sm: 5 },
                          py: 1.5,
                          fontWeight: 700,
                          fontSize: '1rem',
                          whiteSpace: 'nowrap',
                          minWidth: { xs: '100%', sm: 'auto' },
                          boxShadow: '0 4px 16px rgba(0,196,154,0.3)',
                          '&:hover': {
                            bgcolor: '#00A67E',
                            boxShadow: '0 8px 24px rgba(0,196,154,0.4)',
                            '& .MuiButton-endIcon': {
                              transform: 'translateX(4px)',
                            },
                          },
                          '& .MuiButton-endIcon': {
                            transition: 'transform 0.3s ease',
                          },
                        }}
                      >
                        Commencer
                      </Button>
                    </motion.div>
                  </Box>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Stack
                    direction="row"
                    spacing={2}
                    flexWrap="wrap"
                    useFlexGap
                    justifyContent="center"
                    sx={{ mt: 3 }}
                  >
                    <Chip
                      icon={<CheckIcon sx={{ fontSize: 16, color: '#00C49A' }} />}
                      label="Sans engagement"
                      sx={{
                        bgcolor: 'white',
                        borderRadius: '50px',
                        border: '1px solid #e8f5e9',
                        '&:hover': {
                          borderColor: '#00C49A',
                          boxShadow: '0 4px 12px rgba(0,196,154,0.1)',
                        },
                      }}
                    />
                    <Chip
                      icon={<CheckIcon sx={{ fontSize: 16, color: '#00C49A' }} />}
                      label="Essai gratuit 14 jours"
                      sx={{
                        bgcolor: 'white',
                        borderRadius: '50px',
                        border: '1px solid #e8f5e9',
                        '&:hover': {
                          borderColor: '#00C49A',
                          boxShadow: '0 4px 12px rgba(0,196,154,0.1)',
                        },
                      }}
                    />
                    <Chip
                      icon={<CheckIcon sx={{ fontSize: 16, color: '#00C49A' }} />}
                      label="Annulation facile"
                      sx={{
                        bgcolor: 'white',
                        borderRadius: '50px',
                        border: '1px solid #e8f5e9',
                        '&:hover': {
                          borderColor: '#00C49A',
                          boxShadow: '0 4px 12px rgba(0,196,154,0.1)',
                        },
                      }}
                    />
                  </Stack>
                </motion.div>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* STATS SECTION */}
      <Box sx={{ py: 8, bgcolor: 'white', position: 'relative' }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {stats.map((stat, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: stat.delay, duration: 0.6 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      textAlign: 'center',
                      p: 3,
                      borderRadius: 3,
                      border: '1px solid #f0f0f0',
                      transition: 'all 0.3s ease',
                      bgcolor: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        borderColor: '#00C49A',
                        boxShadow: '0 8px 30px rgba(0,196,154,0.08)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: 'linear-gradient(90deg, #00C49A, #6C63FF)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                      },
                      '&:hover::before': {
                        opacity: 1,
                      },
                    }}
                  >
                    <Box sx={{ color: '#00C49A', mb: 1, display: 'flex', justifyContent: 'center' }}>
                      {stat.icon}
                    </Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        color: '#0D0D0D',
                        fontSize: { xs: '1.8rem', md: '2.5rem' },
                        background: 'linear-gradient(135deg, #0D0D0D 60%, #00C49A 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
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

      {/* FEATURES SECTION */}
      <Box sx={{ bgcolor: '#fafafa', py: 10 }}>
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
              sx={{ mb: 6, fontWeight: 400, maxWidth: 600, mx: 'auto' }}
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
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -10 }}
                  onHoverStart={() => setHoveredFeature(index)}
                  onHoverEnd={() => setHoveredFeature(null)}
                >
                  <Card
                    elevation={0}
                    sx={{
                      textAlign: 'center',
                      p: 3,
                      borderRadius: 3,
                      height: '100%',
                      border: '1px solid #f0f0f0',
                      transition: 'all 0.4s ease',
                      bgcolor: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        borderColor: feature.color,
                        boxShadow: `0 8px 32px ${feature.color}20`,
                      },
                    }}
                  >
                    <motion.div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: feature.bg,
                        opacity: 0,
                        zIndex: 0,
                      }}
                      animate={{
                        opacity: hoveredFeature === index ? 0.5 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    />

                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <motion.div
                        animate={{
                          scale: hoveredFeature === index ? 1.1 : 1,
                          rotate: hoveredFeature === index ? 5 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box
                          sx={{
                            display: 'inline-flex',
                            p: 1.5,
                            borderRadius: '50%',
                            bgcolor: feature.bg,
                            color: feature.color,
                            mb: 2,
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {feature.icon}
                        </Box>
                      </motion.div>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#0D0D0D' }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {feature.description}
                      </Typography>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* TESTIMONIALS SECTION */}
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
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8 }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      height: '100%',
                      border: '1px solid #f0f0f0',
                      transition: 'all 0.3s ease',
                      bgcolor: 'white',
                      '&:hover': {
                        borderColor: '#00C49A',
                        boxShadow: '0 8px 32px rgba(0,196,154,0.08)',
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
                          boxShadow: '0 4px 12px rgba(0,196,154,0.2)',
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

      {/* CTA SECTION */}
      <Box
        sx={{
          py: 12,
          background: 'linear-gradient(135deg, #00C49A 0%, #009e7c 40%, #6C63FF 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -150,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -200,
            left: -150,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
            pointerEvents: 'none',
          }}
        />
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
            height: '70%',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.02)',
            pointerEvents: 'none',
          }}
          animate={{
            scale: [1, 1.3, 1],
            transition: {
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        />

        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h2"
              gutterBottom
              fontWeight={800}
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                textShadow: '0 2px 20px rgba(0,0,0,0.1)',
              }}
            >
              Prêt à créer votre site web ?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                opacity: 0.9,
                fontWeight: 400,
                maxWidth: 500,
                mx: 'auto',
              }}
            >
              Rejoignez des milliers d'entreprises qui utilisent ReactBuilder
            </Typography>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ display: 'inline-block' }}
            >
              <Button
                onClick={handleBottomStart}
                variant="contained"
                size="large"
                endIcon={<ArrowIcon sx={{ transition: 'transform 0.3s ease' }} />}
                sx={{
                  bgcolor: 'white',
                  color: '#00C49A',
                  borderRadius: '50px',
                  px: 6,
                  py: 2,
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
                    '& .MuiButton-endIcon': {
                      transform: 'translateX(6px)',
                    },
                  },
                  '& .MuiButton-endIcon': {
                    transition: 'transform 0.3s ease',
                  },
                }}
              >
                Commencer gratuitement
              </Button>
            </motion.div>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 2,
                opacity: 0.7,
                fontSize: '0.85rem',
              }}
            >
              ✅ Aucune carte de crédit requise • 14 jours d'essai gratuit
            </Typography>
          </motion.div>
        </Container>
      </Box>

      <PublicFooter />
    </Box>
  );
};

export default Home;