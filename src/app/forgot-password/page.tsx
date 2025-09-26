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
  Avatar,
  Alert,
} from '@mui/material';
import {
  Email as EmailIcon,
  Security as SecurityIcon,
  ArrowBack as ArrowBackIcon,
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setEmailSent(true);
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
              Reset your password
            </Typography>
          </Box>

          {emailSent ? (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                Password reset email sent! Check your inbox for instructions.
              </Alert>
              <Button
                component={Link}
                href="/login"
                fullWidth
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                sx={{ textTransform: 'none' }}
              >
                Back to Login
              </Button>
            </Box>
          ) : (
            <>
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
                  helperText="Enter your email address and we'll send you a link to reset your password."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                >
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </Button>
              </Box>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Link href="/login" passHref legacyBehavior>
                  <MuiLink
                    variant="body2"
                    sx={{
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <ArrowBackIcon fontSize="small" />
                    Back to login
                  </MuiLink>
                </Link>
              </Box>
            </>
          )}
        </StyledCard>
      </Container>
    </GradientBackground>
  );
}