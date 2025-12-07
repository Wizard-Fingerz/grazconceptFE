import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Save as SaveIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  Email as EmailIcon,
  CloudUpload as CloudIcon,
} from '@mui/icons-material';

export const SystemSettings: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState({
    siteName: 'GrazConcept',
    siteUrl: 'https://grazconcept.com.ng',
    emailNotifications: true,
    smsNotifications: false,
    twoFactorAuth: true,
    maintenanceMode: false,
    currency: 'NGN',
    timezone: 'Africa/Lagos',
    dateFormat: 'DD/MM/YYYY',
  });

  const handleChange = (field: string, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Handle save logic
    console.log('Settings saved:', settings);
  };

  return (
    <Box
    sx={{
      px: { xs: 1, sm: 2, md: 4 },
      py: { xs: 1, sm: 2 },
      width: '100%',
      maxWidth: 1600,
      mx: 'auto',
    }}
  >   {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          System Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure system-wide settings and preferences
        </Typography>
      </Box>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab icon={<NotificationsIcon />} label="Notifications" />
        <Tab icon={<SecurityIcon />} label="Security" />
        <Tab icon={<PaymentIcon />} label="Payment" />
        <Tab icon={<EmailIcon />} label="Email" />
        <Tab icon={<CloudIcon />} label="General" />
      </Tabs>

      {/* Settings Content */}
      <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          {tabValue === 0 && (
            <Stack spacing={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Notification Settings
              </Typography>
              <Divider />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  />
                }
                label="Enable Email Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.smsNotifications}
                    onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                  />
                }
                label="Enable SMS Notifications"
              />
            </Stack>
          )}

          {tabValue === 1 && (
            <Stack spacing={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Security Settings
              </Typography>
              <Divider />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.twoFactorAuth}
                    onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                  />
                }
                label="Require Two-Factor Authentication"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                  />
                }
                label="Maintenance Mode"
              />
            </Stack>
          )}

          {tabValue === 2 && (
            <Stack spacing={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Payment Settings
              </Typography>
              <Divider />
              <FormControl fullWidth>
                <InputLabel>Default Currency</InputLabel>
                <Select
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  label="Default Currency"
                >
                  <MenuItem value="NGN">NGN - Nigerian Naira</MenuItem>
                  <MenuItem value="USD">USD - US Dollar</MenuItem>
                  <MenuItem value="GBP">GBP - British Pound</MenuItem>
                  <MenuItem value="EUR">EUR - Euro</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}

          {tabValue === 3 && (
            <Stack spacing={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Email Settings
              </Typography>
              <Divider />
              <TextField
                fullWidth
                label="SMTP Host"
                defaultValue="smtp.gmail.com"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="SMTP Port"
                defaultValue="587"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Email Address"
                defaultValue="noreply@grazconcept.com.ng"
                variant="outlined"
              />
            </Stack>
          )}

          {tabValue === 4 && (
            <Stack spacing={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                General Settings
              </Typography>
              <Divider />
              {/* Use flexbox for two-column layout instead of deprecated Grid */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 3,
                }}
              >
                <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                  <TextField
                    fullWidth
                    label="Site Name"
                    value={settings.siteName}
                    onChange={(e) => handleChange('siteName', e.target.value)}
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                  <TextField
                    fullWidth
                    label="Site URL"
                    value={settings.siteUrl}
                    onChange={(e) => handleChange('siteUrl', e.target.value)}
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={settings.timezone}
                      onChange={(e) => handleChange('timezone', e.target.value)}
                      label="Timezone"
                    >
                      <MenuItem value="Africa/Lagos">Africa/Lagos</MenuItem>
                      <MenuItem value="UTC">UTC</MenuItem>
                      <MenuItem value="America/New_York">America/New_York</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                  <FormControl fullWidth>
                    <InputLabel>Date Format</InputLabel>
                    <Select
                      value={settings.dateFormat}
                      onChange={(e) => handleChange('dateFormat', e.target.value)}
                      label="Date Format"
                    >
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Stack>
          )}

          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              size="large"
            >
              Save Settings
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SystemSettings;

