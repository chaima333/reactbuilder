import { api } from "../api/api";

export type MarketplacePlugin = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  version?: string | null;
  author?: string | null;
  category?: string | null;
  icon?: string | null;
  status?: string | null;

  runtimeEnabled: boolean;
  priority: number;
  events: string[];
  permissions: string[];

  installed: boolean;
  enabled: boolean;
  installedVersion?: string | null;
};

export const pluginMarketplaceApi =
  api.injectEndpoints({
    endpoints: (builder) => ({
      getMarketplace: builder.query<
        MarketplacePlugin[],
        number
      >({
        query: (siteId) =>
          `/sites/${siteId}/plugins`,

        transformResponse: (response: any) => {
          return response?.data || [];
        },

        providesTags: [
          {
            type: "Plugins" as const,
            id: "LIST"
          }
        ],
      }),

      installPlugin: builder.mutation<
        any,
        {
          siteId: number;
          pluginId: number;
        }
      >({
        query: ({
          siteId,
          pluginId
        }) => ({
          url:
            `/sites/${siteId}/plugins/${pluginId}/install`,
          method: "POST",
        }),

        invalidatesTags: [
          {
            type: "Plugins" as const,
            id: "LIST"
          }
        ],
      }),

      enablePlugin: builder.mutation<
        any,
        {
          siteId: number;
          pluginId: number;
        }
      >({
        query: ({
          siteId,
          pluginId
        }) => ({
          url:
            `/sites/${siteId}/plugins/${pluginId}/enable`,
          method: "PATCH",
        }),

        invalidatesTags: [
          {
            type: "Plugins" as const,
            id: "LIST"
          }
        ],
      }),

      disablePlugin: builder.mutation<
        any,
        {
          siteId: number;
          pluginId: number;
        }
      >({
        query: ({
          siteId,
          pluginId
        }) => ({
          url:
            `/sites/${siteId}/plugins/${pluginId}/disable`,
          method: "PATCH",
        }),

        invalidatesTags: [
          {
            type: "Plugins" as const,
            id: "LIST"
          }
        ],
      }),

      uninstallPlugin: builder.mutation<
        any,
        {
          siteId: number;
          pluginId: number;
        }
      >({
        query: ({
          siteId,
          pluginId
        }) => ({
          url:
            `/sites/${siteId}/plugins/${pluginId}/uninstall`,
          method: "DELETE",
        }),

        invalidatesTags: [
          {
            type: "Plugins" as const,
            id: "LIST"
          }
        ],
      }),
    }),
  });

export const {
  useGetMarketplaceQuery,
  useInstallPluginMutation,
  useEnablePluginMutation,
  useDisablePluginMutation,
  useUninstallPluginMutation,
} = pluginMarketplaceApi;