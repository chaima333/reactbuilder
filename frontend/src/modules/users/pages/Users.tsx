import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import {
  Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  CheckCircle as CheckIcon,
  Delete as DeleteIcon,
  DoDisturbOn as RejectIcon,
  Edit as EditIcon,
  EditNote as EditorIcon,
  Visibility as ViewerIcon
} from "@mui/icons-material";
import { useSnackbar } from "notistack";

import {
  useApproveUserMutation,
  useGetPendingUsersQuery,
  useRejectUserMutation
} from "../../../redux/services/admin.api";

import {
  useChangeUserRoleMutation,
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation
} from "../../../redux/services/users.api";

type PlatformRole =
  | "ADMIN"
  | "EDITOR"
  | "VIEWER";

type UserFormData = {
  name: string;
  email: string;
  password: string;
  role: PlatformRole;
};

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: PlatformRole;
  createdAt?: string;
  isApproved?: boolean;
  siteCount?: number;
};

const roleColors: Record<
  PlatformRole,
  "error" | "warning" | "info"
> = {
  ADMIN: "error",
  EDITOR: "warning",
  VIEWER: "info"
};

const roleIcons: Record<
  PlatformRole,
  React.ReactElement
> = {
  ADMIN: <AdminIcon fontSize="small" />,
  EDITOR: <EditorIcon fontSize="small" />,
  VIEWER: <ViewerIcon fontSize="small" />
};

const roleLabels: Record<
  PlatformRole,
  string
> = {
  ADMIN: "Administrateur",
  EDITOR: "Editeur",
  VIEWER: "Viewer"
};

const emptyForm: UserFormData = {
  name: "",
  email: "",
  password: "",
  role: "VIEWER"
};

const getApiErrorMessage = (
  error: any,
  fallback: string
) =>
  error?.data?.message ||
  error?.error ||
  error?.message ||
  fallback;

export const Users: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: users = [],
    isLoading: usersLoading
  } = useGetUsersQuery();

  const {
    data: pendingUsers = [],
    isLoading: pendingLoading
  } = useGetPendingUsersQuery();

  const [
    createUser,
    { isLoading: isCreating }
  ] = useCreateUserMutation();

  const [
    updateUser,
    { isLoading: isUpdating }
  ] = useUpdateUserMutation();

  const [
    deleteUser,
    { isLoading: isDeleting }
  ] = useDeleteUserMutation();

  const [
    changeRole,
    { isLoading: isChangingRole }
  ] = useChangeUserRoleMutation();

  const [
    approveUser,
    { isLoading: isApproving }
  ] = useApproveUserMutation();

  const [
    rejectUser,
    { isLoading: isRejecting }
  ] = useRejectUserMutation();

  const [
    dialogOpen,
    setDialogOpen
  ] = useState(false);

  const [
    editingUser,
    setEditingUser
  ] = useState<AdminUser | null>(null);

  const [
    formData,
    setFormData
  ] = useState<UserFormData>(emptyForm);

  const [
    dialogError,
    setDialogError
  ] = useState<string | null>(null);

  const activeUsers = useMemo(
    () =>
      (users as AdminUser[]).filter(
        (user) => user.isApproved !== false
      ),
    [users]
  );

  const isSaving =
    isCreating || isUpdating;

  const handleOpenDialog = (
    user?: AdminUser
  ) => {
    setDialogError(null);

    if (user) {
      setEditingUser(user);

      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role || "VIEWER"
      });
    } else {
      setEditingUser(null);
      setFormData(emptyForm);
    }

    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (isSaving) {
      return;
    }

    setDialogOpen(false);
    setEditingUser(null);
    setDialogError(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async () => {
    setDialogError(null);

    const payload = {
      name: formData.name.trim(),
      email: formData.email
        .trim()
        .toLowerCase(),
      role: formData.role,
      ...(formData.password
        ? {
            password: formData.password
          }
        : {})
    };

    try {
      if (editingUser) {
        await updateUser({
          id: editingUser.id,
          data: payload
        }).unwrap();

        enqueueSnackbar(
          "Utilisateur mis a jour",
          {
            variant: "success"
          }
        );
      } else {
        await createUser({
          ...payload,
          password: formData.password
        }).unwrap();

        enqueueSnackbar(
          "Utilisateur cree",
          {
            variant: "success"
          }
        );
      }

      handleCloseDialog();
    } catch (error: any) {
      setDialogError(
        getApiErrorMessage(
          error,
          "Impossible d'enregistrer l'utilisateur"
        )
      );
    }
  };

  const handleApprove = async (
    userId: number
  ) => {
    try {
      await approveUser(userId).unwrap();

      enqueueSnackbar(
        "Utilisateur approuve avec succes",
        {
          variant: "success"
        }
      );
    } catch (error: any) {
      enqueueSnackbar(
        getApiErrorMessage(
          error,
          "Erreur lors de l'approbation"
        ),
        {
          variant: "error"
        }
      );
    }
  };

  const handleReject = async (
    userId: number
  ) => {
    try {
      await rejectUser(userId).unwrap();

      enqueueSnackbar(
        "Utilisateur refuse et supprime",
        {
          variant: "success"
        }
      );
    } catch (error: any) {
      enqueueSnackbar(
        getApiErrorMessage(
          error,
          "Erreur lors du refus"
        ),
        {
          variant: "error"
        }
      );
    }
  };

  const handleDelete = async (
    id: number,
    name: string
  ) => {
    if (
      !window.confirm(
        `Supprimer definitivement l'utilisateur "${name}" ?`
      )
    ) {
      return;
    }

    try {
      await deleteUser(id).unwrap();

      enqueueSnackbar(
        "Utilisateur supprime",
        {
          variant: "success"
        }
      );
    } catch (error: any) {
      enqueueSnackbar(
        getApiErrorMessage(
          error,
          "Erreur lors de la suppression"
        ),
        {
          variant: "error"
        }
      );
    }
  };

  const handleChangeRole = async (
    id: number,
    currentRole: PlatformRole
  ) => {
    const roles: PlatformRole[] = [
      "ADMIN",
      "EDITOR",
      "VIEWER"
    ];

    const currentIndex =
      roles.indexOf(currentRole);

    const nextRole =
      roles[
        (currentIndex + 1) %
          roles.length
      ];

    try {
      await changeRole({
        id,
        role: nextRole
      }).unwrap();

      enqueueSnackbar(
        `Role change en ${roleLabels[nextRole]}`,
        {
          variant: "success"
        }
      );
    } catch (error: any) {
      enqueueSnackbar(
        getApiErrorMessage(
          error,
          "Erreur lors du changement de role"
        ),
        {
          variant: "error"
        }
      );
    }
  };

  if (
    usersLoading ||
    pendingLoading
  ) {
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
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4">
          Gestion des Utilisateurs
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() =>
            handleOpenDialog()
          }
        >
          Ajouter un utilisateur
        </Button>
      </Box>

      {pendingUsers.length > 0 && (
        <Paper
          sx={{
            p: 2,
            mb: 4,
            bgcolor: "#fff8e1",
            border:
              "1px solid #ffcc02"
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#ed6c02",
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2
            }}
          >
            <CheckIcon />
            Demandes en attente (
            {pendingUsers.length})
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Nom</strong>
                  </TableCell>

                  <TableCell>
                    <strong>Email</strong>
                  </TableCell>

                  <TableCell>
                    <strong>Date</strong>
                  </TableCell>

                  <TableCell align="right">
                    <strong>
                      Actions
                    </strong>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {(pendingUsers as AdminUser[]).map(
                  (user) => (
                    <TableRow
                      key={user.id}
                    >
                      <TableCell>
                        {user.name}
                      </TableCell>

                      <TableCell>
                        {user.email}
                      </TableCell>

                      <TableCell>
                        {user.createdAt
                          ? new Date(
                              user.createdAt
                            ).toLocaleDateString(
                              "fr-FR"
                            )
                          : "-"}
                      </TableCell>

                      <TableCell align="right">
                        <Box
                          display="flex"
                          justifyContent="flex-end"
                          gap={1}
                        >
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={
                              <CheckIcon />
                            }
                            disabled={
                              isApproving ||
                              isRejecting
                            }
                            onClick={() =>
                              handleApprove(
                                user.id
                              )
                            }
                          >
                            Approuver
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={
                              <RejectIcon />
                            }
                            disabled={
                              isApproving ||
                              isRejecting
                            }
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Refuser l'acces a ${user.name} ?`
                                )
                              ) {
                                handleReject(
                                  user.id
                                );
                              }
                            }}
                          >
                            Refuser
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Typography
        variant="h5"
        gutterBottom
        sx={{
          mt: 2
        }}
      >
        Utilisateurs actifs
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: "primary.main"
              }}
            >
              <TableCell
                sx={{
                  color: "white",
                  fontWeight: "bold"
                }}
              >
                Nom
              </TableCell>

              <TableCell
                sx={{
                  color: "white",
                  fontWeight: "bold"
                }}
              >
                Email
              </TableCell>

              <TableCell
                sx={{
                  color: "white",
                  fontWeight: "bold"
                }}
              >
                Role
              </TableCell>

              <TableCell
                sx={{
                  color: "white",
                  fontWeight: "bold"
                }}
                align="center"
              >
                Sites
              </TableCell>

              <TableCell
                sx={{
                  color: "white",
                  fontWeight: "bold"
                }}
              >
                Inscription
              </TableCell>

              <TableCell
                sx={{
                  color: "white",
                  fontWeight: "bold"
                }}
                align="center"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {activeUsers.map((user) => {
              const siteCount =
                Number(user.siteCount) || 0;

              return (
                <TableRow
                  key={user.id}
                  hover
                >
                  <TableCell
                    sx={{
                      fontWeight: 500
                    }}
                  >
                    {user.name}
                  </TableCell>

                  <TableCell>
                    {user.email}
                  </TableCell>

                  <TableCell>
                    <Chip
                      icon={
                        roleIcons[user.role]
                      }
                      label={
                        roleLabels[
                          user.role
                        ]
                      }
                      color={
                        roleColors[
                          user.role
                        ]
                      }
                      size="small"
                      onClick={() =>
                        handleChangeRole(
                          user.id,
                          user.role
                        )
                      }
                      disabled={
                        isChangingRole
                      }
                      sx={{
                        cursor: "pointer",
                        fontWeight: "bold"
                      }}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={siteCount}
                      size="small"
                      variant="outlined"
                      color={
                        siteCount > 0
                          ? "secondary"
                          : "default"
                      }
                      sx={{
                        minWidth: 40,
                        fontWeight: "bold"
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    {user.createdAt
                      ? new Date(
                          user.createdAt
                        ).toLocaleDateString(
                          "fr-FR"
                        )
                      : "-"}
                  </TableCell>

                  <TableCell align="center">
                    <Box
                      display="flex"
                      justifyContent="center"
                    >
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() =>
                          handleOpenDialog(
                            user
                          )
                        }
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        color="error"
                        disabled={
                          isDeleting
                        }
                        onClick={() =>
                          handleDelete(
                            user.id,
                            user.name
                          )
                        }
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white"
          }}
        >
          {editingUser
            ? "Modifier l'utilisateur"
            : "Nouvel utilisateur"}
        </DialogTitle>

        <DialogContent dividers>
          {dialogError && (
            <Alert
              severity="error"
              sx={{
                mb: 2
              }}
            >
              {dialogError}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Nom"
            margin="normal"
            value={formData.name}
            onChange={(event) =>
              setFormData({
                ...formData,
                name: event.target.value
              })
            }
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={formData.email}
            onChange={(event) =>
              setFormData({
                ...formData,
                email: event.target.value
              })
            }
          />

          {!editingUser && (
            <TextField
              fullWidth
              margin="normal"
              label="Mot de passe"
              type="password"
              value={formData.password}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  password:
                    event.target.value
                })
              }
            />
          )}

          <TextField
            fullWidth
            select
            label="Role"
            margin="normal"
            value={formData.role}
            onChange={(event) =>
              setFormData({
                ...formData,
                role: event.target
                  .value as PlatformRole
              })
            }
          >
            <MenuItem value="ADMIN">
              Administrateur
            </MenuItem>

            <MenuItem value="EDITOR">
              Editeur
            </MenuItem>

            <MenuItem value="VIEWER">
              Viewer
            </MenuItem>
          </TextField>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2
          }}
        >
          <Button
            onClick={handleCloseDialog}
            color="inherit"
            disabled={isSaving}
          >
            Annuler
          </Button>

          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSaving}
          >
            {isSaving ? (
              <CircularProgress
                size={24}
              />
            ) : (
              "Enregistrer"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;