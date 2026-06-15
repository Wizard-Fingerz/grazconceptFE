import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Button,
  Typography,
  useTheme,
  useMediaQuery,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Snackbar,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { getAddBanners } from '../../../services/studyVisa';
import { getMyRecentWalletTransactions, getMyWalletbalance } from '../../../services/walletService';
import { actionForms } from '../../../components/modals/ActionForms';
import { submitActionForm } from '../../../services/actionFormService';
import { toast } from 'react-toastify';

// ─── Brand tokens ────────────────────────────────────────────────
const C = {
  brand:       '#b66aed',
  brandDark:   '#8b3fc7',
  brandMid:    '#8b3fc7',
  accent:      '#cfa5f2',
  accentLight: '#f0d9fb',
  accentXL:    '#f9f0fe',
  gold:        '#F59E0B',
  green:       '#059669', greenBg: '#ECFDF5', greenLight: '#D1FAE5',
  red:         '#DC2626', redBg:   '#FEF2F2',
  amber:       '#D97706', amberBg: '#FFFBEB',
  g50:  '#FAFAFA', g100: '#F4F4F5', g200: '#E4E4E7',
  g300: '#D1D5DB', g400: '#A1A1AA', g500: '#71717A',
  g700: '#3F3F46', g900: '#18181B',
} as const;

// ─── Helpers ─────────────────────────────────────────────────────
function getGreeting(name?: string) {
  const h = new Date().getHours();
  const tod = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  return `Good ${tod}, ${name || 'there'} 👋`;
}

function getTransactionDescription(tx: any) {
  if (tx.description && tx.description.trim().length > 0) return tx.description;
  let txType = tx.transaction_type || tx.type;
  let readable = 'Transaction';
  if (txType) {
    if (txType === 'deposit' || txType === 'credit') readable = 'Deposit';
    else if (txType === 'withdrawal' || txType === 'debit') readable = 'Withdrawal';
    else readable = txType.charAt(0).toUpperCase() + txType.slice(1);
  }
  const currency = tx.currency || 'NGN';
  return `${readable} · ${currency} ${Math.abs(Number(tx.amount))}`;
}

// ─── Route map ───────────────────────────────────────────────────
const actionResultRoutes: Record<string, string> = {
  'Book Flight':                    '/dashboard/flight-result',
  'Reserve Hotel':                  '/travel/hotel-reservation',
  'Apply for Visa':                 '/travel/study-visa',
  'Chat with Agent':                '/support/chat',
  'Create Savings Plan':            '/dashboard/savings-plan',
  'Apply for Study Loan':           '/customer/dashboard/study-loan-result',
  'Study Abroad Loan':              '/customer/dashboard/study-abroad-loan-result',
  'Pilgrimage Package':             '/customer/dashboard/pilgrimage-result',
  'Business Loan for Travel Project': '/customer/dashboard/business-loan-result',
  'Airtime and Data':               '/services/airtime-and-bills',
  'Study Visa Offers':              '/travel/study-visa/offers',
};

// ─── Fund Wallet modal body ───────────────────────────────────────
const FundWalletModalContent = ({ user }: { user: any }) => {
  const [snack, setSnack] = useState(false);
  const ACCT = '4000331192';
  const copy = () => { navigator.clipboard.writeText(ACCT); setSnack(true); };
  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {user?.first_name} {user?.last_name}, transfer to the account below to fund your wallet.
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">Account Name</Typography>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          GRAZLINKS ENTERPRISE – GRAZ TRAVEL &amp; TOUR SERVICES
        </Typography>
      </Box>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">Account Number</Typography>
          <Typography variant="body1" sx={{ fontWeight: 700 }}>{ACCT}</Typography>
        </Box>
        <Tooltip title="Copy">
          <IconButton size="small" sx={{ ml: 1 }} onClick={copy}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">Bank</Typography>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>Moniepoint MFB</Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Typography variant="caption" color="text.secondary">
        After transfer, email your receipt to <b>peter.oluwole@grazconcept.com.ng</b> for wallet update.
      </Typography>
      <Box sx={{ mt: 2, bgcolor: '#fffbe6', borderRadius: 1, border: '1px solid #ffe58f', p: 1.5 }}>
        <Typography variant="subtitle2" color="warning.main" sx={{ fontWeight: 700, mb: 0.5 }}>Refund Policy</Typography>
        <Typography variant="body2" color="text.secondary">
          <b>Note:</b> <span style={{ color: '#d48806' }}>15% charges apply to any refunded capital.</span>
        </Typography>
      </Box>
      <Snackbar open={snack} autoHideDuration={2000} onClose={() => setSnack(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <MuiAlert elevation={6} variant="filled" severity="success" onClose={() => setSnack(false)}>
          Account number copied!
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

// ─── Grid quick-action tile (original v1 style) ──────────────────
const QATile = ({ emoji, label, badge, iconBg = C.accentXL, onClick }: {
  emoji: string; label: string; badge?: number; iconBg?: string; onClick: () => void;
}) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 0.8, py: 1.5, px: 0.5,
      bgcolor: '#fff', border: `1.5px solid ${C.g200}`, borderRadius: '14px',
      cursor: 'pointer', position: 'relative', transition: 'all .18s',
      '&:hover': { borderColor: C.accent, bgcolor: C.accentXL, transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(182,106,237,.12)' },
      '&:hover .qa-em': { bgcolor: C.accent, color: '#fff' },
    }}
  >
    <Box className="qa-em" sx={{
      width: 44, height: 44, borderRadius: '12px', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: 20, bgcolor: iconBg, transition: 'all .18s', flexShrink: 0,
    }}>
      {emoji}
    </Box>
    <Typography sx={{
      fontSize: { xs: 10, sm: 11 }, fontWeight: 600, color: C.g700,
      textAlign: 'center', lineHeight: 1.3,
      overflow: 'hidden', display: '-webkit-box',
      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
    }}>
      {label}
    </Typography>
    {badge ? (
      <Box sx={{
        position: 'absolute', top: 6, right: 6, bgcolor: C.red, color: '#fff',
        borderRadius: '50%', width: 16, height: 16, display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700,
        border: '2px solid #fff',
      }}>{badge}</Box>
    ) : null}
  </Box>
);

// ─── AI insight card ──────────────────────────────────────────────
const AICard = ({ gradient, emoji, tag, msg, cta, onClick }: {
  gradient: string; emoji: string; tag: string; msg: string; cta: string; onClick?: () => void;
}) => (
  <Box onClick={onClick} sx={{
    background: gradient, borderRadius: '14px', p: 2.2,
    display: 'flex', alignItems: 'flex-start', gap: 1.5,
    cursor: 'pointer', position: 'relative', overflow: 'hidden',
    transition: 'transform .2s',
    '&:hover': { transform: 'translateY(-2px)' },
    '&::before': {
      content: '""', position: 'absolute', bottom: -30, right: -30,
      width: 100, height: 100, bgcolor: 'rgba(255,255,255,.07)', borderRadius: '50%',
    },
  }}>
    <Typography sx={{ fontSize: 26, flexShrink: 0, position: 'relative', zIndex: 1 }}>{emoji}</Typography>
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'rgba(255,255,255,.6)', mb: 0.5 }}>
        {tag}
      </Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.45 }}>{msg}</Typography>
      <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,.75)', mt: 0.6, fontWeight: 600 }}>{cta}</Typography>
    </Box>
  </Box>
);

// ─── Mini stat tile ───────────────────────────────────────────────
const MiniTile = ({ emoji, label, value, sub, trendColor, trend, iconBg }: {
  emoji: string; label: string; value: string; sub: string;
  trend: string; trendColor: string; iconBg: string;
}) => (
  <Box sx={{
    bgcolor: '#fff', borderRadius: '14px', border: `1px solid ${C.g200}`,
    p: 2.2, boxShadow: '0 1px 2px rgba(0,0,0,.06)',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
      <Box sx={{ width: 38, height: 38, borderRadius: '9px', bgcolor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
        {emoji}
      </Box>
      <Box sx={{
        fontSize: 11, fontWeight: 700, borderRadius: '6px', px: 1, py: 0.3, color: trendColor,
        bgcolor: trendColor === C.green ? C.greenBg : trendColor === C.amber ? C.amberBg : trendColor === C.g400 ? C.g100 : C.redBg,
      }}>
        {trend}
      </Box>
    </Box>
    <Typography sx={{ fontSize: 11, color: C.g500, mb: 0.3 }}>{label}</Typography>
    <Typography sx={{ fontSize: 22, fontWeight: 900, letterSpacing: '-.5px' }}>{value}</Typography>
    <Typography sx={{ fontSize: 11, color: C.g400, mt: 0.3 }}>{sub}</Typography>
  </Box>
);

// ─── Card wrapper ─────────────────────────────────────────────────
const DCard = ({ children, sx: sxExtra = {} }: { children: React.ReactNode; sx?: object }) => (
  <Box sx={{
    bgcolor: '#fff', borderRadius: '14px', border: `1px solid ${C.g200}`,
    p: { xs: 1.5, sm: 2.5 }, boxShadow: '0 1px 2px rgba(0,0,0,.06)',
    minWidth: 0, overflow: 'hidden', // prevent content from stretching the card
    ...sxExtra,
  }}>
    {children}
  </Box>
);

const CardHeader = ({ title, action }: { title: string; action?: React.ReactNode }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
    <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.g900, flex: 1, minWidth: 0, mr: 0.5 }}>{title}</Typography>
    {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
  </Box>
);

const LinkBtn = ({ label, onClick }: { label: string; onClick?: () => void }) => (
  <Typography onClick={onClick} sx={{ fontSize: 12, fontWeight: 600, color: C.brand, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
    {label}
  </Typography>
);

// ─── Transaction row ──────────────────────────────────────────────
const TxRow = ({ emoji, bg, label, date, amount, isCredit }: {
  emoji: string; bg: string; label: string; date: string; amount: string; isCredit: boolean;
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.2, minWidth: 0, borderBottom: `1px solid ${C.g100}`, '&:last-child': { borderBottom: 'none', pb: 0 } }}>
    <Box sx={{ width: 36, height: 36, borderRadius: '9px', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
      {emoji}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: C.g900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</Typography>
      <Typography sx={{ fontSize: 10, color: C.g400, mt: 0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{date}</Typography>
    </Box>
    <Typography sx={{
      fontSize: 13, fontWeight: 800, color: isCredit ? C.green : C.red,
      flexShrink: 0, maxWidth: '42%',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    }}>
      {isCredit ? '+' : '−'}{amount}
    </Typography>
  </Box>
);

// ─── Empty slate ──────────────────────────────────────────────────
const EmptySlate = ({
  emoji, title, subtitle, ctaLabel, onCta,
}: {
  emoji: string; title: string; subtitle: string; ctaLabel?: string; onCta?: () => void;
}) => (
  <Box sx={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', py: 4, px: 2, textAlign: 'center',
  }}>
    <Box sx={{
      width: 56, height: 56, borderRadius: '16px', bgcolor: C.accentXL,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 26, mb: 1.5,
    }}>
      {emoji}
    </Box>
    <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.g900, mb: 0.5 }}>{title}</Typography>
    <Typography sx={{ fontSize: 12, color: C.g400, maxWidth: 220, lineHeight: 1.6 }}>{subtitle}</Typography>
    {ctaLabel && onCta && (
      <Box
        onClick={onCta}
        sx={{
          mt: 2, px: 2.5, py: 1, bgcolor: C.brand, color: '#fff',
          borderRadius: '8px', fontSize: 12, fontWeight: 700,
          cursor: 'pointer', transition: 'all .15s',
          '&:hover': { bgcolor: C.accent },
        }}
      >
        {ctaLabel}
      </Box>
    )}
  </Box>
);

// ─── Tab bar ─────────────────────────────────────────────────────
const TabBar = ({ tabs, active, onChange }: {
  tabs: string[]; active: number; onChange: (i: number) => void;
}) => (
  <Box sx={{
    display: 'flex', borderBottom: `2px solid ${C.g200}`, mb: 1.5,
    overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none',
  }}>
    {tabs.map((t, i) => (
      <Box key={t} onClick={() => onChange(i)} sx={{
        px: { xs: 1.2, sm: 1.8 }, py: 0.9, fontSize: { xs: 11, sm: 12 },
        fontWeight: 600, cursor: 'pointer', flexShrink: 0,
        color: active === i ? C.brand : C.g400,
        borderBottom: active === i ? `2.5px solid ${C.brand}` : '2.5px solid transparent',
        mb: '-2px', transition: 'all .15s', whiteSpace: 'nowrap',
      }}>
        {t}
      </Box>
    ))}
  </Box>
);

// ─── Ctrl tile (virtual card controls) ───────────────────────────
export const CtrlTile = ({ emoji, label, bg, color, onClick }: {
  emoji: string; label: string; bg: string; color: string; onClick?: () => void;
}) => (
  <Box onClick={onClick} sx={{
    bgcolor: '#fff', border: `1.5px solid ${C.g200}`, borderRadius: '10px',
    p: 1.5, textAlign: 'center', cursor: 'pointer', transition: 'all .15s',
    '&:hover': { borderColor: C.brand, bgcolor: C.accentXL },
    '&:hover .ctrl-icon': { bgcolor: C.brand, color: '#fff' },
  }}>
    <Box className="ctrl-icon" sx={{
      width: 34, height: 34, borderRadius: '8px', bgcolor: bg, color: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 16, mx: 'auto', mb: 0.8, transition: 'all .15s',
    }}>
      {emoji}
    </Box>
    <Typography sx={{ fontSize: 11, fontWeight: 600, color: C.g700 }}>{label}</Typography>
  </Box>
);

// ─── Dashboard ───────────────────────────────────────────────────
export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMd = useMediaQuery(theme.breakpoints.down('md'));

  // ── Modals ──────────────────────────────────────────────────
  const [openModal, setOpenModal] = useState(false);
  const [modalLabel, setModalLabel] = useState<string | null>(null);
  const [openFundWallet, setOpenFundWallet] = useState(false);
  const [openTransactionsModal, setOpenTransactionsModal] = useState(false);
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [approvalDismissed, setApprovalDismissed] = useState(false);
  const [bookingTab, setBookingTab] = useState(0);
  const [fabOpen, setFabOpen] = useState(false);
  const [walletCurrency, setWalletCurrency] = useState<'NGN' | 'USD' | 'GBP'>('NGN');

  // ── Data ────────────────────────────────────────────────────
  const [banners, setBanners] = useState<any[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<{ currency?: string; balance?: number }>({
    currency: user?.wallet?.currency,
    balance: user?.wallet?.balance,
  });
  const [walletBalanceLoading, setWalletBalanceLoading] = useState(true);
  const [walletBalanceError, setWalletBalanceError] = useState<string | null>(null);

  // ── Fetches ─────────────────────────────────────────────────
  useEffect(() => {
    let ok = true;
    getMyWalletbalance()
      .then((d: any) => { if (ok && d) setWalletBalance({ currency: d.currency, balance: d.balance }); })
      .catch(() => { if (ok) setWalletBalanceError("Couldn't fetch balance."); })
      .finally(() => { if (ok) setWalletBalanceLoading(false); });
    return () => { ok = false; };
  }, []);

  useEffect(() => {
    let ok = true;
    getAddBanners()
      .then((d: any) => { if (ok) setBanners(Array.isArray(d?.results) ? d.results : []); })
      .catch(() => { if (ok) setBanners([]); })
      .finally(() => { if (ok) setLoadingBanners(false); });
    return () => { ok = false; };
  }, []);

  useEffect(() => {
    let ok = true;
    Promise.resolve().then(() => getMyRecentWalletTransactions())
      .then((d: any) => {
        if (ok) setTransactions(Array.isArray(d) ? d : Array.isArray(d?.results) ? d.results : []);
      })
      .catch(() => { if (ok) { setTransactions([]); setTransactionsError('Failed to load transactions.'); } })
      .finally(() => { if (ok) setTransactionsLoading(false); });
    return () => { ok = false; };
  }, []);

  // ── Navigation ───────────────────────────────────────────────
  const handleActionClick = (label: string) => {
    const routes: Record<string, string> = {
      'Book Flight':      '/travel/book-flight',
      'Reserve Hotel':    '/travel/hotel-reservation',
      'Study Visa':       '/travel/study-visa',
      'Work Visa':        '/travel/work-visa',
      'Vacation':         '/travel/vacation',
      'Pilgrimage':       '/travel/pilgrimage',
      'Savings Plan':     '/dashboard/savings-plan',
      'Study Abroad Loan':'/edufinance/study-abroad-loan',
      'Civil Servant Loan':'/edufinance/civil-servant-loan',
      'Investment Plan':  '/citizenship/investment-plan',
      'Airtime & Bills':  '/services/airtime-and-bills',
      'Referrals':        '/referrals',
      'Support':          '/support/tickets',
      'Track Application':'/track-progress',
    };
    const route = routes[label];
    if (route) { navigate(route); return; }
    setModalLabel(label); setFormState({}); setOpenModal(true);
  };

  const handleModalSubmit = async () => {
    if (!modalLabel) return;
    setSubmitting(true);
    try {
      const response = await submitActionForm(modalLabel, formState);
      const r = actionResultRoutes[modalLabel];
      if (r) navigate(r, { state: { result: response, action: modalLabel } });
      else setOpenModal(false);
      toast.success('Submission successful!');
    } catch {
      toast.error('Submission failed. Please try again.');
    } finally {
      setSubmitting(false); setOpenModal(false); setModalLabel(null); setFormState({});
    }
  };

  // ── Computed ─────────────────────────────────────────────────
  const cur = walletBalance.currency ?? 'NGN';
  const rawBalance = Number(walletBalance.balance ?? 0);
  const totalSpend = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

  // ── Currency conversion (placeholder rates; swap for live API later) ──
  const FX: Record<string, number> = { NGN: 1, USD: 1 / 1530, GBP: 1 / 1920 };
  const SYMBOLS: Record<string, string> = { NGN: '₦', USD: '$', GBP: '£' };
  const convertBal = (to: string) => (rawBalance * FX[to]).toLocaleString(undefined, { minimumFractionDigits: to === 'NGN' ? 0 : 2, maximumFractionDigits: to === 'NGN' ? 0 : 2 });
  const displayBal = convertBal(walletCurrency);
  const displaySymbol = SYMBOLS[walletCurrency];

  // ── Today's net credit ────────────────────────────────────────
  const todayStr = new Date().toDateString();
  const todayCredit = transactions
    .filter(tx => new Date(tx.date).toDateString() === todayStr && Number(tx.amount) > 0)
    .reduce((s, tx) => s + Number(tx.amount), 0);
  const bal = rawBalance.toLocaleString();
  console.log(bal)
  const txEmoji = (tx: any) => {
    const type = (tx.transaction_type || tx.type || '').toLowerCase();
    if (type.includes('deposit') || type.includes('credit')) return { e: '💰', bg: C.greenBg };
    if (type.includes('flight') || (tx.description || '').toLowerCase().includes('flight')) return { e: '✈️', bg: C.accentXL };
    if (type.includes('airtime') || (tx.description || '').toLowerCase().includes('airtime')) return { e: '📱', bg: C.amberBg };
    return { e: '💳', bg: C.g100 };
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <Box sx={{ bgcolor: C.g50, minHeight: '100vh', overflowX: 'hidden', maxWidth: '100%' }}>

      {/* ── GREETING ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 2.5 }}>
        <Box>
          <Typography sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 800, letterSpacing: '-.4px', color: C.g900 }}>
            {getGreeting(user?.first_name)}
          </Typography>
          <Typography sx={{ fontSize: 12, color: C.g500, mt: 0.4 }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate('/track-progress')}
            sx={{ borderRadius: '9px', textTransform: 'none', fontSize: 13, fontWeight: 600, borderColor: C.g200, color: C.g700, '&:hover': { borderColor: C.brand, color: C.brand } }}
          >
            📋 Applications
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => navigate('/travel/book-flight')}
            sx={{ borderRadius: '9px', textTransform: 'none', fontSize: 13, fontWeight: 600, background: C.brand, boxShadow: '0 3px 10px rgba(182,106,237,.3)', '&:hover': { background: C.accent } }}
          >
            ✈️ Book Now
          </Button>
        </Box>
      </Box>

      {/* ── APPROVAL QUEUE — only when wallet is genuinely empty ── */}
      {!approvalDismissed && !walletBalanceLoading && Number(walletBalance.balance ?? 0) === 0 && (
        <Box sx={{
          background: 'linear-gradient(90deg,#FFFBEB,#FEF3C7)', border: '1.5px solid #FDE68A',
          borderRadius: '12px', p: '12px 16px', display: 'flex', alignItems: 'center',
          gap: 1.5, mb: 2.5, flexWrap: 'wrap',
        }}>
          <Typography sx={{ fontSize: 20, flexShrink: 0 }}>⏳</Typography>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#92400E' }}>Fund your wallet to get started</Typography>
            <Typography sx={{ fontSize: 11, color: '#B45309', mt: 0.3 }}>
              Your wallet is empty. Add funds to unlock bookings, visa applications and more.
            </Typography>
          </Box>
          <Button size="small" onClick={() => setOpenFundWallet(true)}
            sx={{ bgcolor: C.amber, color: '#fff', borderRadius: '7px', textTransform: 'none', fontSize: 12, fontWeight: 700, flexShrink: 0, '&:hover': { bgcolor: '#B45309' } }}>
            Fund Wallet
          </Button>
          <IconButton size="small" onClick={() => setApprovalDismissed(true)} sx={{ color: '#B45309', flexShrink: 0 }}>✕</IconButton>
        </Box>
      )}

      {/* ── AI INSIGHTS STRIP ── */}
      {transactions.length > 0 ? (
        <Box sx={{ display: { xs: 'none', md: 'grid' }, gridTemplateColumns: 'repeat(3,1fr)', gap: 2, mb: 2.5 }}>
          <AICard
            gradient="linear-gradient(135deg,#8b3fc7 0%,#b66aed 100%)"
            emoji="✈️" tag="Travel"
            msg="Ready to plan your next trip? Browse flights, hotels and visa packages."
            cta="Book a Flight →"
            onClick={() => navigate('/travel/book-flight')}
          />
          <AICard
            gradient="linear-gradient(135deg,#064E3B 0%,#059669 100%)"
            emoji="📊" tag="Spending"
            msg={`Total spend so far: ${cur} ${totalSpend.toLocaleString()}. View your full transaction history.`}
            cta="View Transactions →"
            onClick={() => setOpenTransactionsModal(true)}
          />
          <AICard
            gradient="linear-gradient(135deg,#78350F 0%,#F59E0B 100%)"
            emoji="💬" tag="Support"
            msg="Have questions? Our team is ready to assist with visas, loans and bookings."
            cta="Open Support →"
            onClick={() => navigate('/support/tickets')}
          />
        </Box>
      ) : (
        <DCard sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{
              width: 48, height: 48, borderRadius: '14px', flexShrink: 0,
              background: `linear-gradient(135deg,${C.brandDark},${C.accent})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>🤖</Box>
            <Box sx={{ flex: 1, minWidth: 180 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.g900 }}>AI Insights will appear here</Typography>
              <Typography sx={{ fontSize: 12, color: C.g500, mt: 0.3 }}>
                Complete your first booking or transaction to unlock personalised travel and finance insights.
              </Typography>
            </Box>
            <Button size="small" onClick={() => navigate('/travel/book-flight')}
              sx={{ bgcolor: C.brand, color: '#fff', borderRadius: '8px', textTransform: 'none', fontSize: 12, fontWeight: 700, flexShrink: 0, '&:hover': { bgcolor: C.accent } }}>
              Make a Booking
            </Button>
          </Box>
        </DCard>
      )}

      {/* ── WALLET STRIP ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1.4fr 1fr 1fr' }, gap: 2, mb: 2.5, minWidth: 0 }}>

        {/* Main wallet card */}
        <Box sx={{
          background: 'linear-gradient(135deg,#ac60e3 0%,#b66aed 60%,#cfa5f2 100%)',
          borderRadius: '16px', p: { xs: 2, sm: 2.5 }, color: '#fff', position: 'relative', overflow: 'hidden',
          minHeight: 195, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          boxShadow: '0 8px 28px rgba(182,106,237,.35)',
          gridColumn: { sm: '1 / -1', md: 'auto' },
        }}>
          {/* Decorative circles */}
          <Box sx={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, bgcolor: 'rgba(255,255,255,.05)', borderRadius: '50%' }} />
          <Box sx={{ position: 'absolute', bottom: -30, left: 40, width: 100, height: 100, bgcolor: 'rgba(255,255,255,.04)', borderRadius: '50%' }} />

          {/* ── Row 1: card chip + currency switcher ── */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <Box sx={{ width: 36, height: 25, background: 'linear-gradient(135deg,#F59E0B,#FDE68A)', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,.2)' }} />
            {/* Currency tabs */}
            <Box sx={{ display: 'flex', bgcolor: 'rgba(255,255,255,.12)', borderRadius: '20px', p: '3px', gap: '2px' }}>
              {(['NGN', 'USD', 'GBP'] as const).map(c => (
                <Box
                  key={c}
                  onClick={() => setWalletCurrency(c)}
                  sx={{
                    px: 1.3, py: 0.35, borderRadius: '16px', fontSize: 10, fontWeight: 700,
                    cursor: 'pointer', transition: 'all .15s',
                    bgcolor: walletCurrency === c ? '#fff' : 'transparent',
                    color: walletCurrency === c ? C.brand : 'rgba(255,255,255,.65)',
                    '&:hover': { bgcolor: walletCurrency === c ? '#fff' : 'rgba(255,255,255,.15)' },
                  }}
                >
                  {c}
                </Box>
              ))}
            </Box>
          </Box>

          {/* ── Row 2: balance ── */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography sx={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.55, mb: 0.5 }}>
              Available Balance
            </Typography>
            {walletBalanceLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} sx={{ color: '#fff' }} />
                <Typography sx={{ color: '#fff', fontSize: 14 }}>Loading…</Typography>
              </Box>
            ) : walletBalanceError ? (
              <Typography sx={{ color: '#ffd700', fontSize: 13 }}>{walletBalanceError}</Typography>
            ) : (
              <>
                <Typography sx={{ fontSize: { xs: 28, md: 34 }, fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1 }}>
                  <span style={{ fontSize: '60%', opacity: .75, verticalAlign: 'super', marginRight: 2 }}>{displaySymbol}</span>
                  {displayBal}
                </Typography>

                {/* Equivalent in the other two currencies */}
                {rawBalance > 0 && (
                  <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,.55)', mt: 0.6 }}>
                    ≈ {walletCurrency !== 'USD' && `$${convertBal('USD')} USD`}
                    {walletCurrency !== 'USD' && walletCurrency !== 'GBP' && ' · '}
                    {walletCurrency !== 'GBP' && `£${convertBal('GBP')} GBP`}
                    {walletCurrency === 'USD' && `₦${convertBal('NGN')} NGN · £${convertBal('GBP')} GBP`}
                    {walletCurrency === 'GBP' && `₦${convertBal('NGN')} NGN · $${convertBal('USD')} USD`}
                  </Typography>
                )}

                {/* Today's activity badge */}
                {todayCredit > 0 && (
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.8, bgcolor: 'rgba(5,150,105,.25)', color: '#6EE7B7', borderRadius: '20px', px: 1.2, py: 0.3, fontSize: 11, fontWeight: 700 }}>
                    ↑ +{cur} {todayCredit.toLocaleString()} today
                  </Box>
                )}

                {rawBalance === 0 && (
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.8, bgcolor: 'rgba(245,158,11,.2)', color: '#FDE68A', borderRadius: '20px', px: 1.2, py: 0.3, fontSize: 11, fontWeight: 700 }}>
                    ⚡ Wallet empty — tap Fund to top up
                  </Box>
                )}
              </>
            )}
          </Box>

          {/* ── Row 3: cardholder + action buttons ── */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, position: 'relative', zIndex: 1 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 10, opacity: 0.55, textTransform: 'uppercase', letterSpacing: .5, whiteSpace: 'nowrap' }}>
                {user?.first_name} {user?.last_name}
              </Typography>
              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, opacity: .8, mt: 0.3, whiteSpace: 'nowrap' }}>
                4000 ···· 3319
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.8, flexShrink: 0 }}>
              {[
                { lbl: '↑ Send', i: 0 },
                { lbl: '↓ Withdraw', i: 1 },
                { lbl: '+ Fund', i: 2 },
              ].map(({ lbl, i }) => (
                <Button key={lbl} size="small"
                  onClick={i === 2 ? () => setOpenFundWallet(true) : undefined}
                  sx={{
                    minWidth: 0, py: 0.7, px: { xs: 1, sm: 1.3 }, fontSize: { xs: 10, sm: 11 }, fontWeight: 700,
                    textTransform: 'none', borderRadius: '7px', color: '#fff',
                    bgcolor: i === 2 ? C.gold : 'rgba(255,255,255,.12)',
                    '&:hover': { bgcolor: i === 2 ? '#E08A00' : 'rgba(255,255,255,.22)' },
                  }}>
                  {lbl}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Mini stat tiles */}
        <MiniTile
          emoji="✈️" iconBg={C.accentXL} label="Active Bookings"
          value="—"
          sub="No bookings yet"
          trend="None" trendColor={C.g400}
        />
        <MiniTile
          emoji="💳" iconBg={C.amberBg} label={`Total Spent (${cur})`}
          value={totalSpend > 0 ? totalSpend.toLocaleString() : '—'}
          sub={totalSpend > 0 ? 'From your transactions' : 'No transactions yet'}
          trend={totalSpend > 0 ? 'This period' : 'None'} trendColor={totalSpend > 0 ? C.amber : C.g400}
        />
      </Box>

      {/* ── QUICK ACTIONS ── */}
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.g900 }}>Quick Actions</Typography>
          <Typography sx={{ fontSize: 12, color: C.accent, fontWeight: 600, cursor: 'pointer' }}>⚙️ Customise</Typography>
        </Box>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(4,1fr)', sm: 'repeat(6,1fr)', md: 'repeat(12,1fr)' },
          gap: { xs: 1, sm: 1.2 },
        }}>
          {/* Mobility Hub */}
          <QATile emoji="✈️" label="Flight & Hotel"      iconBg={C.accentXL}  onClick={() => handleActionClick('Book Flight')} />
          <QATile emoji="📄" label="Study Abroad"         iconBg={C.greenBg}   onClick={() => handleActionClick('Study Visa')} />
          <QATile emoji="💼" label="Work Abroad"          iconBg="#FFF7ED"     onClick={() => handleActionClick('Work Visa')} />
          <QATile emoji="🕌" label="Pilgrimage"           iconBg={C.redBg}     onClick={() => handleActionClick('Pilgrimage')} />
          <QATile emoji="🏖️" label="Vacation"             iconBg="#FFF7ED"     onClick={() => handleActionClick('Vacation')} />
          <QATile emoji="🌍" label="Citizenship"          iconBg={C.accentXL}  onClick={() => handleActionClick('Investment Plan')} />
          {/* Financial Hub */}
          <QATile emoji="🎓" label="Study Loan"           iconBg={C.accentXL}  onClick={() => handleActionClick('Study Abroad Loan')} />
          <QATile emoji="🛫" label="Pay Later"            iconBg={C.accentXL}  onClick={() => navigate('/finance/travel-now-pay-later')} />
          <QATile emoji="💰" label="Savings Plan"         iconBg={C.greenBg}   onClick={() => handleActionClick('Savings Plan')} />
          <QATile emoji="💸" label="Cross-Border"         iconBg={C.amberBg}   onClick={() => navigate('/finance/cross-border-payments')} />
          {/* Other */}
          <QATile emoji="💳" label="Payments & Bills"     iconBg={C.amberBg}   onClick={() => handleActionClick('Airtime & Bills')} />
          <QATile emoji="🎁" label="Refer & Earn"         iconBg="#F0FDF4"     onClick={() => handleActionClick('Referrals')} />
        </Box>
      </Box>

      {/* ── MAIN GRID ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 320px' }, gap: 2, mb: 2.5, alignItems: 'start' }}>

        {/* LEFT COL */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>

          {/* ── Upcoming & Active ── */}
          <DCard>
            <CardHeader
              title="📅 Upcoming & Active"
              action={<LinkBtn label="View all →" onClick={() => navigate('/track-progress')} />}
            />
            <TabBar
              tabs={['✈️ Flights', '🏨 Hotels', '📄 Visas', '💳 Installments']}
              active={bookingTab}
              onChange={setBookingTab}
            />
            {bookingTab === 0 && (
              <EmptySlate
                emoji="✈️"
                title="No upcoming flights"
                subtitle="Book a flight and your upcoming trips will appear here."
                ctaLabel="Book a Flight"
                onCta={() => navigate('/travel/book-flight')}
              />
            )}
            {bookingTab === 1 && (
              <EmptySlate
                emoji="🏨"
                title="No hotel reservations"
                subtitle="Reserve a hotel and it will show up here for easy access."
                ctaLabel="Reserve a Hotel"
                onCta={() => navigate('/travel/hotel-reservation')}
              />
            )}
            {bookingTab === 2 && (
              <EmptySlate
                emoji="📄"
                title="No active visa applications"
                subtitle="Start a visa application to track its status and next steps."
                ctaLabel="Apply for a Visa"
                onCta={() => navigate('/travel/study-visa')}
              />
            )}
            {bookingTab === 3 && (
              <EmptySlate
                emoji="💳"
                title="No active installment plans"
                subtitle="When you set up a payment plan for school fees or travel packages, it shows up here."
                ctaLabel="Explore Plans"
                onCta={() => navigate('/edufinance/study-abroad-loan')}
              />
            )}
          </DCard>

          {/* Transactions */}
          <DCard>
            <CardHeader
              title="💳 Recent Transactions"
              action={
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Box
                    onClick={() => setOpenTransactionsModal(true)}
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: C.g100, borderRadius: '7px', px: 1.2, py: 0.6, fontSize: 11, fontWeight: 600, color: C.g500, cursor: 'pointer', '&:hover': { bgcolor: C.accentXL, color: C.brand } }}
                  >
                    ⬇ Export / View All
                  </Box>
                </Box>
              }
            />
            {transactionsLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
                <CircularProgress size={18} /> <Typography fontSize={13} color="text.secondary">Loading…</Typography>
              </Box>
            ) : transactions.length === 0 ? (
              <Typography fontSize={13} color="text.secondary" sx={{ py: 2 }}>No recent transactions found.</Typography>
            ) : (
              transactions.slice(0, 6).map((tx: any) => {
                const { e, bg } = txEmoji(tx);
                const isCredit = tx.amount >= 0;
                return (
                  <TxRow
                    key={tx.id}
                    emoji={e} bg={bg}
                    label={getTransactionDescription(tx)}
                    date={tx.date ? new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                    amount={`${tx.currency || cur} ${Math.abs(Number(tx.amount)).toLocaleString()}`}
                    isCredit={isCredit}
                  />
                );
              })
            )}
          </DCard>

          {/* Loyalty Points */}
          <DCard>
            <CardHeader title="🏅 GrazRewards" action={<LinkBtn label="Learn more →" onClick={() => navigate('/referrals')} />} />
            <EmptySlate
              emoji="🎁"
              title="No rewards yet"
              subtitle="Earn points every time you book a flight, apply for a visa or refer a friend."
              ctaLabel="Start Earning"
              onCta={() => navigate('/travel/book-flight')}
            />
          </DCard>
        </Box>

        {/* RIGHT COL */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>

          {/* Spend summary */}
          <DCard>
            <CardHeader title="📊 Spending Summary" action={<LinkBtn label="View Transactions →" onClick={() => setOpenTransactionsModal(true)} />} />
            {totalSpend > 0 ? (
              <>
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ position: 'relative', width: { xs: 80, sm: 100 }, height: { xs: 80, sm: 100 }, flexShrink: 0 }}>
                    <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                      <circle cx="50" cy="50" r="38" fill="none" stroke={C.g200} strokeWidth="13" />
                      <circle cx="50" cy="50" r="38" fill="none" stroke={C.brand} strokeWidth="13" strokeDasharray="239 0" />
                    </svg>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 900 }}>{`${(totalSpend/1000).toFixed(1)}k`}</Typography>
                      <Typography sx={{ fontSize: 9, color: C.g400 }}>Total</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 9, height: 9, borderRadius: '3px', bgcolor: C.brand, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 11, color: C.g700, flex: 1 }}>All Spending</Typography>
                      <Typography sx={{ fontSize: 11, fontWeight: 700 }}>100%</Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ pt: 1.5, borderTop: `1px solid ${C.g100}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: 11, color: C.g500 }}>Total Debit</Typography>
                    <Typography sx={{ fontSize: 11, fontWeight: 700 }}>{cur} {totalSpend.toLocaleString()}</Typography>
                  </Box>
                </Box>
              </>
            ) : (
              <EmptySlate
                emoji="📊"
                title="No spending data yet"
                subtitle="Your spending breakdown will appear here once you make transactions."
              />
            )}
          </DCard>

          {/* Savings goal */}
          <DCard sx={{ background: 'linear-gradient(150deg,#064E3B,#059669 80%)', color: '#fff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>💰 Savings Goals</Typography>
              <Box
                onClick={() => handleActionClick('Savings Plan')}
                sx={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.8)', cursor: 'pointer', '&:hover': { color: '#fff' } }}
              >
                + New Goal
              </Box>
            </Box>
            <Box sx={{
              bgcolor: 'rgba(255,255,255,.1)', borderRadius: '12px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', py: 4, px: 2, textAlign: 'center',
            }}>
              <Typography sx={{ fontSize: 32, mb: 1 }}>🎯</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#fff', mb: 0.5 }}>No savings goal yet</Typography>
              <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,.65)', mb: 2, lineHeight: 1.6 }}>
                Set a target for your next trip, visa fee or study abroad fund.
              </Typography>
              <Button size="small" onClick={() => handleActionClick('Savings Plan')}
                sx={{ bgcolor: 'rgba(255,255,255,.2)', border: '1.5px solid rgba(255,255,255,.3)', color: '#fff', borderRadius: '8px', textTransform: 'none', fontSize: 12, fontWeight: 700, '&:hover': { bgcolor: 'rgba(255,255,255,.3)' } }}>
                Create a Savings Goal
              </Button>
            </Box>
          </DCard>

          {/* Visa tracker */}
          <DCard>
            <CardHeader title="🗂️ Application Tracker" action={<LinkBtn label="View all →" onClick={() => navigate('/track-progress')} />} />
            <EmptySlate
              emoji="📋"
              title="No active applications"
              subtitle="Apply for a visa, study programme or travel package to track progress here."
              ctaLabel="Start an Application"
              onCta={() => navigate('/travel/study-visa')}
            />
          </DCard>

        </Box>
      </Box>

      {/* ── VIRTUAL CARD + POS TERMINAL ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2.5, alignItems: 'start', minWidth: 0 }}>

        {/* Left — Virtual Card panel */}
        <DCard>
          <CardHeader title="💳 Virtual Card" action={<LinkBtn label="Manage →" onClick={() => navigate('/wallet')} />} />

          {/* Card visual */}
          <Box sx={{
            background: 'linear-gradient(135deg, #ac60e3 0%, #b66aed 60%, #cfa5f2 100%)',
            borderRadius: '14px', p: 2.5, mb: 2, position: 'relative', overflow: 'hidden', minHeight: 130,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            {/* Decorative circles */}
            <Box sx={{ position: 'absolute', top: -30, right: -20, width: 110, height: 110, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.06)' }} />
            <Box sx={{ position: 'absolute', bottom: -40, right: 30, width: 130, height: 130, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.04)' }} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography sx={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.5)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                  Virtual Debit Card
                </Typography>
                <Box sx={{ mt: 0.5, px: '7px', py: '2px', bgcolor: 'rgba(255,255,255,.12)', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: C.green }} />
                  <Typography sx={{ fontSize: 9, color: 'rgba(255,255,255,.75)', fontWeight: 600 }}>Not Activated</Typography>
                </Box>
              </Box>
              <Box sx={{ fontSize: 22 }}>💳</Box>
            </Box>

            <Box>
              <Typography sx={{ fontSize: { xs: 11, sm: 14 }, fontWeight: 700, color: '#fff', letterSpacing: { xs: 1.5, sm: 3 }, fontFamily: 'monospace', mb: 1 }}>
                •••• •••• •••• ••••
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                  <Typography sx={{ fontSize: 9, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 1 }}>Card Holder</Typography>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>
                    {user?.first_name?.toUpperCase()} {user?.last_name?.toUpperCase()}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontSize: 9, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 1 }}>Expires</Typography>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>••/••</Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Empty state CTA */}
          <EmptySlate
            emoji="🪪"
            title="No virtual card yet"
            subtitle="Request a virtual debit card to pay online and internationally with ease."
            ctaLabel="Request Virtual Card"
            onCta={() => navigate('/wallet')}
          />
        </DCard>

        {/* Right — POS Terminal panel */}
        <DCard>
          <CardHeader title="🖨️ POS Terminal" action={<LinkBtn label="Learn more →" />} />

          {/* Status rows — all showing inactive state */}
          {[
            { label: 'Terminal Status', value: 'Not Assigned', accent: C.amber, dot: true },
            { label: 'Terminal ID', value: '— —', accent: C.g400, dot: false },
            { label: "Today's Collections", value: '₦ 0.00', accent: C.g700, dot: false },
            { label: 'Settlement Account', value: 'Not linked', accent: C.g400, dot: false },
          ].map(row => (
            <Box key={row.label} sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              py: 1.2, borderBottom: `1px solid ${C.g100}`,
            }}>
              <Typography sx={{ fontSize: 12, color: C.g500 }}>{row.label}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                {row.dot && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: C.amber }} />}
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: row.accent }}>{row.value}</Typography>
              </Box>
            </Box>
          ))}

          <Box sx={{ mt: 2, pt: 0.5 }}>
            <EmptySlate
              emoji="🖨️"
              title="No POS terminal assigned"
              subtitle="Accept card payments anywhere. Request a POS terminal for your business."
              ctaLabel="Request POS Terminal"
              onCta={() => navigate('/support/tickets')}
            />
          </Box>
        </DCard>
      </Box>

      {/* ── BANNERS ── */}
      {!loadingBanners && banners.length > 0 && (
        <DCard sx={{ mb: 2.5 }}>
          <CardHeader title="🌟 Explore Services" action={<LinkBtn label="All offers →" />} />
          <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
            {banners.slice(0, 5).map((b: any, idx: number) => (
              <Box
                key={b.id || idx}
                onClick={() => {
                  if (b.link_url) window.open(b.link_url, '_blank', 'noopener,noreferrer');
                  else if (b.actionLabel) handleActionClick(b.actionLabel);
                }}
                sx={{
                  minWidth: 220, height: 110, borderRadius: '12px', p: 2.2, flexShrink: 0,
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  background: b.image ? `url(${b.image}) center/cover` : `linear-gradient(135deg,${C.brandDark},${C.accent})`,
                  color: '#fff', position: 'relative', overflow: 'hidden',
                  transition: 'transform .2s', '&:hover': { transform: 'translateY(-2px)' },
                }}
              >
                <Typography sx={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, opacity: .8 }}>
                  {b.category || 'Service'}
                </Typography>
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 800, lineHeight: 1.2 }}>{b.title || b.name}</Typography>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, mt: 0.5, opacity: .85 }}>Explore →</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </DCard>
      )}

      {/* No banners from API — subtle empty state */}
      {!loadingBanners && banners.length === 0 && null}

      {/* ── RECOMMENDATIONS ── */}
      <DCard>
        <CardHeader title="💡 Recommended for You" action={<LinkBtn label="See all →" />} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' }, gap: 1.5 }}>
          {[
            { e: '🎓', t: 'Civil Servant Loan', s: 'Flexible repayment terms designed for government employees.', c: 'Check Eligibility →', r: '/edufinance/civil-servant-loan' },
            { e: '🏖️', t: 'Vacation Packages', s: 'All-inclusive travel packages tailored to your budget.', c: 'Explore →', r: '/travel/vacation' },
            { e: '🌍', t: 'European Citizenship', s: 'Acquire a second citizenship through investment.', c: 'View Programmes →', r: '/citizenship/europe' },
          ].map(rec => (
            <Box key={rec.t} onClick={() => navigate(rec.r)}
              sx={{
                border: `1.5px solid ${C.g200}`, borderRadius: '12px', p: 2,
                cursor: 'pointer', transition: 'all .15s',
                '&:hover': { borderColor: C.brand, boxShadow: `0 0 0 3px ${C.accentXL}` },
              }}>
              <Typography sx={{ fontSize: 24, mb: 1 }}>{rec.e}</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.g900, mb: 0.5 }}>{rec.t}</Typography>
              <Typography sx={{ fontSize: 11, color: C.g500 }}>{rec.s}</Typography>
              <Typography sx={{ mt: 1.2, fontSize: 12, fontWeight: 700, color: C.brand }}>{rec.c}</Typography>
            </Box>
          ))}
        </Box>
      </DCard>

      {/* ── MODALS ── */}

      {/* All Transactions */}
      <Dialog open={openTransactionsModal} onClose={() => setOpenTransactionsModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>All Transactions</DialogTitle>
        <DialogContent dividers sx={{ px: 0, pb: 0 }}>
          {transactionsLoading ? (
            <Box display="flex" alignItems="center" justifyContent="center" py={4}>
              <CircularProgress size={22} />
              <Typography sx={{ ml: 1.5 }} color="text.secondary" fontSize="0.95rem">Loading…</Typography>
            </Box>
          ) : transactionsError ? (
            <Box py={2} px={2}><Typography color="error" variant="body2">{transactionsError}</Typography></Box>
          ) : (
            <List dense>
              {transactions.map((tx: any) => (
                <ListItem key={tx.id} disableGutters sx={{ px: 2, py: 0.5, display: 'flex', justifyContent: 'space-between' }}>
                  <ListItemText
                    primary={getTransactionDescription(tx)}
                    secondary={tx.date}
                    sx={{ span: { fontSize: '1rem', fontWeight: 500 }, '.MuiListItemText-secondary': { fontSize: '0.85rem' } }}
                  />
                  <Box display="flex" flexDirection="column" alignItems="flex-end">
                    <Typography variant="body2" sx={{ color: tx.amount < 0 ? 'error.main' : 'success.main', fontWeight: 600 }}>
                      {tx.amount < 0 ? '−' : '+'}{tx.currency || cur} {Math.abs(tx.amount)}
                    </Typography>
                    <Chip label={tx.amount < 0 ? 'Debit' : 'Credit'} size="small" color={tx.amount < 0 ? 'error' : 'success'} sx={{ mt: 0.2 }} />
                  </Box>
                </ListItem>
              ))}
              {transactions.length === 0 && (
                <ListItem disableGutters sx={{ px: 2 }}><ListItemText primary="No transactions found." /></ListItem>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTransactionsModal(false)} variant="contained" sx={{ background: C.brand }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Fund Wallet */}
      <Dialog open={openFundWallet} onClose={() => setOpenFundWallet(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Fund Wallet</DialogTitle>
        <DialogContent><FundWalletModalContent user={user} /></DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFundWallet(false)} variant="contained" sx={{ background: C.brand }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Action modal */}
      <Dialog open={openModal} onClose={() => { setOpenModal(false); setModalLabel(null); setFormState({}); }} maxWidth="sm" fullWidth>
        <DialogTitle>{modalLabel}</DialogTitle>
        <DialogContent>
          {modalLabel && actionForms(formState, setFormState)[modalLabel]
            ? actionForms(formState, setFormState)[modalLabel]
            : <Typography>No form available.</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenModal(false); setModalLabel(null); setFormState({}); }} color="secondary" disabled={submitting}>Cancel</Button>
          <Button onClick={handleModalSubmit} variant="contained" disabled={submitting} sx={{ background: C.brand }}>
            {submitting ? 'Submitting…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Suppress unused isMobile/isMd warnings */}
      {(isMobile || isMd) && null}

      {/* ── FAB — Help & Chat ── */}
      <Box sx={{ position: 'fixed', bottom: { xs: 16, sm: 28 }, right: { xs: 16, sm: 28 }, zIndex: 1300 }}>

        {/* FAB menu items */}
        {fabOpen && (
          <Box sx={{ position: 'absolute', bottom: 60, right: 0, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end', mb: 1 }}>
            {[
              { emoji: '💬', label: 'Live Chat',       onClick: () => navigate('/support/chat') },
              { emoji: '🎫', label: 'Raise a Ticket',  onClick: () => navigate('/support/tickets') },
              { emoji: '📚', label: 'Knowledge Base',  onClick: () => navigate('/support/tickets') },
              { emoji: '🤖', label: 'Ask AI',          onClick: () => navigate('/support/chat') },
            ].map(item => (
              <Box
                key={item.label}
                onClick={() => { item.onClick(); setFabOpen(false); }}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer',
                  bgcolor: '#fff', borderRadius: '20px', px: 2, py: 1,
                  boxShadow: '0 4px 18px rgba(0,0,0,.12)', border: `1.5px solid ${C.g200}`,
                  transition: 'all .15s',
                  '&:hover': { borderColor: C.brand, bgcolor: C.accentXL },
                  '&:hover .fab-label': { color: C.brand },
                }}
              >
                <Box sx={{ fontSize: 16 }}>{item.emoji}</Box>
                <Typography className="fab-label" sx={{ fontSize: 12, fontWeight: 700, color: C.g700, whiteSpace: 'nowrap', transition: 'color .15s' }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* FAB main button */}
        <Box
          onClick={() => setFabOpen(o => !o)}
          sx={{
            width: 52, height: 52, borderRadius: '50%',
            background: fabOpen
              ? `linear-gradient(135deg, ${C.brandDark}, ${C.accent})`
              : `linear-gradient(135deg, ${C.brand}, ${C.accent})`,
            boxShadow: '0 6px 20px rgba(182,106,237,.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, cursor: 'pointer', transition: 'all .2s',
            transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            '&:hover': { boxShadow: '0 8px 28px rgba(182,106,237,.5)', transform: fabOpen ? 'rotate(45deg) scale(1.05)' : 'scale(1.05)' },
          }}
        >
          {fabOpen ? '✕' : '💬'}
        </Box>
      </Box>
    </Box>
  );
};
