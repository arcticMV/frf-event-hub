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
  Fade,
  Grow,
  Zoom,
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
  Add as AddIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
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
  onSnapshot,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import GlassCard from '@/components/GlassCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import { AnimatedLineChart, AnimatedAreaChart, AnimatedBarChart, AnimatedPieChart } from '@/components/Charts';
import QuickActions from '@/components/QuickActions';
import ProgressiveDisclosure from '@/components/ProgressiveDisclosure';
import { motion } from 'framer-motion';

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
        if (data.aiAnalysis?.severity) {
          totalRiskScore += data.aiAnalysis.severity;
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

      toast.success('Dashboard refreshed successfully');
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time listeners
  useEffect(() => {
    fetchStats();

    // Real-time listener for staging events
    const stagingUnsubscribe = onSnapshot(
      collection(db, 'staging_events'),
      () => {
        fetchStats();
      }
    );

    // Real-time listener for analysis queue
    const analysisUnsubscribe = onSnapshot(
      collection(db, 'analysis_queue'),
      () => {
        fetchStats();
      }
    );

    // Real-time listener for verified events
    const verifiedUnsubscribe = onSnapshot(
      collection(db, 'verified_events'),
      () => {
        fetchStats();
      }
    );

    return () => {
      stagingUnsubscribe();
      analysisUnsubscribe();
      verifiedUnsubscribe();
    };
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

  // Prepare chart data
  const severityChartData = [
    { name: 'Critical', value: stats.staging.critical + stats.verified.critical },
    { name: 'High', value: stats.staging.high + stats.verified.high },
    { name: 'Medium', value: stats.staging.medium + stats.verified.medium },
    { name: 'Low', value: stats.staging.low + stats.verified.low },
  ];

  const statusChartData = [
    { name: 'Pending', value: stats.staging.pending },
    { name: 'Approved', value: stats.staging.approved },
    { name: 'Rejected', value: stats.staging.rejected },
  ];

  const categoryChartData = Object.entries(stats.verified.byCategory).map(([name, value]) => ({
    name,
    value,
  }));

  // Mock time series data for demonstration - in production, this would come from historical data
  const timeSeriesData = [
    { name: 'Mon', value: 45 },
    { name: 'Tue', value: 52 },
    { name: 'Wed', value: 38 },
    { name: 'Thu', value: 65 },
    { name: 'Fri', value: 72 },
    { name: 'Sat', value: 58 },
    { name: 'Sun', value: 43 },
  ];

  const quickActionHandlers = [
    {
      icon: <AddIcon />,
      name: 'Add Event',
      onClick: () => router.push('/dashboard/staging'),
      color: 'primary' as const,
    },
    {
      icon: <RefreshIcon />,
      name: 'Refresh',
      onClick: () => fetchStats(),
      color: 'info' as const,
    },
    {
      icon: <SearchIcon />,
      name: 'Search',
      onClick: () => toast('Search feature coming soon!'),
      color: 'secondary' as const,
    },
    {
      icon: <DownloadIcon />,
      name: 'Export',
      onClick: () => toast('Export feature coming soon!'),
      color: 'success' as const,
    },
  ];

  if (loading) {
    return <LoadingSkeleton variant="dashboard" />;
  }

  const isEmpty = stats.staging.total === 0 && stats.analysis.total === 0 && stats.verified.total === 0;

  if (isEmpty) {
    return (
      <EmptyState
        title="No Events Yet"
        description="Your event pipeline is empty. Start by adding events to the staging area."
        icon={<InboxIcon />}
        actionLabel="Go to Staging"
        onAction={() => router.push('/dashboard/staging')}
        height="60vh"
      />
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
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Event Intelligence Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Real-time monitoring of event collection, analysis, and verification
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchStats}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              },
            }}
          >
            Refresh
          </Button>
        </Box>
      </motion.div>

      {/* Pipeline Status Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3, mb: 4 }}>
        <Zoom in timeout={300}>
          <GlassCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #FFA726 0%, #FB8C00 100%)',
                    mr: 2,
                  }}
                >
                  <InboxIcon sx={{ fontSize: 30, color: 'white' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.staging.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Staging Events
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Pending</Typography>
                  <Chip label={stats.staging.pending} size="small" color="warning" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Critical</Typography>
                  <Chip label={stats.staging.critical} size="small" color="error" />
                </Box>
              </Stack>
              <Button
                fullWidth
                variant="text"
                endIcon={<ArrowIcon />}
                sx={{ mt: 2 }}
                onClick={() => router.push('/dashboard/staging')}
              >
                View Staging
              </Button>
            </CardContent>
          </GlassCard>
        </Zoom>

        <Zoom in timeout={400}>
          <GlassCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #42A5F5 0%, #1E88E5 100%)',
                    mr: 2,
                  }}
                >
                  <AnalyticsIcon sx={{ fontSize: 30, color: 'white' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.analysis.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Analysis Queue
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Pending</Typography>
                  <Chip label={stats.analysis.pending} size="small" color="info" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Avg Risk</Typography>
                  <Chip
                    label={stats.analysis.avgRiskScore.toFixed(1)}
                    size="small"
                    color={stats.analysis.avgRiskScore > 7 ? 'error' : stats.analysis.avgRiskScore > 4 ? 'warning' : 'success'}
                  />
                </Box>
              </Stack>
              <Button
                fullWidth
                variant="text"
                endIcon={<ArrowIcon />}
                sx={{ mt: 2 }}
                onClick={() => router.push('/dashboard/analysis')}
              >
                View Analysis
              </Button>
            </CardContent>
          </GlassCard>
        </Zoom>

        <Zoom in timeout={500}>
          <GlassCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #66BB6A 0%, #43A047 100%)',
                    mr: 2,
                  }}
                >
                  <VerifiedIcon sx={{ fontSize: 30, color: 'white' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.verified.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Verified Events
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Critical</Typography>
                  <Chip label={stats.verified.critical} size="small" color="error" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">High Risk</Typography>
                  <Chip label={stats.verified.high} size="small" color="warning" />
                </Box>
              </Stack>
              <Button
                fullWidth
                variant="text"
                endIcon={<ArrowIcon />}
                sx={{ mt: 2 }}
                onClick={() => router.push('/dashboard/verified')}
              >
                View Verified
              </Button>
            </CardContent>
          </GlassCard>
        </Zoom>
      </Box>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
          Analytics & Insights
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 3, mb: 4 }}>
          <AnimatedAreaChart
            data={timeSeriesData}
            title="Events Over Time"
            height={250}
            color="#6366F1"
          />
          <AnimatedBarChart
            data={severityChartData}
            title="Events by Severity"
            height={250}
          />
          {categoryChartData.length > 0 && (
            <AnimatedPieChart
              data={categoryChartData}
              title="Events by Category"
              height={250}
              outerRadius={80}
            />
          )}
        </Box>
      </motion.div>

      {/* Recent Events with Progressive Disclosure */}
      <ProgressiveDisclosure
        title="View Recent Events"
        variant="section"
        basicContent={
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats.staging.recentEvents.length + stats.verified.recentEvents.length} new events in the last 24 hours
            </Typography>
          </Box>
        }
        advancedContent={
          <Stack spacing={2}>
            {[...stats.staging.recentEvents.slice(0, 3), ...stats.verified.recentEvents.slice(0, 2)].map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: 'transparent',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'translateX(4px)',
                    },
                  }}
                  onClick={() => router.push(event.verifiedAt ? '/dashboard/verified' : '/dashboard/staging')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 40,
                        borderRadius: 1,
                        background: event.event?.severity === 'critical' ? '#EF4444' :
                                   event.event?.severity === 'high' ? '#F59E0B' :
                                   event.event?.severity === 'medium' ? '#3B82F6' : '#10B981',
                      }}
                    />
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {event.event?.title || 'Untitled Event'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(event.collectedAt || event.verifiedAt)} • {event.event?.location?.country?.eng || 'Unknown'}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={event.reviewStatus || 'verified'}
                    size="small"
                    color={event.reviewStatus === 'pending' ? 'warning' : 'success'}
                    variant="outlined"
                  />
                </Paper>
              </motion.div>
            ))}
          </Stack>
        }
      />

      {/* Quick Actions SpeedDial */}
      <QuickActions actions={quickActionHandlers} />
    </Box>
  );
}