'use client';

import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Visibility as VisibilityIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';

const metrics = [
  {
    title: 'Total Views',
    value: '12,543',
    change: 12,
    positive: true,
    icon: VisibilityIcon,
    color: 'purple',
  },
  {
    title: 'Conversion Rate',
    value: '68%',
    change: 5,
    positive: true,
    icon: TrendingUpIcon,
    color: 'green',
  },
  {
    title: 'Active Events',
    value: '8',
    subtitle: '3 ending soon',
    icon: EventIcon,
    color: 'blue',
  },
  {
    title: 'Avg. Attendees',
    value: '74',
    change: -3,
    positive: false,
    icon: PeopleIcon,
    color: 'orange',
  },
];

const topEvents = [
  { name: 'Annual Tech Conference', attendees: 186 },
  { name: 'Spring Networking', attendees: 142 },
  { name: 'Innovation Workshop', attendees: 98 },
  { name: 'Summer Meetup', attendees: 76 },
  { name: 'Product Launch', attendees: 64 },
];

const getColorValue = (color: string) => {
  const colors = {
    purple: { bg: '#f3e8ff', main: '#9333ea' },
    green: { bg: '#dcfce7', main: '#16a34a' },
    blue: { bg: '#dbeafe', main: '#2563eb' },
    orange: { bg: '#fed7aa', main: '#ea580c' },
  };
  return colors[color as keyof typeof colors] || colors.blue;
};

export default function AnalyticsPage() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track performance and insights
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric, index) => {
          const colors = getColorValue(metric.color || 'blue');
          const Icon = metric.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {metric.title}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {metric.value}
                      </Typography>
                      {metric.change !== undefined ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          {metric.positive ? (
                            <ArrowUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          ) : (
                            <ArrowDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
                          )}
                          <Typography
                            variant="body2"
                            color={metric.positive ? 'success.main' : 'error.main'}
                          >
                            {Math.abs(metric.change)}% vs last month
                          </Typography>
                        </Box>
                      ) : metric.subtitle ? (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {metric.subtitle}
                        </Typography>
                      ) : null}
                    </Box>
                    <Avatar sx={{ bgcolor: colors.bg, width: 56, height: 56 }}>
                      <Icon sx={{ color: colors.main }} />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Registration Trends
              </Typography>
              <Paper
                sx={{
                  height: 256,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.50',
                }}
              >
                <Typography color="text.secondary">
                  Chart visualization will be added here
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Event Categories
              </Typography>
              <Paper
                sx={{
                  height: 256,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.50',
                }}
              >
                <Typography color="text.secondary">
                  Pie chart visualization will be added here
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Performance
              </Typography>
              <Paper
                sx={{
                  height: 256,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.50',
                }}
              >
                <Typography color="text.secondary">
                  Bar chart visualization will be added here
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Events
              </Typography>
              <List dense>
                {topEvents.map((event, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight="medium" sx={{ mr: 1 }}>
                              {index + 1}.
                            </Typography>
                            <Typography variant="body2">
                              {event.name}
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight="medium">
                            {event.attendees}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}