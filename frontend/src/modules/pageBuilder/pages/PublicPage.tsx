import React from "react";
import { useParams } from "react-router-dom";
import { useGetPublicPageQuery } from "../../../redux/services/pages.api";
import { Box, CircularProgress, Typography, Paper, Container } from "@mui/material";

export const PublicPage = () => {
  const { siteId, slug } = useParams<{ siteId: string; slug: string }>();

  // Debug: باش تثبت في الكونسول إن الـ URL params واصلين صح
  console.log("PublicPage Params:", { siteId, slug });

  const {
    data,
    isLoading,
    error,
  } = useGetPublicPageQuery(
    { siteId, slug },
    { skip: !siteId || !slug } // ما تعملش طلب لو الـ params ناقصين
  );

  // 1. حالة التحميل
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement de la page...</Typography>
      </Box>
    );
  }

  // 2. حالة الخطأ أو عدم وجود بيانات
  if (error || !data) {
    console.error("Fetch Public Page Error:", error);
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Paper elevation={3} sx={{ p: 4, textAlign: "center", maxWidth: 500 }}>
          <Typography variant="h4" color="error" gutterBottom>
            404
          </Typography>
          <Typography variant="h6">Page Non Trouvée</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Désolé, la page que vous recherchez n'existe pas ou n'est pas encore publiée.
          </Typography>
          {error && (
            <Typography variant="caption" display="block" sx={{ mt: 2, color: 'grey.500' }}>
              Error Detail: {JSON.stringify((error as any)?.data?.message || "Unknown Error")}
            </Typography>
          )}
        </Paper>
      </Box>
    );
  }

  // 3. عرض الصفحة بنجاح
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box component="header" sx={{ mb: 4, borderBottom: "1px solid #eee", pb: 2 }}>
        <Typography variant="h3" component="h1" fontWeight="bold">
          {data.title}
        </Typography>
        <Typography color="text.secondary">
          Slug: /{data.slug}
        </Typography>
      </Box>

      {/* هنا باش ترسم الـ Blocks لاحقاً، حالياً نعرضوهم كـ JSON للـ Test */}
      <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f5f5f5", overflow: "auto" }}>
        <Typography variant="overline" display="block" gutterBottom>
          Page Content (Blocks JSON)
        </Typography>
        <pre style={{ margin: 0, fontSize: "0.85rem" }}>
          {JSON.stringify(data.blocks, null, 2)}
        </pre>
      </Paper>
    </Container>
  );
};