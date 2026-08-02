import React from "react";
import {
  Article,
  DoneAll,
  FiberManualRecord,
  Image,
  Notifications as NotificationsIcon,
  NotificationsActive,
  Person,
  PushPin,
  Settings,
} from "@mui/icons-material";
import {
  alpha,
  Avatar,
  Badge,
  Box,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  useDeleteNotificationMutation,
  useMarkAllNotificationsAsReadMutation,
} from "../../../../redux/services/notification.api";

type NotificationItem = {
  id: number;
  title: string;
  message?: string | null;
  isRead: boolean;
  createdAt: string;
  type?: "page" | "media" | "user" | "system";
};

type NotificationsWidgetProps = {
  data?: {
    unreadCount: number;
    latestNotifications: NotificationItem[];
    totalNotifications: number;
  } | null;
};

const getTypeIcon = (title?: string) => {
  if (!title) return <PushPin fontSize="small" />;

  const lower = title.toLowerCase();

  if (lower.includes("media") || lower.includes("image")) {
    return <Image fontSize="small" />;
  }

  if (lower.includes("page") || lower.includes("publish")) {
    return <Article fontSize="small" />;
  }

  if (lower.includes("user") || lower.includes("register")) {
    return <Person fontSize="small" />;
  }

  if (lower.includes("plugin") || lower.includes("system")) {
    return <Settings fontSize="small" />;
  }

  return <PushPin fontSize="small" />;
};

const formatTime = (time: string) => {
  const now = new Date();
  const notifTime = new Date(time);

  const diffMs = now.getTime() - notifTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return notifTime.toLocaleDateString();
};

export const NotificationsWidget: React.FC<NotificationsWidgetProps> = ({
  data,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const notifications = data?.latestNotifications || [];
  const unreadCount = data?.unreadCount ?? 0;
  const totalNotifications = data?.totalNotifications ?? 0;
  const visibleNotifications = notifications.slice(0, 5);
  const [deleteNotification] = useDeleteNotificationMutation();
  const [markAllNotificationsAsRead] = useMarkAllNotificationsAsReadMutation();

  return (
    <Paper
      sx={{
        p: 0,
        borderRadius: 3,
        boxShadow: "none",
        border: `1px solid ${theme.palette.divider}`,
        height: "100%",
        minHeight: 320,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          p: 2.25,
          pb: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: alpha(theme.palette.primary.main, isDark ? 0.1 : 0.05),
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              bgcolor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Badge
              badgeContent={unreadCount}
              color="error"
              overlap="circular"
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: 10,
                  height: 20,
                  minWidth: 20,
                  padding: "0 4px",
                  fontWeight: 700,
                },
              }}
            >
              <NotificationsActive
                sx={{ color: theme.palette.primary.main, fontSize: 22 }}
              />
            </Badge>
          </Box>

          <Box>
            <Typography
              variant="h6"
              fontWeight={800}
              color="text.primary"
              lineHeight={1.2}
            >
              Notifications
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {unreadCount > 0 ? `${unreadCount} unread messages` : "All caught up"}
            </Typography>
          </Box>
        </Stack>

        <Box display="flex" gap={0.5}>
          {unreadCount > 0 && (
            <IconButton
              size="small"
              aria-label="Mark all notifications as read"
              onClick={() => markAllNotificationsAsRead()}
              sx={{
                bgcolor: alpha(theme.palette.action.hover, 0.6),
                borderRadius: 2,
                "&:hover": { bgcolor: theme.palette.action.hover },
              }}
            >
              <DoneAll
                sx={{ fontSize: 18, color: theme.palette.text.secondary }}
              />
            </IconButton>
          )}

          <Chip
            label={`${totalNotifications} total`}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.secondary.main, isDark ? 0.16 : 0.1),
              color: theme.palette.secondary.main,
              fontWeight: 600,
              height: 32,
              borderRadius: 2,
              "& .MuiChip-label": { px: 1.5 },
            }}
          />
        </Box>
      </Box>

      <Box sx={{ p: 1.25 }}>
        {notifications.length === 0 ? (
          <Box
            sx={{
              py: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <NotificationsIcon
              sx={{ fontSize: 48, color: theme.palette.text.disabled }}
            />
            <Typography color="text.secondary" fontWeight={500}>
              No notifications yet
            </Typography>
            <Typography variant="caption" color="text.secondary">
              New updates will appear here
            </Typography>
          </Box>
        ) : (
          <Stack spacing={0.5}>
            {visibleNotifications.map((notification, index) => {
              const isUnread = !notification.isRead;
              const typeIcon = getTypeIcon(notification.title);

              return (
                <Box
                  key={notification.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: isUnread
                      ? alpha(theme.palette.primary.main, isDark ? 0.12 : 0.06)
                      : "transparent",
                    borderLeft: isUnread
                      ? `3px solid ${theme.palette.primary.main}`
                      : "3px solid transparent",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.action.hover, 0.6),
                    },
                    position: "relative",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: alpha(
                          theme.palette.primary.main,
                          isDark ? 0.16 : 0.08
                        ),
                        color: theme.palette.primary.main,
                        flexShrink: 0,
                      }}
                    >
                      {typeIcon}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={1}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={isUnread ? 700 : 400}
                          color={isUnread ? "text.primary" : "text.secondary"}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {isUnread && (
                            <FiberManualRecord
                              sx={{
                                fontSize: 8,
                                color: theme.palette.primary.main,
                                mr: 0.5,
                              }}
                            />
                          )}
                          {notification.title}
                        </Typography>

                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              whiteSpace: "nowrap",
                              fontSize: 11,
                              fontWeight: isUnread ? 600 : 400,
                            }}
                          >
                            {formatTime(notification.createdAt)}
                          </Typography>
                          <IconButton
                            size="small"
                            aria-label="Delete notification"
                            onClick={() => deleteNotification(notification.id)}
                            sx={{
                              mt: -0.5,
                              p: 0.5,
                              "&:hover": {
                                bgcolor: alpha(theme.palette.error.main, 0.12),
                              },
                            }}
                          >
                            <CloseIcon
                              fontSize="small"
                              sx={{
                                fontSize: 14,
                                color: theme.palette.text.secondary,
                              }}
                            />
                          </IconButton>
                        </Stack>
                      </Stack>

                      {notification.message && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                            fontSize: 13,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {notification.message}
                        </Typography>
                      )}
                    </Box>
                  </Stack>

                  {index < visibleNotifications.length - 1 && (
                    <Divider sx={{ mt: 1.25 }} />
                  )}
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>

      {notifications.length > visibleNotifications.length && (
        <Box
          sx={{
            p: 1.5,
            pt: 0.5,
            borderTop: `1px solid ${theme.palette.divider}`,
            textAlign: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Showing latest {visibleNotifications.length} of {totalNotifications} notifications
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default NotificationsWidget;
