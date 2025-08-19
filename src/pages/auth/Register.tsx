import React, { useEffect, useState } from 'react';
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
  MenuItem,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonAdd as RegisterIcon,
  Facebook,
  LinkedIn
} from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import userServices from '../../services/user';

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: 'customer' | 'agent';
}

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userTypes, setUserTypes] = useState<any[]>([]);

  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'customer',
  });



  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userTypes] = await Promise.all([

          userServices.getAllUserType(),

        ]);

        setUserTypes(userTypes.results || []);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSelectChange = (event: any) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value as 'customer' | 'agent',
    }));
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;

    // Split fullName into firstName and lastName
    const [firstName, lastName = ''] = formData.fullName.trim().split(/\s+/, 2);

    setLoading(true);
    try {
      await register(
        formData.email,
        formData.password,
        formData.confirmPassword,
        firstName,
        lastName,
        formData.userType
      );
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const socialButtons = [
    { name: 'Google', icon: <GoogleIcon /> },
    { name: 'Facebook', icon: <Facebook /> },
    { name: 'LinkedIn', icon: <LinkedIn /> },
  ];

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
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Create Account
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Join our learning community today
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TextField
          required
          fullWidth
          size='small'
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          autoComplete="name"
        />

        <TextField
          fullWidth
          label="Email Address"
          name="email"
          size='small'
          type="email"
          value={formData.email}
          onChange={handleChange}
          sx={{ mt: 2 }}
        />
        <TextField
          select
          size="small"
          fullWidth
          label="Account Type"
          name="userType"
          value={formData.userType}
          onChange={handleSelectChange}
          sx={{ mt: 2 }}
        >
          {userTypes.map(type => (
            <MenuItem key={type.id} value={type.id}> {/* ✅ use ID */}
              {type.term}
            </MenuItem>
          ))}
        </TextField>



        <TextField
          fullWidth
          label="Password"
          size='small'
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          sx={{ mt: 2 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Confirm Password"
          size='small'
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange}
          sx={{ mt: 2 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          fullWidth
          sx={{
            borderRadius: 5,
            py: 1.5,
            mt: 3,
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
          startIcon={loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <RegisterIcon />}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <Typography variant="body2" mb={3}>
          Already have an account?{' '}
          <Link
            component="button"
            onClick={() => navigate('/login')}
            underline="hover"
            fontWeight="bold"
          >
            Sign In
          </Link>
        </Typography>

        <Divider sx={{ my: 2 }}>Or</Divider>

        {socialButtons.map(({ name, icon }) => (
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
        ))}
      </Box>
    </Box>
  );
};
