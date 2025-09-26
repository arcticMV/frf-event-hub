'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Avatar,
  AvatarGroup,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckIcon,
  Cancel as RejectIcon,
  Pending as PendingIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const columns: GridColDef[] = [
  {
    field: 'id',
    headerName: 'ID',
    width: 80,
  },
  {
    field: 'dataPoint',
    headerName: 'Data Point',
    width: 300,
    renderCell: (params) => (
      <Box>
        <Typography variant="body2" fontWeight="medium">
          {params.row.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {params.row.source}
        </Typography>
      </Box>
    ),
  },
  {
    field: 'category',
    headerName: 'Category',
    width: 150,
    renderCell: (params) => (
      <Chip label={params.value} size="small" variant="outlined" />
    ),
  },
  {
    field: 'confidence',
    headerName: 'AI Confidence',
    width: 130,
    renderCell: (params) => {
      const value = params.value as number;
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 60, height: 6, bgcolor: 'grey.200', borderRadius: 3 }}>
            <Box
              sx={{
                width: `${value}%`,
                height: '100%',
                bgcolor: value > 80 ? 'success.main' : value > 50 ? 'warning.main' : 'error.main',
                borderRadius: 3,
              }}
            />
          </Box>
          <Typography variant="caption">{value}%</Typography>
        </Box>
      );
    },
  },
  {
    field: 'priority',
    headerName: 'Priority',
    width: 100,
    renderCell: (params) => {
      const colors = {
        High: 'error',
        Medium: 'warning',
        Low: 'info'
      };
      return (
        <Chip
          label={params.value}
          size="small"
          color={colors[params.value as keyof typeof colors] as any}
          variant="filled"
        />
      );
    },
  },
  {
    field: 'assignedTo',
    headerName: 'Assigned To',
    width: 150,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
          {params.value?.[0]}
        </Avatar>
        <Typography variant="body2">{params.value || 'Unassigned'}</Typography>
      </Box>
    ),
  },
  {
    field: 'timeElapsed',
    headerName: 'Time',
    width: 100,
    renderCell: (params) => (
      <Typography variant="body2" color="text.secondary">
        {params.value}
      </Typography>
    ),
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 150,
    renderCell: () => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton size="small" color="success">
          <CheckIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error">
          <RejectIcon fontSize="small" />
        </IconButton>
        <IconButton size="small">
          <AssignmentIcon fontSize="small" />
        </IconButton>
      </Box>
    ),
  },
];

const reviewData = [
  { id: 1, title: 'Potential security breach detected', source: 'Cyber Intel Feed', category: 'Cybersecurity', confidence: 45, priority: 'High', assignedTo: 'John D.', timeElapsed: '5 min' },
  { id: 2, title: 'Supply chain disruption alert', source: 'Reuters API', category: 'Operations', confidence: 72, priority: 'Medium', assignedTo: 'Sarah M.', timeElapsed: '12 min' },
  { id: 3, title: 'Unusual trading pattern identified', source: 'Financial Monitor', category: 'Financial', confidence: 38, priority: 'High', assignedTo: null, timeElapsed: '2 hours' },
  { id: 4, title: 'Geopolitical tension escalation', source: 'News Scraper', category: 'Geopolitical', confidence: 65, priority: 'Medium', assignedTo: 'Mike R.', timeElapsed: '30 min' },
  { id: 5, title: 'Environmental hazard report', source: 'Satellite Feed', category: 'Environmental', confidence: 25, priority: 'Low', assignedTo: 'Emma L.', timeElapsed: '1 hour' },
];

export default function HumanReviewPage() {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const stats = [
    { label: 'Pending Review', value: 234, color: 'warning.main', icon: PendingIcon },
    { label: 'In Progress', value: 45, color: 'info.main', icon: TimerIcon },
    { label: 'Completed Today', value: 189, color: 'success.main', icon: CheckIcon },
    { label: 'Reviewers Online', value: 8, color: 'primary.main', icon: GroupIcon },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Human Review Queue
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and validate AI-processed intelligence data
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, overflowX: 'auto' }}>
        {stats.map((stat) => (
          <Card key={stat.label} elevation={0} sx={{ minWidth: 200, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: `${stat.color.split('.')[0]}.light`, color: stat.color }}>
                <stat.icon />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Tabs and Search */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label={<Badge badgeContent={234} color="error">All Items</Badge>} />
            <Tab label={<Badge badgeContent={45} color="warning">High Priority</Badge>} />
            <Tab label="My Queue" />
            <Tab label="Completed" />
          </Tabs>
          <Box sx={{ display: 'flex', gap: 2, py: 1 }}>
            <TextField
              size="small"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button variant="outlined" startIcon={<FilterIcon />}>
              Filters
            </Button>
          </Box>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <DataGrid
            rows={reviewData}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[10, 25, 50]}
            checkboxSelection
            disableRowSelectionOnClick
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid',
                borderColor: 'divider',
              },
            }}
            autoHeight
          />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <DataGrid
            rows={reviewData.filter(d => d.priority === 'High')}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            autoHeight
            sx={{ border: 'none' }}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <Typography sx={{ p: 3 }}>Your assigned review items will appear here</Typography>
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <Typography sx={{ p: 3 }}>Completed reviews will appear here</Typography>
        </TabPanel>
      </Paper>

      {/* Active Reviewers */}
      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Active Reviewers
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AvatarGroup max={6}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>JD</Avatar>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>SM</Avatar>
            <Avatar sx={{ bgcolor: 'success.main' }}>MR</Avatar>
            <Avatar sx={{ bgcolor: 'warning.main' }}>EL</Avatar>
            <Avatar sx={{ bgcolor: 'error.main' }}>AK</Avatar>
            <Avatar sx={{ bgcolor: 'info.main' }}>TW</Avatar>
            <Avatar sx={{ bgcolor: 'grey.600' }}>+3</Avatar>
          </AvatarGroup>
          <Typography variant="body2" color="text.secondary">
            8 reviewers currently active
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}