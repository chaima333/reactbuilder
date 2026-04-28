import { api } from '../api/api';

type AuthResponse = {
  user: {
    id: number;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
};

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({

    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    getProfile: builder.query<AuthResponse['user'], void>({
      query: () => '/auth/profile',
      providesTags: [{ type: 'User', id: 'PROFILE' }],
    }),

    googleLogin: builder.mutation<AuthResponse, { token: string }>({
      query: (data) => ({
        url: '/auth/google-login',
        method: 'POST',
        body: data,
      }),
    }),

  }),
});

export const { useLoginMutation, useGetProfileQuery, useGoogleLoginMutation } = authApi;