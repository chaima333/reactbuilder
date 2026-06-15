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
  ListItemText,
  Divider,
  Button,
} from "@mui/material";

import {
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
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
  useGetUnreadCountQuery,
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
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const user = useSelector((state: RootState) => state.auth.user);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);

  const { data: unread } = useGetUnreadCountQuery();
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
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <IconButton
          color="inherit"
          onClick={onToggleCollapse}
          sx={{ mr: 2, display: { xs: "none", sm: "inline-flex" } }}
        >
          {isCollapsed ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>

        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
          CraftWeb
        </Typography>

        <IconButton color="inherit" onClick={() => dispatch(toggleTheme())}>
          {themeMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>

        <IconButton color="inherit" onClick={handleNotificationsOpen}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <Popover
          open={Boolean(notifAnchor)}
          anchorEl={notifAnchor}
          onClose={handleNotificationsClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Box sx={{ width: 360, maxHeight: 420 }}>
            <Box
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography fontWeight={800}>Notifications</Typography>

              <Button size="small" onClick={() => markAllAsRead()}>
                Mark all read
              </Button>
            </Box>

            <Divider />

            {notifications.length === 0 ? (
              <Box p={2}>
                <Typography color="text.secondary">
                  No notifications yet.
                </Typography>
              </Box>
            ) : (
              <List dense>
                {notifications.slice(0, 8).map((notif: any) => (
                  <ListItem
                    key={notif.id}
                    button
                    onClick={() => markAsRead(notif.id)}
                    sx={{
                      bgcolor: notif.isRead ? "transparent" : "action.hover",
                    }}
                  >
                    <ListItemText
                      primary={notif.title}
                      secondary={notif.message || notif.type}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Popover>

        <IconButton onClick={handleMenuOpen} sx={{ ml: 1 }}>
          <Avatar sx={{ bgcolor: "secondary.main", width: 32, height: 32 }}>
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem onClick={() => { navigate("/profile"); handleMenuClose(); }}>
            <Typography>{t.profile}</Typography>
          </MenuItem>

          <MenuItem onClick={handleLogout}>
            <Typography color="error">{t.logout}</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;