import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Box,
  Popover,
  List,
  ListItem,
  Divider,
  Button,
  ListItemButton,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { toggleTheme } from "../../redux/features/themeSlice";
import { logout } from "../../redux/features/authSlice";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../providers/LanguageProvider";
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationsCountQuery,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
} from "../../redux/services/notification.api";

interface TopbarProps {
  onMenuClick: () => void;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  onMenuClick,
  onToggleCollapse,
  isCollapsed,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const user = useSelector((state: RootState) => state.auth.user);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const { data: unread } = useGetUnreadNotificationsCountQuery(undefined, {
    pollingInterval: 5000,
  });
  const { data: notifications = [] } = useGetNotificationsQuery();

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

  const unreadCount = unread?.count ?? 0;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotifAnchor(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    handleMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar sx={{ minHeight: 64, px: { xs: 2, sm: 3 } }}>
        {/* ============================================
            كل الـ Menu Buttons محذوفين
            ============================================ */}
        {/* 
        // Hamburger Menu للـ Mobile - محذوف
        <IconButton
          onClick={onMenuClick}
          sx={{
            mr: 1.5,
            display: { sm: "none" },
            ...
          }}
        >
          <MenuIcon />
        </IconButton>
        */}

        {/* 
        // Collapse Button - محذوف
        <IconButton
          onClick={onToggleCollapse}
          sx={{
            mr: 2,
            ...
          }}
        >
          {isCollapsed ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>
        */}

        {/* Logo & Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: theme.palette.primary.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "1.1rem",
            }}
          >
            RB
          </Box>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 800,
                color: theme.palette.text.primary,
                fontSize: "1.1rem",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              ReactBuilder
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.6rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              CraftWeb Platform
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Actions - فقط Theme, Notifications, User */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {/* Theme Toggle */}
          <IconButton
            onClick={() => dispatch(toggleTheme())}
            sx={{
              color: theme.palette.text.secondary,
              borderRadius: 2,
              p: 1,
              "&:hover": {
                color: theme.palette.text.primary,
                bgcolor: theme.palette.action.hover,
              },
            }}
          >
            {themeMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {/* Notifications */}
          <IconButton
            onClick={handleNotificationsOpen}
            sx={{
              color: theme.palette.text.secondary,
              borderRadius: 2,
              p: 1,
              "&:hover": {
                color: theme.palette.text.primary,
                bgcolor: theme.palette.action.hover,
              },
            }}
          >
            <Badge
              badgeContent={unreadCount}
              color="error"
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.6rem",
                  minWidth: 18,
                  height: 18,
                  fontWeight: 700,
                },
              }}
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Avatar */}
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              ml: 0.5,
              p: 0.5,
              borderRadius: 2,
              "&:hover": { bgcolor: theme.palette.action.hover },
            }}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: theme.palette.primary.main,
                fontWeight: 700,
                fontSize: "0.9rem",
                color: "#ffffff",
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
          </IconButton>
        </Box>

        {/* Notifications Popover */}
        <Popover
          open={Boolean(notifAnchor)}
          anchorEl={notifAnchor}
          onClose={handleNotificationsClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 3,
              boxShadow: theme.shadows[3],
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
            },
          }}
        >
          <Box sx={{ width: 380, maxHeight: 480 }}>
            <Box
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={700}
                color={theme.palette.text.primary}
              >
                Notifications
              </Typography>

              {unreadCount > 0 && (
                <Button
                  size="small"
                  onClick={() => markAllAsRead()}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    fontSize: "0.75rem",
                    "&:hover": {
                      bgcolor: theme.palette.action.selected,
                    },
                  }}
                >
                  Mark all read
                </Button>
              )}
            </Box>

            <Divider sx={{ borderColor: theme.palette.divider }} />

            {notifications.length === 0 ? (
              <Box p={3} textAlign="center">
                <Typography fontWeight={600} color={theme.palette.text.secondary}>
                  No notifications yet
                </Typography>
                <Typography
                  color={theme.palette.text.disabled}
                  fontSize={13}
                  sx={{ mt: 0.5 }}
                >
                  New updates will appear here
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {notifications.slice(0, 10).map((notif: any) => (
                  <ListItem key={notif.id} disablePadding>
                    <ListItemButton
                      onClick={() => markAsRead(notif.id)}
                      sx={{
                        alignItems: "flex-start",
                        px: 2,
                        py: 1.5,
                        bgcolor: notif.isRead
                          ? "transparent"
                          : theme.palette.action.selected,
                        borderLeft: notif.isRead
                          ? "3px solid transparent"
                          : `3px solid ${theme.palette.primary.main}`,
                        "&:hover": {
                          bgcolor: notif.isRead
                            ? theme.palette.action.hover
                            : theme.palette.action.selected,
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          mr: 1.5,
                          bgcolor: notif.isRead
                            ? theme.palette.action.disabledBackground
                            : theme.palette.primary.main,
                          color: notif.isRead
                            ? theme.palette.text.disabled
                            : "#ffffff",
                          fontSize: 16,
                        }}
                      >
                        🔔
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Typography
                          fontWeight={notif.isRead ? 500 : 700}
                          fontSize={14}
                          color={theme.palette.text.primary}
                        >
                          {notif.title}
                        </Typography>

                        <Typography
                          color={theme.palette.text.secondary}
                          fontSize={13}
                          sx={{ mt: 0.3 }}
                        >
                          {notif.message || notif.type}
                        </Typography>

                        <Typography
                          color={theme.palette.text.disabled}
                          fontSize={11}
                          fontWeight={500}
                          sx={{ mt: 0.6 }}
                        >
                          {new Date(notif.createdAt).toLocaleString()}
                        </Typography>
                      </Box>

                      {!notif.isRead && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: theme.palette.primary.main,
                            mt: 1,
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Popover>

        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 3,
              boxShadow: theme.shadows[3],
              border: `1px solid ${theme.palette.divider}`,
              minWidth: 180,
              bgcolor: theme.palette.background.paper,
            },
          }}
        >
          <MenuItem
            onClick={() => {
              navigate("/profile");
              handleMenuClose();
            }}
            sx={{
              py: 1.5,
              px: 2.5,
              "&:hover": { bgcolor: theme.palette.action.hover },
            }}
          >
            <Typography
              fontSize={14}
              fontWeight={500}
              color={theme.palette.text.primary}
            >
              {t.profile || "Profile"}
            </Typography>
          </MenuItem>

          <Divider sx={{ borderColor: theme.palette.divider }} />

          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.5,
              px: 2.5,
              "&:hover": { bgcolor: theme.palette.action.hover },
            }}
          >
            <Typography
              fontSize={14}
              fontWeight={500}
              color={theme.palette.error.main}
            >
              {t.logout || "Logout"}
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;