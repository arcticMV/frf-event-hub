'use client';

import { useState, useEffect } from 'react';
import {
  CardContent,
  Typography,
  Box,
  Paper,
  Chip,
  Stack,
  Divider,
  Button,
  Zoom,
} from '@mui/material';
import {
  Inbox as InboxIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as VerifiedIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import LiquidGlassButton from '@/components/LiquidGlassButton';
import { db } from '@/lib/firebase/client';
import {
  collection,
  query,
  getDocs,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import GlassCard from '@/components/GlassCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import { AnimatedAreaChart, AnimatedBarChart, AnimatedPieChart } from '@/components/Charts';
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
  const [verifiedEventsOverTime, setVerifiedEventsOverTime] = useState<any[]>([]);

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

      // Prepare data for time series (last 7 days)
      const timeSeriesMap: Record<string, number> = {};
      const today = new Date();
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      // Initialize last 7 days in order
      const orderedDays: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayName = daysOfWeek[date.getDay()];
        orderedDays.push(dayName);
        timeSeriesMap[dayName] = 0;
      }

      verifiedSnapshot.forEach((doc) => {
        const data = doc.data();
        verifiedStats.total++;

        // Debug log first event to see structure
        if (verifiedStats.total === 1) {
          console.log('Sample verified event structure:', data);
        }

        // Count by severity - check both event.severity (string) and analysis.severity (number)
        const severity = data.event?.severity?.toLowerCase() || '';
        if (severity === 'critical') verifiedStats.critical++;
        else if (severity === 'high') verifiedStats.high++;
        else if (severity === 'medium') verifiedStats.medium++;
        else if (severity === 'low') verifiedStats.low++;

        // Count by category - check event.category
        const category = data.event?.category;
        if (category && category !== '') {
          verifiedStats.byCategory[category] = (verifiedStats.byCategory[category] || 0) + 1;
          console.log('Found category:', category, 'Count:', verifiedStats.byCategory[category]);
        } else {
          // If no category, count as Unknown
          verifiedStats.byCategory['Unknown'] = (verifiedStats.byCategory['Unknown'] || 0) + 1;
        }

        // Count events by day for time series
        // Try multiple date fields: verifiedAt, event.dateTime, collectedAt, or just use now if none exist
        const dateField = data.verifiedAt || data.event?.dateTime || data.collectedAt;
        const eventDate = dateField ?
          (dateField.toDate ? dateField.toDate() : new Date(dateField)) :
          new Date(); // Use today if no date field exists

        const daysDiff = Math.floor((today.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));

        // For demo purposes, include all events in the last 30 days into the 7-day view
        if (daysDiff >= 0 && daysDiff < 30) {
          // Map to last 7 days cyclically for visualization
          const mappedDay = daysDiff < 7 ? daysDiff : daysDiff % 7;
          const targetDate = new Date(today);
          targetDate.setDate(targetDate.getDate() - mappedDay);
          const dayName = daysOfWeek[targetDate.getDay()];
          timeSeriesMap[dayName] = (timeSeriesMap[dayName] || 0) + 1;
        }
      });

      // Convert timeSeriesMap to array for chart, maintaining order
      const timeSeriesData = orderedDays.map(day => ({
        name: day,
        value: timeSeriesMap[day] || 0,
      }));

      console.log('Verified Events Stats:', {
        total: verifiedStats.total,
        byCategory: verifiedStats.byCategory,
        timeSeriesData
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
      setVerifiedEventsOverTime(timeSeriesData);

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

  // Prepare chart data - using verified_events for analytics
  const severityChartData = [
    { name: 'Critical', value: stats.verified.critical, color: '#DC2626' },
    { name: 'High', value: stats.verified.high, color: '#F59E0B' },
    { name: 'Medium', value: stats.verified.medium, color: '#3B82F6' },
    { name: 'Low', value: stats.verified.low, color: '#10B981' },
  ].filter(item => item.value > 0); // Only show severities with data

  const statusChartData = [
    { name: 'Pending', value: stats.staging.pending },
    { name: 'Approved', value: stats.staging.approved },
    { name: 'Rejected', value: stats.staging.rejected },
  ];

  // Limit categories to top 6 and truncate long names for better visualization
  const categoryChartData = Object.entries(stats.verified.byCategory)
    .filter(([, value]) => value > 0) // Only include categories with events
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, value]) => ({
      name: name.length > 20 ? name.substring(0, 17) + '...' : name,
      fullName: name,
      value,
    }));

  console.log('Category chart data:', categoryChartData);


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
          <LiquidGlassButton
            liquidVariant="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchStats}
            specularHighlights={true}
            glassIntensity="medium"
          >
            Refresh
          </LiquidGlassButton>
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
              <LiquidGlassButton
                fullWidth
                liquidVariant="neutral"
                endIcon={<ArrowIcon />}
                onClick={() => router.push('/dashboard/staging')}
                sx={{ mt: 2 }}
              >
                View Staging
              </LiquidGlassButton>
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
              <LiquidGlassButton
                fullWidth
                liquidVariant="neutral"
                endIcon={<ArrowIcon />}
                onClick={() => router.push('/dashboard/analysis')}
                sx={{ mt: 2 }}
              >
                View Analysis
              </LiquidGlassButton>
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
              <LiquidGlassButton
                fullWidth
                liquidVariant="neutral"
                endIcon={<ArrowIcon />}
                onClick={() => router.push('/dashboard/verified')}
                sx={{ mt: 2 }}
              >
                View Verified
              </LiquidGlassButton>
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
          Analytics & Insights - Verified Events
        </Typography>

        {/* First row: Time series spans full width */}
        <Box sx={{ mb: 3 }}>
          {verifiedEventsOverTime && verifiedEventsOverTime.length > 0 ? (
            <AnimatedAreaChart
              data={verifiedEventsOverTime}
              title="Verified Events Over Time (Last 7 Days)"
              height={250}
              color="#6366F1"
            />
          ) : (
            <Paper sx={{ p: 3, height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Verified Events Over Time (Last 7 Days)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No verified events in the last 7 days. Data will appear here as events are verified.
              </Typography>
            </Paper>
          )}
        </Box>

        {/* Second row: Severity and Category charts side by side */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
          {severityChartData.length > 0 ? (
            <AnimatedBarChart
              data={severityChartData}
              title="Events by Severity"
              height={280}
            />
          ) : (
            <Paper sx={{ p: 3, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No severity data available
              </Typography>
            </Paper>
          )}

          {categoryChartData.length > 0 ? (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Events by Category (Top 6)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Total events: {Object.values(stats.verified.byCategory).reduce((a, b) => a + b, 0)}
              </Typography>
              <Box sx={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AnimatedPieChart
                  data={categoryChartData}
                  title=""
                  height={220}
                  outerRadius={70}
                  disableWrapper={true}
                />
              </Box>
            </Paper>
          ) : (
            <Paper sx={{ p: 3, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <Typography variant="body2" color="text.secondary">
                No category data available
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Categories found: {Object.keys(stats.verified.byCategory).length}
              </Typography>
            </Paper>
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
    </Box>
  );
}