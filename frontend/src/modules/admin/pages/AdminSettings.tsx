import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  MenuItem,
  Button,
  Divider,
  CircularProgress,
  IconButton,
  InputAdornment,
  Tooltip,
  Stack,
  Alert,
  Snackbar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  LinearProgress,
  alpha,
  useTheme,
} from "@mui/material";

import {
  ContentCopy,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error as ErrorIcon,
  Backup as BackupIcon,
  OpenInNew,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  SmartToy as AIIcon,
  Extension as PluginIcon,
  Speed as SpeedIcon,
  CloudUpload as CloudIcon,
  Api as ApiIcon,
  People as PeopleIcon,
} from "@mui/icons-material";

import { useEffect, useState } from "react";

import {
  type PlatformAiSettings,
  useGetAdminSettingsQuery,
  useGetAdminAiSettingsQuery,
  useUpdateAdminSettingsMutation,
  useUpdateAdminAiSettingsMutation,
  useGenerateAdminApiKeyMutation,
  useTestWebhookMutation,
} from "../../../redux/services/admin.api";

import { apiUrl } from "../../../config/api";

/* =========================================================
   360 DIGITAL GROW - ADMIN SETTINGS
   Simple / Compact Admin UI
   ========================================================= */

const accentColors = {
  emerald: "#00C49A",
  emeraldDark: "#009E7C",
  error: "#F22F22",
};

const getSurfaceColors = (isDark: boolean) =>
  isDark
    ? {
        background: "#0D0D0D",
        card: "#202020",
        cardHeader: "#242424",
        border: "rgba(255,255,255,0.08)",
        text: "#FFFFFF",
        textSecondary: "rgba(255,255,255,0.58)",
        inputBackground: "#181818",
        subtleBackground: "rgba(0,196,154,0.06)",
        white: "#FFFFFF",
        black: "#0D0D0D",
      }
    : {
        background: "#F5F7F8",
        card: "#FFFFFF",
        cardHeader: "#F8FAFA",
        border: "rgba(13,13,13,0.10)",
        text: "#18211F",
        textSecondary: "rgba(24,33,31,0.62)",
        inputBackground: "#FFFFFF",
        subtleBackground: "rgba(0,160,125,0.06)",
        white: "#18211F",
        black: "#F5F7F8",
      };

/* =========================================================
   DEFAULT SETTINGS
   ========================================================= */

const defaultSettings = {
  platformName: "360 Digital Grow",
  publicRegistration: true,
  autoApproveUsers: true,
  defaultRole: "VIEWER",
  maxSitesPerUser: 5,
  maintenanceMode: false,
  aiEnabled: true,
  aiProvider: "claude",

  seoPlugin: true,
  mediaPlugin: true,
  versionPlugin: true,
  notificationPlugin: true,
  figmaPlugin: true,

  allowGoogleLogin: true,
  allowEmailLogin: true,
  forceStrongPasswords: true,
  sessionTimeoutHours: 24,

  maxPagesPerSite: 50,
  maxMediaStorageMb: 500,
  maxTeamMembersPerSite: 10,

  apiKeyPreview: "",
  apiKeyGeneratedAt: "",

  webhookUrl: "",

  autoBackup: true,
  backupFrequency: "weekly",
  exportFormat: "json",
};

const defaultAiSettings: PlatformAiSettings = {
  enabled: false,
  provider: "gemini",
  model: "gemini-2.0-flash",
  globalAssistantEnabled: true,
  builderAiEnabled: true,
  updatedBy: null,

  providerStatus: {
    claude: {
      configured: false,
      model: "claude-sonnet-5",
    },
    openai: {
      configured: false,
      model: "gpt-4.1-mini",
    },
    gemini: {
      configured: false,
      model: "gemini-2.0-flash",
    },
  },
};

/* =========================================================
   SECTION CONFIG
   ========================================================= */

const sectionConfig = {
  platform: {
    icon: SettingsIcon,
  },
  users: {
    icon: PeopleIcon,
  },
  plugins: {
    icon: PluginIcon,
  },
  ai: {
    icon: AIIcon,
  },
  security: {
    icon: SecurityIcon,
  },
  limits: {
    icon: SpeedIcon,
  },
  api: {
    icon: ApiIcon,
  },
  backup: {
    icon: CloudIcon,
  },
};

/* =========================================================
   COMMON FIELD STYLE
   ========================================================= */

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5,
    fontSize: "0.75rem",
  },

  "& .MuiInputLabel-root": {
    fontSize: "0.75rem",
  },

  "& .MuiInputBase-input": {
    py: 1,
    fontSize: "0.75rem",
  },

  "& .MuiFormHelperText-root": {
    fontSize: "0.65rem",
    marginLeft: 0,
  },
};

/* =========================================================
   SECTION CARD
   ========================================================= */

interface SectionCardProps {
  icon?: any;
  title: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({
  icon: Icon,
  title,
  children,
}) => {
  const theme = useTheme();
  const ui = getSurfaceColors(theme.palette.mode === "dark");
  const colors = { ...accentColors, ...ui };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: colors.card,
        border: `1px solid ${colors.border}`,
        boxShadow: "none",
      }}
    >
      {/* Section Header */}
      <Box
        sx={{
          px: 2,
          py: 1.15,
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: colors.cardHeader,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        {Icon && (
          <Icon
            sx={{
              fontSize: 16,
              color: colors.emerald,
            }}
          />
        )}

        <Typography
          sx={{
            fontSize: "0.78rem",
            fontWeight: 700,
            color: colors.white,
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* Section Content */}
      <Box
        sx={{
          p: 2,
        }}
      >
        {children}
      </Box>
    </Paper>
  );
};

/* =========================================================
   STATUS CHIP
   ========================================================= */

const StatusChip: React.FC<{
  status: boolean;
  label: string;
 }> = ({ status, label }) => {
  const theme = useTheme();
  const ui = getSurfaceColors(theme.palette.mode === "dark");
  const colors = { ...accentColors, ...ui };

  return (
    <Chip
      label={label}
      size="small"
      icon={
        status ? (
          <CheckCircle sx={{ fontSize: 12 }} />
        ) : (
          <ErrorIcon sx={{ fontSize: 12 }} />
        )
      }
      sx={{
        height: 19,
        fontSize: "0.58rem",
        fontWeight: 600,
        borderRadius: 1,

        bgcolor: status
          ? "rgba(0,196,154,0.14)"
          : "rgba(242,47,34,0.14)",

        color: status ? colors.emerald : colors.error,

        "& .MuiChip-icon": {
          color: status ? colors.emerald : colors.error,
          marginLeft: "4px",
        },

        "& .MuiChip-label": {
          px: 0.8,
        },
      }}
    />
  );
};

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function AdminSettings() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const ui = getSurfaceColors(isDark);
  const colors = { ...accentColors, ...ui };

  /* =======================================================
     API
     ======================================================= */

  const { data, isLoading } = useGetAdminSettingsQuery();

  const {
    data: aiSettingsData,
    isLoading: aiSettingsLoading,
    error: aiSettingsLoadError,
  } = useGetAdminAiSettingsQuery();

  const [updateAdminSettings] =
    useUpdateAdminSettingsMutation();

  const [updateAdminAiSettings] =
    useUpdateAdminAiSettingsMutation();

  const [generateApiKey] =
    useGenerateAdminApiKeyMutation();

  const [testWebhook] =
    useTestWebhookMutation();

  /* =======================================================
     STATE
     ======================================================= */

  const [settings, setSettings] =
    useState(defaultSettings);

  const [aiSettings, setAiSettings] =
    useState(defaultAiSettings);

  const [showApiKey, setShowApiKey] =
    useState(false);

  const [webhookStatus, setWebhookStatus] =
    useState<
      "idle" | "loading" | "success" | "error"
    >("idle");

  const [webhookMessage, setWebhookMessage] =
    useState("");

  const [webhookSnackbar, setWebhookSnackbar] =
    useState(false);

  const [saveLoading, setSaveLoading] =
    useState(false);

  const [aiSaveLoading, setAiSaveLoading] =
    useState(false);

  const [aiMessage, setAiMessage] =
    useState<{
      type: "success" | "error";
      text: string;
    } | null>(null);

  /* =======================================================
     LOAD ADMIN SETTINGS
     ======================================================= */

  useEffect(() => {
    if (data) {
      setSettings({
        ...defaultSettings,
        ...data,
      });
    }
  }, [data]);

  /* =======================================================
     LOAD AI SETTINGS
     ======================================================= */

  useEffect(() => {
    if (aiSettingsData) {
      setAiSettings({
        ...defaultAiSettings,
        ...aiSettingsData,
        providerStatus: {
          ...defaultAiSettings.providerStatus,
          ...aiSettingsData.providerStatus,
        },
      });
    }
  }, [aiSettingsData]);

  /* =======================================================
     UPDATE SETTINGS
     ======================================================= */

  const update = (
    key: string,
    value: any
  ) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateAi = (
    key: keyof PlatformAiSettings,
    value: any
  ) => {
    setAiSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /* =======================================================
     SAVE AI SETTINGS
     ======================================================= */

  const saveAiSettings = async () => {
    setAiSaveLoading(true);
    setAiMessage(null);

    try {
      const saved =
        await updateAdminAiSettings({
          enabled: aiSettings.enabled,
          provider: aiSettings.provider,
          model: aiSettings.model,
          globalAssistantEnabled:
            aiSettings.globalAssistantEnabled,
          builderAiEnabled:
            aiSettings.builderAiEnabled,
        }).unwrap();

      setAiSettings({
        ...defaultAiSettings,
        ...saved,
        providerStatus: {
          ...defaultAiSettings.providerStatus,
          ...saved.providerStatus,
        },
      });

      update(
        "aiEnabled",
        saved.enabled
      );

      update(
        "aiProvider",
        saved.provider
      );

      setAiMessage({
        type: "success",
        text: "AI settings saved successfully.",
      });
    } catch (error: any) {
      setAiMessage({
        type: "error",
        text:
          error?.data?.message ||
          "Failed to save AI settings.",
      });
    } finally {
      setAiSaveLoading(false);
    }
  };

  /* =======================================================
     SAVE ALL SETTINGS
     ======================================================= */

  const save = async () => {
    setSaveLoading(true);

    try {
      const savedAi =
        await updateAdminAiSettings({
          enabled: aiSettings.enabled,
          provider: aiSettings.provider,
          model: aiSettings.model,
          globalAssistantEnabled:
            aiSettings.globalAssistantEnabled,
          builderAiEnabled:
            aiSettings.builderAiEnabled,
        }).unwrap();

      await updateAdminSettings({
        ...settings,
        aiEnabled: savedAi.enabled,
        aiProvider: savedAi.provider,
      }).unwrap();

      alert(
        "Admin settings saved successfully!"
      );
    } catch (error) {
      console.error(error);
      alert("Failed to save settings");
    } finally {
      setSaveLoading(false);
    }
  };

  /* =======================================================
     SAVE WEBHOOK
     ======================================================= */

  const saveWebhook = async () => {
    try {
      await updateAdminSettings({
        ...settings,
        webhookUrl: settings.webhookUrl,
      }).unwrap();

      alert(
        "✅ Webhook URL saved successfully!"
      );
    } catch {
      alert(
        "❌ Failed to save webhook URL"
      );
    }
  };

  /* =======================================================
     TEST WEBHOOK
     ======================================================= */

  const handleTestWebhook = async () => {
    if (!settings.webhookUrl) {
      setWebhookStatus("error");

      setWebhookMessage(
        "Please enter a webhook URL first"
      );

      setWebhookSnackbar(true);

      return;
    }

    setWebhookStatus("loading");

    try {
      const result =
        await testWebhook({
          webhookUrl: settings.webhookUrl,
        }).unwrap();

      setWebhookStatus("success");

      setWebhookMessage(
        result.message ||
          "Webhook connected successfully!"
      );

      setWebhookSnackbar(true);
    } catch (error: any) {
      setWebhookStatus("error");

      setWebhookMessage(
        error?.data?.message ||
          "Webhook test failed"
      );

      setWebhookSnackbar(true);
    }
  };

  /* =======================================================
     GENERATE API KEY
     ======================================================= */

  const handleGenerateApiKey = async () => {
    try {
      const result =
        await generateApiKey().unwrap();

      setSettings((prev: any) => ({
        ...prev,
        apiKeyPreview: result.apiKey,
        apiKeyGeneratedAt:
          result.apiKeyGeneratedAt,
      }));

      setShowApiKey(true);

      alert(
        "🔑 API Key generated successfully!"
      );
    } catch {
      alert(
        "❌ Failed to generate API key"
      );
    }
  };

  /* =======================================================
     COPY API KEY
     ======================================================= */

  const handleCopyApiKey = () => {
    if (settings.apiKeyPreview) {
      navigator.clipboard.writeText(
        settings.apiKeyPreview
      );

      alert(
        "📋 API Key copied to clipboard!"
      );
    }
  };

  /* =======================================================
     EXPORT DATA
     ======================================================= */

  const handleExportData = async () => {
    try {
      const token =
        localStorage.getItem(
          "accessToken"
        ) ||
        JSON.parse(
          localStorage.getItem(
            "auth"
          ) || "{}"
        )?.accessToken;

      if (!token) {
        alert(
          "❌ No access token found"
        );
        return;
      }

      const response = await fetch(
        apiUrl("/export/all"),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Export failed"
        );
      }

      const data =
        await response.json();

      const blob = new Blob(
        [
          JSON.stringify(
            data,
            null,
            2
          ),
        ],
        {
          type: "application/json",
        }
      );

      const url =
        window.URL.createObjectURL(
          blob
        );

      const a =
        document.createElement(
          "a"
        );

      a.href = url;

      a.download =
        `reactbuilder-backup-${Date.now()}.json`;

      a.click();

      window.URL.revokeObjectURL(
        url
      );

      alert(
        "✅ Backup exported successfully"
      );
    } catch (error) {
      console.error(error);

      alert(
        "❌ Export failed"
      );
    }
  };

  /* =======================================================
     MASK API KEY
     ======================================================= */

  const maskApiKey = (
    key: string
  ) => {
    if (!key) return "";

    if (key.length <= 8) {
      return "••••••••";
    }

    const firstFour =
      key.slice(0, 4);

    const lastFour =
      key.slice(-4);

    return `${firstFour}••••••••••••••••${lastFour}`;
  };

  /* =======================================================
     LOADING
     ======================================================= */

  if (isLoading) {
    return (
      <Box
        sx={{
          bgcolor: colors.black,
          minHeight: "100vh",
          p: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
        }}
      >
        <CircularProgress
          size={36}
          sx={{
            color: colors.emerald,
          }}
        />

        <Typography
          sx={{
            color: colors.textSecondary,
            fontSize: "0.8rem",
          }}
        >
          Loading admin settings...
        </Typography>

        <LinearProgress
          sx={{
            width: 180,
            height: 3,
            borderRadius: 2,
            bgcolor:
              "rgba(255,255,255,0.08)",

            "& .MuiLinearProgress-bar": {
              bgcolor: colors.emerald,
            },
          }}
        />
      </Box>
    );
  }

  /* =======================================================
     MAIN UI
     ======================================================= */

  return (
    <Box
      sx={{
        bgcolor: isDark
          ? colors.black
          : "#F5F5F5",

        minHeight: "100vh",

        p: {
          xs: 2,
          md: 3,
        },

        color: colors.white,
      }}
    >
      {/* ===================================================
          WEBHOOK SNACKBAR
          =================================================== */}

      <Snackbar
        open={webhookSnackbar}
        autoHideDuration={6000}
        onClose={() =>
          setWebhookSnackbar(false)
        }
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Alert
          onClose={() =>
            setWebhookSnackbar(false)
          }
          severity={
            webhookStatus === "success"
              ? "success"
              : "error"
          }
          sx={{
            width: "100%",
            borderRadius: 2,
            fontSize: "0.75rem",
          }}
          icon={
            webhookStatus === "success" ? (
              <CheckCircle />
            ) : (
              <ErrorIcon />
            )
          }
        >
          {webhookMessage}
        </Alert>
      </Snackbar>

      {/* ===================================================
          HEADER
          =================================================== */}

      <Box
        sx={{
          mb: 2.5,

          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",

          gap: 2,

          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: {
                xs: "1.1rem",
                md: "1.3rem",
              },

              fontWeight: 700,

              color: isDark
                ? colors.white
                : colors.black,
            }}
          >
            Admin Settings
          </Typography>

          <Typography
            sx={{
              mt: 0.3,
              fontSize: "0.68rem",
              color: isDark
                ? colors.textSecondary
                : "rgba(13,13,13,0.55)",
            }}
          >
            Platform configuration
            and administration
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="small"
          onClick={save}
          disabled={saveLoading}
          startIcon={
            saveLoading ? (
              <CircularProgress
                size={14}
                color="inherit"
              />
            ) : null
          }
          sx={{
            bgcolor:
              colors.emerald,

            color:
              colors.white,

            px: 2,

            py: 0.8,

            borderRadius: 1.5,

            textTransform:
              "none",

            fontSize:
              "0.72rem",

            fontWeight: 700,

            boxShadow:
              "none",

            "&:hover": {
              bgcolor:
                colors.emeraldDark,

              boxShadow:
                "none",
            },
          }}
        >
          {saveLoading
            ? "Saving..."
            : "Save All Settings"}
        </Button>
      </Box>

      {/* ===================================================
          SETTINGS GRID
          =================================================== */}

      <Box
        sx={{
          columnCount: { xs: 1, md: 2 },
          columnGap: { xs: 0, md: 2 },
          "& > .settings-section": {
            breakInside: "avoid",
            WebkitColumnBreakInside: "avoid",
            display: "inline-block",
            width: "100%",
            verticalAlign: "top",
            mb: 2,
          },
        }}
      >
        {/* =================================================
            PLATFORM
            ================================================= */}

        <Box className="settings-section">
          <SectionCard
            icon={
              sectionConfig
                .platform.icon
            }
            title="Platform"
          >
            <TextField
              fullWidth
              label="Platform Name"
              value={
                settings.platformName
              }
              onChange={(e) =>
                update(
                  "platformName",
                  e.target.value
                )
              }
              sx={{
                ...fieldSx,
                mb: 1.5,
              }}
            />

            <Stack
              direction="row"
              spacing={2}
              flexWrap="wrap"
            >
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={
                      settings.maintenanceMode
                    }
                    onChange={(e) =>
                      update(
                        "maintenanceMode",
                        e.target.checked
                      )
                    }
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked":
                        {
                          color:
                            colors.emerald,
                        },

                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          bgcolor:
                            colors.emerald,
                        },
                    }}
                  />
                }
                label="Maintenance Mode"
                sx={{
                  "& .MuiFormControlLabel-label":
                    {
                      fontSize:
                        "0.68rem",
                    },
                }}
              />

              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={
                      settings.publicRegistration
                    }
                    onChange={(e) =>
                      update(
                        "publicRegistration",
                        e.target.checked
                      )
                    }
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked":
                        {
                          color:
                            colors.emerald,
                        },

                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          bgcolor:
                            colors.emerald,
                        },
                    }}
                  />
                }
                label="Public Registration"
                sx={{
                  "& .MuiFormControlLabel-label":
                    {
                      fontSize:
                        "0.68rem",
                    },
                }}
              />
            </Stack>
          </SectionCard>
        </Box>

        {/* =================================================
            USERS
            ================================================= */}

        <Box className="settings-section">
          <SectionCard
            icon={
              sectionConfig
                .users.icon
            }
            title="Users"
          >
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={
                    settings.autoApproveUsers
                  }
                  onChange={(e) =>
                    update(
                      "autoApproveUsers",
                      e.target.checked
                    )
                  }
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked":
                      {
                        color:
                          colors.emerald,
                      },

                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                      {
                        bgcolor:
                          colors.emerald,
                      },
                  }}
                />
              }
              label="Auto Approve New Users"
              sx={{
                mb: 1.5,

                "& .MuiFormControlLabel-label":
                  {
                    fontSize:
                      "0.68rem",
                  },
              }}
            />

            <TextField
              fullWidth
              select
              label="Default User Role"
              value={
                settings.defaultRole
              }
              onChange={(e) =>
                update(
                  "defaultRole",
                  e.target.value
                )
              }
              sx={{
                ...fieldSx,
                mb: 1.5,
              }}
            >
              <MenuItem value="VIEWER">
                Viewer
              </MenuItem>

              <MenuItem value="EDITOR">
                Editor
              </MenuItem>
            </TextField>

            <TextField
              fullWidth
              type="number"
              label="Max Sites Per User"
              value={
                settings.maxSitesPerUser
              }
              onChange={(e) =>
                update(
                  "maxSitesPerUser",
                  Number(
                    e.target.value
                  )
                )
              }
              sx={fieldSx}
            />
          </SectionCard>
        </Box>

        {/* =================================================
            PLUGINS
            ================================================= */}

        <Box className="settings-section">
          <SectionCard
            icon={
              sectionConfig
                .plugins.icon
            }
            title="Plugins"
          >
            <Grid
              container
              spacing={0.5}
            >
              {[
                {
                  key: "seoPlugin",
                  label: "SEO",
                },
                {
                  key: "mediaPlugin",
                  label: "Media",
                },
                {
                  key: "versionPlugin",
                  label: "Version",
                },
                {
                  key: "notificationPlugin",
                  label: "Notification",
                },
                {
                  key: "figmaPlugin",
                  label: "Figma",
                },
              ].map(
                (plugin) => {
                  const enabled =
                    settings[
                      plugin.key as keyof typeof settings
                    ] as boolean;

                  return (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      key={
                        plugin.key
                      }
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={
                              enabled
                            }
                            onChange={(
                              e
                            ) =>
                              update(
                                plugin.key,
                                e.target
                                  .checked
                              )
                            }
                            sx={{
                              "& .MuiSwitch-switchBase.Mui-checked":
                                {
                                  color:
                                    colors.emerald,
                                },

                              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                {
                                  bgcolor:
                                    colors.emerald,
                                },
                            }}
                          />
                        }
                        label={
                          <Box
                            sx={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 0.7,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize:
                                  "0.68rem",
                              }}
                            >
                              {
                                plugin.label
                              }
                            </Typography>

                            <StatusChip
                              status={
                                enabled
                              }
                              label={
                                enabled
                                  ? "Active"
                                  : "Inactive"
                              }
                            />
                          </Box>
                        }
                        sx={{
                          m: 0,
                        }}
                      />
                    </Grid>
                  );
                }
              )}
            </Grid>
          </SectionCard>
        </Box>

        {/* =================================================
            AI
            ================================================= */}

        <Box className="settings-section">
          <SectionCard
            icon={
              sectionConfig.ai.icon
            }
            title="AI"
          >
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={
                    aiSettings.enabled
                  }
                  onChange={(e) =>
                    updateAi(
                      "enabled",
                      e.target.checked
                    )
                  }
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked":
                      {
                        color:
                          colors.emerald,
                      },

                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                      {
                        bgcolor:
                          colors.emerald,
                      },
                  }}
                />
              }
              label="Enable AI Features"
              sx={{
                mb: 1.5,

                "& .MuiFormControlLabel-label":
                  {
                    fontSize:
                      "0.68rem",
                  },
              }}
            />

            <TextField
              fullWidth
              select
              label="AI Provider"
              value={
                aiSettings.provider
              }
              onChange={(e) => {
                const provider =
                  e.target.value as PlatformAiSettings["provider"];

                updateAi(
                  "provider",
                  provider
                );

                updateAi(
                  "model",
                  aiSettings
                    .providerStatus[
                    provider
                  ]?.model || ""
                );
              }}
              sx={{
                ...fieldSx,
                mb: 1.5,
              }}
            >
              <MenuItem value="claude">
                Claude —{" "}
                {aiSettings
                  .providerStatus
                  .claude
                  .configured
                  ? "configured"
                  : "not configured"}
              </MenuItem>

              <MenuItem value="openai">
                OpenAI —{" "}
                {aiSettings
                  .providerStatus
                  .openai
                  .configured
                  ? "configured"
                  : "not configured"}
              </MenuItem>

              <MenuItem value="gemini">
                Gemini —{" "}
                {aiSettings
                  .providerStatus
                  .gemini
                  .configured
                  ? "configured"
                  : "not configured"}
              </MenuItem>
            </TextField>

            <Stack spacing={1.5}>
              <TextField
                fullWidth
                label="Model"
                value={
                  aiSettings.model
                }
                onChange={(e) =>
                  updateAi(
                    "model",
                    e.target.value
                  )
                }
                helperText="API keys stay in server environment variables."
                sx={fieldSx}
              />

              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={
                      aiSettings.globalAssistantEnabled
                    }
                    onChange={(e) =>
                      updateAi(
                        "globalAssistantEnabled",
                        e.target
                          .checked
                      )
                    }
                    disabled={
                      !aiSettings.enabled
                    }
                  />
                }
                label="Global Assistant enabled"
                sx={{
                  "& .MuiFormControlLabel-label":
                    {
                      fontSize:
                        "0.68rem",
                    },
                }}
              />

              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={
                      aiSettings.builderAiEnabled
                    }
                    onChange={(e) =>
                      updateAi(
                        "builderAiEnabled",
                        e.target
                          .checked
                      )
                    }
                    disabled={
                      !aiSettings.enabled
                    }
                  />
                }
                label="Page Builder AI enabled"
                sx={{
                  "& .MuiFormControlLabel-label":
                    {
                      fontSize:
                        "0.68rem",
                    },
                }}
              />

              <Stack
                direction="row"
                spacing={0.7}
                flexWrap="wrap"
                useFlexGap
              >
                {(
                  [
                    "claude",
                    "openai",
                    "gemini",
                  ] as const
                ).map(
                  (provider) => (
                    <StatusChip
                      key={
                        provider
                      }
                      status={
                        !!aiSettings
                          .providerStatus[
                          provider
                        ]?.configured
                      }
                      label={`${
                        provider ===
                        "openai"
                          ? "OpenAI"
                          : provider
                              .charAt(
                                0
                              )
                              .toUpperCase() +
                            provider.slice(
                              1
                            )
                      }: ${
                        aiSettings
                          .providerStatus[
                          provider
                        ]?.configured
                          ? "configured"
                          : "not configured"
                      }`}
                    />
                  )
                )}
              </Stack>

              {aiSettingsLoadError && (
                <Alert
                  severity="error"
                  sx={{
                    fontSize:
                      "0.7rem",
                  }}
                >
                  Failed to load AI
                  settings.
                </Alert>
              )}

              {aiMessage && (
                <Alert
                  severity={
                    aiMessage.type
                  }
                  sx={{
                    fontSize:
                      "0.7rem",
                  }}
                >
                  {aiMessage.text}
                </Alert>
              )}

              <Button
                variant="contained"
                onClick={
                  saveAiSettings
                }
                disabled={
                  aiSaveLoading ||
                  aiSettingsLoading
                }
                startIcon={
                  aiSaveLoading ? (
                    <CircularProgress
                      size={15}
                      color="inherit"
                    />
                  ) : null
                }
                sx={{
                  alignSelf:
                    "flex-start",

                  bgcolor:
                    colors.emerald,

                  textTransform:
                    "none",

                  fontSize:
                    "0.7rem",

                  fontWeight: 700,

                  borderRadius:
                    1.5,

                  px: 1.8,

                  py: 0.7,

                  boxShadow:
                    "none",

                  "&:hover": {
                    bgcolor:
                      colors.emeraldDark,

                    boxShadow:
                      "none",
                  },
                }}
              >
                {aiSaveLoading
                  ? "Saving..."
                  : "Save AI Settings"}
              </Button>
            </Stack>
          </SectionCard>
        </Box>

        {/* =================================================
            SECURITY
            ================================================= */}

        <Box className="settings-section">
          <SectionCard
            icon={
              sectionConfig
                .security.icon
            }
            title="Security"
          >
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={
                      settings.allowGoogleLogin
                    }
                    onChange={(e) =>
                      update(
                        "allowGoogleLogin",
                        e.target
                          .checked
                      )
                    }
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked":
                        {
                          color:
                            colors.emerald,
                        },

                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          bgcolor:
                            colors.emerald,
                        },
                    }}
                  />
                }
                label="Google Login"
                sx={{
                  "& .MuiFormControlLabel-label":
                    {
                      fontSize:
                        "0.68rem",
                    },
                }}
              />

              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={
                      settings.allowEmailLogin
                    }
                    onChange={(e) =>
                      update(
                        "allowEmailLogin",
                        e.target
                          .checked
                      )
                    }
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked":
                        {
                          color:
                            colors.emerald,
                        },

                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          bgcolor:
                            colors.emerald,
                        },
                    }}
                  />
                }
                label="Email Login"
                sx={{
                  "& .MuiFormControlLabel-label":
                    {
                      fontSize:
                        "0.68rem",
                    },
                }}
              />

              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={
                      settings.forceStrongPasswords
                    }
                    onChange={(e) =>
                      update(
                        "forceStrongPasswords",
                        e.target
                          .checked
                      )
                    }
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked":
                        {
                          color:
                            colors.emerald,
                        },

                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          bgcolor:
                            colors.emerald,
                        },
                    }}
                  />
                }
                label="Force Strong Passwords"
                sx={{
                  "& .MuiFormControlLabel-label":
                    {
                      fontSize:
                        "0.68rem",
                    },
                }}
              />

              <TextField
                fullWidth
                type="number"
                label="Session Timeout (Hours)"
                value={
                  settings.sessionTimeoutHours
                }
                onChange={(e) =>
                  update(
                    "sessionTimeoutHours",
                    Number(
                      e.target.value
                    )
                  )
                }
                sx={{
                  ...fieldSx,
                  mt: 0.5,
                }}
              />
            </Stack>
          </SectionCard>
        </Box>

        {/* =================================================
            LIMITS
            ================================================= */}

        <Box className="settings-section">
          <SectionCard
            icon={
              sectionConfig
                .limits.icon
            }
            title="Limits"
          >
            <Stack spacing={1.5}>
              <TextField
                fullWidth
                type="number"
                label="Max Pages Per Site"
                value={
                  settings.maxPagesPerSite
                }
                onChange={(e) =>
                  update(
                    "maxPagesPerSite",
                    Number(
                      e.target.value
                    )
                  )
                }
                sx={fieldSx}
              />

              <TextField
                fullWidth
                type="number"
                label="Max Media Storage (MB)"
                value={
                  settings.maxMediaStorageMb
                }
                onChange={(e) =>
                  update(
                    "maxMediaStorageMb",
                    Number(
                      e.target.value
                    )
                  )
                }
                sx={fieldSx}
              />

              <TextField
                fullWidth
                type="number"
                label="Max Team Members Per Site"
                value={
                  settings.maxTeamMembersPerSite
                }
                onChange={(e) =>
                  update(
                    "maxTeamMembersPerSite",
                    Number(
                      e.target.value
                    )
                  )
                }
                sx={fieldSx}
              />
            </Stack>
          </SectionCard>
        </Box>

        {/* =================================================
            API ACCESS
            ================================================= */}

        <Box className="settings-section">
          <SectionCard
            icon={
              sectionConfig.api.icon
            }
            title="API Access"
          >
            <Stack spacing={1.5}>
              {/* API KEY */}

              <Box>
                <Typography
                  sx={{
                    mb: 0.7,
                    fontSize:
                      "0.65rem",
                    fontWeight: 600,
                    color:
                      colors.textSecondary,
                  }}
                >
                  API Key
                </Typography>

                <TextField
                  fullWidth
                  value={
                    !settings.apiKeyPreview
                      ? ""
                      : showApiKey
                      ? settings.apiKeyPreview
                      : maskApiKey(
                          settings.apiKeyPreview
                        )
                  }
                  InputProps={{
                    readOnly: true,

                    sx: {
                      borderRadius:
                        1.5,

                      fontSize:
                        "0.7rem",
                    },

                    endAdornment:
                      settings.apiKeyPreview && (
                        <InputAdornment position="end">
                          <Tooltip
                            title={
                              showApiKey
                                ? "Hide API Key"
                                : "Show API Key"
                            }
                          >
                            <IconButton
                              onClick={() =>
                                setShowApiKey(
                                  !showApiKey
                                )
                              }
                              edge="end"
                              size="small"
                            >
                              {showApiKey ? (
                                <VisibilityOff fontSize="small" />
                              ) : (
                                <Visibility fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Copy to clipboard">
                            <IconButton
                              onClick={
                                handleCopyApiKey
                              }
                              edge="end"
                              size="small"
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                  }}
                />
              </Box>

              {/* API KEY BUTTONS */}

              <Stack
                direction="row"
                spacing={1}
              >
                <Button
                  variant="contained"
                  onClick={
                    handleGenerateApiKey
                  }
                  startIcon={
                    <ApiIcon />
                  }
                  sx={{
                    bgcolor:
                      colors.emerald,

                    borderRadius:
                      1.5,

                    textTransform:
                      "none",

                    fontSize:
                      "0.68rem",

                    fontWeight: 600,

                    px: 1.5,

                    py: 0.7,

                    boxShadow:
                      "none",

                    "&:hover": {
                      bgcolor:
                        colors.emeraldDark,

                      boxShadow:
                        "none",
                    },
                  }}
                >
                  Generate New Key
                </Button>

                {settings.apiKeyPreview && (
                  <Button
                    variant="outlined"
                    onClick={
                      handleCopyApiKey
                    }
                    startIcon={
                      <ContentCopy />
                    }
                    sx={{
                      borderRadius:
                        1.5,

                      textTransform:
                        "none",

                      fontSize:
                        "0.68rem",

                      fontWeight: 600,

                      borderColor:
                        colors.emerald,

                      color:
                        colors.emerald,

                      px: 1.5,

                      py: 0.7,

                      "&:hover": {
                        borderColor:
                          colors.emerald,

                        bgcolor:
                          "rgba(0,196,154,0.06)",
                      },
                    }}
                  >
                    Copy
                  </Button>
                )}
              </Stack>

              {settings.apiKeyGeneratedAt && (
                <Chip
                  label={`Generated: ${new Date(
                    settings.apiKeyGeneratedAt
                  ).toLocaleString()}`}
                  size="small"
                  sx={{
                    alignSelf:
                      "flex-start",

                    height: 20,

                    fontSize:
                      "0.58rem",

                    bgcolor:
                      "rgba(0,196,154,0.14)",

                    color:
                      colors.emerald,
                  }}
                />
              )}

              <Divider
                sx={{
                  borderColor:
                    colors.border,
                }}
              />

              {/* WEBHOOK */}

              <Box>
                <Typography
                  sx={{
                    mb: 0.7,
                    fontSize:
                      "0.65rem",
                    fontWeight: 600,
                    color:
                      colors.textSecondary,
                  }}
                >
                  Webhook Configuration
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  label="Webhook URL"
                  value={
                    settings.webhookUrl ||
                    ""
                  }
                  onChange={(e) =>
                    update(
                      "webhookUrl",
                      e.target.value
                    )
                  }
                  placeholder="https://your-webhook.com/endpoint"
                  helperText="Receive API events via webhook"
                  sx={fieldSx}
                />
              </Box>

              <Stack
                direction="row"
                spacing={1}
              >
                <Button
                  variant="outlined"
                  size="small"
                  onClick={
                    saveWebhook
                  }
                  sx={{
                    borderRadius:
                      1.5,

                    textTransform:
                      "none",

                    fontSize:
                      "0.65rem",

                    fontWeight: 600,

                    borderColor:
                      colors.emerald,

                    color:
                      colors.emerald,

                    "&:hover": {
                      borderColor:
                        colors.emerald,

                      bgcolor:
                        "rgba(0,196,154,0.06)",
                    },
                  }}
                >
                  Save Webhook
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  onClick={
                    handleTestWebhook
                  }
                  disabled={
                    webhookStatus ===
                      "loading" ||
                    !settings.webhookUrl
                  }
                  sx={{
                    borderRadius:
                      1.5,

                    textTransform:
                      "none",

                    fontSize:
                      "0.65rem",

                    fontWeight: 600,

                    bgcolor:
                      webhookStatus ===
                      "success"
                        ? colors.emerald
                        : ui.cardHeader,

                    boxShadow:
                      "none",

                    "&:hover": {
                      bgcolor:
                        webhookStatus ===
                        "success"
                          ? colors.emeraldDark
                          : ui.card,

                      boxShadow:
                        "none",
                    },
                  }}
                >
                  {webhookStatus ===
                  "loading" ? (
                    <CircularProgress
                      size={15}
                      color="inherit"
                    />
                  ) : webhookStatus ===
                    "success" ? (
                    <>
                      <CheckCircle
                        sx={{
                          mr: 0.5,
                          fontSize: 15,
                        }}
                      />
                      Connected
                    </>
                  ) : webhookStatus ===
                    "error" ? (
                    <>
                      <ErrorIcon
                        sx={{
                          mr: 0.5,
                          fontSize: 15,
                        }}
                      />
                      Failed
                    </>
                  ) : (
                    "Test Webhook"
                  )}
                </Button>
              </Stack>

              <Divider
                sx={{
                  borderColor:
                    colors.border,
                }}
              />

              {/* API DOCUMENTATION */}

              <Box
                sx={{
                  bgcolor:
                    "rgba(0,196,154,0.06)",

                  p: 1.5,

                  borderRadius:
                    1.5,

                  border:
                    "1px solid rgba(0,196,154,0.08)",
                }}
              >
                <Typography
                  sx={{
                    fontSize:
                      "0.7rem",

                    fontWeight: 700,

                    color:
                      colors.white,

                    mb: 1,
                  }}
                >
                  API Documentation
                </Typography>

                <Stack spacing={0.7}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    gap={2}
                  >
                    <Typography
                      sx={{
                        fontSize:
                          "0.6rem",
                        color:
                          colors.textSecondary,
                      }}
                    >
                      Base URL:
                    </Typography>

                    <Typography
                      sx={{
                        fontSize:
                          "0.6rem",
                        fontWeight: 600,
                        color:
                          colors.white,
                      }}
                    >
                      api.reactbuilder.com/v1
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    gap={2}
                  >
                    <Typography
                      sx={{
                        fontSize:
                          "0.6rem",
                        color:
                          colors.textSecondary,
                      }}
                    >
                      Authorization:
                    </Typography>

                    <Typography
                      sx={{
                        fontSize:
                          "0.6rem",
                        fontWeight: 600,
                        color:
                          colors.white,
                      }}
                    >
                      Bearer{" "}
                      {settings.apiKeyPreview
                        ? "rb****"
                        : "Not generated"}
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      sx={{
                        fontSize:
                          "0.6rem",
                        color:
                          colors.textSecondary,
                      }}
                    >
                      Status:
                    </Typography>

                    <StatusChip
                      status={
                        !!settings.apiKeyPreview
                      }
                      label={
                        settings.apiKeyPreview
                          ? "Active"
                          : "Inactive"
                      }
                    />
                  </Stack>
                </Stack>

                <Button
                  variant="text"
                  size="small"
                  endIcon={
                    <OpenInNew
                      sx={{
                        fontSize: 13,
                      }}
                    />
                  }
                  href="/api/docs"
                  target="_blank"
                  sx={{
                    mt: 0.5,

                    px: 0,

                    color:
                      colors.emerald,

                    fontSize:
                      "0.62rem",

                    fontWeight: 600,

                    textTransform:
                      "none",

                    "&:hover": {
                      bgcolor:
                        "transparent",
                    },
                  }}
                >
                  View API Documentation
                </Button>
              </Box>
            </Stack>
          </SectionCard>
        </Box>

        {/* =================================================
            BACKUP & EXPORT
            ================================================= */}

        <Box className="settings-section">
          <SectionCard
            icon={
              sectionConfig
                .backup.icon
            }
            title="Backup & Export"
          >
            <Stack spacing={1.5}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={
                      settings.autoBackup
                    }
                    onChange={(e) =>
                      update(
                        "autoBackup",
                        e.target
                          .checked
                      )
                    }
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked":
                        {
                          color:
                            colors.emerald,
                        },

                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          bgcolor:
                            colors.emerald,
                        },
                    }}
                  />
                }
                label="Auto Backup"
                sx={{
                  "& .MuiFormControlLabel-label":
                    {
                      fontSize:
                        "0.68rem",
                    },
                }}
              />

              {settings.autoBackup && (
                <FormControl
                  fullWidth
                  size="small"
                >
                  <InputLabel
                    sx={{
                      fontSize:
                        "0.75rem",
                    }}
                  >
                    Frequency
                  </InputLabel>

                  <Select
                    value={
                      settings.backupFrequency
                    }
                    onChange={(e) =>
                      update(
                        "backupFrequency",
                        e.target.value
                      )
                    }
                    label="Frequency"
                    sx={{
                      borderRadius:
                        1.5,

                      fontSize:
                        "0.72rem",
                    }}
                  >
                    <MenuItem value="daily">
                      Daily
                    </MenuItem>

                    <MenuItem value="weekly">
                      Weekly
                    </MenuItem>

                    <MenuItem value="monthly">
                      Monthly
                    </MenuItem>
                  </Select>
                </FormControl>
              )}

              <FormControl
                fullWidth
                size="small"
              >
                <InputLabel
                  sx={{
                    fontSize:
                      "0.75rem",
                  }}
                >
                  Export Format
                </InputLabel>

                <Select
                  value={
                    settings.exportFormat
                  }
                  onChange={(e) =>
                    update(
                      "exportFormat",
                      e.target.value
                    )
                  }
                  label="Export Format"
                  sx={{
                    borderRadius:
                      1.5,

                    fontSize:
                      "0.72rem",
                  }}
                >
                  <MenuItem value="json">
                    JSON
                  </MenuItem>

                  <MenuItem value="csv">
                    CSV
                  </MenuItem>

                  <MenuItem value="xml">
                    XML
                  </MenuItem>
                </Select>
              </FormControl>

              <Button
                fullWidth
                variant="contained"
                onClick={
                  handleExportData
                }
                startIcon={
                  <BackupIcon
                    sx={{
                      fontSize: 16,
                    }}
                  />
                }
                sx={{
                  bgcolor:
                    colors.emerald,

                  borderRadius:
                    1.5,

                  textTransform:
                    "none",

                  fontSize:
                    "0.68rem",

                  fontWeight: 700,

                  py: 1,

                  boxShadow:
                    "none",

                  "&:hover": {
                    bgcolor:
                      colors.emeraldDark,

                    boxShadow:
                      "none",
                  },
                }}
              >
                Export Data
              </Button>
            </Stack>
          </SectionCard>
        </Box>
      </Box>
    </Box>
  );
}