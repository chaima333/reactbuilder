import {
  createApi,
  fetchBaseQuery
} from "@reduxjs/toolkit/query/react";

import {
  API_URL
} from "../../config/api";

import {
  logoutVisitor,
  setVisitorCredentials,
  updateVisitorTokens
} from "../features/visitorAuthSlice";

import type {
  SiteVisitor
} from "../features/visitorAuthSlice";

interface VisitorAuthPayload {
  visitor: SiteVisitor;
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: string;
}

interface VisitorRegisterPayload {
  visitor: SiteVisitor;
}

interface RegisterVisitorInput {
  siteId: number;
  fullName: string;
  email: string;
  password: string;
}

interface LoginVisitorInput {
  siteId: number;
  email: string;
  password: string;
}

interface RefreshVisitorInput {
  siteId: number;
  refreshToken: string;
}

interface LogoutVisitorInput {
  siteId: number;
  refreshToken: string;
}

interface GetVisitorMeInput {
  siteId: number;
  accessToken: string;
}

const extractAuthPayload = (
  response: any
): VisitorAuthPayload => {
  const payload =
    response?.data ||
    response;

  if (
    !payload?.visitor ||
    !payload?.accessToken ||
    !payload?.refreshToken
  ) {
    throw new Error(
      "Invalid visitor authentication response"
    );
  }

  return payload;
};

const extractRegisterPayload = (
  response: any
): VisitorRegisterPayload => {
  const payload =
    response?.data ||
    response;

  if (!payload?.visitor) {
    throw new Error(
      "Invalid visitor registration response"
    );
  }

  return {
    visitor: payload.visitor
  };
};

const extractVisitor = (
  response: any
): SiteVisitor => {
  return (
    response?.data?.visitor ||
    response?.data ||
    response?.visitor ||
    response
  );
};

export const visitorAuthApi =
  createApi({
    reducerPath:
      "visitorAuthApi",

    baseQuery:
      fetchBaseQuery({
        baseUrl: API_URL
      }),

    endpoints: (
      builder
    ) => ({
      registerVisitor:
        builder.mutation<
          VisitorRegisterPayload,
          RegisterVisitorInput
        >({
          query: ({
            siteId,
            ...body
          }) => ({
            url:
              `/public/sites/${siteId}/visitor-auth/register`,

            method:
              "POST",

            body
          }),

          transformResponse:
            extractRegisterPayload
        }),

      loginVisitor:
        builder.mutation<
          VisitorAuthPayload,
          LoginVisitorInput
        >({
          query: ({
            siteId,
            ...body
          }) => ({
            url:
              `/public/sites/${siteId}/visitor-auth/login`,

            method:
              "POST",

            body
          }),

          transformResponse:
            extractAuthPayload,

          async onQueryStarted(
            {
              siteId
            },
            {
              dispatch,
              queryFulfilled
            }
          ) {
            try {
              const {
                data
              } =
                await queryFulfilled;

              dispatch(
                setVisitorCredentials({
                  siteId,
                  visitor:
                    data.visitor,
                  accessToken:
                    data.accessToken,
                  refreshToken:
                    data.refreshToken
                })
              );
            } catch {
              // Error handled by UI.
            }
          }
        }),

      refreshVisitor:
        builder.mutation<
          Omit<
            VisitorAuthPayload,
            "visitor"
          > & {
            visitor?: SiteVisitor;
          },
          RefreshVisitorInput
        >({
          query: ({
            siteId,
            refreshToken
          }) => ({
            url:
              `/public/sites/${siteId}/visitor-auth/refresh`,

            method:
              "POST",

            body: {
              refreshToken
            }
          }),

          transformResponse: (
            response: any
          ) =>
            response?.data ||
            response,

          async onQueryStarted(
            {
              siteId
            },
            {
              dispatch,
              queryFulfilled
            }
          ) {
            try {
              const {
                data
              } =
                await queryFulfilled;

              dispatch(
                updateVisitorTokens({
                  siteId,
                  accessToken:
                    data.accessToken,
                  refreshToken:
                    data.refreshToken
                })
              );
            } catch {
              dispatch(
                logoutVisitor({
                  siteId
                })
              );
            }
          }
        }),

      logoutVisitorSession:
        builder.mutation<
          {
            success: boolean;
          },
          LogoutVisitorInput
        >({
          query: ({
            siteId,
            refreshToken
          }) => ({
            url:
              `/public/sites/${siteId}/visitor-auth/logout`,

            method:
              "POST",

            body: {
              refreshToken
            }
          }),

          async onQueryStarted(
            {
              siteId
            },
            {
              dispatch,
              queryFulfilled
            }
          ) {
            try {
              await queryFulfilled;
            } finally {
              dispatch(
                logoutVisitor({
                  siteId
                })
              );
            }
          }
        }),

      getCurrentVisitor:
        builder.query<
          SiteVisitor,
          GetVisitorMeInput
        >({
          query: ({
            siteId,
            accessToken
          }) => ({
            url:
              `/public/sites/${siteId}/visitor-auth/me`,

            method:
              "GET",

            headers: {
              Authorization:
                `Bearer ${accessToken}`
            }
          }),

          transformResponse:
            extractVisitor
        })
    })
  });

export const {
  useRegisterVisitorMutation,
  useLoginVisitorMutation,
  useRefreshVisitorMutation,
  useLogoutVisitorSessionMutation,
  useGetCurrentVisitorQuery
} =
  visitorAuthApi;