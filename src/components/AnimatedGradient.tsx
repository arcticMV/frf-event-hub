'use client';

import { Box } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const meshAnimation = keyframes`
  0%, 100% {
    opacity: 0.3;
    transform: scale(1) rotate(0deg);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1) rotate(5deg);
  }
`;

const GradientLayer = styled(Box)(({ theme }) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: theme.palette.mode === 'dark'
        ? 'linear-gradient(-45deg, #1a1a2e, #16213e, #0f3460, #533483)'
        : 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #4facfe)',
    backgroundSize: '400% 400%',
    animation: `${gradientAnimation} 15s ease infinite`,
    zIndex: -2,
}));

const MeshOverlay = styled(Box)(({ theme }) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: theme.palette.mode === 'dark'
        ? 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)'
        : 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
    animation: `${meshAnimation} 10s ease-in-out infinite`,
    zIndex: -1,
}));

export default function AnimatedGradient() {
    return (
        <>
            <GradientLayer />
            <MeshOverlay />
        </>
    );
}
