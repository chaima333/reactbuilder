import { Box, Typography, Button, Container, Paper, CircularProgress, alpha, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export const WaitingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const message = location.state?.message;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background circles */}
      <Box
        component={motion.div}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        sx={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
          top: '-100px',
          right: '-100px',
        }}
      />
      <Box
        component={motion.div}
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [0, -90, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        sx={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.08)} 0%, transparent 70%)`,
          bottom: '-150px',
          left: '-150px',
        }}
      />

      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, sm: 6 },
              textAlign: 'center',
              borderRadius: 4,
              background: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.1)}`,
            }}
          >
            {/* Animated Icon */}
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
              <Box
                component={motion.div}
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <PendingActionsIcon
                  sx={{
                    fontSize: 80,
                    color: 'primary.main',
                    filter: `drop-shadow(0 4px 8px ${alpha(theme.palette.primary.main, 0.3)})`,
                  }}
                />
              </Box>
              <CircularProgress
                size={100}
                thickness={2}
                sx={{
                  position: 'absolute',
                  top: -10,
                  left: -10,
                  color: alpha(theme.palette.primary.main, 0.2),
                }}
              />
              <CircularProgress
                size={100}
                thickness={2}
                sx={{
                  position: 'absolute',
                  top: -10,
                  left: -10,
                  color: 'primary.main',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  },
                }}
              />
            </Box>

            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              Account Pending Approval
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                mb: 2,
                color: 'text.secondary',
              }}
            >
              <AccessTimeIcon fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Estimated wait time: 24-48 hours
              </Typography>
            </Box>

            <Typography
              sx={{
                mt: 2,
                mb: 3,
                color: 'text.secondary',
                lineHeight: 1.6,
              }}
            >
              {message || "Your account is waiting for admin approval. You'll receive an email once your account is activated."}
            </Typography>

            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{
                mt: 2,
                px: 4,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1rem',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
              }}
            >
              Back to Login
            </Button>

            {/* Decorative dots */}
            <Box
              sx={{
                mt: 4,
                display: 'flex',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  component={motion.div}
                  animate={{
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.2,
                    repeat: Infinity,
                  }}
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    opacity: 0.4,
                  }}
                />
              ))}
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};