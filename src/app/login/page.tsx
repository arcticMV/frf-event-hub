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
  Paper,
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
import { styled } from '@mui/material/styles';

const GradientBackground = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
});

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(10px)',
  background: 'rgba(255, 255, 255, 0.98)',
}));

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
    <GradientBackground>
      <Container maxWidth="sm">
        <StyledCard>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                margin: '0 auto',
                mb: 2,
              }}
            >
              <SecurityIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Risk Intelligence Hub
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Human-in-the-Loop Data Collection Management
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
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

            <TextField
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
                <MuiLink variant="body2" sx={{ textDecoration: 'none' }}>
                  Forgot your password?
                </MuiLink>
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>
        </StyledCard>
      </Container>
    </GradientBackground>
  );
}