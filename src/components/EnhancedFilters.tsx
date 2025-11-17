'use client';

/**
 * Enhanced Filters Component
 *
 * Advanced filtering with date ranges, multi-select categories, and saved presets.
 */

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Chip,
  Menu,
  MenuItem,
  IconButton,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  ExpandMore as ExpandIcon,
  DateRange as DateIcon,
} from '@mui/icons-material';
import { isFeatureEnabled } from '@/lib/featureFlags';

export interface FilterValues {
  search?: string;
  categories?: string[];
  severities?: string[];
  dateFrom?: string;
  dateTo?: string;
  riskMin?: number;
  riskMax?: number;
  status?: string;
}

export interface EnhancedFiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  availableCategories?: string[];
  availableSeverities?: string[];
  availableStatuses?: string[];
  showRiskFilter?: boolean;
  showDateFilter?: boolean;
}

const PRESET_DATE_RANGES = [
  { label: 'Last 24 hours', hours: 24 },
  { label: 'Last 48 hours', hours: 48 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'This month', month: 'current' },
];

export default function EnhancedFilters({
  filters,
  onFiltersChange,
  availableCategories = [],
  availableSeverities = ['critical', 'high', 'medium', 'low'],
  availableStatuses = [],
  showRiskFilter = false,
  showDateFilter = true,
}: EnhancedFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [dateMenuAnchor, setDateMenuAnchor] = useState<null | HTMLElement>(null);

  const enabled = isFeatureEnabled('enhancedFilters');

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleClearAll = () => {
    onFiltersChange({});
  };

  const handleDatePreset = (preset: any) => {
    const now = new Date();
    let dateFrom: Date;

    if (preset.hours) {
      dateFrom = new Date(now.getTime() - preset.hours * 60 * 60 * 1000);
    } else if (preset.days) {
      dateFrom = new Date(now.getTime() - preset.days * 24 * 60 * 60 * 1000);
    } else if (preset.month === 'current') {
      dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      return;
    }

    onFiltersChange({
      ...filters,
      dateFrom: dateFrom.toISOString().slice(0, 16),
      dateTo: now.toISOString().slice(0, 16),
    });

    setDateMenuAnchor(null);
  };

  const activeFilterCount = Object.values(filters).filter(v =>
    v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0)
  ).length;

  if (!enabled) {
    // Fallback to basic search
    return (
      <TextField
        fullWidth
        size="small"
        placeholder="Search events..."
        value={filters.search || ''}
        onChange={(e) => handleFilterChange('search', e.target.value)}
      />
    );
  }

  return (
    <Box>
      {/* Main search bar */}
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search across title, summary, location..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          onClick={() => setExpanded(!expanded)}
          sx={{ minWidth: 120 }}
        >
          Filters
          {activeFilterCount > 0 && (
            <Chip
              label={activeFilterCount}
              size="small"
              color="primary"
              sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
            />
          )}
        </Button>
        {activeFilterCount > 0 && (
          <IconButton size="small" onClick={handleClearAll} title="Clear all filters">
            <ClearIcon />
          </IconButton>
        )}
      </Box>

      {/* Advanced filters */}
      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)} elevation={0}>
        <AccordionSummary sx={{ display: 'none' }}>
          <ExpandIcon />
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Categories (Multi-select) */}
            {availableCategories.length > 0 && (
              <FormControl size="small" fullWidth>
                <InputLabel>Categories</InputLabel>
                <Select
                  multiple
                  value={filters.categories || []}
                  onChange={(e) => handleFilterChange('categories', e.target.value)}
                  input={<OutlinedInput label="Categories" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {availableCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      <Checkbox checked={(filters.categories || []).indexOf(category) > -1} />
                      <ListItemText primary={category} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Severities (Multi-select) */}
            {availableSeverities.length > 0 && (
              <FormControl size="small" fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  multiple
                  value={filters.severities || []}
                  onChange={(e) => handleFilterChange('severities', e.target.value)}
                  input={<OutlinedInput label="Severity" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {availableSeverities.map((severity) => (
                    <MenuItem key={severity} value={severity}>
                      <Checkbox checked={(filters.severities || []).indexOf(severity) > -1} />
                      <ListItemText primary={severity} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Status (Single select) */}
            {availableStatuses.length > 0 && (
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  {availableStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Date Range */}
            {showDateFilter && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DateIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Date Range
                  </Typography>
                  <Button
                    size="small"
                    onClick={(e) => setDateMenuAnchor(e.currentTarget)}
                    sx={{ ml: 'auto', fontSize: '0.7rem' }}
                  >
                    Quick Select
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    type="datetime-local"
                    size="small"
                    label="From"
                    value={filters.dateFrom || ''}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    type="datetime-local"
                    size="small"
                    label="To"
                    value={filters.dateTo || ''}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Box>
              </Box>
            )}

            {/* Risk Score Range */}
            {showRiskFilter && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Risk Score Range (0-10)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    type="number"
                    size="small"
                    label="Min"
                    value={filters.riskMin ?? ''}
                    onChange={(e) => handleFilterChange('riskMin', e.target.value ? Number(e.target.value) : undefined)}
                    inputProps={{ min: 0, max: 10, step: 0.1 }}
                    fullWidth
                  />
                  <TextField
                    type="number"
                    size="small"
                    label="Max"
                    value={filters.riskMax ?? ''}
                    onChange={(e) => handleFilterChange('riskMax', e.target.value ? Number(e.target.value) : undefined)}
                    inputProps={{ min: 0, max: 10, step: 0.1 }}
                    fullWidth
                  />
                </Box>
              </Box>
            )}

            <Divider />

            {/* Action buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearAll}
                fullWidth
              >
                Clear All
              </Button>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Date preset menu */}
      <Menu
        anchorEl={dateMenuAnchor}
        open={Boolean(dateMenuAnchor)}
        onClose={() => setDateMenuAnchor(null)}
      >
        {PRESET_DATE_RANGES.map((preset) => (
          <MenuItem key={preset.label} onClick={() => handleDatePreset(preset)}>
            {preset.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
