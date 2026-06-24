import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Save as SaveIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Language as LanguageIcon,
  Schedule as ScheduleIcon,
  Api as ApiIcon,
  Webhook as WebhookIcon,
  QrCode as QrCodeIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { RootState } from '../../../redux/store';
import { setTheme } from '../../../redux/features/themeSlice';
import {
  useSetup2FAMutation,
  useVerify2FASetupMutation,
  useDisable2FAMutation,
} from '../../../redux/services/auth.api';

// 360 Brand Colors
const colors = {
  emerald: "#00C49A",
  emeraldDark: "#009E7C",
  emeraldLight: "rgba(0, 196, 154, 0.12)",
  emeraldGradient: "linear-gradient(135deg, #00C49A 0%, #00A37A 100%)",
  black: "#0D0D0D",
  white: "#FFFFFF", // ✅ Added missing white color
  grayLight: "#F2F2F2",
  grayMedium: "#E0E0E0",
  error: "#F22F22",
};

const translations = {
  fr: {
    settings: 'Paramètres',
    appearance: 'Apparence',
    theme: 'Thème',
    light: 'Clair',
    dark: 'Sombre',
    language: 'Langue',
    french: 'Français',
    english: 'Anglais',
    arabic: 'Arabe',
    timezone: 'Fuseau horaire',
    dateFormat: 'Format de date',
    notifications: 'Notifications',
    emailNotifications: 'Notifications par email',
    browserNotifications: 'Notifications navigateur',
    weeklyReport: 'Rapport hebdomadaire',
    security: 'Sécurité',
    twoFactorAuth: 'Authentification à deux facteurs (2FA)',
    loginAlerts: 'Alertes de connexion',
    sessionTimeout: "Délai d'inactivité (minutes)",
    backup: 'Sauvegarde & Export',
    autoBackup: 'Sauvegarde automatique',
    frequency: 'Fréquence',
    daily: 'Quotidienne',
    weekly: 'Hebdomadaire',
    monthly: 'Mensuelle',
    exportFormat: "Format d'export",
    apiKey: 'Clé API',
    webhookUrl: 'URL du Webhook',
    generateKey: 'Générer une nouvelle clé',
    actions: 'Actions',
    manageData: 'Gérer vos données et paramètres',
    reset: 'Réinitialiser',
    save: 'Sauvegarder',
    saving: 'Sauvegarde...',
    exportData: 'Exporter toutes les données',
    saveSuccess: 'Paramètres sauvegardés avec succès!',
    saveError: 'Erreur lors de la sauvegarde',
    resetConfirm: 'Réinitialiser tous les paramètres ?',
    resetSuccess: 'Paramètres réinitialisés',
    exportSuccess: 'Données exportées!',
    settingsInfo: 'Les paramètres sont sauvegardés localement sur votre navigateur.',
    enable2FA: 'Activer 2FA',
    verify: 'Vérifier',
    cancel: 'Annuler',
    verificationCode: 'Code de vérification',
  },
  en: {
    settings: 'Settings',
    appearance: 'Appearance',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    language: 'Language',
    french: 'French',
    english: 'English',
    arabic: 'Arabic',
    timezone: 'Timezone',
    dateFormat: 'Date format',
    notifications: 'Notifications',
    emailNotifications: 'Email notifications',
    browserNotifications: 'Browser notifications',
    weeklyReport: 'Weekly report',
    security: 'Security',
    twoFactorAuth: 'Two-factor authentication (2FA)',
    loginAlerts: 'Login alerts',
    sessionTimeout: 'Session timeout (minutes)',
    backup: 'Backup & Export',
    autoBackup: 'Auto backup',
    frequency: 'Frequency',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    exportFormat: 'Export format',
    apiKey: 'API Key',
    webhookUrl: 'Webhook URL',
    generateKey: 'Generate new key',
    actions: 'Actions',
    manageData: 'Manage your data and settings',
    reset: 'Reset',
    save: 'Save',
    saving: 'Saving...',
    exportData: 'Export all data',
    saveSuccess: 'Settings saved successfully!',
    saveError: 'Error saving settings',
    resetConfirm: 'Reset all settings?',
    resetSuccess: 'Settings reset',
    exportSuccess: 'Data exported!',
    settingsInfo: 'Settings are saved locally in your browser.',
    enable2FA: 'Enable 2FA',
    verify: 'Verify',
    cancel: 'Cancel',
    verificationCode: 'Verification code',
  },
};

type Language = 'fr' | 'en';

interface SectionCardProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  delay?: number;
}

const SectionCard: React.FC<SectionCardProps> = ({ 
  icon: Icon, 
  title, 
  children 
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      sx={{
        p: 0,
        borderRadius: 4,
        overflow: 'hidden',
        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : colors.white,
        border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        boxShadow: isDark 
          ? '0 4px 20px rgba(0,0,0,0.3)'
          : '0 4px 20px rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: isDark
            ? '0 8px 40px rgba(0,0,0,0.4)'
            : '0 8px 40px rgba(0,196,154,0.12)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : colors.grayLight}`,
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: isDark ? 'rgba(0,196,154,0.15)' : colors.emeraldLight,
            color: colors.emerald,
          }}
        >
          <Icon sx={{ fontSize: 18 }} />
        </Avatar>
        <Typography
          variant="h6"
          sx={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            color: isDark ? colors.grayLight : colors.black,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
    </Paper>
  );
};

export const Settings: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    return saved === 'fr' || saved === 'en' ? saved : 'fr';
  });
  
  const t = translations[currentLang];
  
  const [settings, setSettings] = useState({
    theme: themeMode,
    language: currentLang,
    timezone: 'Europe/Paris',
    dateFormat: 'DD/MM/YYYY',
    emailNotifications: true,
    browserNotifications: false,
    weeklyReport: true,
    twoFactorAuth: false,
    sessionTimeout: 60,
    loginAlerts: true,
    autoBackup: true,
    backupFrequency: 'weekly',
    exportFormat: 'json',
    apiKey: '',
    webhookUrl: '',
  });

  const [saveLoading, setSaveLoading] = useState(false);

  const [setup2FA] = useSetup2FAMutation();
  const [verify2FASetup] = useVerify2FASetupMutation();
  const [disable2FA] = useDisable2FAMutation();

  const [qrCode, setQrCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [open2FA, setOpen2FA] = useState(false);
  const [openApiKey, setOpenApiKey] = useState(false);
  const [apiKeyValue, setApiKeyValue] = useState('');

  useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', currentLang);
  }, [currentLang]);

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
    handleChange('language', lang);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      localStorage.setItem('app_settings', JSON.stringify(settings));
      
      if (settings.theme !== themeMode) {
        dispatch(setTheme(settings.theme as 'light' | 'dark'));
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      enqueueSnackbar(t.saveSuccess, { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(t.saveError, { variant: 'error' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm(t.resetConfirm)) {
      localStorage.removeItem('app_settings');
      setSettings({
        theme: 'light',
        language: currentLang,
        timezone: 'Europe/Paris',
        dateFormat: 'DD/MM/YYYY',
        emailNotifications: true,
        browserNotifications: false,
        weeklyReport: true,
        twoFactorAuth: false,
        sessionTimeout: 60,
        loginAlerts: true,
        autoBackup: true,
        backupFrequency: 'weekly',
        exportFormat: 'json',
        apiKey: '',
        webhookUrl: '',
      });
      dispatch(setTheme('light'));
      enqueueSnackbar(t.resetSuccess, { variant: 'info' });
    }
  };

  // ✅ Restored handleExportData function
  const handleExportData = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        JSON.parse(
          localStorage.getItem("auth") || "{}"
        )?.accessToken;

      if (!token) {
        enqueueSnackbar("No access token found", { variant: "error" });
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

      enqueueSnackbar("Backup exported successfully", { variant: "success" });
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Export failed", { variant: "error" });
    }
  };

  const enable2FA = async () => {
    try {
      const result = await setup2FA().unwrap();
      setQrCode(result.qrCode);
      setOpen2FA(true);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error setting up 2FA', { variant: 'error' });
    }
  };

  const confirm2FA = async () => {
    try {
      await verify2FASetup({
        token: verificationCode,
      }).unwrap();

      handleChange("twoFactorAuth", true);
      enqueueSnackbar("2FA Enabled", { variant: "success" });
      setOpen2FA(false);
      setVerificationCode("");
    } catch {
      enqueueSnackbar("Invalid Code", { variant: "error" });
    }
  };

  const disableUser2FA = async () => {
    try {
      await disable2FA().unwrap();
      handleChange("twoFactorAuth", false);
      enqueueSnackbar("2FA Disabled", { variant: "success" });
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Error disabling 2FA", { variant: "error" });
    }
  };

  const generateApiKey = () => {
    const newKey = `rb_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setApiKeyValue(newKey);
    setOpenApiKey(true);
  };

  const confirmApiKey = () => {
    handleChange('apiKey', apiKeyValue);
    enqueueSnackbar('API Key generated successfully!', { variant: 'success' });
    setOpenApiKey(false);
  };

  return (
    <Box sx={{ 
      p: 4,
      bgcolor: isDark ? '#0D0D0D' : colors.grayLight,
      minHeight: '100vh',
    }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: colors.emerald,
              color: 'white',
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
                letterSpacing: '-0.02em',
              }}
            >
              {t.settings}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                color: isDark ? 'rgba(255,255,255,0.6)' : colors.black,
                opacity: 0.6,
              }}
            >
              360 Digital Grow — Studio Digital pour votre croissance 360°
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={handleReset}
            startIcon={<DeleteIcon />}
            sx={{
              borderColor: isDark ? 'rgba(255,255,255,0.2)' : colors.grayMedium,
              color: isDark ? colors.grayLight : colors.black,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': {
                borderColor: colors.error,
                color: colors.error,
                bgcolor: alpha(colors.error, 0.05),
              },
            }}
          >
            {t.reset}
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saveLoading}
            startIcon={saveLoading ? null : <SaveIcon />}
            sx={{
              bgcolor: colors.emerald,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              px: 4,
              '&:hover': {
                bgcolor: colors.emeraldDark,
              },
            }}
          >
            {saveLoading ? t.saving : t.save}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Apparence */}
        <Grid item xs={12} md={6}>
          <SectionCard icon={PaletteIcon} title={t.appearance}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ fontFamily: "'Montserrat', sans-serif" }}>
                {t.theme}
              </InputLabel>
              <Select
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
                label={t.theme}
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  borderRadius: 2,
                }}
              >
                <MenuItem value="light" sx={{ fontFamily: "'Montserrat', sans-serif" }}>
                   {t.light}
                </MenuItem>
                <MenuItem value="dark" sx={{ fontFamily: "'Montserrat', sans-serif" }}>
                   {t.dark}
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ fontFamily: "'Montserrat', sans-serif" }}>
                {t.language}
              </InputLabel>
              <Select
                value={currentLang}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                label={t.language}
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  borderRadius: 2,
                }}
              >
                <MenuItem value="fr" sx={{ fontFamily: "'Montserrat', sans-serif" }}>
                  🇫🇷 {t.french}
                </MenuItem>
                <MenuItem value="en" sx={{ fontFamily: "'Montserrat', sans-serif" }}>
                  🇬🇧 {t.english}
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ fontFamily: "'Montserrat', sans-serif" }}>
                {t.timezone}
              </InputLabel>
              <Select
                value={settings.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                label={t.timezone}
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  borderRadius: 2,
                }}
              >
                <MenuItem value="Europe/Paris" sx={{ fontFamily: "'Montserrat', sans-serif" }}>🇫🇷 Europe/Paris</MenuItem>
                <MenuItem value="Europe/London" sx={{ fontFamily: "'Montserrat', sans-serif" }}>🇬🇧 Europe/London</MenuItem>
                <MenuItem value="America/New_York" sx={{ fontFamily: "'Montserrat', sans-serif" }}>🇺🇸 America/New_York</MenuItem>
                <MenuItem value="Asia/Tokyo" sx={{ fontFamily: "'Montserrat', sans-serif" }}>🇯🇵 Asia/Tokyo</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel sx={{ fontFamily: "'Montserrat', sans-serif" }}>
                {t.dateFormat}
              </InputLabel>
              <Select
                value={settings.dateFormat}
                onChange={(e) => handleChange('dateFormat', e.target.value)}
                label={t.dateFormat}
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  borderRadius: 2,
                }}
              >
                <MenuItem value="DD/MM/YYYY" sx={{ fontFamily: "'Montserrat', sans-serif" }}>DD/MM/YYYY</MenuItem>
                <MenuItem value="MM/DD/YYYY" sx={{ fontFamily: "'Montserrat', sans-serif" }}>MM/DD/YYYY</MenuItem>
                <MenuItem value="YYYY-MM-DD" sx={{ fontFamily: "'Montserrat', sans-serif" }}>YYYY-MM-DD</MenuItem>
              </Select>
            </FormControl>
          </SectionCard>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <SectionCard icon={NotificationsIcon} title={t.notifications}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: colors.emerald,
                      '&:hover': { bgcolor: alpha(colors.emerald, 0.08) },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      bgcolor: colors.emerald,
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {t.emailNotifications}
                </Typography>
              }
              sx={{ mb: 2, display: 'flex' }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.browserNotifications}
                  onChange={(e) => handleChange('browserNotifications', e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: colors.emerald,
                      '&:hover': { bgcolor: alpha(colors.emerald, 0.08) },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      bgcolor: colors.emerald,
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {t.browserNotifications}
                </Typography>
              }
              sx={{ mb: 2, display: 'flex' }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.weeklyReport}
                  onChange={(e) => handleChange('weeklyReport', e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: colors.emerald,
                      '&:hover': { bgcolor: alpha(colors.emerald, 0.08) },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      bgcolor: colors.emerald,
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {t.weeklyReport}
                </Typography>
              }
              sx={{ display: 'flex' }}
            />
          </SectionCard>
        </Grid>

        {/* Sécurité */}
        <Grid item xs={12} md={6}>
          <SectionCard icon={SecurityIcon} title={t.security}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.twoFactorAuth}
                    onChange={(e) => {
                      if (e.target.checked) {
                        enable2FA();
                      } else {
                        disableUser2FA();
                      }
                    }}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: colors.emerald,
                        '&:hover': { bgcolor: alpha(colors.emerald, 0.08) },
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        bgcolor: colors.emerald,
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {t.twoFactorAuth}
                  </Typography>
                }
                sx={{ display: 'flex' }}
              />
              {settings.twoFactorAuth && (
                <CheckCircleIcon sx={{ color: colors.emerald, fontSize: 20, ml: 1 }} />
              )}
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.loginAlerts}
                  onChange={(e) => handleChange('loginAlerts', e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: colors.emerald,
                      '&:hover': { bgcolor: alpha(colors.emerald, 0.08) },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      bgcolor: colors.emerald,
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {t.loginAlerts}
                </Typography>
              }
              sx={{ mb: 2, display: 'flex' }}
            />
            
            <Typography 
              gutterBottom 
              sx={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}
            >
              {t.sessionTimeout}
            </Typography>
            <Slider
              value={settings.sessionTimeout}
              onChange={(_, value) => handleChange('sessionTimeout', value)}
              min={5}
              max={120}
              marks={[
                { value: 5, label: '5' },
                { value: 30, label: '30' },
                { value: 60, label: '60' },
                { value: 120, label: '120' },
              ]}
              valueLabelDisplay="auto"
              sx={{
                color: colors.emerald,
                '& .MuiSlider-thumb': {
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: `0px 0px 0px 8px ${alpha(colors.emerald, 0.16)}`,
                  },
                },
              }}
            />
          </SectionCard>
        </Grid>

        {/* API & Webhook */}
        <Grid item xs={12} md={6}>
          <SectionCard icon={ApiIcon} title="API & Webhooks">
            <TextField
              fullWidth
              label={t.apiKey}
              value={settings.apiKey || ''}
              InputProps={{
                readOnly: true,
                sx: { 
                  borderRadius: 2,
                  fontFamily: "'Montserrat', sans-serif",
                },
              }}
              sx={{ mb: 2 }}
            />
            
            <Button
              fullWidth
              variant="outlined"
              onClick={generateApiKey}
              startIcon={<ApiIcon />}
              sx={{
                borderColor: colors.emerald,
                color: colors.emerald,
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                mb: 2,
                '&:hover': {
                  borderColor: colors.emeraldDark,
                  bgcolor: alpha(colors.emerald, 0.05),
                },
              }}
            >
              {t.generateKey}
            </Button>

            <Divider sx={{ my: 2, borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.grayLight }} />

            <TextField
              fullWidth
              label={t.webhookUrl}
              value={settings.webhookUrl || ''}
              onChange={(e) => handleChange('webhookUrl', e.target.value)}
              placeholder="https://your-webhook.com/endpoint"
              InputProps={{
                sx: { 
                  borderRadius: 2,
                  fontFamily: "'Montserrat', sans-serif",
                },
              }}
              sx={{ mb: 2 }}
            />
          </SectionCard>
        </Grid>

        {/* Actions */}
        <Grid item xs={12} md={6}>
          <SectionCard icon={SettingsIcon} title={t.actions}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                color: isDark ? 'rgba(255,255,255,0.6)' : colors.black,
                opacity: 0.6,
                mb: 2,
              }}
            >
              {t.manageData}
            </Typography>
            
            <Alert 
              severity="info" 
              sx={{ 
                mb: 2,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  color: colors.emerald,
                },
              }}
            >
              💡 {t.settingsInfo}
            </Alert>

            <Box display="flex" gap={2} flexWrap="wrap">
              <Button
                variant="outlined"
                color="error"
                onClick={handleReset}
                startIcon={<DeleteIcon />}
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                {t.reset}
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saveLoading}
                startIcon={saveLoading ? null : <SaveIcon />}
                sx={{
                  bgcolor: colors.emerald,
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: colors.emeraldDark,
                  },
                }}
              >
                {saveLoading ? t.saving : t.save}
              </Button>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Dialog 2FA */}
      <Dialog 
        open={open2FA} 
        onClose={() => setOpen2FA(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: isDark ? '#1A1A1A' : colors.white,
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>
          {t.enable2FA}
        </DialogTitle>
        <DialogContent>
          {qrCode && (
            <Box display="flex" justifyContent="center" mb={2}>
              <Box
                component="img"
                src={qrCode}
                alt="QR Code"
                sx={{
                  width: 200,
                  borderRadius: 2,
                  border: `2px solid ${colors.emerald}`,
                }}
              />
            </Box>
          )}
          <TextField
            fullWidth
            margin="normal"
            label={t.verificationCode}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            InputProps={{
              sx: { 
                borderRadius: 2,
                fontFamily: "'Montserrat', sans-serif",
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpen2FA(false)}
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            {t.cancel}
          </Button>
          <Button
            onClick={confirm2FA}
            variant="contained"
            sx={{
              bgcolor: colors.emerald,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': {
                bgcolor: colors.emeraldDark,
              },
            }}
          >
            {t.verify}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog API Key */}
      <Dialog 
        open={openApiKey} 
        onClose={() => setOpenApiKey(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: isDark ? '#1A1A1A' : colors.white,
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>
          Generate API Key
        </DialogTitle>
        <DialogContent>
          <Alert 
            severity="info" 
            sx={{ 
              mb: 2,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                color: colors.emerald,
              },
            }}
          >
            Make sure to copy your API key now. You won't be able to see it again!
          </Alert>
          <TextField
            fullWidth
            margin="normal"
            label="API Key"
            value={apiKeyValue}
            InputProps={{
              readOnly: true,
              sx: { 
                borderRadius: 2,
                fontFamily: "'Montserrat', sans-serif",
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenApiKey(false)}
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmApiKey}
            variant="contained"
            startIcon={<CheckCircleIcon />}
            sx={{
              bgcolor: colors.emerald,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': {
                bgcolor: colors.emeraldDark,
              },
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};