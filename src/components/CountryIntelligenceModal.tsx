'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Stack,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  ExpandMore as ExpandMoreIcon,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  CheckCircle as VerifyIcon,
} from '@mui/icons-material';

interface CountryIntelligenceModalProps {
  open: boolean;
  onClose: () => void;
  countryData: any;
  eventId: string;
  onVerify?: () => void;
}

export default function CountryIntelligenceModal({
  open,
  onClose,
  countryData,
  eventId,
  onVerify,
}: CountryIntelligenceModalProps) {
  const [tabValue, setTabValue] = useState(0);

  if (!countryData) return null;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
      case 'worsening':
        return <TrendingUp color="error" />;
      case 'decreasing':
      case 'improving':
        return <TrendingDown color="success" />;
      default:
        return <TrendingFlat color="action" />;
    }
  };

  const getRiskColor = (score: number): "error" | "warning" | "info" | "success" | "default" => {
    if (score >= 8) return 'error';
    if (score >= 6) return 'warning';
    if (score >= 4) return 'info';
    return 'success';
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TimelineIcon fontSize="large" color="primary" />
          <Box>
            <Typography variant="h6">
              {countryData.countryName} - Strategic Intelligence
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {countryData.totalEvents} events tracked • Last updated: {
                formatDate(countryData.lastUpdated)
              }
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
          <Tab label="Overview" />
          <Tab label="Events Timeline" />
          <Tab label="Category Analysis" />
          <Tab label="Strategic Outlook" />
        </Tabs>

        {/* Tab 0: Overview */}
        {tabValue === 0 && countryData.aiAnalysis && (
          <Stack spacing={3}>
            <Alert severity="info">
              <Stack direction="row" spacing={3} alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {countryData.aiAnalysis.overallRisk.score}/10
                  </Typography>
                  <Typography variant="caption">Overall Risk</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getTrendIcon(countryData.aiAnalysis.overallRisk.trend)}
                  <Typography variant="body2" textTransform="capitalize">
                    {countryData.aiAnalysis.overallRisk.trend}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2">
                    Confidence: {(countryData.aiAnalysis.overallRisk.confidence * 100).toFixed(0)}%
                  </Typography>
                </Box>
              </Stack>
            </Alert>

            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Executive Summary
              </Typography>
              <Typography variant="body2" paragraph>
                {countryData.aiAnalysis.summary}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Key Themes
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {countryData.aiAnalysis.keyThemes?.map((theme: string, idx: number) => (
                  <Chip key={idx} label={theme} size="small" color="primary" variant="outlined" />
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Critical Developments
              </Typography>
              <List dense>
                {countryData.aiAnalysis.criticalDevelopments?.map((dev: string, idx: number) => (
                  <ListItem key={idx}>
                    <ListItemText primary={`• ${dev}`} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Stack>
        )}

        {/* Tab 1: Events Timeline */}
        {tabValue === 1 && (
          <Stack spacing={2}>
            {Object.entries(countryData.timeline || {}).map(([category, data]: [string, any]) => (
              <Accordion key={category}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Typography fontWeight="bold">{category}</Typography>
                    <Chip label={`${data.eventCount} events`} size="small" />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {data.events.map((evt: any, idx: number) => (
                      <ListItem key={idx}>
                        <ListItemText
                          primary={evt.title}
                          secondary={
                            <Box component="span">
                              <Typography variant="caption" display="block" component="span">
                                {formatDate(evt.dateTime)}
                              </Typography>
                              <Typography variant="body2" component="span" display="block" sx={{ mt: 0.5 }}>
                                {evt.summary}
                              </Typography>
                              <Box component="span" display="block" sx={{ mt: 0.5 }}>
                                <Chip label={evt.severity} size="small" />
                              </Box>
                            </Box>
                          }
                          secondaryTypographyProps={{ component: 'span' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}

        {/* Tab 2: Category Analysis */}
        {tabValue === 2 && countryData.aiAnalysis?.categories && (
          <Stack spacing={2}>
            {Object.entries(countryData.aiAnalysis.categories).map(([cat, analysis]: [string, any]) => (
              <Accordion key={cat}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Typography fontWeight="bold">{cat}</Typography>
                    <Chip
                      label={analysis.riskLevel}
                      size="small"
                      color={getRiskColor(8)}
                    />
                    <Typography variant="caption">({analysis.eventCount} events)</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Typography variant="body2">{analysis.summary}</Typography>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>Key Points:</Typography>
                      <List dense>
                        {analysis.keyPoints?.map((point: string, idx: number) => (
                          <ListItem key={idx}>
                            <ListItemText primary={`• ${point}`} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>Trend:</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTrendIcon(analysis.trend)}
                        <Typography variant="body2" textTransform="capitalize">
                          {analysis.trend}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}

        {/* Tab 3: Strategic Outlook */}
        {tabValue === 3 && countryData.aiAnalysis?.outlook && (
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Short-term (1-4 weeks)
              </Typography>
              <Typography variant="body2">{countryData.aiAnalysis.outlook.shortTerm}</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Medium-term (1-6 months)
              </Typography>
              <Typography variant="body2">{countryData.aiAnalysis.outlook.mediumTerm}</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Long-term (6-12 months)
              </Typography>
              <Typography variant="body2">{countryData.aiAnalysis.outlook.longTerm}</Typography>
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Recommendations
              </Typography>
              <List>
                {countryData.aiAnalysis.recommendations?.map((rec: string, idx: number) => (
                  <ListItem key={idx}>
                    <ListItemText primary={`${idx + 1}. ${rec}`} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {onVerify && (
          <Button
            variant="contained"
            color="success"
            startIcon={<VerifyIcon />}
            onClick={onVerify}
          >
            Verify & Publish
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
