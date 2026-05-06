import { Paper, Box, Typography }
from "@mui/material";

type Props = {
  title: string;
  children: React.ReactNode;
};

export const DashboardCard = ({
  title,
  children
}: Props) => {

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 3,
        height: "100%"
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