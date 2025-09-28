'use client';

import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface BaseChartProps {
  data: ChartData[];
  title?: string;
  height?: number;
}

interface LineChartProps extends BaseChartProps {
  dataKey?: string;
  color?: string;
}

export const AnimatedLineChart: React.FC<LineChartProps> = ({
  data,
  title = 'Line Chart',
  height = 300,
  dataKey = 'value',
  color,
}) => {
  const theme = useTheme();
  const chartColor = color || theme.palette.primary.main;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Paper sx={{ p: 3, height: height + 60, background: 'transparent', backdropFilter: 'blur(10px)' }}>
        {title && (
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        )}
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={chartColor}
              strokeWidth={3}
              dot={{ fill: chartColor, strokeWidth: 2 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </motion.div>
  );
};

interface AreaChartProps extends BaseChartProps {
  dataKey?: string;
  color?: string;
  gradient?: boolean;
}

export const AnimatedAreaChart: React.FC<AreaChartProps> = ({
  data,
  title = 'Area Chart',
  height = 300,
  dataKey = 'value',
  color,
  gradient = true,
}) => {
  const theme = useTheme();
  const chartColor = color || theme.palette.primary.main;
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper sx={{ p: 3, height: height + 60, background: 'transparent', backdropFilter: 'blur(10px)' }}>
        {title && (
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        )}
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            {gradient && (
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0.1} />
                </linearGradient>
              </defs>
            )}
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
              }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={chartColor}
              strokeWidth={2}
              fill={gradient ? `url(#${gradientId})` : chartColor}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>
    </motion.div>
  );
};

interface BarChartProps extends BaseChartProps {
  dataKey?: string;
  colors?: string[];
}

export const AnimatedBarChart: React.FC<BarChartProps> = ({
  data,
  title = 'Bar Chart',
  height = 300,
  dataKey = 'value',
  colors,
}) => {
  const theme = useTheme();
  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];
  const chartColors = colors || defaultColors;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper sx={{ p: 3, height: height + 60, background: 'transparent', backdropFilter: 'blur(10px)' }}>
        {title && (
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        )}
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
              }}
            />
            <Bar dataKey={dataKey} radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </motion.div>
  );
};

interface PieChartProps extends BaseChartProps {
  innerRadius?: number;
  outerRadius?: number;
  colors?: string[];
}

export const AnimatedPieChart: React.FC<PieChartProps> = ({
  data,
  title = 'Pie Chart',
  height = 300,
  innerRadius = 0,
  outerRadius = 100,
  colors,
}) => {
  const theme = useTheme();
  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];
  const chartColors = colors || defaultColors;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Paper sx={{ p: 3, height: height + 60, background: 'transparent', backdropFilter: 'blur(10px)' }}>
        {title && (
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        )}
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              dataKey="value"
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Paper>
    </motion.div>
  );
};