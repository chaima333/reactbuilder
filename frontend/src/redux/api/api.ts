/*import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { logout, setCredentials } from '../features/authSlice';

const API_URL = 'https://backend-rmfq.onrender.com/api';

/* ==========================================================
    UTILITY: استخراج الـ Subdomain من الـ URL
   ========================================================== *
const getSubdomain = () => {
  const host = window.location.hostname;
  const parts = host.split('.');
  
  // التعامل مع localhost و الـ domains الحقيقية
  // إذا كان الرابط: testsite.localhost:5173 -> سيعيد "testsite"
  if (parts.length > 1 && parts[parts.length - 1] !== 'localhost') {
    return parts[0];
  } else if (parts.length > 1 && host.includes('localhost')) {
    return parts[0];
  }
  
  return 'admin'; // القيمة الافتراضية
};

/* =========================
    BASE QUERY
   ========================= *
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    // 1. إضافة الـ Token من الـ Redux Store
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // 2. 🔥 إضافة الـ Subdomain Header لربط الـ Tenant
    const subdomain = getSubdomain();
    headers.set('x-subdomain', subdomain);

    return headers;
  },
});

/* =========================
    REFRESH TOKEN LOGIC
   ========================= *
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;

    if (!refreshToken) {
      api.dispatch(logout());
      return result;
    }

    // محاولة تجديد الـ Token
    const refreshResult = await baseQuery(
      {
        url: '/auth/refresh_token',
        method: 'POST',
        body: { refreshToken },
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const { accessToken, refreshToken: newRefreshToken } = refreshResult.data as any;
      const currentUser = (api.getState() as RootState).auth.user;

      if (currentUser) {
        api.dispatch(
          setCredentials({
            user: currentUser,
            accessToken,
            refreshToken: newRefreshToken ?? refreshToken,
          })
        );
        // إعادة تنفيذ الطلب الأصلي بعد التجديد
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

/* =========================
    API DEFINITION
   ========================= *
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Stats',
    'Activity',
    'Sites',
    'Pages',
    'User',
    'Media',
    'Users',
    'PendingUsers',
  ],
  endpoints: (builder) => ({
    /* ================= DASHBOARD ================= 
    getDashboardStats: builder.query<any, void>({
      query: () => '/dashboard/stats',
      providesTags: ['Stats'],
    }),

    getActivityLog: builder.query<any, { limit?: number } | void>({
      query: (params) => `/dashboard/activity?limit=${params?.limit || 50}`,
      providesTags: ['Activity'],
    }),

    getSiteStats: builder.query<any, number>({
      query: (siteId) => `/dashboard/sites/${siteId}/stats`,
      providesTags: ['Sites'],
    }),

    /* ================= SITES ================= *
    getSites: builder.query<any, void>({
      query: () => '/sites',
      providesTags: ['Sites'],
    }),

    getSiteById: builder.query<any, number>({
      query: (id) => `/sites/${id}`,
      providesTags: ['Sites'],
    }),

    createSite: builder.mutation<any, any>({
      query: (data) => ({
        url: '/sites',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Sites', 'Stats'],
    }),

    updateSite: builder.mutation<any, { id: number; [key: string]: any }>({
      query: ({ id, ...data }) => ({
        url: `/sites/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Sites', 'Stats'],
    }),

    deleteSite: builder.mutation<any, number>({
      query: (id) => ({
        url: `/sites/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sites', 'Stats'],
    }),

    /* ================= PAGES ================= *
    getPages: builder.query<any, number>({
      query: (siteId) => `/sites/${siteId}/pages`,
      providesTags: ['Pages'],
    }),

    getPageById: builder.query<any, { siteId: number; pageId: number }>({
      query: ({ siteId, pageId }) => `/sites/${siteId}/pages/${pageId}`,
      providesTags: ['Pages'],
    }),

    createPage: builder.mutation<any, any>({
      query: ({ siteId, ...data }) => ({
        url: `/sites/${siteId}/pages`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Pages', 'Sites'],
    }),

    updatePage: builder.mutation<any, any>({
      query: ({ siteId, pageId, ...data }) => ({
        url: `/sites/${siteId}/pages/${pageId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Pages', 'Sites'],
    }),

    deletePage: builder.mutation<any, { siteId: number; pageId: number }>({
      query: ({ siteId, pageId }) => ({
        url: `/sites/${siteId}/pages/${pageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Pages', 'Sites'],
    }),

    /* ================= MEDIA ================= *
    getMedia: builder.query<any, void>({
      query: () => '/media',
      providesTags: ['Media'],
    }),

    uploadMedia: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: '/media/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Media'],
    }),

    deleteMedia: builder.mutation<any, number>({
      query: (id) => ({
        url: `/media/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Media'],
    }),

    updateMediaAlt: builder.mutation<any, { id: number; alt: string }>({
      query: ({ id, alt }) => ({
        url: `/media/${id}/alt`,
        method: 'PUT',
        body: { alt },
      }),
      invalidatesTags: ['Media'],
    }),

    /* ================= USERS MANAGEMENT ================= *
    getUsers: builder.query<any, void>({
      query: () => '/users',
      providesTags: ['Users'],
    }),

    createUser: builder.mutation<any, any>({
      query: (data) => ({
        url: "/users",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Users', 'Stats'],
    }),

    updateUser: builder.mutation<any, { id: number; [key: string]: any }>({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),

    changeUserRole: builder.mutation<any, { id: number; role: string }>({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ['Users'],
    }),

    deleteUser: builder.mutation<any, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users', 'Stats'],
    }),

    /* ================= AUTH & PROFILE ================= *
    login: builder.mutation<any, any>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    register: builder.mutation<any, any>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),

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

    /* ================= ADMIN ACTIONS ================= *
    getPendingUsers: builder.query<any, void>({
      query: () => '/admin/pending-users',
      providesTags: ['PendingUsers'],
    }),

    approveUser: builder.mutation<any, number>({
      query: (id) => ({
        url: `/admin/approve-user/${id}`,
        method: 'POST',
      }),
      invalidatesTags: ['PendingUsers', 'Users', 'Stats'],
    }),

    rejectUser: builder.mutation<any, number>({
      query: (id) => ({
        url: `/admin/reject-user/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PendingUsers', 'Users'],
    }),

    forgotPassword: builder.mutation<any, { email: string }>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    googleLogin: builder.mutation<any, { token: string }>({
      query: (data) => ({
        url: '/auth/google-login',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetActivityLogQuery,
  useGetSiteStatsQuery,
  useGetSitesQuery,
  useGetSiteByIdQuery,
  useCreateSiteMutation,
  useUpdateSiteMutation,
  useDeleteSiteMutation,
  useGetPagesQuery,
  useGetPageByIdQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
  useGetMediaQuery,
  useUploadMediaMutation,
  useDeleteMediaMutation,
  useUpdateMediaAltMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useChangeUserRoleMutation,
  useDeleteUserMutation,
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetPendingUsersQuery,
  useApproveUserMutation,
  useRejectUserMutation,
  useForgotPasswordMutation,
  useGoogleLoginMutation,
} = api;*/


import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Stats', 'Activity', 'Sites', 'Pages', 'User', 'Media', 'Users', 'PendingUsers'],
  endpoints: () => ({}), // فارغ، سيتم ملؤه عبر injectEndpoints
});