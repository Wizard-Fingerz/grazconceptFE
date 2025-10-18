import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  // Divider,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// import GoogleIcon from '@mui/icons-material/Google';
// import FacebookIcon from '@mui/icons-material/Facebook';
// import LinkedInIcon from '@mui/icons-material/LinkedIn';

interface LoginFormData {
  email: string;
  password: string;
}

export const Login: React.FC = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      const isAgent = typeof user?.user_type_name === 'string' && user.user_type_name.toLowerCase() === 'agent';
      navigate(isAgent ? '/staff/dashboard' : '/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(formData.email, formData.password);
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  //   const socialButtons = [
  //   { name: 'Google', icon: <GoogleIcon /> },
  //   { name: 'Facebook', icon: <FacebookIcon /> },
  //   { name: 'LinkedIn', icon: <LinkedInIcon /> },
  // ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#fff',
        px: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: 400,
          textAlign: 'center',
        }}
      >
        {/* Grazconcept Welcome Messaging */}
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mt: 6 }}>
          Welcome to Grazconcept
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={6} sx={{ fontSize: '1.15rem', fontWeight: 500 }}>
          A one-stop multifunctional hub
        </Typography>
        
        {/* <Typography variant="h5" fontWeight="bold" gutterBottom>
          Sign In
        </Typography> */}
        <Typography variant="body2" color="text.secondary" mb={3}>
          Welcome back, Please sign in with your credentials
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          size='small'
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          InputProps={{
            sx: { borderRadius: 2 },
          }}
        />

        <TextField
          fullWidth
          size='small'
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          margin="normal"
          InputProps={{
            sx: { borderRadius: 2 },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box textAlign="left" mb={2}>
          <Link
            component="button"
            type="button"
            underline="hover"
            sx={{ fontSize: 14 }}
            onClick={() => navigate('/forgot-password')}
          >
            Forget Password?
          </Link>
        </Box>

        <Button
          type="submit"
          fullWidth
          sx={{
            borderRadius: 5,
            py: 1.5,
            mb: 2,
            background:
              'linear-gradient(90deg, rgba(182,106,237,1) 0%, rgba(255,174,73,1) 100%)',
            color: '#fff',
            fontWeight: 'bold',
            textTransform: 'none',
            '&:hover': {
              background:
                'linear-gradient(90deg, rgba(172,96,227,1) 0%, rgba(245,164,63,1) 100%)',
            },
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Submit'}
        </Button>

        <Typography variant="body2" mb={3}>
          Don’t have an account?{' '}
          <Link
            component="button"
            onClick={() => navigate('/register')}
            underline="hover"
            fontWeight="bold"
          >
            Sign Up
          </Link>
        </Typography>

        {/* <Divider sx={{ my: 2 }}>Or</Divider> */}

      
{/* {socialButtons.map(({ name, icon }) => (
  <Button
    key={name}
    fullWidth
    startIcon={icon}
    sx={{
      mb: 2,
      borderRadius: 5,
      py: 1.5,
      background:
        'linear-gradient(90deg, rgba(182,106,237,1) 0%, rgba(255,174,73,1) 100%)',
      color: '#fff',
      fontWeight: 'bold',
      textTransform: 'none',
      '&:hover': {
        background:
          'linear-gradient(90deg, rgba(172,96,227,1) 0%, rgba(245,164,63,1) 100%)',
      },
    }}
  >
    Continue with {name}
  </Button>
))} */}
      </Box>
    </Box>
  );
};
