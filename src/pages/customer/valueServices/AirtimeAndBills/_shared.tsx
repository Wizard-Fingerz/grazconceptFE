/**
 * _shared.tsx — Bills & Value Services shared design system
 * Brand tokens, reusable UI primitives, and layout components.
 */

import React, { useRef, useState } from 'react';
import {
  Box, Button, CircularProgress, Dialog, DialogContent,
  Slide, Typography,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';

/* ─── Brand & neutral tokens ─────────────────────────────────────────────── */
export const C = {
  brand:      '#8b2b8c',
  brandDark:  '#6d1f6e',
  brandMid:   '#a93dab',
  brandXs:    '#f9f0fe',
  brandSm:    '#f0d9fb',
  brandMd:    '#e4b8f5',
  g0:   '#ffffff',
  g50:  '#fafafa',
  g100: '#f4f4f5',
  g200: '#e4e4e7',
  g300: '#d4d4d8',
  g400: '#a1a1aa',
  g500: '#71717a',
  g700: '#3f3f46',
  g900: '#18181b',
  green:       '#16a34a',
  greenLight:  '#dcfce7',
  greenBorder: '#86efac',
  amber:       '#d97706',
  amberLight:  '#fef3c7',
  red:         '#dc2626',
  redLight:    '#fee2e2',
} as const;

/* ─── MUI input field base style ─────────────────────────────────────────── */
export const SX_FIELD = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: C.g0,
    '& fieldset': { borderColor: C.g200, borderWidth: 1.5 },
    '&:hover fieldset': { borderColor: C.g300 },
    '&.Mui-focused fieldset': { borderColor: C.brand, borderWidth: 2 },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: C.brand },
} as const;

/* ─── SlideUp transition (used by mobile receipt) ────────────────────────── */
export const SlideUp = React.forwardRef(function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/* ─── generateRef ────────────────────────────────────────────────────────── */
export function generateRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let r = 'GRZ';
  for (let i = 0; i < 8; i++) r += chars[Math.floor(Math.random() * chars.length)];
  return r;
}

/* ─── SectionLabel ───────────────────────────────────────────────────────── */
export const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography sx={{
    fontSize: 11, fontWeight: 700, color: C.g500,
    textTransform: 'uppercase', letterSpacing: '.7px', mb: 1,
  }}>
    {children}
  </Typography>
);

/* ─── ErrorAlert ─────────────────────────────────────────────────────────── */
export const ErrorAlert: React.FC<{ message: string | null }> = ({ message }) => {
  if (!message) return null;
  return (
    <Box sx={{
      bgcolor: C.redLight, border: `1px solid #fca5a5`,
      borderRadius: '12px', p: '11px 14px', mb: 2,
      fontSize: 13, color: C.red, lineHeight: 1.6,
    }}>
      ⚠ {message}
    </Box>
  );
};

/* ─── SuccessAlert ───────────────────────────────────────────────────────── */
export const SuccessAlert: React.FC<{ message: string | null }> = ({ message }) => {
  if (!message) return null;
  return (
    <Box sx={{
      bgcolor: C.greenLight, border: `1px solid ${C.greenBorder}`,
      borderRadius: '12px', p: '11px 14px', mb: 2,
      fontSize: 13, color: C.green, lineHeight: 1.6,
    }}>
      ✅ {message}
    </Box>
  );
};

/* ─── FormCard ───────────────────────────────────────────────────────────── */
interface FormCardProps {
  icon: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}
export const FormCard: React.FC<FormCardProps> = ({ icon, iconBg, title, subtitle, children }) => (
  <Box sx={{
    bgcolor: C.g0, border: `1.5px solid ${C.g200}`,
    borderRadius: '20px', overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,.06)',
  }}>
    {/* Card header */}
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.5,
      px: 2.5, py: 2, borderBottom: `1px solid ${C.g100}`,
    }}>
      <Box sx={{
        width: 42, height: 42, borderRadius: '12px', bgcolor: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0,
      }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: 15, fontWeight: 800, color: C.g900, lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: 11.5, color: C.g400, mt: .25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
    {/* Card body */}
    <Box sx={{ px: 2.5, py: 2.5 }}>{children}</Box>
  </Box>
);

/* ─── ProviderBtn ────────────────────────────────────────────────────────── */
interface ProviderBtnProps {
  logo?: string;
  initial: string;
  initBg: string;
  initColor: string;
  name: string;
  selected: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}
export const ProviderBtn: React.FC<ProviderBtnProps> = ({
  logo, initial, initBg, initColor, name, selected, loading = false, disabled = false, onClick,
}) => (
  <Box
    onClick={disabled || loading ? undefined : onClick}
    sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: .6,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .5 : 1,
      minWidth: 60,
    }}
  >
    <Box sx={{
      width: 54, height: 54, borderRadius: '50%', position: 'relative',
      border: `2.5px solid ${selected ? C.brand : C.g200}`,
      boxShadow: selected ? `0 0 0 3px rgba(139,43,140,.15)` : 'none',
      overflow: 'hidden', transition: 'all .18s',
      bgcolor: logo ? C.g0 : initBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {loading ? (
        <CircularProgress size={20} sx={{ color: C.brand }} />
      ) : logo ? (
        <Box
          component="img"
          src={logo}
          alt={name}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <Typography sx={{ fontSize: 17, fontWeight: 900, color: initColor, lineHeight: 1 }}>
          {initial}
        </Typography>
      )}
    </Box>
    <Typography sx={{
      fontSize: 10.5, fontWeight: selected ? 700 : 500,
      color: selected ? C.brandDark : C.g500,
      textAlign: 'center', lineHeight: 1.3, maxWidth: 64,
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    }}>
      {name}
    </Typography>
  </Box>
);

/* ─── AmountDisplay ──────────────────────────────────────────────────────── */
interface AmountDisplayProps {
  value: number;
  onChange: (v: number) => void;
  quickAmounts: number[];
  label?: string;
  min?: number;
  max?: number;
}
export const AmountDisplay: React.FC<AmountDisplayProps> = ({
  value, onChange, quickAmounts, label = 'Amount', min, max,
}) => {
  const [custom, setCustom] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleQuick = (amt: number) => {
    setCustom(false);
    onChange(amt);
  };

  return (
    <Box sx={{ mb: 2.5 }}>
      {label && <SectionLabel>{label}</SectionLabel>}

      {/* Big amount display */}
      <Box sx={{
        bgcolor: C.brandXs, border: `1.5px solid ${C.brandSm}`,
        borderRadius: '16px', p: '16px 20px', mb: 1.5, textAlign: 'center',
      }}>
        {custom ? (
          <Box
            component="input"
            ref={inputRef}
            type="number"
            value={value || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const v = Number(e.target.value.replace(/^0+/, ''));
              onChange(isNaN(v) ? 0 : v);
            }}
            placeholder="Enter amount"
            style={{
              width: '100%', border: 'none', background: 'transparent', outline: 'none',
              textAlign: 'center', fontSize: 32, fontWeight: 900,
              color: C.brandDark, fontFamily: 'inherit',
            }}
          />
        ) : (
          <Typography
            onClick={() => { setCustom(true); setTimeout(() => inputRef.current?.focus(), 50); }}
            sx={{
              fontSize: value ? 32 : 20, fontWeight: 900,
              color: value ? C.brandDark : C.g300,
              cursor: 'text', letterSpacing: '-.5px', lineHeight: 1.2,
            }}
          >
            {value ? `₦${value.toLocaleString()}` : 'Tap to enter amount'}
          </Typography>
        )}
        {(min || max) && (
          <Typography sx={{ fontSize: 11, color: C.g400, mt: .5 }}>
            {min ? `Min ₦${min.toLocaleString()}` : ''}
            {min && max ? ' · ' : ''}
            {max ? `Max ₦${max.toLocaleString()}` : ''}
          </Typography>
        )}
      </Box>

      {/* Quick amount chips */}
      <Box sx={{ display: 'flex', gap: .75, flexWrap: 'wrap' }}>
        {quickAmounts.map(amt => (
          <Box
            key={amt}
            onClick={() => handleQuick(amt)}
            sx={{
              px: 1.5, py: .6, borderRadius: '20px', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, transition: 'all .15s',
              border: `1.5px solid ${value === amt ? C.brand : C.g200}`,
              bgcolor: value === amt ? C.brandXs : C.g0,
              color: value === amt ? C.brand : C.g700,
              '&:hover': { borderColor: C.brand, color: C.brand, bgcolor: C.brandXs },
            }}
          >
            ₦{amt.toLocaleString()}
          </Box>
        ))}
        <Box
          onClick={() => { setCustom(true); setTimeout(() => inputRef.current?.focus(), 50); }}
          sx={{
            px: 1.5, py: .6, borderRadius: '20px', cursor: 'pointer',
            fontSize: 12, fontWeight: 700, transition: 'all .15s',
            border: `1.5px solid ${custom ? C.brand : C.g200}`,
            bgcolor: custom ? C.brandXs : C.g0,
            color: custom ? C.brand : C.g500,
            '&:hover': { borderColor: C.brand, color: C.brand },
          }}
        >
          Other
        </Box>
      </Box>
    </Box>
  );
};

/* ─── SummaryPanel ───────────────────────────────────────────────────────── */
interface SummaryRow { key: string; value: string; accent?: boolean; mono?: boolean }
interface SummaryPanelProps {
  title: string;
  displayAmt: string;
  rows: SummaryRow[];
  trustBadges?: string[];
}
export const SummaryPanel: React.FC<SummaryPanelProps> = ({ title, displayAmt, rows, trustBadges }) => (
  <Box sx={{
    bgcolor: C.g0, border: `1.5px solid ${C.g200}`,
    borderRadius: '20px', overflow: 'hidden', position: 'sticky', top: 80,
    boxShadow: '0 1px 4px rgba(0,0,0,.06)',
  }}>
    {/* Gradient header */}
    <Box sx={{
      background: `linear-gradient(135deg, ${C.brandDark} 0%, ${C.brand} 60%, ${C.brandMid} 100%)`,
      px: 2.5, py: 2.5, position: 'relative', overflow: 'hidden',
    }}>
      <Box sx={{
        position: 'absolute', width: 120, height: 120, borderRadius: '50%',
        bgcolor: 'rgba(255,255,255,.07)', top: -30, right: -30, pointerEvents: 'none',
      }} />
      <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,.65)', fontWeight: 600, mb: .4, textTransform: 'uppercase', letterSpacing: '.5px' }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1.1 }}>
        ₦{displayAmt}
      </Typography>
    </Box>

    {/* Rows */}
    <Box sx={{ px: 2.5, py: 2 }}>
      {rows.map((r, i) => (
        <Box key={i} sx={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          py: .9, borderBottom: i < rows.length - 1 ? `1px solid ${C.g100}` : 'none', gap: 1,
        }}>
          <Typography sx={{ fontSize: 12, color: C.g400, flexShrink: 0 }}>{r.key}</Typography>
          <Typography sx={{
            fontSize: 12, fontWeight: 700, textAlign: 'right',
            color: r.accent ? C.green : C.g900,
            fontFamily: r.mono ? 'monospace' : 'inherit',
            wordBreak: 'break-all',
          }}>
            {r.value}
          </Typography>
        </Box>
      ))}
    </Box>

    {/* Trust badges */}
    {trustBadges && trustBadges.length > 0 && (
      <Box sx={{
        px: 2.5, pb: 2, display: 'flex', flexWrap: 'wrap', gap: .75,
        borderTop: `1px solid ${C.g100}`, pt: 1.5,
      }}>
        {trustBadges.map(b => (
          <Box key={b} sx={{
            fontSize: 10.5, fontWeight: 600, color: C.g500,
            bgcolor: C.g100, borderRadius: '8px', px: 1, py: .4,
          }}>
            {b}
          </Box>
        ))}
      </Box>
    )}
  </Box>
);

/* ─── SplitLayout ────────────────────────────────────────────────────────── */
interface SplitLayoutProps { form: React.ReactNode; summary: React.ReactNode }
export const SplitLayout: React.FC<SplitLayoutProps> = ({ form, summary }) => (
  <Box sx={{
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 340px' },
    gap: 2.5,
    alignItems: 'start',
    py: 1,
  }}>
    <Box>{form}</Box>
    <Box sx={{ display: { xs: 'none', md: 'block' } }}>{summary}</Box>
  </Box>
);

/* ─── BillCtaButton ──────────────────────────────────────────────────────── */
interface BillCtaButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}
export const BillCtaButton: React.FC<BillCtaButtonProps> = ({ children, disabled, loading, onClick }) => (
  <Box>
    <Button
      type={onClick ? 'button' : 'submit'}
      fullWidth
      onClick={onClick}
      disabled={disabled || loading}
      sx={{
        mt: .5, py: 1.6, borderRadius: '14px', fontSize: 14.5, fontWeight: 800,
        textTransform: 'none',
        background: disabled || loading
          ? C.g200
          : `linear-gradient(135deg, ${C.brandDark} 0%, ${C.brand} 100%)`,
        color: disabled || loading ? C.g400 : '#fff',
        boxShadow: disabled || loading ? 'none' : `0 6px 20px rgba(139,43,140,.35)`,
        '&:hover': {
          bgcolor: C.brandDark,
          boxShadow: disabled || loading ? 'none' : `0 8px 24px rgba(139,43,140,.45)`,
        },
        transition: 'all .18s',
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={18} sx={{ color: C.g400 }} />
          Processing…
        </Box>
      ) : children}
    </Button>
    <Typography sx={{
      fontSize: 11, color: C.g400, textAlign: 'center', mt: 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: .5,
    }}>
      🔒 Secured · Encrypted · Instant
    </Typography>
  </Box>
);

/* ─── BillReceiptDialog ──────────────────────────────────────────────────── */
interface ReceiptRow { key: string; value: string; mono?: boolean }
interface BillReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  onNew: () => void;
  amount: number;
  title: string;
  subtitle?: string;
  rows: ReceiptRow[];
}
export const BillReceiptDialog: React.FC<BillReceiptDialogProps> = ({
  open, onClose, onNew, amount, title, subtitle, rows,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    TransitionComponent={SlideUp}
    fullScreen={false}
    maxWidth="xs"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: { xs: '20px 20px 0 0', sm: '20px' },
        mx: { xs: 0, sm: 2 },
        mt: { xs: 'auto', sm: 'auto' },
        mb: { xs: 0, sm: 'auto' },
        overflow: 'hidden',
      },
    }}
    sx={{ alignItems: { xs: 'flex-end', sm: 'center' } }}
  >
    <DialogContent sx={{ p: 0 }}>
      {/* Gradient top */}
      <Box sx={{
        background: `linear-gradient(135deg, ${C.brandDark} 0%, ${C.brand} 100%)`,
        px: 3, pt: 3.5, pb: 3, textAlign: 'center', position: 'relative',
      }}>
        <Box sx={{
          width: 60, height: 60, borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,.18)', border: '3px solid rgba(255,255,255,.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, mx: 'auto', mb: 1.5,
        }}>
          ✅
        </Box>
        <Typography sx={{ fontSize: 18, fontWeight: 900, color: '#fff', mb: .4 }}>{title}</Typography>
        {subtitle && (
          <Typography sx={{ fontSize: 12.5, color: 'rgba(255,255,255,.75)', lineHeight: 1.5 }}>{subtitle}</Typography>
        )}
        <Typography sx={{ fontSize: 28, fontWeight: 900, color: '#fff', mt: 1.25, letterSpacing: '-1px' }}>
          ₦{amount.toLocaleString()}
        </Typography>
      </Box>

      {/* Rows */}
      <Box sx={{ px: 2.5, py: 2 }}>
        {rows.map((r, i) => (
          <Box key={i} sx={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            py: .9, borderBottom: i < rows.length - 1 ? `1px solid ${C.g100}` : 'none', gap: 1,
          }}>
            <Typography sx={{ fontSize: 12, color: C.g400, flexShrink: 0 }}>{r.key}</Typography>
            <Typography sx={{
              fontSize: 12, fontWeight: 700, textAlign: 'right',
              color: C.g900, fontFamily: r.mono ? 'monospace' : 'inherit',
              wordBreak: 'break-all',
            }}>
              {r.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Actions */}
      <Box sx={{ px: 2.5, pb: 3, display: 'flex', gap: 1.25 }}>
        <Button
          fullWidth
          onClick={onNew}
          sx={{
            py: 1.4, borderRadius: '12px', textTransform: 'none',
            fontSize: 13.5, fontWeight: 700,
            background: `linear-gradient(135deg, ${C.brandDark}, ${C.brand})`,
            color: '#fff',
            '&:hover': { opacity: .9 },
          }}
        >
          New Payment
        </Button>
        <Button
          fullWidth
          onClick={onClose}
          variant="outlined"
          sx={{
            py: 1.4, borderRadius: '12px', textTransform: 'none',
            fontSize: 13.5, fontWeight: 700,
            borderColor: C.g200, color: C.g700,
            '&:hover': { borderColor: C.g300, bgcolor: C.g50 },
          }}
        >
          Done
        </Button>
      </Box>
    </DialogContent>
  </Dialog>
);
