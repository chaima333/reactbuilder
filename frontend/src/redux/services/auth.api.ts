import { api } from '../api/api';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<any, any>({
      query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials }),
    }),
    getProfile: builder.query<any, void>({
      query: () => '/auth/profile',
      providesTags: ['User'],
    }),
    googleLogin: builder.mutation<any, { token: string }>({
      query: (data) => ({ url: '/auth/google-login', method: 'POST', body: data }),
    }),
    // ... بقية الـ auth endpoints
  }),
});

export const { useLoginMutation, useGetProfileQuery, useGoogleLoginMutation } = authApi;