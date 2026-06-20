import React, { useState } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import api from '../../../../../services/api';
import {
  C, AmountDisplay, BillCtaButton, BillReceiptDialog, ErrorAlert,
  FormCard, ProviderBtn, SectionLabel, SplitLayout, SummaryPanel,
  generateRef,
} from '../_shared';

const DISCOS = [
  { label: 'Ikeja Electric',  value: 'ikeja_electric',  initBg: '#fbbf24', initColor: '#78350f', init: 'IE' },
  { label: 'Eko Electric',    value: 'eko_electric',    initBg: '#0ea5e9', initColor: '#fff',    init: 'EE' },
  { label: 'Abuja Electric',  value: 'abuja_electric',  initBg: '#7c3aed', initColor: '#fff',    init: 'AE' },
  { label: 'Ibadan Electric', value: 'ibadan_electric', initBg: '#1d4ed8', initColor: '#fff',    init: 'IB' },
  { label: 'Kano Electric',   value: 'kano_electric',   initBg: '#16a34a', initColor: '#fff',    init: 'KE' },
  { label: 'PH Electric',     value: 'phe',             initBg: '#dc2626', initColor: '#fff',    init: 'PH' },
  { label: 'Benin Electric',  value: 'benin_electric',  initBg: '#0891b2', initColor: '#fff',    init: 'BE' },
  { label: 'Enugu Electric',  value: 'enugu_electric',  initBg: '#7e22ce', initColor: '#fff',    init: 'EG' },
];

const PayUtilityBill: React.FC = () => {
  const [utility,    setUtility]    = useState('');
  const [meterType,  setMeterType]  = useState<'prepaid' | 'postpaid' | ''>('');
  const [meterNum,   setMeterNum]   = useState('');
  const [amount,     setAmount]     = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState<string | null>(null);
  const [receipt,    setReceipt]    = useState(false);
  const [txRef,      setTxRef]      = useState('');
  const [token,      setToken]      = useState('');

  const selectedDisco = DISCOS.find(d => d.value === utility);
  const canSubmit = !!utility && !!meterType && meterNum.length >= 5 && amount >= 500 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setApiError(null); setSubmitting(true);
    try {
      const tok = localStorage.getItem('token');
      const headers = tok ? { Authorization: `Bearer ${tok}` } : {};
      const res = await api.post('/value-services/bills/pay/', {
        utility, meterType, meterNumber: meterNum, amount,
      }, { headers });
      setTxRef(generateRef());
      setToken(res.data?.token ?? '');
      setReceipt(true);
    } catch (err: any) {
      setApiError(err?.response?.data?.detail ?? 'Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setUtility(''); setMeterType(''); setMeterNum('');
    setAmount(0); setApiError(null); setReceipt(false); setToken('');
  };

  const summaryRows = [
    { key: 'Provider',    value: selectedDisco?.label ?? '—' },
    { key: 'Meter type',  value: meterType ? meterType.charAt(0).toUpperCase() + meterType.slice(1) : '—' },
    { key: 'Meter no.',   value: meterNum || '—' },
    { key: 'Service fee', value: '₦0 (Free)' },
    { key: 'Delivery',    value: 'Instant token ⚡', accent: true },
  ];

  return (
    <Box>
      <SplitLayout
        form={
          <FormCard iconBg="#fef3c7" icon="⚡" title="Pay Electricity Bill" subtitle="All DisCos · Token delivered instantly">
            <form onSubmit={handleSubmit}>
              <SectionLabel>Select Electricity Provider</SectionLabel>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
                {DISCOS.map(d => (
                  <ProviderBtn
                    key={d.value}
                    initial={d.init} initBg={d.initBg} initColor={d.initColor}
                    name={d.label} selected={utility === d.value}
                    onClick={() => { setUtility(d.value); setApiError(null); }}
                  />
                ))}
              </Box>

              <SectionLabel>Meter Type</SectionLabel>
              <Box sx={{ display: 'flex', gap: 1.25, mb: 2.5 }}>
                {[
                  { v: 'prepaid'  as const, label: 'Prepaid',  icon: '🔋' },
                  { v: 'postpaid' as const, label: 'Postpaid', icon: '📋' },
                ].map(m => (
                  <Box
                    key={m.v}
                    onClick={() => { setMeterType(m.v); setApiError(null); }}
                    sx={{
                      flex: 1, display: 'flex', alignItems: 'center', gap: 1.25, p: '14px 16px',
                      borderRadius: '14px', cursor: 'pointer', transition: 'all .18s',
                      border: `1.5px solid ${meterType === m.v ? C.brand : C.g200}`,
                      bgcolor: meterType === m.v ? C.brandXs : C.g0,
                      boxShadow: meterType === m.v ? `0 0 0 3px rgba(139,43,140,.1)` : 'none',
                      '&:hover': { borderColor: meterType === m.v ? C.brand : C.g300 },
                    }}
                  >
                    <Typography sx={{ fontSize: 22 }}>{m.icon}</Typography>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: meterType === m.v ? C.brandDark : C.g700 }}>
                      {m.label}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <TextField
                  fullWidth size="small" label="Meter Number"
                  value={meterNum}
                  onChange={e => setMeterNum(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                  placeholder="Enter your meter number"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': { borderColor: C.g200 },
                      '&:hover fieldset': { borderColor: C.g300 },
                      '&.Mui-focused fieldset': { borderColor: C.brand },
                    },
                  }}
                />
              </Box>

              <AmountDisplay
                value={amount}
                onChange={v => { setAmount(v); setApiError(null); }}
                quickAmounts={[1000, 2000, 5000, 10000, 20000, 50000]}
                label="Amount to pay"
                min={500}
              />

              <Box sx={{
                bgcolor: C.amberLight, border: `1px solid #fde68a`,
                borderRadius: '12px', p: '12px 16px', fontSize: 12, color: '#92400e',
                lineHeight: 1.7, mb: 2.5,
              }}>
                <strong>⚠ Token delivery:</strong> Your prepaid token will appear on-screen
                immediately after payment. Screenshot it before closing this page.
              </Box>

              <ErrorAlert message={apiError} />
              <BillCtaButton disabled={!canSubmit} loading={submitting}>
                Pay ₦{amount > 0 ? amount.toLocaleString() : '0'} Electricity Bill
              </BillCtaButton>
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
          { key: 'Meter No.', value: meterNum },
          { key: 'Type',      value: meterType ? meterType.charAt(0).toUpperCase() + meterType.slice(1) : '—' },
          ...(meterType === 'prepaid' && token
            ? [{ key: 'Token', value: token || '4321-5678-1234-9087', mono: true }]
            : []),
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
