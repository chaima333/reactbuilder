import { api } from "../api/api";

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<any[], void>({
      query: () => "/notifications",
      transformResponse: (res: any) => res.data || [],
      providesTags: ["Notifications"],
    }),

    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => "/notifications/unread-count",
      transformResponse: (res: any) => res.data || { count: 0 },
      providesTags: ["Notifications"],
    }),

    markNotificationAsRead: builder.mutation<void, number>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),

    markAllNotificationsAsRead: builder.mutation<void, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} = notificationApi;