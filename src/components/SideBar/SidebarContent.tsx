import React from 'react';
import {
  Box, Accordion, AccordionDetails, AccordionSummary, List, Typography, Divider, Avatar, IconButton, Button,
} from '@mui/material';
import UnfoldMore from '@mui/icons-material/UnfoldMore';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import logo from '../../assets/logo.png';
import SidebarItem from '../SideBarItem/SideBarItem';
import { useAuth } from '../../context/AuthContext';
import { MenuOpen, Menu } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface SidebarContentProps {
  isOpen: boolean;
  sidebarSections: any[];
  toggleSidebar?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ isOpen, sidebarSections, toggleSidebar }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Handler to navigate to profile page
  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/profile');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Header with logo */}
      <Box className="sidebar-header" display="flex" alignItems="center" sx={{ padding: 1 }}>
        {isOpen && (
          <Box sx={{ ml: 2, flexGrow: 1 }}>
            <img src={logo} alt="Logo" style={{ objectFit: 'contain' }} />
          </Box>
        )}
        {toggleSidebar && (
          <IconButton onClick={toggleSidebar} sx={{ ml: isOpen ? 0 : 1 }}>
            {/* Optionally add a collapse/expand icon here */}
            {isOpen ? <MenuOpen /> : <Menu />}
          </IconButton>
        )}
      </Box>
      {/* User Profile Accordion */}
      <Box sx={{ px: 2 }}>
        <Accordion
          sx={{ boxShadow: 0, margin: 0, padding: 0, '& .MuiAccordionDetails-root': { pt: 0 } }}
          square
          expanded={false}
        >
          <AccordionSummary
            expandIcon={isOpen ? <UnfoldMore /> : null}
            aria-controls="profile-content"
            id="profile-header"
            sx={{ cursor: 'pointer' }}
            // Remove onClick from AccordionSummary
          >
            {user && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  src={user.profile_picture}
                  sx={{ width: 40, height: 40, mr: 2, cursor: 'pointer' }}
                  onClick={handleProfileClick}
                />
                <Box sx={{ ml: 1 }}>
                  {isOpen && (
                    <>
                      <Typography variant="subtitle1">{user.first_name} {user.last_name}</Typography>
                      {user?.user_type_name && (
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                          {user.user_type_name}
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
              </Box>
            )}
          </AccordionSummary>
          <AccordionDetails>
            {isOpen && user && (
              <Box sx={{ display: 'flex', alignItems: 'center', margin: 0, padding: 0 }}>
                <Box sx={{ ml: 2 }}>
                  <Typography variant="body2" color="textSecondary">{user.email}</Typography>
                </Box>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
      <Divider sx={{ my: 1 }} />
      {/* Sidebar Sections */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2 }}>
        {sidebarSections.map((section, idx) => (
          <Accordion key={section.section} sx={{ boxShadow: 0, mt: idx === 0 ? 0 : 1 }}>
            <AccordionSummary expandIcon={isOpen ? <UnfoldMore /> : null}>
              {isOpen ? <Typography>{section.section}</Typography> : section.icon}
            </AccordionSummary>
            <AccordionDetails sx={{ margin: 0, padding: 0 }}>
              <List>
                {section.items.map((item: { icon: React.ReactNode; label: string; to: string }, i: number) => (
                  <SidebarItem key={i} icon={item.icon} label={item.label} isOpen={isOpen} to={item.to} />
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      {/* Footer with logout and copyright */}
      <Box sx={{
        p: 2,
        width: '100%',
        textAlign: 'center',
        // position: 'absolute',
        bottom: 0,
        left: 0,
        bgcolor: 'background.paper'
      }}>
        {isOpen ? (
          <Button
            fullWidth
            variant="outlined"
            color="inherit"
            startIcon={<ExitToAppIcon />}
            onClick={logout}
          >
            Sign Out
          </Button>
        ) : (
          <IconButton onClick={logout}>
            <ExitToAppIcon />
          </IconButton>
        )}
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
            width: '100%',
            display: 'block',
            mt: 2,
            mb: 1,
          }}
        >
          GrazConcept, {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
};

export default SidebarContent;