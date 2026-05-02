// frontend/src/modules/dashboard/pages/pageList.tsx
import React from "react";
import { Box, Typography, Button, Card, CardContent, Stack, Alert, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { 
  useGetPagesQuery, 
  useCreatePageMutation, 
  useDeletePageMutation, 
  usePublishPageMutation 
} from "../../../redux/services/pages.api";

export const PageList: React.FC = () => {
  const navigate = useNavigate();
  const siteId = 1;

  // 1. جلب البيانات (لاحظ أننا نأخذ pages مباشرة لأننا استعملنا transformResponse)
  const { data: pages, isLoading, error } = useGetPagesQuery(siteId);

  // 2. العمليات (Mutations)
  const [createPageAction, { isLoading: isCreating }] = useCreatePageMutation();
  const [deletePageAction] = useDeletePageMutation();
  const [publishPageAction] = usePublishPageMutation();

  const handleCreate = async () => {
    try {
      // نرسل مصفوفة فارغة للـ blocks كما هو معرف في الـ Type
      const res = await createPageAction({ siteId, title: "Nouvelle Page", blocks: [] }).unwrap();
      // التوكن والـ Refresh سيعملان تلقائياً هنا بفضل الـ baseQuery
      if (res?.id) navigate(`/editor/${res.id}`);
    } catch (err) { 
      console.error("Erreur de création:", err); 
    }
  };

  const handleDelete = async (pageId: number) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette page ?")) {
      try {
        await deletePageAction({ siteId, pageId }).unwrap();
      } catch (err) {
        console.error("Erreur de suppression:", err);
      }
    }
  };

  const handlePublish = async (pageId: number) => {
    try {
      await publishPageAction({ siteId, pageId }).unwrap();
    } catch (err) {
      console.error("Erreur de publication:", err);
    }
  };

  if (isLoading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">Gestion des Pages</Typography>
        <Button 
          variant="contained" 
          onClick={handleCreate} 
          disabled={isCreating}
        >
          {isCreating ? "Création..." : "+ Créer une Page"}
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Impossible من تحميل الصفحات. تأكد من اتصالك أو صلاحياتك.
        </Alert>
      )}

      <Stack spacing={2}>
        {!pages || pages.length === 0 ? (
          <Typography align="center" color="textSecondary" sx={{ py: 5 }}>
            Aucune page trouvée. ابدأ بإنشاء صفحتك الأولى!
          </Typography>
        ) : (
          pages.map((page) => (
            <Card key={page.id} variant="outlined" sx={{ '&:hover': { boxShadow: 3, borderColor: 'primary.main' }, transition: '0.3s' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6">{page.title}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      /{page.slug} — 
                      <Box component="span" sx={{ 
                        ml: 1, px: 1, borderRadius: 1, 
                        bgcolor: page.status === 'published' ? 'success.main' : 'warning.main',
                        color: 'white', fontSize: '0.7rem', fontWeight: 'bold'
                      }}>
                        {page.status?.toUpperCase() || 'DRAFT'}
                      </Box>
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" size="small" onClick={() => navigate(`/editor/${page.id}`)}>
                      Éditer
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="success" 
                      size="small" 
                      onClick={() => handlePublish(page.id)}
                      disabled={page.status === 'published'}
                    >
                      {page.status === 'published' ? 'Publiée' : 'Publier'}
                    </Button>
                    <Button variant="text" color="error" size="small" onClick={() => handleDelete(page.id)}>
                      Supprimer
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    </Box>
  );
};

export default PageList;