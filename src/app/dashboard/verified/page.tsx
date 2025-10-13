'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Rating,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as VerifiedIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  Search as SearchIcon,
  Description as DescriptionIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import { db } from '@/lib/firebase/client';
import {
  collection,
  query,
  getDocs,
  orderBy,
  limit,
  where,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import GlassCard from '@/components/GlassCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import ProgressiveDisclosure from '@/components/ProgressiveDisclosure';
import { motion } from 'framer-motion';

interface VerifiedEvent {
  id: string;
  eventId: string;
  event: {
    title: string;
    summary: string;
    dateTime: Timestamp;
    location: {
      text: { eng: string };
      country: { eng: string };
    };
    category: string;
    severity: string;
  };
  analysis?: {
    severity?: number;
    riskClassification?: {
      confidence?: number;
      primary?: string;
      secondary?: string[];
    };
    advisory?: {
      keyTakeaways?: string[];
      recommendations?: string[];
      relatedRisks?: string[];
    };
    geocoding?: {
      coordinates?: {
        lat?: number;
        lng?: number;
        formattedAddress?: string;
      };
      affectedRegions?: string[];
      confidence?: number;
      geocodingService?: string;
    };
    impactAssessment?: {
      severity?: number;
      radiusKm?: number;
      radiusCategory?: string;
      estimatedAffectedPopulation?: number;
      sectors?: string[];
    };
    temporal?: {
      eventStart?: string;
      expectedDuration?: string;
      isOngoing?: boolean;
    };
    model?: string;
    modelRegion?: string;
    processedAt?: Timestamp;
  };
  processHistory?: {
    collectedAt?: Timestamp;
    analyzedAt?: Timestamp;
    verifiedAt?: Timestamp;
  };
  metadata?: {
    createdAt?: Timestamp;
    lastUpdated?: Timestamp;
  };
  originalMetadata?: {
    articleCount?: number;
    newsApiUri?: string;
    isDuplicate?: boolean;
    relatedEvents?: string[];
  };
  indices?: {
    byDate?: string;
    byRegion?: string;
    bySeverity?: number;
    byType?: string;
  };
  visibility?: {
    projects?: string[];
  };
  tags?: string[];
  version?: number;
}

export default function EnhancedVerifiedEventsPage() {
  const [events, setEvents] = useState<VerifiedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<VerifiedEvent | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  // Set up real-time listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'verified_events'), (snapshot) => {
      const fetchedEvents: VerifiedEvent[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedEvents.push({
          id: doc.id,
          ...data
        } as VerifiedEvent);
      });
      // Sort by lastUpdated descending (most recent first)
      fetchedEvents.sort((a, b) => {
        const aTime = a.metadata?.lastUpdated?.toMillis?.() || a.metadata?.lastUpdated || 0;
        const bTime = b.metadata?.lastUpdated?.toMillis?.() || b.metadata?.lastUpdated || 0;
        return (bTime as number) - (aTime as number);
      });
      setEvents(fetchedEvents);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to events:', error);
      toast.error('Failed to connect to real-time updates');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleView = (event: VerifiedEvent) => {
    setSelectedEvent(event);
    setViewDialog(true);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';

    // Handle Firestore Timestamp
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate().toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // Handle seconds format
    if (timestamp && typeof timestamp === 'object' && '_seconds' in timestamp) {
      return new Date(timestamp._seconds * 1000).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    return 'N/A';
  };

  const getSeverityColor = (severity: number): "error" | "warning" | "info" | "success" | "default" => {
    if (severity >= 8) return 'error';
    if (severity >= 6) return 'warning';
    if (severity >= 4) return 'info';
    if (severity >= 2) return 'success';
    return 'default';
  };

  const getRiskBadgeColor = (score: number) => {
    if (score >= 8) return 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
    if (score >= 6) return 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
    if (score >= 4) return 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)';
    return 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' ||
      event.event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.event?.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.event?.location?.country?.eng?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = filterSeverity === 'all' ||
      (filterSeverity === 'critical' && (event.analysis?.impactAssessment?.severity || 0) >= 8) ||
      (filterSeverity === 'high' && (event.analysis?.impactAssessment?.severity || 0) >= 6 && (event.analysis?.impactAssessment?.severity || 0) < 8) ||
      (filterSeverity === 'medium' && (event.analysis?.impactAssessment?.severity || 0) >= 4 && (event.analysis?.impactAssessment?.severity || 0) < 6) ||
      (filterSeverity === 'low' && (event.analysis?.impactAssessment?.severity || 0) < 4);

    const matchesCategory = filterCategory === 'all' || event.event?.category === filterCategory;

    return matchesSearch && matchesSeverity && matchesCategory;
  });

  // Get statistics
  const stats = {
    total: filteredEvents.length,
    critical: filteredEvents.filter(e => (e.analysis?.impactAssessment?.severity || 0) >= 8).length,
    high: filteredEvents.filter(e => (e.analysis?.impactAssessment?.severity || 0) >= 6 && (e.analysis?.impactAssessment?.severity || 0) < 8).length,
    avgRisk: filteredEvents.length > 0
      ? filteredEvents.reduce((sum, e) => sum + (e.analysis?.impactAssessment?.severity || 0), 0) / filteredEvents.length
      : 0,
  };

  // Get unique categories
  const categories = [...new Set(events.map(e => e.event?.category).filter(Boolean))];

  // Table columns
  const columns: GridColDef[] = [
    {
      field: 'eventId',
      headerName: 'Event ID',
      width: 120,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography variant="body2" noWrap>{params.value}</Typography>
        </Tooltip>
      )
    },
    {
      field: 'title',
      headerName: 'Title',
      flex: 2,
      minWidth: 250,
      valueGetter: (value, row) => row.event?.title || 'N/A',
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography variant="body2" noWrap>{params.value}</Typography>
        </Tooltip>
      )
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 130,
      valueGetter: (value, row) => row.event?.category || 'unknown',
      renderCell: (params) => (
        <Chip label={params.value} size="small" color="primary" variant="outlined" />
      )
    },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 110,
      valueGetter: (value, row) => row.event?.severity || 'unknown',
      renderCell: (params) => (
        <Chip label={params.value} size="small" color={getSeverityColor(8)} />
      )
    },
    {
      field: 'riskScore',
      headerName: 'Risk Score',
      width: 130,
      valueGetter: (value, row) => row.analysis?.impactAssessment?.severity || 0,
      renderCell: (params: GridRenderCellParams) => {
        const score = params.value as number;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={score * 10}
              sx={{
                width: 60,
                height: 8,
                borderRadius: 4,
                backgroundColor: 'grey.300',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: score >= 8 ? 'error.main' :
                                  score >= 6 ? 'warning.main' :
                                  score >= 4 ? 'info.main' : 'success.main'
                }
              }}
            />
            <Typography variant="body2" fontWeight="bold">
              {score}/10
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1,
      minWidth: 180,
      valueGetter: (value, row) => {
        const location = row.event?.location?.text?.eng || '';
        const country = row.event?.location?.country?.eng || '';
        return country ? `${location}, ${country}` : location || 'Unknown';
      },
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography variant="body2" noWrap>{params.value}</Typography>
        </Tooltip>
      )
    },
    {
      field: 'confidence',
      headerName: 'Confidence',
      width: 110,
      valueGetter: (value, row) => row.analysis?.riskClassification?.confidence || 0,
      renderCell: (params) => {
        const confidence = (params.value as number) * 100;
        return (
          <Chip
            label={`${confidence.toFixed(0)}%`}
            size="small"
            color={confidence >= 80 ? 'success' : confidence >= 60 ? 'warning' : 'error'}
            variant="outlined"
          />
        );
      }
    },
    {
      field: 'lastUpdated',
      headerName: 'Last Updated',
      width: 180,
      valueGetter: (value, row) => formatDate(row.metadata?.lastUpdated || row.processHistory?.verifiedAt || row.metadata?.createdAt),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 100,
      getActions: (params) => {
        const event = params.row as VerifiedEvent;
        return [
          <GridActionsCellItem
            key="view"
            icon={<ViewIcon />}
            label="View"
            onClick={() => handleView(event)}
          />,
        ];
      }
    }
  ];

  if (loading) {
    return <LoadingSkeleton variant="card" rows={6} />;
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title="No Verified Events"
        description="Verified events will appear here once they've been analyzed and confirmed."
        icon={<VerifiedIcon />}
        height="60vh"
      />
    );
  }

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Verified Intelligence Events
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Confirmed and analyzed threat intelligence
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant={viewMode === 'cards' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('cards')}
            >
              Card View
            </Button>
            <Button
              variant={viewMode === 'table' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('table')}
            >
              Table View
            </Button>
          </Stack>
        </Box>
      </motion.div>

      {/* Statistics */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <GlassCard sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <VerifiedIcon sx={{ fontSize: 40, color: 'success.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
                <Typography variant="body2" color="text.secondary">Total Verified</Typography>
              </Box>
            </Box>
          </CardContent>
        </GlassCard>

        <GlassCard sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WarningIcon sx={{ fontSize: 40, color: 'error.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">{stats.critical}</Typography>
                <Typography variant="body2" color="text.secondary">Critical Risk</Typography>
              </Box>
            </Box>
          </CardContent>
        </GlassCard>

        <GlassCard sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">{stats.high}</Typography>
                <Typography variant="body2" color="text.secondary">High Risk</Typography>
              </Box>
            </Box>
          </CardContent>
        </GlassCard>

        <GlassCard sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">{stats.avgRisk.toFixed(1)}</Typography>
                <Typography variant="body2" color="text.secondary">Avg Risk Score</Typography>
              </Box>
            </Box>
          </CardContent>
        </GlassCard>
      </Stack>

      {/* Filters */}
      <ProgressiveDisclosure
        title="Show Filters"
        variant="inline"
        basicContent={
          <TextField
            fullWidth
            placeholder="Search events by title, summary, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />
        }
        advancedContent={
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Severity</InputLabel>
              <Select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                label="Severity"
                size="small"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="critical">Critical (8-10)</MenuItem>
                <MenuItem value="high">High (6-7)</MenuItem>
                <MenuItem value="medium">Medium (4-5)</MenuItem>
                <MenuItem value="low">Low (0-3)</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Category"
                size="small"
              >
                <MenuItem value="all">All</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={() => {
                setFilterSeverity('all');
                setFilterCategory('all');
                setSearchTerm('');
              }}
            >
              Clear Filters
            </Button>
          </Stack>
        }
      />

      {/* Events Display */}
      {viewMode === 'cards' ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 3 }}>
          {filteredEvents.map((event, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={event.id}
              >
                <GlassCard
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'visible',
                  }}
                  onClick={() => handleView(event)}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: getRiskBadgeColor(event.analysis?.impactAssessment?.severity || 0),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold" color="white">
                      {event.analysis?.impactAssessment?.severity || 0}
                    </Typography>
                  </Box>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                      {event.event?.title}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip
                        label={event.event?.category || 'unknown'}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={event.event?.severity}
                        size="small"
                        color={getSeverityColor(8)}
                      />
                    </Stack>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 2,
                      }}
                    >
                      {event.event?.summary}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2" noWrap>
                          {event.event?.location?.text?.eng}, {event.event?.location?.country?.eng}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatDate(event.processHistory?.verifiedAt || event.metadata?.createdAt)}
                        </Typography>
                      </Box>
                    </Stack>
                    <Button
                      fullWidth
                      variant="text"
                      sx={{ mt: 2 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(event);
                      }}
                    >
                      View Full Intelligence
                    </Button>
                  </CardContent>
                </GlassCard>
              </motion.div>
          ))}
        </Box>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <Box sx={{ height: 600 }}>
            <DataGrid
              rows={filteredEvents}
              columns={columns}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { page: 0, pageSize: 25 } },
                sorting: { sortModel: [{ field: 'lastUpdated', sort: 'desc' }] },
              }}
              checkboxSelection
              disableRowSelectionOnClick
            />
          </Box>
        </Paper>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold" component="span">
            Verified Intelligence Report
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
                <Tab label="Event Details" />
                <Tab label="Risk Analysis" />
                <Tab label="Advisory & Recommendations" />
                <Tab label="Impact Assessment" />
                <Tab label="Metadata" />
              </Tabs>

              {/* Event Details Tab */}
              {tabValue === 0 && (
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Event ID</Typography>
                    <Typography variant="body1" fontWeight="medium">{selectedEvent.eventId}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                    <Typography variant="h6">{selectedEvent.event?.title}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Summary</Typography>
                    <Paper sx={{ p: 2, backgroundColor: 'action.hover' }}>
                      <Typography variant="body1">{selectedEvent.event?.summary}</Typography>
                    </Paper>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Location</Typography>
                    <Stack direction="row" spacing={1}>
                      <LocationIcon color="action" />
                      <Typography variant="body1">
                        {selectedEvent.event?.location?.text?.eng}, {selectedEvent.event?.location?.country?.eng}
                      </Typography>
                    </Stack>
                    {selectedEvent.analysis?.geocoding?.coordinates && (
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                        Coordinates: {selectedEvent.analysis.geocoding.coordinates.lat}, {selectedEvent.analysis.geocoding.coordinates.lng}
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                      <Chip label={selectedEvent.event?.category || 'unknown'} color="primary" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Severity</Typography>
                      <Chip label={selectedEvent.event?.severity} color={getSeverityColor(8)} />
                    </Box>
                  </Stack>
                </Stack>
              )}

              {/* Risk Analysis Tab */}
              {tabValue === 1 && selectedEvent.analysis && (
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Risk Score</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Rating value={selectedEvent.analysis.impactAssessment?.severity || 0} max={10} readOnly size="large" />
                      <Typography variant="h4" fontWeight="bold" color={getSeverityColor(selectedEvent.analysis.impactAssessment?.severity || 0)}>
                        {selectedEvent.analysis.impactAssessment?.severity || 0}/10
                      </Typography>
                    </Box>
                  </Box>

                  {selectedEvent.analysis.riskClassification && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>Risk Classification</Typography>
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            label={`Primary: ${selectedEvent.analysis.riskClassification.primary}`}
                            color="primary"
                            variant="filled"
                          />
                          <Chip
                            label={`Confidence: ${((selectedEvent.analysis.riskClassification.confidence || 0) * 100).toFixed(0)}%`}
                            color="success"
                            variant="outlined"
                          />
                        </Stack>
                        {selectedEvent.analysis.riskClassification.secondary && (
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {selectedEvent.analysis.riskClassification.secondary.map((risk, idx) => (
                              <Chip key={idx} label={risk} size="small" variant="outlined" />
                            ))}
                          </Stack>
                        )}
                      </Stack>
                    </Box>
                  )}

                  {selectedEvent.analysis.temporal && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>Temporal Analysis</Typography>
                      <Paper sx={{ p: 2, backgroundColor: 'action.hover' }}>
                        <Stack spacing={1}>
                          <Typography variant="body2">
                            <strong>Event Start:</strong> {selectedEvent.analysis.temporal.eventStart}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Expected Duration:</strong> {selectedEvent.analysis.temporal.expectedDuration}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Is Ongoing:</strong> {selectedEvent.analysis.temporal.isOngoing ? 'Yes' : 'No'}
                          </Typography>
                        </Stack>
                      </Paper>
                    </Box>
                  )}

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Analysis Info</Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">Model: {selectedEvent.analysis.model}</Typography>
                      <Typography variant="body2">Region: {selectedEvent.analysis.modelRegion}</Typography>
                      <Typography variant="body2">Processed: {formatDate(selectedEvent.analysis.processedAt)}</Typography>
                    </Stack>
                  </Box>
                </Stack>
              )}

              {/* Advisory Tab */}
              {tabValue === 2 && selectedEvent.analysis?.advisory && (
                <Stack spacing={3}>
                  {selectedEvent.analysis.advisory.keyTakeaways && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Key Takeaways
                      </Typography>
                      <List>
                        {selectedEvent.analysis.advisory.keyTakeaways.map((takeaway, idx) => (
                          <ListItem key={idx}>
                            <ListItemText
                              primary={`${idx + 1}. ${takeaway}`}
                              primaryTypographyProps={{ variant: 'body1' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {selectedEvent.analysis.advisory.recommendations && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Recommendations
                      </Typography>
                      <List>
                        {selectedEvent.analysis.advisory.recommendations.map((rec, idx) => (
                          <ListItem key={idx}>
                            <ListItemText
                              primary={`${idx + 1}. ${rec}`}
                              primaryTypographyProps={{ variant: 'body1' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {selectedEvent.analysis.advisory.relatedRisks && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Related Risks
                      </Typography>
                      <List>
                        {selectedEvent.analysis.advisory.relatedRisks.map((risk, idx) => (
                          <ListItem key={idx}>
                            <ListItemText
                              primary={`${idx + 1}. ${risk}`}
                              primaryTypographyProps={{ variant: 'body1' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Stack>
              )}

              {/* Impact Assessment Tab */}
              {tabValue === 3 && selectedEvent.analysis && (
                <Stack spacing={3}>
                  {selectedEvent.analysis.geocoding && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Geographic Impact
                      </Typography>
                      <Paper sx={{ p: 2, backgroundColor: 'action.hover' }}>
                        <Stack spacing={1}>
                          {selectedEvent.analysis.geocoding.coordinates && (
                            <>
                              <Typography variant="body2">
                                <strong>Coordinates:</strong> {selectedEvent.analysis.geocoding.coordinates.lat}, {selectedEvent.analysis.geocoding.coordinates.lng}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Address:</strong> {selectedEvent.analysis.geocoding.coordinates.formattedAddress}
                              </Typography>
                            </>
                          )}
                          <Typography variant="body2">
                            <strong>Confidence:</strong> {((selectedEvent.analysis.geocoding.confidence || 0) * 100).toFixed(0)}%
                          </Typography>
                          {selectedEvent.analysis.geocoding.affectedRegions && (
                            <Box>
                              <Typography variant="body2" gutterBottom><strong>Affected Regions:</strong></Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                {selectedEvent.analysis.geocoding.affectedRegions.map((region, idx) => (
                                  <Chip key={idx} label={region} size="small" variant="outlined" />
                                ))}
                              </Stack>
                            </Box>
                          )}
                        </Stack>
                      </Paper>
                    </Box>
                  )}

                  {selectedEvent.analysis.impactAssessment && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Impact Assessment
                      </Typography>
                      <Paper sx={{ p: 2, backgroundColor: 'action.hover' }}>
                        <Stack spacing={2}>
                          <Typography variant="body2">
                            <strong>Severity Score:</strong> {selectedEvent.analysis.impactAssessment.severity || 0}/10
                          </Typography>
                          <Typography variant="body2">
                            <strong>Impact Radius:</strong> {selectedEvent.analysis.impactAssessment.radiusKm} km ({selectedEvent.analysis.impactAssessment.radiusCategory})
                          </Typography>
                          <Typography variant="body2">
                            <strong>Estimated Affected Population:</strong> {selectedEvent.analysis.impactAssessment.estimatedAffectedPopulation?.toLocaleString() || 'N/A'}
                          </Typography>
                          {selectedEvent.analysis.impactAssessment.sectors && (
                            <Box>
                              <Typography variant="body2" gutterBottom><strong>Affected Sectors:</strong></Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                {selectedEvent.analysis.impactAssessment.sectors.map((sector, idx) => (
                                  <Chip key={idx} label={sector} size="small" color="primary" variant="outlined" />
                                ))}
                              </Stack>
                            </Box>
                          )}
                        </Stack>
                      </Paper>
                    </Box>
                  )}
                </Stack>
              )}

              {/* Metadata Tab */}
              {tabValue === 4 && (
                <Stack spacing={3}>
                  {selectedEvent.processHistory && (
                    <Box>
                      <Typography variant="h6" gutterBottom>Process History</Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          <strong>Collected:</strong> {formatDate(selectedEvent.processHistory.collectedAt)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Analyzed:</strong> {formatDate(selectedEvent.processHistory.analyzedAt)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Verified:</strong> {formatDate(selectedEvent.processHistory.verifiedAt)}
                        </Typography>
                      </Stack>
                    </Box>
                  )}

                  {selectedEvent.originalMetadata && (
                    <Box>
                      <Typography variant="h6" gutterBottom>Source Information</Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          <strong>Article Count:</strong> {selectedEvent.originalMetadata.articleCount}
                        </Typography>
                        <Typography variant="body2">
                          <strong>News API URI:</strong> {selectedEvent.originalMetadata.newsApiUri}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Is Duplicate:</strong> {selectedEvent.originalMetadata.isDuplicate ? 'Yes' : 'No'}
                        </Typography>
                      </Stack>
                    </Box>
                  )}

                  {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>Tags</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {selectedEvent.tags.map((tag, idx) => (
                          <Chip key={idx} label={tag} size="small" />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {selectedEvent.version && (
                    <Box>
                      <Typography variant="body2">
                        <strong>Document Version:</strong> {selectedEvent.version}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}