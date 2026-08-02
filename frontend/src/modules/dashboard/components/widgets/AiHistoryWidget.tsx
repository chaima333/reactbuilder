import React from "react";
import {
  Paper,
  Typography,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { useGetAiHistoryQuery } from "../../../../redux/services/ai.api";

export const AiHistoryWidget: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const siteId = useSelector((state: RootState) => state.site.currentSite?.id);

  const { data, isLoading } = useGetAiHistoryQuery(Number(siteId), {
    skip: !siteId,
  });

  const history = data?.data || [];

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        height: "100%",
        bgcolor: "background.paper",
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: "none",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 2 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.1),
            color: theme.palette.primary.main,
          }}
        >
          <AutoAwesome fontSize="small" />
        </Box>

        <Box>
          <Typography variant="h6" fontWeight={800}>
            AI Generation History
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Latest AI website generations for this site
          </Typography>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={28} sx={{ color: theme.palette.primary.main }} />
        </Box>
      ) : history.length === 0 ? (
        <Box
          sx={{
            py: 4,
            borderRadius: 2,
            textAlign: "center",
            bgcolor: alpha(theme.palette.background.default, 0.5),
            border: `1px dashed ${theme.palette.divider}`,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No AI generations yet.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {["Prompt", "Category", "Pages", "Status", "Date"].map((head) => (
                  <TableCell
                    key={head}
                    sx={{
                      fontWeight: 800,
                      color: "text.secondary",
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {history.slice(0, 5).map((item: any) => (
                <TableRow key={item.id} hover sx={{ "& td": { borderBottom: `1px solid ${theme.palette.divider}` } }}>
                  <TableCell sx={{ maxWidth: 360 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {item.prompt}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip label={item.category} size="small" sx={{ fontWeight: 800, bgcolor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.1), color: theme.palette.primary.main }} />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontWeight={800}>
                      {item.pagesGenerated}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={item.status === "success" ? "Success" : item.status}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontWeight: 800,
                        borderColor: item.status === "success" ? theme.palette.success.main : theme.palette.error.main,
                        color: item.status === "success" ? theme.palette.success.main : theme.palette.error.main,
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Paper>
  );
};