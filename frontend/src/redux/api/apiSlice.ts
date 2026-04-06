import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
const API_URL = 'https://backend-rmfq.onrender.com/api';


// URL de l'API - à modifier selon l'environnement
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Stats', 'Activity', 'Sites', 'Pages', 'User', 'Media', 'Users', 'PendingUsers'],
  
  endpoints: (builder) => ({
    // Dashboard
    getDashboardStats: builder.query({
      query: () => '/dashboard/stats',
      providesTags: ['Stats'],
    }),
    getActivityLog: builder.query({
      query: (params?: { limit?: number }) => `/dashboard/activity?limit=${params?.limit || 50}`,
      providesTags: ['Activity'],
    }),
    getSiteStats: builder.query({
      query: (siteId: number) => `/dashboard/sites/${siteId}/stats`,
      providesTags: ['Sites'],
    }),
    
    // Sites CRUD
    getSites: builder.query({
      query: () => '/sites',
      providesTags: ['Sites'],
    }),
    getSiteById: builder.query({
      query: (id: number) => `/sites/${id}`,
      providesTags: ['Sites'],
    }),
    createSite: builder.mutation({
      query: (data) => ({
        url: '/sites',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Sites', 'Stats'],
    }),
    updateSite: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/sites/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Sites', 'Stats'],
    }),
    deleteSite: builder.mutation({
      query: (id: number) => ({
        url: `/sites/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sites', 'Stats'],
    }),
    
    // Pages CRUD
    getPages: builder.query({
      query: (siteId: number) => `/sites/${siteId}/pages`,
      providesTags: ['Pages'],
    }),
    getPageById: builder.query({
      query: ({ siteId, pageId }: { siteId: number; pageId: number }) => 
        `/sites/${siteId}/pages/${pageId}`,
      providesTags: ['Pages'],
    }),
    createPage: builder.mutation({
      query: ({ siteId, ...data }: { siteId: number; title: string; content: string; blocks: any[]; status: string }) => ({
        url: `/sites/${siteId}/pages`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Pages', 'Sites'],
    }),
    updatePage: builder.mutation({
      query: ({ siteId, pageId, ...data }: { siteId: number; pageId: number; title: string; content: string; blocks: any[]; status: string }) => ({
        url: `/sites/${siteId}/pages/${pageId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Pages', 'Sites'],
    }),
    deletePage: builder.mutation({
      query: ({ siteId, pageId }: { siteId: number; pageId: number }) => ({
        url: `/sites/${siteId}/pages/${pageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Pages', 'Sites'],
    }),
    
    // Media
    getMedia: builder.query({
      query: () => '/media',
      providesTags: ['Media'],
    }),
    uploadMedia: builder.mutation({
      query: (formData) => ({
        url: '/media/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Media'],
    }),
    deleteMedia: builder.mutation({
      query: (id: number) => ({
        url: `/media/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Media'],
    }),
    updateMediaAlt: builder.mutation({
      query: ({ id, alt }: { id: number; alt: string }) => ({
        url: `/media/${id}/alt`,
        method: 'PUT',
        body: { alt },
      }),
      invalidatesTags: ['Media'],
    }),
    
    // Users
    getUsers: builder.query({
      query: () => '/users',
      providesTags: ['Users'],
    }),
    getUserById: builder.query({
      query: (id: number) => `/users/${id}`,
      providesTags: ['Users'],
    }),
    createUser: builder.mutation({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: builder.mutation({
      query: (id: number) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
    changeUserRole: builder.mutation({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['Users'],
    }),
    
    // Auth
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    getProfile: builder.query({
      query: () => '/auth/profile',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    
    // Approbation
    getPendingUsers: builder.query({
      query: () => '/admin/pending-users',
      providesTags: ['PendingUsers'],
    }),
    approveUser: builder.mutation({
      query: (id: number) => ({
        url: `/admin/approve-user/${id}`,
        method: 'POST',
      }),
      invalidatesTags: ['PendingUsers', 'Users'],
    }),
    rejectUser: builder.mutation({
      query: (id: number) => ({
        url: `/admin/reject-user/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PendingUsers', 'Users'],
    }),
  }),
});

// Export all hooks
export const {
  // Dashboard
  useGetDashboardStatsQuery,
  useGetActivityLogQuery,
  useGetSiteStatsQuery,
  // Sites
  useGetSitesQuery,
  useGetSiteByIdQuery,
  useCreateSiteMutation,
  useUpdateSiteMutation,
  useDeleteSiteMutation,
  // Pages
  useGetPagesQuery,
  useGetPageByIdQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
  // Media
  useGetMediaQuery,
  useUploadMediaMutation,
  useDeleteMediaMutation,
  useUpdateMediaAltMutation,
  // Users
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useChangeUserRoleMutation,
  // Approbation
  useGetPendingUsersQuery,
  useApproveUserMutation,
  useRejectUserMutation,
  // Auth
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = api;