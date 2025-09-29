'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Divider,
  InputAdornment,
  CircularProgress,
  Link,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  ContentCopy as CopyIcon,
  OpenInNew as OpenInNewIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import { auth, db } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';

interface UserData {
  id: string;
  email: string;
  createdAt: Timestamp;
  createdBy?: string;
  lastLogin?: Timestamp;
  role?: string;
}

export default function UserManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialog, setCreateDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setCurrentUserEmail(user.email);
      // Ensure current user is in the users collection
      const currentUserDoc = doc(db, 'users', user.uid);
      setDoc(currentUserDoc, {
        email: user.email,
        lastLogin: serverTimestamp(),
        createdAt: serverTimestamp(), // Will only set if doesn't exist due to merge
        role: 'user', // Default role
      }, { merge: true }).catch((error) => {
        console.error('Error adding current user to collection:', error);
      });
    }
  }, [user]);

  // Subscribe to users collection
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedUsers: UserData[] = [];
      snapshot.forEach((doc) => {
        fetchedUsers.push({
          id: doc.id,
          ...doc.data()
        } as UserData);
      });
      setUsers(fetchedUsers);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword) {
      toast.error('Please provide both email and password');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setCreating(true);
    try {
      // Save current user to restore later
      const currentUser = auth.currentUser;

      // Create new user (this will sign in as the new user)
      const userCredential = await createUserWithEmailAndPassword(auth, newEmail, newPassword);

      // Add user to Firestore users collection
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: newEmail,
        createdAt: serverTimestamp(),
        createdBy: currentUserEmail,
        role: 'user',
      });

      toast.success(`User ${newEmail} created successfully`);

      // Note to user about needing to sign back in
      toast('Note: You may need to sign back into your account', {
        icon: '⚠️',
        duration: 5000,
      });

      // Reset form
      setNewEmail('');
      setNewPassword('');
      setCreateDialog(false);
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handlePasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success(`Password reset email sent to ${email}`);
    } catch (error: any) {
      console.error('Error sending password reset:', error);
      toast.error(error.message || 'Failed to send password reset email');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', userToDelete.id));

      toast.success(`User ${userToDelete.email} removed from system`);
      toast('Note: User can still sign in until removed from Firebase Auth Console', {
        icon: '⚠️',
        duration: 5000,
      });

      setDeleteDialog(false);
      setUserToDelete(null);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
    toast.success('Random password generated');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const openFirebaseConsole = () => {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (projectId) {
      window.open(`https://console.firebase.google.com/project/${projectId}/authentication/users`, '_blank');
    } else {
      window.open('https://console.firebase.google.com/', '_blank');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Never';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns: GridColDef[] = [
    {
      field: 'email',
      headerName: 'Email',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
          <EmailIcon fontSize="small" color="action" />
          <Typography variant="body2">{params.value}</Typography>
          {params.value === currentUserEmail && (
            <Chip label="You" size="small" color="primary" />
          )}
        </Box>
      )
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Chip
            label={params.value || 'user'}
            size="small"
            variant="outlined"
            color={params.value === 'admin' ? 'primary' : 'default'}
          />
        </Box>
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 180,
      valueGetter: (value, row) => formatDate(row.createdAt),
    },
    {
      field: 'lastLogin',
      headerName: 'Last Login',
      width: 180,
      valueGetter: (value, row) => formatDate(row.lastLogin),
    },
    {
      field: 'createdBy',
      headerName: 'Created By',
      flex: 1,
      minWidth: 150,
      valueGetter: (value) => value || 'System',
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => {
        const userRow = params.row as UserData;
        const isCurrentUser = userRow.email === currentUserEmail;

        return [
          <GridActionsCellItem
            key="password"
            icon={<EditIcon />}
            label="Reset Password"
            onClick={() => handlePasswordReset(userRow.email)}
            showInMenu={false}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => {
              setUserToDelete(userRow);
              setDeleteDialog(true);
            }}
            disabled={isCurrentUser}
            showInMenu={false}
          />,
        ];
      }
    }
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage user accounts for the Event Hub platform
        </Typography>
      </Box>

      {/* Current User Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <PersonIcon color="primary" />
            <Box flex={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Currently signed in as
              </Typography>
              <Typography variant="h6">
                {currentUserEmail || 'Loading...'}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<OpenInNewIcon />}
              onClick={openFirebaseConsole}
              size="small"
            >
              Firebase Console
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Actions Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">
            Users ({users.length})
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                },
              }}
            >
              Create New User
            </Button>
          </Stack>
        </Stack>

        {/* Users Table */}
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={users}
            columns={columns}
            loading={loading}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
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

      {/* Info Alert */}
      <Alert severity="info">
        <Typography variant="body2">
          <strong>Note:</strong> Password reset sends an email to the user. To completely remove a user&apos;s access,
          you must also delete them from the{' '}
          <Link
            component="button"
            variant="body2"
            onClick={openFirebaseConsole}
            sx={{ fontWeight: 'bold' }}
          >
            Firebase Console
          </Link>.
        </Typography>
      </Alert>

      {/* Create User Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
              helperText="User will sign in with this email"
            />
            <Box>
              <TextField
                fullWidth
                label="Password"
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: newPassword && (
                    <InputAdornment position="end">
                      <Tooltip title="Copy password">
                        <IconButton
                          edge="end"
                          onClick={() => copyToClipboard(newPassword)}
                          size="small"
                        >
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
                helperText="Minimum 6 characters. Save this password securely."
              />
              <Button
                size="small"
                onClick={generateRandomPassword}
                sx={{ mt: 1 }}
              >
                Generate Random Password
              </Button>
            </Box>
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Important:</strong> Creating a new user may sign you out of your current session.
                You may need to sign back in after creating the user.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)} disabled={creating}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateUser}
            disabled={creating || !newEmail || !newPassword}
            startIcon={creating ? <CircularProgress size={20} /> : <AddIcon />}
          >
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Are you sure you want to remove <strong>{userToDelete?.email}</strong> from the system?
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Note: This removes the user from the tracking table but they can still sign in until you remove them from Firebase Authentication Console.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteUser}
            startIcon={<DeleteIcon />}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}