// src/modules/dashboard/components/layout/DashboardCard.tsx

import {
  Paper,
  Typography,
  Box
} from "@mui/material";

type DashboardCardProps = {
  title: string;
  children: React.ReactNode;
};

export const DashboardCard = ({
  title,
  children
}: DashboardCardProps) => {

  return (

    <Paper

      elevation={0}

      sx={{

        p: 3,

        borderRadius: 4,

        bgcolor: "background.paper",

        color: "text.primary",

        border: "1px solid",

        borderColor: "divider",

        height: "100%",

        transition: "0.2s ease",

        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 3
        }

      }}
    >

      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: 700
        }}
      >
        {title}
      </Typography>

      <Box>
        {children}
      </Box>

    </Paper>
  );
};