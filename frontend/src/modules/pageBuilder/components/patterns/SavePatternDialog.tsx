import React from "react";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField
} from "@mui/material";

import type {
  Block
} from "../../types/page.types";

import {
  useCreatePatternMutation
} from "../../../../redux/services/patterns.api";

import {
  getPatternErrorMessage
} from "./patternError";

const MAX_PATTERN_NAME_LENGTH = 120;

type SavePatternDialogProps = {
  open: boolean;
  onClose: () => void;
  siteId: number | string;
  selectedSection: Block | null;
  onSaved?: () => void;
};

export const SavePatternDialog = ({
  open,
  onClose,
  siteId,
  selectedSection,
  onSaved
}: SavePatternDialogProps) => {
  const [
    name,
    setName
  ] = React.useState("");

  const [
    description,
    setDescription
  ] = React.useState("");

  const [
    localError,
    setLocalError
  ] = React.useState<string | null>(null);

  const [
    createPattern,
    {
      isLoading,
      error
    }
  ] =
    useCreatePatternMutation();

  const resetForm =
    React.useCallback(
      () => {
        setName("");
        setDescription("");
        setLocalError(null);
      },
      []
    );

  const handleClose =
    React.useCallback(
      () => {
        if (isLoading) {
          return;
        }

        resetForm();
        onClose();
      },
      [
        isLoading,
        onClose,
        resetForm
      ]
    );

  React.useEffect(
    () => {
      if (!open) {
        resetForm();
      }
    },
    [
      open,
      resetForm
    ]
  );

  const handleSubmit =
    React.useCallback(
      async () => {
        setLocalError(null);

        const trimmedName =
          name.trim();

        if (!trimmedName) {
          setLocalError(
            "Pattern name is required."
          );
          return;
        }

        if (
          trimmedName.length >
          MAX_PATTERN_NAME_LENGTH
        ) {
          setLocalError(
            "Pattern name must be 120 characters or fewer."
          );
          return;
        }

        if (
          !selectedSection ||
          selectedSection.type !== "section"
        ) {
          setLocalError(
            "Select a page section before saving a pattern."
          );
          return;
        }

        try {
          await createPattern({
            siteId,
            name: trimmedName,
            description:
              description.trim() || null,
            rootBlock:
              selectedSection
          }).unwrap();

          resetForm();
          onSaved?.();
          onClose();
        } catch {
          // RTK Query exposes the backend error through the mutation state.
        }
      },
      [
        createPattern,
        description,
        name,
        onClose,
        onSaved,
        resetForm,
        selectedSection,
        siteId
      ]
    );

  const shownError =
    localError ||
    getPatternErrorMessage(
      error,
      ""
    );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Save as Pattern
      </DialogTitle>

      <DialogContent dividers>
        <Stack
          spacing={2}
          sx={{
            pt: 1
          }}
        >
          {shownError && (
            <Alert severity="error">
              {shownError}
            </Alert>
          )}

          {!selectedSection && (
            <Alert severity="info">
              Select a page section to save it as a pattern.
            </Alert>
          )}

          {selectedSection &&
            selectedSection.type !== "section" && (
              <Alert severity="warning">
                Only page sections can be saved as patterns.
              </Alert>
            )}

          <TextField
            label="Pattern name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setLocalError(null);
            }}
            required
            fullWidth
            inputProps={{
              maxLength:
                MAX_PATTERN_NAME_LENGTH
            }}
            helperText={`${name.trim().length}/${MAX_PATTERN_NAME_LENGTH}`}
            disabled={isLoading}
          />

          <TextField
            label="Description"
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            multiline
            minRows={3}
            fullWidth
            disabled={isLoading}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClose}
          color="inherit"
          disabled={isLoading}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            isLoading ||
            !selectedSection ||
            selectedSection.type !== "section"
          }
        >
          {isLoading
            ? "Saving..."
            : "Save Pattern"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
