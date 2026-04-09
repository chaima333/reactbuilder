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
import { Menu as MenuIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

// 🔥 CONSTANTE API - CORRECTION ICI
const API_URL = 'https://backend-rmfq.onrender.com/api';

function HideOnScroll(props: { children: React.ReactElement }) {
  const { children } = props;
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

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
          url = `${API_URL}/sites/${siteId}`;
          console.log('📡 Chargement par ID:', siteId, 'URL:', url);
          
          const token = localStorage.getItem('token');
          response = await fetch(url, {
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` })
            }
          });
          
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          
          const result = await response.json();
          console.log('✅ Données reçues par ID:', result);
          
          const site = result.data || result;
          setSiteData(site);
        } 
        else if (subdomain) {
          url = `${API_URL}/public/sites/${subdomain}`;
          console.log('📡 Chargement par sous-domaine:', subdomain, 'URL:', url);
          
          response = await fetch(url);
          
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          
          const result = await response.json();
          console.log('✅ Données reçues par sous-domaine:', result);
          
          const site = result.data || result;
          setSiteData(site);
        } else {
          throw new Error('Aucun identifiant de site fourni');
        }
        
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
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 3,
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
              color: 'text.secondary',
              mb: 3,
            }}
          >
            {block.content}
          </Typography>
        );
      
      case 'button':
        return (
          <Button 
            variant="contained" 
            size="large"
            endIcon={<ExpandMoreIcon />}
            sx={{ 
              mt: 2, 
              mb: 3,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              borderRadius: '50px',
              px: 4,
              py: 1.5,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
              },
              transition: 'all 0.3s ease',
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
                  borderRadius: '16px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLImageElement).style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLImageElement).style.transform = 'scale(1)';
                }}
              />
            </Box>
          </Fade>
        );
      
      case 'gallery':
        return (
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" gutterBottom>Galerie</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <img 
                  src={block.content} 
                  alt="Galerie" 
                  style={{ width: '100%', borderRadius: '16px' }}
                />
              </Grid>
            </Grid>
          </Box>
        );
      
      default:
        return (
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            {typeof block.content === 'string' ? block.content : JSON.stringify(block.content)}
          </Typography>
        );
    }
  };

  const getPublishedPages = () => {
    if (!siteData?.pages) return [];
    
    const publishedPages = siteData.pages.filter((page: any) => {
      return page.status !== 'draft';
    });
    
    return publishedPages;
  };

  const publishedPages = getPublishedPages();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} thickness={4} />
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
            sx={{ mt: 3 }}
            onClick={() => window.location.href = '/'}
          >
            Retour à l'accueil
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
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
                fontWeight: 700,
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
              onClick={scrollToTop}
            >
              {siteData.name || siteData.title || 'Mon site'}
            </Typography>
            
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <Button color="inherit" onClick={scrollToTop} sx={{ fontWeight: 500 }}>
                Accueil
              </Button>
              {publishedPages.map((page: any) => (
                <Button 
                  key={page.id} 
                  color="inherit" 
                  onClick={() => scrollToPage(`page-${page.id}`)}
                  sx={{ fontWeight: 500 }}
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

      <Box 
        sx={{ 
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                  opacity: 0.9, 
                  mb: 4,
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                }}
              >
                {siteData.description || 'Créez votre site facilement avec ReactBuilder'}
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                sx={{ 
                  bgcolor: 'white', 
                  color: '#667eea',
                  borderRadius: '50px',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                    transform: 'translateY(-2px)',
                  },
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

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {publishedPages.length > 0 ? (
          publishedPages.map((page: any) => {
            let pageBlocks = page.blocks;
            if (typeof pageBlocks === 'string') {
              try {
                pageBlocks = JSON.parse(pageBlocks);
              } catch (e) {
                pageBlocks = [];
              }
            }
            
            if ((!pageBlocks || pageBlocks.length === 0) && page.content) {
              try {
                pageBlocks = JSON.parse(page.content);
              } catch (e) {
                pageBlocks = [];
              }
            }
            
            return (
              <Box key={page.id} id={`page-${page.id}`} sx={{ mb: 8 }}>
                <Fade in timeout={800}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      borderRadius: 4,
                      overflow: 'hidden',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                      <Typography 
                        variant="h2" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 700,
                          fontSize: { xs: '2rem', md: '2.5rem' },
                          color: 'primary.main',
                        }}
                      >
                        {page.title}
                      </Typography>
                      
                      <Divider sx={{ my: 3 }} />
                      
                      {pageBlocks && Array.isArray(pageBlocks) && pageBlocks.length > 0 ? (
                        pageBlocks.map((block: any, blockIdx: number) => (
                          <Box key={blockIdx}>
                            {renderBlock(block)}
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body1" paragraph color="text.secondary">
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
            {typeof window !== 'undefined' && localStorage.getItem('token') && (
              <Button 
                variant="contained" 
                sx={{ mt: 3 }}
                onClick={() => window.location.href = `/sites/${siteId}/pages/new`}
              >
                Créer une page
              </Button>
            )}
          </Box>
        )}
      </Container>

      <Box 
        sx={{ 
          bgcolor: '#1a1a2e', 
          color: 'white',
          py: 6,
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                {siteData.name || siteData.title || 'ReactBuilder'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                {siteData.description || 'Site créé avec ReactBuilder'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>Navigation</Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }} onClick={scrollToTop}>
                Accueil
              </Typography>
              {publishedPages.slice(0, 3).map((page: any) => (
                <Typography 
                  key={page.id} 
                  variant="body2" 
                  sx={{ opacity: 0.7, cursor: 'pointer', mt: 1 }} 
                  onClick={() => scrollToPage(`page-${page.id}`)}
                >
                  {page.title}
                </Typography>
              ))}
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>Contact</Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                {siteData.subdomain ? `${siteData.subdomain}@reactbuilder.com` : 'contact@reactbuilder.com'}
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Typography align="center" variant="body2" sx={{ opacity: 0.5 }}>
            © {new Date().getFullYear()} {siteData.name || 'ReactBuilder'}. Créé avec ReactBuilder
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};