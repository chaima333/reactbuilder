import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { logout, setCredentials } from '../features/authSlice';

const API_URL = 'https://backend-rmfq.onrender.com/api';

const getSubdomain = () => {
  const host = window.location.hostname;
  const parts = host.split('.');
  if (parts.length > 1 && parts[parts.length - 1] !== 'localhost') return parts[0];
  if (parts.length > 1 && host.includes('localhost')) return parts[0];
  return 'admin';
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('x-subdomain', getSubdomain());
    return headers;
  },
});

export const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;
    if (!refreshToken) {
      api.dispatch(logout());
      return result;
    }

    const refreshResult = await rawBaseQuery(
      { url: '/auth/refresh_token', method: 'POST', body: { refreshToken } },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const { accessToken, refreshToken: newRefreshToken } = refreshResult.data as any;
      const currentUser = (api.getState() as RootState).auth.user;

      if (currentUser) {
        api.dispatch(setCredentials({
          user: currentUser,
          accessToken,
          refreshToken: newRefreshToken ?? refreshToken,
        }));
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }
  return result;
};