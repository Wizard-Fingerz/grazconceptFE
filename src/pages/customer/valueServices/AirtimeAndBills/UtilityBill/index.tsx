import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, TextField, Typography } from '@mui/material';
import api from '../../../../../services/api';
import {
  C, AmountDisplay, BillCtaButton, BillReceiptDialog, ErrorAlert,
  FormCard, PaymentMethodSelector, type PaymentMethod, ProviderBtn,
  SectionLabel, SplitLayout, SummaryPanel, generateRef,
} from '../_shared';

/* ─── DisCo list ─────────────────────────────────────────────────────────── */
const DISCOS = [
  { label: 'Ikeja Electric',  value: 'ikeja-electric',        initBg: '#fbbf24', initColor: '#78350f', init: 'IE' },
  { label: 'Eko Electric',    value: 'eko-electric',          initBg: '#0ea5e9', initColor: '#fff',    init: 'EE' },
  { label: 'Abuja Electric',  value: 'abuja-electric',        initBg: '#7c3aed', initColor: '#fff',    init: 'AE' },
  { label: 'Ibadan Electric', value: 'ibadan-electric',       initBg: '#1d4ed8', initColor: '#fff',    init: 'IB' },
  { label: 'Kano Electric',   value: 'kano-electric',         initBg: '#16a34a', initColor: '#fff',    init: 'KE' },
  { label: 'PH Electric',     value: 'portharcourt-electric', initBg: '#dc2626', initColor: '#fff',    init: 'PH' },
  { label: 'Benin Electric',  value: 'benin-electric',        initBg: '#0891b2', initColor: '#fff',    init: 'BE' },
  { label: 'Enugu Electric',  value: 'enugu-electric',        initBg: '#7e22ce', initColor: '#fff',    init: 'EG' },
];

/* ─── Meter verification hook ────────────────────────────────────────────── */
type VerifyStatus = 'idle' | 'loading' | 'verified' | 'error';

interface MeterInfo {
  customer_name: string;
  address: string;
  meter_number: string;
  minimum_amount: number;
}

function useMeterVerification(disco: string, meterNum: string, meterType: string) {
  const [status,   setStatus]   = useState<VerifyStatus>('idle');
  const [info,     setInfo]     = useState<MeterInfo | null>(null);
  const [errMsg,   setErrMsg]   = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Reset when inputs change
    setStatus('idle');
    setInfo(null);
    setErrMsg('');

    if (!disco || !meterType || meterNum.length < 11) return;

    // Debounce 800ms after user stops typing
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setStatus('loading');
      try {
        const tok = localStorage.getItem('token');
        const headers = tok ? { Authorization: `Bearer ${tok}` } : {};
        const res = await api.get('/value-services/bills/verify-meter/', {
          params: { disco, meter_number: meterNum, meter_type: meterType },
          headers,
        });
        setInfo(res.data);
        setStatus('verified');
      } catch (err: any) {
        const msg = err?.response?.data?.detail ?? 'Could not verify meter. Please check the number.';
        setErrMsg(msg);
        setStatus('error');
      }
    }, 800);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [disco, meterNum, meterType]);

  return { status, info, errMsg };
}

/* ─── Component ─────────────────────────────────────────────────────────── */
const PayUtilityBill: React.FC = () => {
  const [utility,    setUtility]    = useState('');
  const [meterType,  setMeterType]  = useState<'prepaid' | 'postpaid' | ''>('');
  const [meterNum,   setMeterNum]   = useState('');
  const [amount,     setAmount]     = useState(0);
  const [payMethod,  setPayMethod]  = useState<PaymentMethod>('wallet');
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState<string | null>(null);
  const [receipt,    setReceipt]    = useState(false);
  const [txRef,      setTxRef]      = useState('');
  const [token,      setToken]      = useState('');

  const selectedDisco = DISCOS.find(d => d.value === utility);

  // Auto-verify meter when all required fields present + meter is long enough
  const { status: verifyStatus, info: meterInfo, errMsg: verifyErr } =
    useMeterVerification(utility, meterNum, meterType);

  const minAmt = meterInfo?.minimum_amount ?? 500;
  const effectiveMin = Math.max(minAmt, 500);

  // Gate form: require verification for 11-digit meters
  const verificationRequired = meterNum.length >= 11 && !!utility && !!meterType;
  const isVerified = verifyStatus === 'verified';
  const verifying  = verifyStatus === 'loading';

  const canSubmit =
    !!utility && !!meterType &&
    meterNum.length >= 5 &&
    amount >= effectiveMin &&
    !submitting &&
    (!verificationRequired || isVerified);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setApiError(null);
    setSubmitting(true);
    try {
      const tok = localStorage.getItem('token');
      const headers = tok ? { Authorization: `Bearer ${tok}` } : {};
      const res = await api.post('/value-services/bills/pay/', {
        provider: utility,
        meter_type: meterType,
        meter_number: meterNum,
        amount,
        payment_method: payMethod,
      }, { headers });

      if (res.data?.status === 'pending' && res.data?.payment_url) {
        window.location.href = res.data.payment_url;
        return;
      }

      setTxRef(res.data?.reference ?? generateRef());
      setToken(res.data?.token ?? '');
      setReceipt(true);
    } catch (err: any) {
      const d = err?.response?.data;
      setApiError(d?.detail ?? d?.non_field_errors?.[0] ?? 'Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setUtility(''); setMeterType(''); setMeterNum('');
    setAmount(0); setApiError(null); setReceipt(false); setToken('');
  };

  const SX_F = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      '& fieldset': { borderColor: C.g200 },
      '&:hover fieldset': { borderColor: C.g300 },
      '&.Mui-focused fieldset': { borderColor: C.brand },
    },
  };

  const summaryRows = [
    { key: 'Provider',   value: selectedDisco?.label ?? '—' },
    { key: 'Meter type', value: meterType ? meterType.charAt(0).toUpperCase() + meterType.slice(1) : '—' },
    { key: 'Meter no.',  value: meterNum || '—' },
    { key: 'Customer',   value: meterInfo?.customer_name || '—' },
    { key: 'Pay via',    value: payMethod === 'wallet' ? '👛 Wallet' : payMethod === 'card' ? '💳 Card' : payMethod === 'bank_transfer' ? '🏦 Bank' : '📱 Mobile' },
    { key: 'Delivery',   value: 'Instant token ⚡', accent: true },
  ];

  return (
    <Box>
      <SplitLayout
        form={
          <FormCard iconBg="#fef3c7" icon="⚡" title="Pay Electricity Bill" subtitle="All DisCos · Token delivered instantly">
            <form onSubmit={handleSubmit}>

              {/* Provider */}
              <SectionLabel>Select Electricity Provider</SectionLabel>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
                {DISCOS.map(d => (
                  <ProviderBtn
                    key={d.value}
                    initial={d.init} initBg={d.initBg} initColor={d.initColor}
                    name={d.label} selected={utility === d.value}
                    onClick={() => { setUtility(d.value); setMeterNum(''); setApiError(null); }}
                  />
                ))}
              </Box>

              {/* Meter type */}
              <SectionLabel>Meter Type</SectionLabel>
              <Box sx={{ display: 'flex', gap: 1.25, mb: 2.5 }}>
                {([
                  { v: 'prepaid'  as const, label: 'Prepaid',  icon: '🔋' },
                  { v: 'postpaid' as const, label: 'Postpaid', icon: '📋' },
                ]).map(m => (
                  <Box
                    key={m.v}
                    onClick={() => { setMeterType(m.v); setApiError(null); }}
                    sx={{
                      flex: 1, display: 'flex', alignItems: 'center', gap: 1.25, p: '14px 16px',
                      borderRadius: '14px', cursor: 'pointer', transition: 'all .18s',
                      border: `1.5px solid ${meterType === m.v ? C.brand : C.g200}`,
                      bgcolor: meterType === m.v ? C.brandXs : C.g0,
                      boxShadow: meterType === m.v ? `0 0 0 3px rgba(139,43,140,.1)` : 'none',
                    }}
                  >
                    <Typography sx={{ fontSize: 22 }}>{m.icon}</Typography>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: meterType === m.v ? C.brandDark : C.g700 }}>
                      {m.label}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Meter number + inline verification */}
              <Box sx={{ mb: 2.5 }}>
                <TextField
                  fullWidth size="small" label="Meter Number"
                  value={meterNum}
                  onChange={e => {
                    setMeterNum(e.target.value.replace(/[^0-9a-zA-Z]/g, ''));
                    setApiError(null);
                  }}
                  placeholder="e.g. 45390000123"
                  sx={SX_F}
                  InputProps={{
                    endAdornment: verifying ? (
                      <CircularProgress size={16} sx={{ color: C.brand, mr: .5 }} />
                    ) : isVerified ? (
                      <Box sx={{
                        display: 'flex', alignItems: 'center', gap: .5,
                        fontSize: 11, fontWeight: 700, color: C.green,
                        bgcolor: C.greenLight, px: 1, py: .3, borderRadius: '8px', mr: .5,
                        whiteSpace: 'nowrap',
                      }}>
                        ✓ Verified
                      </Box>
                    ) : null,
                  }}
                />

                {/* Verification status */}
                {verifying && (
                  <Typography sx={{ fontSize: 11.5, color: C.g400, mt: .75, display: 'flex', alignItems: 'center', gap: .5 }}>
                    <CircularProgress size={10} sx={{ color: C.g400 }} /> Verifying meter…
                  </Typography>
                )}

                {verifyStatus === 'error' && meterNum.length >= 11 && (
                  <Box sx={{
                    mt: .75, p: '8px 12px', bgcolor: '#fff5f5',
                    border: `1px solid #fca5a5`, borderRadius: '10px',
                    fontSize: 12, color: C.red, lineHeight: 1.6,
                  }}>
                    ⚠ {verifyErr}
                  </Box>
                )}

                {isVerified && meterInfo && (
                  <Box sx={{
                    mt: .75, p: '10px 14px',
                    bgcolor: C.greenLight, border: `1px solid ${C.greenBorder}`,
                    borderRadius: '12px',
                  }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 800, color: C.green, mb: .25 }}>
                      ✅ Meter Verified
                    </Typography>
                    {meterInfo.customer_name && (
                      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: '#14532d' }}>
                        {meterInfo.customer_name}
                      </Typography>
                    )}
                    {meterInfo.address && (
                      <Typography sx={{ fontSize: 11.5, color: '#166534', mt: .2 }}>
                        {meterInfo.address}
                      </Typography>
                    )}
                    {meterInfo.minimum_amount > 500 && (
                      <Typography sx={{ fontSize: 11, color: '#166534', mt: .4, fontWeight: 600 }}>
                        Minimum vend: ₦{meterInfo.minimum_amount.toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>

              {/* Amount */}
              <AmountDisplay
                value={amount}
                onChange={v => { setAmount(v); setApiError(null); }}
                quickAmounts={[1000, 2000, 5000, 10000, 20000, 50000]}
                label="Amount to vend"
                min={effectiveMin}
              />

              {/* Payment method */}
              <SectionLabel>Payment Method</SectionLabel>
              <PaymentMethodSelector value={payMethod} onChange={setPayMethod} />

              {/* Token reminder */}
              {meterType === 'prepaid' && (
                <Box sx={{
                  bgcolor: C.amberLight, border: `1px solid #fde68a`,
                  borderRadius: '12px', p: '12px 16px', fontSize: 12, color: '#92400e',
                  lineHeight: 1.7, mb: 2.5,
                }}>
                  <strong>⚠ Save your token:</strong> Your prepaid token appears on-screen
                  immediately after payment. Screenshot it before closing this page.
                </Box>
              )}

              <ErrorAlert message={apiError} />

              <BillCtaButton disabled={!canSubmit} loading={submitting}>
                {verificationRequired && verifying
                  ? 'Verifying meter…'
                  : `Pay ₦${amount > 0 ? amount.toLocaleString() : '0'} · ${selectedDisco?.label ?? 'Electricity'}`}
              </BillCtaButton>

              {verificationRequired && verifyStatus === 'error' && (
                <Typography sx={{ fontSize: 11.5, color: C.red, textAlign: 'center', mt: 1 }}>
                  Please verify your meter number before proceeding.
                </Typography>
              )}
            </form>
          </FormCard>
        }
        summary={
          <SummaryPanel
            title="Bill Summary"
            displayAmt={amount > 0 ? amount.toLocaleString() : '0'}
            rows={summaryRows}
            trustBadges={['🔒 Encrypted', '⚡ Instant token', '✅ Verified']}
          />
        }
      />

      <BillReceiptDialog
        open={receipt} onClose={() => setReceipt(false)} onNew={resetForm}
        amount={amount} title="Bill Payment Successful!"
        subtitle={`${meterType === 'prepaid' ? 'Token generated' : 'Payment recorded'} for ${meterNum}`}
        rows={[
          { key: 'Provider',  value: selectedDisco?.label ?? '—' },
          { key: 'Customer',  value: meterInfo?.customer_name || '—' },
          { key: 'Meter No.', value: meterNum },
          { key: 'Type',      value: meterType ? meterType.charAt(0).toUpperCase() + meterType.slice(1) : '—' },
          ...(meterType === 'prepaid' && token
            ? [{ key: 'Token', value: token, mono: true }]
            : []),
          { key: 'Amount',    value: `₦${amount.toLocaleString()}` },
          { key: 'Status',    value: '✅ Processed' },
          { key: 'Reference', value: txRef, mono: true },
          { key: 'Time',      value: new Date().toLocaleTimeString() },
        ]}
      />
    </Box>
  );
};

export { PayUtilityBill };
export default PayUtilityBill;
