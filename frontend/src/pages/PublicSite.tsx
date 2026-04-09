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
} from '@mui/material';
import { Menu as MenuIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

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
  const { subdomain, siteId } = useParams(); // ← Récupère les deux paramètres
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const fetchSite = async () => {
      try {
        let url = '';
        let response;
        
        // 🔥 CAS 1: On a un siteId (route /sites/4)
        if (siteId) {
          console.log('Chargement par ID:', siteId);
          url = `http://localhost:5000/api/sites/${siteId}`;
          response = await fetch(url);
          
          if (!response.ok) {
            // Essayer l'API publique
            url = `http://localhost:5000/api/public/sites/id/${siteId}`;
            response = await fetch(url);
          }
        } 
        // 🔥 CAS 2: On a un subdomain (route /s/monsite)
        else if (subdomain) {
          console.log('Chargement par sous-domaine:', subdomain);
          url = `http://localhost:5000/api/public/sites/id/${subdomain}`;
          response = await fetch(url);
          
          if (!response.ok) {
            url = `http://localhost:5000/api/public/sites/${subdomain}`;
            response = await fetch(url);
          }
        }
        
        if (!response || !response.ok) throw new Error('Site non trouvé');
        
        const data = await response.json();
        console.log('Données reçues:', data);
        
        // Traiter les blocks JSON des pages
        if (data.pages) {
          data.pages = data.pages.map((page: any) => {
            if (page.blocks && typeof page.blocks === 'string') {
              try {
                page.blocks = JSON.parse(page.blocks);
              } catch (e) {
                page.blocks = [];
              }
            }
            return page;
          });
        }
        
        setSiteData(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (subdomain || siteId) fetchSite();
  }, [subdomain, siteId]); // ← Dépendance aux deux paramètres

  // Le reste du code reste identique...
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
      
      default:
        return (
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            {typeof block.content === 'string' ? block.content : JSON.stringify(block.content)}
          </Typography>
        );
    }
  };

  // Fonction pour normaliser un titre (minuscules, sans accents)
  const normalizeTitle = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  // Filtrer les pages pour éliminer les doublons
  const getUniquePages = () => {
    if (!siteData?.pages) return [];
    
    const seen = new Map();
    const uniquePages = [];
    
    for (const page of siteData.pages) {
      const normalizedTitle = normalizeTitle(page.title);
      
      if (normalizedTitle.length < 2) continue;
      
      const excludedTitles = ['test', 'temp', 'draft', 'acceuil', 'acceille'];
      if (excludedTitles.includes(normalizedTitle)) continue;
      
      if (!seen.has(normalizedTitle)) {
        seen.set(normalizedTitle, page);
        uniquePages.push(page);
      }
    }
    
    return uniquePages;
  };

  const uniquePages = getUniquePages();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (!siteData) {
    return (
      <Box textAlign="center" py={10}>
        <Typography variant="h4" gutterBottom>Site non trouvé</Typography>
        <Typography variant="body1">
          {subdomain ? `Le site "${subdomain}" n'existe pas` : `Le site avec l'ID ${siteId} n'existe pas`}
        </Typography>
      </Box>
    );
  }

  // Le reste du rendu reste identique...
  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Navigation */}
      <HideOnScroll>
        <AppBar 
          position="fixed" 
          color="default" 
          elevation={0}
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(219, 15, 15, 0.05)',
          }}
        >
          <Toolbar>
            <Typography 
              variant="h6" 
              sx={{ 
                flexGrow: 1, 
                fontWeight: 700,
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #601e72 0%, #a32560 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
              onClick={scrollToTop}
            >
              {siteData.name}
            </Typography>
            
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <Button color="inherit" onClick={scrollToTop} sx={{ fontWeight: 500 }}>
                Accueil
              </Button>
              {uniquePages.map((page: any) => (
                <Button 
                  key={page.id} 
                  color="inherit" 
                  onClick={() => scrollToPage(`page-${page.id}`)}
                  sx={{ fontWeight: 500 }}
                >
                  {page.title}
                </Button>
              ))}
              <Button color="inherit" sx={{ fontWeight: 500 }}>
                Contact
              </Button>
            </Box>
            
            <IconButton sx={{ display: { xs: 'flex', md: 'none' } }} onClick={handleMenuOpen}>
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={scrollToTop}>Accueil</MenuItem>
        {uniquePages.map((page: any) => (
          <MenuItem key={page.id} onClick={() => scrollToPage(`page-${page.id}`)}>
            {page.title}
          </MenuItem>
        ))}
        <MenuItem onClick={handleMenuClose}>Contact</MenuItem>
      </Menu>

      {/* Hero Section */}
      <Box 
        sx={{ 
          minHeight: '80vh',
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
                  textShadow: '2px 2px 4px rgba(136, 16, 16, 0.1)',
                }}
              >
                {siteData.title || siteData.name}
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  opacity: 0.9, 
                  mb: 4,
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                }}
              >
                {siteData.description}
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
                  if (uniquePages.length > 0) {
                    scrollToPage(`page-${uniquePages[0].id}`);
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
        {uniquePages.length > 0 ? (
          uniquePages.map((page: any) => (
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
                    
                    {page.blocks && Array.isArray(page.blocks) && page.blocks.length > 0 ? (
                      page.blocks.map((block: any, blockIdx: number) => (
                        <Box key={blockIdx}>
                          {renderBlock(block)}
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body1" paragraph>
                        {page.content?.replace(/<[^>]*>/g, '') || 'Contenu de la page'}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Fade>
            </Box>
          ))
        ) : (
          <Box textAlign="center" py={8}>
            <Typography variant="h5" gutterBottom>
              Aucune page publiée
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Le site est en cours de construction
            </Typography>
          </Box>
        )}
      </Container>

      {/* Footer */}
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
                {siteData.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                {siteData.description}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>Navigation</Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, cursor: 'pointer' }} onClick={scrollToTop}>
                Accueil
              </Typography>
              {uniquePages.slice(0, 3).map((page: any) => (
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
                {siteData.subdomain || `site-${siteData.id}`}@reactbuilder.com
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Typography align="center" variant="body2" sx={{ opacity: 0.5 }}>
            © {new Date().getFullYear()} {siteData.name}. Créé avec ReactBuilder
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};