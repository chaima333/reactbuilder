import React, {
  useState
} from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  Add as AddIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";

import {
  useSnackbar
} from "notistack";

import {
  useParams
} from "react-router-dom";

import {
  useGetMediaQuery,
  useUploadMediaMutation,
  useDeleteMediaMutation,
  useUpdateMediaAltMutation,
} from "../../../redux/services/media.api";

import {
  useGetSiteAccessQuery
} from "../../../redux/services/sites.api";

import {
  MediaGrid
} from "../components/MediaGrid";

import {
  UploadModal
} from "../components/UploadModal";

export const MediaPage: React.FC = () => {
  const {
    siteId
  } = useParams<{
    siteId: string;
  }>();

  const siteIdNumber =
    Number(siteId);

  const {
    enqueueSnackbar
  } = useSnackbar();

  const [
    uploadModalOpen,
    setUploadModalOpen
  ] = useState(false);

  const [
    altDialogOpen,
    setAltDialogOpen
  ] = useState(false);

  const [
    selectedMedia,
    setSelectedMedia
  ] = useState<{
    id: number;
    alt: string;
  } | null>(null);

  const [
    newAlt,
    setNewAlt
  ] = useState("");

  // =========================
  // SITE ACCESS / ROLE
  // =========================

  const {
    data: siteAccess,
    isLoading: accessLoading,
    isFetching: accessFetching,
  } = useGetSiteAccessQuery(
    siteIdNumber,
    {
      skip:
        !siteId ||
        Number.isNaN(siteIdNumber),
      refetchOnMountOrArgChange: true,
    }
  );

  const siteRole =
    siteAccess?.role || "VIEWER";

  const roleIsLoading =
    accessLoading ||
    accessFetching;

  const canUploadMedia =
    siteRole === "OWNER" ||
    siteRole === "ADMIN" ||
    siteRole === "EDITOR";

  const canUpdateMedia =
    siteRole === "OWNER" ||
    siteRole === "ADMIN" ||
    siteRole === "EDITOR";

  const canDeleteMedia =
    siteRole === "OWNER" ||
    siteRole === "ADMIN";

  const isReadOnly =
    !canUploadMedia &&
    !canUpdateMedia &&
    !canDeleteMedia;

  // =========================
  // DATA
  // =========================

  const {
    data,
    isLoading,
    refetch
  } = useGetMediaQuery(
    {
      siteId: siteId!
    },
    {
      skip: !siteId
    }
  );

  const [
    uploadMedia,
    {
      isLoading: isUploading
    }
  ] = useUploadMediaMutation();

  const [
    deleteMedia
  ] = useDeleteMediaMutation();

  const [
    updateAlt
  ] = useUpdateMediaAltMutation();

  const mediaList =
    data?.data || [];

  // =========================
  // ACTIONS
  // =========================

  const handleUpload = async (
    file: File,
    alt: string
  ) => {
    if (!siteId) {
      return;
    }

    if (!canUploadMedia) {
      enqueueSnackbar(
        "Vous n'avez pas le droit d'ajouter des médias.",
        {
          variant: "warning"
        }
      );

      return;
    }

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    formData.append(
      "alt",
      alt
    );

    try {
      await uploadMedia({
        siteId,
        formData
      }).unwrap();

      enqueueSnackbar(
        "Image uploadée!",
        {
          variant: "success"
        }
      );

      setUploadModalOpen(false);
    } catch (error) {
      enqueueSnackbar(
        "Erreur d'upload",
        {
          variant: "error"
        }
      );
    }
  };

  const handleDelete = async (
    id: number
  ) => {
    if (!siteId) {
      return;
    }

    if (!canDeleteMedia) {
      enqueueSnackbar(
        "Seuls OWNER et ADMIN peuvent supprimer un média.",
        {
          variant: "warning"
        }
      );

      return;
    }

    if (
      window.confirm(
        "Supprimer ?"
      )
    ) {
      try {
        await deleteMedia({
          siteId,
          id
        }).unwrap();

        enqueueSnackbar(
          "Supprimé!",
          {
            variant: "success"
          }
        );
      } catch (error) {
        enqueueSnackbar(
          "Erreur",
          {
            variant: "error"
          }
        );
      }
    }
  };

  const handleOpenAltDialog = (
    id: number,
    alt: string
  ) => {
    if (!canUpdateMedia) {
      enqueueSnackbar(
        "Vous n'avez pas le droit de modifier ce média.",
        {
          variant: "warning"
        }
      );

      return;
    }

    setSelectedMedia({
      id,
      alt
    });

    setNewAlt(alt);

    setAltDialogOpen(true);
  };

  const handleUpdateAlt = async () => {
    if (
      !selectedMedia ||
      !siteId
    ) {
      return;
    }

    if (!canUpdateMedia) {
      enqueueSnackbar(
        "Vous n'avez pas le droit de modifier ce média.",
        {
          variant: "warning"
        }
      );

      return;
    }

    try {
      await updateAlt({
        siteId,
        id: selectedMedia.id,
        alt: newAlt
      }).unwrap();

      enqueueSnackbar(
        "Alt mis à jour!",
        {
          variant: "success"
        }
      );

      setAltDialogOpen(false);
    } catch (error) {
      enqueueSnackbar(
        "Erreur",
        {
          variant: "error"
        }
      );
    }
  };

  // =========================
  // RENDER
  // =========================

  return (
    <Box p={3}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="bold"
          >
            Médiathèque
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            mt={1}
          >
            <Chip
              size="small"
              label={
                roleIsLoading
                  ? "Role: Loading..."
                  : `Role: ${siteRole}`
              }
              color={
                canDeleteMedia
                  ? "success"
                  : canUploadMedia
                    ? "info"
                    : "default"
              }
            />

            {isReadOnly && (
              <Chip
                size="small"
                label="Read-only"
                variant="outlined"
              />
            )}
          </Stack>
        </Box>

        <Box>
          <Button
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            sx={{ mr: 2 }}
          >
            Rafraîchir
          </Button>

          {canUploadMedia && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() =>
                setUploadModalOpen(true)
              }
            >
              Nouveau
            </Button>
          )}
        </Box>
      </Stack>

      {isReadOnly && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
        >
          Vous pouvez consulter les médias, mais vous ne pouvez pas ajouter,
          modifier ou supprimer des fichiers.
        </Alert>
      )}

      {siteRole === "EDITOR" && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
        >
          Vous pouvez ajouter et modifier les textes alternatifs, mais vous ne
          pouvez pas supprimer les médias.
        </Alert>
      )}

      <MediaGrid
  media={mediaList}
  isLoading={isLoading}
  onDelete={handleDelete}
  onEditAlt={handleOpenAltDialog}
  canUpdateMedia={canUpdateMedia}
  canDeleteMedia={canDeleteMedia}
/>

      {canUploadMedia && (
        <UploadModal
          open={uploadModalOpen}
          onClose={() =>
            setUploadModalOpen(false)
          }
          onUpload={handleUpload}
          isLoading={isUploading}
        />
      )}

      <Dialog
        open={altDialogOpen}
        onClose={() =>
          setAltDialogOpen(false)
        }
      >
        <DialogTitle>
          Modifier Alt
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            value={newAlt}
            onChange={(e) =>
              setNewAlt(e.target.value)
            }
            margin="normal"
            autoFocus
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setAltDialogOpen(false)
            }
          >
            Annuler
          </Button>

          <Button
            onClick={handleUpdateAlt}
            variant="contained"
            color="primary"
            disabled={!canUpdateMedia}
          >
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MediaPage;