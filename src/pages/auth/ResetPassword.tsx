import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  LockReset as LockResetIcon,
  Visibility,
  VisibilityOff,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

/**
 * ResetPassword page
 *
 * Mounted at:  /reset-password/:uid/:token
 *
 * The backend sends links in the form:
 *   {FRONTEND_URL}/reset-password/{user.pk}/{token}/
 *
 * This page reads uid + token from URL params, lets the user pick a new
 * password, then POST /api/users/password/reset/confirm/ to set it.
 */
export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { uid, token } = useParams<{ uid: string; token: string }>();

  const [password,  setPassword]  = useState('');
  const [password2, setPassword2] = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [showPw2,   setShowPw2]   = useState(false);

  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const passwordsMatch = password2 === '' || password === password2;
  const strongEnough   = password.length >= 8;
  const canSubmit      = !!uid && !!token && strongEnough && password === password2 && !loading && !success;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      await api.post('/users/password/reset/confirm/', {
        uid,
        token,
        new_password:  password,
        new_password2: password2,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      const d = err?.response?.data;
      setError(d?.detail ?? 'This reset link is invalid or has expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  // Missing params — show a helpful message instead of a broken form
  if (!uid || !token) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="h6" color="error">Invalid Reset Link</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              This password-reset link is missing required information.
              Please click the link directly from your email.
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/forgot-password')}>
              Request a new link
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 420 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>

            {/* Header */}
            <Box textAlign="center">
              <Box
                sx={{
                  width: 56, height: 56, borderRadius: '16px',
                  background: 'linear-gradient(135deg, #8B2B8C 0%, #6a1b6b 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mx: 'auto', mb: 1.5,
                }}
              >
                <LockResetIcon sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
              <Typography variant="h5" fontWeight={800} gutterBottom>
                Set New Password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a strong password for your account.
              </Typography>
            </Box>

            {/* Alerts */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}{' '}
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => navigate('/forgot-password')}
                >
                  Request a new link
                </Link>
              </Alert>
            )}

            {success && (
              <Alert
                severity="success"
                icon={<CheckCircleIcon />}
              >
                Password updated! Redirecting to login…
              </Alert>
            )}

            {/* New password */}
            <TextField
              fullWidth
              size="small"
              label="New Password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading || success}
              helperText={password.length > 0 && !strongEnough ? 'Minimum 8 characters' : ' '}
              error={password.length > 0 && !strongEnough}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                      {showPw ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Confirm password */}
            <TextField
              fullWidth
              size="small"
              label="Confirm Password"
              type={showPw2 ? 'text' : 'password'}
              value={password2}
              onChange={e => setPassword2(e.target.value)}
              disabled={loading || success}
              helperText={!passwordsMatch ? 'Passwords do not match' : ' '}
              error={!passwordsMatch}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPw2(v => !v)} tabIndex={-1}>
                      {showPw2 ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Submit */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={!canSubmit}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LockResetIcon />}
              sx={{
                background: 'linear-gradient(135deg, #8B2B8C 0%, #6a1b6b 100%)',
                borderRadius: '10px',
                py: 1.4,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: 15,
                '&:hover': { background: 'linear-gradient(135deg, #7a2580 0%, #5e175f 100%)' },
              }}
            >
              {loading ? 'Updating…' : 'Update Password'}
            </Button>

            {/* Back to login */}
            <Stack direction="row" justifyContent="center">
              <Typography variant="body2" color="text.secondary">
                Remember your password?{' '}
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => navigate('/login')}
                  sx={{ color: '#8B2B8C', fontWeight: 600 }}
                >
                  Sign in
                </Link>
              </Typography>
            </Stack>

          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default ResetPassword;
