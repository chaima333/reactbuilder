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
} from '@mui/material';
import {
  Save as SaveIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Backup as BackupIcon,
  Api as ApiIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { RootState } from '../redux/store';
import { setTheme } from '../redux/features/themeSlice';

// Traductions directement dans le fichier
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
    sessionTimeout: 'Délai d\'inactivité (minutes)',
    backup: 'Sauvegarde & Export',
    autoBackup: 'Sauvegarde automatique',
    frequency: 'Fréquence',
    daily: 'Quotidienne',
    weekly: 'Hebdomadaire',
    monthly: 'Mensuelle',
    exportFormat: 'Format d\'export',
    api: 'API & Webhooks',
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
    api: 'API & Webhooks',
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
  },
  ar: {
    settings: 'الإعدادات',
    appearance: 'المظهر',
    theme: 'الثيم',
    light: 'فاتح',
    dark: 'داكن',
    language: 'اللغة',
    french: 'الفرنسية',
    english: 'الإنجليزية',
    arabic: 'العربية',
    timezone: 'المنطقة الزمنية',
    dateFormat: 'تنسيق التاريخ',
    notifications: 'الإشعارات',
    emailNotifications: 'إشعارات البريد الإلكتروني',
    browserNotifications: 'إشعارات المتصفح',
    weeklyReport: 'تقرير أسبوعي',
    security: 'الأمان',
    twoFactorAuth: 'التحقق بخطوتين (2FA)',
    loginAlerts: 'تنبيهات تسجيل الدخول',
    sessionTimeout: 'مهلة الجلسة (دقائق)',
    backup: 'النسخ الاحتياطي والتصدير',
    autoBackup: 'نسخ احتياطي تلقائي',
    frequency: 'التكرار',
    daily: 'يومي',
    weekly: 'أسبوعي',
    monthly: 'شهري',
    exportFormat: 'تنسيق التصدير',
    api: 'API و Webhooks',
    apiKey: 'مفتاح API',
    webhookUrl: 'رابط Webhook',
    generateKey: 'إنشاء مفتاح جديد',
    actions: 'إجراءات',
    manageData: 'إدارة بياناتك وإعداداتك',
    reset: 'إعادة تعيين',
    save: 'حفظ',
    saving: 'جاري الحفظ...',
    exportData: 'تصدير جميع البيانات',
    saveSuccess: 'تم حفظ الإعدادات بنجاح!',
    saveError: 'خطأ في حفظ الإعدادات',
    resetConfirm: 'إعادة تعيين جميع الإعدادات؟',
    resetSuccess: 'تم إعادة تعيين الإعدادات',
    exportSuccess: 'تم تصدير البيانات!',
    settingsInfo: 'يتم حفظ الإعدادات محليًا في متصفحك.',
  },
};

type Language = 'fr' | 'en' | 'ar';

export const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  
  // Langue actuelle
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    return saved === 'fr' || saved === 'en' || saved === 'ar' ? saved : 'fr';
  });
  
  const t = translations[currentLang];
  
  // État des paramètres
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

  // Charger les paramètres sauvegardés
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

  // Sauvegarder la langue
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

  const handleExportData = () => {
    const data = {
      settings,
      user: JSON.parse(localStorage.getItem('user') || '{}'),
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reactbuilder-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    enqueueSnackbar(t.exportSuccess, { variant: 'success' });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        {t.settings}
      </Typography>

      <Grid container spacing={3}>
        {/* Apparence */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <PaletteIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">{t.appearance}</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t.theme}</InputLabel>
              <Select
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
                label={t.theme}
              >
                <MenuItem value="light">{t.light}</MenuItem>
                <MenuItem value="dark">{t.dark}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t.language}</InputLabel>
              <Select
                value={currentLang}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                label={t.language}
              >
                <MenuItem value="fr">{t.french}</MenuItem>
                <MenuItem value="en">{t.english}</MenuItem>
                <MenuItem value="ar">{t.arabic}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t.timezone}</InputLabel>
              <Select
                value={settings.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                label={t.timezone}
              >
                <MenuItem value="Europe/Paris">Europe/Paris</MenuItem>
                <MenuItem value="Europe/London">Europe/London</MenuItem>
                <MenuItem value="America/New_York">America/New_York</MenuItem>
                <MenuItem value="Asia/Tokyo">Asia/Tokyo</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{t.dateFormat}</InputLabel>
              <Select
                value={settings.dateFormat}
                onChange={(e) => handleChange('dateFormat', e.target.value)}
                label={t.dateFormat}
              >
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <NotificationsIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">{t.notifications}</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                />
              }
              label={t.emailNotifications}
              sx={{ mb: 2, display: 'flex' }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.browserNotifications}
                  onChange={(e) => handleChange('browserNotifications', e.target.checked)}
                />
              }
              label={t.browserNotifications}
              sx={{ mb: 2, display: 'flex' }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.weeklyReport}
                  onChange={(e) => handleChange('weeklyReport', e.target.checked)}
                />
              }
              label={t.weeklyReport}
              sx={{ display: 'flex' }}
            />
          </Paper>
        </Grid>

        {/* Sécurité */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">{t.security}</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.twoFactorAuth}
                  onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                />
              }
              label={t.twoFactorAuth}
              sx={{ mb: 2, display: 'flex' }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.loginAlerts}
                  onChange={(e) => handleChange('loginAlerts', e.target.checked)}
                />
              }
              label={t.loginAlerts}
              sx={{ mb: 2, display: 'flex' }}
            />
            
            <Typography gutterBottom>{t.sessionTimeout}</Typography>
            <Slider
              value={settings.sessionTimeout}
              onChange={(_, value) => handleChange('sessionTimeout', value)}
              min={5}
              max={120}
              marks
              valueLabelDisplay="auto"
            />
          </Paper>
        </Grid>

        {/* Sauvegarde */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <BackupIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">{t.backup}</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoBackup}
                  onChange={(e) => handleChange('autoBackup', e.target.checked)}
                />
              }
              label={t.autoBackup}
              sx={{ mb: 2, display: 'flex' }}
            />
            
            {settings.autoBackup && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{t.frequency}</InputLabel>
                <Select
                  value={settings.backupFrequency}
                  onChange={(e) => handleChange('backupFrequency', e.target.value)}
                  label={t.frequency}
                >
                  <MenuItem value="daily">{t.daily}</MenuItem>
                  <MenuItem value="weekly">{t.weekly}</MenuItem>
                  <MenuItem value="monthly">{t.monthly}</MenuItem>
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t.exportFormat}</InputLabel>
              <Select
                value={settings.exportFormat}
                onChange={(e) => handleChange('exportFormat', e.target.value)}
                label={t.exportFormat}
              >
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="xml">XML</MenuItem>
              </Select>
            </FormControl>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleExportData}
              sx={{ mt: 1 }}
            >
              {t.exportData}
            </Button>
          </Paper>
        </Grid>

        {/* API */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <ApiIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">{t.api}</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <TextField
              fullWidth
              label={t.apiKey}
              value={settings.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Générer une clé API"
            />
            <Button size="small" sx={{ mb: 2 }}>
              {t.generateKey}
            </Button>

            <TextField
              fullWidth
              label={t.webhookUrl}
              value={settings.webhookUrl}
              onChange={(e) => handleChange('webhookUrl', e.target.value)}
              placeholder="https://..."
            />
          </Paper>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" gutterBottom>{t.actions}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t.manageData}
                </Typography>
              </Box>
              <Box>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleReset}
                  startIcon={<DeleteIcon />}
                  sx={{ mr: 2 }}
                >
                  {t.reset}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saveLoading}
                  startIcon={<SaveIcon />}
                >
                  {saveLoading ? t.saving : t.save}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mt: 3 }}>
        💡 {t.settingsInfo}
      </Alert>
    </Box>
  );
};