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
} from "@mui/material";

import { useEffect, useState } from "react";

import {
  useGetAdminSettingsQuery,
  useUpdateAdminSettingsMutation,
} from "../../../redux/services/admin.api";

const defaultSettings = {
  platformName: "ReactBuilder",
  publicRegistration: true,
  autoApproveUsers: false,
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
forceStrongPasswords: false,
sessionTimeoutHours: 24,
maxPagesPerSite: 50,
maxMediaStorageMb: 500,
maxTeamMembersPerSite: 10,
};

export default function AdminSettings() {
  const { data, isLoading } = useGetAdminSettingsQuery();
  const [updateAdminSettings] = useUpdateAdminSettingsMutation();

  const [settings, setSettings] = useState(defaultSettings);

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

  if (isLoading) {
    return (
      <Box p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight={900}>
        Admin Settings
      </Typography>

      <Typography color="text.secondary" mt={1} mb={4}>
        Platform-level configuration for the Super Admin.
      </Typography>

      <Grid container spacing={3}>
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
                  onChange={(e) =>
                    update("maintenanceMode", e.target.checked)
                  }
                />
              }
              label="Maintenance Mode"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.publicRegistration}
                  onChange={(e) =>
                    update("publicRegistration", e.target.checked)
                  }
                />
              }
              label="Allow Public Registration"
            />
          </Paper>
        </Grid>

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
                  onChange={(e) =>
                    update("autoApproveUsers", e.target.checked)
                  }
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
              onChange={(e) =>
                update("maxSitesPerUser", Number(e.target.value))
              }
            />
          </Paper>
        </Grid>

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
          </Paper>
        </Grid>

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

        <Grid item xs={12}>
          <Button variant="contained" size="large" onClick={save}>
            Save Admin Settings
          </Button>
        </Grid>
      </Grid>
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
      label="Session Timeout Hours"
      value={settings.sessionTimeoutHours}
      onChange={(e) =>
        update("sessionTimeoutHours", Number(e.target.value))
      }
      sx={{ mt: 2 }}
    />
  </Paper>
</Grid>

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
      onChange={(e) =>
        update("maxPagesPerSite", Number(e.target.value))
      }
      sx={{ mb: 2 }}
    />

    <TextField
      fullWidth
      type="number"
      label="Max Media Storage MB"
      value={settings.maxMediaStorageMb}
      onChange={(e) =>
        update("maxMediaStorageMb", Number(e.target.value))
      }
      sx={{ mb: 2 }}
    />

    <TextField
      fullWidth
      type="number"
      label="Max Team Members Per Site"
      value={settings.maxTeamMembersPerSite}
      onChange={(e) =>
        update("maxTeamMembersPerSite", Number(e.target.value))
      }
    />
  </Paper>
</Grid>
    </Box>
  );
}