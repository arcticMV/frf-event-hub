'use client';

/**
 * Duplicate Warning Component
 *
 * Displays warnings about potential duplicate events.
 * Shows side-by-side comparison with similar events.
 */

import React, { useState } from 'react';
import {
  Alert,
  Box,
  Typography,
  Chip,
  Button,
  Collapse,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Warning as WarningIcon,
  ErrorOutline as ErrorIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Visibility as ViewIcon,
  CompareArrows as CompareIcon,
} from '@mui/icons-material';
import { SimilarityMatch } from '@/lib/duplicateDetection';

export interface DuplicateWarningProps {
  duplicates: SimilarityMatch[];
  checking: boolean;
  error?: string | null;
  onViewEvent?: (eventId: string, collection: string) => void;
}

export default function DuplicateWarning({
  duplicates,
  checking,
  error,
  onViewEvent,
}: DuplicateWarningProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<SimilarityMatch | null>(null);

  if (checking) {
    return (
      <Alert severity="info" icon={<CircularProgress size={20} />}>
        Checking for duplicates...
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert severity="warning">
        <Typography variant="body2">
          Unable to check for duplicates: {error}
        </Typography>
      </Alert>
    );
  }

  if (duplicates.length === 0) {
    return null;
  }

  const highestMatch = duplicates[0];
  const isHighConfidence = highestMatch.score >= 80;
  const isMediumConfidence = highestMatch.score >= 60 && highestMatch.score < 80;

  return (
    <Box>
      {/* Main warning alert */}
      <Alert
        severity={isHighConfidence ? 'error' : isMediumConfidence ? 'warning' : 'info'}
        icon={isHighConfidence ? <ErrorIcon /> : <WarningIcon />}
        action={
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <CollapseIcon /> : <ExpandIcon />}
          </IconButton>
        }
      >
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {isHighConfidence && 'Likely duplicate detected!'}
            {isMediumConfidence && 'Possible duplicate found'}
            {!isHighConfidence && !isMediumConfidence && 'Similar events exist'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Found {duplicates.length} similar event{duplicates.length !== 1 ? 's' : ''} •
            Best match: {highestMatch.score}% ({highestMatch.matchReasons.join(', ')})
          </Typography>
        </Box>
      </Alert>

      {/* Detailed view */}
      <Collapse in={expanded}>
        <Box sx={{ mt: 1, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Similar Events:
          </Typography>

          {duplicates.map((match) => (
            <Card
              key={match.id}
              variant="outlined"
              sx={{
                mt: 1,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => setSelectedMatch(match)}
            >
              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  {/* Similarity score */}
                  <Chip
                    label={`${match.score}%`}
                    size="small"
                    color={match.score >= 80 ? 'error' : match.score >= 60 ? 'warning' : 'default'}
                    sx={{ fontWeight: 'bold', minWidth: 50 }}
                  />

                  {/* Event details */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {match.event.event?.title || match.event.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {match.event.event?.location?.text?.eng || match.event.location?.text?.eng} •{' '}
                      {match.event.event?.category || match.event.category} •{' '}
                      {match.event.collection}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      {match.matchReasons.map((reason, idx) => (
                        <Chip
                          key={idx}
                          label={reason}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mt: 0.5, fontSize: '0.7rem', height: 20 }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Actions */}
                  {onViewEvent && (
                    <Tooltip title="View event">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewEvent(match.id, match.event.collection);
                        }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}

          {/* Comparison view */}
          {selectedMatch && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CompareIcon fontSize="small" />
                <Typography variant="subtitle2">
                  Event Comparison
                </Typography>
                <Button
                  size="small"
                  onClick={() => setSelectedMatch(null)}
                  sx={{ ml: 'auto' }}
                >
                  Close
                </Button>
              </Box>
              <Divider sx={{ mb: 1 }} />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="medium">
                    NEW EVENT
                  </Typography>
                  {/* Will be populated by parent component */}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight="medium">
                    EXISTING EVENT
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {selectedMatch.event.event?.title || selectedMatch.event.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedMatch.event.event?.summary || selectedMatch.event.summary}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
