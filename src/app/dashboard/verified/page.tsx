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
} from '@mui/icons-material';
import { db } from '@/lib/firebase/client';
import {
  collection,
  query,
  getDocs,
  orderBy,
  limit,
  where,
  Timestamp,
} from 'firebase/firestore';
import toast from 'react-hot-toast';

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
  analysis: {
    riskScore: number;
    confidence: number;
    keyFindings?: string[];
    recommendations?: string[];
    impactAssessment?: Record<string, string>;
    geocoding?: {
      latitude?: number;
      longitude?: number;
      address?: string;
    };
  };
  verifiedAt?: Timestamp;
  verifiedBy?: string;
  metadata?: {
    articleCount: number;
    newsApiUri: string;
  };
}

export default function VerifiedEventsPage() {
  const [events, setEvents] = useState<VerifiedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<VerifiedEvent | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [filter, setFilter] = useState<{
    severity?: string;
    category?: string;
    minRiskScore?: number;
  }>({});

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let q = query(collection(db, 'verified_events'));

      // Apply filters if any
      if (filter.severity) {
        q = query(q, where('event.severity', '==', filter.severity));
      }
      if (filter.category) {
        q = query(q, where('event.category', '==', filter.category));
      }

      const snapshot = await getDocs(q);

      const fetchedEvents: VerifiedEvent[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<VerifiedEvent, 'id'>;
        if (!filter.minRiskScore || (data.analysis?.riskScore || 0) >= filter.minRiskScore) {
          fetchedEvents.push({
            ...data,
            id: doc.id,
          });
        }
      });

      // Sort by risk score descending
      fetchedEvents.sort((a, b) => (b.analysis?.riskScore || 0) - (a.analysis?.riskScore || 0));

      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching verified events:', error);
      toast.error('Failed to fetch verified events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleView = (event: VerifiedEvent) => {
    setSelectedEvent(event);
    setViewDialog(true);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';

    // Handle Firestore Timestamp object
    if (timestamp && typeof timestamp === 'object' && '_seconds' in timestamp) {
      return new Date(timestamp._seconds * 1000).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // Handle if it's already a Date object
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return 'N/A';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 8) return '#f44336';
    if (score >= 6) return '#ff9800';
    if (score >= 4) return '#2196f3';
    return '#4caf50';
  };

  const exportData = () => {
    const csvContent = [
      ['Event ID', 'Title', 'Category', 'Severity', 'Risk Score', 'Location', 'Date'].join(','),
      ...events.map(e => [
        e.eventId,
        `"${e.event.title.replace(/"/g, '""')}"`,
        e.event.category,
        e.event.severity,
        e.analysis?.riskScore || 0,
        `"${e.event.location.country.eng}"`,
        formatDate(e.event.dateTime),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verified-events-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Calculate statistics
  const stats = {
    total: events.length,
    critical: events.filter(e => e.event.severity === 'critical').length,
    high: events.filter(e => e.event.severity === 'high').length,
    avgRiskScore: events.reduce((acc, e) => acc + (e.analysis?.riskScore || 0), 0) / (events.length || 1),
    byCategory: events.reduce((acc, e) => {
      acc[e.event.category] = (acc[e.event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    highRiskEvents: events.filter(e => (e.analysis?.riskScore || 0) >= 8),
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Verified Events Intelligence
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Analyzed and verified risk intelligence events
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportData}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchEvents}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* Summary Statistics */}
      <Stack direction="row" spacing={3} sx={{ mb: 4, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box sx={{ color: 'white' }}>
                <Typography variant="h3" fontWeight="bold">
                  {stats.total}
                </Typography>
                <Typography variant="body1">
                  Total Verified Events
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <VerifiedIcon sx={{ mr: 1 }} />
                  <Typography variant="caption">
                    Fully processed & verified
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Box sx={{ color: 'white' }}>
                <Typography variant="h3" fontWeight="bold">
                  {stats.critical}
                </Typography>
                <Typography variant="body1">
                  Critical Events
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <WarningIcon sx={{ mr: 1 }} />
                  <Typography variant="caption">
                    Requires immediate attention
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Box sx={{ color: 'white' }}>
                <Typography variant="h3" fontWeight="bold">
                  {stats.avgRiskScore.toFixed(1)}
                </Typography>
                <Typography variant="body1">
                  Average Risk Score
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  <Typography variant="caption">
                    Out of 10
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <CardContent>
              <Box sx={{ color: 'white' }}>
                <Typography variant="h3" fontWeight="bold">
                  {stats.highRiskEvents.length}
                </Typography>
                <Typography variant="body1">
                  High Risk Events
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <AssessmentIcon sx={{ mr: 1 }} />
                  <Typography variant="caption">
                    Risk score ≥ 8
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* Category Breakdown */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Events by Category
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          {Object.entries(stats.byCategory).map(([category, count]) => (
            <Chip
              key={category}
              label={`${category}: ${count}`}
              variant="outlined"
              sx={{ textTransform: 'capitalize' }}
            />
          ))}
        </Stack>
      </Paper>

      {/* High Risk Events */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        High Priority Events
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {stats.highRiskEvents.slice(0, 6).map((event) => (
          <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: 350 }} key={event.id}>
            <Card
              sx={{
                border: '2px solid',
                borderColor: getSeverityColor(event.event.severity) + '.main',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => handleView(event)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1, pr: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {event.event.title.substring(0, 100)}...
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {event.event.summary.substring(0, 150)}...
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                    <Typography variant="h4" sx={{ color: getRiskColor(event.analysis?.riskScore || 0) }}>
                      {event.analysis?.riskScore || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Risk Score
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={event.event.category}
                    size="small"
                    icon={<CategoryIcon />}
                    variant="outlined"
                  />
                  <Chip
                    label={event.event.severity}
                    size="small"
                    color={getSeverityColor(event.event.severity) as any}
                  />
                  <Box sx={{ flexGrow: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    <LocationIcon sx={{ fontSize: 14, verticalAlign: 'middle' }} />
                    {event.event.location.country.eng}
                  </Typography>
                </Stack>

                {event.analysis?.keyFindings && event.analysis.keyFindings.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Key Finding:
                    </Typography>
                    <Typography variant="body2">
                      • {event.analysis.keyFindings[0].substring(0, 100)}...
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* All Events List */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        All Verified Events
      </Typography>
      <Stack spacing={2}>
        {events.map((event) => (
          <Box key={event.id}>
            <Paper
              sx={{
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => handleView(event)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 60,
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  bgcolor: getRiskColor(event.analysis?.riskScore || 0) + '20',
                  color: getRiskColor(event.analysis?.riskScore || 0),
                }}>
                  <Typography variant="h6" fontWeight="bold">
                    {event.analysis?.riskScore || 0}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {event.event.title}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {event.event.location.country.eng}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(event.event.dateTime)}
                    </Typography>
                    <Chip label={event.event.category} size="small" variant="outlined" />
                    <Chip
                      label={event.event.severity}
                      size="small"
                      color={getSeverityColor(event.event.severity) as any}
                    />
                  </Stack>
                </Box>

                <IconButton>
                  <ViewIcon />
                </IconButton>
              </Box>
            </Paper>
          </Box>
        ))}
      </Stack>

      {/* View Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <VerifiedIcon color="success" />
            <Typography variant="h6">Verified Event Intelligence Report</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Box>
                <Alert severity="success" icon={<VerifiedIcon />}>
                  This event has been verified and confirmed by our intelligence team
                  {selectedEvent.verifiedBy && ` by ${selectedEvent.verifiedBy}`}
                  {selectedEvent.verifiedAt && ` on ${formatDate(selectedEvent.verifiedAt)}`}
                </Alert>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: 300 }}>
                  <Typography variant="h6" gutterBottom>Event Details</Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Event ID</Typography>
                    <Typography variant="body1">{selectedEvent.eventId}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                    <Typography variant="h6">{selectedEvent.event.title}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Summary</Typography>
                    <Typography variant="body1">{selectedEvent.event.summary}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                    <Typography variant="body1">
                      {selectedEvent.event.location.text.eng}, {selectedEvent.event.location.country.eng}
                    </Typography>
                    {selectedEvent.analysis?.geocoding && (
                      <Typography variant="caption" color="text.secondary">
                        Coordinates: {selectedEvent.analysis.geocoding.latitude}, {selectedEvent.analysis.geocoding.longitude}
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Event Date</Typography>
                    <Typography variant="body1">{formatDate(selectedEvent.event.dateTime)}</Typography>
                  </Box>
                </Stack>
                </Box>

                <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: 300 }}>
                  <Typography variant="h6" gutterBottom>Risk Analysis</Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Risk Assessment</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={selectedEvent.analysis.riskScore * 10}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: getRiskColor(selectedEvent.analysis.riskScore),
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="h5" sx={{ color: getRiskColor(selectedEvent.analysis.riskScore) }}>
                        {selectedEvent.analysis.riskScore}/10
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Confidence: {(selectedEvent.analysis.confidence * 100).toFixed(0)}%
                    </Typography>
                  </Box>

                  {selectedEvent.analysis.keyFindings && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Key Findings</Typography>
                      <Stack spacing={1} sx={{ mt: 1 }}>
                        {selectedEvent.analysis.keyFindings.map((finding, idx) => (
                          <Typography key={idx} variant="body2">
                            • {finding}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {selectedEvent.analysis.recommendations && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Recommendations</Typography>
                      <Stack spacing={1} sx={{ mt: 1 }}>
                        {selectedEvent.analysis.recommendations.map((rec, idx) => (
                          <Typography key={idx} variant="body2">
                            • {rec}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {selectedEvent.analysis.impactAssessment && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Impact Assessment</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                        {Object.entries(selectedEvent.analysis.impactAssessment).map(([key, value]) => (
                          <Box sx={{ flex: '1 1 calc(50% - 8px)' }} key={key}>
                            <Paper sx={{ p: 1.5, bgcolor: 'grey.50' }}>
                              <Typography variant="caption" color="text.secondary">
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                              </Typography>
                              <Typography variant="body2">{value}</Typography>
                            </Paper>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Stack>
                </Box>
              </Box>

              {selectedEvent.metadata && (
                <Box>
                  <Divider />
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Source: {selectedEvent.metadata.articleCount} articles | API Reference: {selectedEvent.metadata.newsApiUri}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}