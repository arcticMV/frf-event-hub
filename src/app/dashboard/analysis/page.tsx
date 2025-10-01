'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  Card,
  CardContent,
  Fade,
  Grow,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Visibility as ViewIcon,
  CheckCircle as VerifyIcon,
  Cancel as RejectIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Analytics as AnalyticsIcon,
  Warning as WarningIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { db } from '@/lib/firebase/client';
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import GlassCard from '@/components/GlassCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import QuickActions from '@/components/QuickActions';
import ProgressiveDisclosure from '@/components/ProgressiveDisclosure';
import { motion } from 'framer-motion';

interface AnalysisEvent {
  id: string;
  eventId: string;
  collectedAt: Timestamp;
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
  metadata?: {
    articleCount?: number;
    isDuplicate?: boolean;
    newsApiUri?: string;
    relatedEvents?: string[];
  };
  reviewStatus: string;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  reviewNotes?: string;
  movedToAnalysisAt?: Timestamp;
  analysisStatus?: string;
  aiAnalysis?: {
    processedAt?: Timestamp;
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
  };
  verificationStatus?: string;
  verifiedBy?: string;
  verifiedAt?: Timestamp;
  verificationNotes?: string;
}

export default function EnhancedAnalysisQueuePage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<AnalysisEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AnalysisEvent | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [verifyDialog, setVerifyDialog] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [editedAnalysis, setEditedAnalysis] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Set up real-time listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'analysis_queue'), (snapshot) => {
      const fetchedEvents: AnalysisEvent[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedEvents.push({
          id: doc.id,
          ...data
        } as AnalysisEvent);
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

  const handleVerify = async (event: AnalysisEvent) => {
    try {
      await updateDoc(doc(db, 'analysis_queue', event.id), {
        verificationStatus: 'verified',
        verifiedBy: user?.email,
        verifiedAt: serverTimestamp(),
        verificationNotes: verificationNotes,
      });

      // Move to verified_events collection
      await setDoc(doc(db, 'verified_events', event.id), {
        ...event,
        verificationStatus: 'verified',
        verifiedBy: user?.email,
        verifiedAt: serverTimestamp(),
        verificationNotes: verificationNotes,
        seenStatus: false,
      });

      toast.success('Event verified and moved to verified events');
      setVerifyDialog(false);
      setVerificationNotes('');
    } catch (error) {
      console.error('Error verifying event:', error);
      toast.error('Failed to verify event');
    }
  };

  const handleReject = async (event: AnalysisEvent) => {
    try {
      await updateDoc(doc(db, 'analysis_queue', event.id), {
        verificationStatus: 'failed',
        verifiedBy: user?.email,
        verifiedAt: serverTimestamp(),
        verificationNotes: verificationNotes,
      });
      toast.success('Event marked as failed verification');
    } catch (error) {
      console.error('Error rejecting event:', error);
      toast.error('Failed to reject event');
    }
  };

  const handleDelete = async (event: AnalysisEvent) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'analysis_queue', event.id));
        toast.success('Event deleted successfully');
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const handleSaveAnalysis = async () => {
    if (!selectedEvent || !editedAnalysis) return;

    try {
      await updateDoc(doc(db, 'analysis_queue', selectedEvent.id), {
        aiAnalysis: editedAnalysis,
        'aiAnalysis.lastEditedBy': user?.email,
        'aiAnalysis.lastEditedAt': serverTimestamp(),
      });
      toast.success('Analysis updated successfully');
      setEditDialog(false);
    } catch (error) {
      console.error('Error updating analysis:', error);
      toast.error('Failed to update analysis');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (severity: number): "error" | "warning" | "info" | "success" | "default" => {
    if (severity >= 8) return 'error';
    if (severity >= 6) return 'warning';
    if (severity >= 4) return 'info';
    if (severity >= 2) return 'success';
    return 'default';
  };

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
      width: 120,
      valueGetter: (value, row) => row.event?.category || 'unknown',
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" />
      )
    },
    {
      field: 'severity',
      headerName: 'Risk Score',
      width: 120,
      valueGetter: (value, row) => row.aiAnalysis?.impactAssessment?.severity || 0,
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
      field: 'confidence',
      headerName: 'Confidence',
      width: 120,
      valueGetter: (value, row) => row.aiAnalysis?.riskClassification?.confidence || 0,
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
      field: 'location',
      headerName: 'Location',
      flex: 1,
      minWidth: 150,
      valueGetter: (value, row) => {
        const location = row.event?.location?.text?.eng || '';
        const country = row.event?.location?.country?.eng || '';
        return country ? `${location}, ${country}` : location || 'Unknown';
      },
    },
    {
      field: 'verificationStatus',
      headerName: 'Status',
      width: 130,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value || 'pending';
        const color = status === 'verified' ? 'success' :
                     status === 'failed' ? 'error' : 'warning';
        return <Chip label={status} size="small" color={color} />;
      }
    },
    {
      field: 'analyzedAt',
      headerName: 'Analyzed',
      width: 180,
      valueGetter: (value, row) => formatDate(row.aiAnalysis?.processedAt || row.movedToAnalysisAt),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 150,
      getActions: (params) => {
        const event = params.row as AnalysisEvent;
        return [
          <GridActionsCellItem
            key="view"
            icon={<ViewIcon />}
            label="View"
            onClick={() => {
              setSelectedEvent(event);
              setViewDialog(true);
            }}
          />,
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit Analysis"
            onClick={() => {
              setSelectedEvent(event);
              setEditedAnalysis(JSON.parse(JSON.stringify(event.aiAnalysis || {})));
              setEditDialog(true);
            }}
          />,
          <GridActionsCellItem
            key="verify"
            icon={<VerifyIcon />}
            label="Verify"
            onClick={() => {
              setSelectedEvent(event);
              setVerifyDialog(true);
            }}
            disabled={event.verificationStatus === 'verified'}
          />,
          <GridActionsCellItem
            key="reject"
            icon={<RejectIcon />}
            label="Mark Failed"
            onClick={() => handleReject(event)}
            disabled={event.verificationStatus === 'failed'}
            showInMenu
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDelete(event)}
            showInMenu
          />,
        ];
      }
    }
  ];

  // Filter events based on search
  const filteredEvents = events.filter(event =>
    event.event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.eventId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.event?.location?.country?.eng?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSkeleton variant="table" rows={10} />;
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title="No Events in Analysis"
        description="There are no events in the analysis queue. Approved staging events will appear here for AI analysis."
        icon={<AnalyticsIcon />}
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
              Analysis Queue
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Review and verify AI-analyzed events
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            sx={{
              background: 'linear-gradient(135deg, #42A5F5 0%, #1E88E5 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1E88E5 0%, #42A5F5 100%)',
              },
            }}
          >
            Refresh
          </Button>
        </Box>
      </motion.div>

      {/* Statistics Cards */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <GlassCard sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AnalyticsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">{events.length}</Typography>
                <Typography variant="body2" color="text.secondary">Total Events</Typography>
              </Box>
            </Box>
          </CardContent>
        </GlassCard>

        <GlassCard sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {events.filter(e => !e.verificationStatus || e.verificationStatus === 'pending').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Pending Verification</Typography>
              </Box>
            </Box>
          </CardContent>
        </GlassCard>

        <GlassCard sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AssessmentIcon sx={{ fontSize: 40, color: 'error.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {events.filter(e => (e.aiAnalysis?.impactAssessment?.severity || 0) >= 8).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">High Risk</Typography>
              </Box>
            </Box>
          </CardContent>
        </GlassCard>
      </Stack>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search events..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
        }}
      />

      {/* Data Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={filteredEvents}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 25 } },
              sorting: { sortModel: [{ field: 'analyzedAt', sort: 'desc' }] },
            }}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </Box>
      </Paper>

      {/* View Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            Event Analysis Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
                <Tab label="Event Info" />
                <Tab label="AI Analysis" />
                <Tab label="Advisory" />
                <Tab label="Location & Impact" />
              </Tabs>

              {/* Event Info Tab */}
              {tabValue === 0 && (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Event ID</Typography>
                    <Typography variant="body1">{selectedEvent.eventId}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                    <Typography variant="body1" fontWeight="medium">{selectedEvent.event?.title}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Summary</Typography>
                    <Typography variant="body1">{selectedEvent.event?.summary}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                    <Typography variant="body1">
                      {selectedEvent.event?.location?.text?.eng}
                      {selectedEvent.event?.location?.country?.eng && `, ${selectedEvent.event.location.country.eng}`}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                    <Chip label={selectedEvent.event?.category} color="primary" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Event Severity</Typography>
                    <Chip label={selectedEvent.event?.severity} color={getSeverityColor(8)} />
                  </Box>
                  {selectedEvent.metadata && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Metadata</Typography>
                      <Typography variant="body2">Article Count: {selectedEvent.metadata.articleCount}</Typography>
                      <Typography variant="body2">News API URI: {selectedEvent.metadata.newsApiUri}</Typography>
                      <Typography variant="body2">Is Duplicate: {selectedEvent.metadata.isDuplicate ? 'Yes' : 'No'}</Typography>
                    </Box>
                  )}
                </Stack>
              )}

              {/* AI Analysis Tab */}
              {tabValue === 1 && selectedEvent.aiAnalysis && (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Risk Score</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Rating value={selectedEvent.aiAnalysis.impactAssessment?.severity || 0} max={10} readOnly size="large" />
                      <Typography variant="h6">{selectedEvent.aiAnalysis.impactAssessment?.severity || 0}/10</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Risk Classification</Typography>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip label={`Primary: ${selectedEvent.aiAnalysis.riskClassification?.primary}`} color="primary" />
                        <Chip label={`Confidence: ${((selectedEvent.aiAnalysis.riskClassification?.confidence || 0) * 100).toFixed(0)}%`} color="success" />
                      </Box>
                      {selectedEvent.aiAnalysis.riskClassification?.secondary?.map((risk, idx) => (
                        <Chip key={idx} label={risk} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </Box>
                  {selectedEvent.aiAnalysis.temporal && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Temporal Analysis</Typography>
                      <Typography variant="body2">Start: {selectedEvent.aiAnalysis.temporal.eventStart}</Typography>
                      <Typography variant="body2">Duration: {selectedEvent.aiAnalysis.temporal.expectedDuration}</Typography>
                      <Typography variant="body2">Ongoing: {selectedEvent.aiAnalysis.temporal.isOngoing ? 'Yes' : 'No'}</Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Analysis Details</Typography>
                    <Typography variant="body2">Status: {selectedEvent.analysisStatus || 'pending'}</Typography>
                    <Typography variant="body2">Model: {selectedEvent.aiAnalysis.model}</Typography>
                    <Typography variant="body2">Model Region: {selectedEvent.aiAnalysis.modelRegion}</Typography>
                    <Typography variant="body2">Processed: {formatDate(selectedEvent.aiAnalysis.processedAt)}</Typography>
                  </Box>
                </Stack>
              )}

              {/* Advisory Tab */}
              {tabValue === 2 && selectedEvent.aiAnalysis?.advisory && (
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Key Takeaways
                    </Typography>
                    <List dense>
                      {selectedEvent.aiAnalysis.advisory.keyTakeaways?.map((item, idx) => (
                        <ListItem key={idx}>
                          <ListItemText primary={`${idx + 1}. ${item}`} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Recommendations
                    </Typography>
                    <List dense>
                      {selectedEvent.aiAnalysis.advisory.recommendations?.map((item, idx) => (
                        <ListItem key={idx}>
                          <ListItemText primary={`${idx + 1}. ${item}`} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Related Risks
                    </Typography>
                    <List dense>
                      {selectedEvent.aiAnalysis.advisory.relatedRisks?.map((item, idx) => (
                        <ListItem key={idx}>
                          <ListItemText primary={`${idx + 1}. ${item}`} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Stack>
              )}

              {/* Location & Impact Tab */}
              {tabValue === 3 && selectedEvent.aiAnalysis && (
                <Stack spacing={3}>
                  {selectedEvent.aiAnalysis.geocoding && (
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Location Details
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          Coordinates: {selectedEvent.aiAnalysis.geocoding.coordinates?.lat}, {selectedEvent.aiAnalysis.geocoding.coordinates?.lng}
                        </Typography>
                        <Typography variant="body2">
                          Address: {selectedEvent.aiAnalysis.geocoding.coordinates?.formattedAddress}
                        </Typography>
                        <Typography variant="body2">
                          Confidence: {((selectedEvent.aiAnalysis.geocoding.confidence || 0) * 100).toFixed(0)}%
                        </Typography>
                        <Box>
                          <Typography variant="body2" gutterBottom>Affected Regions:</Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {selectedEvent.aiAnalysis.geocoding.affectedRegions?.map((region, idx) => (
                              <Chip key={idx} label={region} size="small" />
                            ))}
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>
                  )}
                  {selectedEvent.aiAnalysis.impactAssessment && (
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Impact Assessment
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          Severity Score: {selectedEvent.aiAnalysis.impactAssessment.severity || 0}/10
                        </Typography>
                        <Typography variant="body2">
                          Radius: {selectedEvent.aiAnalysis.impactAssessment.radiusKm} km ({selectedEvent.aiAnalysis.impactAssessment.radiusCategory})
                        </Typography>
                        <Typography variant="body2">
                          Est. Affected Population: {selectedEvent.aiAnalysis.impactAssessment.estimatedAffectedPopulation?.toLocaleString() || 'N/A'}
                        </Typography>
                        <Box>
                          <Typography variant="body2" gutterBottom>Affected Sectors:</Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {selectedEvent.aiAnalysis.impactAssessment.sectors?.map((sector, idx) => (
                              <Chip key={idx} label={sector} size="small" color="primary" variant="outlined" />
                            ))}
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>
                  )}
                </Stack>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setViewDialog(false);
              setEditDialog(true);
              setEditedAnalysis(JSON.parse(JSON.stringify(selectedEvent?.aiAnalysis || {})));
            }}
            startIcon={<EditIcon />}
          >
            Edit Analysis
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              if (selectedEvent) {
                setViewDialog(false);
                setVerifyDialog(true);
              }
            }}
            startIcon={<VerifyIcon />}
            disabled={selectedEvent?.verificationStatus === 'verified'}
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Analysis Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Edit AI Analysis</DialogTitle>
        <DialogContent>
          {editedAnalysis && (
            <Box sx={{ mt: 2 }}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight="bold">Risk Assessment</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Box>
                      <Typography gutterBottom>Risk Score (0-10)</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Rating
                          value={editedAnalysis.impactAssessment?.severity || 0}
                          max={10}
                          onChange={(e, value) => setEditedAnalysis({
                            ...editedAnalysis,
                            impactAssessment: {
                              ...editedAnalysis.impactAssessment,
                              severity: value
                            }
                          })}
                        />
                        <TextField
                          type="number"
                          value={editedAnalysis.impactAssessment?.severity || 0}
                          onChange={(e) => setEditedAnalysis({
                            ...editedAnalysis,
                            impactAssessment: {
                              ...editedAnalysis.impactAssessment,
                              severity: parseInt(e.target.value)
                            }
                          })}
                          inputProps={{ min: 0, max: 10 }}
                          sx={{ width: 100 }}
                        />
                      </Box>
                    </Box>
                    <TextField
                      label="Primary Risk Category"
                      value={editedAnalysis.riskClassification?.primary || ''}
                      onChange={(e) => setEditedAnalysis({
                        ...editedAnalysis,
                        riskClassification: { ...editedAnalysis.riskClassification, primary: e.target.value }
                      })}
                      fullWidth
                    />
                    <TextField
                      label="Confidence (0-1)"
                      type="number"
                      value={editedAnalysis.riskClassification?.confidence || 0}
                      onChange={(e) => setEditedAnalysis({
                        ...editedAnalysis,
                        riskClassification: { ...editedAnalysis.riskClassification, confidence: parseFloat(e.target.value) }
                      })}
                      inputProps={{ min: 0, max: 1, step: 0.01 }}
                      fullWidth
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight="bold">Advisory</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Box>
                      <Typography gutterBottom>Key Takeaways</Typography>
                      {editedAnalysis.advisory?.keyTakeaways?.map((item: string, idx: number) => (
                        <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <TextField
                            value={item}
                            onChange={(e) => {
                              const newTakeaways = [...(editedAnalysis.advisory?.keyTakeaways || [])];
                              newTakeaways[idx] = e.target.value;
                              setEditedAnalysis({
                                ...editedAnalysis,
                                advisory: { ...editedAnalysis.advisory, keyTakeaways: newTakeaways }
                              });
                            }}
                            fullWidth
                            multiline
                            rows={2}
                          />
                          <IconButton
                            onClick={() => {
                              const newTakeaways = editedAnalysis.advisory?.keyTakeaways?.filter((_: any, i: number) => i !== idx);
                              setEditedAnalysis({
                                ...editedAnalysis,
                                advisory: { ...editedAnalysis.advisory, keyTakeaways: newTakeaways }
                              });
                            }}
                          >
                            <RemoveIcon />
                          </IconButton>
                        </Box>
                      ))}
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => {
                          const newTakeaways = [...(editedAnalysis.advisory?.keyTakeaways || []), ''];
                          setEditedAnalysis({
                            ...editedAnalysis,
                            advisory: { ...editedAnalysis.advisory, keyTakeaways: newTakeaways }
                          });
                        }}
                      >
                        Add Takeaway
                      </Button>
                    </Box>

                    <Box>
                      <Typography gutterBottom>Recommendations</Typography>
                      {editedAnalysis.advisory?.recommendations?.map((item: string, idx: number) => (
                        <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <TextField
                            value={item}
                            onChange={(e) => {
                              const newRecs = [...(editedAnalysis.advisory?.recommendations || [])];
                              newRecs[idx] = e.target.value;
                              setEditedAnalysis({
                                ...editedAnalysis,
                                advisory: { ...editedAnalysis.advisory, recommendations: newRecs }
                              });
                            }}
                            fullWidth
                            multiline
                            rows={2}
                          />
                          <IconButton
                            onClick={() => {
                              const newRecs = editedAnalysis.advisory?.recommendations?.filter((_: any, i: number) => i !== idx);
                              setEditedAnalysis({
                                ...editedAnalysis,
                                advisory: { ...editedAnalysis.advisory, recommendations: newRecs }
                              });
                            }}
                          >
                            <RemoveIcon />
                          </IconButton>
                        </Box>
                      ))}
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => {
                          const newRecs = [...(editedAnalysis.advisory?.recommendations || []), ''];
                          setEditedAnalysis({
                            ...editedAnalysis,
                            advisory: { ...editedAnalysis.advisory, recommendations: newRecs }
                          });
                        }}
                      >
                        Add Recommendation
                      </Button>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight="bold">Location & Impact</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2}>
                      <TextField
                        label="Latitude"
                        type="number"
                        value={editedAnalysis.geocoding?.coordinates?.lat || ''}
                        onChange={(e) => setEditedAnalysis({
                          ...editedAnalysis,
                          geocoding: {
                            ...editedAnalysis.geocoding,
                            coordinates: { ...editedAnalysis.geocoding?.coordinates, lat: parseFloat(e.target.value) }
                          }
                        })}
                        fullWidth
                      />
                      <TextField
                        label="Longitude"
                        type="number"
                        value={editedAnalysis.geocoding?.coordinates?.lng || ''}
                        onChange={(e) => setEditedAnalysis({
                          ...editedAnalysis,
                          geocoding: {
                            ...editedAnalysis.geocoding,
                            coordinates: { ...editedAnalysis.geocoding?.coordinates, lng: parseFloat(e.target.value) }
                          }
                        })}
                        fullWidth
                      />
                    </Stack>
                    <TextField
                      label="Impact Radius (km)"
                      type="number"
                      value={editedAnalysis.impactAssessment?.radiusKm || ''}
                      onChange={(e) => setEditedAnalysis({
                        ...editedAnalysis,
                        impactAssessment: { ...editedAnalysis.impactAssessment, radiusKm: parseInt(e.target.value) }
                      })}
                      fullWidth
                    />
                    <TextField
                      label="Estimated Affected Population"
                      type="number"
                      value={editedAnalysis.impactAssessment?.estimatedAffectedPopulation || ''}
                      onChange={(e) => setEditedAnalysis({
                        ...editedAnalysis,
                        impactAssessment: { ...editedAnalysis.impactAssessment, estimatedAffectedPopulation: parseInt(e.target.value) }
                      })}
                      fullWidth
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight="bold">Temporal Information</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <TextField
                      label="Event Start"
                      value={editedAnalysis.temporal?.eventStart || ''}
                      onChange={(e) => setEditedAnalysis({
                        ...editedAnalysis,
                        temporal: { ...editedAnalysis.temporal, eventStart: e.target.value }
                      })}
                      fullWidth
                    />
                    <TextField
                      label="Expected Duration"
                      value={editedAnalysis.temporal?.expectedDuration || ''}
                      onChange={(e) => setEditedAnalysis({
                        ...editedAnalysis,
                        temporal: { ...editedAnalysis.temporal, expectedDuration: e.target.value }
                      })}
                      fullWidth
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={editedAnalysis.temporal?.isOngoing || false}
                          onChange={(e) => setEditedAnalysis({
                            ...editedAnalysis,
                            temporal: { ...editedAnalysis.temporal, isOngoing: e.target.checked }
                          })}
                        />
                      }
                      label="Is Ongoing"
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAnalysis}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Verify Dialog */}
      <Dialog open={verifyDialog} onClose={() => setVerifyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Verify Event Analysis</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Verifying this event will move it to the Verified Events collection.
          </Alert>
          <TextField
            label="Verification Notes"
            multiline
            rows={4}
            fullWidth
            value={verificationNotes}
            onChange={(e) => setVerificationNotes(e.target.value)}
            placeholder="Add any notes about your verification..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => selectedEvent && handleVerify(selectedEvent)}
            startIcon={<VerifyIcon />}
          >
            Verify Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}