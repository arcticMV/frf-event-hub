'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Menu,
  FormControl,
  InputLabel,
  Stack,
  Alert,
  Tooltip,
  Fade,
  Grow,
  Zoom,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Inbox as InboxIcon,
  Warning as WarningIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { db } from '@/lib/firebase/client';
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import GlassCard from '@/components/GlassCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import ProgressiveDisclosure from '@/components/ProgressiveDisclosure';

// New usability features
import SmartDateInput from '@/components/SmartDateInput';
import RecentLocationsInput from '@/components/RecentLocationsInput';
import DuplicateWarning from '@/components/DuplicateWarning';
import QuickActions from '@/components/QuickActions';
import ValidationMessage from '@/components/ValidationMessage';
import { useAutosave } from '@/hooks/useAutosave';
import { useDuplicateCheck } from '@/hooks/useDuplicateCheck';
import { useDialogShortcuts, useGlobalShortcuts } from '@/hooks/useKeyboardShortcuts';
import { validateField, VALIDATION_RULES } from '@/lib/validators';

interface EventData {
  title: string;
  summary: string;
  dateTime: Timestamp;
  location: {
    text: { eng: string };
    country: { eng: string };
    needsGeocoding: boolean;
  };
  category: string;
  severity: string;
}

interface StagingEvent {
  id: string;
  eventId: string;
  collectedAt: Timestamp;
  event: EventData;
  metadata: {
    articleCount: number;
    newsApiUri: string;
    isDuplicate: boolean;
    relatedEvents: string[];
  };
  reviewStatus: string;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  reviewNotes?: string;
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
const SEVERITIES = ['critical', 'high', 'medium', 'low'];

export default function EnhancedStagingEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<StagingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<StagingEvent | null>(null);
  const [editedEvent, setEditedEvent] = useState<EventData | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<EventData>>({
    title: '',
    summary: '',
    category: '',
    severity: 'medium',
    dateTime: Timestamp.now(),
    location: {
      text: { eng: '' },
      country: { eng: '' },
      needsGeocoding: true
    }
  });
  const [reviewNotes, setReviewNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  // Default to 'pending' to hide approved/rejected events (they're in analysis queue)
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [approvalMenuAnchor, setApprovalMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedEventForApproval, setSelectedEventForApproval] = useState<StagingEvent | null>(null);
  const [workflowType, setWorkflowType] = useState<'immediate' | 'strategic' | ''>('');

  // Usability features hooks
  const { hasDraft, restoreDraft, clearDraft } = useAutosave({
    key: 'staging-create-event',
    data: newEvent,
    onRestore: (data) => setNewEvent(data),
  });

  const { duplicates, checking: checkingDuplicates } = useDuplicateCheck({
    title: newEvent.title || '',
    location: newEvent.location,
    dateTime: newEvent.dateTime,
    category: newEvent.category,
    enabled: createDialog,
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'staging_events'));
      const querySnapshot = await getDocs(q);

      const fetchedEvents: StagingEvent[] = [];
      querySnapshot.forEach((doc) => {
        fetchedEvents.push({
          id: doc.id,
          ...doc.data()
        } as StagingEvent);
      });

      setEvents(fetchedEvents);
      toast.success(`Loaded ${fetchedEvents.length} events`);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'staging_events'), (snapshot) => {
      const fetchedEvents: StagingEvent[] = [];
      snapshot.forEach((doc) => {
        fetchedEvents.push({
          id: doc.id,
          ...doc.data()
        } as StagingEvent);
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

  const handleApprove = async (event: StagingEvent) => {
    try {
      await updateDoc(doc(db, 'staging_events', event.id), {
        reviewStatus: 'approved',
        reviewedBy: user?.email,
        reviewedAt: serverTimestamp(),
        reviewNotes: reviewNotes,
      });
      toast.success('Event approved successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error approving event:', error);
      toast.error('Failed to approve event');
    }
  };

  const handleApproveWithWorkflow = async (workflowType: 'immediate' | 'strategic') => {
    if (!selectedEventForApproval) return;

    try {
      // Use different reviewStatus to prevent race condition
      // Immediate: 'approved' → triggers existing processApprovedEvent
      // Strategic: 'approved_strategic' → triggers only processStrategicEvent
      const reviewStatus = workflowType === 'immediate' ? 'approved' : 'approved_strategic';

      await updateDoc(doc(db, 'staging_events', selectedEventForApproval.id), {
        reviewStatus: reviewStatus,
        workflowType: workflowType,
        reviewedBy: user?.email,
        reviewedAt: serverTimestamp(),
        reviewNotes: reviewNotes,
      });

      if (workflowType === 'immediate') {
        toast.success('Event approved - Immediate threat workflow');
      } else {
        toast.success('Event approved - Strategic analysis initiated');
      }

      setApprovalMenuAnchor(null);
      setSelectedEventForApproval(null);
      fetchEvents();
    } catch (error) {
      console.error('Error approving event:', error);
      toast.error('Failed to approve event');
    }
  };

  const handleReject = async (event: StagingEvent) => {
    try {
      await updateDoc(doc(db, 'staging_events', event.id), {
        reviewStatus: 'rejected',
        reviewedBy: user?.email,
        reviewedAt: serverTimestamp(),
        reviewNotes: reviewNotes,
      });
      toast.success('Event rejected');
      fetchEvents();
    } catch (error) {
      console.error('Error rejecting event:', error);
      toast.error('Failed to reject event');
    }
  };

  const handleDelete = async (event: StagingEvent) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'staging_events', event.id));
        toast.success('Event deleted');
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const handleBulkDelete = async () => {
    setDeleteConfirmDialog(false);

    if (selectedRowIds.length === 0) {
      toast.error('No events selected');
      return;
    }

    const deletePromises = selectedRowIds.map(id =>
      deleteDoc(doc(db, 'staging_events', id))
    );

    try {
      await Promise.all(deletePromises);
      toast.success(`Successfully deleted ${selectedRowIds.length} event(s)`);
      // Clear selection state
      setSelectedRowIds([]);
    } catch (error) {
      console.error('Error deleting events:', error);
      toast.error('Failed to delete some events');
    }
  };

  const handleEdit = async () => {
    if (!selectedEvent || !editedEvent) return;

    try {
      await updateDoc(doc(db, 'staging_events', selectedEvent.id), {
        event: editedEvent,
      });
      toast.success('Event updated successfully');
      setEditDialog(false);
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  const handleEditAndApprove = async () => {
    if (!selectedEvent || !editedEvent || !workflowType) return;

    try {
      // Use different reviewStatus to prevent race condition
      const reviewStatus = workflowType === 'immediate' ? 'approved' : 'approved_strategic';

      await updateDoc(doc(db, 'staging_events', selectedEvent.id), {
        event: editedEvent,
        reviewStatus: reviewStatus,
        workflowType: workflowType,
        reviewedBy: user?.email,
        reviewedAt: serverTimestamp(),
        reviewNotes: reviewNotes,
      });

      if (workflowType === 'immediate') {
        toast.success('Event updated and approved - Immediate threat workflow');
      } else {
        toast.success('Event updated and approved - Strategic analysis initiated');
      }

      setEditDialog(false);
      setWorkflowType(''); // Reset workflow type
      fetchEvents();
    } catch (error) {
      console.error('Error updating and approving event:', error);
      toast.error('Failed to update and approve event');
    }
  };

  const handleCreateEvent = async () => {
    // Validate required fields
    if (!newEvent.title || !newEvent.summary || !newEvent.category || !newEvent.severity) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!newEvent.location?.text?.eng || !newEvent.location?.country?.eng) {
      toast.error('Please provide location information');
      return;
    }

    try {
      // Generate unique event ID in the format eng-XXXXXXXX
      const timestamp = Date.now();
      const randomNum = Math.floor(10000000 + Math.random() * 90000000); // 8-digit number
      const eventId = `eng-${randomNum}`;
      const newsApiUri = eventId; // Use same ID for newsApiUri to maintain consistency

      // Create the staging event document with all required fields
      const stagingEvent = {
        eventId: eventId,
        collectedAt: serverTimestamp(),
        firstSeen: serverTimestamp(), // Add firstSeen timestamp for duplicate tracking
        newsApiUri: newsApiUri, // Add newsApiUri at root level for tracking
        event: {
          title: newEvent.title,
          summary: newEvent.summary,
          dateTime: newEvent.dateTime || Timestamp.now(),
          location: {
            text: { eng: newEvent.location.text.eng },
            country: { eng: newEvent.location.country.eng },
            needsGeocoding: true
          },
          category: newEvent.category,
          severity: newEvent.severity
        },
        metadata: {
          articleCount: 0,
          newsApiUri: newsApiUri, // Also keep it in metadata for consistency
          isDuplicate: false,
          relatedEvents: [],
          createdBy: user?.email || 'unknown',
          createdAt: serverTimestamp(),
          source: 'manual'
        },
        reviewStatus: 'pending'
      };

      // Add to Firestore
      await addDoc(collection(db, 'staging_events'), stagingEvent);

      toast.success('Event created successfully');

      // Clear autosaved draft
      clearDraft();

      // Reset form and close dialog
      setNewEvent({
        title: '',
        summary: '',
        category: '',
        severity: 'medium',
        dateTime: Timestamp.now(),
        location: {
          text: { eng: '' },
          country: { eng: '' },
          needsGeocoding: true
        }
      });
      setCreateDialog(false);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  // Filter events based on search term and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' ||
      event.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.event.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.event.location.country?.eng?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesSeverity = filterSeverity === 'all' || event.event.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || event.reviewStatus === filterStatus;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

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

  const getSeverityColor = (severity: string): "error" | "warning" | "info" | "success" | "default" => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  // Keyboard shortcuts for dialogs (after functions are defined)
  useDialogShortcuts(
    () => {
      if (createDialog) handleCreateEvent();
      if (editDialog) handleEdit();
    },
    () => {
      setCreateDialog(false);
      setEditDialog(false);
      setViewDialog(false);
    },
    createDialog || editDialog || viewDialog
  );

  // Global keyboard shortcuts
  useGlobalShortcuts(
    fetchEvents,
    () => setCreateDialog(true)
  );

  // Validation
  const titleValidation = validateField(newEvent.title || '', [
    VALIDATION_RULES.required('Title'),
    VALIDATION_RULES.minLength(3, 'Title'),
  ]);

  const summaryValidation = validateField(newEvent.summary || '', [
    VALIDATION_RULES.required('Summary'),
    VALIDATION_RULES.minLength(10, 'Summary'),
  ]);

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
      minWidth: 200,
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
      headerName: 'Severity',
      width: 100,
      valueGetter: (value, row) => row.event?.severity || 'unknown',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getSeverityColor(params.value)}
        />
      )
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1.5,
      minWidth: 150,
      valueGetter: (value, row) => row.event?.location?.country?.eng || 'Unknown',
    },
    {
      field: 'articleCount',
      headerName: 'Articles',
      width: 80,
      align: 'center',
      valueGetter: (value, row) => row.metadata?.articleCount || 0,
    },
    {
      field: 'reviewStatus',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const color = params.value === 'pending' ? 'warning' :
                     params.value === 'approved' ? 'success' : 'error';
        return <Chip label={params.value} size="small" color={color} />;
      }
    },
    {
      field: 'collectedAt',
      headerName: 'Collected Date',
      width: 180,
      valueGetter: (value, row) => formatDate(row.collectedAt),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 150,
      getActions: (params) => {
        const event = params.row as StagingEvent;
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
            label="Edit"
            onClick={() => {
              setSelectedEvent(event);
              setEditedEvent({
                ...event.event,
                location: {
                  ...event.event.location,
                  text: event.event.location?.text || { eng: '' },
                  country: event.event.location?.country || { eng: '' },
                  needsGeocoding: event.event.location?.needsGeocoding || false
                }
              });
              setWorkflowType(''); // Reset workflow type when opening edit dialog
              setEditDialog(true);
            }}
          />,
          <GridActionsCellItem
            key="approve"
            icon={<ApproveIcon />}
            label="Approve As..."
            onClick={(e) => {
              e.stopPropagation();
              setApprovalMenuAnchor(e.currentTarget as HTMLElement);
              setSelectedEventForApproval(event);
            }}
            disabled={event.reviewStatus !== 'pending'}
            showInMenu={false}
          />,
          <GridActionsCellItem
            key="reject"
            icon={<RejectIcon />}
            label="Reject"
            onClick={() => handleReject(event)}
            disabled={event.reviewStatus !== 'pending'}
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


  if (loading) {
    return <LoadingSkeleton variant="table" rows={10} />;
  }

  if (events.length === 0 && !loading) {
    return (
      <>
        <EmptyState
          title="No Staging Events"
          description="There are no events in the staging area. Events will appear here when collected from sources."
          icon={<InboxIcon />}
          actionLabel="Refresh"
          onAction={() => fetchEvents()}
          height="60vh"
        />
      </>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Staging Events Management
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" color="text.secondary">
                Review, edit, and approve incoming events
              </Typography>
              {selectedRowIds.length > 0 && (
                <Chip
                  label={`${selectedRowIds.length} selected`}
                  size="small"
                  color="primary"
                />
              )}
            </Box>
          </Box>
          <Stack direction="row" spacing={2}>
            {selectedRowIds.length > 0 && (
              <Fade in>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteConfirmDialog(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #EF5350 0%, #E53935 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #E53935 0%, #D32F2F 100%)',
                    },
                  }}
                >
                  Delete Selected ({selectedRowIds.length})
                </Button>
              </Fade>
            )}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                },
              }}
            >
              New Event
            </Button>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchEvents}
              sx={{
                background: 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FB8C00 0%, #FFA726 100%)',
                },
              }}
            >
              Refresh
            </Button>
          </Stack>
        </Box>
      </motion.div>

      {/* Search and Filters with Progressive Disclosure */}
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
                {SEVERITIES.map(severity => (
                  <MenuItem key={severity} value={severity}>{severity}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
                size="small"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={() => {
                setFilterSeverity('all');
                setFilterStatus('all');
                setSearchTerm('');
              }}
            >
              Clear Filters
            </Button>
          </Stack>
        }
      />

      {/* Statistics Cards */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Zoom in timeout={300}>
          <GlassCard sx={{ flex: 1 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" fontWeight="bold">{filteredEvents.length}</Typography>
              <Typography variant="body2" color="text.secondary">Total Events</Typography>
            </Box>
          </GlassCard>
        </Zoom>
        <Zoom in timeout={400}>
          <GlassCard sx={{ flex: 1 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" fontWeight="bold" color="warning.main">
                {filteredEvents.filter(e => e.reviewStatus === 'pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Pending Review</Typography>
            </Box>
          </GlassCard>
        </Zoom>
        <Zoom in timeout={500}>
          <GlassCard sx={{ flex: 1 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {filteredEvents.filter(e => e.reviewStatus === 'approved').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Approved</Typography>
            </Box>
          </GlassCard>
        </Zoom>
        <Zoom in timeout={600}>
          <GlassCard sx={{ flex: 1 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" fontWeight="bold" color="error.main">
                {filteredEvents.filter(e => e.event?.severity === 'critical').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Critical Events</Typography>
            </Box>
          </GlassCard>
        </Zoom>
      </Stack>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Paper
          sx={{
            width: '100%',
            overflow: 'hidden',
            background: 'transparent',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredEvents}
              columns={columns}
              loading={loading}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 25 },
                },
                sorting: {
                  sortModel: [{ field: 'collectedAt', sort: 'desc' }],
                },
              }}
              checkboxSelection
              disableRowSelectionOnClick
              onRowSelectionModelChange={(newSelection) => {
                // MUI DataGrid v7+ passes a Map-like object with entries() method
                let ids: string[] = [];

                if (Array.isArray(newSelection)) {
                  // If it's already an array
                  ids = newSelection.map(id => String(id));
                } else if (newSelection && typeof newSelection === 'object') {
                  // If it's an object (Map-like structure)
                  if ('entries' in newSelection && typeof newSelection.entries === 'function') {
                    // It's a Map-like object
                    ids = Array.from(newSelection as any).map((id: any) => String(id));
                  } else if ('ids' in newSelection) {
                    // It might have an 'ids' property
                    ids = Array.from((newSelection as any).ids).map((id: any) => String(id));
                  } else {
                    // Try to convert object keys or values
                    ids = Object.keys(newSelection).filter(key => key !== 'type');
                  }
                }

                setSelectedRowIds(ids);
              }}
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
                '& .MuiDataGrid-row': {
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    transform: 'scale(1.001)',
                  },
                },
              }}
            />
          </Box>
        </Paper>
      </motion.div>

      {/* Approval Workflow Selector Menu */}
      <Menu
        anchorEl={approvalMenuAnchor}
        open={Boolean(approvalMenuAnchor)}
        onClose={() => setApprovalMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleApproveWithWorkflow('immediate')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon sx={{ color: 'error.main' }} />
            <Box>
              <Typography variant="body2" fontWeight="bold">Immediate Threat</Typography>
              <Typography variant="caption" color="text.secondary">
                Current workflow → Real-time analysis
              </Typography>
            </Box>
          </Box>
        </MenuItem>
        <MenuItem onClick={() => handleApproveWithWorkflow('strategic')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimelineIcon sx={{ color: 'info.main' }} />
            <Box>
              <Typography variant="body2" fontWeight="bold">Strategic Event</Typography>
              <Typography variant="caption" color="text.secondary">
                Country timeline → Long-term analysis
              </Typography>
            </Box>
          </Box>
        </MenuItem>
      </Menu>

      {/* View Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Stack spacing={2} sx={{ mt: 2 }}>
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
                <Typography variant="body1">{selectedEvent.event.summary}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                <Typography variant="body1">
                  {selectedEvent.event.location.text.eng}
                  {selectedEvent.event.location.country?.eng && `, ${selectedEvent.event.location.country.eng}`}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Metadata</Typography>
                <Typography variant="body2">Article Count: {selectedEvent.metadata.articleCount}</Typography>
                <Typography variant="body2">News API URI: {selectedEvent.metadata.newsApiUri}</Typography>
                <Typography variant="body2">Is Duplicate: {selectedEvent.metadata.isDuplicate ? 'Yes' : 'No'}</Typography>
              </Box>
              {selectedEvent.reviewStatus !== 'pending' && (
                <Alert severity="info">
                  Reviewed by {selectedEvent.reviewedBy} at {formatDate(selectedEvent.reviewedAt)}
                  {selectedEvent.reviewNotes && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Notes: {selectedEvent.reviewNotes}
                    </Typography>
                  )}
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent>
          {editedEvent && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Title"
                value={editedEvent.title}
                onChange={(e) => setEditedEvent({ ...editedEvent, title: e.target.value })}
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Summary"
                value={editedEvent.summary}
                onChange={(e) => setEditedEvent({ ...editedEvent, summary: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editedEvent.category}
                  onChange={(e) => setEditedEvent({ ...editedEvent, category: e.target.value })}
                  label="Category"
                >
                  {CATEGORIES.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={editedEvent.severity}
                  onChange={(e) => setEditedEvent({ ...editedEvent, severity: e.target.value })}
                  label="Severity"
                >
                  {SEVERITIES.map(sev => (
                    <MenuItem key={sev} value={sev}>{sev}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Divider sx={{ my: 2 }}>Location</Divider>
              <TextField
                fullWidth
                label="Location Text"
                value={editedEvent.location?.text?.eng || ''}
                onChange={(e) => setEditedEvent({
                  ...editedEvent,
                  location: {
                    ...editedEvent.location,
                    text: { eng: e.target.value }
                  }
                })}
              />
              <TextField
                fullWidth
                label="Country"
                value={editedEvent.location?.country?.eng || ''}
                onChange={(e) => setEditedEvent({
                  ...editedEvent,
                  location: {
                    ...editedEvent.location,
                    country: { eng: e.target.value }
                  }
                })}
              />
              <Divider sx={{ my: 2 }}>Workflow Type (Required for Approval)</Divider>
              <FormControl fullWidth required error={!workflowType}>
                <InputLabel>Workflow Type</InputLabel>
                <Select
                  value={workflowType}
                  onChange={(e) => setWorkflowType(e.target.value as 'immediate' | 'strategic')}
                  label="Workflow Type"
                >
                  <MenuItem value="immediate">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon sx={{ color: 'error.main' }} />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">Immediate Threat</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Current workflow → Real-time analysis
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                  <MenuItem value="strategic">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimelineIcon sx={{ color: 'info.main' }} />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">Strategic Event</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Country timeline → Long-term analysis
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                </Select>
                {!workflowType && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    You must select a workflow type to approve this event
                  </Typography>
                )}
              </FormControl>
              <TextField
                fullWidth
                label="Review Notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                multiline
                rows={2}
                placeholder="Add notes about your review..."
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button variant="outlined" onClick={handleEdit}>Save Changes</Button>
          <Tooltip
            title={!workflowType ? "Please select a workflow type to approve" : ""}
          >
            <span>
              <Button
                variant="contained"
                color="success"
                onClick={handleEditAndApprove}
                startIcon={<ApproveIcon />}
                disabled={!workflowType}
              >
                Save Changes and Approve
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Event</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {/* Draft restore prompt */}
            {hasDraft && (
              <Alert
                severity="info"
                action={
                  <>
                    <Button size="small" onClick={() => restoreDraft()}>
                      Restore
                    </Button>
                    <Button size="small" onClick={() => clearDraft()}>
                      Discard
                    </Button>
                  </>
                }
              >
                Draft found from earlier session
              </Alert>
            )}

            <TextField
              fullWidth
              required
              label="Event Title"
              value={newEvent.title || ''}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              error={!titleValidation.isValid}
              helperText="Provide a clear, concise title for the event"
            />
            <ValidationMessage error={titleValidation.error} />

            {/* Duplicate Detection Warning */}
            <DuplicateWarning
              duplicates={duplicates}
              checking={checkingDuplicates}
            />

            <TextField
              fullWidth
              required
              multiline
              rows={4}
              label="Event Summary"
              value={newEvent.summary || ''}
              onChange={(e) => setNewEvent({ ...newEvent, summary: e.target.value })}
              error={!summaryValidation.isValid}
              helperText="Describe the event in detail"
            />
            <ValidationMessage error={summaryValidation.error} />
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={newEvent.category || ''}
                onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                label="Category"
              >
                <MenuItem value="">Select a category</MenuItem>
                {CATEGORIES.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Severity</InputLabel>
              <Select
                value={newEvent.severity || 'medium'}
                onChange={(e) => setNewEvent({ ...newEvent, severity: e.target.value })}
                label="Severity"
              >
                {SEVERITIES.map(sev => (
                  <MenuItem key={sev} value={sev}>
                    <Chip
                      label={sev}
                      size="small"
                      color={getSeverityColor(sev)}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Divider sx={{ my: 2 }}>Location Information</Divider>

            {/* Recent Locations Input */}
            <RecentLocationsInput
              locationValue={newEvent.location?.text?.eng || ''}
              countryValue={newEvent.location?.country?.eng || ''}
              onLocationChange={(value) => setNewEvent({
                ...newEvent,
                location: {
                  ...newEvent.location,
                  text: { eng: value },
                  country: newEvent.location?.country || { eng: '' },
                  needsGeocoding: true
                }
              })}
              onCountryChange={(value) => setNewEvent({
                ...newEvent,
                location: {
                  ...newEvent.location,
                  text: newEvent.location?.text || { eng: '' },
                  country: { eng: value },
                  needsGeocoding: true
                }
              })}
              required
            />

            {/* Smart Date Input */}
            <SmartDateInput
              value={(() => {
                if (!newEvent.dateTime) return '';
                const date = newEvent.dateTime.toDate ? newEvent.dateTime.toDate() : new Date();
                return date.toISOString().slice(0, 16);
              })()}
              onChange={(value) => {
                const date = new Date(value);
                setNewEvent({ ...newEvent, dateTime: Timestamp.fromDate(date) });
              }}
              label="Event Date & Time"
            />
            <Alert severity="info">
              This event will be created as a manual entry and marked as pending review.
              You can approve it immediately after creation if needed.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <QuickActions
            variant="generic"
            onClose={() => {
              setCreateDialog(false);
              // Reset form
              setNewEvent({
                title: '',
                summary: '',
                category: '',
                severity: 'medium',
                dateTime: Timestamp.now(),
                location: {
                  text: { eng: '' },
                  country: { eng: '' },
                  needsGeocoding: true
                }
              });
            }}
            onSaveAndClose={handleCreateEvent}
            fullWidth
          />
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmDialog} onClose={() => setDeleteConfirmDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon color="error" />
            <Typography variant="h6">Confirm Bulk Delete</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography variant="body1">
            Are you sure you want to delete <strong>{selectedRowIds.length}</strong> selected event(s)?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            The following events will be permanently removed from the staging collection:
          </Typography>
          <Box sx={{ mt: 2, maxHeight: 200, overflow: 'auto', bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
            {events
              .filter(event => selectedRowIds.includes(event.id))
              .map(event => (
                <Typography key={event.id} variant="body2" sx={{ mb: 1 }}>
                  • {event.eventId} - {event.event.title}
                </Typography>
              ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleBulkDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            sx={{
              background: 'linear-gradient(135deg, #EF5350 0%, #E53935 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #E53935 0%, #D32F2F 100%)',
              },
            }}
          >
            Delete {selectedRowIds.length} Event(s)
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}