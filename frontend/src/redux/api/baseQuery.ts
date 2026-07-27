import {
  fetchBaseQuery
} from "@reduxjs/toolkit/query/react";

import type {
  RootState
} from "../store";

import {
  logout,
  setCredentials
} from "../features/authSlice";

import {
  API_URL
} from "../../config/api";

const rawBaseQuery =
  fetchBaseQuery({
    baseUrl: API_URL,

    prepareHeaders: (
      headers,
      { getState }
    ) => {
      const state =
        getState() as RootState;

      const token =
        state.auth.accessToken;

      const siteId =
        state.site.currentSite?.id;

      if (token) {
        headers.set(
          "Authorization",
          `Bearer ${token}`
        );
      }

      if (siteId) {
        headers.set(
          "x-site-id",
          String(siteId)
        );
      }

      return headers;
    },
  });

export const baseQueryWithReauth = async (
  args: any,
  api: any,
  extraOptions: any
) => {
  let result =
    await rawBaseQuery(
      args,
      api,
      extraOptions
    );

  if (
    result.error &&
    result.error.status === 401
  ) {
    const refreshToken =
      (api.getState() as RootState)
        .auth.refreshToken;

    if (!refreshToken) {
      api.dispatch(
        logout()
      );

      return result;
    }

    const refreshResult =
      await rawBaseQuery(
        {
          url: "/auth/refresh_token",
          method: "POST",
          body: {
            refreshToken
          },
        },
        api,
        extraOptions
      );

    if (refreshResult.data) {
      const {
        accessToken,
        refreshToken: newRefreshToken
      } = refreshResult.data as any;

      const currentUser =
        (api.getState() as RootState)
          .auth.user;

      if (currentUser) {
        api.dispatch(
          setCredentials({
            user: currentUser,
            accessToken,
            refreshToken:
              newRefreshToken ??
              refreshToken,
          })
        );

        result =
          await rawBaseQuery(
            args,
            api,
            extraOptions
          );
      } else {
        api.dispatch(
          logout()
        );
      }
    } else {
      api.dispatch(
        logout()
      );
    }
  }

  return result;
};