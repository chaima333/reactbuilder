import React from "react";
import {
  Notifications as NotificationsIcon,
  NotificationsActive,
  FiberManualRecord,
  DoneAll,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Stack,
  Badge,
  Chip,
  Divider,
  Avatar,
  Button,
  alpha,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDeleteNotificationMutation } from "../../../../redux/services/notification.api";

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

// ===== ICÔNES PAR TYPE =====
const getTypeIcon = (title?: string) => {
  if (!title) return "📌";
  const lower = title.toLowerCase();
  if (lower.includes("media") || lower.includes("image")) return "🖼️";
  if (lower.includes("page") || lower.includes("publish")) return "📄";
  if (lower.includes("user") || lower.includes("register")) return "👤";
  if (lower.includes("plugin") || lower.includes("system")) return "⚙️";
  return "📌";
};

// ===== FORMAT TIME =====
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
  const notifications = data?.latestNotifications || [];
  const unreadCount = data?.unreadCount ?? 0;
  const totalNotifications = data?.totalNotifications ?? 0;
  const [deleteNotification] = useDeleteNotificationMutation();

  return (
    <Paper
      sx={{
        p: 0,
        borderRadius: 4,
        boxShadow: "0 10px 30px rgba(0,0,0,0.07)",
        border: "1px solid rgba(0,0,0,0.06)",
        height: "100%",
        minHeight: 320,
        overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* ===== HEADER ===== */}
      <Box
        sx={{
          p: 3,
          pb: 2,
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 3,
              bgcolor: "rgba(0,196,154,0.12)",
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
              <NotificationsActive sx={{ color: "#00C49A", fontSize: 22 }} />
            </Badge>
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} color="#1B2559" lineHeight={1.2}>
              Notifications
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {unreadCount > 0
                ? `${unreadCount} unread messages`
                : "All caught up! 🎉"}
            </Typography>
          </Box>
        </Stack>

        <Box display="flex" gap={0.5}>
          <IconButton
            size="small"
            sx={{
              bgcolor: "rgba(0,0,0,0.04)",
              borderRadius: 2,
              "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
            }}
          >
            <DoneAll sx={{ fontSize: 18, color: "#8884d8" }} />
          </IconButton>
          <Chip
            label={`${totalNotifications} total`}
            size="small"
            sx={{
              bgcolor: "rgba(136,132,216,0.12)",
              color: "#8884d8",
              fontWeight: 600,
              height: 32,
              borderRadius: 2,
              "& .MuiChip-label": { px: 1.5 },
            }}
          />
        </Box>
      </Box>

      {/* ===== LIST ===== */}
      <Box sx={{ p: 1.5 }}>
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
            <NotificationsIcon sx={{ fontSize: 48, color: "#e0e0e0" }} />
            <Typography color="text.secondary" fontWeight={500}>
              No notifications yet
            </Typography>
            <Typography variant="caption" color="text.secondary">
              We'll notify you when something happens
            </Typography>
          </Box>
        ) : (
          <Stack spacing={0.5}>
            {notifications.slice(0, 5).map((notification, index) => {
              const isUnread = !notification.isRead;
              const typeIcon = getTypeIcon(notification.title);

              return (
                <Box
                  key={notification.id}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: isUnread
                      ? "rgba(0,196,154,0.04)"
                      : "transparent",
                    borderLeft: isUnread
                      ? "3px solid #00C49A"
                      : "3px solid transparent",
                    transition: "all 0.2s",
                    "&:hover": {
                      backgroundColor: isUnread
                        ? "rgba(0,196,154,0.08)"
                        : "rgba(0,0,0,0.02)",
                    },
                    position: "relative",
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    {/* Avatar/Icon */}
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        fontSize: 18,
                        bgcolor: isUnread
                          ? "rgba(0,196,154,0.15)"
                          : "rgba(0,0,0,0.05)",
                        color: isUnread ? "#00C49A" : "#9e9e9e",
                        flexShrink: 0,
                      }}
                    >
                      {typeIcon}
                    </Avatar>

                    {/* Content */}
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
                          color={isUnread ? "#1B2559" : "text.secondary"}
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
                                color: "#00C49A",
                                mr: 0.5,
                                animation: "pulse 2s infinite",
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
                            onClick={() => deleteNotification(notification.id)}
                            sx={{
                              mt: -0.5,
                              p: 0.5,
                              "&:hover": {
                                bgcolor: "rgba(255,0,0,0.08)",
                              },
                            }}
                          >
                            <CloseIcon
                              fontSize="small"
                              sx={{ fontSize: 14, color: "#9e9e9e" }}
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

                  {index < notifications.slice(0, 5).length - 1 && (
                    <Divider sx={{ mt: 1.5 }} />
                  )}
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>

      {/* ===== FOOTER ===== */}
      {notifications.length > 5 && (
        <Box
          sx={{
            p: 2,
            pt: 1.5,
            borderTop: "1px solid rgba(0,0,0,0.06)",
            textAlign: "center",
          }}
        >
          <Button
            size="small"
            sx={{
              color: "#8884d8",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                bgcolor: "rgba(136,132,216,0.08)",
              },
            }}
          >
            View all notifications →
          </Button>
        </Box>
      )}

      {/* ===== CSS ANIMATION ===== */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.3; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </Paper>
  );
};

export default NotificationsWidget;