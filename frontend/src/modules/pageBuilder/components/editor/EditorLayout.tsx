import React from "react";
import { Box } from "@mui/material";

interface Props {
  header: React.ReactNode;
  left?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  sidebar?: React.ReactNode;
  children?: React.ReactNode;
  hideSidebars?: boolean;
  content?: React.ReactNode; // 👈 نزيدو هذا الـ Prop الجديد
}

export const EditorLayout: React.FC<Props> = ({
  header,
  left,
  rightSidebar,
  sidebar,
  children,
  hideSidebars,
  content
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
          {content || children}
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