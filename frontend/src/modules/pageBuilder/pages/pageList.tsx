// frontend/src/modules/dashboard/pages/pageList.tsx
import React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import {
  useGetPagesQuery,
  useCreatePageMutation,
  useDeletePageMutation,
  usePublishPageMutation,
} from "../../../redux/services/pages.api";

import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { routes } from "../../../router/routes";
import { useSnackbar } from "notistack";
import { getApiErrorMessage } from "../../../redux/api/errorMessages";

export const PageList: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // ✅ tenant source of truth (NO HARDCODE)
  const siteId = useSelector(
    (state: RootState) => state.site.currentSite?.id
  );

  // 🚨 guard: SaaS rule
  const { data: pages, isLoading, error } = useGetPagesQuery(siteId!, {
    skip: !siteId,
  });

  const [createPageAction, { isLoading: isCreating }] =
    useCreatePageMutation();

  const [deletePageAction] = useDeletePageMutation();
  const [publishPageAction] = usePublishPageMutation();


const handleCreate = async () => {
  if (!siteId) return;

  try {
    const res = await createPageAction({
      siteId,
      title: "Nouvelle Page",
      slug: `page-${Math.random().toString(36).substring(7)}`, 
      blocks: [],
    }).unwrap();

    if (res?.id) {
      navigate(routes.pageEdit(siteId, res.id));
    }
  } catch (err) {
    enqueueSnackbar(getApiErrorMessage(err), { variant: "error" });
    console.error("Erreur de création:", err);
  }
};

  const handleDelete = async (pageId: number) => {
    if (!siteId) return;

    if (window.confirm("Supprimer cette page ?")) {
      try {
        await deletePageAction({ siteId, pageId }).unwrap();
      } catch (err) {
        console.error("Erreur de suppression:", err);
      }
    }
  };

  const handlePublish = async (pageId: number) => {
    if (!siteId) return;

    try {
      await publishPageAction({ siteId, pageId }).unwrap();
    } catch (err) {
      console.error("Erreur de publication:", err);
    }
  };

  // 🔥 tenant not selected state
  if (!siteId) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          Sélectionnez un site pour gérer les pages
        </Alert>
      </Box>
    );
  }

  // loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          Gestion des Pages
        </Typography>

        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={isCreating}
        >
          {isCreating ? "Création..." : "+ Créer une Page"}
        </Button>
      </Stack>

      {/* ERROR */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {getApiErrorMessage(error)}
        </Alert>
      )}

      {/* EMPTY STATE */}
      {!pages || pages.length === 0 ? (
        <Typography align="center" sx={{ py: 5 }} color="text.secondary">
          Aucune page trouvée
        </Typography>
      ) : (
        <Stack spacing={2}>
          {pages.map((page: any) => (
            <Card
              key={page.id}
              variant="outlined"
              sx={{
                "&:hover": {
                  boxShadow: 3,
                  borderColor: "primary.main",
                },
                transition: "0.3s",
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  {/* INFO */}
                  <Box>
                    <Typography variant="h6">{page.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      /{page.slug}
                      <Box
                        component="span"
                        sx={{
                          ml: 1,
                          px: 1,
                          borderRadius: 1,
                          fontSize: "0.7rem",
                          fontWeight: "bold",
                          color: "white",
                          bgcolor:
                            page.status === "published"
                              ? "success.main"
                              : "warning.main",
                        }}
                      >
                        {page.status?.toUpperCase() || "DRAFT"}
                      </Box>
                    </Typography>
                  </Box>

                  {/* ACTIONS */}
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate( routes.pageEdit(siteId, page.id)) }
                    >
                      Éditer
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      disabled={page.status === "published"}
                      onClick={() => handlePublish(page.id)}
                    >
                      {page.status === "published" ? "Publiée" : "Publier"}
                    </Button>

                    {!page.systemType && (
  <Button
    size="small"
    color="error"
    onClick={() => handleDelete(page.id)}
  >
    Supprimer
  </Button>
)}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default PageList;
