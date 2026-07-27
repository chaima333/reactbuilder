import { api } from "../api/api";

export type PartnerApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export type PartnerSuggestedLevel =
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM";

export type PartnerAvailability =
  | "AVAILABLE"
  | "PARTIAL"
  | "UNAVAILABLE";

export type PartnerApplicationFile = {
  name: string;
  url?: string | null;
  type?: string | null;
  size?: number | null;
};

export type PartnerApplication = {
  id: number;
  siteId: number;

  representativeFullName: string;
  professionalEmail: string;
  phone: string;

  country: string;
  region?: string | null;
  city: string;

  companyName: string;
  legalIdentifier?: string | null;

  expertiseSectors: string[];
  specializations: string;
  yearsExperience: number;

  certificationFiles: PartnerApplicationFile[];
  portfolioFiles: PartnerApplicationFile[];
  portfolioText: string;
  clientReferences?: string | null;

  availability: PartnerAvailability;
  currentWorkload?: number | null;
  dailyRate?: number | null;

  languages: string[];
  workModes: string[];
  services: string[];

  companyLogoFile?: PartnerApplicationFile | null;

  acceptedTerms: boolean;

  status: PartnerApplicationStatus;
  suggestedLevel: PartnerSuggestedLevel;

  reviewedAt?: string | null;
  reviewedByUserId?: number | null;

  createdAt: string;
  updatedAt: string;
};

export type CreatePartnerApplicationPayload = {
  representativeFullName: string;
  professionalEmail: string;
  phone: string;

  country: string;
  region?: string | null;
  city: string;

  companyName: string;
  legalIdentifier?: string | null;

  expertiseSectors: string[];
  specializations: string;
  yearsExperience: number;

  certificationFiles: PartnerApplicationFile[];
  portfolioFiles: PartnerApplicationFile[];
  portfolioText: string;
  clientReferences?: string | null;

  availability: PartnerAvailability;
  currentWorkload?: number | null;
  dailyRate?: number | null;

  languages: string[];
  workModes: string[];
  services: string[];

  companyLogoFile?: PartnerApplicationFile | null;

  acceptedTerms: true;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export const partnerApplicationsApi =
  api.injectEndpoints({
    endpoints: (builder) => ({

      createPublicPartnerApplication:
        builder.mutation<
          PartnerApplication,
          {
            siteId: number;
            body: CreatePartnerApplicationPayload;
          }
        >({
          query: ({
            siteId,
            body
          }) => ({
            url:
              `/public/sites/${siteId}/partner-applications`,
            method: "POST",
            body
          }),

          transformResponse: (
            response: ApiResponse<PartnerApplication>
          ) => response.data,

          invalidatesTags: (
            result,
            error,
            { siteId }
          ) => [
            {
              type: "PartnerApplications",
              id: `SITE-${siteId}`
            }
          ],
        }),

      getPartnerApplications:
        builder.query<
          PartnerApplication[],
          number
        >({
          query: (siteId) =>
            `/sites/${siteId}/partner-applications`,

          transformResponse: (
            response: ApiResponse<PartnerApplication[]>
          ) => response.data || [],

          providesTags: (
            result,
            error,
            siteId
          ) =>
            result
              ? [
                  ...result.map((application) => ({
                    type:
                      "PartnerApplications" as const,
                    id: application.id
                  })),
                  {
                    type: "PartnerApplications" as const,
                    id: `SITE-${siteId}`
                  },
                ]
              : [
                  {
                    type: "PartnerApplications" as const,
                    id: `SITE-${siteId}`
                  }
                ],
        }),

      getPartnerApplicationById:
        builder.query<
          PartnerApplication,
          {
            siteId: number;
            applicationId: number;
          }
        >({
          query: ({
            siteId,
            applicationId
          }) =>
            `/sites/${siteId}/partner-applications/${applicationId}`,

          transformResponse: (
            response: ApiResponse<PartnerApplication>
          ) => response.data,

          providesTags: (
            result,
            error,
            { applicationId }
          ) => [
            {
              type: "PartnerApplications",
              id: applicationId
            }
          ],
        }),

      approvePartnerApplication:
        builder.mutation<
          PartnerApplication,
          {
            siteId: number;
            applicationId: number;
          }
        >({
          query: ({
            siteId,
            applicationId
          }) => ({
            url:
              `/sites/${siteId}/partner-applications/${applicationId}/approve`,
            method: "PATCH"
          }),

          transformResponse: (
            response: ApiResponse<PartnerApplication>
          ) => response.data,

          invalidatesTags: (
            result,
            error,
            {
              siteId,
              applicationId
            }
          ) => [
            {
              type: "PartnerApplications",
              id: applicationId
            },
            {
              type: "PartnerApplications",
              id: `SITE-${siteId}`
            }
          ],
        }),

      rejectPartnerApplication:
        builder.mutation<
          PartnerApplication,
          {
            siteId: number;
            applicationId: number;
          }
        >({
          query: ({
            siteId,
            applicationId
          }) => ({
            url:
              `/sites/${siteId}/partner-applications/${applicationId}/reject`,
            method: "PATCH"
          }),

          transformResponse: (
            response: ApiResponse<PartnerApplication>
          ) => response.data,

          invalidatesTags: (
            result,
            error,
            {
              siteId,
              applicationId
            }
          ) => [
            {
              type: "PartnerApplications",
              id: applicationId
            },
            {
              type: "PartnerApplications",
              id: `SITE-${siteId}`
            }
          ],
        }),

    }),
  });

export const {
  useCreatePublicPartnerApplicationMutation,
  useGetPartnerApplicationsQuery,
  useGetPartnerApplicationByIdQuery,
  useApprovePartnerApplicationMutation,
  useRejectPartnerApplicationMutation
} = partnerApplicationsApi;