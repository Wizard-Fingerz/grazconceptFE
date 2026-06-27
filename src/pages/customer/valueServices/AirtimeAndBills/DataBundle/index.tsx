import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, TextField, Typography } from '@mui/material';
import api from '../../../../../services/api';
import {
  C, BillCtaButton, BillReceiptDialog, ErrorAlert,
  FormCard, PaymentMethodSelector, PinVerifyModal, type PaymentMethod, FLW_OPTIONS,
  ProviderBtn, SectionLabel, SplitLayout, SummaryPanel,
  SX_FIELD, generateRef, useFlwBillCheckout, usePinGate,
} from '../_shared';

type PlanCat = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'others';
const CAT_LABELS: Record<PlanCat, string> = {
  daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', quarterly: '3 Months', others: 'Others',
};
const ALL_CATS: PlanCat[] = ['daily', 'weekly', 'monthly', 'quarterly', 'others'];

interface RemotePlan {
  id: number; label: string; value: string; amount: number; data: string; category: PlanCat;
}
interface RemoteProvider {
  id: number; label: string; value: string; accent?: string; logo: string; active: boolean;
}

const NET_FB: Record<string, { bg: string; color: string }> = {
  mtn:       { bg: '#fbbf24', color: '#78350f' },
  airtel:    { bg: '#ef4444', color: '#fff'     },
  glo:       { bg: '#16a34a', color: '#fff'     },
  '9mobile': { bg: '#0ea5e9', color: '#fff'     },
};
function fb(slug: string) {
  return NET_FB[slug.toLowerCase()] ?? { bg: C.brand, color: '#fff' };
}

const DataBundleSubscription: React.FC = () => {
  const [providers,     setProviders]     = useState<RemoteProvider[]>([]);
  const [fetchingProvs, setFetchingProvs] = useState(true);
  const [provsError,    setProvsError]    = useState<string | null>(null);
  const [plans,         setPlans]         = useState<RemotePlan[]>([]);
  const [fetchingPlans, setFetchingPlans] = useState(false);
  const [plansError,    setPlansError]    = useState<string | null>(null);
  const [provider,  setProvider]  = useState('');
  const [cat,       setCat]       = useState<PlanCat>('daily');
  const [plan,      setPlan]      = useState('');
  const [phone,     setPhone]     = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('wallet');
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState<string | null>(null);
  const [receipt,    setReceipt]    = useState(false);
  const [txRef,      setTxRef]      = useState('');

  const { checkout: flwCheckout, paying: flwPaying, flwError, clearFlwError } = useFlwBillCheckout();
  const pinGate = usePinGate();

  useEffect(() => {
    let live = true;
    api.get('/app/airtime-data-plans/providers-with-plans/')
      .then(res => {
        if (!live) return;
        const data: any[] = Array.isArray(res.data) ? res.data : [];
        setProviders(data.map((p: any) => ({
          id: p.id, label: p.label, value: p.value,
          accent: p.accent, logo: p.logo, active: p.active,
        })));
      })
      .catch(e => { if (live) setProvsError(e?.response?.data?.detail ?? 'Could not load providers.'); })
      .finally(() => { if (live) setFetchingProvs(false); });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (!provider) { setPlans([]); setPlan(''); return; }
    const prov = providers.find(p => p.value === provider);
    if (!prov) return;
    let live = true;
    setFetchingPlans(true); setPlansError(null); setPlans([]); setPlan('');
    api.get('/app/airtime-data-plans/', { params: { provider_id: prov.id } })
      .then(res => {
        if (!live) return;
        const items: any[] = Array.isArray(res.data?.results) ? res.data.results : [];
        const mapped: RemotePlan[] = items.map(pl => ({
          id: pl.id, label: pl.label, value: pl.value,
          amount: pl.amount, data: pl.data, category: pl.category,
        }));
        setPlans(mapped);
        const cats = [...new Set(mapped.map(pl => pl.category))].filter(c => ALL_CATS.includes(c as PlanCat));
        setCat((cats[0] as PlanCat) ?? 'daily');
      })
      .catch(e => { if (live) setPlansError(e?.response?.data?.detail ?? 'Could not load plans.'); })
      .finally(() => { if (live) setFetchingPlans(false); });
    return () => { live = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  const selectedProvider = useMemo(() => providers.find(p => p.value === provider), [providers, provider]);
  const selectedPlan     = useMemo(() => plans.find(pl => pl.value === plan), [plans, plan]);
  const providerCats     = useMemo(() =>
    [...new Set(plans.map(pl => pl.category))].filter(c => ALL_CATS.includes(c as PlanCat)) as PlanCat[],
  [plans]);
  const plansForCat = useMemo(() => plans.filter(pl => pl.category === cat), [plans, cat]);

  useEffect(() => {
    if (plan && !plansForCat.find(p => p.value === plan)) setPlan('');
  }, [cat, plansForCat, plan]);

  const canSubmit = !!provider && !!plan && phone.length === 11 && !submitting && !flwPaying;

  const submitBill = async (ref?: string) => {
    if (!selectedProvider || !selectedPlan) throw new Error('Missing plan.');
    const tok = localStorage.getItem('token');
    const headers = tok ? { Authorization: `Bearer ${tok}` } : {};
    await api.post('/app/airtime-data-purchases/', {
      provider_id: selectedProvider.id,
      plan_id:     selectedPlan.id,
      amount:      selectedPlan.amount,
      phone,
      ...(ref ? { payment_method: 'wallet', payment_reference: ref } : {}),
    }, { headers });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !selectedProvider || !selectedPlan) return;
    setApiError(null); clearFlwError();

    if (payMethod === 'wallet') {
      pinGate.open(async () => {
        setSubmitting(true);
        try {
          await submitBill();
          setTxRef(generateRef());
          setReceipt(true);
        } catch (err: any) {
          const d = err?.response?.data;
          setApiError(d?.provider_id?.[0] ?? d?.plan_id?.[0] ?? d?.detail ?? 'Purchase failed. Try again.');
        } finally {
          setSubmitting(false);
        }
      });
      return;
    } else {
      await flwCheckout({
        amount:         selectedPlan.amount,
        description:    `Data bundle · ${selectedProvider.label} ${selectedPlan.data} · ${phone}`,
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
    setProvider(''); setPlan(''); setPhone(''); setApiError(null); clearFlwError(); setReceipt(false);
  };

  const PAY_LABEL: Record<PaymentMethod, string> = {
    wallet: '👛 Wallet', card: '💳 Card', ussd: '📲 USSD', bank_transfer: '🏦 Bank Transfer',
  };

  const summaryRows = [
    { key: 'Bundle',    value: selectedPlan ? `${selectedPlan.data}` : '—' },
    { key: 'Network',   value: selectedProvider?.label ?? '—' },
    { key: 'Validity',  value: selectedPlan ? (CAT_LABELS[selectedPlan.category] ?? '—') : '—' },
    { key: 'Recipient', value: phone.length === 11 ? phone : '—' },
    { key: 'Pay via',   value: PAY_LABEL[payMethod] },
    { key: 'Delivery',  value: 'Instant ⚡', accent: true },
  ];

  if (fetchingProvs) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
      <CircularProgress sx={{ color: C.brand }} />
      <Typography sx={{ color: C.g500 }}>Loading providers…</Typography>
    </Box>
  );

  return (
    <Box>
      <SplitLayout
        form={
          <FormCard iconBg="#eff6ff" icon="📶" title="Buy Data Bundle" subtitle="Discounted rates · Instant activation">
            <form onSubmit={handleSubmit} autoComplete="off">
              <SectionLabel>Select Network</SectionLabel>
              {provsError ? (
                <Typography sx={{ fontSize: 13, color: C.red, mb: 2 }}>{provsError}</Typography>
              ) : (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
                  {providers.filter(p => p.active).map(p => {
                    const f = fb(p.value);
                    return (
                      <ProviderBtn
                        key={p.id}
                        logo={p.logo}
                        initial={p.label[0]}
                        initBg={f.bg} initColor={f.color}
                        name={p.label}
                        selected={provider === p.value}
                        loading={fetchingPlans && provider === p.value}
                        onClick={() => { setProvider(p.value); setApiError(null); }}
                      />
                    );
                  })}
                </Box>
              )}

              {provider && !fetchingPlans && plans.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <SectionLabel>Plan Duration</SectionLabel>
                  <Box sx={{ display: 'flex', bgcolor: C.g100, borderRadius: '10px', p: '3px', gap: '2px', mb: 2 }}>
                    {providerCats.map(c => (
                      <Box
                        key={c}
                        onClick={() => { setCat(c); setPlan(''); }}
                        sx={{
                          flex: 1, py: .875, borderRadius: '8px', textAlign: 'center', cursor: 'pointer',
                          bgcolor: cat === c ? C.g0 : 'transparent',
                          boxShadow: cat === c ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                          transition: '.15s',
                        }}
                      >
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: cat === c ? C.g900 : C.g500 }}>
                          {CAT_LABELS[c] ?? c}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <SectionLabel>Choose Plan</SectionLabel>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 1.25, mb: 2.5 }}>
                    {plansForCat.length === 0 ? (
                      <Typography sx={{ fontSize: 13, color: C.g400, gridColumn: '1/-1', textAlign: 'center', py: 2 }}>
                        No plans in this category.
                      </Typography>
                    ) : plansForCat.map(pl => {
                      const sel = plan === pl.value;
                      return (
                        <Box
                          key={pl.value}
                          onClick={() => { setPlan(pl.value); setApiError(null); }}
                          sx={{
                            p: 1.75, borderRadius: '14px', cursor: 'pointer', transition: 'all .18s',
                            border: `1.5px solid ${sel ? C.brand : C.g200}`,
                            bgcolor: sel ? C.brandXs : C.g0,
                            boxShadow: sel ? `0 0 0 3px rgba(139,43,140,.1)` : 'none',
                            '&:hover': { borderColor: sel ? C.brand : C.g300, bgcolor: sel ? C.brandXs : C.g50 },
                            position: 'relative',
                          }}
                        >
                          <Typography sx={{ fontSize: 18, fontWeight: 900, color: sel ? C.brandDark : C.g900, mb: .3 }}>{pl.data}</Typography>
                          <Typography sx={{ fontSize: 11.5, color: C.g400, mb: .6 }}>{CAT_LABELS[pl.category] ?? pl.category}</Typography>
                          <Typography sx={{ fontSize: 14, fontWeight: 800, color: C.brand }}>₦{pl.amount.toLocaleString()}</Typography>
                          {sel && (
                            <Box sx={{
                              position: 'absolute', top: 10, right: 10,
                              width: 20, height: 20, borderRadius: '50%', bgcolor: C.brand,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <Typography sx={{ fontSize: 11, color: '#fff', fontWeight: 900 }}>✓</Typography>
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {provider && fetchingPlans && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 3, mb: 2 }}>
                  <CircularProgress size={22} sx={{ color: C.brand }} />
                  <Typography sx={{ fontSize: 13.5, color: C.g500 }}>Loading plans…</Typography>
                </Box>
              )}

              {plansError && <Typography sx={{ fontSize: 13, color: C.red, mb: 2 }}>{plansError}</Typography>}

              <Box sx={{ mb: 2.5 }}>
                <TextField
                  fullWidth size="small" label="Phone Number" type="tel"
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
                {flwPaying
                  ? 'Opening checkout…'
                  : selectedPlan
                    ? `Buy ${selectedPlan.data} — ₦${selectedPlan.amount.toLocaleString()}`
                    : 'Select a plan to continue'}
              </BillCtaButton>
            </form>
          </FormCard>
        }
        summary={
          <SummaryPanel
            title="Selected Plan"
            displayAmt={selectedPlan ? selectedPlan.amount.toLocaleString() : '0'}
            rows={summaryRows}
            trustBadges={['🔒 Encrypted', '⚡ Instant', '💯 Best Rates']}
          />
        }
      />
      <PinVerifyModal {...pinGate.props} />

      <BillReceiptDialog
        open={receipt} onClose={() => setReceipt(false)} onNew={resetForm}
        amount={selectedPlan?.amount ?? 0} title="Data Activated!"
        subtitle={`${selectedPlan?.data ?? ''} data sent to ${phone}`}
        rows={[
          { key: 'Network',   value: selectedProvider?.label ?? '—' },
          { key: 'Bundle',    value: `${selectedPlan?.data ?? '—'} · ${selectedPlan ? CAT_LABELS[selectedPlan.category] : '—'}` },
          { key: 'Phone',     value: phone },
          { key: 'Status',    value: '✅ Activated' },
          { key: 'Reference', value: txRef, mono: true },
          { key: 'Time',      value: new Date().toLocaleTimeString() },
        ]}
      />
    </Box>
  );
};

export { DataBundleSubscription };
export default DataBundleSubscription;
