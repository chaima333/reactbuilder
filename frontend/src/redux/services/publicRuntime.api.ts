import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError
} from "@reduxjs/toolkit/query/react";

import {
  BACKEND_URL
} from "../../config/api";

import type {
  RootState
} from "../store";

import {
  logoutVisitor,
  updateVisitorTokens
} from "../features/visitorAuthSlice";

interface PublicRuntimeRequest {
  siteId: number;
  request: FetchArgs;
}

interface PublicSiteQuery {
  siteId: number;
  visitorId?: number;
}

interface PublicPageBySlugQuery
  extends PublicSiteQuery {
  slug: string;
}

interface PublicPageByIdQuery
  extends PublicSiteQuery {
  pageId: number;
}

const rawPublicBaseQuery =
  fetchBaseQuery({
    baseUrl: BACKEND_URL
  });

const buildRequest = (
  request: FetchArgs,
  accessToken?: string | null
): FetchArgs => {
  const headers =
    new Headers(
      request.headers as
        | HeadersInit
        | undefined
    );

  if (accessToken) {
    headers.set(
      "Authorization",
      `Bearer ${accessToken}`
    );
  } else {
    headers.delete(
      "Authorization"
    );
  }

  return {
    ...request,
    headers
  };
};

const publicBaseQueryWithVisitorReauth:
  BaseQueryFn<
    PublicRuntimeRequest,
    unknown,
    FetchBaseQueryError
  > =
  async (
    args,
    api,
    extraOptions
  ) => {
    const getSession = () =>
      (
        api.getState() as RootState
      ).visitorAuth.sessions[
        String(args.siteId)
      ];

    let session =
      getSession();

    let result =
      await rawPublicBaseQuery(
        buildRequest(
          args.request,
          session?.accessToken
        ),
        api,
        extraOptions
      );
    if (
      result.error?.status === 401 &&
      session?.refreshToken
    ) {
      const refreshResult =
        await rawPublicBaseQuery(
          {
            url:
              `/api/public/sites/${args.siteId}/visitor-auth/refresh`,

            method:
              "POST",

            body: {
              refreshToken:
                session.refreshToken
            }
          },
          api,
          extraOptions
        );

      const refreshData =
        (
          refreshResult.data as any
        )?.data ||
        refreshResult.data;

      if (
        refreshData?.accessToken &&
        refreshData?.refreshToken
      ) {
        api.dispatch(
          updateVisitorTokens({
            siteId:
              args.siteId,

            accessToken:
              refreshData.accessToken,

            refreshToken:
              refreshData.refreshToken
          })
        );

        result =
          await rawPublicBaseQuery(
            buildRequest(
              args.request,
              refreshData.accessToken
            ),
            api,
            extraOptions
          );
      } else {
        api.dispatch(
          logoutVisitor({
            siteId:
              args.siteId
          })
        );
      }
    }

    return result;
  };

export const publicRuntimeApi =
  createApi({
    reducerPath:
      "publicRuntimeApi",

    baseQuery:
      publicBaseQueryWithVisitorReauth,

    endpoints: (
      builder
    ) => ({
      getVisitorPublicSite:
        builder.query<
          any,
          PublicSiteQuery
        >({
          query: ({
            siteId
          }) => ({
            siteId,

            request: {
              url:
                `/p/public/sites/${siteId}`,

              method:
                "GET"
            }
          }),

          transformResponse: (
            response: any
          ) =>
            response?.data ||
            response
        }),

      getVisitorPublicPageBySlug:
        builder.query<
          any,
          PublicPageBySlugQuery
        >({
          query: ({
            siteId,
            slug
          }) => ({
            siteId,

            request: {
              url:
                `/p/public/pages/${siteId}/${encodeURIComponent(
                  slug
                )}`,

              method:
                "GET"
            }
          }),

          transformResponse: (
            response: any
          ) =>
            response?.data ||
            response
        }),

      getVisitorPublicPageById:
        builder.query<
          any,
          PublicPageByIdQuery
        >({
          query: ({
            siteId,
            pageId
          }) => ({
            siteId,

            request: {
              url:
                `/api/sites/${siteId}/pages/${pageId}/public`,

              method:
                "GET"
            }
          }),

          transformResponse: (
            response: any
          ) =>
            response?.data ||
            response
        })
    })
  });

export const {
  useGetVisitorPublicSiteQuery,
  useGetVisitorPublicPageBySlugQuery,
  useGetVisitorPublicPageByIdQuery
} =
  publicRuntimeApi;
