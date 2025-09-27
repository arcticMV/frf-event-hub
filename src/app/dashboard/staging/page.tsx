'use client';

import { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Stack,
  Alert,
  Tooltip,
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

const CATEGORIES = ['political', 'health', 'economic', 'environmental', 'security', 'social', 'technological', 'unknown'];
const SEVERITIES = ['critical', 'high', 'medium', 'low'];

export default function StagingEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<StagingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<StagingEvent | null>(null);
  const [editedEvent, setEditedEvent] = useState<EventData | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'staging_events'));
      const snapshot = await getDocs(q);

      const fetchedEvents: StagingEvent[] = [];
      snapshot.forEach((doc) => {
        fetchedEvents.push({
          id: doc.id,
          ...doc.data(),
        } as StagingEvent);
      });

      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleView = (event: StagingEvent) => {
    setSelectedEvent(event);
    setViewDialog(true);
  };

  const handleEdit = (event: StagingEvent) => {
    setSelectedEvent(event);
    setEditedEvent({ ...event.event });
    setReviewNotes(event.reviewNotes || '');
    setEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedEvent || !editedEvent) return;

    try {
      const eventRef = doc(db, 'staging_events', selectedEvent.id);
      await updateDoc(eventRef, {
        event: editedEvent,
        reviewNotes: reviewNotes,
      });

      toast.success('Event updated successfully');
      fetchEvents();
      setEditDialog(false);
      setSelectedEvent(null);
      setEditedEvent(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  const handleStatusUpdate = async (eventId: string, status: 'approved' | 'rejected') => {
    if (!user) return;

    try {
      const eventRef = doc(db, 'staging_events', eventId);
      await updateDoc(eventRef, {
        reviewStatus: status,
        reviewedBy: user.email,
        reviewedAt: serverTimestamp(),
      });

      toast.success(`Event ${status} successfully`);
      fetchEvents();
    } catch (error) {
      console.error(`Error ${status} event:`, error);
      toast.error(`Failed to ${status} event`);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'staging_events', eventId));
        toast.success('Event deleted successfully');
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const formatDate = (timestamp: Timestamp | undefined | null) => {
    if (!timestamp) return 'N/A';

    // Handle Firestore Timestamp object
    if (timestamp && typeof timestamp === 'object' && '_seconds' in timestamp) {
      return new Date((timestamp as any)._seconds * 1000).toLocaleString('en-US', {
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
      field: 'category',
      headerName: 'Category',
      width: 110,
      minWidth: 90,
      valueGetter: (params: any) => params?.row?.event?.category || 'unknown',
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value || 'unknown'} size="small" variant="outlined" />
      ),
    },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 90,
      minWidth: 80,
      valueGetter: (params: any) => params?.row?.event?.severity || 'unknown',
      renderCell: (params: GridRenderCellParams) => {
        const value = params.value || 'unknown';
        const color = value === 'critical' ? 'error' :
                      value === 'high' ? 'warning' :
                      value === 'medium' ? 'info' : 'success';
        return <Chip label={value} size="small" color={color as any} />;
      },
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1,
      minWidth: 100,
      valueGetter: (params: any) => params?.row?.event?.location?.country?.eng || 'Unknown',
    },
    {
      field: 'articleCount',
      headerName: 'Articles',
      width: 70,
      minWidth: 60,
      valueGetter: (params: any) => params?.row?.metadata?.articleCount || 0,
      type: 'number',
    },
    {
      field: 'reviewStatus',
      headerName: 'Status',
      width: 100,
      minWidth: 90,
      renderCell: (params: GridRenderCellParams) => {
        const value = params?.value || 'unknown';
        const color = value === 'pending' ? 'warning' :
                      value === 'approved' ? 'success' :
                      value === 'rejected' ? 'error' : 'default';
        return <Chip label={value} size="small" color={color as any} />;
      },
    },
    {
      field: 'collectedAt',
      headerName: 'Collected',
      width: 110,
      minWidth: 100,
      valueGetter: (params: any) => formatDate(params?.row?.collectedAt),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      minWidth: 100,
      getActions: (params) => {
        if (!params?.row) return [];

        const actions = [
          <GridActionsCellItem
            key="view"
            icon={<ViewIcon />}
            label="View"
            onClick={() => handleView(params.row)}
          />,
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit"
            onClick={() => handleEdit(params.row)}
          />,
        ];

        if (params.row?.reviewStatus === 'pending') {
          actions.push(
            <GridActionsCellItem
              key="approve"
              icon={<ApproveIcon />}
              label="Approve"
              onClick={() => handleStatusUpdate(params.row.id, 'approved')}
              showInMenu
            />,
            <GridActionsCellItem
              key="reject"
              icon={<RejectIcon />}
              label="Reject"
              onClick={() => handleStatusUpdate(params.row.id, 'rejected')}
              showInMenu
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Staging Events Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review, edit, and approve incoming events
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

      {/* Statistics Bar */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6">{events.length}</Typography>
          <Typography variant="body2" color="text.secondary">Total Events</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" color="warning.main">
            {events.filter(e => e.reviewStatus === 'pending').length}
          </Typography>
          <Typography variant="body2" color="text.secondary">Pending Review</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" color="success.main">
            {events.filter(e => e.reviewStatus === 'approved').length}
          </Typography>
          <Typography variant="body2" color="text.secondary">Approved</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" color="error.main">
            {events.filter(e => e.reviewStatus === 'rejected').length}
          </Typography>
          <Typography variant="body2" color="text.secondary">Rejected</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" color="error.main">
            {events.filter(e => e.event?.severity === 'critical').length}
          </Typography>
          <Typography variant="body2" color="text.secondary">Critical Events</Typography>
        </Paper>
      </Stack>

      {/* Data Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={events}
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
                  {selectedEvent.event.location.text.eng}, {selectedEvent.event.location.country.eng}
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
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={editedEvent?.title || ''}
              onChange={(e) => setEditedEvent(prev => prev ? { ...prev, title: e.target.value } : null)}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Summary"
              value={editedEvent?.summary || ''}
              onChange={(e) => setEditedEvent(prev => prev ? { ...prev, summary: e.target.value } : null)}
            />
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editedEvent?.category || 'unknown'}
                  label="Category"
                  onChange={(e) => setEditedEvent(prev => prev ? { ...prev, category: e.target.value } : null)}
                >
                  {CATEGORIES.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={editedEvent?.severity || 'low'}
                  label="Severity"
                  onChange={(e) => setEditedEvent(prev => prev ? { ...prev, severity: e.target.value } : null)}
                >
                  {SEVERITIES.map(sev => (
                    <MenuItem key={sev} value={sev}>{sev}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Location"
                value={editedEvent?.location.text.eng || ''}
                onChange={(e) => setEditedEvent(prev => prev ? {
                  ...prev,
                  location: { ...prev.location, text: { eng: e.target.value } }
                } : null)}
              />
              <TextField
                fullWidth
                label="Country"
                value={editedEvent?.location.country.eng || ''}
                onChange={(e) => setEditedEvent(prev => prev ? {
                  ...prev,
                  location: { ...prev.location, country: { eng: e.target.value } }
                } : null)}
              />
            </Stack>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Review Notes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save Changes</Button>
          {selectedEvent?.reviewStatus === 'pending' && (
            <>
              <Button
                onClick={() => {
                  handleSaveEdit();
                  handleStatusUpdate(selectedEvent.id, 'approved');
                }}
                variant="contained"
                color="success"
              >
                Save & Approve
              </Button>
              <Button
                onClick={() => {
                  handleSaveEdit();
                  handleStatusUpdate(selectedEvent.id, 'rejected');
                }}
                variant="contained"
                color="error"
              >
                Save & Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}