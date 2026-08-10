// frontend/src/modules/sites/pages/SitesPage.tsx

import React, {
  useState,
  useEffect
} from "react";

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
} from "@mui/material";

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Group as GroupIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

import {
  CreateSiteModal
} from "../components/CreateSiteModal";

import {
  useSnackbar
} from "notistack";

import {
  useNavigate,
  useSearchParams
} from "react-router-dom";

import {
  useGetSitesQuery,
  useDeleteSiteMutation,
  useCreateSiteMutation
} from "../../../redux/services/sites.api";

import {
  useDeletePageMutation
} from "../../../redux/services/pages.api";

import {
  useLanguage
} from "../../../app/providers/LanguageProvider";

import {
  getApiErrorMessage
} from "../../../redux/api/errorMessages";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { downloadSiteExport } from "../services/siteExport";

export const Sites: React.FC = () => {
  const { t } =
    useLanguage();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
 const userRole = useSelector(
  (state: RootState) =>
    state.auth.user?.role
);

const accessToken = useSelector(
  (state: RootState) =>
    state.auth.accessToken
);

const isGlobalAdmin =
  userRole === "ADMIN";
const canCreateSite =
  userRole === "ADMIN" ||
  userRole === "EDITOR";
  const { enqueueSnackbar } =
    useSnackbar();

  const [modalOpen, setModalOpen] = useState(false);
const [ prefilledSiteName, setPrefilledSiteName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [selectedSite, setSelectedSite] =
    useState<any>(null);

  const [exportingSiteId, setExportingSiteId] =
    useState<number | null>(null);

    const {
  data,
  isLoading,
  error,
  refetch
} =
  useGetSitesQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true
    }
  );

  const [
    createSite,
    { isLoading: isCreating }
  ] =
    useCreateSiteMutation();

  const [
    deleteSite,
    { isLoading: isDeleting }
  ] =
    useDeleteSiteMutation();

  const [deletePage] =
    useDeletePageMutation();

  const sites =
    data || [];

  console.log(
    "RAW API DATA:",
    data
  );

  console.log(
    "SITES ARRAY:",
    sites
  );

  console.log(
    "SITE SAMPLE:",
    sites[0]
  );

  // =========================
  // ROLE HELPERS
  // =========================

 const getSiteRole = (
  site: any
) => {
  const siteRole =
    site?.role ||
    site?.memberRole ||
    site?.siteRole ||
    site?.membership?.role ||
    site?.SiteMember?.role;

  if (siteRole) {
    return siteRole;
  }

  if (isGlobalAdmin) {
    return "SUPER_ADMIN";
  }

  return "VIEWER";
};

 const isSuperAdmin = (
  site: any
) => {
  return getSiteRole(site) === "SUPER_ADMIN";
};

const isOwner = (
  site: any
) => {
  return getSiteRole(site) === "OWNER";
};

const isAdmin = (
  site: any
) => {
  return getSiteRole(site) === "ADMIN";
};

  const isEditor = (
    site: any
  ) => {
    return getSiteRole(site) === "EDITOR";
  };

const canUpdateSite = (
  site: any
) => {
  return (
    isSuperAdmin(site) ||
    isOwner(site) ||
    isAdmin(site)
  );
};

const canDeleteSite = (
  site: any
) => {
  return (
    isSuperAdmin(site) ||
    isOwner(site)
  );
};
const canManageMembers = (
  site: any
) => {
  return (
    isSuperAdmin(site) ||
    isOwner(site) ||
    isAdmin(site)
  );
};
const canCreatePage = (
  site: any
) => {
  return (
    isSuperAdmin(site) ||
    isOwner(site) ||
    isAdmin(site) ||
    isEditor(site)
  );
};

const canUpdatePage = (
  site: any
) => {
  return (
    isSuperAdmin(site) ||
    isOwner(site) ||
    isAdmin(site) ||
    isEditor(site)
  );
};

const canDeletePage = (
  site: any
) => {
  return (
    isSuperAdmin(site) ||
    isOwner(site) ||
    isAdmin(site)
  );
};

  // =========================
  // EMPTY STATE MODAL
  // =========================
useEffect(() => {
  const shouldOpenCreateModal =
    searchParams.get("create") === "1";

  if (
    !shouldOpenCreateModal ||
    !canCreateSite
  ) {
    return;
  }

  const storedCompanyName =
    typeof window !== "undefined"
      ? window.sessionStorage.getItem(
          "reactbuilder.pendingCompanyName"
        )
      : null;

  const requestedName = (
    searchParams.get("name") ||
    storedCompanyName ||
    ""
  ).trim();

  setPrefilledSiteName(
    requestedName
  );

  setModalOpen(true);

  if (
    typeof window !== "undefined"
  ) {
    window.sessionStorage.removeItem(
      "reactbuilder.pendingCompanyName"
    );
  }

  const cleanedParams =
    new URLSearchParams(
      searchParams
    );

  cleanedParams.delete("create");
  cleanedParams.delete("name");

  setSearchParams(
    cleanedParams,
    {
      replace: true
    }
  );
}, [
  canCreateSite,
  searchParams,
  setSearchParams
]);

 useEffect(() => {
  if (
    !isLoading &&
    sites.length === 0 &&
    canCreateSite
  ) {
    setModalOpen(true);
  }
}, [
  isLoading,
  sites.length,
  canCreateSite
]);
  // =========================
  // CREATE SITE
  // =========================

  const handleCreateSite = async (
    siteData: any
  ) => {
     if (!canCreateSite) {
    enqueueSnackbar(
      "Vous n'avez pas la permission de créer un site.",
      {
        variant: "warning"
      }
    );

    return;
  }
    try {
      await createSite(
        siteData
      ).unwrap();

      setModalOpen(false);

      enqueueSnackbar(
        "Site créé avec succès !",
        {
          variant: "success"
        }
      );

      await refetch();

    } catch (err: any) {
      if (err.status === 500) {
        setModalOpen(false);
        await refetch();
      }

      enqueueSnackbar(
        getApiErrorMessage(err),
        {
          variant: "error"
        }
      );

      console.error(
        "Erreur création:",
        err
      );
    }
  };

  // =========================
  // DELETE SITE
  // =========================

  const handleDeleteSite = async () => {
    if (!selectedSite) {
      return;
    }

    try {
      const response =
        await deleteSite(
          selectedSite.id
        ).unwrap();

      console.log(
        "DELETE RESPONSE:",
        response
      );

      enqueueSnackbar(
        "Site supprimé avec succès",
        {
          variant: "success"
        }
      );

      setDeleteDialogOpen(false);
      setSelectedSite(null);

      await refetch();

    } catch (err: any) {
      console.error(
        "DELETE ERROR:",
        err
      );

      enqueueSnackbar(
        err?.data?.message ||
          "Vous n'avez pas la permission de supprimer ce site",
        {
          variant: "error"
        }
      );
    }
  };

  // =========================
  // DELETE PAGE
  // =========================

  const handleDeletePage = async (
    siteId: number,
    pageId: number,
    pageTitle: string
  ) => {
    if (
      !window.confirm(
        `${t.confirmDelete} "${pageTitle}" ?`
      )
    ) {
      return;
    }

    try {
      await deletePage({
        siteId,
        pageId
      }).unwrap();

      enqueueSnackbar(
        t.deleteSuccess,
        {
          variant: "success"
        }
      );

      await refetch();

    } catch (err: any) {
      enqueueSnackbar(
        err?.data?.message ||
          t.error,
        {
          variant: "error"
        }
      );
    }
  };

  // =========================
  // EXPORT SITE
  // =========================

 const handleExportSite = async (
  site: any
) => {
  if (
    !site?.id ||
    exportingSiteId !== null
  ) {
    return;
  }

  if (!canUpdateSite(site)) {
    enqueueSnackbar(
      "Vous n'avez pas la permission d'exporter ce site.",
      {
        variant: "warning",
      }
    );

    return;
  }

  const enteredBaseUrl =
    window.prompt(
      "Domaine public du site pour le SEO et le sitemap. Laissez vide si vous ne le connaissez pas encore.",
      ""
    );

  if (enteredBaseUrl === null) {
    return;
  }

  try {
    setExportingSiteId(
      Number(site.id)
    );

    await downloadSiteExport({
      siteId:
        Number(site.id),

      baseUrl:
        enteredBaseUrl.trim(),

      accessToken,
    });

    enqueueSnackbar(
      "Site exporté avec succès.",
      {
        variant: "success",
      }
    );
  } catch (error) {
    console.error(
      "SITE_EXPORT_FAILED",
      error
    );

    enqueueSnackbar(
      error instanceof Error
        ? error.message
        : "Échec de l'export du site.",
      {
        variant: "error",
      }
    );
  } finally {
    setExportingSiteId(
      null
    );
  }
};
  // =========================
  // LOADING
  // =========================

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          {getApiErrorMessage(error)}
        </Alert>
      </Box>
    );
  }
// =========================
// PUBLIC SITE PATH
// =========================

const getPublicSitePath = (
  site: any
) => {
  const pages =
    Array.isArray(site?.pages)
      ? site.pages
      : [];

  const publishedPages =
    pages.filter(
      (page: any) =>
        page.status === "published" ||
        page.isPublished === true ||
        page.published === true
    );

  const candidates =
    publishedPages.length > 0
      ? publishedPages
      : pages;

  const homepage =
    candidates.find(
      (page: any) =>
        page.isHomepage === true
    ) ||
    candidates.find(
      (page: any) =>
        page.slug === "home" ||
        /^home-\d+$/.test(
          page.slug || ""
        )
    ) ||
    candidates[0];

  if (
    homepage?.slug &&
    homepage.slug !== "home"
  ) {
    return `/site/${site.id}/${homepage.slug}`;
  }

  return `/site/${site.id}`;
};
  // =========================
  // RENDER
  // =========================

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4">
          {t.mySites}
        </Typography>

        {canCreateSite && (
  <Button
    variant="contained"
    startIcon={<AddIcon />}
    onClick={() =>
      setModalOpen(true)
    }
  >
    {t.createSite}
  </Button>
)}
      </Box>

      {sites.length === 0 ? (
        <Box
          textAlign="center"
          py={8}
        >
          <Typography
            variant="h6"
            color="text.secondary"
            gutterBottom
          >
            {t.youHaveNoSites}
          </Typography>

          {canCreateSite ? (
  <Button
    variant="contained"
    startIcon={<AddIcon />}
    onClick={() =>
      setModalOpen(true)
    }
    sx={{ mt: 2 }}
  >
    {t.createFirstSite}
  </Button>
) : (
  <Alert
    severity="info"
    sx={{
      mt: 3,
      maxWidth: 520,
      mx: "auto"
    }}
  >
    Vous avez un accès en lecture seule. Vous ne pouvez pas créer de site.
  </Alert>
)}
        </Box>
      ) : (
        <Grid
          container
          spacing={3}
        >
          {sites.map(
            (site: any) => {
              const role =
                getSiteRole(site);

              return (
                <Grid
                  item
                  xs={12}
                  md={6}
                  lg={4}
                  key={site.id}
                >
                  <Card>
                    <CardContent>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        gap={1}
                      >
                        <Typography
                          variant="h6"
                          gutterBottom
                        >
                          {site.name}
                        </Typography>

                        <Chip
                          label={role}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      <Typography
                        color="text.secondary"
                        gutterBottom
                      >
                        {site.subdomain}
                        .reactbuilder.com
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {site.description ||
                          t.noDescription}
                      </Typography>

                      <Box
                        sx={{
                          mt: 2,
                          pt: 1,
                          borderTop: "1px solid",
                          borderColor: "divider"
                        }}
                      >
                        <Typography variant="body2">
                          📄{" "}
                          {site.pagesCount ||
                            site.pages?.length ||
                            0}{" "}
                          {t.pages}
                        </Typography>

                        <Typography variant="body2">
                          👁️{" "}
                          {site.totalViews ||
                            0}{" "}
                          {t.views}
                        </Typography>

                        <Typography variant="body2">
                          📅 {t.created}{" "}
                          {new Date(
                            site.createdAt
                          ).toLocaleDateString(
                            "fr-FR"
                          )}
                        </Typography>
                      </Box>

                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="subtitle2"
                          gutterBottom
                        >
                          {t.pages}:
                        </Typography>

                        {site.pages &&
                          site.pages.length > 0 && (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 1,
                                mb: 1
                              }}
                            >
                              {site.pages.map(
                                (page: any) => (
                                  <Box
                                    key={page.id}
                                    sx={{
                                      display: "inline-flex",
                                      alignItems: "center"
                                    }}
                                  >
                                    <Chip
                                      label={page.title}
                                      size="small"
                                      onClick={
                                        canUpdatePage(site)
                                          ? () =>
                                              navigate(
                                                `/sites/${site.id}/pages/${page.id}/edit`
                                              )
                                          : undefined
                                      }
                                      sx={{
                                        cursor:
                                          canUpdatePage(site)
                                            ? "pointer"
                                            : "default"
                                      }}
                                    />

                                    {canDeletePage(site) && (
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() =>
                                          handleDeletePage(
                                            site.id,
                                            page.id,
                                            page.title
                                          )
                                        }
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    )}
                                  </Box>
                                )
                              )}
                            </Box>
                          )}

                        {(!site.pages ||
                          site.pages.length === 0) && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {t.noPages}
                          </Typography>
                        )}

                        {canCreatePage(site) && (
                          <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() =>
                              navigate(
                                `/sites/${site.id}/pages/new`
                              )
                            }
                            sx={{ mt: 1 }}
                          >
                            {t.addPage}
                          </Button>
                        )}
                      </Box>
                    </CardContent>

                    <CardActions>
                      {canUpdateSite(site) && (
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() =>
                            navigate(
                              `/sites/${site.id}/edit`
                            )
                          }
                        >
                          {t.edit}
                        </Button>
                      )}
                      {canManageMembers(site) && (
                        <Button
                          size="small"
                          startIcon={<GroupIcon />}
                          onClick={() =>
                            navigate(
                              `/sites/${site.id}/members`
                            )
                          }
                        >
                          Membres
                        </Button>
                      )}
                      
                      {/* ✅ Export Site Button */}
                      {canUpdateSite(site) && (
                        <Button
                          size="small"
                          startIcon={
                            exportingSiteId === site.id
                              ? (
                                  <CircularProgress
                                    size={16}
                                  />
                                )
                              : (
                                  <DownloadIcon />
                                )
                          }
                          disabled={
                            exportingSiteId !== null
                          }
                          onClick={() =>
                            handleExportSite(site)
                          }
                        >
                          {exportingSiteId === site.id
                            ? "Export..."
                            : "Export"}
                        </Button>
                      )}

                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() =>
                          window.open(
                            getPublicSitePath(site),
                            "_blank"
                          )
                        }
                      >
                        Voir
                      </Button>

                      {canDeleteSite(site) && (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => {
                            setSelectedSite(site);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          {t.delete}
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              );
            }
          )}
        </Grid>
      )}
<CreateSiteModal
  open={modalOpen}
  initialName={
    prefilledSiteName
  }
  onClose={() => {
    setModalOpen(false);
    setPrefilledSiteName("");
  }}
  onCreate={handleCreateSite}
  isLoading={isCreating}
/>

      <Dialog
        open={deleteDialogOpen}
        onClose={() =>
          setDeleteDialogOpen(false)
        }
      >
        <DialogTitle>
          {t.confirm}
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            {t.confirmDelete} "
            {selectedSite?.name}" ?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setDeleteDialogOpen(false)
            }
          >
            {t.cancel}
          </Button>

          <Button
            onClick={handleDeleteSite}
            color="error"
            disabled={isDeleting}
          >
            {t.delete}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sites;