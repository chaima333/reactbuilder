import React, {
  useEffect,
  useState
} from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress
} from "@mui/material";

type CreateSiteData = {
  name: string;
  subdomain: string;
  title: string;
  description: string;
};

interface CreateSiteModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (
    data: CreateSiteData
  ) => void | Promise<void>;
  isLoading?: boolean;
  initialName?: string;
}

const emptyFormData: CreateSiteData = {
  name: "",
  subdomain: "",
  title: "",
  description: ""
};

const createSubdomain = (
  value: string
): string => {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    )
    .slice(0, 63);
};

export const CreateSiteModal:
React.FC<CreateSiteModalProps> = ({
  open,
  onClose,
  onCreate,
  isLoading = false,
  initialName = ""
}) => {
  const [
    formData,
    setFormData
  ] = useState<CreateSiteData>(
    emptyFormData
  );

  const [
    error,
    setError
  ] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    const normalizedName =
      initialName.trim();

    setFormData({
      name: normalizedName,
      subdomain:
        createSubdomain(
          normalizedName
        ),
      title: normalizedName,
      description: ""
    });

    setError("");
  }, [
    open,
    initialName
  ]);

  const handleClose = () => {
    if (isLoading) {
      return;
    }

    setFormData(
      emptyFormData
    );

    setError("");

    onClose();
  };

  const handleSubmit = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const finalData: CreateSiteData = {
      name:
        formData.name.trim(),

      subdomain:
        createSubdomain(
          formData.subdomain
        ),

      title:
        formData.title.trim(),

      description:
        formData.description.trim()
    };

    if (
      !finalData.name ||
      !finalData.subdomain ||
      !finalData.title
    ) {
      setError(
        "Veuillez remplir tous les champs obligatoires."
      );

      return;
    }

    setError("");

    onCreate(
      finalData
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Créer un nouveau site
      </DialogTitle>

      <form
        onSubmit={handleSubmit}
      >
        <DialogContent>
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Nom du site *"
            value={formData.name}
            onChange={(event) =>
              setFormData(
                current => ({
                  ...current,
                  name:
                    event.target.value
                })
              )
            }
            margin="normal"
            required
            disabled={isLoading}
            inputProps={{
              maxLength: 100
            }}
          />

          <TextField
            fullWidth
            label="Sous-domaine *"
            value={
              formData.subdomain
            }
            onChange={(event) =>
              setFormData(
                current => ({
                  ...current,
                  subdomain:
                    createSubdomain(
                      event.target.value
                    )
                })
              )
            }
            margin="normal"
            required
            disabled={isLoading}
            inputProps={{
              maxLength: 63
            }}
            helperText="Exemple : smart-business donnera smart-business.reactbuilder.com"
          />

          <TextField
            fullWidth
            label="Titre du site *"
            value={formData.title}
            onChange={(event) =>
              setFormData(
                current => ({
                  ...current,
                  title:
                    event.target.value
                })
              )
            }
            margin="normal"
            required
            disabled={isLoading}
            inputProps={{
              maxLength: 150
            }}
          />

          <TextField
            fullWidth
            label="Description"
            value={
              formData.description
            }
            onChange={(event) =>
              setFormData(
                current => ({
                  ...current,
                  description:
                    event.target.value
                })
              )
            }
            margin="normal"
            multiline
            rows={3}
            disabled={isLoading}
            inputProps={{
              maxLength: 500
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleClose}
            disabled={isLoading}
          >
            Annuler
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress
                size={24}
              />
            ) : (
              "Créer"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};