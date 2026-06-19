import React from "react";
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { DashboardCard } from "../layout/DashboardCard";
import { useDeleteNotificationMutation } from "../../../../redux/services/notification.api";

type NotificationItem = {
  id: number;
  title: string;
  message?: string | null;
  isRead: boolean;
  createdAt: string;
};

type NotificationsWidgetProps = {
  data?: {
    unreadCount: number;
    latestNotifications: NotificationItem[];
    totalNotifications: number;
  } | null;
};

export const NotificationsWidget: React.FC<NotificationsWidgetProps> = ({
  data,
}) => {
  const notifications = data?.latestNotifications || [];
  const [deleteNotification] = useDeleteNotificationMutation();

  return (
    <DashboardCard
      title="Notifications"
      subtitle={`${data?.totalNotifications ?? 0} total`}
      icon={<NotificationsIcon />}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={800} color="error.main">
          {data?.unreadCount ?? 0}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Unread notifications
        </Typography>
      </Box>

      {notifications.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 2 }}>
          No notifications yet
        </Typography>
      ) : (
        <Box>
          {notifications.slice(0, 5).map((notification) => (
            <Box
              key={notification.id}
              sx={{
                py: 1.25,
                borderTop: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  fontSize={14}
                  fontWeight={notification.isRead ? 600 : 800}
                >
                  {notification.title}
                </Typography>

                {notification.message && (
                  <Typography fontSize={12} color="text.secondary" noWrap>
                    {notification.message}
                  </Typography>
                )}
              </Box>

              <IconButton
                size="small"
                onClick={() => deleteNotification(notification.id)}
                sx={{ mt: -0.5 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </DashboardCard>
  );
};

export default NotificationsWidget;