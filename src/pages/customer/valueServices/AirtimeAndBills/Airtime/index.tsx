import React, { useEffect, useState } from 'react';
import {
  Box, Chip, TextField, Typography,
} from '@mui/material';
import api from '../../../../../services/api';
import {
  C, AmountDisplay, BillCtaButton, BillReceiptDialog, ErrorAlert,
  FormCard, PaymentMethodSelector, type PaymentMethod, FLW_OPTIONS,
  ProviderBtn, SectionLabel, SplitLayout, SummaryPanel,
  SX_FIELD, generateRef, useFlwBillCheckout,
} from '../_shared';

/* ─── Network providers hook ─────────────────────────────────────────────── */
interface NetProvider { id: number; name: string; slug: string; logo?: string; accent?: string }
function useAirtimeNetworkProviders() {
  const [providers, setProviders] = useState<NetProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    api.get('/app/airtime-network-providers/')
      .then(res => {
        if (!live) return;
        const data: any[] = res.data.results || [];
        setProviders(data.map((item: any) => ({
          id: item.id,
          name: item.label ?? item.name,
          slug: item.value ?? item.slug,
          logo: item.logo,
          accent: item.accent,
        })));
      })
      .catch(e => { if (live) setError(e?.response?.data?.detail ?? 'Failed to load networks.'); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);

  return { providers, loading, error };
}

/* ─── Network initial letters / fallback colours ──────────────────────────── */
const NET_FALLBACKS: Record<string, { bg: string; color: string; letter: string }> = {
  mtn: { bg: '#fbbf24', color: '#78350f', letter: 'M' },
  airtel: { bg: '#ef4444', color: '#fff', letter: 'A' },
  glo: { bg: '#16a34a', color: '#fff', letter: 'G' },
  '9mobile': { bg: '#0ea5e9', color: '#fff', letter: '9' },
};
function netFallback(slug: string) {
  return NET_FALLBACKS[slug.toLowerCase()] ?? { bg: C.brand, color: '#fff', letter: slug[0]?.toUpperCase() ?? '?' };
}

/* ─── Component ──────────────────────────────────────────────────────────── */
const BuyAirtime: React.FC = () => {
  const { providers, loading: pLoading, error: pError } = useAirtimeNetworkProviders();

  const [network,   setNetwork]   = useState('');
  const [amount,    setAmount]    = useState(0);
  const [phone,     setPhone]     = useState('');
  const [forOther,  setForOther]  = useState(false);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('wallet');
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState<string | null>(null);
  const [receipt,    setReceipt]    = useState(false);
  const [txRef,      setTxRef]      = useState('');

  const { checkout: flwCheckout, paying: flwPaying, flwError, clearFlwError } = useFlwBillCheckout();

  const selected = providers.find(p => p.slug === network);

  const canSubmit =
    !!network && amount >= 50 && amount <= 20000 && phone.length === 11 &&
    !submitting && !flwPaying;

  const submitBill = async (ref?: string) => {
    const prov = providers.find(p => p.slug === network);
    if (!prov) throw new Error('Invalid network selected.');
    const tok = localStorage.getItem('token');
    const headers = tok ? { Authorization: `Bearer ${tok}` } : {};
    await api.post('/app/airtime-purchases/', {
      provider_id:      prov.id,
      network,
      phone,
      amount,
      ...(ref ? { payment_method: 'wallet', payment_reference: ref } : {}),
    }, { headers });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setApiError(null); clearFlwError();

    if (payMethod === 'wallet') {
      setSubmitting(true);
      try {
        await submitBill();
        setTxRef(generateRef());
        setReceipt(true);
      } catch (err: any) {
        const d = err?.response?.data;
        setApiError(d?.provider_id?.[0] ?? d?.phone?.[0] ?? d?.detail ?? 'Failed to purchase airtime.');
      } finally {
        setSubmitting(false);
      }
    } else {
      // Card / USSD / Bank Transfer — Flutterwave inline checkout
      await flwCheckout({
        amount,
        description: `Airtime top-up · ${network} · ${phone}`,
        paymentOptions: FLW_OPTIONS[payMethod],
        onSuccess: async (ref) => {
          await submitBill(ref);
          setTxRef(ref);
          setReceipt(true);
        },
      });
    }
  };

  const resetForm = () => {
    setNetwork(''); setAmount(0); setPhone(''); setForOther(false);
    setApiError(null); clearFlwError(); setReceipt(false);
  };

  const PAY_LABEL: Record<PaymentMethod, string> = {
    wallet: '👛 Wallet', card: '💳 Card', ussd: '📲 USSD', bank_transfer: '🏦 Bank Transfer',
  };

  const summaryRows = [
    { key: 'Service',   value: 'Airtime Top-up' },
    { key: 'Network',   value: selected?.name ?? '—' },
    { key: 'Recipient', value: phone.length === 11 ? phone : 'Enter phone number' },
    { key: 'Pay via',   value: PAY_LABEL[payMethod] },
    { key: 'Delivery',  value: 'Instant ⚡', accent: true },
  ];

  return (
    <Box>
      <SplitLayout
        form={
          <FormCard
            iconBg="#fce4ec" icon="📱"
            title="Buy Airtime"
            subtitle="Instant top-up · All Nigerian networks"
          >
            <form onSubmit={handleSubmit} autoComplete="off">
              {/* Network selector */}
              <SectionLabel>Select Network</SectionLabel>
              {pLoading ? (
                <Typography sx={{ fontSize: 13, color: C.g400, mb: 2 }}>Loading networks…</Typography>
              ) : pError ? (
                <Typography sx={{ fontSize: 13, color: C.red, mb: 2 }}>{pError}</Typography>
              ) : (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
                  {providers.map(p => {
                    const f = netFallback(p.slug);
                    return (
                      <ProviderBtn
                        key={p.id}
                        logo={p.logo}
                        initial={f.letter}
                        initBg={f.bg}
                        initColor={f.color}
                        name={p.name}
                        selected={network === p.slug}
                        onClick={() => { setNetwork(p.slug); setApiError(null); }}
                      />
                    );
                  })}
                </Box>
              )}

              {/* Amount */}
              <AmountDisplay
                value={amount}
                onChange={v => { setAmount(v); setApiError(null); }}
                quickAmounts={[50, 100, 200, 500, 1000, 2000]}
                label="Amount to top-up"
                min={50} max={20000}
              />

              {/* Phone */}
              <Box sx={{ mb: 2 }}>
                <Box
                  onClick={() => setForOther(p => !p)}
                  sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    p: '11px 16px', bgcolor: C.g100, borderRadius: '12px', mb: 1.75,
                    cursor: 'pointer', transition: '.15s', '&:hover': { bgcolor: C.g200 },
                  }}
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.g700 }}>
                    Top-up a different number
                  </Typography>
                  <Box sx={{
                    width: 38, height: 22, borderRadius: '11px', position: 'relative',
                    bgcolor: forOther ? C.brand : C.g300, transition: '.2s', flexShrink: 0,
                  }}>
                    <Box sx={{
                      width: 18, height: 18, borderRadius: '50%', bgcolor: '#fff',
                      position: 'absolute', top: 2, left: forOther ? 18 : 2,
                      transition: '.2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                    }} />
                  </Box>
                </Box>

                <TextField
                  fullWidth size="small"
                  label={forOther ? "Recipient's Phone Number" : 'Your Phone Number'}
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="e.g. 08012345678"
                  inputProps={{ maxLength: 11 }}
                  helperText={phone.length > 0 && phone.length < 11 ? `${phone.length}/11 digits` : undefined}
                  sx={SX_FIELD}
                />
              </Box>

              {/* Payment method */}
              <SectionLabel>Payment Method</SectionLabel>
              <PaymentMethodSelector value={payMethod} onChange={v => { setPayMethod(v); setApiError(null); clearFlwError(); }} />

              <ErrorAlert message={apiError ?? flwError} />

              <BillCtaButton disabled={!canSubmit} loading={submitting || flwPaying}>
                {flwPaying ? 'Opening checkout…' : (
                  <>
                    Pay ₦{amount > 0 ? amount.toLocaleString() : '0'} Airtime
                    {selected && (
                      <Chip
                        label={selected.name}
                        size="small"
                        sx={{
                          ml: 1, height: 22, fontSize: 11, fontWeight: 700,
                          bgcolor: 'rgba(255,255,255,.2)', color: '#fff',
                          '& .MuiChip-label': { px: 1 },
                        }}
                      />
                    )}
                  </>
                )}
              </BillCtaButton>
            </form>
          </FormCard>
        }
        summary={
          <SummaryPanel
            title="Order Summary"
            displayAmt={amount > 0 ? amount.toLocaleString() : '0'}
            rows={summaryRows}
            trustBadges={['🔒 SSL Secured', '⚡ Instant', '✅ Zero fees']}
          />
        }
      />

      {/* Receipt */}
      <BillReceiptDialog
        open={receipt}
        onClose={() => setReceipt(false)}
        onNew={resetForm}
        amount={amount}
        title="Airtime Purchased!"
        subtitle={`${selected?.name ?? ''} airtime delivered to ${phone}`}
        rows={[
          { key: 'Network', value: selected?.name ?? '—' },
          { key: 'Phone', value: phone },
          { key: 'Amount', value: `₦${amount.toLocaleString()}` },
          { key: 'Status', value: '✅ Delivered' },
          { key: 'Reference', value: txRef, mono: true },
          { key: 'Time', value: new Date().toLocaleTimeString() },
        ]}
      />
    </Box>
  );
};

export { BuyAirtime };
export default BuyAirtime;
