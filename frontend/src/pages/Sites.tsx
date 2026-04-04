import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  IconButton, 
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useGetSitesQuery, useCreateSiteMutation, useDeleteSiteMutation, useDeletePageMutation } from '../redux/api/apiSlice';
import { CreateSiteModal } from '../components/Sites/CreateSiteModal';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';  // ← AJOUTER

export const Sites: React.FC = () => {
  const { t } = useLanguage();  // ← AJOUTER
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<any>(null);
  
  const { data, isLoading, error, refetch } = useGetSitesQuery(undefined);
  const [createSite, { isLoading: isCreating }] = useCreateSiteMutation();
  const [deleteSite, { isLoading: isDeleting }] = useDeleteSiteMutation();
  const [deletePage] = useDeletePageMutation();
  const { enqueueSnackbar } = useSnackbar();

  const sites = data?.data || [];

  const handleCreateSite = async (siteData: any) => {
    try {
      await createSite(siteData).unwrap();
      enqueueSnackbar(t.saveSuccess, { variant: 'success' });  // ← t.
      setModalOpen(false);
      refetch();
    } catch (err: any) {
      enqueueSnackbar(err?.data?.message || t.error, { variant: 'error' });  // ← t.
    }
  };

  const handleDeleteSite = async () => {
    if (!selectedSite) return;
    try {
      await deleteSite(selectedSite.id).unwrap();
      enqueueSnackbar(t.deleteSuccess, { variant: 'success' });  // ← t.
      setDeleteDialogOpen(false);
      setSelectedSite(null);
      refetch();
    } catch (err: any) {
      enqueueSnackbar(err?.data?.message || t.error, { variant: 'error' });  // ← t.
    }
  };

  const handleDeletePage = async (siteId: number, pageId: number, pageTitle: string) => {
    if (window.confirm(`${t.confirmDelete} "${pageTitle}" ?`)) {  // ← t.
      try {
        await deletePage({ siteId, pageId }).unwrap();
        enqueueSnackbar(t.deleteSuccess, { variant: 'success' });  // ← t.
        refetch();
      } catch (err: any) {
        enqueueSnackbar(err?.data?.message || t.error, { variant: 'error' });  // ← t.
      }
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{t.error}</Alert>  {/* ← t. */}
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">{t.mySites}</Typography>  {/* ← t. */}
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)}>
          {t.createSite}  {/* ← t. */}
        </Button>
      </Box>

      {sites.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t.youHaveNoSites}  {/* ← t. */}
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)} sx={{ mt: 2 }}>
            {t.createFirstSite}  {/* ← t. */}
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {sites.map((site: any) => (
            <Grid item xs={12} md={6} lg={4} key={site.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{site.name}</Typography>
                  <Typography color="text.secondary" gutterBottom>
                    {site.subdomain}.reactbuilder.com
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {site.description || t.noDescription}  {/* ← t. */}
                  </Typography>
                  <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2">
                      📄 {site.pagesCount || site.pages?.length || 0} {t.pages}  {/* ← t. */}
                    </Typography>
                    <Typography variant="body2">
                      👁️ {site.totalViews || 0} {t.views}  {/* ← t. */}
                    </Typography>
                    <Typography variant="body2">
                      📅 {t.created} {new Date(site.createdAt).toLocaleDateString('fr-FR')}  {/* ← t. */}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {t.pages}:  {/* ← t. */}
                    </Typography>
                    
                    {site.pages && site.pages.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                        {site.pages.map((page: any) => (
                          <Box key={page.id} sx={{ display: 'inline-flex', alignItems: 'center' }}>
                            <Chip
                              label={page.title}
                              size="small"
                              onClick={() => navigate(`/sites/${site.id}/pages/${page.id}/edit`)}
                              sx={{ cursor: 'pointer' }}
                            />
                            <IconButton size="small" color="error" onClick={() => handleDeletePage(site.id, page.id, page.title)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}
                    
                    {(!site.pages || site.pages.length === 0) && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {t.noPages}  {/* ← t. */}
                      </Typography>
                    )}
                    
                    <Button size="small" startIcon={<AddIcon />} onClick={() => navigate(`/sites/${site.id}/pages/new`)} sx={{ mt: 1 }}>
                      {t.addPage}  {/* ← t. */}
                    </Button>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<EditIcon />} onClick={() => navigate(`/sites/${site.id}/edit`)}>
                    {t.edit}  {/* ← t. */}
                  </Button>
                  <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => { setSelectedSite(site); setDeleteDialogOpen(true); }}>
                    {t.delete}  {/* ← t. */}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <CreateSiteModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreateSite} isLoading={isCreating} />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t.confirm}</DialogTitle>  {/* ← t. */}
        <DialogContent>
          <DialogContentText>
            {t.confirmDelete} "{selectedSite?.name}" ?  {/* ← t. */}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t.cancel}</Button>  {/* ← t. */}
          <Button onClick={handleDeleteSite} color="error" disabled={isDeleting}>
            {isDeleting ? t.loading : t.delete}  {/* ← t. */}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sites;