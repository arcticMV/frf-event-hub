'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  Typography,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgressiveDisclosureProps {
  title?: string;
  basicContent: React.ReactNode;
  advancedContent: React.ReactNode;
  defaultExpanded?: boolean;
  icon?: React.ReactElement;
  variant?: 'button' | 'inline' | 'section';
}

const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  title = 'Advanced Options',
  basicContent,
  advancedContent,
  defaultExpanded = false,
  icon = <SettingsIcon />,
  variant = 'button',
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => setExpanded(!expanded);

  if (variant === 'inline') {
    return (
      <Box>
        <Box>{basicContent}</Box>
        <Box sx={{ mt: 2 }}>
          <Button
            onClick={toggleExpanded}
            startIcon={icon}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            variant="text"
            color="primary"
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            {title}
          </Button>
        </Box>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <Box sx={{ mt: 2, pl: 2 }}>{advancedContent}</Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    );
  }

  if (variant === 'section') {
    return (
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2 }}>{basicContent}</Box>

        <Divider />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            backgroundColor: 'action.hover',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'action.selected',
            },
          }}
          onClick={toggleExpanded}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon}
            <Typography variant="body2" fontWeight={500}>
              {title}
            </Typography>
          </Box>
          <IconButton size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={expanded} timeout="auto">
          <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
            {advancedContent}
          </Box>
        </Collapse>
      </Paper>
    );
  }

  return (
    <Box>
      <Box>{basicContent}</Box>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={toggleExpanded}
          startIcon={icon}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          variant="outlined"
          fullWidth
          sx={{
            mt: 2,
            justifyContent: 'space-between',
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 2,
            py: 1.5,
            transition: 'all 0.2s ease-in-out',
            background: expanded
              ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
              : 'transparent',
            borderColor: expanded ? 'primary.main' : 'divider',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderColor: 'primary.main',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {title}
          </Box>
        </Button>
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <Paper
              elevation={0}
              sx={{
                mt: 2,
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.02)'
                    : 'rgba(0, 0, 0, 0.02)',
              }}
            >
              {advancedContent}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default ProgressiveDisclosure;