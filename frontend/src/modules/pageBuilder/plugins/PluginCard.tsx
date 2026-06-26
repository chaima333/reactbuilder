import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  CardActions,
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
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={800}>
          {plugin.name}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {plugin.description || "No description available."}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Chip
            size="small"
            label={plugin.installed ? "Installed" : "Not installed"}
          />

          <Chip
            size="small"
            label={plugin.enabled ? "Enabled" : "Disabled"}
          />

          {!canManagePlugins && (
            <Chip
              size="small"
              label="Read-only"
              variant="outlined"
            />
          )}
        </Stack>
      </CardContent>

      {canManagePlugins && (
        <CardActions>
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