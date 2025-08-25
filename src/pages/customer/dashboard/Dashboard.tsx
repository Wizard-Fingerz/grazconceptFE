import React from 'react';
// import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  useTheme,
  useMediaQuery,
  Paper,
  Box,
  Stack,
} from "@mui/material";
import { Chat, Call, AirplaneTicket, Hotel, School, Savings } from "@mui/icons-material";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  // const navigate = useNavigate();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1400, mx: 'auto' }}>
      {/* Welcome Header */}
      <Paper
        sx={{
          backgroundColor: theme.palette.secondary.light,
          p: { xs: 2, sm: 4 },
          mb: 3,
          borderRadius: 0,
        }}
        elevation={0}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Welcome, {user?.first_name}!
        </Typography>
      </Paper>

      {/* Top Section */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        sx={{ mb: 2 }}
      >
        {/* Wallet Section */}
        <Box
          sx={{
            flex: { xs: 'unset', sm: '0 0 41.6667%', md: '0 0 25%' },
            width: { xs: '100%', sm: '41.6667%', md: '25%' },
            minWidth: 0,
          }}
        >
          <Card sx={{ borderRadius: 1, boxShadow: 2, bgcolor: 'white', height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Avatar sx={{ bgcolor: "#f43f5e" }}>A</Avatar>
                <Typography variant="subtitle2" color="text.secondary">
                  Fund wallet
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ mt: 3, fontWeight: 700 }}>
                Travel Wallet
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#1a1a1a" }}>
                ₦125,000.00
              </Typography>
              <Box mt={4}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Recent Transactions
                </Typography>
                <Box display="flex" justifyContent="space-between" fontSize="0.95rem" mt={1}>
                  <span>Flight to Accra</span>
                  <span>#25.00</span>
                </Box>
                <Box display="flex" justifyContent="space-between" fontSize="0.95rem">
                  <span>Saving deposit</span>
                  <span>#25.00</span>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Quick Actions */}
        <Box
          sx={{
            flex: { xs: 'unset', sm: '0 0 58.3333%', md: '0 0 75%' },
            width: { xs: '100%', sm: '58.3333%', md: '75%' },
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(3, 1fr)', // 4 columns on mobile
                sm: 'repeat(3, 1fr)', // 3 columns on small screens
                md: 'repeat(6, 1fr)', // 6 columns on medium and up
              },
              gap: 1.5,
            }}
          >
            <ActionCard icon={<AirplaneTicket />} label="Book Flight" />
            <ActionCard icon={<Hotel />} label="Reserve Hotel" />
            <ActionCard icon={<School />} label="Apply for Visa" />
            <ActionCard icon={<Chat />} label="Chat with Agent" />
            <ActionCard icon={<Savings />} label="Create Savings Plan" />
            <ActionCard icon={<School />} label="Apply for Study Loan" />
          </Box>
        </Box>
      </Stack>

      {/* Applications */}
      <Typography variant="h6" sx={{ mt: 6, mb: 2, fontWeight: 700 }}>
        Start a New Application
      </Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        sx={{ mb: 2 }}
      >
        <Box sx={{ flex: 1 }}>
          <ImageCard title="Summer in London 20% Off" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <ImageCard title="Apply for Study Visa" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <ImageCard title="Apply for Vacation Visa" />
        </Box>
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        sx={{
          mt: 2,
        }}
      >
        {/* Left: More Actions and Suggestions */}
        <Box sx={{ flex: { xs: 'unset', md: 3 }, width: { xs: '100%', md: '75%' }, minWidth: 0 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <ActionCard icon={<Chat />} label="Study Abroad Loan" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <ActionCard icon={<Savings />} label="Pilgrimage Package" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <ActionCard icon={<School />} label="Business Loan for Travel Project" />
            </Box>
          </Stack>

          <Box>
            {/* Suggestions */}
            <Typography variant="h6" sx={{ mt: 6, mb: 2, fontWeight: 700 }}>
              You may be interested in?
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <SuggestionCard title="Study Abroad Loan" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <SuggestionCard title="Business loan for travel project" />
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* Right: Help Section */}
        <Box
          sx={{
            flex: { xs: 'unset', md: 1 },
            width: { xs: '100%', md: 240 },
            minWidth: 0,
            mt: { xs: 3, md: 0 },
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 1,
              width: { xs: '100%', md: 240 },
              minWidth: 0,
              height: '100%',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Need Help?
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <HelpButton text="Chat" />
              <HelpButton text="Call" />
              <HelpButton text="Raise Ticket" />
            </Box>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};

/* Reusable Components */
const ActionCard = ({ icon, label }: { icon: any; label: string }) => (
  <Paper
    key={label}
    elevation={1}
    variant="outlined"
    sx={{
      p: 2,
      textAlign: 'center',
      borderRadius: 1,
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: 4 },
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 100,
    }}
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

const ImageCard = ({ title }: { title: string }) => (
  <Card
    sx={{
      borderRadius: 1,
      overflow: 'hidden',
      boxShadow: 2,
      cursor: 'pointer',
      height: { xs: 120, sm: 140, md: 150 },
      display: 'flex',
      alignItems: 'stretch',
    }}
  >
    <CardContent
      sx={{
        height: '100%',
        width: '100%',
        minHeight: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url('https://source.unsplash.com/400x200/?airplane,travel')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
        p: 0,
      }}
    >
      {title}
    </CardContent>
  </Card>
);

const SuggestionCard = ({ title }: { title: string }) => (
  <Card
    sx={{
      borderRadius: 1,
      boxShadow: 1,
      px: 3,
      py: 2,
      cursor: 'pointer',
      bgcolor: '#fdf2f8',
      '&:hover': { bgcolor: '#fce7f3' },
      transition: 'background 0.2s',
    }}
  >
    <Typography variant="body2" sx={{ fontWeight: 600, color: 'rgb(219 39 119)' }}>
      {title}
    </Typography>
  </Card>
);

const HelpButton = ({ text }: { text: string }) => (
  <Button
    variant="outlined"
    sx={{
      borderRadius: 1,
      display: 'flex',
      justifyContent: 'space-between',
      px: 2,
      py: 1,
      textTransform: 'none',
      borderColor: 'grey.300',
      fontWeight: 500,
      fontSize: { xs: '0.95rem', sm: '1rem' },
    }}
    fullWidth
  >
    {text} <span style={{ marginLeft: 'auto' }}> &gt; </span>
  </Button>
);