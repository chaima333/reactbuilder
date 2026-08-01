import React from "react";

import {
  Alert,
  alpha,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import {
  DashboardRounded,
  HomeRounded,
} from "@mui/icons-material";

import {
  useNavigate,
} from "react-router-dom";

import {
  useSelector,
} from "react-redux";

import {
  RootState,
} from "../../../redux/store";

import {
  useGetDashboardFullQuery,
} from "../../../redux/services/dashboard.api";

import DashboardRenderer from "./DashboardRenderer";

import {
  SiteSelector,
} from "../components/SiteSelector";

const getDashboardErrorMessage = (
  error: unknown
): string => {
  if (
    typeof error !== "object" ||
    error === null
  ) {
    return "Server connection failed.";
  }

  if (!("data" in error)) {
    return "Server connection failed.";
  }

  const data = (
    error as {
      data?: unknown;
    }
  ).data;

  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (
      data as {
        message?: unknown;
      }
    ).message === "string"
  ) {
    return (
      data as {
        message: string;
      }
    ).message;
  }

  return "Server connection failed.";
};

export const DashboardPage:
  React.FC = () => {
    const theme =
      useTheme();

    const navigate =
      useNavigate();

    const siteId =
      useSelector(
        (
          state: RootState
        ) =>
          state.site
            .currentSite?.id
      );

    const {
      data,
      error,
      isError,
      isFetching,
      isLoading,
      status,
    } =
      useGetDashboardFullQuery(
        Number(siteId) || 0,
        {
          skip: !siteId,
          refetchOnMountOrArgChange:
            true,
        }
      );

    const isDarkMode =
      theme.palette.mode ===
      "dark";

    const pageBackground =
      isDarkMode
        ? theme.palette.background
            .default
        : "#F5F7FB";

    const surfaceBackground =
      isDarkMode
        ? alpha(
            theme.palette.common
              .white,
            0.04
          )
        : theme.palette.background
            .paper;

    const dashboardMinHeight =
      "calc(100vh - 64px)";

    if (!siteId) {
      return (
        <Box
          component="main"
          sx={{
            minHeight:
              dashboardMinHeight,
            bgcolor:
              pageBackground,
            p: {
              xs: 2,
              sm: 3,
              md: 4,
            },
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              maxWidth: 900,
              mx: "auto",
              p: {
                xs: 2,
                sm: 3,
              },
              borderRadius: 4,
              bgcolor:
                surfaceBackground,
              backgroundImage:
                "none",
              borderColor: alpha(
                theme.palette.divider,
                0.8
              ),
            }}
          >
            <Alert
              severity="info"
              icon={
                <HomeRounded />
              }
              action={
                <Button
                  color="inherit"
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    navigate(
                      "/sites"
                    )
                  }
                  sx={{
                    borderRadius: 2,
                    fontWeight: 700,
                    whiteSpace:
                      "nowrap",
                  }}
                >
                  Create Site
                </Button>
              }
              sx={{
                borderRadius: 3,

                "& .MuiAlert-message":
                  {
                    fontSize:
                      "0.95rem",
                    fontWeight: 500,
                  },
              }}
            >
              Welcome! Create your
              first website to start
              using ReactBuilder.
            </Alert>
          </Paper>
        </Box>
      );
    }

    if (
      isLoading ||
      status ===
        "uninitialized" ||
      (
        status === "pending" &&
        !data
      )
    ) {
      return (
        <Box
          component="main"
          sx={{
            minHeight:
              dashboardMinHeight,
            bgcolor:
              pageBackground,
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            p: 3,
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              width: "100%",
              maxWidth: 420,
              p: 4,
              borderRadius: 4,
              bgcolor:
                surfaceBackground,
              backgroundImage:
                "none",
              borderColor: alpha(
                theme.palette.divider,
                0.8
              ),
            }}
          >
            <Stack
              alignItems="center"
              spacing={2}
            >
              <CircularProgress
                thickness={4}
                size={44}
                sx={{
                  color:
                    theme.palette
                      .primary.main,
                }}
              />

              <Typography
                variant="body1"
                color="text.secondary"
                fontWeight={600}
              >
                Loading dashboard...
              </Typography>
            </Stack>
          </Paper>
        </Box>
      );
    }

    if (isError) {
      return (
        <Box
          component="main"
          sx={{
            minHeight:
              dashboardMinHeight,
            bgcolor:
              pageBackground,
            p: {
              xs: 2,
              sm: 3,
              md: 4,
            },
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              maxWidth: 900,
              mx: "auto",
              p: {
                xs: 2,
                sm: 3,
              },
              borderRadius: 4,
              bgcolor:
                surfaceBackground,
              backgroundImage:
                "none",
              borderColor: alpha(
                theme.palette.error
                  .main,
                0.2
              ),
            }}
          >
            <Alert
              severity="error"
              sx={{
                borderRadius: 3,
              }}
            >
              {getDashboardErrorMessage(
                error
              )}
            </Alert>
          </Paper>
        </Box>
      );
    }

    if (!data) {
      return (
        <Box
          component="main"
          sx={{
            minHeight:
              dashboardMinHeight,
            bgcolor:
              pageBackground,
            p: {
              xs: 2,
              sm: 3,
              md: 4,
            },
          }}
        >
          <Alert
            severity="info"
            sx={{
              maxWidth: 900,
              mx: "auto",
              borderRadius: 3,
            }}
          >
            No dashboard data found
            for this site.
          </Alert>
        </Box>
      );
    }

    const siteName =
      String(
        data.stats?.siteName ||
          "Current project"
      ).trim();

    return (
      <Box
        component="main"
        sx={{
          minHeight:
            dashboardMinHeight,
          bgcolor:
            pageBackground,
          color:
            theme.palette.text
              .primary,
          p: {
            xs: 2,
            sm: 3,
            md: 4,
          },
          transition:
            theme.transitions.create(
              [
                "background-color",
                "color",
              ],
              {
                duration:
                  theme.transitions
                    .duration.short,
              }
            ),
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 1600,
            mx: "auto",
          }}
        >
          {/* Header */}
          <Paper
            component="header"
            variant="outlined"
            sx={{
              position: "relative",
              overflow: "hidden",
              p: {
                xs: 2.25,
                sm: 3,
              },
              borderRadius: 4,
              bgcolor:
                surfaceBackground,
              backgroundImage:
                "none",
              borderColor: alpha(
                theme.palette.divider,
                0.8
              ),
              boxShadow:
                isDarkMode
                  ? "none"
                  : `0 12px 32px ${alpha(
                      theme.palette
                        .common.black,
                      0.05
                    )}`,

              "&::before": {
                content: '""',
                position:
                  "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: 4,
                bgcolor:
                  theme.palette
                    .primary.main,
              },
            }}
          >
            <Stack
              direction={{
                xs: "column",
                md: "row",
              }}
              alignItems={{
                xs: "stretch",
                md: "center",
              }}
              justifyContent="space-between"
              spacing={3}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                minWidth={0}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    flexShrink: 0,
                    display: "grid",
                    placeItems:
                      "center",
                    borderRadius: 3,
                    bgcolor: alpha(
                      theme.palette
                        .primary.main,
                      isDarkMode
                        ? 0.18
                        : 0.1
                    ),
                    color:
                      theme.palette
                        .primary.main,
                  }}
                >
                  <DashboardRounded
                    sx={{
                      fontSize: 30,
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    minWidth: 0,
                  }}
                >
                  <Typography
                    component="h1"
                    variant="h4"
                    sx={{
                      fontSize: {
                        xs: "1.65rem",
                        sm: "2rem",
                      },
                      fontWeight: 800,
                      letterSpacing:
                        "-0.035em",
                      color:
                        theme.palette
                          .text.primary,
                    }}
                  >
                    Dashboard
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,
                      color:
                        theme.palette
                          .text
                          .secondary,
                    }}
                  >
                    Overview of your
                    site performance
                    and recent activity.
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 1,
                      color:
                        theme.palette
                          .primary.main,
                      fontWeight: 700,
                      wordBreak:
                        "break-word",
                    }}
                  >
                    Current site:{" "}
                    {siteName}
                  </Typography>
                </Box>
              </Stack>

              {/* Site selector */}
              <Box
                sx={{
                  width: {
                    xs: "100%",
                    md: 280,
                  },
                  flexShrink: 0,

                  "& .MuiFormControl-root":
                    {
                      width: "100%",
                    },

                  "& .MuiInputBase-root":
                    {
                      minHeight: 48,
                      borderRadius: 2.5,
                      bgcolor:
                        theme.palette
                          .background
                          .paper,
                      color:
                        theme.palette
                          .text.primary,
                    },

                  "& .MuiInputLabel-root":
                    {
                      color:
                        theme.palette
                          .text
                          .secondary,
                    },

                  "& .MuiSelect-icon":
                    {
                      color:
                        theme.palette
                          .text
                          .secondary,
                    },
                }}
              >
                <SiteSelector />
              </Box>
            </Stack>
          </Paper>

          {isFetching && (
            <LinearProgress
              aria-label="Refreshing dashboard"
              sx={{
                mt: 1,
                height: 3,
                borderRadius: 999,
              }}
            />
          )}

          {/* Dashboard content */}
          <Box
            sx={{
              mt: 3,

              "& .MuiPaper-root":
                {
                  backgroundImage:
                    "none",
                },
            }}
          >
            <DashboardRenderer
              layout={data.layout}
              context={data}
            />
          </Box>
        </Box>
      </Box>
    );
  };

export default DashboardPage;