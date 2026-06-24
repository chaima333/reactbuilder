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
  Card,
  CardContent,
  Avatar,
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
import { motion } from "framer-motion";

import {
  useGetAdminSettingsQuery,
  useUpdateAdminSettingsMutation,
  useGenerateAdminApiKeyMutation,
  useTestWebhookMutation,
} from "../../../redux/services/admin.api";

// 360 Brand Colors
const colors = {
  emerald: "#00C49A",
  emeraldDark: "#009E7C",
  emeraldLight: "rgba(0, 196, 154, 0.12)",
  emeraldGradient: "linear-gradient(135deg, #00C49A 0%, #00A37A 100%)",
  black: "#0D0D0D",
  blackLight: "rgba(13, 13, 13, 0.08)",
  grayLight: "#F2F2F2",
  grayMedium: "#E0E0E0",
  textPrimary: "#0D0D0D",
  textSecondary: "rgba(13, 13, 13, 0.6)",
  white: "#FFFFFF",
  error: "#F22F22",
};

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

const defaultSettings = {
  platformName: "360 Digital Grow",
  publicRegistration: true,
  autoApproveUsers: true,
  defaultRole: "VIEWER",
  maxSitesPerUser: 5,
  maintenanceMode: false,
  aiEnabled: true,
  aiProvider: "Claude",
  seoPlugin: true,
  mediaPlugin: true,
  versionPlugin: true,
  allowGoogleLogin: true,
  allowEmailLogin: true,
  forceStrongPasswords: true,
  sessionTimeoutHours: 24,
  maxPagesPerSite: 50,
  maxMediaStorageMb: 500,
  maxTeamMembersPerSite: 10,
  notificationPlugin: true,
  figmaPlugin: true,
  apiKeyPreview: "",
  apiKeyGeneratedAt: "",
  webhookUrl: "",
  autoBackup: true,
  backupFrequency: "weekly",
  exportFormat: "json",
};

// Section configuration with 360 brand colors
const sectionConfig = {
  platform: { icon: SettingsIcon, gradient: colors.emeraldGradient },
  users: { icon: PeopleIcon, gradient: "linear-gradient(135deg, #00C49A 0%, #0D0D0D 100%)" },
  plugins: { icon: PluginIcon, gradient: "linear-gradient(135deg, #0D0D0D 0%, #00C49A 100%)" },
  ai: { icon: AIIcon, gradient: colors.emeraldGradient },
  security: { icon: SecurityIcon, gradient: "linear-gradient(135deg, #0D0D0D 0%, #F22F22 100%)" },
  limits: { icon: SpeedIcon, gradient: colors.emeraldGradient },
  api: { icon: ApiIcon, gradient: "linear-gradient(135deg, #00C49A 0%, #0D0D0D 100%)" },
  backup: { icon: CloudIcon, gradient: "linear-gradient(135deg, #0D0D0D 0%, #00C49A 100%)" },
};

interface SectionCardProps {
  icon: any;
  title: string;
  gradient: string;
  children: React.ReactNode;
  delay?: number;
}

const SectionCard: React.FC<SectionCardProps> = ({ 
  icon: Icon, 
  title, 
  gradient, 
  children, 
  delay = 0 
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <MotionPaper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      sx={{
        p: 0,
        borderRadius: 4,
        overflow: "hidden",
        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : colors.white,
        border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        boxShadow: isDark 
          ? '0 4px 20px rgba(0,0,0,0.3)'
          : '0 4px 20px rgba(0,0,0,0.06)',
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: isDark
            ? '0 8px 40px rgba(0,0,0,0.4)'
            : '0 8px 40px rgba(0,196,154,0.12)',
          transform: "translateY(-4px)",
        },
      }}
    >
      <Box
        sx={{
          background: gradient,
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Icon sx={{ fontSize: 20, color: "white" }} />
        </Avatar>
        <Typography
          variant="h6"
          sx={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            color: "white",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 20,
            bgcolor: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              color: "rgba(255,255,255,0.9)",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
            }}
          >
            Settings
          </Typography>
        </Box>
      </Box>
      <CardContent sx={{ 
        p: 3, 
        bgcolor: isDark ? 'transparent' : colors.white 
      }}>
        {children}
      </CardContent>
    </MotionPaper>
  );
};

const StatusChip: React.FC<{ status: boolean; label: string }> = ({ status, label }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Chip
      label={label}
      size="small"
      icon={status ? <CheckCircle sx={{ fontSize: 14 }} /> : <ErrorIcon sx={{ fontSize: 14 }} />}
      sx={{
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 600,
        bgcolor: status 
          ? (isDark ? 'rgba(0,196,154,0.2)' : colors.emeraldLight)
          : (isDark ? 'rgba(242,47,34,0.2)' : "rgba(242, 47, 34, 0.12)"),
        color: status ? colors.emerald : colors.error,
        "& .MuiChip-icon": {
          color: status ? colors.emerald : colors.error,
        },
      }}
    />
  );
};

export default function AdminSettings() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { data, isLoading } = useGetAdminSettingsQuery();
  const [updateAdminSettings] = useUpdateAdminSettingsMutation();
  const [generateApiKey] = useGenerateAdminApiKeyMutation();
  const [testWebhook] = useTestWebhookMutation();

  const [settings, setSettings] = useState(defaultSettings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [webhookMessage, setWebhookMessage] = useState("");
  const [webhookSnackbar, setWebhookSnackbar] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (data) {
      setSettings({
        ...defaultSettings,
        ...data,
      });
    }
  }, [data]);

  const update = (key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const save = async () => {
    setSaveLoading(true);
    try {
      await updateAdminSettings(settings).unwrap();
      alert("✅ Admin settings saved successfully!");
    } catch (error) {
      alert("❌ Failed to save settings");
    } finally {
      setSaveLoading(false);
    }
  };

  const saveWebhook = async () => {
    try {
      await updateAdminSettings({
        ...settings,
        webhookUrl: settings.webhookUrl,
      }).unwrap();
      alert("✅ Webhook URL saved successfully!");
    } catch {
      alert("❌ Failed to save webhook URL");
    }
  };

  const handleTestWebhook = async () => {
    if (!settings.webhookUrl) {
      setWebhookStatus("error");
      setWebhookMessage("Please enter a webhook URL first");
      setWebhookSnackbar(true);
      return;
    }

    setWebhookStatus("loading");

    try {
      const result = await testWebhook({
        webhookUrl: settings.webhookUrl,
      }).unwrap();

      setWebhookStatus("success");
      setWebhookMessage(result.message || "✅ Webhook connected successfully!");
      setWebhookSnackbar(true);
    } catch (error: any) {
      setWebhookStatus("error");
      setWebhookMessage(error?.data?.message || "❌ Webhook test failed");
      setWebhookSnackbar(true);
    }
  };

  const handleGenerateApiKey = async () => {
    try {
      const result = await generateApiKey().unwrap();

      setSettings((prev: any) => ({
        ...prev,
        apiKeyPreview: result.apiKey,
        apiKeyGeneratedAt: result.apiKeyGeneratedAt,
      }));

      setShowApiKey(true);
      alert("🔑 API Key generated successfully!");
    } catch {
      alert("❌ Failed to generate API key");
    }
  };

  const handleCopyApiKey = () => {
    if (settings.apiKeyPreview) {
      navigator.clipboard.writeText(settings.apiKeyPreview);
      alert("📋 API Key copied to clipboard!");
    }
  };

  const handleExportData = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        JSON.parse(
          localStorage.getItem("auth") || "{}"
        )?.accessToken;

      if (!token) {
        alert("❌ No access token found");
        return;
      }

      const response = await fetch(
        "https://backend-rmfq.onrender.com/api/export/all",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const data = await response.json();

      const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        {
          type: "application/json",
        }
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reactbuilder-backup-${Date.now()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      alert("✅ Backup exported successfully");
    } catch (error) {
      console.error(error);
      alert("❌ Export failed");
    }
  };

  const maskApiKey = (key: string) => {
    if (!key) return "";
    if (key.length <= 8) return "••••••••";
    const firstFour = key.slice(0, 4);
    const lastFour = key.slice(-4);
    return `${firstFour}••••••••••••••••${lastFour}`;
  };

  if (isLoading) {
    return (
      <Box
        p={4}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        gap={3}
        sx={{
          bgcolor: isDark ? '#0D0D0D' : colors.grayLight,
        }}
      >
        <CircularProgress size={48} sx={{ color: colors.emerald }} />
        <Typography 
          variant="body1" 
          sx={{ 
            color: isDark ? 'rgba(255,255,255,0.6)' : colors.textSecondary,
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          Loading admin settings...
        </Typography>
        <LinearProgress 
          sx={{ 
            width: 200, 
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(255,255,255,0.1)' : colors.grayLight,
            "& .MuiLinearProgress-bar": {
              bgcolor: colors.emerald,
            },
          }} 
        />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      bgcolor: isDark ? '#0D0D0D' : colors.grayLight, 
      minHeight: "100vh", 
      p: 4 
    }}>
      <Snackbar
        open={webhookSnackbar}
        autoHideDuration={6000}
        onClose={() => setWebhookSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setWebhookSnackbar(false)}
          severity={webhookStatus === "success" ? "success" : "error"}
          sx={{ 
            width: "100%",
            borderRadius: 3,
            fontFamily: "'Montserrat', sans-serif",
            bgcolor: isDark ? '#1A1A1A' : colors.white,
            color: isDark ? colors.grayLight : colors.black,
            "& .MuiAlert-icon": {
              color: webhookStatus === "success" ? colors.emerald : colors.error,
            },
          }}
          icon={webhookStatus === "success" ? <CheckCircle /> : <ErrorIcon />}
        >
          {webhookMessage}
        </Alert>
      </Snackbar>

      {/* Header - 360 Brand */}
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        sx={{
          mb: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: colors.emerald,
                color: colors.white,
                fontWeight: 700,
                fontSize: 20,
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              360
            </Avatar>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  color: isDark ? colors.grayLight : colors.black,
                  letterSpacing: "-0.02em",
                }}
              >
                Admin Settings
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontFamily: "'Montserrat', sans-serif",
                  color: isDark ? 'rgba(255,255,255,0.6)' : colors.textSecondary,
                }}
              >
                360 Digital Grow — Studio Digital pour votre croissance 360°
              </Typography>
            </Box>
          </Box>
        </Box>
        <Button
          variant="contained"
          size="large"
          onClick={save}
          disabled={saveLoading}
          startIcon={saveLoading ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{
            bgcolor: colors.emerald,
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            px: 4,
            py: 1.5,
            borderRadius: 3,
            textTransform: "none",
            fontSize: "1rem",
            "&:hover": {
              bgcolor: colors.emeraldDark,
              transform: "scale(1.02)",
              boxShadow: `0 8px 32px ${alpha(colors.emerald, 0.4)}`,
            },
            transition: "all 0.2s ease",
          }}
        >
          {saveLoading ? "Saving..." : "💾 Save All Settings"}
        </Button>
      </MotionBox>

      <Grid container spacing={3}>
        {/* Platform */}
        <Grid item xs={12} md={6}>
          <SectionCard
            icon={sectionConfig.platform.icon}
            title="Platform"
            gradient={sectionConfig.platform.gradient}
            delay={0.1}
          >
            <TextField
              fullWidth
              label="Platform Name"
              value={settings.platformName}
              onChange={(e) => update("platformName", e.target.value)}
              sx={{ mb: 2.5 }}
              variant="outlined"
              InputProps={{
                sx: { 
                  borderRadius: 2,
                  fontFamily: "'Montserrat', sans-serif",
                  color: isDark ? colors.grayLight : colors.black,
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: "'Montserrat', sans-serif",
                  color: isDark ? 'rgba(255,255,255,0.6)' : colors.textSecondary,
                },
              }}
            />
            <Stack direction="row" spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.maintenanceMode}
                    onChange={(e) => update("maintenanceMode", e.target.checked)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: colors.error,
                        "&:hover": { bgcolor: alpha(colors.error, 0.08) },
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        bgcolor: colors.error,
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ 
                    fontFamily: "'Montserrat', sans-serif",
                    color: isDark ? colors.grayLight : colors.black,
                  }}>
                    Maintenance Mode
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.publicRegistration}
                    onChange={(e) => update("publicRegistration", e.target.checked)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: colors.emerald,
                        "&:hover": { bgcolor: alpha(colors.emerald, 0.08) },
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        bgcolor: colors.emerald,
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ 
                    fontFamily: "'Montserrat', sans-serif",
                    color: isDark ? colors.grayLight : colors.black,
                  }}>
                    Public Registration
                  </Typography>
                }
              />
            </Stack>
          </SectionCard>
        </Grid>

        {/* Users */}
        <Grid item xs={12} md={6}>
          <SectionCard
            icon={sectionConfig.users.icon}
            title="Users"
            gradient={sectionConfig.users.gradient}
            delay={0.15}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoApproveUsers}
                  onChange={(e) => update("autoApproveUsers", e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: colors.emerald,
                      "&:hover": { bgcolor: alpha(colors.emerald, 0.08) },
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      bgcolor: colors.emerald,
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ 
                  fontFamily: "'Montserrat', sans-serif",
                  color: isDark ? colors.grayLight : colors.black,
                }}>
                  Auto Approve New Users
                </Typography>
              }
              sx={{ mb: 2.5, display: "flex" }}
            />
            <TextField
              fullWidth
              select
              label="Default User Role"
              value={settings.defaultRole}
              onChange={(e) => update("defaultRole", e.target.value)}
              sx={{ mb: 2.5 }}
              variant="outlined"
              InputProps={{
                sx: { 
                  borderRadius: 2,
                  fontFamily: "'Montserrat', sans-serif",
                  color: isDark ? colors.grayLight : colors.black,
                },
              }}
              SelectProps={{
                sx: { 
                  fontFamily: "'Montserrat', sans-serif",
                  color: isDark ? colors.grayLight : colors.black,
                },
              }}
            >
              <MenuItem value="VIEWER" sx={{ fontFamily: "'Montserrat', sans-serif" }}>👁️ Viewer</MenuItem>
              <MenuItem value="EDITOR" sx={{ fontFamily: "'Montserrat', sans-serif" }}>✏️ Editor</MenuItem>
            </TextField>
            <TextField
              fullWidth
              type="number"
              label="Max Sites Per User"
              value={settings.maxSitesPerUser}
              onChange={(e) => update("maxSitesPerUser", Number(e.target.value))}
              variant="outlined"
              InputProps={{
                sx: { 
                  borderRadius: 2,
                  fontFamily: "'Montserrat', sans-serif",
                  color: isDark ? colors.grayLight : colors.black,
                },
              }}
            />
          </SectionCard>
        </Grid>

        {/* Plugins */}
        <Grid item xs={12} md={6}>
          <SectionCard
            icon={sectionConfig.plugins.icon}
            title="Plugins"
            gradient={sectionConfig.plugins.gradient}
            delay={0.2}
          >
            <Grid container spacing={1}>
              {[
                { key: "seoPlugin", label: "SEO" },
                { key: "mediaPlugin", label: "Media" },
                { key: "versionPlugin", label: "Version" },
                { key: "notificationPlugin", label: "Notification" },
                { key: "figmaPlugin", label: "Figma" },
              ].map((plugin) => (
                <Grid item xs={12} sm={6} key={plugin.key}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings[plugin.key as keyof typeof settings] as boolean}
                        onChange={(e) => update(plugin.key, e.target.checked)}
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: colors.emerald,
                            "&:hover": { bgcolor: alpha(colors.emerald, 0.08) },
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                            bgcolor: colors.emerald,
                          },
                        }}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography sx={{ 
                          fontFamily: "'Montserrat', sans-serif",
                          color: isDark ? colors.grayLight : colors.black,
                        }}>
                          {plugin.label}
                        </Typography>
                        <StatusChip 
                          status={settings[plugin.key as keyof typeof settings] as boolean} 
                          label={settings[plugin.key as keyof typeof settings] ? "Active" : "Inactive"} 
                        />
                      </Box>
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        </Grid>

        {/* AI */}
        <Grid item xs={12} md={6}>
          <SectionCard
            icon={sectionConfig.ai.icon}
            title="AI"
            gradient={sectionConfig.ai.gradient}
            delay={0.25}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={settings.aiEnabled}
                  onChange={(e) => update("aiEnabled", e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: colors.emerald,
                      "&:hover": { bgcolor: alpha(colors.emerald, 0.08) },
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      bgcolor: colors.emerald,
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ 
                  fontFamily: "'Montserrat', sans-serif",
                  color: isDark ? colors.grayLight : colors.black,
                }}>
                  Enable AI Features
                </Typography>
              }
              sx={{ mb: 2.5, display: "flex" }}
            />
            <TextField
              fullWidth
              select
              label="AI Provider"
              value={settings.aiProvider}
              onChange={(e) => update("aiProvider", e.target.value)}
              variant="outlined"
              InputProps={{
                sx: { 
                  borderRadius: 2,
                  fontFamily: "'Montserrat', sans-serif",
                  color: isDark ? colors.grayLight : colors.black,
                },
              }}
              SelectProps={{
                sx: { 
                  fontFamily: "'Montserrat', sans-serif",
                  color: isDark ? colors.grayLight : colors.black,
                },
              }}
            >
              <MenuItem value="Claude" sx={{ fontFamily: "'Montserrat', sans-serif" }}>🧠 Claude</MenuItem>
              <MenuItem value="OpenAI" sx={{ fontFamily: "'Montserrat', sans-serif" }}>🤖 OpenAI</MenuItem>
              <MenuItem value="Gemini" sx={{ fontFamily: "'Montserrat', sans-serif" }}>✨ Gemini</MenuItem>
            </TextField>
          </SectionCard>
        </Grid>

        {/* Security */}
        <Grid item xs={12} md={6}>
          <SectionCard
            icon={sectionConfig.security.icon}
            title="Security"
            gradient={sectionConfig.security.gradient}
            delay={0.3}
          >
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.allowGoogleLogin}
                    onChange={(e) => update("allowGoogleLogin", e.target.checked)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: colors.emerald,
                        "&:hover": { bgcolor: alpha(colors.emerald, 0.08) },
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        bgcolor: colors.emerald,
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ 
                    fontFamily: "'Montserrat', sans-serif",
                    color: isDark ? colors.grayLight : colors.black,
                  }}>
                    Google Login
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.allowEmailLogin}
                    onChange={(e) => update("allowEmailLogin", e.target.checked)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: colors.emerald,
                        "&:hover": { bgcolor: alpha(colors.emerald, 0.08) },
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        bgcolor: colors.emerald,
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ 
                    fontFamily: "'Montserrat', sans-serif",
                    color: isDark ? colors.grayLight : colors.black,
                  }}>
                    Email Login
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.forceStrongPasswords}
                    onChange={(e) => update("forceStrongPasswords", e.target.checked)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: colors.emerald,
                        "&:hover": { bgcolor: alpha(colors.emerald, 0.08) },
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        bgcolor: colors.emerald,
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ 
                    fontFamily: "'Montserrat', sans-serif",
                    color: isDark ? colors.grayLight : colors.black,
                  }}>
                    Force Strong Passwords
                  </Typography>
                }
              />
              <TextField
                fullWidth
                type="number"
                label="Session Timeout (Hours)"
                value={settings.sessionTimeoutHours}
                onChange={(e) => update("sessionTimeoutHours", Number(e.target.value))}
                variant="outlined"
                InputProps={{
                  sx: { 
                    borderRadius: 2,
                    fontFamily: "'Montserrat', sans-serif",
                    color: isDark ? colors.grayLight : colors.black,
                  },
                }}
              />
            </Stack>
          </SectionCard>
        </Grid>

        {/* Limits */}
        <Grid item xs={12} md={6}>
          <SectionCard
            icon={sectionConfig.limits.icon}
            title="Limits"
            gradient={sectionConfig.limits.gradient}
            delay={0.35}
          >
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                type="number"
                label="Max Pages Per Site"
                value={settings.maxPagesPerSite}
                onChange={(e) => update("maxPagesPerSite", Number(e.target.value))}
                variant="outlined"
                InputProps={{
                  sx: { 
                    borderRadius: 2,
                    fontFamily: "'Montserrat', sans-serif",
                    color: isDark ? colors.grayLight : colors.black,
                  },
                }}
              />
              <TextField
                fullWidth
                type="number"
                label="Max Media Storage (MB)"
                value={settings.maxMediaStorageMb}
                onChange={(e) => update("maxMediaStorageMb", Number(e.target.value))}
                variant="outlined"
                InputProps={{
                  sx: { 
                    borderRadius: 2,
                    fontFamily: "'Montserrat', sans-serif",
                    color: isDark ? colors.grayLight : colors.black,
                  },
                }}
              />
              <TextField
                fullWidth
                type="number"
                label="Max Team Members Per Site"
                value={settings.maxTeamMembersPerSite}
                onChange={(e) => update("maxTeamMembersPerSite", Number(e.target.value))}
                variant="outlined"
                InputProps={{
                  sx: { 
                    borderRadius: 2,
                    fontFamily: "'Montserrat', sans-serif",
                    color: isDark ? colors.grayLight : colors.black,
                  },
                }}
              />
            </Stack>
          </SectionCard>
        </Grid>

        {/* API Access */}
        <Grid item xs={12} md={6}>
          <SectionCard
            icon={sectionConfig.api.icon}
            title="API Access"
            gradient={sectionConfig.api.gradient}
            delay={0.4}
          >
            <Stack spacing={2}>
              <Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: isDark ? 'rgba(255,255,255,0.6)' : colors.textSecondary,
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 600,
                    mb: 1,
                    display: "block",
                  }}
                >
                  API Key
                </Typography>
                <TextField
                  fullWidth
                  value={!settings.apiKeyPreview ? "" : showApiKey ? settings.apiKeyPreview : maskApiKey(settings.apiKeyPreview)}
                  InputProps={{
                    readOnly: true,
                    sx: { 
                      borderRadius: 2,
                      fontFamily: "'Montserrat', sans-serif",
                      color: isDark ? colors.grayLight : colors.black,
                    },
                    endAdornment: settings.apiKeyPreview && (
                      <InputAdornment position="end">
                        <Tooltip title={showApiKey ? "Hide API Key" : "Show API Key"}>
                          <IconButton onClick={() => setShowApiKey(!showApiKey)} edge="end" size="small">
                            {showApiKey ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Copy to clipboard">
                          <IconButton onClick={handleCopyApiKey} edge="end" size="small">
                            <ContentCopy />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={handleGenerateApiKey}
                  startIcon={<ApiIcon />}
                  sx={{
                    bgcolor: colors.emerald,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    fontFamily: "'Montserrat', sans-serif",
                    "&:hover": { bgcolor: colors.emeraldDark },
                  }}
                >
                  Generate New Key
                </Button>
                {settings.apiKeyPreview && (
                  <Button
                    variant="outlined"
                    onClick={handleCopyApiKey}
                    startIcon={<ContentCopy />}
                    sx={{ 
                      borderRadius: 2, 
                      textTransform: "none", 
                      fontWeight: 600,
                      fontFamily: "'Montserrat', sans-serif",
                      borderColor: colors.emerald,
                      color: colors.emerald,
                      "&:hover": {
                        borderColor: colors.emeraldDark,
                        bgcolor: alpha(colors.emerald, 0.05),
                      },
                    }}
                  >
                    Copy
                  </Button>
                )}
              </Stack>

              {settings.apiKeyGeneratedAt && (
                <Chip
                  label={`Generated: ${new Date(settings.apiKeyGeneratedAt).toLocaleString()}`}
                  size="small"
                  sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    bgcolor: isDark ? 'rgba(0,196,154,0.2)' : colors.emeraldLight,
                    color: colors.emerald,
                    borderRadius: 2,
                  }}
                />
              )}

              <Divider sx={{ 
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.grayLight 
              }} />

              <Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: isDark ? 'rgba(255,255,255,0.6)' : colors.textSecondary,
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 600,
                    mb: 1,
                    display: "block",
                  }}
                >
                  Webhook Configuration
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  label="Webhook URL"
                  value={settings.webhookUrl || ""}
                  onChange={(e) => update("webhookUrl", e.target.value)}
                  placeholder="https://your-webhook.com/endpoint"
                  helperText="Receive API events via webhook"
                  InputProps={{
                    sx: { 
                      borderRadius: 2,
                      fontFamily: "'Montserrat', sans-serif",
                      color: isDark ? colors.grayLight : colors.black,
                    },
                  }}
                />
              </Box>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={saveWebhook}
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: "none", 
                    fontWeight: 600,
                    fontFamily: "'Montserrat', sans-serif",
                    borderColor: colors.emerald,
                    color: colors.emerald,
                    "&:hover": {
                      borderColor: colors.emeraldDark,
                      bgcolor: alpha(colors.emerald, 0.05),
                    },
                  }}
                >
                  Save Webhook
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleTestWebhook}
                  disabled={webhookStatus === "loading" || !settings.webhookUrl}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    fontFamily: "'Montserrat', sans-serif",
                    bgcolor: webhookStatus === "success" ? colors.emerald : colors.black,
                    "&:hover": {
                      bgcolor: webhookStatus === "success" ? colors.emeraldDark : colors.black,
                      opacity: 0.8,
                    },
                  }}
                >
                  {webhookStatus === "loading" ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : webhookStatus === "success" ? (
                    <CheckCircle sx={{ mr: 0.5 }} fontSize="small" />
                  ) : webhookStatus === "error" ? (
                    <ErrorIcon sx={{ mr: 0.5 }} fontSize="small" />
                  ) : null}
                  {webhookStatus === "success" ? "Connected" : 
                   webhookStatus === "error" ? "Failed" : "Test Webhook"}
                </Button>
              </Stack>

              <Divider sx={{ 
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.grayLight 
              }} />

              <Box sx={{ 
                bgcolor: isDark ? 'rgba(0,196,154,0.08)' : alpha(colors.emerald, 0.04), 
                p: 2, 
                borderRadius: 3 
              }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                    color: isDark ? colors.grayLight : colors.black,
                    mb: 1,
                  }}
                >
                  API Documentation
                </Typography>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: isDark ? 'rgba(255,255,255,0.6)' : colors.textSecondary,
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      Base URL:
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600,
                        color: isDark ? colors.grayLight : colors.black,
                      }}
                    >
                      https://api.reactbuilder.com/v1
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: isDark ? 'rgba(255,255,255,0.6)' : colors.textSecondary,
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      Authorization:
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600,
                        color: isDark ? colors.grayLight : colors.black,
                      }}
                    >
                      Bearer {settings.apiKeyPreview ? "rb_****" : "Not generated"}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: isDark ? 'rgba(255,255,255,0.6)' : colors.textSecondary,
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      Status:
                    </Typography>
                    <Chip
                      label={settings.apiKeyPreview ? "Active" : "Inactive"}
                      size="small"
                      sx={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600,
                        bgcolor: settings.apiKeyPreview 
                          ? (isDark ? 'rgba(0,196,154,0.2)' : colors.emeraldLight)
                          : (isDark ? 'rgba(242,47,34,0.2)' : "rgba(242, 47, 34, 0.12)"),
                        color: settings.apiKeyPreview ? colors.emerald : colors.error,
                        borderRadius: 2,
                      }}
                    />
                  </Stack>
                </Stack>
                <Button
                  variant="text"
                  size="small"
                  endIcon={<OpenInNew />}
                  href="/api/docs"
                  target="_blank"
                  sx={{ 
                    mt: 1, 
                    color: colors.emerald, 
                    fontWeight: 600, 
                    textTransform: "none",
                    fontFamily: "'Montserrat', sans-serif",
                    "&:hover": {
                      bgcolor: alpha(colors.emerald, 0.05),
                    },
                  }}
                >
                  View API Documentation
                </Button>
              </Box>
            </Stack>
          </SectionCard>
        </Grid>

        {/* Backup & Export */}
        <Grid item xs={12} md={6}>
          <SectionCard
            icon={sectionConfig.backup.icon}
            title="Backup & Export"
            gradient={sectionConfig.backup.gradient}
            delay={0.45}
          >
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoBackup}
                    onChange={(e) => update("autoBackup", e.target.checked)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: colors.emerald,
                        "&:hover": { bgcolor: alpha(colors.emerald, 0.08) },
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        bgcolor: colors.emerald,
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ 
                    fontFamily: "'Montserrat', sans-serif",
                    color: isDark ? colors.grayLight : colors.black,
                  }}>
                    Auto Backup
                  </Typography>
                }
                sx={{ display: "flex" }}
              />
              
              {settings.autoBackup && (
                <FormControl fullWidth>
                  <InputLabel 
                    sx={{ 
                      fontFamily: "'Montserrat', sans-serif",
                      color: isDark ? 'rgba(255,255,255,0.6)' : colors.textSecondary,
                    }}
                  >
                    Frequency
                  </InputLabel>
                  <Select
                    value={settings.backupFrequency}
                    onChange={(e) => update("backupFrequency", e.target.value)}
                    label="Frequency"
                    sx={{ 
                      borderRadius: 2,
                      fontFamily: "'Montserrat', sans-serif",
                      color: isDark ? colors.grayLight : colors.black,
                    }}
                  >
                    <MenuItem value="daily" sx={{ fontFamily: "'Montserrat', sans-serif" }}>📅 Daily</MenuItem>
                    <MenuItem value="weekly" sx={{ fontFamily: "'Montserrat', sans-serif" }}>📆 Weekly</MenuItem>
                    <MenuItem value="monthly" sx={{ fontFamily: "'Montserrat', sans-serif" }}>📊 Monthly</MenuItem>
                  </Select>
                </FormControl>
              )}

              <FormControl fullWidth>
                <InputLabel 
                  sx={{ 
                    fontFamily: "'Montserrat', sans-serif",
                    color: isDark ? 'rgba(255,255,255,0.6)' : colors.textSecondary,
                  }}
                >
                  Export Format
                </InputLabel>
                <Select
                  value={settings.exportFormat}
                  onChange={(e) => update("exportFormat", e.target.value)}
                  label="Export Format"
                  sx={{ 
                    borderRadius: 2,
                    fontFamily: "'Montserrat', sans-serif",
                    color: isDark ? colors.grayLight : colors.black,
                  }}
                >
                  <MenuItem value="json" sx={{ fontFamily: "'Montserrat', sans-serif" }}>📄 JSON</MenuItem>
                  <MenuItem value="csv" sx={{ fontFamily: "'Montserrat', sans-serif" }}>📊 CSV</MenuItem>
                  <MenuItem value="xml" sx={{ fontFamily: "'Montserrat', sans-serif" }}>📋 XML</MenuItem>
                </Select>
              </FormControl>

              <Button
                fullWidth
                variant="contained"
                onClick={handleExportData}
                startIcon={<BackupIcon />}
                sx={{
                  bgcolor: isDark ? colors.emerald : colors.black,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontFamily: "'Montserrat', sans-serif",
                  py: 1.5,
                  "&:hover": {
                    bgcolor: isDark ? colors.emeraldDark : colors.black,
                    opacity: 0.8,
                    transform: "scale(1.02)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Export Data
              </Button>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}