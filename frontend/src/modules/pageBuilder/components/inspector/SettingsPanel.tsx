import {
  Box,
  TextField,
  Typography,
  Button,
  Divider,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";

type PageVisibility =
  | "public"
  | "members_only";

type Props = {
  pageVisibility: PageVisibility;

  setPageVisibility: (
    value: PageVisibility
  ) => void;

  pageTitle: string;

  setPageTitle: (
    value: string
  ) => void;

  slug: string;

  setSlug: (
    value: string
  ) => void;

  onExport?: () => void;

  onImport?: (
    file: File
  ) => void;

  onImportHtml?: () => void;

  onImportFigma?: () => void;

  figmaPluginEnabled?: boolean;

  figmaPluginLoading?: boolean;
};

export const SettingsPanel = ({
  pageVisibility,
  setPageVisibility,
  pageTitle,
  setPageTitle,
  slug,
  setSlug,
  onExport,
  onImport,
  onImportHtml,
  onImportFigma,
  figmaPluginEnabled = false,
  figmaPluginLoading = false
}: Props) => {
  return (
    <Box p={2}>
      <Typography
        variant="h6"
        fontWeight="bold"
      >
        Settings
      </Typography>

      <TextField
        fullWidth
        label="Page Title"
        value={pageTitle}
        onChange={(event) =>
          setPageTitle(
            event.target.value
          )
        }
        sx={{
          mt: 2
        }}
      />

      <TextField
        fullWidth
        label="Slug"
        value={slug}
        onChange={(event) =>
          setSlug(
            event.target.value
          )
        }
        sx={{
          mt: 2
        }}
      />

      <FormControl
        fullWidth
        sx={{
          mt: 2
        }}
      >
        <InputLabel id="page-visibility-label">
          Page visibility
        </InputLabel>

        <Select
          labelId="page-visibility-label"
          value={pageVisibility}
          label="Page visibility"
          onChange={(event) =>
            setPageVisibility(
              event.target
                .value as PageVisibility
            )
          }
        >
          <MenuItem value="public">
            Public
          </MenuItem>

          <MenuItem value="members_only">
            Members only
          </MenuItem>
        </Select>
      </FormControl>

      <Divider
        sx={{
          my: 3
        }}
      />

      <Typography
        variant="subtitle2"
        color="primary"
        sx={{
          mb: 2
        }}
      >
        JSON SCHEMA TOOLS
      </Typography>

      <Stack spacing={2}>
        <Button
          variant="outlined"
          fullWidth
          onClick={onExport}
        >
          Export JSON
        </Button>

        <Button
          variant="outlined"
          component="label"
          fullWidth
        >
          Import JSON

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
        </Button>

        {onImportHtml && (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={
              onImportHtml
            }
            sx={{
              fontWeight:
                "bold",

              textTransform:
                "none"
            }}
          >
            IMPORT FROM HTML
          </Button>
        )}

        <Button
          variant="contained"
          color="secondary"
          fullWidth
          disabled={
            figmaPluginLoading ||
            !figmaPluginEnabled
          }
          onClick={
            onImportFigma
          }
          sx={{
            fontWeight:
              "bold",

            textTransform:
              "none"
          }}
        >
          CONNECT FIGMA PLUGIN
        </Button>

        {!figmaPluginLoading &&
          !figmaPluginEnabled && (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Figma Plugin is disabled
              by administrator
            </Typography>
          )}
      </Stack>
    </Box>
  );
};
