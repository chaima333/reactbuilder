import React, {
  useMemo,
  useState
} from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  GroupAdd as GroupAddIcon,
} from "@mui/icons-material";

import {
  useNavigate,
  useParams
} from "react-router-dom";

import {
  useSnackbar
} from "notistack";

import {
  useGetSiteAccessQuery
} from "../../../redux/services/sites.api";

import {
  AssignableSiteMemberRole,
  SiteMember,
  useAddSiteMemberMutation,
  useGetSiteMembersQuery,
  useRemoveSiteMemberMutation,
  useUpdateSiteMemberRoleMutation,
} from "../../../redux/services/siteMembers.api";

import {
  getApiErrorMessage
} from "../../../redux/api/errorMessages";

const OWNER_ROLES: AssignableSiteMemberRole[] = [
  "ADMIN",
  "EDITOR",
  "VIEWER"
];

const ADMIN_ROLES: AssignableSiteMemberRole[] = [
  "EDITOR",
  "VIEWER"
];

const getUserId = (
  member: SiteMember
) =>
  member.userId ||
  member.user?.id;

const getUserName = (
  member: SiteMember
) =>
  member.user?.name ||
  `User #${getUserId(member)}`;

const getUserEmail = (
  member: SiteMember
) =>
  member.user?.email ||
  "-";

const getInitial = (
  name: string
) =>
  name?.trim()?.[0]?.toUpperCase() ||
  "?";

const getRoleColor = (
  role: string
) => {
  switch (role) {
    case "OWNER":
      return "success";

    case "ADMIN":
      return "primary";

    case "EDITOR":
      return "warning";

    case "VIEWER":
    default:
      return "default";
  }
};

export const SiteMembersPage: React.FC = () => {
  const {
    siteId
  } = useParams();

  const navigate =
    useNavigate();

  const {
    enqueueSnackbar
  } = useSnackbar();

  const siteIdNumber =
    Number(siteId);

  const invalidSiteId =
    !siteId ||
    Number.isNaN(siteIdNumber);

  const {
    data: siteAccess,
    isLoading: accessLoading,
    isFetching: accessFetching,
  } = useGetSiteAccessQuery(
    siteIdNumber,
    {
      skip: invalidSiteId,
      refetchOnMountOrArgChange: true,
    }
  );

  const {
    data: members = [],
    isLoading: membersLoading,
    isFetching: membersFetching,
  } = useGetSiteMembersQuery(
    siteIdNumber,
    {
      skip: invalidSiteId,
      refetchOnMountOrArgChange: true,
    }
  );

  const [
    addSiteMember,
    {
      isLoading: isAdding
    }
  ] = useAddSiteMemberMutation();

  const [
    updateSiteMemberRole,
    {
      isLoading: isUpdating
    }
  ] = useUpdateSiteMemberRoleMutation();

  const [
    removeSiteMember,
    {
      isLoading: isRemoving
    }
  ] = useRemoveSiteMemberMutation();

  const [email, setEmail] =
    useState("");

  const [role, setRole] =
    useState<AssignableSiteMemberRole>(
      "EDITOR"
    );

  const siteRole =
    siteAccess?.role || "VIEWER";

  const canAddMember =
    siteRole === "OWNER" ||
    siteRole === "ADMIN";

  const canUpdateRole =
    siteRole === "OWNER";

  const canRemoveMember =
    siteRole === "OWNER";

  const assignableRoles =
    useMemo(
      () =>
        siteRole === "OWNER"
          ? OWNER_ROLES
          : siteRole === "ADMIN"
            ? ADMIN_ROLES
            : [],
      [
        siteRole
      ]
    );

  const isBusy =
    isAdding ||
    isUpdating ||
    isRemoving;

  const isLoading =
    accessLoading ||
    accessFetching ||
    membersLoading ||
    membersFetching;

  const handleAddMember = async () => {
    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      enqueueSnackbar(
        "Email obligatoire",
        {
          variant: "warning"
        }
      );

      return;
    }

    try {
      await addSiteMember({
        siteId: siteIdNumber,
        email: cleanEmail,
        role
      }).unwrap();

      enqueueSnackbar(
        "Membre ajouté avec succès",
        {
          variant: "success"
        }
      );

      setEmail("");

      if (
        assignableRoles.includes("EDITOR")
      ) {
        setRole("EDITOR");
      }

    } catch (err: any) {
      enqueueSnackbar(
        getApiErrorMessage(err),
        {
          variant: "error"
        }
      );
    }
  };

  const handleUpdateRole = async (
    member: SiteMember,
    nextRole: AssignableSiteMemberRole
  ) => {
    const userId =
      getUserId(member);

    if (!userId) {
      return;
    }

    try {
      await updateSiteMemberRole({
        siteId: siteIdNumber,
        userId,
        role: nextRole
      }).unwrap();

      enqueueSnackbar(
        "Rôle modifié avec succès",
        {
          variant: "success"
        }
      );

    } catch (err: any) {
      enqueueSnackbar(
        getApiErrorMessage(err),
        {
          variant: "error"
        }
      );
    }
  };

  const handleRemoveMember = async (
    member: SiteMember
  ) => {
    const userId =
      getUserId(member);

    if (!userId) {
      return;
    }

    const ok =
      window.confirm(
        `Supprimer ${getUserName(member)} de ce site ?`
      );

    if (!ok) {
      return;
    }

    try {
      await removeSiteMember({
        siteId: siteIdNumber,
        userId
      }).unwrap();

      enqueueSnackbar(
        "Membre supprimé avec succès",
        {
          variant: "success"
        }
      );

    } catch (err: any) {
      enqueueSnackbar(
        getApiErrorMessage(err),
        {
          variant: "error"
        }
      );
    }
  };

  if (invalidSiteId) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Site invalide.
        </Alert>
      </Box>
    );
  }

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
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
        >
          <IconButton
            onClick={() =>
              navigate("/sites")
            }
          >
            <ArrowBackIcon />
          </IconButton>

          <Box>
            <Typography variant="h4">
              Membres du site
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Gérez les accès et les rôles pour ce site.
            </Typography>
          </Box>
        </Stack>

        <Chip
          label={`Votre rôle: ${siteRole}`}
          color={
            getRoleColor(siteRole) as any
          }
          variant="outlined"
        />
      </Stack>

      {!canAddMember && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
        >
          Vous avez un accès en lecture seule aux membres.
        </Alert>
      )}

      {canAddMember && (
        <Paper
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3
          }}
        >
          <Stack
            direction={{
              xs: "column",
              md: "row"
            }}
            spacing={2}
            alignItems={{
              xs: "stretch",
              md: "center"
            }}
          >
            <TextField
              label="Email utilisateur"
              placeholder="exemple@email.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              fullWidth
            />

            <FormControl
              sx={{
                minWidth: 180
              }}
            >
              <InputLabel>
                Rôle
              </InputLabel>

              <Select
                label="Rôle"
                value={role}
                onChange={(e) =>
                  setRole(
                    e.target.value as AssignableSiteMemberRole
                  )
                }
              >
                {assignableRoles.map(
                  (item) => (
                    <MenuItem
                      key={item}
                      value={item}
                    >
                      {item}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<GroupAddIcon />}
              onClick={handleAddMember}
              disabled={
                isBusy ||
                !email.trim()
              }
              sx={{
                minWidth: 160
              }}
            >
              Ajouter
            </Button>
          </Stack>

          {siteRole === "ADMIN" && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mt: 1
              }}
            >
              Un ADMIN peut ajouter uniquement EDITOR ou VIEWER.
            </Typography>
          )}
        </Paper>
      )}

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                Utilisateur
              </TableCell>

              <TableCell>
                Email
              </TableCell>

              <TableCell>
                Rôle site
              </TableCell>

              <TableCell>
                Rôle global
              </TableCell>

              <TableCell>
                Statut
              </TableCell>

              <TableCell align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {members.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                >
                  Aucun membre trouvé.
                </TableCell>
              </TableRow>
            )}

            {members.map(
              (member) => {
                const userId =
                  getUserId(member);

                const name =
                  getUserName(member);

                const isOwner =
                  member.role === "OWNER";

                return (
                  <TableRow
                    key={`${member.siteId}-${userId}`}
                  >
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                      >
                        <Avatar
                          src={
                            member.user?.avatar || undefined
                          }
                        >
                          {getInitial(name)}
                        </Avatar>

                        <Typography fontWeight={700}>
                          {name}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      {getUserEmail(member)}
                    </TableCell>

                    <TableCell>
                      {canUpdateRole && !isOwner ? (
                        <FormControl
                          size="small"
                          sx={{
                            minWidth: 140
                          }}
                        >
                          <Select
                            value={
                              member.role as AssignableSiteMemberRole
                            }
                            disabled={isBusy}
                            onChange={(e) =>
                              handleUpdateRole(
                                member,
                                e.target.value as AssignableSiteMemberRole
                              )
                            }
                          >
                            {OWNER_ROLES.map(
                              (item) => (
                                <MenuItem
                                  key={item}
                                  value={item}
                                >
                                  {item}
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </FormControl>
                      ) : (
                        <Chip
                          label={member.role}
                          size="small"
                          color={
                            getRoleColor(member.role) as any
                          }
                          variant="outlined"
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={
                          member.user?.role || "-"
                        }
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={
                          member.user?.isApproved
                            ? "Approuvé"
                            : "En attente"
                        }
                        color={
                          member.user?.isApproved
                            ? "success"
                            : "warning"
                        }
                        size="small"
                      />
                    </TableCell>

                    <TableCell align="right">
                      {canRemoveMember && !isOwner ? (
                        <IconButton
                          color="error"
                          disabled={isBusy}
                          onClick={() =>
                            handleRemoveMember(member)
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      ) : (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          -
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              }
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SiteMembersPage;