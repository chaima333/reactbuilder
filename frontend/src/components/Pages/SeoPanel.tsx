import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Divider,
  Alert,
  Slider,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useLanguage } from '../../context/LanguageContext';

interface SeoPanelProps {
  pageId: number;
  siteId: number;
}

export const SeoPanel: React.FC<SeoPanelProps> = ({ pageId, siteId }) => {
  const { t } = useLanguage();
  const { enqueueSnackbar } = useSnackbar();
  
  const [seo, setSeo] = useState({
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    metaRobots: 'index,follow',
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    sitemapPriority: 0.5,
    sitemapChangefreq: 'weekly',
  });

  const handleSave = async () => {
    try {
      // Ici l'appel API pour sauvegarder le SEO
      console.log('Saving SEO:', { pageId, siteId, seo });
      enqueueSnackbar(t.seoSaveSuccess, { variant: 'success' });
    } catch (error) {
      console.error('Save error:', error);
      enqueueSnackbar(t.seoSaveError, { variant: 'error' });
    }
  };

  const getPreview = () => {
    const title = seo.metaTitle || t.seoDefaultTitle;
    const description = seo.metaDescription || t.seoDefaultDescription;
    const url = `https://reactbuilder.com/s/${siteId}/page`;
    
    return (
      <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="caption" color="text.secondary">{t.seoPreview}</Typography>
        <Typography variant="subtitle1" color="primary" sx={{ fontSize: '1.2rem' }}>
          {title.length > 60 ? title.substring(0, 60) + '...' : title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {url}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description.length > 160 ? description.substring(0, 160) + '...' : description}
        </Typography>
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>🔍 {t.seo}</Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Alert severity="info" sx={{ mb: 3 }}>
        💡 {t.seoInfo}
      </Alert>

      {/* Meta Tags de base */}
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>{t.seoTitle}</Typography>
      <TextField
        fullWidth
        value={seo.metaTitle}
        onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
        margin="normal"
        helperText={`${seo.metaTitle?.length || 0}/60 ${t.seoCharacterCount} (${t.seoRecommended})`}
        error={seo.metaTitle?.length > 60}
      />
      
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>{t.seoDescription}</Typography>
      <TextField
        fullWidth
        multiline
        rows={3}
        value={seo.metaDescription}
        onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
        margin="normal"
        helperText={`${seo.metaDescription?.length || 0}/160 ${t.seoCharacterCount} (${t.seoRecommended})`}
        error={seo.metaDescription?.length > 160}
      />
      
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>{t.seoKeywords}</Typography>
      <TextField
        fullWidth
        value={seo.metaKeywords}
        onChange={(e) => setSeo({ ...seo, metaKeywords: e.target.value })}
        margin="normal"
        helperText="Séparez les mots-clés par des virgules"
      />
      
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>{t.metaRobots}</Typography>
      <FormControl fullWidth margin="normal">
        <Select
          value={seo.metaRobots}
          onChange={(e) => setSeo({ ...seo, metaRobots: e.target.value })}
        >
          <MenuItem value="index,follow">{t.indexFollow}</MenuItem>
          <MenuItem value="index,nofollow">{t.indexNofollow}</MenuItem>
          <MenuItem value="noindex,follow">{t.noindexFollow}</MenuItem>
          <MenuItem value="noindex,nofollow">{t.noindexNofollow}</MenuItem>
        </Select>
      </FormControl>
      
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>{t.canonicalUrl}</Typography>
      <TextField
        fullWidth
        value={seo.canonicalUrl}
        onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })}
        margin="normal"
        placeholder="https://..."
        helperText="Laissez vide pour utiliser l'URL par défaut"
      />

      {/* Open Graph */}
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>📱 {t.openGraph}</Typography>
      <Divider sx={{ mb: 2 }} />
      
      <TextField
        fullWidth
        label={t.ogTitle}
        value={seo.ogTitle}
        onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })}
        margin="normal"
      />
      
      <TextField
        fullWidth
        multiline
        rows={2}
        label={t.ogDescription}
        value={seo.ogDescription}
        onChange={(e) => setSeo({ ...seo, ogDescription: e.target.value })}
        margin="normal"
      />
      
      <TextField
        fullWidth
        label={t.ogImage}
        value={seo.ogImage}
        onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
        margin="normal"
        placeholder="https://exemple.com/image.jpg"
      />

      {/* Twitter Cards */}
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>🐦 {t.twitterCards}</Typography>
      <Divider sx={{ mb: 2 }} />
      
      <TextField
        fullWidth
        label={t.twitterTitle}
        value={seo.twitterTitle}
        onChange={(e) => setSeo({ ...seo, twitterTitle: e.target.value })}
        margin="normal"
      />
      
      <TextField
        fullWidth
        multiline
        rows={2}
        label={t.twitterDescription}
        value={seo.twitterDescription}
        onChange={(e) => setSeo({ ...seo, twitterDescription: e.target.value })}
        margin="normal"
      />
      
      <TextField
        fullWidth
        label={t.twitterImage}
        value={seo.twitterImage}
        onChange={(e) => setSeo({ ...seo, twitterImage: e.target.value })}
        margin="normal"
        placeholder="https://exemple.com/image.jpg"
      />

      {/* Sitemap */}
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>🗺️ {t.sitemap}</Typography>
      <Divider sx={{ mb: 2 }} />
      
      <FormControl fullWidth margin="normal">
        <InputLabel>{t.sitemapFrequency}</InputLabel>
        <Select
          value={seo.sitemapChangefreq}
          onChange={(e) => setSeo({ ...seo, sitemapChangefreq: e.target.value })}
          label={t.sitemapFrequency}
        >
          <MenuItem value="always">{t.always}</MenuItem>
          <MenuItem value="hourly">{t.hourly}</MenuItem>
          <MenuItem value="daily">{t.daily}</MenuItem>
          <MenuItem value="weekly">{t.weekly}</MenuItem>
          <MenuItem value="monthly">{t.monthly}</MenuItem>
          <MenuItem value="yearly">{t.yearly}</MenuItem>
          <MenuItem value="never">{t.never}</MenuItem>
        </Select>
      </FormControl>
      
      <Typography gutterBottom>{t.sitemapPriority}</Typography>
      <Slider
        value={seo.sitemapPriority}
        onChange={(_, value) => setSeo({ ...seo, sitemapPriority: value as number })}
        step={0.1}
        marks
        min={0}
        max={1}
        valueLabelDisplay="auto"
      />

      {/* Aperçu Google */}
      {getPreview()}

      <Button
        fullWidth
        variant="contained"
        onClick={handleSave}
        sx={{ mt: 3 }}
      >
        {t.save}
      </Button>
    </Paper>
  );
};