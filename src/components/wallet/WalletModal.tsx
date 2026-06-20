/**
 * WalletModal — Premium redesign
 * ================================
 * Revolut / Cash-App grade wallet UI.
 *
 * • Full-screen on mobile, centred sheet on desktop
 * • Gradient hero header with live balance
 * • Large amount keypad (not a tiny form field)
 * • Quick-amount chips
 * • Premium payment-method cards
 * • Withdraw: bank select → account → review → confirm
 * • Animated success / error states
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert, Autocomplete, Box, Button, Chip, CircularProgress,
  Dialog, DialogContent, IconButton, InputAdornment,
  Slide, Snackbar, TextField, Tooltip, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import CloseIcon              from '@mui/icons-material/Close';
import ArrowBackIcon          from '@mui/icons-material/ArrowBack';
import ContentCopyIcon        from '@mui/icons-material/ContentCopy';
import LockIcon               from '@mui/icons-material/Lock';
import NorthIcon              from '@mui/icons-material/North';
import SouthIcon              from '@mui/icons-material/South';
import CheckCircleIcon        from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon       from '@mui/icons-material/ErrorOutline';
import AccountBalanceIcon     from '@mui/icons-material/AccountBalance';
import CreditCardIcon         from '@mui/icons-material/CreditCard';
import PhoneAndroidIcon       from '@mui/icons-material/PhoneAndroid';

import {
  flwInitiatePayment, flwVerifyPayment, flwWithdraw, flwGetBanks,
  type BankOption,
} from '../../services/walletService';
import { useAuth } from '../../context/AuthContext';

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const C = {
  brand:       '#8b2b8c',
  brandDark:   '#6d1f6e',
  brandMid:    '#a93dab',
  brandLight:  '#c96acb',
  accentXL:    '#f9f0fe',
  accentLight: '#f0d9fb',
  gold:        '#F59E0B',
  g0:          '#FFFFFF',
  g50:         '#FAFAFA',
  g100:        '#F4F4F5',
  g200:        '#E4E4E7',
  g300:        '#D4D4D8',
  g400:        '#A1A1AA',
  g500:        '#71717A',
  g700:        '#3F3F46',
  g900:        '#18181B',
  green:       '#16A34A',
  greenLight:  '#DCFCE7',
  greenBorder: '#86EFAC',
  red:         '#DC2626',
  redLight:    '#FEE2E2',
  amber:       '#D97706',
  amberLight:  '#FEF3C7',
} as const;

const SX_INPUT = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    fontSize: 14,
    bgcolor: C.g50,
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: C.brand, borderWidth: 2 },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: C.g300 },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: C.brand },
};

/* ─── Slide-up transition ────────────────────────────────────────────────── */
const SlideUp = React.forwardRef(function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/* ─── Flutterwave inline loader ──────────────────────────────────────────── */
function openFlwCheckout(config: Record<string, any>) {
  const win = window as any;
  const fire = () => win.FlutterwaveCheckout(config);
  if (typeof win.FlutterwaveCheckout === 'function') { fire(); return; }
  let script = document.getElementById('flw-script') as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id  = 'flw-script';
    script.src = 'https://checkout.flutterwave.com/v3.js';
    document.head.appendChild(script);
  }
  script.addEventListener('load', fire, { once: true });
}

/* ─── Quick amount chips ─────────────────────────────────────────────────── */
const QUICK_AMOUNTS = [500, 1_000, 2_000, 5_000, 10_000, 50_000];

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface WalletModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (newBalance?: number) => void;
  walletBalance?: number;
  user?: any;
  initialTab?: 'deposit' | 'withdraw';
}

type Tab      = 'deposit' | 'withdraw';
type DepMethod = 'flutterwave' | 'manual';
type WStep    = 'form' | 'review' | 'done' | 'error';

/* ══════════════════════════════════════════════════════════════════════════ */
/*  HERO HEADER                                                               */
/* ══════════════════════════════════════════════════════════════════════════ */
const HeroHeader: React.FC<{
  tab: Tab; balance?: number; user: any; onClose: () => void;
}> = ({ tab, balance, user, onClose }) => (
  <Box sx={{
    background: 'linear-gradient(135deg, #6d1f6e 0%, #8b2b8c 45%, #a93dab 100%)',
    px: { xs: 2.5, sm: 3 }, pt: { xs: 3, sm: 3.5 }, pb: 2.5,
    position: 'relative', overflow: 'hidden',
  }}>
    {/* Decorative orbs */}
    <Box sx={{ position:'absolute', top:-40, right:-40, width:150, height:150,
      bgcolor:'rgba(255,255,255,.06)', borderRadius:'50%', pointerEvents:'none' }}/>
    <Box sx={{ position:'absolute', bottom:-50, left:-20, width:120, height:120,
      bgcolor:'rgba(255,255,255,.04)', borderRadius:'50%', pointerEvents:'none' }}/>

    {/* Top row */}
    <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:2.5, position:'relative', zIndex:1 }}>
      <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
        {/* Avatar */}
        <Box sx={{
          width:40, height:40, borderRadius:'50%', flexShrink:0,
          background:'rgba(255,255,255,.2)', backdropFilter:'blur(8px)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontWeight:800, fontSize:15, color:'#fff', border:'2px solid rgba(255,255,255,.35)',
        }}>
          {user?.first_name?.[0]?.toUpperCase() ?? '?'}
        </Box>
        <Box>
          <Typography sx={{ fontSize:11, color:'rgba(255,255,255,.6)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.6px' }}>
            GrazConcept Wallet
          </Typography>
          <Typography sx={{ fontSize:13.5, fontWeight:800, color:'#fff', lineHeight:1.2 }}>
            {user?.first_name ?? ''} {user?.last_name ?? ''}
          </Typography>
        </Box>
      </Box>
      <IconButton onClick={onClose} size="small"
        sx={{ color:'rgba(255,255,255,.8)', bgcolor:'rgba(255,255,255,.12)',
          backdropFilter:'blur(8px)', borderRadius:'10px', p:0.75,
          '&:hover':{ bgcolor:'rgba(255,255,255,.22)' } }}>
        <CloseIcon sx={{ fontSize:18 }}/>
      </IconButton>
    </Box>

    {/* Balance */}
    <Box sx={{ position:'relative', zIndex:1 }}>
      <Typography sx={{ fontSize:10.5, color:'rgba(255,255,255,.55)', textTransform:'uppercase',
        letterSpacing:'1.2px', fontWeight:700, mb:0.5 }}>
        Available balance
      </Typography>
      <Typography sx={{ fontSize:{ xs:34, sm:40 }, fontWeight:900, color:'#fff',
        letterSpacing:'-1.5px', lineHeight:1, mb:0.5 }}>
        <span style={{ fontSize:'55%', verticalAlign:'super', opacity:.7, marginRight:2 }}>₦</span>
        {balance != null ? balance.toLocaleString() : '—'}
      </Typography>
      <Box sx={{ display:'inline-flex', alignItems:'center', gap:0.5,
        bgcolor:'rgba(255,255,255,.12)', borderRadius:'20px', px:1.2, py:0.35, mt:0.5 }}>
        <LockIcon sx={{ fontSize:10, color:'rgba(255,255,255,.7)' }}/>
        <Typography sx={{ fontSize:10, color:'rgba(255,255,255,.7)', fontWeight:600 }}>NGN • Secured</Typography>
      </Box>
    </Box>
  </Box>
);

/* ══════════════════════════════════════════════════════════════════════════ */
/*  TAB BAR                                                                   */
/* ══════════════════════════════════════════════════════════════════════════ */
const TabBar: React.FC<{ tab: Tab; onChange: (t: Tab) => void }> = ({ tab, onChange }) => (
  <Box sx={{ display:'flex', gap:1, p:1.5, bgcolor:C.g50, borderBottom:`1px solid ${C.g100}` }}>
    {(['deposit','withdraw'] as Tab[]).map(t => {
      const active = tab === t;
      const Icon = t === 'deposit' ? NorthIcon : SouthIcon;
      return (
        <Box key={t} onClick={() => onChange(t)}
          sx={{
            flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:0.75,
            py:1, borderRadius:'12px', cursor:'pointer', transition:'all .18s',
            bgcolor: active ? C.brand : 'transparent',
            '&:hover': { bgcolor: active ? C.brand : C.accentLight },
          }}>
          <Icon sx={{ fontSize:15, color: active ? '#fff' : C.g500 }}/>
          <Typography sx={{
            fontSize:13, fontWeight:700, textTransform:'capitalize',
            color: active ? '#fff' : C.g500,
          }}>
            {t === 'deposit' ? 'Add Money' : 'Withdraw'}
          </Typography>
        </Box>
      );
    })}
  </Box>
);

/* ══════════════════════════════════════════════════════════════════════════ */
/*  AMOUNT INPUT (big, centred, Cash-App style)                              */
/* ══════════════════════════════════════════════════════════════════════════ */
const AmountInput: React.FC<{
  value: string; onChange: (v: string) => void; label?: string;
}> = ({ value, onChange, label = 'Enter amount' }) => {
  const display = value ? parseFloat(value).toLocaleString() : '0';
  return (
    <Box sx={{ textAlign:'center', py:2.5 }}>
      <Typography sx={{ fontSize:11, color:C.g400, fontWeight:600, textTransform:'uppercase',
        letterSpacing:'0.8px', mb:1.5 }}>
        {label}
      </Typography>
      <Box sx={{ display:'flex', alignItems:'baseline', justifyContent:'center', gap:0.5 }}>
        <Typography sx={{ fontSize:20, fontWeight:800, color:C.g400 }}>₦</Typography>
        <Typography sx={{
          fontSize:{ xs:44, sm:52 }, fontWeight:900, color: value && parseFloat(value) > 0 ? C.g900 : C.g300,
          letterSpacing:'-2px', lineHeight:1, minWidth:80,
        }}>
          {display}
        </Typography>
      </Box>
      {/* Hidden real input */}
      <input
        type="number"
        value={value}
        min={0}
        onChange={e => onChange(e.target.value)}
        style={{
          opacity:0, position:'absolute', pointerEvents:'none', width:1, height:1,
        }}
      />
      {/* Quick chips */}
      <Box sx={{ display:'flex', gap:0.75, flexWrap:'wrap', justifyContent:'center', mt:2 }}>
        {QUICK_AMOUNTS.map(q => (
          <Chip
            key={q}
            label={q >= 1000 ? `₦${q/1000}k` : `₦${q}`}
            size="small"
            onClick={() => onChange(String(q))}
            sx={{
              height:30, fontSize:12.5, fontWeight:700, borderRadius:'20px', cursor:'pointer',
              bgcolor: parseFloat(value) === q ? C.brand : C.g100,
              color:   parseFloat(value) === q ? '#fff' : C.g700,
              border:  parseFloat(value) === q ? `1.5px solid ${C.brand}` : `1.5px solid ${C.g200}`,
              '&:hover':{ bgcolor: parseFloat(value) === q ? C.brandDark : C.accentLight, color: parseFloat(value) === q ? '#fff' : C.brand },
              transition:'all .15s',
            }}
          />
        ))}
      </Box>
      {/* Tap-to-edit row */}
      <Box sx={{ mt:1.5 }}>
        <TextField
          size="small"
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Or type any amount"
          inputProps={{ min:0, style:{ textAlign:'center', fontSize:13 } }}
          sx={{
            width:180,
            '& .MuiOutlinedInput-root':{ borderRadius:'20px', bgcolor:C.g50 },
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline':{ borderColor:C.brand },
          }}
          InputProps={{
            startAdornment:<InputAdornment position="start"><Typography sx={{fontSize:13,color:C.g400}}>₦</Typography></InputAdornment>,
          }}
        />
      </Box>
    </Box>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/*  PAYMENT METHOD CARD                                                       */
/* ══════════════════════════════════════════════════════════════════════════ */
const MethodCard: React.FC<{
  active: boolean; onClick: () => void;
  icon: React.ReactNode; title: string; sub: string; badge?: string;
}> = ({ active, onClick, icon, title, sub, badge }) => (
  <Box onClick={onClick}
    sx={{
      display:'flex', alignItems:'center', gap:2, p:2, borderRadius:'16px', cursor:'pointer',
      border:`2px solid ${active ? C.brand : C.g200}`,
      bgcolor: active ? C.accentXL : '#fff',
      transition:'all .18s',
      '&:hover':{ borderColor: active ? C.brand : C.g300, bgcolor: active ? C.accentXL : C.g50 },
      position:'relative', overflow:'hidden',
    }}>
    {/* Left icon box */}
    <Box sx={{
      width:44, height:44, borderRadius:'12px', flexShrink:0,
      display:'flex', alignItems:'center', justifyContent:'center',
      bgcolor: active ? C.brand : C.g100,
      color:   active ? '#fff' : C.g500,
      transition:'all .18s',
    }}>
      {icon}
    </Box>
    <Box sx={{ flex:1, minWidth:0 }}>
      <Typography sx={{ fontSize:13.5, fontWeight:700, color:C.g900 }}>{title}</Typography>
      <Typography sx={{ fontSize:11.5, color:C.g400, mt:0.15 }}>{sub}</Typography>
    </Box>
    {badge && (
      <Chip label={badge} size="small"
        sx={{ fontSize:10, fontWeight:700, height:20, bgcolor:C.greenLight, color:C.green,
          border:`1px solid ${C.greenBorder}` }}/>
    )}
    {active && (
      <Box sx={{
        position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
        width:20, height:20, borderRadius:'50%', bgcolor:C.brand,
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <CheckCircleIcon sx={{ fontSize:14, color:'#fff' }}/>
      </Box>
    )}
  </Box>
);

/* ══════════════════════════════════════════════════════════════════════════ */
/*  SUCCESS SCREEN                                                            */
/* ══════════════════════════════════════════════════════════════════════════ */
const SuccessScreen: React.FC<{
  title: string; subtitle: string; amount?: number; ref?: string;
  ctaLabel?: string; onCta?: () => void;
}> = ({ title, subtitle, amount, ref: txRef, ctaLabel, onCta }) => (
  <Box sx={{ textAlign:'center', py:4, px:2 }}>
    {/* Animated green circle */}
    <Box sx={{
      width:80, height:80, borderRadius:'50%', bgcolor:C.greenLight,
      display:'flex', alignItems:'center', justifyContent:'center', mx:'auto', mb:2.5,
      border:`3px solid ${C.greenBorder}`, boxShadow:'0 0 0 8px rgba(22,163,74,.08)',
    }}>
      <CheckCircleIcon sx={{ fontSize:40, color:C.green }}/>
    </Box>
    {amount != null && (
      <Typography sx={{ fontSize:36, fontWeight:900, color:C.g900, letterSpacing:'-1.5px', mb:0.25 }}>
        ₦{amount.toLocaleString()}
      </Typography>
    )}
    <Typography sx={{ fontSize:17, fontWeight:800, color:C.g900, mb:0.5 }}>{title}</Typography>
    <Typography sx={{ fontSize:13, color:C.g500, lineHeight:1.6, mb: txRef ? 1 : 2.5 }}>{subtitle}</Typography>
    {txRef && (
      <Typography sx={{ fontSize:11, color:C.g300, mb:2.5, fontFamily:'monospace' }}>Ref: {txRef}</Typography>
    )}
    {ctaLabel && onCta && (
      <Button variant="contained" onClick={onCta}
        sx={{ bgcolor:C.brand, fontWeight:800, borderRadius:'14px', textTransform:'none',
          px:4, py:1.2, '&:hover':{ bgcolor:C.brandDark } }}>
        {ctaLabel}
      </Button>
    )}
  </Box>
);

/* ══════════════════════════════════════════════════════════════════════════ */
/*  DEPOSIT PANEL                                                             */
/* ══════════════════════════════════════════════════════════════════════════ */
const DepositPanel: React.FC<{ user: any; onSuccess: (bal?: number) => void }> = ({ user, onSuccess }) => {
  const [method,  setMethod]  = useState<DepMethod>('flutterwave');
  const [amount,  setAmount]  = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<{ amount: number; balance: number } | null>(null);
  const [snack,   setSnack]   = useState(false);
  const ACCT = '4000331192';

  const handlePay = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 100) { setError('Minimum deposit is ₦100.'); return; }
    setError(null); setLoading(true);
    try {
      const init = await flwInitiatePayment({
        amount: amt, currency:'NGN', transaction_type:'deposit',
        description:'GrazConcept Wallet top-up',
      });
      const pubKey = init.public_key || (import.meta as any).env?.VITE_FLUTTERWAVE_PUBLIC_KEY || '';
      openFlwCheckout({
        public_key: pubKey,
        tx_ref:     init.reference,
        amount:     init.amount,
        currency:   init.currency,
        payment_options: 'card,banktransfer,ussd,mobilemoneynigeria',
        customer: { email: init.email, phone_number: init.phone, name: init.name },
        customizations: { title:'GrazConcept Wallet', description: init.description, logo:'' },
        callback: async (res: any) => {
          if (res.status === 'successful' || res.status === 'completed') {
            try {
              const v = await flwVerifyPayment({ transaction_id: res.transaction_id, reference: init.reference });
              setSuccess({ amount: v.amount, balance: v.new_balance });
              onSuccess(v.new_balance);
            } catch (e: any) {
              setError(e?.response?.data?.detail ?? 'Verification failed. Contact support.');
            }
          } else {
            setError('Payment was not completed.');
          }
          setLoading(false);
        },
        onclose: () => setLoading(false),
      });
    } catch (e: any) {
      setLoading(false);
      setError(e?.response?.data?.detail ?? 'Could not start checkout. Try again.');
    }
  };

  if (success) return (
    <SuccessScreen
      title="Deposit Successful!"
      subtitle={`Your wallet has been funded. New balance: ₦${success.balance.toLocaleString()}`}
      amount={success.amount}
      ctaLabel="Fund again"
      onCta={() => { setSuccess(null); setAmount(''); }}
    />
  );

  return (
    <Box>
      {/* Amount */}
      <AmountInput value={amount} onChange={v => { setAmount(v); setError(null); }} />

      <Box sx={{ px:{ xs:2, sm:2.5 }, pb:2 }}>
        {error && (
          <Alert severity="error" icon={<ErrorOutlineIcon sx={{ fontSize:18 }}/>}
            sx={{ mb:2, borderRadius:'12px', fontSize:12.5, py:0.75 }}>
            {error}
          </Alert>
        )}

        {/* Payment method */}
        <Typography sx={{ fontSize:11, fontWeight:700, color:C.g400, textTransform:'uppercase',
          letterSpacing:'0.7px', mb:1.5 }}>
          Pay with
        </Typography>
        <Box sx={{ display:'flex', flexDirection:'column', gap:1.25, mb:2.5 }}>
          <MethodCard
            active={method === 'flutterwave'}
            onClick={() => setMethod('flutterwave')}
            icon={<CreditCardIcon sx={{ fontSize:22 }}/>}
            title="Card / Bank / USSD"
            sub="Instant • Powered by Flutterwave"
            badge="Instant"
          />
          <MethodCard
            active={method === 'manual'}
            onClick={() => setMethod('manual')}
            icon={<AccountBalanceIcon sx={{ fontSize:22 }}/>}
            title="Manual Bank Transfer"
            sub="1–3 business days"
          />
        </Box>

        {method === 'flutterwave' ? (
          <>
            <Button variant="contained" fullWidth onClick={handlePay}
              disabled={loading || !amount || parseFloat(amount) < 100}
              sx={{
                bgcolor: C.brand, fontWeight:800, fontSize:15, borderRadius:'16px', py:1.75,
                textTransform:'none', boxShadow:'0 6px 20px rgba(139,43,140,.4)',
                '&:hover':{ bgcolor:C.brandDark, boxShadow:'0 8px 24px rgba(139,43,140,.5)' },
                '&.Mui-disabled':{ bgcolor:C.g200, color:C.g400, boxShadow:'none' },
                transition:'all .2s',
              }}>
              {loading
                ? <><CircularProgress size={16} color="inherit" sx={{ mr:1 }}/> Opening checkout…</>
                : `Pay ₦${amount && parseFloat(amount) > 0 ? parseFloat(amount).toLocaleString() : '0'}`}
            </Button>
            <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0.75, mt:1.5 }}>
              <LockIcon sx={{ fontSize:12, color:C.g300 }}/>
              <Typography sx={{ fontSize:11, color:C.g400 }}>256-bit SSL encrypted • Secured by Flutterwave</Typography>
            </Box>
          </>
        ) : (
          /* Manual transfer details */
          <Box>
            <Box sx={{ borderRadius:'16px', overflow:'hidden', border:`1px solid ${C.g200}`, mb:2 }}>
              {[
                { label:'Account Name',   value:'GRAZLINKS ENTERPRISE – GRAZ TRAVEL & TOUR SERVICES', copy:false },
                { label:'Account Number', value:ACCT, copy:true },
                { label:'Bank',           value:'Moniepoint MFB', copy:false },
              ].map((row, i, arr) => (
                <Box key={row.label}
                  sx={{ px:2, py:1.5, display:'flex', alignItems:'center', justifyContent:'space-between',
                    borderBottom: i < arr.length-1 ? `1px solid ${C.g100}` : 'none',
                    bgcolor: i % 2 === 0 ? '#fff' : C.g50 }}>
                  <Box sx={{ minWidth:0 }}>
                    <Typography sx={{ fontSize:10.5, color:C.g400, fontWeight:600, textTransform:'uppercase',
                      letterSpacing:'0.5px', mb:0.2 }}>
                      {row.label}
                    </Typography>
                    <Typography sx={{ fontSize:13.5, fontWeight:700, color:C.g900, wordBreak:'break-word' }}>
                      {row.value}
                    </Typography>
                  </Box>
                  {row.copy && (
                    <Tooltip title="Copy">
                      <IconButton size="small" onClick={() => { navigator.clipboard.writeText(row.value); setSnack(true); }}
                        sx={{ ml:1, flexShrink:0, bgcolor:C.accentXL, borderRadius:'8px',
                          '&:hover':{ bgcolor:C.accentLight } }}>
                        <ContentCopyIcon sx={{ fontSize:15, color:C.brand }}/>
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              ))}
            </Box>

            {/* Steps */}
            {[
              { n:'1', t:'Make the transfer', s:'Send any amount to the account above from your bank app.' },
              { n:'2', t:'Email your receipt', s:'Send proof to peter.oluwole@grazconcept.com.ng' },
              { n:'3', t:'Wallet credited',   s:'Your balance is updated within 1–3 business days.' },
            ].map(step => (
              <Box key={step.n} sx={{ display:'flex', gap:1.5, mb:1.5 }}>
                <Box sx={{ width:24, height:24, borderRadius:'50%', bgcolor:C.brand, color:'#fff',
                  flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:11, fontWeight:800 }}>
                  {step.n}
                </Box>
                <Box>
                  <Typography sx={{ fontSize:13, fontWeight:700, color:C.g900 }}>{step.t}</Typography>
                  <Typography sx={{ fontSize:12, color:C.g500 }}>{step.s}</Typography>
                </Box>
              </Box>
            ))}

            <Box sx={{ mt:2, p:1.75, bgcolor:'#fffbe6', borderRadius:'12px', border:'1px solid #FDE68A' }}>
              <Typography sx={{ fontSize:12, color:'#92400E', fontWeight:700 }}>⚠ Refund Policy</Typography>
              <Typography sx={{ fontSize:11.5, color:'#B45309', mt:0.25 }}>
                15% charges apply on any refunded capital.
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      <Snackbar open={snack} autoHideDuration={2000} onClose={() => setSnack(false)}
        anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
        <Alert elevation={6} variant="filled" severity="success" onClose={() => setSnack(false)}>
          Account number copied!
        </Alert>
      </Snackbar>
    </Box>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/*  WITHDRAW PANEL                                                            */
/* ══════════════════════════════════════════════════════════════════════════ */
const WithdrawPanel: React.FC<{
  user: any; walletBalance?: number; onSuccess: (bal?: number) => void;
}> = ({ user, walletBalance, onSuccess }) => {
  const [step,    setStep]    = useState<WStep>('form');
  const [banks,   setBanks]   = useState<BankOption[]>([]);
  const [bkLoad,  setBkLoad]  = useState(false);
  const [bank,    setBank]    = useState<BankOption | null>(null);
  const [acctNo,  setAcctNo]  = useState('');
  const [acctName,setAcctName] = useState('');
  const [amount,  setAmount]  = useState('');
  const [note,    setNote]    = useState('Wallet withdrawal');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [txRef,   setTxRef]   = useState('');

  useEffect(() => {
    setBkLoad(true);
    flwGetBanks('NG').then(setBanks).catch(() => setBanks([])).finally(() => setBkLoad(false));
  }, []);

  const validate = () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 500) { setError('Minimum withdrawal is ₦500.'); return false; }
    if (walletBalance != null && amt > walletBalance) { setError(`Insufficient balance. You have ₦${walletBalance.toLocaleString()}.`); return false; }
    if (!bank) { setError('Select your bank.'); return false; }
    if (acctNo.length < 10) { setError('Enter a valid 10-digit account number.'); return false; }
    return true;
  };

  const handleReview = () => {
    if (!validate()) return;
    setError(null);
    setStep('review');
  };

  const handleConfirm = async () => {
    setLoading(true); setError(null);
    try {
      const res = await flwWithdraw({
        amount: parseFloat(amount),
        account_bank:    bank!.code,
        account_number:  acctNo,
        beneficiary_name: acctName || `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim(),
        narration: note,
        currency: 'NGN',
      });
      setTxRef(res.reference);
      setStep('done');
      onSuccess();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Withdrawal failed. Please try again.');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'done') return (
    <SuccessScreen
      title="Withdrawal Initiated"
      subtitle="Your funds are on the way. Processing typically takes a few minutes."
      amount={parseFloat(amount)}
      ref={txRef}
      ctaLabel="Make another withdrawal"
      onCta={() => { setStep('form'); setAmount(''); setBank(null); setAcctNo(''); setAcctName(''); }}
    />
  );

  if (step === 'review') return (
    <Box sx={{ px:{ xs:2, sm:2.5 }, py:2 }}>
      {/* Back */}
      <Button startIcon={<ArrowBackIcon/>} onClick={() => setStep('form')} size="small"
        sx={{ color:C.g500, textTransform:'none', fontWeight:600, mb:2, p:0 }}>
        Edit details
      </Button>

      <Typography sx={{ fontWeight:800, fontSize:16, color:C.g900, mb:0.5 }}>Confirm withdrawal</Typography>
      <Typography sx={{ fontSize:12.5, color:C.g500, mb:2.5 }}>Please review your details before confirming.</Typography>

      {/* Amount highlight */}
      <Box sx={{ textAlign:'center', py:2.5, mb:2, borderRadius:'16px',
        background:'linear-gradient(135deg, #f9f0fe 0%, #f0d9fb 100%)',
        border:`1.5px solid ${C.accentLight}` }}>
        <Typography sx={{ fontSize:12, color:C.brand, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.6px' }}>
          You're withdrawing
        </Typography>
        <Typography sx={{ fontSize:40, fontWeight:900, color:C.brand, letterSpacing:'-1.5px' }}>
          ₦{parseFloat(amount).toLocaleString()}
        </Typography>
      </Box>

      {/* Details */}
      <Box sx={{ borderRadius:'14px', overflow:'hidden', border:`1px solid ${C.g200}`, mb:2.5 }}>
        {[
          { label:'Bank',           value: bank?.name ?? '—' },
          { label:'Account Number', value: acctNo },
          { label:'Account Name',   value: acctName || `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || '—' },
          { label:'Narration',      value: note },
        ].map((row, i, arr) => (
          <Box key={row.label}
            sx={{ px:2, py:1.25, display:'flex', justifyContent:'space-between', alignItems:'flex-start',
              borderBottom: i < arr.length-1 ? `1px solid ${C.g100}` : 'none',
              bgcolor: i % 2 === 0 ? '#fff' : C.g50 }}>
            <Typography sx={{ fontSize:12, color:C.g400, fontWeight:600 }}>{row.label}</Typography>
            <Typography sx={{ fontSize:13, color:C.g900, fontWeight:700, textAlign:'right', maxWidth:'60%', wordBreak:'break-word' }}>
              {row.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb:2, borderRadius:'12px', fontSize:12.5 }}>{error}</Alert>
      )}

      <Button variant="contained" fullWidth onClick={handleConfirm} disabled={loading}
        sx={{
          bgcolor:C.brand, fontWeight:800, fontSize:15, borderRadius:'16px', py:1.75,
          textTransform:'none', boxShadow:'0 6px 20px rgba(139,43,140,.4)',
          '&:hover':{ bgcolor:C.brandDark }, '&.Mui-disabled':{ bgcolor:C.g200, color:C.g400, boxShadow:'none' },
        }}>
        {loading ? <><CircularProgress size={16} color="inherit" sx={{ mr:1 }}/> Processing…</> : 'Confirm & Withdraw'}
      </Button>

      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0.75, mt:1.5 }}>
        <LockIcon sx={{ fontSize:12, color:C.g300 }}/>
        <Typography sx={{ fontSize:11, color:C.g400 }}>Secured transfer via Flutterwave</Typography>
      </Box>
    </Box>
  );

  // Form step
  return (
    <Box>
      <AmountInput
        value={amount}
        onChange={v => { setAmount(v); setError(null); }}
        label="Withdrawal amount"
      />

      <Box sx={{ px:{ xs:2, sm:2.5 }, pb:2.5 }}>
        {walletBalance != null && (
          <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0.5, mb:2, mt:-1 }}>
            <Typography sx={{ fontSize:12, color:C.g400 }}>Balance:</Typography>
            <Typography sx={{ fontSize:12, fontWeight:700, color:C.g700 }}>₦{walletBalance.toLocaleString()}</Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" icon={<ErrorOutlineIcon sx={{ fontSize:18 }}/>}
            sx={{ mb:2, borderRadius:'12px', fontSize:12.5, py:0.75 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display:'flex', flexDirection:'column', gap:1.75 }}>
          <Autocomplete
            options={banks} loading={bkLoad} size="small"
            getOptionLabel={b => b.name}
            value={bank}
            onChange={(_, v) => setBank(v)}
            isOptionEqualToValue={(a, b) => a.code === b.code}
            renderInput={params => (
              <TextField {...params} label="Select Bank" sx={SX_INPUT}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (<>{bkLoad ? <CircularProgress size={14}/> : null}{params.InputProps.endAdornment}</>),
                }}
              />
            )}
          />

          <TextField
            label="Account Number" fullWidth size="small" value={acctNo}
            onChange={e => setAcctNo(e.target.value.replace(/\D/g,'').slice(0,10))}
            sx={SX_INPUT}
            inputProps={{ inputMode:'numeric', maxLength:10 }}
            helperText={acctNo.length > 0 ? `${acctNo.length}/10 digits` : '10-digit NUBAN number'}
          />

          <TextField
            label="Account Name (optional)" fullWidth size="small" value={acctName}
            onChange={e => setAcctName(e.target.value)} sx={SX_INPUT}
            placeholder={`${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim()}
          />

          <TextField
            label="Narration" fullWidth size="small" value={note}
            onChange={e => setNote(e.target.value)} sx={SX_INPUT}
          />
        </Box>

        <Button variant="contained" fullWidth onClick={handleReview}
          disabled={!amount || parseFloat(amount) < 500 || !bank || acctNo.length < 10}
          sx={{
            mt:2.5, bgcolor:C.brand, fontWeight:800, fontSize:15, borderRadius:'16px', py:1.75,
            textTransform:'none', boxShadow:'0 6px 20px rgba(139,43,140,.4)',
            '&:hover':{ bgcolor:C.brandDark }, '&.Mui-disabled':{ bgcolor:C.g200, color:C.g400, boxShadow:'none' },
          }}>
          Review Withdrawal
        </Button>

        <Typography sx={{ fontSize:11.5, color:C.g400, textAlign:'center', mt:1.5, lineHeight:1.6 }}>
          Withdrawals are processed within 24 hours via Flutterwave
        </Typography>
      </Box>
    </Box>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/*  ROOT MODAL                                                                */
/* ══════════════════════════════════════════════════════════════════════════ */
const WalletModal: React.FC<WalletModalProps> = ({
  open, onClose, onSuccess, walletBalance, user: userProp, initialTab = 'deposit',
}) => {
  const { user: authUser } = useAuth();
  const user = userProp ?? authUser;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [tab,     setTab]     = useState<Tab>(initialTab);
  const [balance, setBalance] = useState<number | undefined>(walletBalance);

  useEffect(() => { if (open) setTab(initialTab); }, [open, initialTab]);
  useEffect(() => { setBalance(walletBalance); }, [walletBalance]);

  const handleSuccess = useCallback((bal?: number) => {
    if (bal != null) setBalance(bal);
    onSuccess?.(bal);
  }, [onSuccess]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="xs"
      fullWidth
      TransitionComponent={isMobile ? SlideUp : undefined}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : '24px',
          overflow: 'hidden',
          ...(isMobile ? {
            margin: 0,
            maxHeight: '100%',
            width: '100%',
          } : {
            maxHeight: '90vh',
          }),
        },
      }}>
      {/* Hero */}
      <HeroHeader tab={tab} balance={balance} user={user} onClose={onClose}/>

      {/* Tab bar */}
      <TabBar tab={tab} onChange={t => setTab(t)}/>

      {/* Scrollable content */}
      <DialogContent sx={{ p:0, overflowY:'auto',
        '&::-webkit-scrollbar':{ width:4 },
        '&::-webkit-scrollbar-thumb':{ bgcolor:C.g200, borderRadius:4 },
      }}>
        {tab === 'deposit'  && <DepositPanel  user={user} onSuccess={handleSuccess}/>}
        {tab === 'withdraw' && <WithdrawPanel user={user} walletBalance={balance} onSuccess={handleSuccess}/>}
      </DialogContent>
    </Dialog>
  );
};

export default WalletModal;
