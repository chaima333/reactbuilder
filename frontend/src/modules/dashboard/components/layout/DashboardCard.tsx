import { Paper, Typography, Box, useTheme } from "@mui/material";

type DashboardCardProps = {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode; // أضفنا icon اختيارية باش تزيد الـ Style
  subtitle?: string;      // أضفنا subtitle للوصف الصغير
};

export const DashboardCard = ({
  title,
  children,
  icon,
  subtitle
}: DashboardCardProps) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "20px", // زاوية مستديرة أكثر تعطي Look عصري
        bgcolor: "background.paper",
        color: "text.primary",
        border: "1px solid",
        borderColor: "rgba(0, 0, 0, 0.05)", // border خفيف جداً
        height: "100%",
        position: "relative",
        overflow: "hidden", // باش الـ gradients ما تخرجش لبره
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 4px 12px 0 rgba(0,0,0,0.03)", // Shadow طبيعي
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px -10px rgba(0,0,0,0.1)", // Shadow أعمق عند الـ hover
          borderColor: theme.palette.primary.light,
          "& .card-icon": {
            transform: "scale(1.1) rotate(-5deg)",
            color: theme.palette.primary.main,
          }
        }
      }}
    >
      {/* خلفية فنية خفيفة (اختيارية) */}
      <Box sx={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 100,
        height: 100,
        background: `radial-gradient(circle, ${theme.palette.primary.light}15 0%, transparent 70%)`,
        borderRadius: '50%',
      }} />

      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              fontSize: "1.1rem",
              color: "#1A2035", // لون داكن فخم
              letterSpacing: "-0.02em"
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {icon && (
          <Box className="card-icon" sx={{ 
            color: 'text.secondary', 
            transition: '0.3s ease',
            display: 'flex',
            p: 1,
            borderRadius: '12px',
            bgcolor: 'action.hover'
          }}>
            {icon}
          </Box>
        )}
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {children}
      </Box>
    </Paper>
  );
};