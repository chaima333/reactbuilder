// frontend/src/app/pages/PublicTopbar.tsx

import React from "react";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box
} from "@mui/material";

import {
  Link,
  useLocation
} from "react-router-dom";

import {
  useAuth
} from "../../modules/auth/hooks/useAuth";

export const PublicTopbar:
React.FC = () => {
  const location =
    useLocation();

  const {
    user,
    isAuthenticated
  } = useAuth();

  const navItems = [
    {
      label: "Accueil",
      path: "/"
    },
    {
      label: "À propos",
      path: "/about"
    },
    {
      label: "Services",
      path: "/services"
    },
    {
      label: "Contact",
      path: "/contact"
    }
  ];

  const isActive = (
    path: string
  ) => {
    return (
      location.pathname === path
    );
  };

  const canCreateSite =
    user?.role === "ADMIN" ||
    user?.role === "EDITOR";

  const ctaTarget =
    !isAuthenticated
      ? "/register"
      : canCreateSite
        ? "/sites"
        : "/dashboard";

  const ctaLabel =
    !isAuthenticated
      ? "Commencer"
      : canCreateSite
        ? "Mes sites"
        : "Tableau de bord";

  return (
    <AppBar
      position="fixed"
      color="transparent"
      elevation={0}
      sx={{
        bgcolor:
          "rgba(255,255,255,0.92)",
        backdropFilter:
          "blur(12px)",
        borderBottom:
          "1px solid rgba(0,0,0,0.06)",
        zIndex: 9999
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            fontWeight: 800,
            color: "#00C49A",
            textDecoration: "none",
            fontSize: "1.25rem"
          }}
        >
          ReactBuilder
        </Typography>

        <Box
          sx={{
            flexGrow: 1
          }}
        />

        <Box
          sx={{
            display: {
              xs: "none",
              md: "flex"
            },
            alignItems: "center",
            gap: 1
          }}
        >
          {navItems.map(
            item => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                sx={{
                  fontWeight:
                    isActive(
                      item.path
                    )
                      ? 700
                      : 500,

                  color:
                    isActive(
                      item.path
                    )
                      ? "#00C49A"
                      : "#4a5568",

                  position:
                    "relative",

                  px: 2,
                  py: 1,

                  "&::after": {
                    content: '""',
                    position:
                      "absolute",
                    bottom: 0,
                    left: "50%",
                    transform:
                      "translateX(-50%)",

                    width:
                      isActive(
                        item.path
                      )
                        ? "20px"
                        : "0",

                    height: "2px",
                    bgcolor:
                      "#00C49A",

                    transition:
                      "all 0.3s ease"
                  },

                  "&:hover": {
                    color:
                      "#00C49A",

                    "&::after": {
                      width: "20px"
                    }
                  }
                }}
              >
                {item.label}
              </Button>
            )
          )}
        </Box>

        <Box
          sx={{
            flexGrow: 1
          }}
        />

        <Button
          variant="contained"
          component={Link}
          to={ctaTarget}
          sx={{
            bgcolor: "#00C49A",
            borderRadius: "50px",
            px: 3,
            py: 1,
            fontWeight: 600,

            "&:hover": {
              bgcolor: "#009e7c",
              boxShadow:
                "0 8px 24px rgba(0,196,154,0.3)"
            }
          }}
        >
          {ctaLabel}
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default PublicTopbar;