import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Stack,
  Divider,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const PROFILE_FIELDS = [
  { label: "First Name", key: "first_name" },
  { label: "Last Name", key: "last_name" },
  { label: "Email Address", key: "email" },
  { label: "Phone Number", key: "phone_number" },
  { label: "Date of Birth", key: "date_of_birth" },
  { label: "Gender", key: "gender" },
  { label: "Nationality", key: "nationality" },
  { label: "Current Address", key: "current_address" },
  { label: "Country of Residence", key: "country_of_residence" },
  // Add more fields as needed
];

function getFieldValue(user: any, key: string) {
  if (!user) return "";
  if (key === "date_of_birth") {
    return user.date_of_birth
      ? new Date(user.date_of_birth).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";
  }
  if (key === "gender" && typeof user.gender === "string") {
    return user.gender.charAt(0).toUpperCase() + user.gender.slice(1).toLowerCase();
  }
  if (key === "nationality" && typeof user.nationality === "string") {
    return user.nationality.charAt(0).toUpperCase() + user.nationality.slice(1).toLowerCase();
  }
  return user[key] ?? "";
}

function calculateProfileCompletion(user: any) {
  if (!user) return 0;
  let filled = 0;
  PROFILE_FIELDS.forEach(({ key }) => {
    const value = getFieldValue(user, key);
    if (value && value !== "") filled += 1;
  });
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          User profile data is unavailable.
        </Typography>
      </Box>
    );
  }

  const profileCompletion = calculateProfileCompletion(user);

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1400, mx: 'auto' }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          mb: 2,
        }}
      >
        <Avatar
          src={user.profile_picture}
          sx={{
            width: 96,
            height: 96,
            mb: 1,
            fontSize: 40,
            bgcolor: "primary.main",
            color: "white",
          }}
        >
          {user.first_name?.[0] || user.last_name?.[0] || ""}
        </Avatar>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
          <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: 0.5, textAlign: "center" }}>
            {user.first_name ?? ""} {user.last_name ?? ""}
          </Typography>
          <Tooltip title="Edit Profile">
            <IconButton
              aria-label="Edit Profile"
              size="small"
              sx={{ ml: 1 }}
              onClick={() => navigate("/profile/edit")}
            >
              <EditIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
        </Box>
        {user.user_type_name && (
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ textTransform: "capitalize", fontStyle: "italic", textAlign: "center" }}
          >
            {user.user_type_name}
          </Typography>
        )}
      </Box>
      <Divider sx={{ my: 3, width: "100vw" }} />
      <Box sx={{ mb: 2, width: "100vw", maxWidth: "100vw", px: { xs: 2, sm: 4 } }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Profile Completion: <b>{profileCompletion}%</b>
        </Typography>
        <LinearProgress
          variant="determinate"
          value={profileCompletion}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: "#e0e0e0",
            "& .MuiLinearProgress-bar": {
              backgroundColor: profileCompletion >= 80 ? "primary.main" : "warning.main",
            },
          }}
          color={profileCompletion >= 80 ? "primary" : "warning"}
        />
      </Box>
      {profileCompletion < 80 && (
        <Alert
          severity="warning"
          sx={{
            mb: 2,
            fontSize: 15,
            alignItems: "center",
            bgcolor: "warning.light",
            color: "warning.dark",
            width: "100vw",
            maxWidth: "100vw",
            px: { xs: 2, sm: 4 },
          }}
          icon={false}
        >
          <b>Incomplete Profile:</b> Your profile is currently <b>{profileCompletion}%</b> complete. Please update your information to reach at least 80% completion and unlock all available features.
        </Alert>
      )}
      <Stack spacing={2} sx={{ width: "100vw", maxWidth: "100vw", px: { xs: 2, sm: 4 } }}>
        {PROFILE_FIELDS.map(({ label, key }) => (
          <ProfileField
            key={key}
            label={label}
            value={getFieldValue(user, key)}
          />
        ))}
      </Stack>
    </Box>
  );
};

interface ProfileFieldProps {
  label: string;
  value?: string;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ label, value }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        py: 1,
        px: 2,
        bgcolor: "grey.50",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "grey.200",
        width: "100%",
        maxWidth: "100vw",
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: 160, fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body1"
        fontWeight={500}
        color={value ? "text.primary" : "grey.400"}
        sx={{ ml: 2 }}
      >
        {value || <span style={{ fontStyle: "italic", color: "#bdbdbd" }}>Not provided</span>}
      </Typography>
    </Box>
  );
};

export default ProfilePage;
