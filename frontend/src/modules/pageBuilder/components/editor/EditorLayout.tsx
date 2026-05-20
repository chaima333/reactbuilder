// src/modules/pageBuilder/layouts/EditorLayout.tsx

import React from "react";
import { Box, Alert, Typography } from "@mui/material";
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
  errors = []
}) => {
  const hasErrors = errors.length > 0;

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      
      {/* 1️⃣ Header Area */}
      <Box sx={{ zIndex: 1100, boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        {header}
      </Box>

      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        
        {/* 2️⃣ Left Sidebar */}
        {!hideSidebars && leftSidebar && (
          <Box sx={{ 
            height: "100%", 
            transition: "all 0.3s ease", 
            display: "flex",
            borderRight: '1px solid #e0e0e0'
          }}>
            {leftSidebar}
          </Box>
        )}

        {/* 3️⃣ Main Content Viewport */}
        <Box component="main" sx={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column",
          overflow: "visible",
          bgcolor: "#f8f9fa", 
          position: "relative"
        }}>
          
          {/* 🛡️ Governance Banner*/}
          {hasErrors && (
            <Box sx={{ 
              p: "6px 16px", 
              bgcolor: '#fff', 
              borderBottom: '1px solid #ffcdd2',
              display: 'flex',
              alignItems: 'center',
              animation: 'slideDown 0.3s ease'
            }}>
              <Alert 
                severity="error" 
                icon={<ErrorOutline fontSize="small" />}
                sx={{ 
                  width: '100%', 
                  py: 0, 
                  bgcolor: 'transparent', 
                  border: 'none',
                  '& .MuiAlert-message': { color: '#d32f2f', fontWeight: 500 }
                }}
              >
                Document contains {errors.length} structure errors. Publishing is restricted.
              </Alert>
            </Box>
          )}

          {/* 🎨 Canvas/Children Area */}
          <Box sx={{ 
            flex: 1, 
            overflowY: "auto", 
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center' 
          }}>
            {content || children}
          </Box>
        </Box>

        {/* 4️⃣ Right Sidebar */}
        {!hideSidebars && rightSidebar && (
          <Box sx={{ 
            height: "100%", 
            transition: "all 0.3s ease",
            borderLeft: '1px solid #e0e0e0'
          }}>
            {rightSidebar}
          </Box>
        )}

      </Box>

      {/* Basic Animation Helper */}
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
};