import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  CardActions,
  Divider,
  Box,
} from "@mui/material";

import type {
  MarketplacePlugin
} from "../../../redux/services/pluginMarketplace.api";

type PluginCardProps = {
  plugin: MarketplacePlugin;
  canManagePlugins: boolean;
  isBusy: boolean;
  onInstall: (pluginId: number) => void;
  onEnable: (pluginId: number) => void;
  onDisable: (pluginId: number) => void;
  onUninstall: (pluginId: number) => void;
};

export const PluginCard = ({
  plugin,
  canManagePlugins,
  isBusy,
  onInstall,
  onEnable,
  onDisable,
  onUninstall,
}: PluginCardProps) => {
  return (
    <Card
      elevation={3}
      sx={{
        height: "100%",
        minHeight: 310,
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" fontWeight={900}>
          {plugin.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, minHeight: 44 }}
        >
          {plugin.description || "No description available."}
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
          <Chip
            size="small"
            color="primary"
            variant="outlined"
            label={`v${plugin.version || "1.0.0"}`}
          />

          <Chip
            size="small"
            variant="outlined"
            label={plugin.category || "General"}
          />

          <Chip
            size="small"
            variant="outlined"
            label={plugin.author || "ReactBuilder"}
          />
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={1} flexWrap="wrap">
          {!plugin.installed ? (
            <Chip
              size="small"
              color="default"
              label="Not Installed"
            />
          ) : (
            <>
              <Chip
                size="small"
                color="success"
                label="Installed"
              />

              <Chip
                size="small"
                color={plugin.enabled ? "success" : "warning"}
                label={plugin.enabled ? "Enabled" : "Disabled"}
              />
            </>
          )}

          {!canManagePlugins && (
            <Chip
              size="small"
              variant="outlined"
              label="Read Only"
            />
          )}
        </Stack>

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Mode: {plugin.mode || "runtime"}
          </Typography>

          <Typography variant="caption" color="text.secondary" display="block">
            Priority: {plugin.priority ?? 0}
          </Typography>

          <Typography variant="caption" color="text.secondary" display="block">
            Runtime: {plugin.runtimeEnabled ? "Active" : "Inactive"}
          </Typography>
        </Box>
      </CardContent>

      {canManagePlugins && (
        <CardActions
          sx={{
            px: 2,
            pb: 2,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {!plugin.installed && (
            <Button
              variant="contained"
              disabled={isBusy || !plugin.runtimeEnabled}
              onClick={() => onInstall(plugin.id)}
            >
              Install
            </Button>
          )}

          {plugin.installed && !plugin.enabled && (
            <Button
              variant="contained"
              disabled={isBusy || !plugin.runtimeEnabled}
              onClick={() => onEnable(plugin.id)}
            >
              Enable
            </Button>
          )}

          {plugin.installed && plugin.enabled && (
            <Button
              variant="outlined"
              disabled={isBusy}
              onClick={() => onDisable(plugin.id)}
            >
              Disable
            </Button>
          )}

          {plugin.installed && (
            <Button
              variant="outlined"
              color="error"
              disabled={isBusy}
              onClick={() => onUninstall(plugin.id)}
            >
              Uninstall
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  );
};