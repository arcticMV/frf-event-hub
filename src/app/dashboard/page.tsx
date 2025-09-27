'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Divider,
  Button,
} from '@mui/material';
import {
  Inbox as InboxIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as VerifiedIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { db } from '@/lib/firebase/client';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface CollectionStats {
  staging: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    recentEvents: any[];
  };
  analysis: {
    total: number;
    pending: number;
    verified: number;
    failed: number;
    avgRiskScore: number;
    recentEvents: any[];
  };
  verified: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    byCategory: Record<string, number>;
    recentEvents: any[];
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CollectionStats>({
    staging: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      recentEvents: [],
    },
    analysis: {
      total: 0,
      pending: 0,
      verified: 0,
      failed: 0,
      avgRiskScore: 0,
      recentEvents: [],
    },
    verified: {
      total: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      byCategory: {},
      recentEvents: [],
    },
  });

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch staging_events statistics
      const stagingQuery = query(collection(db, 'staging_events'));
      const stagingSnapshot = await getDocs(stagingQuery);

      const stagingStats = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        recentEvents: [] as any[],
      };

      stagingSnapshot.forEach((doc) => {
        const data = doc.data();
        stagingStats.total++;

        // Count by review status
        if (data.reviewStatus === 'pending') stagingStats.pending++;
        else if (data.reviewStatus === 'approved') stagingStats.approved++;
        else if (data.reviewStatus === 'rejected') stagingStats.rejected++;

        // Count by severity
        if (data.event?.severity === 'critical') stagingStats.critical++;
        else if (data.event?.severity === 'high') stagingStats.high++;
        else if (data.event?.severity === 'medium') stagingStats.medium++;
        else if (data.event?.severity === 'low') stagingStats.low++;
      });

      // Get recent staging events
      const recentStagingQuery = query(
        collection(db, 'staging_events'),
        orderBy('collectedAt', 'desc'),
        limit(5)
      );
      const recentStagingSnapshot = await getDocs(recentStagingQuery);
      recentStagingSnapshot.forEach((doc) => {
        stagingStats.recentEvents.push({ id: doc.id, ...doc.data() });
      });

      // Fetch analysis_queue statistics
      const analysisQuery = query(collection(db, 'analysis_queue'));
      const analysisSnapshot = await getDocs(analysisQuery);

      const analysisStats = {
        total: 0,
        pending: 0,
        verified: 0,
        failed: 0,
        avgRiskScore: 0,
        recentEvents: [] as any[],
      };

      let totalRiskScore = 0;
      analysisSnapshot.forEach((doc) => {
        const data = doc.data();
        analysisStats.total++;

        // Count by verification status
        if (data.verificationStatus === 'pending') analysisStats.pending++;
        else if (data.verificationStatus === 'verified') analysisStats.verified++;
        else if (data.verificationStatus === 'failed') analysisStats.failed++;

        // Calculate average risk score
        if (data.analysis?.riskScore) {
          totalRiskScore += data.analysis.riskScore;
        }
      });

      if (analysisStats.total > 0) {
        analysisStats.avgRiskScore = totalRiskScore / analysisStats.total;
      }

      // Get recent analysis events
      const recentAnalysisQuery = query(
        collection(db, 'analysis_queue'),
        orderBy('analyzedAt', 'desc'),
        limit(5)
      );
      try {
        const recentAnalysisSnapshot = await getDocs(recentAnalysisQuery);
        recentAnalysisSnapshot.forEach((doc) => {
          analysisStats.recentEvents.push({ id: doc.id, ...doc.data() });
        });
      } catch (error) {
        console.log('No analyzedAt field yet in analysis_queue');
      }

      // Fetch verified_events statistics
      const verifiedQuery = query(collection(db, 'verified_events'));
      const verifiedSnapshot = await getDocs(verifiedQuery);

      const verifiedStats = {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        byCategory: {} as Record<string, number>,
        recentEvents: [] as any[],
      };

      verifiedSnapshot.forEach((doc) => {
        const data = doc.data();
        verifiedStats.total++;

        // Count by severity
        if (data.event?.severity === 'critical') verifiedStats.critical++;
        else if (data.event?.severity === 'high') verifiedStats.high++;
        else if (data.event?.severity === 'medium') verifiedStats.medium++;
        else if (data.event?.severity === 'low') verifiedStats.low++;

        // Count by category
        const category = data.event?.category || 'unknown';
        verifiedStats.byCategory[category] = (verifiedStats.byCategory[category] || 0) + 1;
      });

      // Get recent verified events
      const recentVerifiedQuery = query(
        collection(db, 'verified_events'),
        orderBy('verifiedAt', 'desc'),
        limit(5)
      );
      try {
        const recentVerifiedSnapshot = await getDocs(recentVerifiedQuery);
        recentVerifiedSnapshot.forEach((doc) => {
          verifiedStats.recentEvents.push({ id: doc.id, ...doc.data() });
        });
      } catch (error) {
        // If verifiedAt doesn't exist, try with event.dateTime
        const altQuery = query(
          collection(db, 'verified_events'),
          limit(5)
        );
        const altSnapshot = await getDocs(altQuery);
        altSnapshot.forEach((doc) => {
          verifiedStats.recentEvents.push({ id: doc.id, ...doc.data() });
        });
      }

      setStats({
        staging: stagingStats,
        analysis: analysisStats,
        verified: verifiedStats,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
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
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Event Processing Pipeline
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time monitoring of event collection, analysis, and verification
          </Typography>
        </Box>
        <IconButton onClick={fetchStats} size="large">
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Pipeline Overview Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        {/* Staging Events Card */}
        <Box sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 300 }}>
          <Card
            elevation={0}
            sx={{
              border: '2px solid',
              borderColor: 'warning.main',
              position: 'relative',
              overflow: 'visible',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InboxIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Staging Events
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                <Typography variant="h3" fontWeight="bold">
                  {stats.staging.total}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  total events
                </Typography>
              </Box>

              <Stack spacing={1} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Pending Review</Typography>
                  <Chip label={stats.staging.pending} size="small" color="warning" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Approved</Typography>
                  <Chip label={stats.staging.approved} size="small" color="success" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Rejected</Typography>
                  <Chip label={stats.staging.rejected} size="small" color="error" />
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" color="text.secondary" gutterBottom>
                Severity Distribution
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip label={`C: ${stats.staging.critical}`} size="small" color="error" variant="outlined" />
                <Chip label={`H: ${stats.staging.high}`} size="small" color="warning" variant="outlined" />
                <Chip label={`M: ${stats.staging.medium}`} size="small" color="info" variant="outlined" />
                <Chip label={`L: ${stats.staging.low}`} size="small" color="success" variant="outlined" />
              </Stack>

              <Button
                fullWidth
                variant="contained"
                color="warning"
                endIcon={<ArrowIcon />}
                sx={{ mt: 2 }}
                onClick={() => router.push('/dashboard/staging')}
              >
                Manage Staging
              </Button>
            </CardContent>
          </Card>
        </Box>

        {/* Analysis Queue Card */}
        <Box sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 300 }}>
          <Card
            elevation={0}
            sx={{
              border: '2px solid',
              borderColor: 'info.main',
              position: 'relative',
              overflow: 'visible',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AnalyticsIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Analysis Queue
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                <Typography variant="h3" fontWeight="bold">
                  {stats.analysis.total}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  in analysis
                </Typography>
              </Box>

              <Stack spacing={1} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Pending Verification</Typography>
                  <Chip label={stats.analysis.pending} size="small" color="info" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Verified</Typography>
                  <Chip label={stats.analysis.verified} size="small" color="success" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Failed</Typography>
                  <Chip label={stats.analysis.failed} size="small" color="error" />
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" color="text.secondary" gutterBottom>
                Average Risk Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="h5" fontWeight="bold" color="info.main">
                  {stats.analysis.avgRiskScore.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  / 10
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                color="info"
                endIcon={<ArrowIcon />}
                sx={{ mt: 2 }}
                onClick={() => router.push('/dashboard/analysis')}
              >
                Manage Analysis
              </Button>
            </CardContent>
          </Card>
        </Box>

        {/* Verified Events Card */}
        <Box sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 300 }}>
          <Card
            elevation={0}
            sx={{
              border: '2px solid',
              borderColor: 'success.main',
              position: 'relative',
              overflow: 'visible',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <VerifiedIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Verified Events
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                <Typography variant="h3" fontWeight="bold">
                  {stats.verified.total}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  verified
                </Typography>
              </Box>

              <Stack spacing={1} sx={{ mb: 2 }}>
                {Object.entries(stats.verified.byCategory).slice(0, 3).map(([category, count]) => (
                  <Box key={category} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {category}
                    </Typography>
                    <Chip label={count} size="small" variant="outlined" />
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" color="text.secondary" gutterBottom>
                Severity Distribution
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip label={`C: ${stats.verified.critical}`} size="small" color="error" variant="outlined" />
                <Chip label={`H: ${stats.verified.high}`} size="small" color="warning" variant="outlined" />
                <Chip label={`M: ${stats.verified.medium}`} size="small" color="info" variant="outlined" />
                <Chip label={`L: ${stats.verified.low}`} size="small" color="success" variant="outlined" />
              </Stack>

              <Button
                fullWidth
                variant="contained"
                color="success"
                endIcon={<ArrowIcon />}
                sx={{ mt: 2 }}
                onClick={() => router.push('/dashboard/verified')}
              >
                View Verified
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Recent Events Section */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Recent Staging Events */}
        <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: 350 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recent Staging Events
            </Typography>
            {stats.staging.recentEvents.length === 0 ? (
              <Typography color="text.secondary">No recent events</Typography>
            ) : (
              <Stack spacing={2}>
                {stats.staging.recentEvents.slice(0, 3).map((event) => (
                  <Box
                    key={event.id}
                    sx={{
                      p: 2,
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'grey.200',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ flex: 1, mr: 1 }}>
                        {event.event?.title?.substring(0, 60)}...
                      </Typography>
                      <Chip
                        label={event.event?.severity}
                        size="small"
                        color={getSeverityColor(event.event?.severity)}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {event.event?.location?.country?.eng || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(event.collectedAt)}
                      </Typography>
                      <Chip
                        label={event.reviewStatus}
                        size="small"
                        variant="outlined"
                        color={
                          event.reviewStatus === 'pending' ? 'warning' :
                          event.reviewStatus === 'approved' ? 'success' : 'error'
                        }
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Box>

        {/* Recent Verified Events */}
        <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: 350 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recent Verified Events
            </Typography>
            {stats.verified.recentEvents.length === 0 ? (
              <Typography color="text.secondary">No recent events</Typography>
            ) : (
              <Stack spacing={2}>
                {stats.verified.recentEvents.slice(0, 3).map((event) => (
                  <Box
                    key={event.id}
                    sx={{
                      p: 2,
                      bgcolor: 'green.50',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'green.200',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ flex: 1, mr: 1 }}>
                        {event.event?.title?.substring(0, 60)}...
                      </Typography>
                      <Chip
                        label={event.event?.severity}
                        size="small"
                        color={getSeverityColor(event.event?.severity)}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {event.event?.location?.country?.eng || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(event.verifiedAt || event.event?.dateTime)}
                      </Typography>
                      {event.analysis?.riskScore && (
                        <Chip
                          label={`Risk: ${event.analysis.riskScore}/10`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}