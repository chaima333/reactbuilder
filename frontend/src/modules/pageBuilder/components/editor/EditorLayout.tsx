import React from "react";
import { Box } from "@mui/material";

interface Props {
  header: React.ReactNode;
  left: React.ReactNode;
  rightSidebar?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  hideSidebars?: boolean;
}

export const EditorLayout: React.FC<Props> = ({
  header,
  left,
  rightSidebar,
  sidebar,
  children,
  hideSidebars
}) => {
  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      
      {header}

      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        
        {!hideSidebars && (
          <Box sx={{ width: 280, borderRight: "1px solid #ddd" }}>
            {left}
          </Box>
        )}

        <Box sx={{ flex: 1, overflow: "auto" }}>
          {children}
        </Box>

        {!hideSidebars && rightSidebar && (
          <Box sx={{ width: 320, borderLeft: "1px solid #ddd" }}>
            {rightSidebar}
          </Box>
        )}

      </Box>
    </Box>
  );
};