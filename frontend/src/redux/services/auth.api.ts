import { api } from "../api/api";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  twoFactorEnabled?: boolean;
};

type AuthResponse = {
  success?: boolean;
  user: User;
  accessToken: string;
  refreshToken: string;
};

type LoginResponse =
  | AuthResponse
  | {
      success?: boolean;
      requires2FA: true;
      userId: number;
      user: User;
    };

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    verify2FALogin: builder.mutation<AuthResponse, { userId: number; token: string }>({
      query: (body) => ({
        url: "/auth/2fa/verify-login",
        method: "POST",
        body,
      }),
    }),

    setup2FA: builder.mutation<{ qrCode: string; secret: string }, void>({
      query: () => ({
        url: "/auth/2fa/setup",
        method: "POST",
      }),
      transformResponse: (res: any) => res.data,
    }),

    verify2FASetup: builder.mutation<{ twoFactorEnabled: boolean }, { token: string }>({
      query: (body) => ({
        url: "/auth/2fa/verify-setup",
        method: "POST",
        body,
      }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: [{ type: "User", id: "PROFILE" }],
    }),

    disable2FA: builder.mutation<{ twoFactorEnabled: boolean }, void>({
      query: () => ({
        url: "/auth/2fa/disable",
        method: "POST",
      }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: [{ type: "User", id: "PROFILE" }],
    }),

    getProfile: builder.query<User, void>({
      query: () => "/auth/profile",
      providesTags: [{ type: "User", id: "PROFILE" }],
    }),

    googleLogin: builder.mutation<AuthResponse, { token: string }>({
      query: (data) => ({
        url: "/auth/google-login",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useVerify2FALoginMutation,
  useSetup2FAMutation,
  useVerify2FASetupMutation,
  useDisable2FAMutation,
  useGetProfileQuery,
  useGoogleLoginMutation,
} = authApi;