import { api } from '../api/api';

type User = {
  [x: string]: any;
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER' | 'OWNER';
  isApproved?: boolean;
};

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({

    getProfile: builder.query<User, void>({
      query: () => '/auth/profile',
      providesTags: [{ type: 'User', id: 'PROFILE' }],
    }),

    updateProfile: builder.mutation<User, Partial<User>>({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [{ type: 'User', id: 'PROFILE' }],
    }),

    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: (result) =>
        result
          ? [
              ...result.map((u) => ({ type: 'Users' as const, id: u.id })),
              { type: 'Users', id: 'LIST' },
            ]
          : [{ type: 'Users', id: 'LIST' }],
    }),

    createUser: builder.mutation<User, Partial<User>>({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
    }),

    updateUser: builder.mutation<User, { id: number; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Users', id },
      ],
    }),

    changeUserRole: builder.mutation<User, { id: number; role: string }>({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Users', id },
      ],
    }),

    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
    }),

  }),
});

export const {
  useGetProfileQuery,     
  useUpdateProfileMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useChangeUserRoleMutation,
  useDeleteUserMutation,
} = usersApi;