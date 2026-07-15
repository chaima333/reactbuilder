import {
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from "@mui/material";

import {
  Edit,
  Monitor,
  Publish,
  Redo,
  Save,
  Smartphone,
  Tablet,
  Undo,
  VerticalAlignBottom,
  VerticalAlignTop,
  Visibility
} from "@mui/icons-material";

interface PageHeaderProps {
  title: string;

  device:
    | "desktop"
    | "tablet"
    | "mobile";

  onDeviceChange: (
    device:
      | "desktop"
      | "tablet"
      | "mobile"
  ) => void;

  onPreview: () => void;
  isPreview: boolean;

  onSave: () => void;
  onPublish: () => void;

  hasPageId: boolean;
  loading: boolean;

  canUndo: boolean;
  canRedo: boolean;

  onUndo: () => void;
  onRedo: () => void;

  errors: any[];

  onExport?: () => void;
  onImport?: (file: File) => void;
  onImportHtml?: () => void;

  // =========================
  // GLOBAL LAYOUT
  // =========================

  onSetGlobalNavbar?: () => void;
  onSetGlobalFooter?: () => void;

  canSetGlobalNavbar?: boolean;
  canSetGlobalFooter?: boolean;

  globalLayoutLoading?: boolean;
}

export const PageHeader = ({
  title,
  device,
  onDeviceChange,
  onPreview,
  isPreview,
  onSave,
  onPublish,
  loading,
  hasPageId,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  errors = [],
  onExport,
  onImport,
  onSetGlobalNavbar,
  onSetGlobalFooter,
  canSetGlobalNavbar = false,
  canSetGlobalFooter = false,
  globalLayoutLoading = false
}: PageHeaderProps) => {
  const isBusy =
    loading ||
    globalLayoutLoading;

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        px: 2,
        py: 1,
        gap: 1,
        minHeight: "56px",
        borderBottom:
          "1px solid #e0e0e0",
        bgcolor: "#fff",
        overflowX: "auto"
      }}
    >
      {/* =========================
          PAGE TITLE
      ========================= */}

      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{
          minWidth: 0,
          flexShrink: 0
        }}
      >
        <Typography
          variant="subtitle1"
          noWrap
          sx={{
            maxWidth: 220,
            fontWeight: 600,
            color: "#333"
          }}
        >
          {title || "Untitled Page"}
        </Typography>

        {isBusy && (
          <CircularProgress
            size={16}
            sx={{
              color: "#666"
            }}
          />
        )}
      </Stack>

      {/* =========================
          DEVICES + HISTORY
      ========================= */}

      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          flexShrink: 0
        }}
      >
        <ToggleButtonGroup
          value={device}
          exclusive
          size="small"
          onChange={(_, nextDevice) => {
            if (nextDevice) {
              onDeviceChange(
                nextDevice
              );
            }
          }}
          sx={{
            height: "32px"
          }}
        >
          <ToggleButton
            value="desktop"
            aria-label="Desktop preview"
          >
            <Monitor fontSize="small" />
          </ToggleButton>

          <ToggleButton
            value="tablet"
            aria-label="Tablet preview"
          >
            <Tablet fontSize="small" />
          </ToggleButton>

          <ToggleButton
            value="mobile"
            aria-label="Mobile preview"
          >
            <Smartphone fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mx: 0.5,
            height: "24px",
            alignSelf: "center"
          }}
        />

        <Stack
          direction="row"
          spacing={0.5}
        >
          <Tooltip title="Undo (Ctrl+Z)">
            <span>
              <IconButton
                size="small"
                onClick={onUndo}
                disabled={!canUndo}
              >
                <Undo fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Redo (Ctrl+Y)">
            <span>
              <IconButton
                size="small"
                onClick={onRedo}
                disabled={!canRedo}
              >
                <Redo fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      {/* =========================
          ACTIONS
      ========================= */}

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          flexShrink: 0
        }}
      >
        {/* IMPORT PAGE JSON */}

        <Tooltip title="Import Page JSON">
          <IconButton
            component="label"
            size="small"
            color="primary"
          >
            <Edit
              sx={{
                fontSize: 20,
                transform:
                  "rotate(180deg)"
              }}
            />

            <input
              type="file"
              hidden
              accept=".json"
              onChange={(event) => {
                const file =
                  event.target
                    .files?.[0];

                if (
                  file &&
                  onImport
                ) {
                  onImport(file);
                }

                event.target.value =
                  "";
              }}
            />
          </IconButton>
        </Tooltip>

        {/* EXPORT PAGE JSON */}

        <Tooltip title="Export Page JSON">
          <span>
            <IconButton
              size="small"
              color="primary"
              onClick={onExport}
              disabled={!onExport}
            >
              <Save
                sx={{
                  fontSize: 20
                }}
              />
            </IconButton>
          </span>
        </Tooltip>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            height: "24px",
            mx: 0.5
          }}
        />

        {/* =========================
            GLOBAL NAVBAR
        ========================= */}

        {canSetGlobalNavbar && (
          <Tooltip title="Use the selected Navbar on every public page">
            <span>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                disabled={
                  globalLayoutLoading ||
                  !onSetGlobalNavbar
                }
                startIcon={
                  globalLayoutLoading
                    ? (
                      <CircularProgress
                        size={14}
                      />
                    )
                    : (
                      <VerticalAlignTop
                        fontSize="small"
                      />
                    )
                }
                onClick={
                  onSetGlobalNavbar
                }
                sx={{
                  textTransform:
                    "none",
                  borderRadius:
                    "6px",
                  whiteSpace:
                    "nowrap"
                }}
              >
                Global Navbar
              </Button>
            </span>
          </Tooltip>
        )}

        {/* =========================
            GLOBAL FOOTER
        ========================= */}

        {canSetGlobalFooter && (
          <Tooltip title="Use the selected Footer on every public page">
            <span>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                disabled={
                  globalLayoutLoading ||
                  !onSetGlobalFooter
                }
                startIcon={
                  globalLayoutLoading
                    ? (
                      <CircularProgress
                        size={14}
                      />
                    )
                    : (
                      <VerticalAlignBottom
                        fontSize="small"
                      />
                    )
                }
                onClick={
                  onSetGlobalFooter
                }
                sx={{
                  textTransform:
                    "none",
                  borderRadius:
                    "6px",
                  whiteSpace:
                    "nowrap"
                }}
              >
                Global Footer
              </Button>
            </span>
          </Tooltip>
        )}

        {/* PREVIEW */}

        <Button
          size="small"
          variant="outlined"
          color="inherit"
          onClick={onPreview}
          startIcon={
            isPreview
              ? (
                <Edit fontSize="small" />
              )
              : (
                <Visibility fontSize="small" />
              )
          }
          sx={{
            textTransform: "none",
            borderRadius: "6px",
            whiteSpace: "nowrap"
          }}
        >
          {isPreview
            ? "Edit"
            : "Preview"}
        </Button>

        {/* SAVE */}

        <Button
          size="small"
          variant="contained"
          onClick={onSave}
          disabled={isBusy}
          startIcon={
            <Save fontSize="small" />
          }
          sx={{
            textTransform: "none",
            borderRadius: "6px",
            boxShadow: "none",
            bgcolor: "#f5f5f5",
            color: "#333",
            whiteSpace: "nowrap",

            "&:hover": {
              bgcolor: "#eeeeee",
              boxShadow: "none"
            }
          }}
        >
          {loading
            ? "..."
            : "Save"}
        </Button>

        {/* PUBLISH */}

        <Tooltip
          title={
            errors.length > 0
              ? `Fix ${errors.length} errors`
              : !hasPageId
                ? "Save the page before publishing"
                : "Publish"
          }
        >
          <span>
            <Button
              size="small"
              variant="contained"
              color={
                errors.length > 0
                  ? "error"
                  : "success"
              }
              onClick={onPublish}
              disabled={
                !hasPageId ||
                errors.length > 0 ||
                isBusy
              }
              startIcon={
                <Publish fontSize="small" />
              }
              sx={{
                textTransform: "none",
                borderRadius: "6px",
                boxShadow: "none",
                whiteSpace: "nowrap"
              }}
            >
              Publish
            </Button>
          </span>
        </Tooltip>
      </Stack>
    </Stack>
  );
};