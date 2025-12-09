// import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Avatar,
  Paper,
} from "@mui/material";





/* Reusable Components */
export const ActionCard = ({
  icon,
  label,
  onClick,
}: {
  icon: any;
  label: string;
  onClick?: () => void;
}) => (
  <Paper
    key={label}
    elevation={1}
    variant="outlined"
    sx={{
      p: { xs: 0.7, sm: 1.5 }, // slightly smaller padding on desktop
      textAlign: 'center',
      borderRadius: 1,
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: 4, cursor: 'pointer' },
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: { xs: 54, sm: 85 }, // reduced minHeight on desktop
    }}
    onClick={onClick}
    tabIndex={0}
    role="button"
  >
    <Avatar
      sx={{
        mx: 'auto',
        mb: { xs: 0.5, sm: 0.8 },
        width: { xs: 24, sm: 32 },   // reduced icon size on desktop
        height: { xs: 24, sm: 32 },
      }}
    >
      {/* Pass a cloned icon with reduced fontSize for desktop */}
      {icon}
    </Avatar>
    <Typography
      variant="caption"
      sx={{
        fontWeight: 500,
        fontSize: { xs: '0.62rem', sm: '0.74rem' } // reduced text size on desktop
      }}
    >
      {label}
    </Typography>
  </Paper>
);