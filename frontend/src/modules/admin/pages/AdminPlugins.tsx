import { Box, Typography } from "@mui/material";

export default function AdminPlugins() {
  return (
    <Box p={4}>
      <Typography variant="h4" fontWeight={900}>
        Plugins
      </Typography>

      <Typography color="text.secondary" mt={1}>
        Manage platform plugins.
      </Typography>
    </Box>
  );
}