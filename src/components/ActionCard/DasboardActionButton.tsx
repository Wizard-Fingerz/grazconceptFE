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
      p: { xs: 1, sm: 2 }, // smaller padding on mobile
      textAlign: 'center',
      borderRadius: 1,
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: 4, cursor: 'pointer' },
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: { xs: 68, sm: 100 }, // shorter on mobile
    }}
    onClick={onClick}
    tabIndex={0}
    role="button"
  >
    <Avatar
      sx={{
        mx: 'auto',
        mb: { xs: 0.5, sm: 1 },
        width: { xs: 28, sm: 40 },    // smaller avatar on mobile
        height: { xs: 28, sm: 40 },
      }}
    >
      {icon}
    </Avatar>
    <Typography
      variant="caption"
      sx={{
        fontWeight: 500,
        fontSize: { xs: '0.72rem', sm: '0.85rem' } // smaller text on mobile
      }}
    >
      {label}
    </Typography>
  </Paper>
);