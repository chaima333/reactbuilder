import React, {
  useEffect,
  useState
} from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography
} from "@mui/material";

import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon
} from "@mui/icons-material";

import {
  useDispatch,
  useSelector
} from "react-redux";

import {
  useSnackbar
} from "notistack";

import {
  RootState
} from "../../../redux/store";

import {
  setCredentials
} from "../../../modules/auth/services/authSlice";

import {
  useGetProfileQuery,
  useUpdateProfileMutation
} from "../../../redux/services/users.api";

import {
  useLanguage
} from "../../../app/providers/LanguageProvider";

type ProfileUser = {
  id?: number;
  name?: string;
  email?: string;
  avatar?: string;
  role?: "ADMIN" | "EDITOR" | "VIEWER";
  createdAt?: string;
};

const extractProfileUser = (
  payload: any
): ProfileUser | null => {
  if (!payload) {
    return null;
  }

  return (
    payload.user ||
    payload.User ||
    payload.data?.user ||
    payload.data?.User ||
    payload.data ||
    payload
  );
};

export const Profile:
  React.FC = () => {
  const {
    t
  } = useLanguage();

  const dispatch =
    useDispatch();

  const {
    enqueueSnackbar
  } = useSnackbar();

  const user =
    useSelector(
      (state: RootState) =>
        state.auth.user
    );

  const [
    isEditing,
    setIsEditing
  ] = useState(false);

  const [
    formData,
    setFormData
  ] = useState({
    name: "",
    email: "",
    avatar: ""
  });

  const {
    data: profileData,
    isLoading,
    refetch
  } = useGetProfileQuery(
    undefined
  );

  const [
    updateProfile,
    {
      isLoading:
        isUpdating
    }
  ] =
    useUpdateProfileMutation();

  const profileUser =
    extractProfileUser(
      profileData
    ) ||
    (user as ProfileUser | null);

  useEffect(() => {
    if (!profileUser) {
      return;
    }

    setFormData({
      name:
        profileUser.name || "",

      email:
        profileUser.email || "",

      avatar:
        profileUser.avatar || ""
    });
  }, [
    profileData,
    user
  ]);

  const handleChange = (
    event:
      React.ChangeEvent<HTMLInputElement>
  ) => {
    const {
      name,
      value
    } = event.target;

    setFormData(
      previous => ({
        ...previous,
        [name]: value
      })
    );
  };

  const handleEdit = () => {
    if (profileUser) {
      setFormData({
        name:
          profileUser.name || "",

        email:
          profileUser.email || "",

        avatar:
          profileUser.avatar || ""
      });
    }

    setIsEditing(true);
  };

  const handleCancel = () => {
    if (profileUser) {
      setFormData({
        name:
          profileUser.name || "",

        email:
          profileUser.email || "",

        avatar:
          profileUser.avatar || ""
      });
    }

    setIsEditing(false);
  };

  const handleSave =
    async () => {
      try {
        const response =
          await updateProfile({
            name:
              formData.name.trim(),

            email:
              formData.email.trim(),

            avatar:
              formData.avatar
          }).unwrap();

        const updatedUser =
          extractProfileUser(
            response
          );

        if (!updatedUser) {
          throw new Error(
            "PROFILE_UPDATE_RESPONSE_INVALID"
          );
        }

        dispatch(
          setCredentials({
            user:
              updatedUser as any,

            accessToken:
              localStorage.getItem(
                "accessToken"
              ) || "",

            refreshToken:
              localStorage.getItem(
                "refreshToken"
              ) || ""
          })
        );

        enqueueSnackbar(
          t.saveSuccess ||
            "Profil mis à jour avec succès.",
          {
            variant:
              "success"
          }
        );

        setIsEditing(false);

        await refetch();
      } catch (error) {
        console.error(
          "Update profile error:",
          error
        );

        enqueueSnackbar(
          t.saveError ||
            "Erreur lors de la mise à jour du profil.",
          {
            variant:
              "error"
          }
        );
      }
    };

  const getInitials = (
    name: string
  ) => {
    if (!name.trim()) {
      return "?";
    }

    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(
        word =>
          word[0] || ""
      )
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const role =
    profileUser?.role ||
    user?.role;

  const roleLabel =
    role === "ADMIN"
      ? t.ADMIN
      : role === "EDITOR"
        ? t.EDITOR
        : t.VIEWER;

  const memberSince =
    profileUser?.createdAt
      ? new Date(
          profileUser.createdAt
        ).toLocaleDateString(
          "fr-FR"
        )
      : "-";

  const canSave =
    Boolean(
      formData.name.trim() &&
      formData.email.trim()
    );

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container
      maxWidth="md"
      sx={{
        py: 4
      }}
    >
      <Paper
        sx={{
          p: 4,
          borderRadius: 3
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap={2}
          mb={3}
        >
          <Typography
            variant="h4"
            fontWeight={700}
          >
            {t.myProfile}
          </Typography>

          {!isEditing ? (
            <Button
              variant="outlined"
              startIcon={
                <EditIcon />
              }
              onClick={
                handleEdit
              }
            >
              {t.editProfile}
            </Button>
          ) : (
            <Box
              display="flex"
              gap={1}
            >
              <Button
                onClick={
                  handleCancel
                }
                disabled={
                  isUpdating
                }
              >
                {t.cancel}
              </Button>

              <Button
                variant="contained"
                startIcon={
                  <SaveIcon />
                }
                onClick={
                  handleSave
                }
                disabled={
                  isUpdating ||
                  !canSave
                }
              >
                {isUpdating
                  ? t.saving
                  : t.save}
              </Button>
            </Box>
          )}
        </Box>

        <Divider
          sx={{
            mb: 4
          }}
        />

        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          mb={4}
        >
          <Avatar
            src={
              formData.avatar ||
              undefined
            }
            sx={{
              width: 120,
              height: 120,
              bgcolor:
                "primary.main",
              fontSize: 48,
              mb: 2
            }}
          >
            {!formData.avatar &&
              getInitials(
                formData.name
              )}
          </Avatar>

          {isEditing && (
            <Button
              variant="outlined"
              size="small"
              startIcon={
                <PhotoCameraIcon />
              }
              sx={{
                mt: 1
              }}
            >
              {t.uploadImage}
            </Button>
          )}
        </Box>

        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            xs={12}
          >
            <TextField
              fullWidth
              label={t.name}
              name="name"
              value={
                formData.name
              }
              onChange={
                handleChange
              }
              disabled={
                !isEditing
              }
              variant={
                isEditing
                  ? "outlined"
                  : "filled"
              }
            />
          </Grid>

          <Grid
            item
            xs={12}
          >
            <TextField
              fullWidth
              label={t.email}
              name="email"
              type="email"
              value={
                formData.email
              }
              onChange={
                handleChange
              }
              disabled={
                !isEditing
              }
              variant={
                isEditing
                  ? "outlined"
                  : "filled"
              }
            />
          </Grid>

          <Grid
            item
            xs={12}
          >
            <TextField
              fullWidth
              label={t.role}
              value={
                roleLabel || ""
              }
              disabled
              variant="filled"
              helperText={
                t.roleHelper ||
                "Le rôle ne peut pas être modifié"
              }
            />
          </Grid>

          <Grid
            item
            xs={12}
          >
            <TextField
              fullWidth
              label={
                t.memberSince
              }
              value={
                memberSince
              }
              disabled
              variant="filled"
            />
          </Grid>
        </Grid>

        {!isEditing && (
          <Alert
            severity="info"
            sx={{
              mt: 4
            }}
          >
            <Typography
              variant="body2"
            >
              💡{" "}
              {t.editProfileInfo ||
                'Cliquez sur "Modifier" pour changer vos informations personnelles.'}
            </Typography>
          </Alert>
        )}
      </Paper>

      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          mt: 3
        }}
      >
        <Typography
          variant="h5"
          fontWeight={600}
          gutterBottom
        >
          {t.security}
        </Typography>

        <Divider
          sx={{
            mb: 3
          }}
        />

        <Button
          variant="outlined"
          color="primary"
          onClick={() =>
            alert(
              t.comingSoon
            )
          }
        >
          {t.changePassword}
        </Button>

        <Button
          variant="outlined"
          color="error"
          sx={{
            ml: 2
          }}
          onClick={() =>
            alert(
              t.comingSoon
            )
          }
        >
          {t.twoFactorAuth}
        </Button>
      </Paper>
    </Container>
  );
};

export default Profile;