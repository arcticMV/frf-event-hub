'use client';

import React from 'react';
import { Box, Skeleton, Stack, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  variant?: 'table' | 'card' | 'list' | 'dashboard';
  rows?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ variant = 'list', rows = 5 }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (variant === 'table') {
    return (
      <Box>
        <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
        <Stack spacing={1}>
          {Array.from({ length: rows }).map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={52} animation="wave" />
          ))}
        </Stack>
      </Box>
    );
  }

  if (variant === 'card') {
    return (
      <motion.div variants={container} initial="hidden" animate="show">
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
          {Array.from({ length: rows }).map((_, index) => (
            <motion.div key={index} variants={item}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="100%" height={20} sx={{ my: 1 }} />
                  <Skeleton variant="text" width="100%" height={20} />
                  <Skeleton variant="text" width="80%" height={20} />
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Skeleton variant="rectangular" width={80} height={32} />
                    <Skeleton variant="rectangular" width={80} height={32} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>
      </motion.div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <Stack spacing={3}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <motion.div key={index} variants={item}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="40%" height={24} />
                  <Skeleton variant="text" width="60%" height={48} sx={{ my: 1 }} />
                  <Skeleton variant="text" width="80%" height={20} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>
        <Skeleton variant="rectangular" height={400} animation="wave" />
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      {Array.from({ length: rows }).map((_, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="30%" height={24} />
            <Skeleton variant="text" width="100%" height={20} />
          </Box>
        </Box>
      ))}
    </Stack>
  );
};

export default LoadingSkeleton;