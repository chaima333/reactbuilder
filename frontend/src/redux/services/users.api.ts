import { api } from '../api/api';

type User = {
  [x: string]: any;
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER' ;
  isApproved?: boolean;
  siteCount?: number;
};

const unwrapUser = (response: any): User =>
  response?.data || response?.user || response;

const unwrapUsers = (response: any): User[] => {
  const users =
    response?.data ||
    response?.users ||
    response;

  return Array.isArray(users)
    ? users
    : [];
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
    uploadProfileAvatar:
  builder.mutation<any, FormData>({
    query: (formData) => ({
      url:
        "/auth/profile/avatar",

      method:
        "POST",

      body:
        formData
    }),

    invalidatesTags: [
      {
        type: "User",
        id: "PROFILE"
      }
    ]
  }),

  getUsers: builder.query<User[], void>({
  query: () => '/users',

  transformResponse: unwrapUsers,
  providesTags: (result) =>
    result
      ? [
          ...result.map((u) => ({ type: "Users" as const, id: u.id })),
          { type: "Users", id: "LIST" },
        ]
      : [{ type: "Users", id: "LIST" }],
}),

    createUser: builder.mutation<User, Partial<User>>({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data,
      }),
      transformResponse: unwrapUser,
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
    }),

    updateUser: builder.mutation<User, { id: number; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: unwrapUser,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Users', id },
        { type: 'Users', id: 'LIST' },
      ],
    }),

    changeUserRole: builder.mutation<User, { id: number; role: string }>({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: 'PATCH',
        body: { role },
      }),
      transformResponse: unwrapUser,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Users', id },
        { type: 'Users', id: 'LIST' },
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
  useUploadProfileAvatarMutation,
} = usersApi;
