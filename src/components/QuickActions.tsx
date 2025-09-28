'use client';

import React, { useState } from 'react';
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Backdrop,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

interface QuickAction {
  icon: React.ReactElement;
  name: string;
  onClick: () => void;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

interface QuickActionsProps {
  actions?: QuickAction[];
  position?: {
    bottom?: number;
    right?: number;
    left?: number;
    top?: number;
  };
}

const defaultActions: QuickAction[] = [
  {
    icon: <AddIcon />,
    name: 'Add Event',
    onClick: () => console.log('Add event clicked'),
    color: 'primary',
  },
  {
    icon: <RefreshIcon />,
    name: 'Refresh',
    onClick: () => window.location.reload(),
    color: 'info',
  },
  {
    icon: <SearchIcon />,
    name: 'Search',
    onClick: () => console.log('Search clicked'),
    color: 'secondary',
  },
  {
    icon: <DownloadIcon />,
    name: 'Export',
    onClick: () => console.log('Export clicked'),
    color: 'success',
  },
];

const QuickActions: React.FC<QuickActionsProps> = ({
  actions = defaultActions,
  position = { bottom: 32, right: 32 },
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Backdrop
        open={open}
        sx={{
          zIndex: (theme) => theme.zIndex.speedDial - 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
        }}
      />
      <SpeedDial
        ariaLabel="Quick actions"
        sx={{
          position: 'fixed',
          ...position,
          '& .MuiSpeedDial-fab': {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            },
          },
        }}
        icon={
          <SpeedDialIcon
            icon={<EditIcon />}
            openIcon={<CloseIcon />}
          />
        }
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={() => {
              action.onClick();
              handleClose();
            }}
            sx={{
              backgroundColor: (theme) =>
                action.color ? theme.palette[action.color].main : theme.palette.primary.main,
              color: 'white',
              '&:hover': {
                backgroundColor: (theme) =>
                  action.color ? theme.palette[action.color].dark : theme.palette.primary.dark,
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease-in-out',
              animation: open ? 'fadeIn 0.3s ease-in-out' : 'none',
              '@keyframes fadeIn': {
                '0%': {
                  opacity: 0,
                  transform: 'scale(0)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'scale(1)',
                },
              },
            }}
          />
        ))}
      </SpeedDial>
    </>
  );
};

export default QuickActions;