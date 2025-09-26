'use client';

import {
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Security as SecurityIcon,
  DataUsage as DataUsageIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  FiberManualRecord as DotIcon,
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';

const stats = [
  {
    title: 'Active Assessments',
    value: '24',
    change: '+3 this week',
    icon: AssessmentIcon,
    color: '#2563eb',
    bgColor: '#dbeafe',
  },
  {
    title: 'Data Points Collected',
    value: '1.2M',
    change: '+18% from last week',
    icon: DataUsageIcon,
    color: '#7c3aed',
    bgColor: '#ede9fe',
  },
  {
    title: 'Human Review Rate',
    value: '94%',
    change: '+2% improvement',
    icon: PsychologyIcon,
    color: '#10b981',
    bgColor: '#d1fae5',
  },
  {
    title: 'Critical Risks',
    value: '7',
    change: 'Requires attention',
    icon: WarningIcon,
    color: '#f59e0b',
    bgColor: '#fed7aa',
  },
];

const recentAlerts = [
  {
    id: 1,
    text: 'Critical cybersecurity threat detected in European region',
    time: '15 minutes ago',
    type: 'critical',
    category: 'Cyber',
  },
  {
    id: 2,
    text: 'Supply chain vulnerability identified - Auto Industry',
    time: '2 hours ago',
    type: 'high',
    category: 'Operations',
  },
  {
    id: 3,
    text: 'Geopolitical risk assessment completed for APAC',
    time: '4 hours ago',
    type: 'medium',
    category: 'Geopolitical',
  },
  {
    id: 4,
    text: 'New data source integrated: Government Database API',
    time: '6 hours ago',
    type: 'info',
    category: 'System',
  },
  {
    id: 5,
    text: 'Financial market anomaly detected - requires review',
    time: '1 day ago',
    type: 'high',
    category: 'Financial',
  },
];

const activeAssessments = [
  { name: 'Cybersecurity Q1 Analysis', progress: 78, dataPoints: 45200, risk: 'Critical' },
  { name: 'Supply Chain Resilience', progress: 65, dataPoints: 23100, risk: 'High' },
  { name: 'Climate Risk APAC', progress: 92, dataPoints: 18900, risk: 'Medium' },
];

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Risk Intelligence Overview
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Real-time monitoring of global risk indicators and intelligence data
      </Typography>

      {/* Stats Grid */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        {stats.map((stat) => (
          <Card key={stat.title} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', flex: '1 1 250px', minWidth: '250px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {stat.change}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: stat.bgColor,
                    color: stat.color,
                    width: 48,
                    height: 48,
                  }}
                >
                  <stat.icon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Recent Alerts */}
        <Box sx={{ flex: '2 1 600px', minWidth: '300px' }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recent Risk Alerts
            </Typography>
            <List>
              {recentAlerts.map((alert) => (
                <ListItem
                  key={alert.id}
                  sx={{
                    px: 0,
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor:
                          alert.type === 'critical' ? 'error.light' :
                          alert.type === 'high' ? 'warning.light' :
                          alert.type === 'medium' ? 'info.light' : 'grey.300',
                        width: 36,
                        height: 36,
                      }}
                    >
                      {alert.type === 'critical' ? <WarningIcon sx={{ fontSize: 20 }} /> :
                       alert.type === 'high' ? <SecurityIcon sx={{ fontSize: 20 }} /> :
                       <DotIcon sx={{ fontSize: 12 }} />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">{alert.text}</Typography>
                        <Chip label={alert.category} size="small" variant="outlined" />
                      </Box>
                    }
                    secondary={alert.time}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Active Assessments */}
        <Box sx={{ flex: '1 1 400px', minWidth: '300px' }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Active Assessments
            </Typography>
            <List>
              {activeAssessments.map((assessment, index) => (
                <ListItem
                  key={index}
                  sx={{
                    px: 0,
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box sx={{ width: '100%', mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {assessment.name}
                      </Typography>
                      <Chip
                        label={assessment.risk}
                        size="small"
                        color={
                          assessment.risk === 'Critical' ? 'error' :
                          assessment.risk === 'High' ? 'warning' : 'info'
                        }
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {assessment.dataPoints.toLocaleString()} data points
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="caption" fontWeight="bold">
                        {assessment.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={assessment.progress}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}