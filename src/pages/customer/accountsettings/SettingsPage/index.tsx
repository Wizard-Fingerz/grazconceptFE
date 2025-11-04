import React from "react";
import { Box, Tabs, Tab, Paper, Typography } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import SecurityIcon from "@mui/icons-material/Security";
import NotificationSettingsPage from "../Notifications";
import ProfilePage from "../../../auth/ProfilePage";

const settingsSections = [
  {
    label: "Profile",
    value: "profile",
    icon: <SettingsIcon />,
    description: "Update your personal information."
  },
  {
    label: "Notifications",
    value: "notifications",
    icon: <NotificationsIcon />,
    description: "Manage notification preferences and view messages."
  },
  {
    label: "Security",
    value: "security",
    icon: <SecurityIcon />,
    description: "Change password, two-factor authentication, etc."
  }
];

const SettingsPage: React.FC = () => {
  const [currentSection, setCurrentSection] = React.useState<string>("profile");

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: string
  ) => {
    setCurrentSection(newValue);
  };

  function renderSection() {
    switch (currentSection) {
      case "notifications":
        return (
          <Box mt={2}>
            <NotificationSettingsPage />
          </Box>
        );
      case "profile":
        return (
          <Box mt={2}>
            <ProfilePage />
          </Box>
        );
      case "security":
      default:
        return (
          <Box mt={2}>
            <Typography variant="h6">Security Settings</Typography>
            <Typography color="text.secondary">
              Here you can change your password or set up additional security for your account.
            </Typography>
            {/* Placeholder for security settings panel */}
          </Box>
        );
    }
  }

  return (
    <Box
    sx={{
        px: { xs: 1, sm: 2, md: 4 },
        py: { xs: 1, sm: 2 },
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
    }}
>
      <Paper elevation={2}>
        <Box p={3}>
          <Typography variant="h4" mb={2}>
            Account Settings
          </Typography>
          <Tabs
            value={currentSection}
            onChange={handleChange}
            aria-label="Account settings sections"
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            {settingsSections.map(section => (
              <Tab
                key={section.value}
                label={section.label}
                value={section.value}
                icon={section.icon}
                iconPosition="start"
                aria-label={section.label}
              />
            ))}
          </Tabs>
          {renderSection()}
        </Box>
      </Paper>
    </Box>
  );
};

export default SettingsPage;
