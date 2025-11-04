import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import SecurityIcon from "@mui/icons-material/Security";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import NotificationSettingsPage from "../Notifications";
import ProfilePage from "../../../auth/ProfilePage";

// Dummy password update function, replace with real API
async function changePassword({
  oldPassword,
  newPassword,
}: {
  oldPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> {
  // Simulate backend request
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Example validation
  if (oldPassword !== "correct_password") {
    return { success: false, message: "Incorrect current password." };
  }
  if (newPassword.length < 8) {
    return {
      success: false,
      message: "New password must be at least 8 characters.",
    };
  }
  return { success: true, message: "Password changed successfully." };
}

const settingsSections = [
  {
    label: "Profile",
    value: "profile",
    icon: <SettingsIcon />,
    description: "Update your personal information.",
  },
  {
    label: "Notifications",
    value: "notifications",
    icon: <NotificationsIcon />,
    description: "Manage notification preferences and view messages.",
  },
  {
    label: "Security",
    value: "security",
    icon: <SecurityIcon />,
    description: "Change password, two-factor authentication, etc.",
  },
];

const SecuritySettings: React.FC = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<null | { success: boolean; message: string }>(null);

  const canSubmit =
    !loading &&
    !!oldPassword &&
    !!newPassword &&
    !!confirmNewPassword &&
    newPassword === confirmNewPassword &&
    newPassword.length >= 8;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);
    // Replace this call with your real API logic
    const result = await changePassword({
      oldPassword,
      newPassword,
    });
    setLoading(false);
    setFeedback(result);
    if (result.success) {
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  };

  return (
    <Box mt={2}>
      <Typography variant="h6" gutterBottom>
        Security Settings
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Update your password here. Make sure your new password is strong and secure.
      </Typography>
      <form onSubmit={handlePasswordChange} autoComplete="off">
        <Box display="flex" flexDirection="column" gap={2} maxWidth={400} mb={2}>
          <TextField
            type={showOld ? "text" : "password"}
            label="Current Password"
            required
            fullWidth
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle current password visibility"
                    onClick={() => setShowOld((v) => !v)}
                    edge="end"
                  >
                    {showOld ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            type={showNew ? "text" : "password"}
            label="New Password"
            required
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="Must be at least 8 characters."
            inputProps={{ minLength: 8 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle new password visibility"
                    onClick={() => setShowNew((v) => !v)}
                    edge="end"
                  >
                    {showNew ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            type={showConfirm ? "text" : "password"}
            label="Confirm New Password"
            required
            fullWidth
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            error={!!confirmNewPassword && newPassword !== confirmNewPassword}
            helperText={
              !!confirmNewPassword && newPassword !== confirmNewPassword
                ? "Passwords do not match"
                : ""
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm new password visibility"
                    onClick={() => setShowConfirm((v) => !v)}
                    edge="end"
                  >
                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!canSubmit}
          fullWidth
        >
          {loading ? "Changing Password..." : "Change Password"}
        </Button>
        {feedback && (
          <Alert
            severity={feedback.success ? "success" : "error"}
            sx={{ mt: 2 }}
          >
            {feedback.message}
          </Alert>
        )}
      </form>
      {/* Additional future 2FA controls could be placed here */}
    </Box>
  );
};

const SettingsPage: React.FC = () => {
  const [currentSection, setCurrentSection] = React.useState<string>("profile");

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
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
        return <SecuritySettings />;
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
            {settingsSections.map((section) => (
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
