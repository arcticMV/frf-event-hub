'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Link as MuiLink,
  Container,
  InputAdornment,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Security as SecurityIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { styled, keyframes } from '@mui/material/styles';
import ParticleBackground from '@/components/ParticleBackground';
import AnimatedGradient from '@/components/AnimatedGradient';
import LiquidGlassButton from '@/components/LiquidGlassButton';
import { motion } from 'framer-motion';

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.3), 0 0 40px rgba(99, 102, 241, 0.1);
  }
  50% {
    box-shadow: 0 0 30px rgba(99, 102, 241, 0.5), 0 0 60px rgba(99, 102, 241, 0.2);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const BackgroundContainer = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
});

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: theme.spacing(3),
  backdropFilter: 'blur(20px) saturate(180%)',
  background: theme.palette.mode === 'dark'
    ? 'rgba(31, 41, 55, 0.75)'
    : 'rgba(255, 255, 255, 0.85)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)'}`,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
    : '0 8px 32px rgba(31, 38, 135, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8)',
  position: 'relative',
  zIndex: 1,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 12px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
      : '0 12px 48px rgba(31, 38, 135, 0.2), 0 0 0 1px rgba(255, 255, 255, 1)',
  },
}));

const AnimatedAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  animation: `${float} 3s ease-in-out infinite, ${glow} 2s ease-in-out infinite`,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
    '&.Mui-focused': {
      transform: 'translateY(-2px)',
      boxShadow: `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`,
    },
  },
}));

// GradientButton replaced with LiquidGlassButton for Apple design language

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundContainer>
      <AnimatedGradient />
      <ParticleBackground particleCount={40} interactive={true} />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <StyledCard>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2
                }}
              >
                <AnimatedAvatar>
                  <SecurityIcon sx={{ fontSize: 40 }} />
                </AnimatedAvatar>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  FRF Event Hub
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Human-in-the-Loop Data Collection Management
                </Typography>
              </motion.div>
            </Box>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Box component="form" onSubmit={handleSubmit}>
                <StyledTextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="email"
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <StyledTextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="current-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ mt: 2, mb: 3, textAlign: 'right' }}>
                  <Link href="/forgot-password" passHref legacyBehavior>
                    <MuiLink
                      variant="body2"
                      sx={{
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        '&:hover': {
                          textDecoration: 'underline',
                          color: 'primary.main',
                        }
                      }}
                    >
                      Forgot your password?
                    </MuiLink>
                  </Link>
                </Box>

                <LiquidGlassButton
                  type="submit"
                  fullWidth
                  liquidVariant="primary"
                  size="large"
                  disabled={loading}
                  specularHighlights={true}
                  glassIntensity="medium"
                  sx={{
                    mt: 2,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </LiquidGlassButton>
              </Box>
            </motion.div>
          </StyledCard>
        </motion.div>
      </Container>
    </BackgroundContainer>
  );
}