'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Stack,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Public as PublicIcon,
  Timeline as TimelineIcon,
  ExpandMore as ExpandMoreIcon,
  ViewModule as CardViewIcon,
  ViewList as TableViewIcon,
} from '@mui/icons-material';
import { db } from '@/lib/firebase/client';
import {
  collection,
  onSnapshot,
  Timestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import GlassCard from '@/components/GlassCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import EnhancedFilters, { FilterValues } from '@/components/EnhancedFilters';
import CountryIntelligenceModal from '@/components/CountryIntelligenceModal';
import { useContextPreservation } from '@/hooks/useContextPreservation';
import { useGlobalShortcuts } from '@/hooks/useKeyboardShortcuts';

interface StrategicEvent {
  id: string;
  eventId: string;
  collectedAt: Timestamp;
  workflowType: 'strategic';
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
  countryIntelligence: {
    countryCode: string;
    analysisVersion: number;
    addedAt: Timestamp;
  };
  metadata?: {
    articleCount?: number;
    newsApiUri?: string;
    isDuplicate?: boolean;
  };
  verificationStatus: string;
  verifiedBy?: string;
  verifiedAt?: Timestamp;
  verificationNotes?: string;
}

const CATEGORIES = [
  'Cyber security',
  'Physical threats & violence',
  'Armed Conflict',
  'Terrorism',
  'Natural disasters',
  'Infrastructure & utilities',
  'Civil unrest & demonstrations',
  'Health & disease',
  'Transportation',
  'Environmental & industrial',
  'Maritime Security',
  'Organized Crime',
  'Political',
  'Economic'
];

export default function StrategicIntelligencePage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<StrategicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<StrategicEvent | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [countryData, setCountryData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'country' | 'table'>('country');

  // Context preservation
  const { context, updateContext, restored } = useContextPreservation('strategic-events');

  const [filters, setFilters] = useState<FilterValues>({
    search: context?.search || '',
    categories: context?.categories || [],
    severities: context?.severities || [],
    dateFrom: context?.dateFrom,
    dateTo: context?.dateTo,
  });

  const [countries, setCountries] = useState<string[]>(context?.countries || []);

  // Restore view mode from context
  useEffect(() => {
    if (restored && context?.viewMode && ['table', 'country'].includes(context.viewMode)) {
      setViewMode(context.viewMode as 'table' | 'country');
    }
  }, [restored, context]);

  // Save context when filters or view mode change
  useEffect(() => {
    updateContext({ ...filters, countries, viewMode });
  }, [filters, countries, viewMode, updateContext]);

  const fetchEvents = async () => {
    toast.success('Refreshing strategic intelligence...');
  };

  // Global keyboard shortcuts
  useGlobalShortcuts(fetchEvents, undefined);

  // Real-time listener
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'strategic_intelligence_verified'),
      (snapshot) => {
        const fetchedEvents: StrategicEvent[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedEvents.push({
            id: doc.id,
            ...data
          } as StrategicEvent);
        });

        // Sort by verification date descending
        fetchedEvents.sort((a, b) => {
          const aTime = a.verifiedAt?.toMillis?.() || 0;
          const bTime = b.verifiedAt?.toMillis?.() || 0;
          return (bTime as number) - (aTime as number);
        });

        setEvents(fetchedEvents);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to strategic events:', error);
        toast.error('Failed to connect to real-time updates');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleViewEvent = async (event: StrategicEvent) => {
    setSelectedEvent(event);

    if (!event.countryIntelligence?.countryCode) {
      toast.error('Country intelligence data not available');
      return;
    }

    try {
      const countryRef = doc(db, 'country_intelligence', event.countryIntelligence.countryCode);
      const countrySnap = await getDoc(countryRef);

      if (countrySnap.exists()) {
        setCountryData(countrySnap.data());
        setViewDialog(true);
      } else {
        toast.error('Country intelligence not found');
      }
    } catch (error) {
      console.error('Error fetching country data:', error);
      toast.error('Failed to load country intelligence');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        event.event?.title?.toLowerCase().includes(searchLower) ||
        event.event?.summary?.toLowerCase().includes(searchLower) ||
        event.event?.location?.country?.eng?.toLowerCase().includes(searchLower) ||
        event.eventId?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(event.event?.category)) return false;
    }

    // Severity filter
    if (filters.severities && filters.severities.length > 0) {
      if (!filters.severities.includes(event.event?.severity)) return false;
    }

    // Country filter
    if (countries.length > 0) {
      if (!countries.includes(event.event?.location?.country?.eng)) return false;
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const eventDate = event.event?.dateTime?.toDate?.() || new Date();
      if (filters.dateFrom && eventDate < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && eventDate > new Date(filters.dateTo)) return false;
    }

    return true;
  });

  // Group events by country
  const eventsByCountry = filteredEvents.reduce((acc, event) => {
    const country = event.event?.location?.country?.eng || 'Unknown';
    if (!acc[country]) acc[country] = [];
    acc[country].push(event);
    return acc;
  }, {} as Record<string, StrategicEvent[]>);

  // Get unique countries
  const uniqueCountries = Array.from(new Set(events.map(e => e.event?.location?.country?.eng).filter(Boolean)));

  // Statistics
  const stats = {
    totalCountries: Object.keys(eventsByCountry).length,
    totalEvents: filteredEvents.length,
    pendingReview: filteredEvents.filter(e => e.verificationStatus === 'pending').length,
    lastUpdated: filteredEvents.length > 0
      ? Math.max(...filteredEvents.map(e => e.verifiedAt?.toMillis?.() || 0))
      : 0,
  };

  // DataGrid columns
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
      field: 'country',
      headerName: 'Country',
      width: 150,
      valueGetter: (value, row) => row.event?.location?.country?.eng || 'Unknown',
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 150,
      valueGetter: (value, row) => row.event?.category || 'unknown',
      renderCell: (params) => (
        <Chip label={params.value} size="small" color="primary" variant="outlined" />
      )
    },
    {
      field: 'dateTime',
      headerName: 'Event Date',
      width: 130,
      valueGetter: (value, row) => formatDate(row.event?.dateTime),
    },
    {
      field: 'verifiedAt',
      headerName: 'Verified',
      width: 130,
      valueGetter: (value, row) => formatDate(row.verifiedAt),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={<ViewIcon />}
          label="View Country Intelligence"
          onClick={() => handleViewEvent(params.row as StrategicEvent)}
        />
      ]
    }
  ];

  if (loading) {
    return <LoadingSkeleton variant="table" rows={10} />;
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title="No Strategic Intelligence"
        description="Strategic intelligence events will appear here after verification"
        icon={<PublicIcon />}
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
              Strategic Intelligence
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Country-level strategic analysis and long-term intelligence
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="country">
                <CardViewIcon sx={{ mr: 1 }} />
                Countries
              </ToggleButton>
              <ToggleButton value="table">
                <TableViewIcon sx={{ mr: 1 }} />
                Table
              </ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchEvents}
              sx={{
                background: 'linear-gradient(135deg, #42A5F5 0%, #1E88E5 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1E88E5 0%, #42A5F5 100%)',
                },
              }}
            >
              Refresh
            </Button>
          </Stack>
        </Box>
      </motion.div>

      {/* Statistics Cards */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <GlassCard sx={{ flex: 1 }} glassmorphism hoverEffect>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PublicIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">{stats.totalCountries}</Typography>
                <Typography variant="body2" color="text.secondary">Countries</Typography>
              </Box>
            </Box>
          </CardContent>
        </GlassCard>

        <GlassCard sx={{ flex: 1 }} glassmorphism hoverEffect>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TimelineIcon sx={{ fontSize: 40, color: 'info.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">{stats.totalEvents}</Typography>
                <Typography variant="body2" color="text.secondary">Strategic Events</Typography>
              </Box>
            </Box>
          </CardContent>
        </GlassCard>

        <GlassCard sx={{ flex: 1 }} glassmorphism hoverEffect>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ViewIcon sx={{ fontSize: 40, color: 'success.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">{stats.totalEvents - stats.pendingReview}</Typography>
                <Typography variant="body2" color="text.secondary">Verified</Typography>
              </Box>
            </Box>
          </CardContent>
        </GlassCard>

        <GlassCard sx={{ flex: 1 }} glassmorphism hoverEffect>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <RefreshIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {stats.lastUpdated > 0 ? formatDate(new Date(stats.lastUpdated)) : 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">Last Updated</Typography>
              </Box>
            </Box>
          </CardContent>
        </GlassCard>
      </Stack>

      {/* Enhanced Filters */}
      <EnhancedFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableCategories={CATEGORIES}
        availableSeverities={['critical', 'high', 'medium', 'low']}
        showDateFilter={true}
      />

      {/* Main Content */}
      {viewMode === 'country' ? (
        /* Country View - Grouped by Country */
        <Box sx={{ mt: 3 }}>
          {Object.keys(eventsByCountry).length === 0 ? (
            <EmptyState
              title="No Events Match Filters"
              description="Try adjusting your filters"
              icon={<PublicIcon />}
              height="40vh"
            />
          ) : (
            <Stack spacing={2}>
              {Object.entries(eventsByCountry)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([country, countryEvents]) => (
                  <Accordion key={country} defaultExpanded={Object.keys(eventsByCountry).length <= 5}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <PublicIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold">{country}</Typography>
                        <Chip
                          label={`${countryEvents.length} ${countryEvents.length === 1 ? 'event' : 'events'}`}
                          size="small"
                          color="primary"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
                        {countryEvents.map((event) => (
                          <Card key={event.id} variant="outlined">
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h6" gutterBottom>
                                    {event.event.title}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {event.event.summary.substring(0, 200)}...
                                  </Typography>
                                  <Stack direction="row" spacing={1}>
                                    <Chip label={event.event.category} size="small" color="primary" variant="outlined" />
                                    <Chip label={event.event.severity} size="small" />
                                    <Chip label={formatDate(event.event.dateTime)} size="small" variant="outlined" />
                                  </Stack>
                                </Box>
                                <IconButton
                                  color="primary"
                                  onClick={() => handleViewEvent(event)}
                                  sx={{ ml: 2 }}
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                ))}
            </Stack>
          )}
        </Box>
      ) : (
        /* Table View */
        <Paper sx={{ width: '100%', overflow: 'hidden', mt: 3 }}>
          <Box sx={{ height: 600 }}>
            <DataGrid
              rows={filteredEvents}
              columns={columns}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { page: 0, pageSize: 25 } },
                sorting: { sortModel: [{ field: 'verifiedAt', sort: 'desc' }] },
              }}
              checkboxSelection
              disableRowSelectionOnClick
            />
          </Box>
        </Paper>
      )}

      {/* Country Intelligence Modal */}
      <CountryIntelligenceModal
        open={viewDialog}
        onClose={() => {
          setViewDialog(false);
          setCountryData(null);
        }}
        countryData={countryData}
        eventId={selectedEvent?.id || ''}
      />
    </Box>
  );
}
