import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { RootState } from '../../../redux/store';
import { setCredentials } from '../../../modules/auth/services/authSlice';
import { useGetProfileQuery, useUpdateProfileMutation } from '../../../redux/services/users.api';
import { useLanguage } from '../../../app/providers/LanguageProvider';

export const Profile: React.FC = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '',
  });

  const { data: profileData, isLoading, refetch } = useGetProfileQuery(undefined);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  useEffect(() => {
    if (profileData?.user || user) {
      const currentUser = profileData?.user || user;
      setFormData({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        avatar: currentUser?.avatar || '',
      });
    }
  }, [profileData, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      const result = await updateProfile(formData).unwrap();
      if (result.success && result.user) {
        dispatch(setCredentials({
          user: result.user,
          accessToken: localStorage.getItem('accessToken') || '',
          refreshToken: localStorage.getItem('refreshToken') || '',
        }));
        enqueueSnackbar(t.saveSuccess, { variant: 'success' });
        setIsEditing(false);
        refetch();
      }
    } catch (error) {
      console.error('Update error:', error);
      enqueueSnackbar(t.saveError, { variant: 'error' });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight={700}>
            {t.myProfile}
          </Typography>
          {!isEditing ? (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
            >
              {t.editProfile}
            </Button>
          ) : (
            <Box>
              <Button onClick={() => setIsEditing(false)} sx={{ mr: 1 }}>
                {t.cancel}
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={isUpdating}
              >
                {isUpdating ? t.saving : t.save}
              </Button>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
          <Avatar
            src={formData.avatar || undefined}
            sx={{
              width: 120,
              height: 120,
              bgcolor: 'primary.main',
              fontSize: 48,
              mb: 2,
            }}
          >
            {!formData.avatar && getInitials(formData.name)}
          </Avatar>
          
          {isEditing && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<PhotoCameraIcon />}
              sx={{ mt: 1 }}
            >
              {t.uploadImage}
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t.name}
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              variant={isEditing ? 'outlined' : 'filled'}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t.email}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              variant={isEditing ? 'outlined' : 'filled'}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t.role}
              value={user?.role === 'ADMIN' ? t.ADMIN : user?.role === 'EDITOR' ? t.EDITOR : t.VIEWER}
              disabled
              variant="filled"
              helperText={t.roleHelper || 'Le rôle ne peut pas être modifié'}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t.memberSince}
              value={profileData?.user?.createdAt ? new Date(profileData.user.createdAt).toLocaleDateString('fr-FR') : '-'}
              disabled
              variant="filled"
            />
          </Grid>
        </Grid>

        {!isEditing && (
          <Alert severity="info" sx={{ mt: 4 }}>
            <Typography variant="body2">
              💡 {t.editProfileInfo || 'Cliquez sur "Modifier" pour changer vos informations personnelles.'}
            </Typography>
          </Alert>
        )}
      </Paper>

      {/* Section sécurité */}
      <Paper sx={{ p: 4, borderRadius: 3, mt: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          {t.security}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Button
          variant="outlined"
          color="primary"
          onClick={() => alert(t.comingSoon)}
        >
          {t.changePassword}
        </Button>
        
        <Button
          variant="outlined"
          color="error"
          sx={{ ml: 2 }}
          onClick={() => alert(t.comingSoon)}
        >
          {t.twoFactorAuth}
        </Button>
      </Paper>
    </Container>
  );
};

export default Profile;