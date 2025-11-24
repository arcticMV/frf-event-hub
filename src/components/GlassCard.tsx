'use client';

import React from 'react';
import { Card, CardProps, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

interface GlassCardProps extends CardProps {
  glassmorphism?: boolean;
  hoverEffect?: boolean;
  children: React.ReactNode;
}

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'glassmorphism' && prop !== 'hoverEffect',
})<{ glassmorphism?: boolean; hoverEffect?: boolean }>(({ theme, glassmorphism, hoverEffect }) => ({
  position: 'relative',
  overflow: 'visible',
  ...(glassmorphism && {
    background: theme.palette.mode === 'dark'
      ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.6)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`
      : `linear-gradient(135deg, ${alpha('#ffffff', 0.9)} 0%, ${alpha('#ffffff', 0.7)} 100%)`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${theme.palette.mode === 'dark' ? alpha('#ffffff', 0.1) : alpha(theme.palette.divider, 0.2)}`,
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 32px rgba(0, 0, 0, 0.4)'
      : '0 8px 32px rgba(31, 38, 135, 0.15)',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 'inherit',
      background: theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)'
        : 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%)',
      pointerEvents: 'none',
    },
  }),
  ...(hoverEffect && {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 20px 40px rgba(0, 0, 0, 0.6)'
        : '0 20px 40px rgba(31, 38, 135, 0.25)',
      border: `1px solid ${theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.divider, 0.2)}`,
    },
  }),
}));

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  glassmorphism = true,
  hoverEffect = true,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={hoverEffect ? { scale: 1.02 } : undefined}
      whileTap={hoverEffect ? { scale: 0.98 } : undefined}
    >
      <StyledCard glassmorphism={glassmorphism} hoverEffect={hoverEffect} {...props}>
        {children}
      </StyledCard>
    </motion.div>
  );
};

export default GlassCard;