import { api } from "../api/api";

export const invitationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    acceptInvitation: builder.mutation<
      {
        success: boolean;
        message: string;
        data?: {
          siteId: number;
          role: string;
        };
      },
      {
        token: string;
      }
    >({
      query: ({ token }) => ({
        url: "/invitations/accept",
        method: "POST",
        body: {
          token
        }
      })
    })
  })
});

export const {
  useAcceptInvitationMutation
} = invitationsApi;