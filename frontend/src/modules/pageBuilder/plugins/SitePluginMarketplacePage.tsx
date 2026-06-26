import {
  Alert,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import {
  useMemo,
  useState
} from "react";

import {
  useParams
} from "react-router-dom";

import {
  useSelector
} from "react-redux";

import {
  useSnackbar
} from "notistack";

import type {
  RootState
} from "../../../redux/store";

import {
  useGetMarketplaceQuery,
  useInstallPluginMutation,
  useEnablePluginMutation,
  useDisablePluginMutation,
  useUninstallPluginMutation,
} from "../../../redux/services/pluginMarketplace.api";

import {
  useGetSiteAccessQuery,
  useGetSitesQuery
} from "../../../redux/services/sites.api";

import {
  PluginCard
} from "./PluginCard";

const SitePluginMarketplacePage = () => {
  const { siteId: siteIdParam } =
    useParams();

  const siteId =
    Number(siteIdParam);

  const { enqueueSnackbar } =
    useSnackbar();

  const currentSite =
    useSelector(
      (state: RootState) =>
        state.site.currentSite
    ) as any;

 const {
  data: sites = [],
  isLoading: sitesLoading,
  isFetching: sitesFetching,
  refetch: refetchSites,
} = useGetSitesQuery(
  undefined,
  {
    refetchOnMountOrArgChange: true
  }
);
  const siteFromList =
    useMemo(
      () =>
        sites.find(
          (site: any) =>
            Number(site.id) === siteId
        ),
      [
        sites,
        siteId
      ]
    ) as any;

 const activeSite =
  siteFromList ||
  currentSite;

const {
  data: siteAccess,
  isLoading: accessLoading,
  isFetching: accessFetching,
} = useGetSiteAccessQuery(
  siteId,
  {
    skip:
      !siteId ||
      Number.isNaN(siteId)
  }
);

const siteRole =
  siteAccess?.role ||
  siteFromList?.memberRole ||
  siteFromList?.role ||
  currentSite?.memberRole ||
  currentSite?.role ||
  null;

const roleIsLoading =
  sitesLoading ||
  sitesFetching;

const canManagePlugins =
  siteRole === "OWNER" ||
  siteRole === "ADMIN";

console.log(
  "MARKETPLACE_ROLE_DEBUG",
  {
    siteId,
    sites,
    siteFromList,
    currentSite,
    activeSite,
    siteRole,
    canManagePlugins
  }
);

  const {
    data: plugins = [],
    isLoading,
    isError,
    refetch,
  } = useGetMarketplaceQuery(
    siteId,
    {
      skip:
        !siteId ||
        Number.isNaN(siteId)
    }
  );

  const [
    installPlugin,
    { isLoading: installing }
  ] = useInstallPluginMutation();

  const [
    enablePlugin,
    { isLoading: enabling }
  ] = useEnablePluginMutation();

  const [
    disablePlugin,
    { isLoading: disabling }
  ] = useDisablePluginMutation();

  const [
    uninstallPlugin,
    { isLoading: uninstalling }
  ] = useUninstallPluginMutation();

  const [
    actionError,
    setActionError
  ] = useState<string | null>(null);

  const isBusy =
    installing ||
    enabling ||
    disabling ||
    uninstalling;

  const handleError = (
    error: any
  ) => {
    const message =
      error?.data?.message ||
      error?.message ||
      "Action failed";

    setActionError(message);

    enqueueSnackbar(
      message,
      {
        variant: "error"
      }
    );
  };

  const handleInstall = async (
    pluginId: number
  ) => {
    try {
      setActionError(null);

      await installPlugin({
        siteId,
        pluginId
      }).unwrap();

      enqueueSnackbar(
        "Plugin installed",
        {
          variant: "success"
        }
      );

      refetch();
    } catch (error) {
      handleError(error);
    }
  };

  const handleEnable = async (
    pluginId: number
  ) => {
    try {
      setActionError(null);

      await enablePlugin({
        siteId,
        pluginId
      }).unwrap();

      enqueueSnackbar(
        "Plugin enabled",
        {
          variant: "success"
        }
      );

      refetch();
    } catch (error) {
      handleError(error);
    }
  };

  const handleDisable = async (
    pluginId: number
  ) => {
    try {
      setActionError(null);

      await disablePlugin({
        siteId,
        pluginId
      }).unwrap();

      enqueueSnackbar(
        "Plugin disabled",
        {
          variant: "success"
        }
      );

      refetch();
    } catch (error) {
      handleError(error);
    }
  };

  const handleUninstall = async (
    pluginId: number
  ) => {
    try {
      setActionError(null);

      await uninstallPlugin({
        siteId,
        pluginId
      }).unwrap();

      enqueueSnackbar(
        "Plugin uninstalled",
        {
          variant: "success"
        }
      );

      refetch();
    } catch (error) {
      handleError(error);
    }
  };

  if (
    !siteId ||
    Number.isNaN(siteId)
  ) {
    return (
      <Alert severity="error">
        Site id is missing.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={900}
          >
            Plugin Marketplace
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage plugins for this site.
          </Typography>
        </Box>

        <Alert
          severity={
            canManagePlugins
              ? "success"
              : "info"
          }
          sx={{ py: 0 }}
        >
          Role: {siteRole || "Loading..."}
        </Alert>
      </Stack>

      {!roleIsLoading && siteRole && !canManagePlugins && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
        >
          You can view plugins, but only OWNER or ADMIN can install,
          enable, disable, or uninstall plugins.
        </Alert>
      )}

      {actionError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setActionError(null)}
        >
          {actionError}
        </Alert>
      )}

      {isError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          Failed to load plugins.
        </Alert>
      )}

      {!roleIsLoading && !siteRole && (
  <Alert
    severity="warning"
    sx={{ mb: 3 }}
  >
    Site role is missing from frontend state. Check GET /sites response.
  </Alert>
)}

      {plugins.length === 0 ? (
        <Alert severity="warning">
          No plugins available.
        </Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          {plugins.map((plugin) => (
            <PluginCard
              key={plugin.id}
              plugin={plugin}
              canManagePlugins={canManagePlugins}
              isBusy={isBusy}
              onInstall={handleInstall}
              onEnable={handleEnable}
              onDisable={handleDisable}
              onUninstall={handleUninstall}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SitePluginMarketplacePage;