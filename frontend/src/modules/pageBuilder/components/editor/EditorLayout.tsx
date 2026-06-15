import React from "react";
import { Box, Alert } from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";

interface Props {
  header: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  children?: React.ReactNode;
  hideSidebars?: boolean;
  content?: React.ReactNode;
  errors?: any[];
}

export const EditorLayout: React.FC<Props> = ({
  header,
  leftSidebar,
  rightSidebar,
  hideSidebars,
  content,
  children,
  errors = [],
}) => {
  const hasErrors = errors.length > 0;

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ flexShrink: 0, zIndex: 1100 }}>
        {header}
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          overflow: "hidden",
        }}
      >
        {!hideSidebars && leftSidebar && (
          <Box
            sx={{
              flexShrink: 0,
              height: "100%",
              overflow: "hidden",
            }}
          >
            {leftSidebar}
          </Box>
        )}

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            bgcolor: "#f8f9fa",
            position: "relative",
          }}
        >
          {hasErrors && (
            <Box
              sx={{
                flexShrink: 0,
                p: "6px 16px",
                bgcolor: "#fff",
                borderBottom: "1px solid #ffcdd2",
              }}
            >
              <Alert
                severity="error"
                icon={<ErrorOutline fontSize="small" />}
                sx={{
                  width: "100%",
                  py: 0,
                  bgcolor: "transparent",
                  border: "none",
                  "& .MuiAlert-message": {
                    color: "#d32f2f",
                    fontWeight: 500,
                  },
                }}
              >
                Document contains {errors.length} structure errors. Publishing is restricted.
              </Alert>
            </Box>
          )}

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            {content || children}
          </Box>
        </Box>

        {!hideSidebars && rightSidebar && (
          <Box
            sx={{
              flexShrink: 0,
              height: "100%",
              overflow: "hidden",
            }}
          >
            {rightSidebar}
          </Box>
        )}
      </Box>
    </Box>
  );
};