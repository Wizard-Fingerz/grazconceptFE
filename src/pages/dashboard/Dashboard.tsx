import React from 'react';
// import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Container,
  useTheme,
  useMediaQuery,
  Alert,
} from '@mui/material';


export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  // const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


  // Prepare data for charts


  // Simulate exam performance over time (replace with real data if available)

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        {/* Welcome Section */}
        <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
          >
            <Box>
              <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
                Welcome back, {user?.first_name}!
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Alert severity="info" sx={{ mb: 3 }}>
          Your username is: {user?.username}
        </Alert>


       
   
       
      </Box>
    </Container>
  );
};