// src/components/SidebarItem.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { useTheme } from '@mui/material/styles'; // Import the useTheme hook
import './SidebarItem.css'; // Import the CSS for the SidebarItem styling

interface SidebarItemProps {
    icon: React.ReactNode; // MUI icon component or any React node
    label: string;
    count?: number; // Optional count
    isOpen: boolean;
    to: string; // Add a to prop for the route
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, count, isOpen, to }) => {
    const theme = useTheme(); // Use the useTheme hook to access the theme

    return (
        <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }}> {/* Use Link for navigation */}
            <Box
                className="sidebar-item"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    py: 1,
                    px: 2,
                    bgcolor: 'transparent',
                    '&:hover': {
                        bgcolor: 'action.hover',
                    },
                    borderRadius: 1,
                }}
            >
                <Box sx={{ mr: 2 }}>{icon}</Box>
                {isOpen && (
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {label}
                    </Typography>
                )}
                {isOpen && count !== undefined && (
                    <Box
                        sx={{
                            bgcolor: theme.palette.primary.main, // Use the theme color here
                            '&:hover': {
                                bgcolor: `${theme.palette.primary.light}`, // Use a lighter shade on hover
                            },
                            color: 'white',
                            borderRadius: '50%',
                            px: 1,
                            py: 0.5,
                            fontSize: '0.75rem',
                        }}
                    >
                        {count}
                    </Box>
                )}
            </Box>
        </Link>
    );
};

export default SidebarItem;
