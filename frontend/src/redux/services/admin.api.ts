import { api } from '../api/api';

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPendingUsers: builder.query<any, void>({
      query: () => '/ADMIN/pending-users',
      providesTags: ['PendingUsers'],
    }),

    approveUser: builder.mutation<any, number>({
      query: (id) => ({
        url: `/ADMIN/approve-user/${id}`,
        method: 'POST',
      }),
      invalidatesTags: ['PendingUsers', 'Users', 'Stats'],
    }),

    rejectUser: builder.mutation<any, number>({
      query: (id) => ({
        url: `/ADMIN/reject-user/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PendingUsers', 'Users'],
    }),
  }),
});

export const {
  useGetPendingUsersQuery,
  useApproveUserMutation,
  useRejectUserMutation,
} = adminApi;