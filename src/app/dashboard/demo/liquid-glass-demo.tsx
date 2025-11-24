'use client';

/**
 * Liquid Glass Button Demo Page
 * 
 * Showcases the Apple Liquid Glass design system implementation
 * Based on iOS 26 / macOS Tahoe 26 design language
 */

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Info as InfoIcon,
  CloudUpload as CloudUploadIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import LiquidGlassButton from '@/components/LiquidGlassButton';
import { motion } from 'framer-motion';

export default function LiquidGlassDemoPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Apple Liquid Glass Design System
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Based on official Apple design language from iOS 26 / macOS Tahoe 26
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Source:{' '}
            <a
              href="https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'underline' }}
            >
              Apple Newsroom
            </a>
          </Typography>
        </Box>

        {/* Key Features */}
        <Paper sx={{ p: 3, mb: 4, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Key Features
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mt: 1 }}>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                ✨ Refraction
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Blurs content behind like real glass
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                🔮 Reflection
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Reflects surroundings dynamically
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                💎 Specular Highlights
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Shiny reflections follow mouse
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                🎨 Content-Aware
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Adapts to light/dark mode
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Color Variants */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Color Variants
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Content-aware colors that intelligently adapt to light and dark environments
          </Typography>

          <Stack spacing={3}>
            <Box>
              <Chip label="Primary (Indigo)" size="small" sx={{ mb: 2 }} />
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <LiquidGlassButton liquidVariant="primary">
                  Default Button
                </LiquidGlassButton>
                <LiquidGlassButton liquidVariant="primary" startIcon={<AddIcon />}>
                  With Icon
                </LiquidGlassButton>
                <LiquidGlassButton liquidVariant="primary" disabled>
                  Disabled
                </LiquidGlassButton>
              </Stack>
            </Box>

            <Box>
              <Chip label="Secondary (Emerald)" size="small" sx={{ mb: 2 }} />
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <LiquidGlassButton liquidVariant="secondary" startIcon={<RefreshIcon />}>
                  Refresh
                </LiquidGlassButton>
                <LiquidGlassButton liquidVariant="secondary" startIcon={<DownloadIcon />}>
                  Download
                </LiquidGlassButton>
              </Stack>
            </Box>

            <Box>
              <Chip label="Success (Green)" size="small" sx={{ mb: 2 }} />
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <LiquidGlassButton liquidVariant="success" startIcon={<CheckIcon />}>
                  Approve
                </LiquidGlassButton>
                <LiquidGlassButton liquidVariant="success" startIcon={<SaveIcon />}>
                  Save Changes
                </LiquidGlassButton>
              </Stack>
            </Box>

            <Box>
              <Chip label="Warning (Orange)" size="small" sx={{ mb: 2 }} />
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <LiquidGlassButton liquidVariant="warning" startIcon={<RefreshIcon />}>
                  Refresh
                </LiquidGlassButton>
                <LiquidGlassButton liquidVariant="warning">
                  Update
                </LiquidGlassButton>
              </Stack>
            </Box>

            <Box>
              <Chip label="Danger (Red)" size="small" sx={{ mb: 2 }} />
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <LiquidGlassButton liquidVariant="danger" startIcon={<DeleteIcon />}>
                  Delete
                </LiquidGlassButton>
                <LiquidGlassButton liquidVariant="danger">
                  Remove Item
                </LiquidGlassButton>
              </Stack>
            </Box>

            <Box>
              <Chip label="Info (Blue)" size="small" sx={{ mb: 2 }} />
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <LiquidGlassButton liquidVariant="info" startIcon={<InfoIcon />}>
                  Learn More
                </LiquidGlassButton>
                <LiquidGlassButton liquidVariant="info">
                  View Details
                </LiquidGlassButton>
              </Stack>
            </Box>

            <Box>
              <Chip label="Neutral (Gray)" size="small" sx={{ mb: 2 }} />
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <LiquidGlassButton liquidVariant="neutral">
                  Cancel
                </LiquidGlassButton>
                <LiquidGlassButton liquidVariant="neutral">
                  Close
                </LiquidGlassButton>
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Glass Intensity */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Glass Intensity
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Control the refraction strength (backdrop blur)
          </Typography>

          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <LiquidGlassButton liquidVariant="primary" glassIntensity="subtle">
              Subtle Blur (10px)
            </LiquidGlassButton>
            <LiquidGlassButton liquidVariant="primary" glassIntensity="medium">
              Medium Blur (20px)
            </LiquidGlassButton>
            <LiquidGlassButton liquidVariant="primary" glassIntensity="strong">
              Strong Blur (30px)
            </LiquidGlassButton>
          </Stack>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Interaction Features */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Interaction Features
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Real-time rendering with specular highlights and dynamic morphing
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.02)' }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                With Specular Highlights
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                Hover and move your mouse to see shiny reflections follow
              </Typography>
              <LiquidGlassButton
                liquidVariant="primary"
                specularHighlights={true}
                startIcon={<CloudUploadIcon />}
              >
                Hover Me - See Highlights
              </LiquidGlassButton>
            </Paper>

            <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.02)' }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Without Specular Highlights
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                Standard glass effect without mouse tracking
              </Typography>
              <LiquidGlassButton
                liquidVariant="primary"
                specularHighlights={false}
                startIcon={<CloudUploadIcon />}
              >
                No Highlights
              </LiquidGlassButton>
            </Paper>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Size Variations */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Size Variations
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Standard MUI Button sizes work seamlessly
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            <LiquidGlassButton liquidVariant="primary" size="small">
              Small
            </LiquidGlassButton>
            <LiquidGlassButton liquidVariant="primary" size="medium">
              Medium (Default)
            </LiquidGlassButton>
            <LiquidGlassButton liquidVariant="primary" size="large">
              Large
            </LiquidGlassButton>
          </Stack>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Real-World Examples */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Real-World Usage Examples
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            How Liquid Glass buttons look in common UI patterns
          </Typography>

          <Stack spacing={3}>
            {/* Action Bar */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Action Bar
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Staging Events Management
                </Typography>
                <Stack direction="row" spacing={2}>
                  <LiquidGlassButton liquidVariant="neutral" startIcon={<RefreshIcon />}>
                    Refresh
                  </LiquidGlassButton>
                  <LiquidGlassButton liquidVariant="primary" startIcon={<AddIcon />}>
                    New Event
                  </LiquidGlassButton>
                </Stack>
              </Box>
            </Paper>

            {/* Dialog Actions */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Dialog Actions
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <LiquidGlassButton liquidVariant="neutral">
                  Cancel
                </LiquidGlassButton>
                <LiquidGlassButton liquidVariant="success" startIcon={<SaveIcon />}>
                  Save Changes
                </LiquidGlassButton>
              </Box>
            </Paper>

            {/* Danger Zone */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Danger Actions
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                Critical actions with clear visual hierarchy
              </Typography>
              <Stack direction="row" spacing={2}>
                <LiquidGlassButton liquidVariant="neutral">
                  Keep Items
                </LiquidGlassButton>
                <LiquidGlassButton liquidVariant="danger" startIcon={<DeleteIcon />}>
                  Delete Forever
                </LiquidGlassButton>
              </Stack>
            </Paper>
          </Stack>
        </Box>

        {/* Technical Notes */}
        <Paper
          sx={{
            p: 3,
            mt: 4,
            background: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📚 Technical Implementation
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div">
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>✅ Multiple layers of Liquid Glass for depth (inspired by visionOS)</li>
              <li>✅ Refraction with backdrop-filter: blur + saturate</li>
              <li>✅ Reflection gradients that adapt to light/dark mode</li>
              <li>✅ Real-time specular highlights with mouse tracking</li>
              <li>✅ Content-aware coloring with dynamic opacity</li>
              <li>✅ Smooth morphing animations with spring physics</li>
              <li>✅ GPU-accelerated rendering (transform: translateZ(0))</li>
              <li>✅ Accessible focus states and keyboard navigation</li>
            </ul>
          </Typography>
        </Paper>
      </motion.div>
    </Container>
  );
}

