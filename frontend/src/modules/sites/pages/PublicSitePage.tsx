import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  useScrollTrigger,
  Slide,
  Fade,
  Divider,
  Alert,
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  ExpandMore as ExpandMoreIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Block,
} from '@mui/icons-material';

const API_URL = 'https://backend-rmfq.onrender.com/api';

// Configuration du thème
const THEME = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#ec4899',
  dark: '#1e1b4b',
  light: '#f8fafc',
  gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
};

function HideOnScroll(props: { children: React.ReactElement }) {
  const { children } = props;
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

// Fonction pour extraire l'ID d'une vidéo YouTube
const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Fonction pour détecter et rendre les URLs
const renderContentWithUrls = (content: string) => {
  if (!content) return content;
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      if (part.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
        return (
          <Box key={index} sx={{ my: 2, textAlign: 'center' }}>
            <img 
              src={part} 
              alt="Image" 
              style={{ 
                maxWidth: '100%', 
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              }}
            />
          </Box>
        );
      }
      const videoId = getYouTubeId(part);
      if (videoId) {
        return (
          <Box key={index} sx={{ my: 2, position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '16px', overflow: 'hidden' }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube video"
            />
          </Box>
        );
      }
      return (
        <a 
          key={index} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: THEME.primary, textDecoration: 'none', fontWeight: 500, borderBottom: `2px solid ${THEME.primary}33` }}
        >
          {part}
        </a>
      );
    }
  const lines = part.split('\n');

return (
  <span key={index}>
    {lines.map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < lines.length - 1 && <br />}
      </React.Fragment>
    ))}
  </span>
);
  });
};

export const PublicSite: React.FC = () => {
  const { subdomain, siteId } = useParams();
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const fetchSite = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let url = '';
        let response;
        
        if (siteId) {
          url = `${API_URL}/public/sites/id/${siteId}`;
          response = await fetch(url);
        } 
        else if (subdomain) {
          url = `${API_URL}/public/sites/${subdomain}`;
          response = await fetch(url);
        } else {
          throw new Error('Aucun identifiant de site fourni');
        }
        
        if (!response || !response.ok) {
          throw new Error(`Erreur HTTP: ${response?.status}`);
        }
        
        const result = await response.json();
        let site = result;
        if (result.success && result.data) {
          site = result.data;
        }
        
        setSiteData(site);
      } catch (err: any) {
        console.error('❌ Erreur fetchSite:', err);
        setError(err.message || 'Impossible de charger le site');
      } finally {
        setLoading(false);
      }
    };

    fetchSite();
  }, [subdomain, siteId]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const scrollToPage = (pageId: string) => {
    const element = document.getElementById(pageId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      handleMenuClose();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderBlock = (block: any) => {
    if (!block) return null;
    
    switch (block.type) {
      case 'title':
        return (
          <Typography 
            variant="h3" 
            gutterBottom 
            sx={{ 
              fontWeight: 800,
              background: THEME.gradient,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 3,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -12,
                left: 0,
                width: 60,
                height: 4,
                background: THEME.gradient,
                borderRadius: 2,
              }
            }}
          >
            {block.content}
          </Typography>
        );
      
      case 'text':
        return (
          <Typography 
            variant="body1" 
            paragraph 
            sx={{ 
              fontSize: '1.1rem', 
              lineHeight: 1.8,
              color: '#475569',
              mb: 3,
            }}
          >
            {renderContentWithUrls(block.content)}
          </Typography>
        );
      
      case 'button':
        return (
          <Button 
            variant="contained" 
            size="large"
            href={block.link || '#'}
            target="_blank"
            endIcon={<ExpandMoreIcon />}
            sx={{ 
              mt: 2, 
              mb: 3,
              background: THEME.gradient,
              borderRadius: '50px',
              px: 5,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 15px 30px rgba(99, 102, 241, 0.4)',
              },
            }}
          >
            {block.content || 'En savoir plus'}
          </Button>
        );
      
      case 'image':
        return (
          <Fade in timeout={1000}>
            <Box sx={{ my: 4, textAlign: 'center' }}>
              <img 
                src={block.content} 
                alt={block.alt || 'Image'} 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '500px',
                  borderRadius: '24px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLImageElement).style.transform = 'scale(1.02)';
                  (e.target as HTMLImageElement).style.boxShadow = '0 25px 50px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLImageElement).style.transform = 'scale(1)';
                  (e.target as HTMLImageElement).style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                }}
              />
            </Box>
          </Fade>
        );
      
      case 'gallery':
        const images = block.content ? block.content.split('\n').filter((url: string) => url.trim()) : [];
        return (
          <Grid container spacing={2} sx={{ my: 3 }}>
            {images.map((img: string, idx: number) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Box
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
                    },
                  }}
                  onClick={() => window.open(img.trim(), '_blank')}
                >
                  <img 
                    src={img.trim()} 
                    alt={`Gallery ${idx + 1}`}
                    style={{ 
                      width: '100%', 
                      height: '220px', 
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLImageElement).style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLImageElement).style.transform = 'scale(1)';
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/e2e8f0/64748b?text=Image+non+trouvée';
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        );
      
      case 'video':
        const videoUrl = block.content;
        const videoId = getYouTubeId(videoUrl);
        if (videoId) {
          return (
            <Box sx={{ 
              my: 3, 
              position: 'relative', 
              paddingBottom: '56.25%', 
              height: 0, 
              borderRadius: '16px', 
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube video"
              />
            </Box>
          );
        }
        return (
          <Box sx={{ my: 2, p: 3, bgcolor: '#f1f5f9', borderRadius: '12px', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              📹 Vidéo: <a href={videoUrl} target="_blank" rel="noopener noreferrer" style={{ color: THEME.primary }}>{videoUrl}</a>
            </Typography>
          </Box>
        );
      
      case 'separator':
        return (
          <Divider sx={{ 
            my: 4,
            background: THEME.gradient,
            height: 2,
            borderRadius: 1,
          }} />
        );
      
      default:
        return (
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#475569' }}>
            {typeof block.content === 'string' ? block.content : JSON.stringify(block.content)}
          </Typography>
        );
    }
  };

  const getPublishedPages = () => {
    if (!siteData?.pages) return [];
    return siteData.pages.filter((page: any) => page.status !== 'draft');
  };

  const publishedPages = getPublishedPages();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ background: THEME.light }}>
        <CircularProgress size={60} thickness={4} sx={{ color: THEME.primary }} />
      </Box>
    );
  }

  if (error || !siteData) {
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Impossible de charger le site"}
        </Alert>
        <Box textAlign="center" py={4}>
          <Typography variant="h5" gutterBottom>
            Site non trouvé
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {subdomain && `Le site "${subdomain}" n'existe pas`}
            {siteId && `Le site avec l'ID ${siteId} n'existe pas`}
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 3, background: THEME.gradient }}
            onClick={() => window.location.href = '/'}
          >
            Retour à l'accueil
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: THEME.light, minHeight: '100vh' }}>
      {/* Navigation */}
      <HideOnScroll>
        <AppBar 
          position="fixed" 
          color="default" 
          elevation={0}
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          <Toolbar>
            <Typography 
              variant="h6" 
              sx={{ 
                flexGrow: 1, 
                fontWeight: 800,
                cursor: 'pointer',
                background: THEME.gradient,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontSize: '1.5rem',
              }}
              onClick={scrollToTop}
            >
              {siteData.name || siteData.title || 'Mon site'}
            </Typography>
            
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <Button color="inherit" onClick={scrollToTop} sx={{ fontWeight: 500, color: '#475569' }}>
                Accueil
              </Button>
              {publishedPages.map((page: any) => (
                <Button 
                  key={page.id} 
                  color="inherit" 
                  onClick={() => scrollToPage(`page-${page.id}`)}
                  sx={{ fontWeight: 500, color: '#475569' }}
                >
                  {page.title}
                </Button>
              ))}
            </Box>
            
            <IconButton sx={{ display: { xs: 'flex', md: 'none' } }} onClick={handleMenuOpen}>
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={scrollToTop}>Accueil</MenuItem>
        {publishedPages.map((page: any) => (
          <MenuItem key={page.id} onClick={() => scrollToPage(`page-${page.id}`)}>
            {page.title}
          </MenuItem>
        ))}
      </Menu>

      {/* Hero Section */}
      <Box 
        sx={{ 
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          background: THEME.gradient,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="md">
          <Fade in timeout={1000}>
            <Box textAlign="center">
              <Typography 
                variant="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                {siteData.title || siteData.name || 'Bienvenue'}
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  opacity: 0.95, 
                  mb: 4,
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                  fontWeight: 400,
                }}
              >
                {siteData.description || 'Créez votre site facilement avec ReactBuilder'}
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                sx={{ 
                  bgcolor: 'white', 
                  color: THEME.primary,
                  borderRadius: '50px',
                  px: 5,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.95)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.3s ease',
                }}
                onClick={() => {
                  if (publishedPages.length > 0) {
                    scrollToPage(`page-${publishedPages[0].id}`);
                  }
                }}
              >
                Découvrir
              </Button>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Pages */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {publishedPages.length > 0 ? (
          publishedPages.map((page: any) => {
            const pageBlocks = Array.isArray(page.blocks) ? page.blocks : [];
            
            return (
              <Box key={page.id} id={`page-${page.id}`} sx={{ mb: 10 }}>
                <Fade in timeout={800}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      borderRadius: 4,
                      overflow: 'hidden',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      bgcolor: 'white',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                      <Typography 
                        variant="h2" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 700,
                          fontSize: { xs: '1.75rem', md: '2.5rem' },
                          color: THEME.dark,
                          mb: 2,
                        }}
                      >
                        {page.title}
                      </Typography>
                      
                      <Divider sx={{ 
                        my: 3,
                        background: THEME.gradient,
                        height: 3,
                        width: 60,
                        borderRadius: 2,
                      }} />
                      
                      {pageBlocks.length > 0 ? (
                        pageBlocks.map((block: any, blockIdx: number) => (
                          <Box key={blockIdx}>
                            {renderBlock(block)}
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body1" paragraph color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                          Aucun contenu pour cette page
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Fade>
              </Box>
            );
          })
        ) : (
          <Box textAlign="center" py={8}>
            <Typography variant="h5" gutterBottom>
              Aucune page publiée
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Ce site n'a pas encore de pages publiées.
            </Typography>
          </Box>
        )}
      </Container>

      {/* Footer */}
      <Box 
        sx={{ 
          bgcolor: THEME.dark, 
          color: 'white',
          py: 6,
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                {siteData.name || siteData.title || 'ReactBuilder'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, lineHeight: 1.6 }}>
                {siteData.description || 'Site créé avec ReactBuilder - Le CMS moderne et puissant'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>Navigation</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }} onClick={scrollToTop}>
                  Accueil
                </Typography>
                {publishedPages.slice(0, 3).map((page: any) => (
                  <Typography 
                    key={page.id} 
                    variant="body2" 
                    sx={{ opacity: 0.7, cursor: 'pointer', '&:hover': { opacity: 1 } }} 
                    onClick={() => scrollToPage(`page-${page.id}`)}
                  >
                    {page.title}
                  </Typography>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>Suivez-nous</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <IconButton sx={{ color: 'white', '&:hover': { color: THEME.accent } }}>
                  <FacebookIcon />
                </IconButton>
                <IconButton sx={{ color: 'white', '&:hover': { color: THEME.accent } }}>
                  <TwitterIcon />
                </IconButton>
                <IconButton sx={{ color: 'white', '&:hover': { color: THEME.accent } }}>
                  <InstagramIcon />
                </IconButton>
                <IconButton sx={{ color: 'white', '&:hover': { color: THEME.accent } }}>
                  <LinkedInIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.7, mt: 2 }}>
                {siteData.subdomain ? `${siteData.subdomain}@reactbuilder.com` : 'contact@reactbuilder.com'}
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Typography align="center" variant="body2" sx={{ opacity: 0.5 }}>
            © {new Date().getFullYear()} {siteData.name || 'ReactBuilder'}. Créé avec ❤️ par ReactBuilder
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};