'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

// Action menu component to handle state properly
function ActionMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <MoreIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>View Details</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Assign Reviewer</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Export Data</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Archive</MenuItem>
      </Menu>
    </>
  );
}

const columns: GridColDef[] = [
  {
    field: 'title',
    headerName: 'Assessment',
    width: 250,
    renderCell: (params) => (
      <Box>
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      </Box>
    ),
  },
  {
    field: 'riskLevel',
    headerName: 'Risk Level',
    width: 120,
    renderCell: (params) => {
      const colors = {
        Critical: 'error',
        High: 'warning',
        Medium: 'info',
        Low: 'success'
      };
      return (
        <Chip
          label={params.value}
          size="small"
          color={colors[params.value as keyof typeof colors] as any}
        />
      );
    },
  },
  {
    field: 'category',
    headerName: 'Category',
    width: 150,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <SecurityIcon fontSize="small" color="action" />
        <Typography variant="body2">{params.value}</Typography>
      </Box>
    ),
  },
  {
    field: 'dataPoints',
    headerName: 'Data Points',
    width: 120,
    renderCell: (params) => (
      <Typography variant="body2">
        {params.value.toLocaleString()}
      </Typography>
    ),
  },
  {
    field: 'humanReview',
    headerName: 'Human Review',
    width: 150,
    renderCell: (params: GridRenderCellParams) => {
      const { reviewed, total } = params.row;
      const percentage = (reviewed / total) * 100;
      return (
        <Box>
          <Typography variant="body2">
            {reviewed}/{total}
          </Typography>
          <Typography
            variant="caption"
            color={percentage === 100 ? 'success.main' : percentage > 50 ? 'warning.main' : 'error.main'}
          >
            ({percentage.toFixed(0)}% reviewed)
          </Typography>
        </Box>
      );
    },
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (params) => (
      <Chip
        label={params.value}
        size="small"
        color={
          params.value === 'Active' ? 'success' :
          params.value === 'Pending' ? 'warning' :
          params.value === 'Review' ? 'info' :
          'default'
        }
        variant="outlined"
      />
    ),
  },
  {
    field: 'lastUpdated',
    headerName: 'Last Updated',
    width: 130,
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 100,
    sortable: false,
    renderCell: () => <ActionMenu />,
  },
];

const rows = [
  {
    id: 1,
    title: 'Cybersecurity Threat Analysis Q1',
    riskLevel: 'Critical',
    category: 'Cyber',
    dataPoints: 15420,
    reviewed: 12300,
    total: 15420,
    status: 'Active',
    lastUpdated: '2 hours ago',
  },
  {
    id: 2,
    title: 'Supply Chain Vulnerability Assessment',
    riskLevel: 'High',
    category: 'Operations',
    dataPoints: 8750,
    reviewed: 6500,
    total: 8750,
    status: 'Review',
    lastUpdated: '5 hours ago',
  },
  {
    id: 3,
    title: 'Geopolitical Risk Monitoring - Europe',
    riskLevel: 'High',
    category: 'Geopolitical',
    dataPoints: 23100,
    reviewed: 23100,
    total: 23100,
    status: 'Active',
    lastUpdated: '1 day ago',
  },
  {
    id: 4,
    title: 'Financial Market Indicators',
    riskLevel: 'Medium',
    category: 'Financial',
    dataPoints: 45200,
    reviewed: 22600,
    total: 45200,
    status: 'Pending',
    lastUpdated: '3 days ago',
  },
  {
    id: 5,
    title: 'Climate Risk Assessment - APAC',
    riskLevel: 'Medium',
    category: 'Environmental',
    dataPoints: 18900,
    reviewed: 18900,
    total: 18900,
    status: 'Active',
    lastUpdated: '1 week ago',
  },
  {
    id: 6,
    title: 'Regulatory Compliance Tracking',
    riskLevel: 'Low',
    category: 'Compliance',
    dataPoints: 5200,
    reviewed: 5200,
    total: 5200,
    status: 'Active',
    lastUpdated: '2 weeks ago',
  },
];

export default function AssessmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Risk Assessments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor and manage risk intelligence assessments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
        >
          New Assessment
        </Button>
      </Box>

      {/* Search and Filter Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={(e) => setFilterAnchorEl(e.currentTarget)}
          >
            Filters
          </Button>
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={() => setFilterAnchorEl(null)}
          >
            <MenuItem>All Assessments</MenuItem>
            <MenuItem>Critical Risk</MenuItem>
            <MenuItem>High Risk</MenuItem>
            <MenuItem>Medium Risk</MenuItem>
            <MenuItem>Low Risk</MenuItem>
            <MenuItem>Pending Review</MenuItem>
          </Menu>
        </Box>
      </Paper>

      {/* Assessments Table */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'grey.50',
              borderBottom: '2px solid',
              borderColor: 'divider',
            },
          }}
          autoHeight
        />
      </Paper>
    </Box>
  );
}