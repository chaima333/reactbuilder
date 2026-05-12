import React from "react";
import { Box } from "@mui/material";

interface Props {
  header: React.ReactNode;
leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  sidebar?: React.ReactNode;
  children?: React.ReactNode;
  hideSidebars?: boolean;
  content?: React.ReactNode; // 👈 نزيدو هذا الـ Prop الجديد
}

export const EditorLayout: React.FC<Props> = ({
  header,
  leftSidebar,
  rightSidebar,
  hideSidebars,
  content,
  children
}) => {
  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      
      {/* 1. الـ Header ديما الفوق */}
      <Box sx={{ zIndex: 1100 }}>{header}</Box>

      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        
        {/* 2. الـ Left Sidebar - نحينا الـ Width الثابت */}
        {!hideSidebars && leftSidebar && (
          <Box sx={{ 
            height: "100%",
            transition: "all 0.3s ease", // انيميشن وقت اللي يتسكر
            display: "flex" 
          }}>
            {leftSidebar}
          </Box>
        )}

        {/* 3. الـ Content - ياخذ المساحة اللي بقات الكل */}
        <Box component="main" sx={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column",
          overflow: "auto", 
          bgcolor: "#f4f4f4", // خلفية رمادية باش تظهر الـ Canvas البيضاء
          position: "relative"
        }}>
          {content || children}
        </Box>

        {/* 4. الـ Right Sidebar */}
        {!hideSidebars && rightSidebar && (
          <Box sx={{ 
            height: "100%",
            transition: "all 0.3s ease" 
          }}>
            {rightSidebar}
          </Box>
        )}

      </Box>
    </Box>
  );
};