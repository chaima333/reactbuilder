import React from "react";
import { Grid, Paper, Typography, Box, Skeleton } from "@mui/material";
import { 
  Web as SiteIcon, 
  Pages as PageIcon, 
  Visibility as ViewIcon, 
  Storage as StorageIcon 
} from "@mui/icons-material";

// 🛠️ الـ Interface توّة يستنى في الـ Array اللي يرجع مالـ Mapper متاعك
interface StatsCardsProps {
  cards: {
    key: string;
    title: string;
    value: string | number;
    icon: string; // "sites" | "pages" etc...
    color: string;
  }[];
  isLoading?: boolean;
}

// دالة تحويل الـ string icon إلى React Component
const getIcon = (iconName: string, color: string) => {
  const style = { fontSize: 32, color: color };
  switch (iconName) {
    case "sites": return <SiteIcon sx={style} />;
    case "pages": return <PageIcon sx={style} />;
    case "views": return <ViewIcon sx={style} />;
    case "storage": return <StorageIcon sx={style} />;
    default: return <SiteIcon sx={style} />;
  }
};

export const StatsCards: React.FC<StatsCardsProps> = ({ cards, isLoading }) => {
  
  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Skeleton variant="text" width="40%" height={40} />
              <Skeleton variant="text" width="60%" />
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} md={3} key={card.key}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid #f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": { 
                transform: "translateY(-5px)", 
                boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
                borderColor: card.color 
              },
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
                {card.title}
              </Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: "#0D0D0D" }}>
                {typeof card.value === "number"
                  ? card.value.toLocaleString()
                  : card.value}
              </Typography>
            </Box>

            <Box 
              sx={{ 
                bgcolor: `${card.color}15`, 
                p: 1.5, 
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {getIcon(card.icon, card.color)}
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};