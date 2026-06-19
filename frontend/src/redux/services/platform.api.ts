import { api } from "../api/api";

export type PlatformSettings = {
  platformName: string;
  mediaPlugin: boolean;
  seoPlugin: boolean;
  versionPlugin: boolean;
  figmaPlugin: boolean;
  aiEnabled: boolean;
  maintenanceMode: boolean;
};

export const platformApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPlatformSettings: builder.query<PlatformSettings, void>({
      query: () => "/platform/settings",
      transformResponse: (res: { data: PlatformSettings }) => res.data,
      providesTags: ["PlatformSettings"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetPlatformSettingsQuery } = platformApi;
