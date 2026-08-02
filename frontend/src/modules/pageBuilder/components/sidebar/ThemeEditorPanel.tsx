import React from "react";

import {
  Box,
  Typography,
  Divider,
  TextField,
  MenuItem,
  Tooltip,
  IconButton,
  Stack,
  Button
} from "@mui/material";

import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useParams } from "react-router-dom";

import { useTheme } from "../../core/theme/themeContext";
import { useUpdateSiteThemeMutation } from "../../../../redux/services/sites.api";

const themePresets = {
  brand360: {
    name: "360 Next Brand",
    primary: "#00C449",
    secondary: "#0D0D0D",
    bg: "#F2F2F2",
    surface: "#FFFFFF"
  },
  midnight: {
    name: "Midnight Pro",
    primary: "#38BDF8",
    secondary: "#0F172A",
    bg: "#0F172A",
    surface: "#1E293B"
  },
  modern: {
    name: "Modern Clean",
    primary: "#0066FF",
    secondary: "#000000",
    bg: "#FFFFFF",
    surface: "#F8FAFC"
  }
};

const fontOptions = [
  "'Montserrat', sans-serif",
  "'Roboto', sans-serif",
  "'Poppins', sans-serif"
];

const setNestedValue = (
  source: any,
  path: string,
  value: any
) => {
  const next =
    structuredClone(source || {});

  const keys =
    path.split(".");

  let current =
    next;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      current[key] = value;
      return;
    }

    current[key] =
      current[key] || {};

    current =
      current[key];
  });

  return next;
};

interface ThemeEditorPanelProps {
  onApplyThemeToPage?: () => void;
}

export const ThemeEditorPanel = ({
  onApplyThemeToPage
}: ThemeEditorPanelProps) => {
  const { siteId } =
    useParams();

  const {
    tokens,
    updateToken
  } = useTheme() as any;

  const [
    updateSiteTheme,
    {
      isLoading: isThemeSaving
    }
  ] = useUpdateSiteThemeMutation();

  const patchToken = (
    path: string,
    value: any
  ) => {
    const nextTokens =
      setNestedValue(
        tokens,
        path,
        value
      );

    /**
     * PageEditor يمرّر updateToken كـobject merge.
     * لذلك نبعثلو tokens كاملة.
     */
    updateToken(nextTokens);
  };

  const applyPreset = (
    preset: any
  ) => {
    let nextTokens =
      tokens || {};

    nextTokens =
      setNestedValue(
        nextTokens,
        "colors.brand.primary",
        preset.primary
      );

    nextTokens =
      setNestedValue(
        nextTokens,
        "colors.brand.secondary",
        preset.secondary
      );

    nextTokens =
      setNestedValue(
        nextTokens,
        "colors.background.default",
        preset.bg
      );

    nextTokens =
      setNestedValue(
        nextTokens,
        "colors.background.surface",
        preset.surface
      );

    updateToken(nextTokens);
  };

  const handleSaveTheme = async () => {
    if (!siteId) {
      return;
    }

    await updateSiteTheme({
      siteId,
      theme: tokens
    }).unwrap();
  };

  const safeTokens = {
    colors: {
      brand: {
        primary:
          tokens?.colors?.brand?.primary ||
          "#10b981",
        secondary:
          tokens?.colors?.brand?.secondary ||
          "#3b82f6"
      },
      background: {
        default:
          tokens?.colors?.background?.default ||
          "#ffffff",
        surface:
          tokens?.colors?.background?.surface ||
          "#f5f5f5"
      }
    },
    typography: {
      fontFamily:
        tokens?.typography?.fontFamily ||
        "'Montserrat', sans-serif",
      h1:
        tokens?.typography?.h1 ||
        "32px",
      body:
        tokens?.typography?.body ||
        "16px"
    }
  };

  return (
    <Box p={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography
          variant="h6"
          fontWeight="bold"
        >
          🎨 Theme Editor
        </Typography>

        <Tooltip title="Reset to Default">
          <IconButton
            size="small"
            onClick={() => window.location.reload()}
          >
            <RestartAltIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight="bold"
        sx={{
          mb: 1,
          display: "block"
        }}
      >
        BRAND PRESETS
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        mb={3}
      >
        {Object.entries(themePresets).map(([key, p]) => (
          <Tooltip
            key={key}
            title={p.name}
          >
            <Box
              onClick={() => applyPreset(p)}
              sx={{
                width: 35,
                height: 35,
                borderRadius: "8px",
                bgcolor: p.primary,
                cursor: "pointer",
                border: 2,
                borderColor:
                  safeTokens.colors.brand.primary === p.primary
                    ? "text.primary"
                    : "divider",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                overflow: "hidden",
                "&:hover": {
                  transform: "scale(1.1)"
                },
                transition: "0.2s"
              }}
            >
              <Box
                sx={{
                  width: "50%",
                  height: "50%",
                  bgcolor:
                    p.secondary || p.bg
                }}
              />
            </Box>
          </Tooltip>
        ))}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography
        variant="subtitle2"
        gutterBottom
      >
        Brand Identity
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Primary"
          type="color"
          fullWidth
          size="small"
          value={safeTokens.colors.brand.primary}
          onChange={(e) =>
            patchToken(
              "colors.brand.primary",
              e.target.value
            )
          }
        />

        <TextField
          label="Secondary"
          type="color"
          fullWidth
          size="small"
          value={safeTokens.colors.brand.secondary}
          onChange={(e) =>
            patchToken(
              "colors.brand.secondary",
              e.target.value
            )
          }
        />
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Typography
        variant="subtitle2"
        gutterBottom
      >
        Typography
      </Typography>

      <Stack spacing={2}>
        <TextField
          select
          label="Font Family"
          fullWidth
          size="small"
          value={safeTokens.typography.fontFamily}
          onChange={(e) =>
            patchToken(
              "typography.fontFamily",
              e.target.value
            )
          }
        >
          {fontOptions.map((font) => (
            <MenuItem
              key={font}
              value={font}
              style={{
                fontFamily: font
              }}
            >
              {font
                .split(",")[0]
                .replace(/'/g, "")}
            </MenuItem>
          ))}
        </TextField>

        <Stack
          direction="row"
          spacing={1}
        >
          <TextField
            label="H1 Size"
            fullWidth
            size="small"
            value={safeTokens.typography.h1}
            onChange={(e) =>
              patchToken(
                "typography.h1",
                e.target.value
              )
            }
          />

          <TextField
            label="Body Size"
            fullWidth
            size="small"
            value={safeTokens.typography.body}
            onChange={(e) =>
              patchToken(
                "typography.body",
                e.target.value
              )
            }
          />
        </Stack>
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Typography
        variant="subtitle2"
        gutterBottom
      >
        Environment
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Background"
          type="color"
          fullWidth
          size="small"
          value={safeTokens.colors.background.default}
          onChange={(e) =>
            patchToken(
              "colors.background.default",
              e.target.value
            )
          }
        />

        <TextField
          label="Surface"
          type="color"
          fullWidth
          size="small"
          value={safeTokens.colors.background.surface}
          onChange={(e) =>
            patchToken(
              "colors.background.surface",
              e.target.value
            )
          }
        />
      </Stack>

      <Button
        fullWidth
        variant="outlined"
        onClick={onApplyThemeToPage}
        disabled={!onApplyThemeToPage}
        sx={{
          mt: 3,
          textTransform: "none",
          fontWeight: 700
        }}
      >
        Apply Theme to Page
      </Button>

      <Button
        fullWidth
        variant="contained"
        onClick={handleSaveTheme}
        disabled={
          !siteId ||
          isThemeSaving
        }
        sx={{
          mt: 1.5,
          textTransform: "none",
          fontWeight: 700
        }}
      >
        {isThemeSaving
          ? "Saving theme..."
          : "Save Theme"}
      </Button>
    </Box>
  );
};
