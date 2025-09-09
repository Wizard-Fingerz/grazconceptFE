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
        p: 2,
        textAlign: 'center',
        borderRadius: 1,
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 4, cursor: 'pointer' },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
      }}
      onClick={onClick}
      tabIndex={0}
      role="button"
    >
      <Avatar
        sx={{
          mx: 'auto',
          mb: 1,
          width: 40,
          height: 40,
        }}
      >
        {icon}
      </Avatar>
      <Typography variant="caption" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
    </Paper>
  );