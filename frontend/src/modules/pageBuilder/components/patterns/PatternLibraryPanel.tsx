import React from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography
} from "@mui/material";

import {
  useSnackbar
} from "notistack";

import {
  useGetPatternsQuery
} from "../../../../redux/services/patterns.api";

import {
  getPatternErrorMessage
} from "./patternError";

import {
  insertPatternAtPageEnd,
  type PatternInsertActions
} from "./patternActions";

type PatternLibraryPanelProps = {
  open: boolean;
  onClose: () => void;
  siteId: number | string;
  actions: PatternInsertActions;
};

export const PatternLibraryPanel = ({
  open,
  onClose,
  siteId,
  actions
}: PatternLibraryPanelProps) => {
  const {
    enqueueSnackbar
  } = useSnackbar();

  const {
    data: patterns = [],
    isLoading,
    isFetching,
    error
  } =
    useGetPatternsQuery(siteId, {
      skip:
        !open ||
        !siteId
    });

  const [
    message,
    setMessage
  ] = React.useState<string | null>(null);

  React.useEffect(
    () => {
      if (!open) {
        setMessage(null);
      }
    },
    [
      open
    ]
  );

  const handleInsert =
    React.useCallback(
      (rootBlock: typeof patterns[number]["rootBlock"]) => {
        try {
          insertPatternAtPageEnd(
            rootBlock,
            actions
          );

          setMessage(
            "Pattern inserted."
          );
          enqueueSnackbar(
            "Pattern inserted.",
            {
              variant: "success"
            }
          );
          onClose();
        } catch (insertError) {
          const failureMessage =
            getPatternErrorMessage(
              insertError,
              "Failed to insert pattern."
            );

          setMessage(
            failureMessage
          );
          enqueueSnackbar(
            failureMessage,
            {
              variant: "error"
            }
          );
        }
      },
      [
        actions,
        enqueueSnackbar,
        onClose
      ]
    );

  const loading =
    isLoading ||
    isFetching;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Pattern Library
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {message && (
            <Alert severity="info">
              {message}
            </Alert>
          )}

          {error && (
            <Alert severity="error">
              {getPatternErrorMessage(
                error,
                "Failed to load patterns."
              )}
            </Alert>
          )}

          {loading && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <CircularProgress size={18} />
              <Typography variant="body2">
                Loading patterns...
              </Typography>
            </Stack>
          )}

          {!loading &&
            !error &&
            patterns.length === 0 && (
              <Alert severity="info">
                No patterns saved for this site yet.
              </Alert>
            )}

          {!loading &&
            !error &&
            patterns.map((pattern) => (
              <Box
                key={pattern.id}
                sx={{
                  border:
                    "1px solid #e0e0e0",
                  borderRadius:
                    "8px",
                  p: 2
                }}
              >
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row"
                  }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{
                    xs: "stretch",
                    sm: "center"
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                    >
                      {pattern.name}
                    </Typography>

                    {pattern.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.5
                        }}
                      >
                        {pattern.description}
                      </Typography>
                    )}

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        mt: 1
                      }}
                    >
                      {pattern.blockType}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    onClick={() =>
                      handleInsert(
                        pattern.rootBlock
                      )
                    }
                    sx={{
                      textTransform:
                        "none"
                    }}
                  >
                    Insert
                  </Button>
                </Stack>
              </Box>
            ))}
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions>
        <Button
          onClick={onClose}
          color="inherit"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
