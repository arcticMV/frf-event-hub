'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useThemeMode } from '@/components/ThemeProvider';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    useTheme,
    alpha
} from '@mui/material';
import {
    Search as SearchIcon,
    Dashboard as DashboardIcon,
    Inbox as InboxIcon,
    Analytics as AnalyticsIcon,
    CheckCircle as VerifiedIcon,
    Settings as SettingsIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

export default function CommandPalette() {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { darkMode, toggleDarkMode } = useThemeMode();
    const { logout } = useAuth();
    const theme = useTheme();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    const actions = [
        {
            id: 'dashboard',
            name: 'Dashboard',
            icon: <DashboardIcon />,
            perform: () => router.push('/dashboard'),
            section: 'Navigation',
        },
        {
            id: 'staging',
            name: 'Staging Events',
            icon: <InboxIcon />,
            perform: () => router.push('/dashboard/staging'),
            section: 'Navigation',
        },
        {
            id: 'analysis',
            name: 'Analysis Queue',
            icon: <AnalyticsIcon />,
            perform: () => router.push('/dashboard/analysis'),
            section: 'Navigation',
        },
        {
            id: 'verified',
            name: 'Verified Events',
            icon: <VerifiedIcon />,
            perform: () => router.push('/dashboard/verified'),
            section: 'Navigation',
        },
        {
            id: 'theme',
            name: darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
            icon: darkMode ? <LightModeIcon /> : <DarkModeIcon />,
            perform: toggleDarkMode,
            section: 'Preferences',
        },
        {
            id: 'logout',
            name: 'Logout',
            icon: <LogoutIcon />,
            perform: async () => {
                try {
                    await logout();
                    router.push('/login');
                } catch (error) {
                    console.error('Logout failed', error);
                }
            },
            section: 'Account',
        },
    ];

    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    overflow: 'hidden',
                }
            }}
        >
            <Box
                sx={{
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[10],
                    '& [cmdk-root]': {
                        width: '100%',
                    },
                    '& [cmdk-input]': {
                        width: '100%',
                        padding: '16px',
                        border: 'none',
                        outline: 'none',
                        fontSize: '1rem',
                        backgroundColor: 'transparent',
                        color: theme.palette.text.primary,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                    },
                    '& [cmdk-list]': {
                        maxHeight: 400,
                        overflow: 'auto',
                        padding: '8px',
                    },
                    '& [cmdk-group-heading]': {
                        padding: '8px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    },
                    '& [cmdk-item]': {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: theme.palette.text.primary,
                        transition: 'all 0.2s',
                        '&[data-selected="true"]': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                        },
                        '&:active': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        },
                    },
                    '& [cmdk-empty]': {
                        padding: '32px',
                        textAlign: 'center',
                        color: theme.palette.text.secondary,
                    },
                }}
            >
                <Command label="Command Palette">
                    <Box sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                        <SearchIcon sx={{ color: 'text.secondary' }} />
                        <Command.Input placeholder="Type a command or search..." autoFocus />
                    </Box>

                    <Command.List>
                        <Command.Empty>No results found.</Command.Empty>

                        {['Navigation', 'Preferences', 'Account'].map((section) => (
                            <Command.Group key={section} heading={section}>
                                {actions
                                    .filter((action) => action.section === section)
                                    .map((action) => (
                                        <Command.Item
                                            key={action.id}
                                            onSelect={() => runCommand(action.perform)}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'inherit' }}>
                                                {action.icon}
                                            </Box>
                                            <Typography variant="body2" fontWeight="medium">
                                                {action.name}
                                            </Typography>
                                        </Command.Item>
                                    ))}
                            </Command.Group>
                        ))}
                    </Command.List>
                </Command>
            </Box>
        </Dialog>
    );
}
