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
} from '@mui/icons-material';

const API_URL = 'https://backend-rmfq.onrender.com/api';

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

const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
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
        let url = siteId 
          ? `${API_URL}/public/sites/id/${siteId}` 
          : `${API_URL}/public/sites/${subdomain}`;
        
        if (!siteId && !subdomain) throw new Error('Aucun identifiant de site fourni');

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        
        const result = await response.json();
        setSiteData(result.success ? result.data : result);
      } catch (err: any) {
        setError(err.message || 'Impossible de charger le site');
      } finally {
        setLoading(false);
      }
    };
    fetchSite();
  }, [subdomain, siteId]);

  const renderContentWithUrls = (content: string) => {
    if (!content) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        if (part.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
          return (
            <Box key={index} sx={{ my: 2, textAlign: 'center' }}>
              <img src={part} alt="Content" style={{ maxWidth: '100%', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
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
                frameBorder="0" allowFullScreen title="YouTube video"
              />
            </Box>
          );
        }
        return (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer" style={{ color: THEME.primary, fontWeight: 500 }}>
            {part}
          </a>
        );
      }
      return <span key={index}>{part.split('\n').map((line, i) => (<React.Fragment key={i}>{line}{i < part.split('\n').length - 1 && <br />}</React.Fragment>))}</span>;
    });
  };

  const renderBlock = (block: any) => {
    if (!block) return null;
    switch (block.type) {
      case 'title':
        return <Typography variant="h3" sx={{ fontWeight: 800, background: THEME.gradient, backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', mb: 3 }}>{block.content}</Typography>;
      case 'text':
        return <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#475569', mb: 3 }}>{renderContentWithUrls(block.content)}</Typography>;
      case 'button':
        return (
          <Button variant="contained" href={block.link || '#'} target="_blank" sx={{ background: THEME.gradient, borderRadius: '50px', px: 5, py: 1.5, mb: 3, textTransform: 'none' }}>
            {block.content || 'En savoir plus'}
          </Button>
        );
      case 'image':
        return (
          <Box sx={{ my: 4, textAlign: 'center' }}>
            <img src={block.content} alt={block.alt || 'Image'} style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }} />
          </Box>
        );
      case 'gallery':
        const images = block.content?.split('\n').filter((url: string) => url.trim()) || [];
        return (
          <Grid container spacing={2} sx={{ my: 3 }}>
            {images.map((img: string, idx: number) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Box sx={{ borderRadius: '16px', overflow: 'hidden', height: '220px' }}>
                  <img src={img.trim()} alt="Gallery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        );
      default:
        return <Typography variant="body1">{block.content}</Typography>;
    }
  };

  const publishedPages = siteData?.pages?.filter((p: any) => p.status !== 'draft') || [];

  const scrollToPage = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setAnchorEl(null);
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress sx={{ color: THEME.primary }} /></Box>;
  if (error || !siteData) return <Container sx={{ py: 10 }}><Alert severity="error">{error || "Site non trouvé"}</Alert></Container>;

  return (
    <Box sx={{ bgcolor: THEME.light, minHeight: '100vh' }}>
      <HideOnScroll>
        <AppBar position="fixed" color="default" elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800, background: THEME.gradient, backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              {siteData.name || 'Mon Site'}
            </Typography>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              {publishedPages.map((page: any) => (
                <Button key={page.id} onClick={() => scrollToPage(`page-${page.id}`)} sx={{ color: '#475569', fontWeight: 600 }}>{page.title}</Button>
              ))}
            </Box>
            <IconButton sx={{ display: { xs: 'flex', md: 'none' } }} onClick={(e) => setAnchorEl(e.currentTarget)}><MenuIcon /></IconButton>
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {publishedPages.map((page: any) => (
          <MenuItem key={page.id} onClick={() => scrollToPage(`page-${page.id}`)}>{page.title}</MenuItem>
        ))}
      </Menu>

      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', background: THEME.gradient, color: 'white', textAlign: 'center', pt: 10 }}>
        <Container maxWidth="md">
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>{siteData.title || siteData.name}</Typography>
          <Typography variant="h5" sx={{ opacity: 0.9, mb: 4 }}>{siteData.description}</Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {publishedPages.map((page: any) => (
          <Box key={page.id} id={`page-${page.id}`} sx={{ mb: 8 }}>
            <Card elevation={0} sx={{ borderRadius: 4, p: { xs: 2, md: 4 } }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>{page.title}</Typography>
              <Divider sx={{ mb: 4, width: 60, height: 4, background: THEME.gradient, borderRadius: 2 }} />
              {page.blocks?.map((block: any, idx: number) => (
                <Box key={idx}>{renderBlock(block)}</Box>
              ))}
            </Card>
          </Box>
        ))}
      </Container>

      <Box sx={{ bgcolor: THEME.dark, color: 'white', py: 6, textAlign: 'center' }}>
        <Container>
          <Typography variant="h6">{siteData.name}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.6, mt: 1 }}>© {new Date().getFullYear()} - Créé avec ReactBuilder</Typography>
        </Container>
      </Box>
    </Box>
  );
};