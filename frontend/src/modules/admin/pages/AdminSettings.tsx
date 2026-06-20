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
  Link,
} from "@mui/material";

import {
  ContentCopy,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error as ErrorIcon,
  Api,
  OpenInNew,
} from "@mui/icons-material";

import { useEffect, useState } from "react";

import {
  useGetAdminSettingsQuery,
  useUpdateAdminSettingsMutation,
  useGenerateAdminApiKeyMutation,
  useTestWebhookMutation, // ✅ AJOUTÉ
} from "../../../redux/services/admin.api";

const defaultSettings = {
  platformName: "ReactBuilder",
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
};

export default function AdminSettings() {
  const { data, isLoading } = useGetAdminSettingsQuery();
  const [updateAdminSettings] = useUpdateAdminSettingsMutation();
  const [generateApiKey] = useGenerateAdminApiKeyMutation();
  const [testWebhook] = useTestWebhookMutation(); // ✅ AJOUTÉ

  const [settings, setSettings] = useState(defaultSettings);
  const [showApiKey, setShowApiKey] = useState(false);
  
  // ✅ État pour le webhook
  const [webhookStatus, setWebhookStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [webhookMessage, setWebhookMessage] = useState("");
  const [webhookSnackbar, setWebhookSnackbar] = useState(false);

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
    await updateAdminSettings(settings).unwrap();
    alert("Admin settings saved");
  };

  // ✅ Sauvegarder uniquement le webhook
  const saveWebhook = async () => {
    try {
      await updateAdminSettings({
        ...settings,
        webhookUrl: settings.webhookUrl,
      }).unwrap();
      alert("Webhook URL saved successfully!");
    } catch {
      alert("Failed to save webhook URL");
    }
  };

  // ✅ Tester le webhook
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
      setWebhookMessage(result.message || "Webhook connected successfully!");
      setWebhookSnackbar(true);
    } catch (error: any) {
      setWebhookStatus("error");
      setWebhookMessage(error?.data?.message || "Webhook test failed");
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
      alert("API Key generated successfully!");
    } catch {
      alert("Failed to generate API key");
    }
  };

  const handleCopyApiKey = () => {
    if (settings.apiKeyPreview) {
      navigator.clipboard.writeText(settings.apiKeyPreview);
      alert("API Key copied to clipboard!");
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
      <Box p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      {/* Snackbar pour les notifications webhook */}
      <Snackbar
        open={webhookSnackbar}
        autoHideDuration={6000}
        onClose={() => setWebhookSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setWebhookSnackbar(false)}
          severity={webhookStatus === "success" ? "success" : "error"}
          sx={{ width: "100%" }}
        >
          {webhookMessage}
        </Alert>
      </Snackbar>

      <Typography variant="h4" fontWeight={900}>
        Admin Settings
      </Typography>

      <Typography color="text.secondary" mt={1} mb={4}>
        Platform-level configuration for the Super Admin.
      </Typography>

      <Grid container spacing={3}>
        {/* Platform */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={800}>
              Platform
            </Typography>
            <Divider sx={{ my: 2 }} />

            <TextField
              fullWidth
              label="Platform Name"
              value={settings.platformName}
              onChange={(e) => update("platformName", e.target.value)}
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.maintenanceMode}
                  onChange={(e) => update("maintenanceMode", e.target.checked)}
                />
              }
              label="Maintenance Mode"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.publicRegistration}
                  onChange={(e) => update("publicRegistration", e.target.checked)}
                />
              }
              label="Allow Public Registration"
            />
          </Paper>
        </Grid>

        {/* Users */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={800}>
              Users
            </Typography>
            <Divider sx={{ my: 2 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoApproveUsers}
                  onChange={(e) => update("autoApproveUsers", e.target.checked)}
                />
              }
              label="Auto Approve New Users"
            />

            <TextField
              fullWidth
              select
              label="Default User Role"
              value={settings.defaultRole}
              onChange={(e) => update("defaultRole", e.target.value)}
              sx={{ mt: 2, mb: 2 }}
            >
              <MenuItem value="VIEWER">VIEWER</MenuItem>
              <MenuItem value="EDITOR">EDITOR</MenuItem>
            </TextField>

            <TextField
              fullWidth
              type="number"
              label="Max Sites Per User"
              value={settings.maxSitesPerUser}
              onChange={(e) => update("maxSitesPerUser", Number(e.target.value))}
            />
          </Paper>
        </Grid>

        {/* Plugins */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={800}>
              Plugins
            </Typography>
            <Divider sx={{ my: 2 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.seoPlugin}
                  onChange={(e) => update("seoPlugin", e.target.checked)}
                />
              }
              label="SEO Plugin"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.mediaPlugin}
                  onChange={(e) => update("mediaPlugin", e.target.checked)}
                />
              }
              label="Media Plugin"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.versionPlugin}
                  onChange={(e) => update("versionPlugin", e.target.checked)}
                />
              }
              label="Version Plugin"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.notificationPlugin}
                  onChange={(e) => update("notificationPlugin", e.target.checked)}
                />
              }
              label="Notification Plugin"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.figmaPlugin}
                  onChange={(e) => update("figmaPlugin", e.target.checked)}
                />
              }
              label="Figma Plugin"
            />
          </Paper>
        </Grid>

        {/* AI */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={800}>
              AI
            </Typography>
            <Divider sx={{ my: 2 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.aiEnabled}
                  onChange={(e) => update("aiEnabled", e.target.checked)}
                />
              }
              label="Enable AI Features"
            />

            <TextField
              fullWidth
              select
              label="AI Provider"
              value={settings.aiProvider}
              onChange={(e) => update("aiProvider", e.target.value)}
              sx={{ mt: 2 }}
            >
              <MenuItem value="Claude">Claude</MenuItem>
              <MenuItem value="OpenAI">OpenAI</MenuItem>
              <MenuItem value="Gemini">Gemini</MenuItem>
            </TextField>
          </Paper>
        </Grid>

        {/* Security */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={800}>
              Security
            </Typography>
            <Divider sx={{ my: 2 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.allowGoogleLogin}
                  onChange={(e) => update("allowGoogleLogin", e.target.checked)}
                />
              }
              label="Allow Google Login"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.allowEmailLogin}
                  onChange={(e) => update("allowEmailLogin", e.target.checked)}
                />
              }
              label="Allow Email Login"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.forceStrongPasswords}
                  onChange={(e) => update("forceStrongPasswords", e.target.checked)}
                />
              }
              label="Force Strong Passwords"
            />

            <TextField
              fullWidth
              type="number"
              label="Session Timeout (Hours)"
              value={settings.sessionTimeoutHours}
              onChange={(e) => update("sessionTimeoutHours", Number(e.target.value))}
              sx={{ mt: 2 }}
            />
          </Paper>
        </Grid>

        {/* Limits */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={800}>
              Limits
            </Typography>
            <Divider sx={{ my: 2 }} />

            <TextField
              fullWidth
              type="number"
              label="Max Pages Per Site"
              value={settings.maxPagesPerSite}
              onChange={(e) => update("maxPagesPerSite", Number(e.target.value))}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              type="number"
              label="Max Media Storage (MB)"
              value={settings.maxMediaStorageMb}
              onChange={(e) => update("maxMediaStorageMb", Number(e.target.value))}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              type="number"
              label="Max Team Members Per Site"
              value={settings.maxTeamMembersPerSite}
              onChange={(e) => update("maxTeamMembersPerSite", Number(e.target.value))}
            />
          </Paper>
        </Grid>

        {/* ✅ API Access - PRODUCTION READY */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={800}>
              API Access
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* API Key avec masquage + Copy */}
            <TextField
              fullWidth
              label="API Key"
              value={!settings.apiKeyPreview ? "" : showApiKey ? settings.apiKeyPreview: maskApiKey(settings.apiKeyPreview)}
              InputProps={{
                readOnly: true,
                endAdornment: settings.apiKeyPreview && (
                  <InputAdornment position="end">
                    <Tooltip title={showApiKey ? "Hide API Key" : "Show API Key"}>
                      <IconButton
                        onClick={() => setShowApiKey(!showApiKey)}
                        edge="end"
                        size="small"
                      >
                        {showApiKey ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copy to clipboard">
                      <IconButton
                        onClick={handleCopyApiKey}
                        edge="end"
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        <ContentCopy />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {/* Boutons : Generate + Copy */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Button
                variant="contained"
                onClick={handleGenerateApiKey}
                sx={{
                  bgcolor: "#00C49A",
                  "&:hover": {
                    bgcolor: "#009E7C",
                  },
                }}
              >
                Generate New Key
              </Button>

              {settings.apiKeyPreview && (
                <Button
                  variant="outlined"
                  onClick={handleCopyApiKey}
                  startIcon={<ContentCopy />}
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
                  mb: 2,
                  bgcolor: "rgba(0,196,154,0.12)",
                  color: "#00C49A",
                  fontWeight: 500,
                }}
              />
            )}

            <Divider sx={{ my: 2 }} />

            {/* Webhook URL + Save + Test */}
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Webhook Configuration
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <TextField
                fullWidth
                size="small"
                label="Webhook URL"
                value={settings.webhookUrl || ""}
                onChange={(e) => update("webhookUrl", e.target.value)}
                placeholder="https://your-webhook.com/endpoint"
                helperText="Receive API events via webhook"
              />
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={saveWebhook}
                sx={{ minWidth: "120px" }}
              >
                Save Webhook
              </Button>

              <Button
                variant="contained"
                size="small"
                onClick={handleTestWebhook}
                disabled={webhookStatus === "loading" || !settings.webhookUrl}
                sx={{
                  minWidth: "120px",
                  bgcolor: webhookStatus === "success" ? "#00C49A" : undefined,
                  "&:hover": {
                    bgcolor: webhookStatus === "success" ? "#009E7C" : undefined,
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

            <Divider sx={{ my: 2 }} />

            {/* API Documentation */}
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              API Documentation
            </Typography>

            <Box sx={{ bgcolor: "#f8fafc", p: 2, borderRadius: 2, mb: 2 }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Base URL:
                  </Typography>
                  <Typography variant="caption" fontWeight={600}>
                    https://api.reactbuilder.com/v1
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Authorization:
                  </Typography>
                  <Typography variant="caption" fontWeight={600}>
                    Bearer {settings.apiKeyPreview ? "rb_****" : "Not generated"}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Status:
                  </Typography>
                  <Chip
                    label={settings.apiKeyPreview ? "Active" : "Inactive"}
                    size="small"
                    sx={{
                      bgcolor: settings.apiKeyPreview 
                        ? "rgba(0,196,154,0.12)" 
                        : "rgba(255,0,0,0.12)",
                      color: settings.apiKeyPreview ? "#00C49A" : "#f44336",
                      fontWeight: 500,
                    }}
                  />
                </Stack>
              </Stack>
            </Box>

            <Button
              variant="text"
              size="small"
              endIcon={<OpenInNew />}
              href="/api/docs"
              target="_blank"
              sx={{ color: "#00C49A" }}
            >
              View API Documentation
            </Button>
          </Paper>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Button variant="contained" size="large" onClick={save}>
            Save Admin Settings
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}