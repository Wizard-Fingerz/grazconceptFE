import React, { useEffect, useState } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import api from '../../../../../services/api';
import {
  C, BillCtaButton, BillReceiptDialog, ErrorAlert,
  FormCard, PaymentMethodSelector, type PaymentMethod,
  ProviderBtn, SectionLabel, SplitLayout, SummaryPanel, generateRef,
} from '../_shared';

interface Package { label: string; code: string; amount: number }
const PROVIDERS: {
  label: string; value: string;
  initBg: string; initColor: string; init: string;
  packages: Package[];
}[] = [
  {
    label: 'DSTV', value: 'dstv', initBg: '#003b8e', initColor: '#fff', init: 'DS',
    packages: [
      { label: 'Premium',      code: 'dstv-premium',      amount: 29500 },
      { label: 'Compact Plus', code: 'dstv-compactplus',  amount: 24500 },
      { label: 'Compact',      code: 'dstv-compact',      amount: 14500 },
      { label: 'Confam',       code: 'dstv-confam',       amount: 9000  },
      { label: 'Yanga',        code: 'dstv-yanga',        amount: 4200  },
      { label: 'Padi',         code: 'dstv-padi',         amount: 2500  },
    ],
  },
  {
    label: 'GOtv', value: 'gotv', initBg: '#ff6b00', initColor: '#fff', init: 'GO',
    packages: [
      { label: 'GOtv Supa Plus', code: 'gotv-supaplus', amount: 12500 },
      { label: 'GOtv Supa',      code: 'gotv-supa',     amount: 9600  },
      { label: 'GOtv Max',       code: 'gotv-max',       amount: 8000  },
      { label: 'GOtv Jolli',     code: 'gotv-jolli',     amount: 5500  },
      { label: 'GOtv Jinja',     code: 'gotv-jinja',     amount: 4150  },
      { label: 'GOtv Smallie',   code: 'gotv-smallie',   amount: 1100  },
    ],
  },
  {
    label: 'Startimes', value: 'startimes', initBg: '#cc0000', initColor: '#fff', init: 'ST',
    packages: [
      { label: 'Super', code: 'startimes-super', amount: 4200 },
      { label: 'Smart', code: 'startimes-smart', amount: 2100 },
      { label: 'Basic', code: 'startimes-basic', amount: 1850 },
      { label: 'Nova',  code: 'startimes-nova',  amount: 900  },
    ],
  },
  {
    label: 'Showmax', value: 'showmax', initBg: '#1a0841', initColor: '#fff', init: 'SH',
    packages: [
      { label: 'Premium',     code: 'showmax-premium', amount: 2900 },
      { label: 'Mobile Only', code: 'showmax-mobile',  amount: 1500 },
    ],
  },
  {
    label: 'Spectranet', value: 'spectranet', initBg: '#2c2e83', initColor: '#fff', init: 'SP',
    packages: [
      { label: 'Unlimited',     code: 'spectranet-unlimited', amount: 9999 },
      { label: 'Monthly 100GB', code: 'spectranet-100gb',     amount: 7500 },
      { label: 'Weekly 25GB',   code: 'spectranet-25gb',      amount: 2500 },
    ],
  },
  {
    label: 'Smile', value: 'smile', initBg: '#7bc900', initColor: '#fff', init: 'SM',
    packages: [
      { label: 'Unlimited', code: 'smile-unlimited', amount: 14999 },
      { label: '30 GB',     code: 'smile-30gb',      amount: 6999  },
      { label: '7 GB',      code: 'smile-7gb',       amount: 2999  },
    ],
  },
];

const CableAndInternetRenewal: React.FC = () => {
  const [provider,   setProvider]   = useState('');
  const [pkg,        setPkg]        = useState<Package | null>(null);
  const [iuc,        setIuc]        = useState('');
  const [acctName,   setAcctName]   = useState('');
  const [payMethod,  setPayMethod]  = useState<PaymentMethod>('wallet');
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState<string | null>(null);
  const [receipt,    setReceipt]    = useState(false);
  const [txRef,      setTxRef]      = useState('');

  const selectedProvider = PROVIDERS.find(p => p.value === provider);
  const canSubmit = !!provider && !!pkg && iuc.length >= 7 && !submitting;

  useEffect(() => {
    if (iuc.length >= 10) setAcctName('CUSTOMER NAME');
    else setAcctName('');
  }, [iuc]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !pkg) return;
    setApiError(null); setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await api.post('/value-services/cable-internet/renew/', {
        provider,
        provider_label: selectedProvider?.label ?? provider,
        package_code: pkg.code,
        package_label: pkg.label,
        iuc_number: iuc,
        account_name: acctName,
        amount: pkg.amount,
        payment_method: payMethod,
      }, { headers });

      if (res.data?.status === 'pending' && res.data?.payment_url) {
        window.location.href = res.data.payment_url;
        return;
      }

      setTxRef(res.data?.reference ?? generateRef());
      setReceipt(true);
    } catch (err: any) {
      setApiError(err?.response?.data?.detail ?? 'Renewal failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setProvider(''); setPkg(null); setIuc(''); setAcctName('');
    setApiError(null); setReceipt(false);
  };

  const summaryRows = [
    { key: 'Provider', value: selectedProvider?.label ?? '—' },
    { key: 'Package',  value: pkg?.label ?? '—' },
    { key: 'IUC / ID', value: iuc || '—' },
    { key: 'Pay via',  value: payMethod === 'wallet' ? '👛 Wallet' : payMethod === 'card' ? '💳 Card' : payMethod === 'bank_transfer' ? '🏦 Bank' : '📱 Mobile' },
    { key: 'Delivery', value: 'Activated in ~30s ⚡', accent: true },
  ];

  const SX_F = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      '& fieldset': { borderColor: C.g200 },
      '&:hover fieldset': { borderColor: C.g300 },
      '&.Mui-focused fieldset': { borderColor: C.brand },
    },
  };

  return (
    <Box>
      <SplitLayout
        form={
          <FormCard iconBg="#fee2e2" icon="📺" title="Cable & Internet Renewal" subtitle="DSTV · GOtv · Startimes · Showmax · Spectranet · Smile">
            <form onSubmit={handleSubmit}>
              <SectionLabel>Select Provider</SectionLabel>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
                {PROVIDERS.map(p => (
                  <ProviderBtn
                    key={p.value}
                    initial={p.init} initBg={p.initBg} initColor={p.initColor}
                    name={p.label} selected={provider === p.value}
                    onClick={() => { setProvider(p.value); setPkg(null); setApiError(null); }}
                  />
                ))}
              </Box>

              {selectedProvider && (
                <>
                  <SectionLabel>Select Package</SectionLabel>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)' }, gap: 1.25, mb: 2.5 }}>
                    {selectedProvider.packages.map(p => {
                      const sel = pkg?.code === p.code;
                      return (
                        <Box
                          key={p.code}
                          onClick={() => { setPkg(p); setApiError(null); }}
                          sx={{
                            p: 1.75, borderRadius: '14px', cursor: 'pointer', transition: 'all .18s',
                            border: `1.5px solid ${sel ? C.brand : C.g200}`,
                            bgcolor: sel ? C.brandXs : C.g0,
                            boxShadow: sel ? `0 0 0 3px rgba(139,43,140,.1)` : 'none',
                            position: 'relative',
                          }}
                        >
                          <Typography sx={{ fontSize: 13, fontWeight: 800, color: sel ? C.brandDark : C.g900, mb: .5, lineHeight: 1.3 }}>
                            {p.label}
                          </Typography>
                          <Typography sx={{ fontSize: 14, fontWeight: 900, color: C.brand }}>
                            ₦{p.amount.toLocaleString()}
                          </Typography>
                          <Typography sx={{ fontSize: 10.5, color: C.g400, mt: .4 }}>/ month</Typography>
                          {sel && (
                            <Box sx={{
                              position: 'absolute', top: 8, right: 8,
                              width: 18, height: 18, borderRadius: '50%', bgcolor: C.brand,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <Typography sx={{ fontSize: 10, color: '#fff', fontWeight: 900 }}>✓</Typography>
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </>
              )}

              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth size="small"
                  label={
                    provider === 'dstv' || provider === 'gotv' ? 'Smartcard / IUC Number' :
                    provider === 'startimes' ? 'Smartcard Number' : 'Username / Account Number'
                  }
                  value={iuc}
                  onChange={e => setIuc(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                  placeholder="Enter your unique number"
                  sx={SX_F}
                />
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <TextField
                  fullWidth size="small" label="Account Holder Name"
                  value={acctName}
                  placeholder="Auto-filled after verification"
                  InputProps={{ readOnly: true, sx: { bgcolor: acctName ? C.g50 : C.g100 } }}
                  sx={SX_F}
                />
              </Box>

              <SectionLabel>Payment Method</SectionLabel>
              <PaymentMethodSelector value={payMethod} onChange={setPayMethod} />

              <ErrorAlert message={apiError} />
              <BillCtaButton disabled={!canSubmit} loading={submitting}>
                {pkg ? `Renew ${selectedProvider?.label ?? ''} — ₦${pkg.amount.toLocaleString()}` : 'Select a package to continue'}
              </BillCtaButton>
            </form>
          </FormCard>
        }
        summary={
          <SummaryPanel
            title="Subscription Summary"
            displayAmt={pkg ? pkg.amount.toLocaleString() : '0'}
            rows={summaryRows}
            trustBadges={['🔒 SSL Secured', '⚡ Instant activation']}
          />
        }
      />
      <BillReceiptDialog
        open={receipt} onClose={() => setReceipt(false)} onNew={resetForm}
        amount={pkg?.amount ?? 0} title="Subscription Renewed!"
        subtitle={`${selectedProvider?.label ?? ''} ${pkg?.label ?? ''} is now active`}
        rows={[
          { key: 'Provider',  value: selectedProvider?.label ?? '—' },
          { key: 'Package',   value: pkg?.label ?? '—' },
          { key: 'IUC / ID',  value: iuc },
          { key: 'Account',   value: acctName || '—' },
          { key: 'Duration',  value: '30 days' },
          { key: 'Status',    value: '✅ Activated' },
          { key: 'Reference', value: txRef, mono: true },
        ]}
      />
    </Box>
  );
};

export { CableAndInternetRenewal };
export default CableAndInternetRenewal;
