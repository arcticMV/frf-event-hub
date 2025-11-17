'use client';

/**
 * Recent Locations Input Component
 *
 * Provides quick access to recently used locations with autocomplete.
 */

import React, { useState } from 'react';
import {
  TextField,
  Box,
  Autocomplete,
  Chip,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useRecentLocations } from '@/hooks/useRecentLocations';

export interface LocationInputProps {
  locationValue: string;
  countryValue: string;
  onLocationChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  locationError?: boolean;
  countryError?: boolean;
  locationHelperText?: string;
  countryHelperText?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function RecentLocationsInput({
  locationValue,
  countryValue,
  onLocationChange,
  onCountryChange,
  locationError = false,
  countryError = false,
  locationHelperText,
  countryHelperText,
  disabled = false,
  required = false,
}: LocationInputProps) {
  const {
    recentLocations,
    addLocation,
    clearLocations,
    enabled,
  } = useRecentLocations();

  const [showRecent, setShowRecent] = useState(false);

  // Handle location selection from recent list
  const handleSelectRecent = (location: { text: string; country: string }) => {
    onLocationChange(location.text);
    onCountryChange(location.country);
    setShowRecent(false);
  };

  // Save location when both fields are filled
  const handleSaveLocation = () => {
    if (locationValue && countryValue) {
      addLocation(locationValue, countryValue);
    }
  };

  // Common countries for autocomplete
  const commonCountries = [
    'United States', 'United Kingdom', 'Ukraine', 'Russia', 'China', 'Iran', 'Israel',
    'Germany', 'France', 'Japan', 'South Korea', 'India', 'Pakistan', 'Afghanistan',
    'Syria', 'Iraq', 'Yemen', 'Somalia', 'Nigeria', 'Mexico', 'Brazil', 'Venezuela',
    'Colombia', 'Philippines', 'Indonesia', 'Thailand', 'Myanmar', 'Malaysia',
  ];

  // Extract unique countries from recent locations
  const recentCountries = Array.from(
    new Set(recentLocations.map(loc => loc.country))
  );

  // Combine and deduplicate countries
  const allCountries = Array.from(
    new Set([...recentCountries, ...commonCountries])
  ).sort();

  if (!enabled) {
    // Fallback to standard inputs
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Location Description"
          value={locationValue}
          onChange={(e) => onLocationChange(e.target.value)}
          error={locationError}
          helperText={locationHelperText}
          disabled={disabled}
          required={required}
          placeholder="e.g., Kyiv, Capital District"
        />
        <TextField
          fullWidth
          label="Country"
          value={countryValue}
          onChange={(e) => onCountryChange(e.target.value)}
          error={countryError}
          helperText={countryHelperText}
          disabled={disabled}
          required={required}
          placeholder="e.g., Ukraine"
        />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Recent locations dropdown */}
      {recentLocations.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <HistoryIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Recent Locations:
            </Typography>
            <Tooltip title="Clear recent locations">
              <IconButton
                size="small"
                onClick={clearLocations}
                sx={{ ml: 'auto' }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {recentLocations.slice(0, 5).map((loc, index) => (
              <Chip
                key={`${loc.text}-${loc.country}-${index}`}
                size="small"
                icon={<LocationIcon />}
                label={`${loc.text}, ${loc.country}`}
                onClick={() => handleSelectRecent(loc)}
                disabled={disabled}
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Location Description */}
      <TextField
        fullWidth
        label="Location Description"
        value={locationValue}
        onChange={(e) => onLocationChange(e.target.value)}
        onBlur={handleSaveLocation}
        error={locationError}
        helperText={locationHelperText}
        disabled={disabled}
        required={required}
        placeholder="e.g., Kyiv, Capital District"
        InputProps={{
          startAdornment: <LocationIcon sx={{ mr: 1, color: 'action.active' }} />,
        }}
      />

      {/* Country with Autocomplete */}
      <Autocomplete
        freeSolo
        value={countryValue}
        onChange={(_, newValue) => {
          onCountryChange(newValue || '');
          handleSaveLocation();
        }}
        onInputChange={(_, newValue) => {
          onCountryChange(newValue);
        }}
        onBlur={handleSaveLocation}
        options={allCountries}
        disabled={disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Country"
            error={countryError}
            helperText={countryHelperText}
            required={required}
            placeholder="Start typing or select..."
          />
        )}
      />
    </Box>
  );
}
