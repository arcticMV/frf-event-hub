'use client';

import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useState } from 'react';

const dataSources = [
  {
    id: 1,
    name: 'API Feed - Reuters',
    type: 'API',
    status: 'Active',
    dataPoints: 45230,
    frequency: 'Real-time',
    lastSync: '2 min ago',
    health: 100,
  },
  {
    id: 2,
    name: 'Web Scraper - News Sites',
    type: 'Web Scraper',
    status: 'Active',
    dataPoints: 23100,
    frequency: 'Hourly',
    lastSync: '15 min ago',
    health: 95,
  },
  {
    id: 3,
    name: 'Social Media Monitor',
    type: 'Social',
    status: 'Active',
    dataPoints: 128500,
    frequency: 'Real-time',
    lastSync: '1 min ago',
    health: 88,
  },
  {
    id: 4,
    name: 'Document Upload Portal',
    type: 'Manual',
    status: 'Pending',
    dataPoints: 850,
    frequency: 'On-demand',
    lastSync: '2 hours ago',
    health: 100,
  },
  {
    id: 5,
    name: 'Satellite Data Feed',
    type: 'Satellite',
    status: 'Error',
    dataPoints: 0,
    frequency: 'Daily',
    lastSync: '1 day ago',
    health: 0,
  },
  {
    id: 6,
    name: 'Government Database',
    type: 'Database',
    status: 'Active',
    dataPoints: 7800,
    frequency: 'Weekly',
    lastSync: '3 days ago',
    health: 100,
  },
];

export default function DataCollectionPage() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const stats = [
    { label: 'Active Sources', value: '12', icon: StorageIcon, color: 'primary.main' },
    { label: 'Data Points Today', value: '234.5K', icon: SpeedIcon, color: 'success.main' },
    { label: 'Processing Rate', value: '98.5%', icon: CheckCircleIcon, color: 'info.main' },
    { label: 'Failed Sources', value: '1', icon: ErrorIcon, color: 'error.main' },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Data Collection
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage data sources and collection pipelines
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />}>
            Sync All
          </Button>
          <Button variant="contained" startIcon={<CloudUploadIcon />}>
            Add Source
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        {stats.map((stat) => (
          <Card key={stat.label} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', flex: '1 1 250px', minWidth: '250px' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  {stat.label}
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {stat.value}
                </Typography>
              </Box>
              <stat.icon sx={{ fontSize: 32, color: stat.color }} />
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Data Sources */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight="bold">
            Data Sources
          </Typography>
        </Box>
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {dataSources.map((source) => (
            <Card
              key={source.id}
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: source.status === 'Error' ? 'error.main' : 'divider',
                position: 'relative',
                flex: '1 1 350px',
                minWidth: '350px'
              }}
            >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {source.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip label={source.type} size="small" variant="outlined" />
                          <Chip
                            label={source.status}
                            size="small"
                            color={
                              source.status === 'Active' ? 'success' :
                              source.status === 'Error' ? 'error' :
                              'warning'
                            }
                          />
                        </Box>
                      </Box>
                      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                        <MoreIcon />
                      </IconButton>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Health Status
                        </Typography>
                        <Typography variant="caption" fontWeight="bold">
                          {source.health}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={source.health}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: source.health > 80 ? 'success.main' :
                                    source.health > 50 ? 'warning.main' : 'error.main',
                          },
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Data Points
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {source.dataPoints.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Frequency
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {source.frequency}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Last Sync: {source.lastSync}
                    </Typography>
                  </CardContent>
            </Card>
          ))}
        </Box>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>
          <RefreshIcon fontSize="small" sx={{ mr: 1 }} /> Sync Now
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} /> Export Data
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Configure</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>View Logs</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)} sx={{ color: 'error.main' }}>
          Disable
        </MenuItem>
      </Menu>
    </Box>
  );
}