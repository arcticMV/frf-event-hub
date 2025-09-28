'use client';

import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/GlassCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import { AnimatedLineChart, AnimatedAreaChart, AnimatedBarChart, AnimatedPieChart } from '@/components/Charts';
import QuickActions from '@/components/QuickActions';
import ProgressiveDisclosure from '@/components/ProgressiveDisclosure';
import { useThemeMode } from '@/components/ThemeProvider';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Refresh as RefreshIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';

export default function DemoPage() {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useThemeMode();
  const [showSkeleton, setShowSkeleton] = React.useState(false);
  const [showEmpty, setShowEmpty] = React.useState(false);

  // Sample data for charts
  const lineData = [
    { name: 'Jan', value: 30 },
    { name: 'Feb', value: 45 },
    { name: 'Mar', value: 38 },
    { name: 'Apr', value: 52 },
    { name: 'May', value: 68 },
    { name: 'Jun', value: 75 },
  ];

  const barData = [
    { name: 'Critical', value: 12 },
    { name: 'High', value: 28 },
    { name: 'Medium', value: 45 },
    { name: 'Low', value: 15 },
  ];

  const pieData = [
    { name: 'Security', value: 35 },
    { name: 'Natural Disaster', value: 20 },
    { name: 'Political', value: 25 },
    { name: 'Economic', value: 15 },
    { name: 'Other', value: 5 },
  ];

  const areaData = [
    { name: 'Week 1', value: 20 },
    { name: 'Week 2', value: 35 },
    { name: 'Week 3', value: 28 },
    { name: 'Week 4', value: 42 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" gutterBottom fontWeight="bold">
              UI Enhancements Demo
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Experience all the new UI/UX improvements in action
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={toggleDarkMode}
              startIcon={darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                },
              }}
            >
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </Stack>
        </Box>
      </motion.div>

      {/* Glassmorphism Cards Demo */}
      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
        1. Glassmorphism Cards with Micro-interactions
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
        <GlassCard>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Glass Card 1</Typography>
            <Typography variant="body2" color="text.secondary">
              Hover over me to see the smooth animation and elevation change.
            </Typography>
          </Box>
        </GlassCard>
        <GlassCard>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Glass Card 2</Typography>
            <Typography variant="body2" color="text.secondary">
              Beautiful glassmorphism effect with backdrop blur.
            </Typography>
          </Box>
        </GlassCard>
        <GlassCard>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Glass Card 3</Typography>
            <Typography variant="body2" color="text.secondary">
              Works perfectly in both light and dark modes.
            </Typography>
          </Box>
        </GlassCard>
      </Box>

      {/* Charts Demo */}
      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
        2. Interactive Data Visualizations
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3, mb: 4 }}>
        <AnimatedLineChart data={lineData} title="Event Trends" color="#6366F1" />
        <AnimatedAreaChart data={areaData} title="Weekly Activity" color="#10B981" />
        <AnimatedBarChart data={barData} title="Severity Distribution" />
        <AnimatedPieChart data={pieData} title="Category Breakdown" />
      </Box>

      {/* Progressive Disclosure Demo */}
      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
        3. Progressive Disclosure Pattern
      </Typography>
      <Box sx={{ mb: 4 }}>
        <ProgressiveDisclosure
          title="Show Advanced Settings"
          variant="section"
          basicContent={
            <Box>
              <Typography variant="body1">Basic Settings</Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Button variant="outlined" fullWidth>Basic Option 1</Button>
                <Button variant="outlined" fullWidth>Basic Option 2</Button>
              </Stack>
            </Box>
          }
          advancedContent={
            <Box>
              <Typography variant="body1" gutterBottom>Advanced Settings</Typography>
              <Stack spacing={2}>
                <Button variant="contained" color="secondary" fullWidth>Advanced Option 1</Button>
                <Button variant="contained" color="warning" fullWidth>Advanced Option 2</Button>
                <Button variant="contained" color="error" fullWidth>Advanced Option 3</Button>
              </Stack>
            </Box>
          }
        />
      </Box>

      {/* Loading Skeletons Demo */}
      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
        4. Loading Skeletons
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          onClick={() => {
            setShowSkeleton(true);
            setTimeout(() => setShowSkeleton(false), 3000);
          }}
          sx={{ mb: 2 }}
        >
          Show Loading State (3 seconds)
        </Button>
        {showSkeleton && <LoadingSkeleton variant="card" rows={3} />}
      </Box>

      {/* Empty State Demo */}
      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
        5. Empty States
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          onClick={() => setShowEmpty(!showEmpty)}
          sx={{ mb: 2 }}
        >
          Toggle Empty State
        </Button>
        {showEmpty && (
          <EmptyState
            title="No Data Available"
            description="This is how empty states look with helpful actions."
            actionLabel="Add Your First Item"
            onAction={() => {
              toast.success('Action triggered!');
              setShowEmpty(false);
            }}
            height={300}
          />
        )}
      </Box>

      {/* Toast Notifications Demo */}
      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
        6. Toast Notifications
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button
          variant="contained"
          color="success"
          onClick={() => toast.success('Success notification!')}
        >
          Show Success
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => toast.error('Error notification!')}
        >
          Show Error
        </Button>
        <Button
          variant="contained"
          color="info"
          onClick={() => toast('Info notification!')}
        >
          Show Info
        </Button>
      </Stack>

      {/* Quick Actions - Already visible as floating button */}
      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
        7. Quick Actions SpeedDial
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Look at the bottom-right corner for the floating action button with quick actions!
      </Typography>

      {/* Add QuickActions component */}
      <QuickActions />
    </Box>
  );
}