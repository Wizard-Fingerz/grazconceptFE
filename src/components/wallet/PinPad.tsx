/**
 * PinPad — reusable 4-digit PIN entry component.
 *
 * Used in two contexts:
 *   1. PIN Setup   — user creates (or changes) their wallet PIN
 *   2. PIN Entry   — user enters PIN before a wallet-deducting action
 *
 * Props
 *   mode        'setup' | 'change' | 'verify'
 *   onSuccess   called with the pin string when setup/change succeeds,
 *               or with '' when verify succeeds (caller doesn't need the pin)
 *   onCancel    optional back / cancel callback
 *   title / subtitle  override default heading text
 */
import React, { useCallback, useState } from 'react';
import {
  Box, Button, CircularProgress, IconButton, Typography,
} from '@mui/material';
import ArrowBackIcon   from '@mui/icons-material/ArrowBack';
import BackspaceIcon   from '@mui/icons-material/BackspaceOutlined';
import LockIcon        from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { walletSetPin, walletVerifyPin } from '../../services/walletService';

const C = {
  brand:      '#8b2b8c',
  brandDark:  '#6d1f6e',
  brandMid:   '#a93dab',
  g0:         '#ffffff',
  g50:        '#fafafa',
  g100:       '#f4f4f5',
  g200:       '#e4e4e7',
  g300:       '#d4d4d8',
  g400:       '#a1a1aa',
  g500:       '#71717a',
  g700:       '#3f3f46',
  g900:       '#18181b',
  green:      '#16a34a',
  greenLight: '#dcfce7',
  red:        '#dc2626',
  redLight:   '#fee2e2',
} as const;

interface PinPadProps {
  mode: 'setup' | 'change' | 'verify';
  onSuccess: (pin: string) => void;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
}

type SetupStep = 'enter' | 'confirm' | 'current';

const NUM_KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

function PinDots({ value, total = 4 }: { value: string; total?: number }) {
  return (
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', my: 3 }}>
      {Array.from({ length: total }).map((_, i) => (
        <Box
          key={i}
          sx={{
            width: 18, height: 18, borderRadius: '50%',
            border: `2.5px solid ${i < value.length ? C.brand : C.g300}`,
            bgcolor: i < value.length ? C.brand : 'transparent',
            transition: 'all .15s',
            boxShadow: i < value.length ? `0 0 0 3px rgba(139,43,140,.12)` : 'none',
          }}
        />
      ))}
    </Box>
  );
}

export const PinPad: React.FC<PinPadProps> = ({
  mode, onSuccess, onCancel, title, subtitle,
}) => {
  // For 'setup': steps are current (if change) → enter → confirm
  const [step,      setStep]      = useState<SetupStep>(mode === 'change' ? 'current' : 'enter');
  const [current,   setCurrent]   = useState('');   // existing PIN (change mode)
  const [entered,   setEntered]   = useState('');   // new PIN first entry
  const [confirmed, setConfirmed] = useState('');   // new PIN confirmation
  const [verify,    setVerify]    = useState('');   // verify mode input

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Which input is active depends on mode + step
  const activeValue = mode === 'verify'
    ? verify
    : step === 'current'
      ? current
      : step === 'enter'
        ? entered
        : confirmed;

  const setActiveValue = useCallback((v: string) => {
    setError(null);
    if (mode === 'verify') { setVerify(v); return; }
    if (step === 'current') setCurrent(v);
    else if (step === 'enter') setEntered(v);
    else setConfirmed(v);
  }, [mode, step]);

  const handleKey = (key: string) => {
    if (key === '⌫') {
      setActiveValue(activeValue.slice(0, -1));
      return;
    }
    if (activeValue.length >= 4) return;
    const next = activeValue + key;
    setActiveValue(next);

    // Auto-advance when 4 digits entered
    if (next.length === 4) {
      setTimeout(() => handleComplete(next), 180);
    }
  };

  const handleComplete = async (pin: string) => {
    setError(null);

    if (mode === 'verify') {
      setLoading(true);
      try {
        await walletVerifyPin(pin);
        setSuccess(true);
        setTimeout(() => onSuccess(pin), 700);
      } catch (e: any) {
        setError(e?.response?.data?.detail ?? 'Incorrect PIN.');
        setVerify('');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Setup / change flow
    if (step === 'current') {
      // Just advance; actual check happens on submit
      setStep('enter');
      return;
    }

    if (step === 'enter') {
      setStep('confirm');
      return;
    }

    // step === 'confirm' — submit
    if (pin !== entered) {
      setError('PINs do not match. Please try again.');
      setEntered('');
      setConfirmed('');
      setStep('enter');
      return;
    }

    setLoading(true);
    try {
      await walletSetPin({
        pin: entered,
        confirm_pin: pin,
        ...(mode === 'change' ? { current_pin: current } : {}),
      });
      setSuccess(true);
      setTimeout(() => onSuccess(entered), 700);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Could not save PIN. Try again.');
      // If current PIN was wrong, restart from that step
      if (mode === 'change') {
        setCurrent(''); setEntered(''); setConfirmed('');
        setStep('current');
      } else {
        setEntered(''); setConfirmed('');
        setStep('enter');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Labels per step ─────────────────────────────────────────────────────────
  const headings: Record<string, { title: string; sub: string }> = {
    verify:  { title: title  ?? 'Enter Your PIN',         sub: subtitle ?? 'Enter your 4-digit wallet PIN to continue.' },
    current: { title: 'Enter Current PIN',                sub: 'Enter your existing PIN to proceed.' },
    enter:   { title: title  ?? (mode === 'setup' ? 'Create a PIN' : 'New PIN'), sub: subtitle ?? 'Choose a 4-digit PIN you will remember.' },
    confirm: { title: 'Confirm PIN',                      sub: 'Re-enter your PIN to confirm.' },
  };

  const key = mode === 'verify' ? 'verify' : step;
  const { title: heading, sub } = headings[key] ?? headings.verify;

  // ── Success overlay ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <Box sx={{ textAlign: 'center', py: 5, px: 3 }}>
        <Box sx={{
          width: 70, height: 70, borderRadius: '50%',
          bgcolor: C.greenLight, display: 'flex', alignItems: 'center',
          justifyContent: 'center', mx: 'auto', mb: 2,
          border: '3px solid #86efac',
        }}>
          <CheckCircleIcon sx={{ fontSize: 36, color: C.green }} />
        </Box>
        <Typography sx={{ fontSize: 16, fontWeight: 800, color: C.g900 }}>
          {mode === 'verify' ? 'PIN Verified!' : 'PIN Saved!'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: 'center', px: 2, pb: 3 }}>
      {/* Back button */}
      {onCancel && (
        <Box sx={{ display: 'flex', mb: 1 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onCancel}
            size="small"
            sx={{ color: C.g500, textTransform: 'none', fontWeight: 600, p: 0 }}
          >
            Back
          </Button>
        </Box>
      )}

      {/* Lock icon */}
      <Box sx={{
        width: 56, height: 56, borderRadius: '16px', mx: 'auto', mb: 2,
        background: `linear-gradient(135deg, ${C.brandDark} 0%, ${C.brand} 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <LockIcon sx={{ fontSize: 26, color: '#fff' }} />
      </Box>

      <Typography sx={{ fontSize: 17, fontWeight: 800, color: C.g900, mb: 0.5 }}>
        {heading}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: C.g500, mb: 0.5, lineHeight: 1.55 }}>
        {sub}
      </Typography>

      {/* Step indicator for setup/change */}
      {mode !== 'verify' && (
        <Box sx={{ display: 'flex', gap: 0.75, justifyContent: 'center', mb: 1 }}>
          {(mode === 'change' ? ['current', 'enter', 'confirm'] : ['enter', 'confirm']).map((s) => (
            <Box key={s} sx={{
              height: 3, width: 28, borderRadius: 2,
              bgcolor: step === s || (
                (s === 'enter' && (step === 'confirm' || step === 'current'))
                  ? false
                  : step === 'confirm' && s === 'enter'
              ) ? C.brand : C.g200,
              transition: 'all .2s',
            }} />
          ))}
        </Box>
      )}

      {/* PIN dots */}
      <PinDots value={activeValue} />

      {/* Error */}
      {error && (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 0.75,
          bgcolor: C.redLight, borderRadius: '10px', px: 1.5, py: 1, mb: 1.5,
          border: '1px solid #fca5a5', mx: 1,
        }}>
          <ErrorOutlineIcon sx={{ fontSize: 15, color: C.red, flexShrink: 0 }} />
          <Typography sx={{ fontSize: 12.5, color: C.red, textAlign: 'left' }}>{error}</Typography>
        </Box>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
          <CircularProgress size={22} sx={{ color: C.brand }} />
        </Box>
      )}

      {/* Numeric keypad */}
      <Box sx={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 1.25, maxWidth: 260, mx: 'auto',
      }}>
        {NUM_KEYS.map((key, idx) => {
          if (key === '') return <Box key={idx} />;
          return (
            <Box
              key={idx}
              onClick={() => !loading && key !== '' && handleKey(key)}
              sx={{
                height: 62, borderRadius: '14px', cursor: loading ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: key === '⌫' ? C.g100 : C.g50,
                border: `1.5px solid ${C.g200}`,
                transition: 'all .12s',
                opacity: loading ? 0.5 : 1,
                '&:hover': loading ? {} : {
                  bgcolor: key === '⌫' ? C.g200 : '#f0d9fb',
                  borderColor: key === '⌫' ? C.g300 : C.brand,
                },
                '&:active': { transform: 'scale(0.94)' },
              }}
            >
              {key === '⌫'
                ? <BackspaceIcon sx={{ fontSize: 20, color: C.g500 }} />
                : <Typography sx={{ fontSize: 22, fontWeight: 700, color: C.g900 }}>{key}</Typography>
              }
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default PinPad;
