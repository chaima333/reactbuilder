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

  const siteId = useSelector(
    (state: RootState) => state.site.currentSite?.id
  );

  const { data, isLoading } = useGetAiHistoryQuery(Number(siteId), {
    skip: !siteId,
  });

  const history = data?.data || [];

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 4,
        height: "100%",
        bgcolor: isDark ? alpha("#ffffff", 0.04) : "#ffffff",
        border: `1px solid ${
          isDark ? alpha("#ffffff", 0.08) : alpha("#0D0D0D", 0.06)
        }`,
        boxShadow: isDark
          ? "0 10px 30px rgba(0,0,0,0.28)"
          : "0 10px 30px rgba(13,13,13,0.06)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 2 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "12px",
            display: "grid",
            placeItems: "center",
            bgcolor: alpha("#00C49A", 0.12),
            color: "#00C49A",
          }}
        >
          <AutoAwesome fontSize="small" />
        </Box>

        <Box>
          <Typography variant="h6" fontWeight={900}>
            AI Generation History
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Latest AI website generations for this site
          </Typography>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={28} sx={{ color: "#00C49A" }} />
        </Box>
      ) : history.length === 0 ? (
        <Box
          sx={{
            py: 4,
            borderRadius: 3,
            textAlign: "center",
            bgcolor: isDark ? alpha("#ffffff", 0.03) : "#F8FAFC",
            border: `1px dashed ${
              isDark ? alpha("#ffffff", 0.12) : alpha("#0D0D0D", 0.12)
            }`,
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
                {["Prompt", "Category", "Pages", "Status", "Date"].map(
                  (head) => (
                    <TableCell
                      key={head}
                      sx={{
                        fontWeight: 800,
                        color: "text.secondary",
                        borderBottom: `1px solid ${
                          isDark
                            ? alpha("#ffffff", 0.08)
                            : alpha("#0D0D0D", 0.08)
                        }`,
                      }}
                    >
                      {head}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {history.slice(0, 5).map((item: any) => (
                <TableRow
                  key={item.id}
                  hover
                  sx={{
                    "& td": {
                      borderBottom: `1px solid ${
                        isDark
                          ? alpha("#ffffff", 0.06)
                          : alpha("#0D0D0D", 0.05)
                      }`,
                    },
                  }}
                >
                  <TableCell sx={{ maxWidth: 360 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {item.prompt}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={item.category}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        bgcolor: alpha("#00C49A", 0.12),
                        color: "#00A37A",
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontWeight={800}>
                      {item.pagesGenerated}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={
                        item.status === "success" ? "Success" : item.status
                      }
                      size="small"
                      variant="outlined"
                      sx={{
                        fontWeight: 800,
                        borderColor:
                          item.status === "success" ? "#00C49A" : "#F22F22",
                        color:
                          item.status === "success" ? "#00A37A" : "#F22F22",
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "-"}
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