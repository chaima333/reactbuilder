
import React from "react";

import {
  Box,
  Typography
} from "@mui/material";

interface FeatureCardProps {

  title: string;

  description: string;
}

export const FeatureCard = ({
  title,
  description
}: FeatureCardProps) => {

  return (

    <Box
      sx={{

        p: 4,

        border:
          "1px solid #e5e7eb",

        borderRadius:
          "16px",

        backgroundColor:
          "white",

        textAlign:
          "center",

        height:
          "100%"
      }}
    >

      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          mb: 2
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          color: "#666",
          lineHeight: 1.7
        }}
      >
        {description}
      </Typography>

    </Box>
  );
};