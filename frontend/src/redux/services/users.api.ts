import { api } from '../api/api';

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // 1️⃣ لازم تزيد الـ Profile هنا باش الـ Hooks يخدموا لوطة
    getProfile: builder.query<any, void>({
      query: () => '/auth/profile',
      providesTags: ['User'],
    }),

    updateProfile: builder.mutation<any, any>({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User', 'Users'],
    }),

    // باقي الـ Endpoints متاعك...
    getUsers: builder.query<any, void>({
      query: () => '/users',
      providesTags: ['Users'],
    }),
    
    createUser: builder.mutation<any, any>({
      query: (data) => ({ url: "/users", method: "POST", body: data }),
      invalidatesTags: ['Users', 'Stats'],
    }),

    updateUser: builder.mutation<any, { id: number; [key: string]: any }>({
      query: ({ id, ...data }) => ({ url: `/users/${id}`, method: "PUT", body: data }),
      invalidatesTags: ['Users'],
    }),

    changeUserRole: builder.mutation<any, { id: number; role: string }>({
      query: ({ id, role }) => ({ url: `/users/${id}/role`, method: "PATCH", body: { role } }),
      invalidatesTags: ['Users'],
    }),

    deleteUser: builder.mutation<any, number>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Users', 'Stats'],
    }),
  }),
});

// 2️⃣ توّة الـ Hooks هاذم باش يوليوا "قاريين" خاطرهم موجودين الفوق
export const {
  useGetProfileQuery,      // ✅ مريغل توّة
  useUpdateProfileMutation, // ✅ مريغل توّة
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useChangeUserRoleMutation,
  useDeleteUserMutation,
} = usersApi;