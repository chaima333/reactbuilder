import {
  api
} from "../api/api";

export type SiteMemberRole =
  | "OWNER"
  | "ADMIN"
  | "EDITOR"
  | "VIEWER";

export type AssignableSiteMemberRole =
  | "ADMIN"
  | "EDITOR"
  | "VIEWER";

export type SiteMemberUser = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "VIEWER";
  avatar?: string | null;
  isApproved?: boolean;
  createdAt?: string;
};

export type SiteMember = {
  id?: number;
  userId: number;
  siteId: number;
  role: SiteMemberRole;
  createdAt?: string;
  updatedAt?: string;
  user?: SiteMemberUser;
};

export const siteMembersApi =
  api.injectEndpoints({
    endpoints: (builder) => ({

      getSiteMembers: builder.query<
        SiteMember[],
        number | string
      >({
        query: (siteId) =>
          `/sites/${siteId}/members`,

        transformResponse: (response: any) =>
          response?.data || [],

        providesTags: [
          {
            type: "SiteMembers" as const,
            id: "LIST"
          }
        ],
      }),

      addSiteMember: builder.mutation<
        SiteMember,
        {
          siteId: number | string;
          email: string;
          role: AssignableSiteMemberRole;
        }
      >({
        query: ({
          siteId,
          email,
          role
        }) => ({
          url: `/sites/${siteId}/members`,
          method: "POST",
          body: {
            email,
            role
          }
        }),

        transformResponse: (response: any) =>
          response?.data || response,

        invalidatesTags: [
          {
            type: "SiteMembers" as const,
            id: "LIST"
          },
          {
            type: "Sites" as const,
            id: "LIST"
          }
        ],
      }),

      updateSiteMemberRole: builder.mutation<
        SiteMember,
        {
          siteId: number | string;
          userId: number | string;
          role: AssignableSiteMemberRole;
        }
      >({
        query: ({
          siteId,
          userId,
          role
        }) => ({
          url: `/sites/${siteId}/members/${userId}/role`,
          method: "PATCH",
          body: {
            role
          }
        }),

        transformResponse: (response: any) =>
          response?.data || response,

        invalidatesTags: [
          {
            type: "SiteMembers" as const,
            id: "LIST"
          },
          {
            type: "Sites" as const,
            id: "LIST"
          }
        ],
      }),

      removeSiteMember: builder.mutation<
        any,
        {
          siteId: number | string;
          userId: number | string;
        }
      >({
        query: ({
          siteId,
          userId
        }) => ({
          url: `/sites/${siteId}/members/${userId}`,
          method: "DELETE"
        }),

        invalidatesTags: [
          {
            type: "SiteMembers" as const,
            id: "LIST"
          },
          {
            type: "Sites" as const,
            id: "LIST"
          }
        ],
      }),
    }),
  });

export const {
  useGetSiteMembersQuery,
  useAddSiteMemberMutation,
  useUpdateSiteMemberRoleMutation,
  useRemoveSiteMemberMutation,
} = siteMembersApi;