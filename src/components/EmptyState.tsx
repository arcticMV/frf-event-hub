'use client';

import React from 'react';
import { Box, Typography, Button, SvgIconProps } from '@mui/material';
import { motion } from 'framer-motion';
import { Inbox as InboxIcon } from '@mui/icons-material';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactElement<SvgIconProps>;
  actionLabel?: string;
  onAction?: () => void;
  height?: string | number;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Available',
  description = 'There is no data to display at the moment.',
  icon,
  actionLabel,
  onAction,
  height = 400,
}) => {
  const Icon = icon || <InboxIcon />;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height,
        textAlign: 'center',
        p: 4,
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Box
          sx={{
            fontSize: 120,
            color: 'text.disabled',
            mb: 2,
            opacity: 0.3,
          }}
        >
          {React.cloneElement(Icon, { sx: { fontSize: 'inherit' } })}
        </Box>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
      >
        <Typography variant="h5" gutterBottom color="text.secondary">
          {title}
        </Typography>
        <Typography variant="body1" color="text.disabled" sx={{ mb: 3, maxWidth: 400 }}>
          {description}
        </Typography>

        {actionLabel && onAction && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              onClick={onAction}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                '&:hover': {
                  background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                },
              }}
            >
              {actionLabel}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </Box>
  );
};

export default EmptyState;