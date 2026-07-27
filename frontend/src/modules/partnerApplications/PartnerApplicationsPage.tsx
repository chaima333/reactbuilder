import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Fade,
  Zoom,
  Slide,
  alpha,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Tooltip,
  useTheme
} from "@mui/material";

import {
  Refresh,
  CheckCircle,
  Cancel,
  AccessTime,
  Business,
  Person,
  Email,
  Work,
  Visibility,
  Close,
  LocationOn,
  Phone
} from "@mui/icons-material";

import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import {
  useApprovePartnerApplicationMutation,
  useGetPartnerApplicationsQuery,
  useRejectPartnerApplicationMutation
} from "../../redux/services/partnerApplications.api";

const getStatusColor = (status: string): "default" | "warning" | "success" | "error" => {
  if (status === "APPROVED") return "success";
  if (status === "REJECTED") return "error";
  if (status === "PENDING") return "warning";
  return "default";
};

const getStatusLabel = (status: string) => {
  if (status === "APPROVED") return "Approuvée";
  if (status === "REJECTED") return "Rejetée";
  if (status === "PENDING") return "En attente";
  return status;
};

const getLevelColor = (level: string): "default" | "primary" | "secondary" | "success" | "warning" => {
  if (level === "PLATINUM") return "secondary";
  if (level === "GOLD") return "warning";
  if (level === "SILVER") return "primary";
  if (level === "BRONZE") return "success";
  return "default";
};

export const PartnerApplicationsPage = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const theme = useTheme();
  const numericSiteId = Number(siteId);

  const isDark = theme.palette.mode === 'dark';

  const [animate, setAnimate] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const {
    data: applications = [],
    isLoading,
    isError,
    refetch
  } = useGetPartnerApplicationsQuery(numericSiteId, {
    skip: !numericSiteId
  });

  const [approveApplication, { isLoading: isApproving }] =
    useApprovePartnerApplicationMutation();

  const [rejectApplication, { isLoading: isRejecting }] =
    useRejectPartnerApplicationMutation();

  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setAnimate(true);
    }
  }, [isLoading]);

  const handleApprove = async (applicationId: number) => {
    setActionLoading(applicationId);
    await approveApplication({
      siteId: numericSiteId,
      applicationId
    }).unwrap();
    setActionLoading(null);
    refetch();
  };

  const handleReject = async (applicationId: number) => {
    setActionLoading(applicationId);
    await rejectApplication({
      siteId: numericSiteId,
      applicationId
    }).unwrap();
    setActionLoading(null);
    refetch();
  };

  const handleViewDetails = (app: any) => {
    setSelectedApp(app);
    setDetailOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailOpen(false);
    setSelectedApp(null);
  };

  if (!numericSiteId) {
    return (
      <Box p={3}>
        <Typography color="error">Site invalide.</Typography>
      </Box>
    );
  }

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === "PENDING").length,
    approved: applications.filter(a => a.status === "APPROVED").length,
    rejected: applications.filter(a => a.status === "REJECTED").length
  };

  // Couleurs adaptées au thème
  const colors = {
    bg: isDark ? "#0d1117" : "#f8fafc",
    card: isDark ? "#161b22" : "#ffffff",
    cardHover: isDark ? "#1c2128" : "#f1f5f9",
    border: isDark ? "#30363d" : "#e2e8f0",
    text: isDark ? "#e6edf3" : "#1e293b",
    textSecondary: isDark ? "#8b949e" : "#64748b",
    success: isDark ? "#3fb950" : "#10b981",
    warning: isDark ? "#d2a8ff" : "#8b5cf6",
    error: isDark ? "#f85149" : "#ef4444",
    primary: isDark ? "#58a6ff" : "#6366f1",
    chipBg: isDark ? 'rgba(88, 166, 255, 0.06)' : 'rgba(99, 102, 241, 0.04)'
  };

  return (
    <Box sx={{ 
      p: 3, 
      bgcolor: colors.bg, 
      minHeight: "100vh",
      transition: 'background 0.3s ease'
    }}>
      {/* Header */}
      <Fade in timeout={500}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h5" fontWeight={700} color={colors.text}>
              Demandes partenaires
            </Typography>
            <Typography variant="body2" color={colors.textSecondary}>
              {stats.total} demande{stats.total > 1 ? 's' : ''} au total
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => refetch()}
            startIcon={<Refresh sx={{ fontSize: 18 }} />}
            size="small"
            sx={{ 
              borderRadius: 1.5, 
              textTransform: 'none',
              color: colors.text,
              borderColor: colors.border,
              fontSize: '0.8rem',
              px: 2.5,
              '&:hover': {
                borderColor: colors.primary,
                color: colors.primary,
                bgcolor: isDark ? 'rgba(88, 166, 255, 0.05)' : 'rgba(99, 102, 241, 0.04)'
              }
            }}
          >
            Actualiser
          </Button>
        </Stack>
      </Fade>

      {/* Stats Cards */}
      <Slide direction="down" in={animate} timeout={600}>
        <Stack direction="row" spacing={2} mb={4}>
          <Paper sx={{ 
            px: 3, py: 1.5, flex: 1, 
            borderRadius: 1.5, 
            bgcolor: colors.card,
            border: `1px solid ${colors.border}`,
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}>
            <Typography variant="caption" color={colors.textSecondary} fontSize="0.7rem">Total</Typography>
            <Typography variant="h5" fontWeight={700} color={colors.text}>{stats.total}</Typography>
          </Paper>
          <Paper sx={{ 
            px: 3, py: 1.5, flex: 1, 
            borderRadius: 1.5, 
            bgcolor: colors.card,
            border: `1px solid ${colors.border}`,
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}>
            <Typography variant="caption" color={colors.warning} fontSize="0.7rem">En attente</Typography>
            <Typography variant="h5" fontWeight={700} color={colors.warning}>{stats.pending}</Typography>
          </Paper>
          <Paper sx={{ 
            px: 3, py: 1.5, flex: 1, 
            borderRadius: 1.5, 
            bgcolor: colors.card,
            border: `1px solid ${colors.border}`,
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}>
            <Typography variant="caption" color={colors.success} fontSize="0.7rem">Approuvées</Typography>
            <Typography variant="h5" fontWeight={700} color={colors.success}>{stats.approved}</Typography>
          </Paper>
          <Paper sx={{ 
            px: 3, py: 1.5, flex: 1, 
            borderRadius: 1.5, 
            bgcolor: colors.card,
            border: `1px solid ${colors.border}`,
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}>
            <Typography variant="caption" color={colors.error} fontSize="0.7rem">Rejetées</Typography>
            <Typography variant="h5" fontWeight={700} color={colors.error}>{stats.rejected}</Typography>
          </Paper>
        </Stack>
      </Slide>

      {/* Loading */}
      {isLoading && (
        <Stack alignItems="center" py={6}>
          <CircularProgress size={36} sx={{ color: colors.primary }} />
          <Typography color={colors.textSecondary} mt={1} fontSize={13}>
            Chargement...
          </Typography>
        </Stack>
      )}

      {/* Error */}
      {isError && (
        <Paper sx={{ p: 3, borderRadius: 1.5, bgcolor: colors.card, border: `1px solid ${colors.border}` }}>
          <Typography color={colors.error} fontSize={14}>Erreur de chargement.</Typography>
        </Paper>
      )}

      {/* Empty */}
      {!isLoading && !isError && applications.length === 0 && (
        <Fade in timeout={800}>
          <Paper sx={{ 
            p: 5, textAlign: 'center', 
            borderRadius: 1.5, 
            bgcolor: colors.card,
            border: `1px solid ${colors.border}`
          }}>
            <Typography fontSize={40} mb={1}>📋</Typography>
            <Typography variant="h6" fontWeight={600} color={colors.text}>
              Aucune demande
            </Typography>
            <Typography color={colors.textSecondary} fontSize={13}>
              Aucune demande partenaire pour le moment.
            </Typography>
          </Paper>
        </Fade>
      )}

      {/* Table */}
      {!isLoading && !isError && applications.length > 0 && (
        <Zoom in timeout={400}>
          <Paper sx={{ 
            borderRadius: 1.5, 
            overflow: "hidden", 
            bgcolor: colors.card,
            border: `1px solid ${colors.border}`,
            transition: 'all 0.3s ease'
          }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: isDark ? '#0d1117' : '#f8fafc' }}>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    fontSize: 12, 
                    color: colors.textSecondary,
                    borderBottom: `1px solid ${colors.border}`,
                    py: 1.5
                  }}>
                    Entreprise
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    fontSize: 12, 
                    color: colors.textSecondary,
                    borderBottom: `1px solid ${colors.border}`,
                    py: 1.5
                  }}>
                    Représentant
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    fontSize: 12, 
                    color: colors.textSecondary,
                    borderBottom: `1px solid ${colors.border}`,
                    py: 1.5
                  }}>
                    Contact
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    fontSize: 12, 
                    color: colors.textSecondary,
                    borderBottom: `1px solid ${colors.border}`,
                    py: 1.5
                  }}>
                    Secteurs
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    fontSize: 12, 
                    color: colors.textSecondary,
                    borderBottom: `1px solid ${colors.border}`,
                    py: 1.5
                  }}>Exp.</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    fontSize: 12, 
                    color: colors.textSecondary,
                    borderBottom: `1px solid ${colors.border}`,
                    py: 1.5
                  }}>Niveau</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    fontSize: 12, 
                    color: colors.textSecondary,
                    borderBottom: `1px solid ${colors.border}`,
                    py: 1.5
                  }}>Statut</TableCell>
                  <TableCell align="right" sx={{ 
                    fontWeight: 600, 
                    fontSize: 12, 
                    color: colors.textSecondary,
                    borderBottom: `1px solid ${colors.border}`,
                    py: 1.5
                  }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {applications.map((application, index) => (
                  <TableRow
                    key={application.id}
                    sx={{
                      borderBottom: `1px solid ${colors.border}`,
                      transition: 'all 0.15s ease',
                      animation: `fadeInRow 0.25s ease ${index * 0.04}s both`,
                      '@keyframes fadeInRow': {
                        from: { opacity: 0, transform: 'translateY(6px)' },
                        to: { opacity: 1, transform: 'translateY(0)' }
                      },
                      '&:hover': {
                        bgcolor: colors.cardHover
                      },
                      '&:last-child td': {
                        borderBottom: 'none'
                      }
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight={600} fontSize={13} color={colors.text}>
                        {application.companyName}
                      </Typography>
                      <Typography variant="caption" color={colors.textSecondary} fontSize={11}>
                        {application.city}, {application.country}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontSize={13} color={colors.text}>
                        {application.representativeFullName}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontSize={12} color={colors.text}>
                        {application.professionalEmail}
                      </Typography>
                      {application.phone && (
                        <Typography variant="caption" color={colors.textSecondary} fontSize={11}>
                          {application.phone}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                        {application.expertiseSectors.slice(0, 2).map((sector) => (
                          <Chip
                            key={sector}
                            label={sector}
                            size="small"
                            sx={{ 
                              height: 20, 
                              fontSize: '0.65rem', 
                              bgcolor: colors.chipBg,
                              color: colors.text,
                              border: `1px solid ${colors.border}`,
                              borderRadius: 1
                            }}
                          />
                        ))}
                        {application.expertiseSectors.length > 2 && (
                          <Chip
                            label={`+${application.expertiseSectors.length - 2}`}
                            size="small"
                            sx={{ 
                              height: 20, 
                              fontSize: '0.65rem',
                              bgcolor: colors.cardHover,
                              color: colors.textSecondary,
                              border: `1px solid ${colors.border}`,
                              borderRadius: 1
                            }}
                          />
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography fontSize={13} color={colors.text}>
                        {application.yearsExperience} ans
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={application.suggestedLevel}
                        color={getLevelColor(application.suggestedLevel)}
                        size="small"
                        sx={{ 
                          fontWeight: 500,
                          height: 22,
                          fontSize: '0.7rem'
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={getStatusLabel(application.status)}
                        color={getStatusColor(application.status)}
                        size="small"
                        sx={{ 
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 500
                        }}
                        icon={
                          application.status === "APPROVED" ? <CheckCircle sx={{ fontSize: 13 }} /> :
                          application.status === "REJECTED" ? <Cancel sx={{ fontSize: 13 }} /> :
                          <AccessTime sx={{ fontSize: 13 }} />
                        }
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {application.status === "PENDING" && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              disabled={actionLoading === application.id || isApproving || isRejecting}
                              onClick={() => handleApprove(application.id)}
                              sx={{ 
                                borderRadius: 1,
                                textTransform: 'none',
                                fontSize: '0.7rem',
                                px: 1.5,
                                py: 0.4,
                                minWidth: 65,
                                height: 26
                              }}
                            >
                              {actionLoading === application.id ? '...' : 'Approuver'}
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              disabled={actionLoading === application.id || isApproving || isRejecting}
                              onClick={() => handleReject(application.id)}
                              sx={{ 
                                borderRadius: 1,
                                textTransform: 'none',
                                fontSize: '0.7rem',
                                px: 1.5,
                                py: 0.4,
                                minWidth: 65,
                                height: 26
                              }}
                            >
                              {actionLoading === application.id ? '...' : 'Rejeter'}
                            </Button>
                          </>
                        )}
                        <Tooltip title="Voir détails">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(application)}
                            sx={{ 
                              color: colors.textSecondary,
                              '&:hover': { color: colors.primary },
                              p: 0.5
                            }}
                          >
                            <Visibility sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Zoom>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={detailOpen}
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: 2,
            color: colors.text,
            transition: 'all 0.3s ease'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2
        }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Business sx={{ color: colors.primary }} />
            <Typography variant="h6" fontWeight={700}>
              Détails du partenaire
            </Typography>
          </Stack>
          <IconButton onClick={handleCloseDetails} sx={{ color: colors.textSecondary }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2 }}>
          {selectedApp && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color={colors.textSecondary} fontSize="0.7rem" textTransform="uppercase" letterSpacing={0.5}>
                  Entreprise
                </Typography>
                <Typography variant="h6" fontWeight={600} color={colors.text}>
                  {selectedApp.companyName}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" mt={0.3}>
                  <LocationOn sx={{ fontSize: 14, color: colors.textSecondary }} />
                  <Typography variant="body2" color={colors.textSecondary} fontSize={13}>
                    {selectedApp.city}, {selectedApp.country}
                  </Typography>
                  {selectedApp.region && (
                    <Typography variant="body2" color={colors.textSecondary} fontSize={13}>
                      • {selectedApp.region}
                    </Typography>
                  )}
                </Stack>
              </Box>

              <Divider sx={{ borderColor: colors.border }} />

              <Box>
                <Typography variant="caption" color={colors.textSecondary} fontSize="0.7rem" textTransform="uppercase" letterSpacing={0.5}>
                  Représentant
                </Typography>
                <Typography variant="body1" fontWeight={500} color={colors.text}>
                  {selectedApp.representativeFullName}
                </Typography>
                <Stack direction="row" spacing={2} mt={0.3}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Email sx={{ fontSize: 14, color: colors.textSecondary }} />
                    <Typography variant="body2" color={colors.textSecondary} fontSize={13}>
                      {selectedApp.professionalEmail}
                    </Typography>
                  </Stack>
                  {selectedApp.phone && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Phone sx={{ fontSize: 14, color: colors.textSecondary }} />
                      <Typography variant="body2" color={colors.textSecondary} fontSize={13}>
                        {selectedApp.phone}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Box>

              <Divider sx={{ borderColor: colors.border }} />

              <Box>
                <Typography variant="caption" color={colors.textSecondary} fontSize="0.7rem" textTransform="uppercase" letterSpacing={0.5}>
                  Compétences
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 0.8, mt: 0.5 }}>
                  {selectedApp.expertiseSectors.map((sector: string) => (
                    <Chip
                      key={sector}
                      label={sector}
                      size="small"
                      sx={{ 
                        bgcolor: colors.chipBg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 1,
                        height: 26
                      }}
                    />
                  ))}
                </Stack>
                {selectedApp.specializations && (
                  <Typography variant="body2" color={colors.textSecondary} fontSize={13} mt={1}>
                    {selectedApp.specializations}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ borderColor: colors.border }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color={colors.textSecondary} fontSize="0.7rem" textTransform="uppercase" letterSpacing={0.5}>
                    Services
                  </Typography>
                  <Typography variant="body2" color={colors.text} fontSize={13}>
                    {selectedApp.services?.join(', ') || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color={colors.textSecondary} fontSize="0.7rem" textTransform="uppercase" letterSpacing={0.5}>
                    Langues
                  </Typography>
                  <Typography variant="body2" color={colors.text} fontSize={13}>
                    {selectedApp.languages?.join(', ') || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color={colors.textSecondary} fontSize="0.7rem" textTransform="uppercase" letterSpacing={0.5}>
                    Expérience
                  </Typography>
                  <Typography variant="body2" color={colors.text} fontSize={13}>
                    {selectedApp.yearsExperience} ans
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color={colors.textSecondary} fontSize="0.7rem" textTransform="uppercase" letterSpacing={0.5}>
                    Niveau
                  </Typography>
                  <Chip
                    label={selectedApp.suggestedLevel}
                    color={getLevelColor(selectedApp.suggestedLevel)}
                    size="small"
                    sx={{ mt: 0.3, height: 24 }}
                  />
                </Grid>
              </Grid>

              {selectedApp.portfolioText && (
                <>
                  <Divider sx={{ borderColor: colors.border }} />
                  <Box>
                    <Typography variant="caption" color={colors.textSecondary} fontSize="0.7rem" textTransform="uppercase" letterSpacing={0.5}>
                      Portfolio
                    </Typography>
                    <Typography variant="body2" color={colors.text} fontSize={13} mt={0.5}>
                      {selectedApp.portfolioText}
                    </Typography>
                  </Box>
                </>
              )}

              {selectedApp.clientReferences && (
                <Box>
                  <Typography variant="caption" color={colors.textSecondary} fontSize="0.7rem" textTransform="uppercase" letterSpacing={0.5}>
                    Références clients
                  </Typography>
                  <Typography variant="body2" color={colors.text} fontSize={13} mt={0.5}>
                    {selectedApp.clientReferences}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          borderTop: `1px solid ${colors.border}`,
          px: 3,
          py: 2,
          gap: 1
        }}>
          <Button
            onClick={handleCloseDetails}
            sx={{ 
              color: colors.textSecondary,
              textTransform: 'none',
              '&:hover': { color: colors.text }
            }}
          >
            Fermer
          </Button>
          {selectedApp?.status === "PENDING" && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  handleApprove(selectedApp.id);
                  handleCloseDetails();
                }}
                sx={{ 
                  textTransform: 'none',
                  borderRadius: 1.5,
                  px: 3
                }}
              >
                Approuver
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  handleReject(selectedApp.id);
                  handleCloseDetails();
                }}
                sx={{ 
                  textTransform: 'none',
                  borderRadius: 1.5,
                  px: 3
                }}
              >
                Rejeter
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PartnerApplicationsPage;