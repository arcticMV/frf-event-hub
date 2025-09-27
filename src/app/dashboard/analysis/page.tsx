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
  Skeleton,
  Fade,
  Grow,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
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
} from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

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
  aiAnalysis?: {
    analysisStatus?: string;
    processedAt?: Timestamp;
    riskClassification?: {
      confidence?: number;
      primary?: string;
      secondary?: string[];
    };
    severity?: number;
    advisory?: {
      keyTakeaways?: string[];
      recommendations?: string[];
      relatedRisks?: string[];
    };
    geocoding?: {
      coordinates?: {
        lat?: number;
        lng?: number;
      };
      formattedAddress?: string;
      affectedRegions?: string[];
      confidence?: number;
    };
    impactAssessment?: {
      radiusKm?: number;
      radiusCategory?: string;
      estimatedAffectedPopulation?: number | null;
      sectors?: string[];
    };
    temporal?: {
      eventStart?: string;
      expectedDuration?: string;
      isOngoing?: boolean;
    };
    model?: string;
  };
  verificationStatus?: string;
  verifiedBy?: string;
  verifiedAt?: Timestamp;
  verificationNotes?: string;
}

export default function AnalysisQueuePage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<AnalysisEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AnalysisEvent | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [verifyDialog, setVerifyDialog] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [editedAnalysis, setEditedAnalysis] = useState<any>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'analysis_queue'));
      const snapshot = await getDocs(q);

      const fetchedEvents: AnalysisEvent[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Ensure the data structure matches our interface
        const event: AnalysisEvent = {
          id: doc.id,
          eventId: data.eventId,
          collectedAt: data.collectedAt,
          event: data.event,
          reviewStatus: data.reviewStatus,
          reviewedBy: data.reviewedBy,
          reviewedAt: data.reviewedAt,
          aiAnalysis: data.aiAnalysis,
          verificationStatus: data.verificationStatus,
          verifiedBy: data.verifiedBy,
          verifiedAt: data.verifiedAt,
          verificationNotes: data.verificationNotes,
          metadata: data.metadata,
          reviewNotes: data.reviewNotes,
          movedToAnalysisAt: data.movedToAnalysisAt,
        } as AnalysisEvent;

        fetchedEvents.push(event);
      });
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching analysis queue:', error);
      toast.error('Failed to fetch analysis queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleView = (event: AnalysisEvent) => {
    setSelectedEvent(event);
    setViewDialog(true);
  };

  const handleVerifyDialog = (event: AnalysisEvent) => {
    setSelectedEvent(event);
    setEditedAnalysis(event.aiAnalysis || {});
    setVerificationNotes('');
    setVerifyDialog(true);
  };

  const handleVerify = async (status: 'verified' | 'failed') => {
    if (!selectedEvent || !user) return;

    try {
      const eventRef = doc(db, 'analysis_queue', selectedEvent.id);

      const updateData: any = {
        verificationStatus: status,
        verifiedBy: user.email,
        verifiedAt: serverTimestamp(),
        verificationNotes: verificationNotes,
      };

      if (editedAnalysis) {
        updateData.aiAnalysis = {
          ...editedAnalysis,
          processedAt: selectedEvent.aiAnalysis?.processedAt || serverTimestamp(),
        };
      }

      await updateDoc(eventRef, updateData);

      toast.success(`Event ${status} successfully`);

      // If verified, it will be automatically moved to verified_events by backend

      fetchEvents();
      setVerifyDialog(false);
      setSelectedEvent(null);
      setEditedAnalysis(null);
      setVerificationNotes('');
    } catch (error) {
      console.error(`Error ${status} event:`, error);
      toast.error(`Failed to ${status} event`);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this analysis?')) {
      try {
        await deleteDoc(doc(db, 'analysis_queue', eventId));
        toast.success('Analysis deleted successfully');
        fetchEvents();
      } catch (error) {
        console.error('Error deleting analysis:', error);
        toast.error('Failed to delete analysis');
      }
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';

    // Handle Firestore Timestamp object
    if (timestamp && typeof timestamp === 'object' && '_seconds' in timestamp) {
      return new Date(timestamp._seconds * 1000).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // Handle if it's already a Date object
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return 'N/A';
  };

  const getRiskColor = (score: number) => {
    if (score >= 8) return 'error';
    if (score >= 6) return 'warning';
    if (score >= 4) return 'info';
    return 'success';
  };

  const columns: GridColDef[] = [
    {
      field: 'eventId',
      headerName: 'Event ID',
      width: 110,
      minWidth: 100,
    },
    {
      field: 'title',
      headerName: 'Title',
      flex: 2,
      minWidth: 200,
      valueGetter: (params: any) => params?.row?.event?.title || 'N/A',
    },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 90,
      minWidth: 80,
      valueGetter: (params: any) => params?.row?.event?.severity || 'unknown',
      renderCell: (params: GridRenderCellParams) => {
        const value = params?.value || 'unknown';
        const color = value === 'critical' ? 'error' :
                      value === 'high' ? 'warning' :
                      value === 'medium' ? 'info' : 'success';
        return <Chip label={value} size="small" color={color as any} />;
      },
    },
    {
      field: 'riskScore',
      headerName: 'Risk Score',
      width: 110,
      minWidth: 100,
      valueGetter: (params: any) => params?.row?.aiAnalysis?.severity || 0,
      renderCell: (params: GridRenderCellParams) => {
        const score = params.value as number;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={score * 10}
              sx={{ width: 60, height: 8, borderRadius: 4 }}
              color={getRiskColor(score) as any}
            />
            <Typography variant="body2">{score}/10</Typography>
          </Box>
        );
      },
    },
    {
      field: 'confidence',
      headerName: 'Confidence',
      width: 90,
      minWidth: 80,
      valueGetter: (params: any) => params?.row?.aiAnalysis?.riskClassification?.confidence || 0,
      renderCell: (params: GridRenderCellParams) => {
        const confidence = params.value as number;
        return `${(confidence * 100).toFixed(0)}%`;
      },
    },
    {
      field: 'verificationStatus',
      headerName: 'Verification',
      width: 100,
      minWidth: 90,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value || 'pending';
        const color = status === 'verified' ? 'success' :
                      status === 'failed' ? 'error' : 'warning';
        return <Chip label={status} size="small" color={color as any} />;
      },
    },
    {
      field: 'analyzedAt',
      headerName: 'Analyzed',
      width: 110,
      minWidth: 100,
      valueGetter: (params: any) => formatDate(params?.row?.aiAnalysis?.processedAt || params?.row?.reviewedAt),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      minWidth: 90,
      getActions: (params) => {
        if (!params?.row) return [];

        const actions = [
          <GridActionsCellItem
            key="view"
            icon={<ViewIcon />}
            label="View"
            onClick={() => handleView(params.row)}
          />,
        ];

        if (!params.row?.verificationStatus || params.row?.verificationStatus === 'pending') {
          actions.push(
            <GridActionsCellItem
              key="verify"
              icon={<VerifyIcon />}
              label="Verify"
              onClick={() => handleVerifyDialog(params.row)}
            />
          );
        }

        actions.push(
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDelete(params.row?.id)}
            showInMenu
          />
        );

        return actions;
      },
    },
  ];

  const pendingCount = events.filter(e => !e.verificationStatus || e.verificationStatus === 'pending').length;
  const verifiedCount = events.filter(e => e.verificationStatus === 'verified').length;
  const failedCount = events.filter(e => e.verificationStatus === 'failed').length;
  const avgRiskScore = events.reduce((acc, e) => acc + (e.aiAnalysis?.severity || 0), 0) / (events.length || 1);

  return (
    <Fade in timeout={300}>
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Analysis Queue Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and verify AI-analyzed events
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchEvents}
        >
          Refresh
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h5" fontWeight="bold">{events.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Total in Queue</Typography>
                </Box>
                <AnalyticsIcon color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="warning.main">{pendingCount}</Typography>
                  <Typography variant="body2" color="text.secondary">Pending Verification</Typography>
                </Box>
                <WarningIcon color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="success.main">{verifiedCount}</Typography>
                  <Typography variant="body2" color="text.secondary">Verified</Typography>
                </Box>
                <VerifyIcon color="success" />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="info.main">
                    {avgRiskScore.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Avg Risk Score</Typography>
                </Box>
                <AssessmentIcon color="info" />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* Data Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={events}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 25 },
              },
              sorting: {
                sortModel: [{ field: 'analyzedAt', sort: 'desc' }],
              },
            }}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }}
          />
        </Box>
      </Paper>

      {/* View Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Event Analysis Details</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 1 }}>
              <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: 300 }}>
                <Typography variant="h6" gutterBottom>Event Information</Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Event ID</Typography>
                    <Typography variant="body1">{selectedEvent.eventId}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                    <Typography variant="body1">{selectedEvent.event.title}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Summary</Typography>
                    <Typography variant="body2">{selectedEvent.event.summary}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                    <Typography variant="body1">
                      {selectedEvent.event.location.text.eng}, {selectedEvent.event.location.country.eng}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Category / Severity</Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip label={selectedEvent.event.category} size="small" />
                      <Chip
                        label={selectedEvent.event.severity}
                        size="small"
                        color={
                          selectedEvent.event.severity === 'critical' ? 'error' :
                          selectedEvent.event.severity === 'high' ? 'warning' :
                          selectedEvent.event.severity === 'medium' ? 'info' : 'success'
                        }
                      />
                    </Stack>
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: 300 }}>
                <Typography variant="h6" gutterBottom>AI Analysis</Typography>
                {selectedEvent.aiAnalysis ? (
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Risk Score</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h4" color={getRiskColor(selectedEvent.aiAnalysis.severity || 0) + '.main'}>
                          {selectedEvent.aiAnalysis.severity || 0}/10
                        </Typography>
                        <Typography variant="body2">
                          Confidence: {((selectedEvent.aiAnalysis.riskClassification?.confidence || 0) * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                    </Box>

                    {selectedEvent.aiAnalysis.advisory?.keyTakeaways && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Key Takeaways</Typography>
                        <Stack spacing={1} sx={{ mt: 1 }}>
                          {selectedEvent.aiAnalysis.advisory.keyTakeaways.map((takeaway, idx) => (
                            <Typography key={idx} variant="body2">• {takeaway}</Typography>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {selectedEvent.aiAnalysis.advisory?.recommendations && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Recommendations</Typography>
                        <Stack spacing={1} sx={{ mt: 1 }}>
                          {selectedEvent.aiAnalysis.advisory.recommendations.map((rec, idx) => (
                            <Typography key={idx} variant="body2">• {rec}</Typography>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {selectedEvent.aiAnalysis.advisory?.relatedRisks && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Related Risks</Typography>
                        <Stack spacing={1} sx={{ mt: 1 }}>
                          {selectedEvent.aiAnalysis.advisory.relatedRisks.map((risk, idx) => (
                            <Typography key={idx} variant="body2">• {risk}</Typography>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {selectedEvent.aiAnalysis.impactAssessment && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Impact Assessment</Typography>
                        <Stack spacing={1} sx={{ mt: 1 }}>
                          {selectedEvent.aiAnalysis.impactAssessment.radiusKm && (
                            <Typography variant="body2">
                              Affected Radius: {selectedEvent.aiAnalysis.impactAssessment.radiusKm} km ({selectedEvent.aiAnalysis.impactAssessment.radiusCategory})
                            </Typography>
                          )}
                          {selectedEvent.aiAnalysis.impactAssessment.sectors && (
                            <Typography variant="body2">
                              Sectors: {selectedEvent.aiAnalysis.impactAssessment.sectors.join(', ')}
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    )}

                    {selectedEvent.aiAnalysis.geocoding && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Location Details</Typography>
                        <Stack spacing={1} sx={{ mt: 1 }}>
                          {selectedEvent.aiAnalysis.geocoding.formattedAddress && (
                            <Typography variant="body2">{selectedEvent.aiAnalysis.geocoding.formattedAddress}</Typography>
                          )}
                          {selectedEvent.aiAnalysis.geocoding.affectedRegions && (
                            <Typography variant="body2">
                              Affected Regions: {selectedEvent.aiAnalysis.geocoding.affectedRegions.join(', ')}
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                ) : (
                  <Alert severity="warning">No analysis data available</Alert>
                )}
              </Box>

              {selectedEvent.verificationStatus && (
                <Box sx={{ width: '100%' }}>
                  <Alert severity={selectedEvent.verificationStatus === 'verified' ? 'success' : 'error'}>
                    <Typography variant="body2">
                      {selectedEvent.verificationStatus === 'verified' ? 'Verified' : 'Failed'} by {selectedEvent.verifiedBy}
                      at {formatDate(selectedEvent.verifiedAt)}
                    </Typography>
                    {selectedEvent.verificationNotes && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Notes: {selectedEvent.verificationNotes}
                      </Typography>
                    )}
                  </Alert>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Verify Dialog */}
      <Dialog open={verifyDialog} onClose={() => setVerifyDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Verify Analysis</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Alert severity="info">
                Review the AI analysis and make any necessary corrections before verification.
              </Alert>

              <Box>
                <Typography variant="subtitle1" gutterBottom>Event: {selectedEvent.event.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedEvent.event.summary}
                </Typography>
              </Box>

              <Divider />

              <TextField
                fullWidth
                type="number"
                label="Risk Score (0-10)"
                value={editedAnalysis?.severity || 0}
                onChange={(e) => setEditedAnalysis({
                  ...editedAnalysis,
                  severity: parseFloat(e.target.value)
                })}
                InputProps={{ inputProps: { min: 0, max: 10, step: 0.1 } }}
              />

              <TextField
                fullWidth
                type="number"
                label="Confidence (0-1)"
                value={editedAnalysis?.riskClassification?.confidence || 0}
                onChange={(e) => setEditedAnalysis({
                  ...editedAnalysis,
                  riskClassification: {
                    ...editedAnalysis?.riskClassification,
                    confidence: parseFloat(e.target.value)
                  }
                })}
                InputProps={{ inputProps: { min: 0, max: 1, step: 0.01 } }}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Verification Notes"
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Add any notes about your verification decision..."
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleVerify('failed')}
            variant="contained"
            color="error"
            startIcon={<RejectIcon />}
          >
            Mark as Failed
          </Button>
          <Button
            onClick={() => handleVerify('verified')}
            variant="contained"
            color="success"
            startIcon={<VerifyIcon />}
          >
            Verify & Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </Fade>
  );
}