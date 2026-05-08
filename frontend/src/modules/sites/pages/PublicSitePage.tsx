import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, CircularProgress, AppBar, Toolbar, Typography, Alert } from '@mui/material';

// 1. المكونات اللي صنعناهم (Runtime & Theme)
import { useTheme } from '../../pageBuilder/core/theme/ThemeProvider';
import { RenderTree } from '../../pageBuilder/runtime/renderTree';


export const PublicSite: React.FC = () => {
  const { subdomain, siteId } = useParams();
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🎯 جلب الـ tokens والـ device (حالياً desktop في الـ public site)
  const { tokens } = useTheme();
  const device = "desktop"; // تنجم تزيد logic يفيق بالـ screen size

  useEffect(() => {
    const fetchSite = async () => {
      setLoading(true);
      try {
        const url = siteId 
          ? `https://backend-rmfq.onrender.com/api/public/sites/id/${siteId}` 
          : `https://backend-rmfq.onrender.com/api/public/sites/${subdomain}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error("Site non trouvé");
        
        const result = await response.json();
        setSiteData(result.success ? result.data : result);
      } catch (err: any) {
        setError(err.message || "Impossible de charger le site");
      } finally {
        setLoading(false);
      }
    };
    fetchSite();
  }, [subdomain, siteId]);

  if (loading) return <LoadingSpinner />;
  if (error || !siteData) return <Container sx={{ py: 10 }}><Alert severity="error">{error}</Alert></Container>;

  // ✅ التصفية الصحيحة (Published Only)
  const publishedPages = siteData?.pages?.filter((p: any) => p.status === 'published') || [];

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* NAVBAR & HERO (نفس الكود متاعك) */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800, color: tokens.colors.primary }}>
            {siteData.name}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 8 }}>
      {publishedPages.map((page: any) => (
      <Box key={page.id} sx={{ mb: 10 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>{page.title}</Typography>
      
      {/* 🎯 الطريقة الصحيحة لمناداة الـ Component */}
      {page.blocks && (
        <RenderTree 
          blocks={page.blocks} 
          device={device} 
        />
      )}
    </Box>
  ))}
</Container>

      {/* FOOTER */}
    </Box>
  );
};

const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress sx={{ color: '#00C49A' }} />
  </Box>
);