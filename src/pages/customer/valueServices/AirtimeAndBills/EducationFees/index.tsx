import React, { useEffect, useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import api from '../../../../../services/api';
import {
  C, BillCtaButton, BillReceiptDialog, ErrorAlert,
  FormCard, PaymentMethodSelector, PinVerifyModal, type PaymentMethod, FLW_OPTIONS,
  SectionLabel, SplitLayout, SummaryPanel, SX_FIELD, generateRef,
  useFlwBillCheckout, usePinGate,
} from '../_shared';

interface FeeType { label: string; value: string; min: number; defaultAmount?: number }
interface EduProvider {
  value: string; label: string; icon: string; iconBg: string;
  feeTypes: FeeType[];
}

const EDU_PROVIDERS: EduProvider[] = [
  {
    value: 'waec', label: 'WAEC', icon: '📝', iconBg: '#eff6ff',
    feeTypes: [{ label: 'WAEC Registration', value: 'waec_reg', min: 10000, defaultAmount: 18000 }],
  },
  {
    value: 'neco', label: 'NECO', icon: '📋', iconBg: '#dcfce7',
    feeTypes: [{ label: 'NECO Registration', value: 'neco_reg', min: 9000, defaultAmount: 17000 }],
  },
  {
    value: 'jamb', label: 'JAMB/UTME', icon: '🎯', iconBg: '#fef3c7',
    feeTypes: [{ label: 'JAMB/UTME Registration', value: 'jamb_reg', min: 5000, defaultAmount: 9000 }],
  },
  {
    value: 'nabteb', label: 'NABTEB', icon: '🔧', iconBg: '#f0fdf4',
    feeTypes: [{ label: 'NABTEB Registration', value: 'nabteb_reg', min: 8500, defaultAmount: 13000 }],
  },
  {
    value: 'university', label: 'University', icon: '🏫', iconBg: C.brandXs,
    feeTypes: [
      { label: 'Acceptance Fee',    value: 'uni_accept',  min: 20000 },
      { label: 'School Fees',       value: 'uni_tuition', min: 25000 },
      { label: 'Departmental Fees', value: 'uni_dept',    min: 3000  },
      { label: 'Other Fee',         value: 'uni_other',   min: 1000  },
    ],
  },
  {
    value: 'others', label: 'Other Exams', icon: '🌐', iconBg: C.g100,
    feeTypes: [
      { label: 'External Exam',    value: 'ext_exam',     min: 1000 },
      { label: 'Training Program', value: 'ext_training', min: 1000 },
    ],
  },
];

const EducationFeePayment: React.FC = () => {
  const [provider,   setProvider]   = useState('');
  const [feeType,    setFeeType]    = useState('');
  const [candName,   setCandName]   = useState('');
  const [regNo,      setRegNo]      = useState('');
  const [examYear,   setExamYear]   = useState('2025');
  const [phone,      setPhone]      = useState('');
  const [amount,     setAmount]     = useState('');
  const [payMethod,  setPayMethod]  = useState<PaymentMethod>('wallet');
  const [submitting, setSubmitting] = useState(false);
  const [apiError,   setApiError]   = useState<string | null>(null);
  const [receipt,    setReceipt]    = useState(false);
  const [txRef,      setTxRef]      = useState('');
  const [pinToken,   setPinToken]   = useState('');

  const { checkout: flwCheckout, paying: flwPaying, flwError, clearFlwError } = useFlwBillCheckout();
  const pinGate = usePinGate();

  const selectedProvider = EDU_PROVIDERS.find(p => p.value === provider);
  const selectedFeeType  = selectedProvider?.feeTypes.find(f => f.value === feeType);

  useEffect(() => { setFeeType(''); setAmount(''); }, [provider]);
  useEffect(() => {
    if (selectedFeeType?.defaultAmount) setAmount(String(selectedFeeType.defaultAmount));
    else setAmount('');
  }, [feeType, selectedFeeType]);

  const amtNum   = Number(amount);
  const canSubmit =
    !!provider && !!feeType && !!candName && !!phone && phone.length === 11 &&
    amtNum >= (selectedFeeType?.min ?? 1000) && !submitting && !flwPaying;

  const submitBill = async (overrideMethod?: string) => {
    const tok = localStorage.getItem('token');
    const headers = tok ? { Authorization: `Bearer ${tok}` } : {};
    const res = await api.post('/value-services/education-fees/pay/', {
      provider,
      provider_label:  selectedProvider?.label ?? provider,
      fee_type:        feeType,
      fee_type_label:  selectedFeeType?.label ?? feeType,
      candidate_name:  candName,
      reg_no:          regNo,
      amount:          amtNum,
      payment_method:  overrideMethod ?? payMethod,
    }, { headers });
    return res;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setApiError(null); clearFlwError();

    if (payMethod === 'wallet') {
      pinGate.open(async () => {
        setSubmitting(true);
        try {
          const res = await submitBill();
          setTxRef(res.data?.reference ?? generateRef());
          setPinToken(res.data?.token ?? '');
          setReceipt(true);
        } catch (err: any) {
          setApiError(err?.response?.data?.detail ?? 'Payment failed. Please try again.');
        } finally {
          setSubmitting(false);
        }
      });
      return;
    } else {
      await flwCheckout({
        amount:         amtNum,
        description:    `${selectedFeeType?.label ?? feeType} · ${candName}`,
        paymentOptions: FLW_OPTIONS[payMethod],
        onSuccess: async () => {
          const res = await submitBill('wallet');
          setTxRef(res.data?.reference ?? generateRef());
          setPinToken(res.data?.token ?? '');
          setReceipt(true);
        },
      });
    }
  };

  const resetForm = () => {
    setProvider(''); setFeeType(''); setCandName(''); setRegNo('');
    setAmount(''); setPhone(''); setApiError(null); setReceipt(false); setPinToken('');
  };

  const summaryRows = [
    { key: 'Exam body',   value: selectedProvider?.label ?? '—' },
    { key: 'Fee type',    value: selectedFeeType?.label ?? '—' },
    { key: 'Exam year',   value: examYear },
    { key: 'Candidate',   value: candName || '—' },
    { key: 'Pay via',     value: payMethod === 'wallet' ? '👛 Wallet' : payMethod === 'card' ? '💳 Card' : payMethod === 'ussd' ? '📲 USSD' : '🏦 Bank Transfer' },
  ];

  return (
    <Box>
      <SplitLayout
        form={
          <FormCard iconBg="#dcfce7" icon="🎓" title="Education & Exam Fees" subtitle="WAEC · NECO · JAMB · NABTEB · University">
            <form onSubmit={handleSubmit}>
              <SectionLabel>Select Exam Body</SectionLabel>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1.25, mb: 2.5 }}>
                {EDU_PROVIDERS.map(p => {
                  const sel = provider === p.value;
                  return (
                    <Box
                      key={p.value}
                      onClick={() => { setProvider(p.value); setApiError(null); }}
                      sx={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: .75,
                        py: 1.75, px: 1, borderRadius: '14px', cursor: 'pointer', transition: 'all .18s',
                        border: `1.5px solid ${sel ? C.brand : C.g200}`,
                        bgcolor: sel ? C.brandXs : C.g0,
                        boxShadow: sel ? `0 0 0 3px rgba(139,43,140,.1)` : 'none',
                        '&:hover': { borderColor: sel ? C.brand : C.g300, bgcolor: sel ? C.brandXs : C.g50 },
                      }}
                    >
                      <Box sx={{ fontSize: 24, lineHeight: 1 }}>{p.icon}</Box>
                      <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: sel ? C.brandDark : C.g700, textAlign: 'center', lineHeight: 1.3 }}>
                        {p.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              {selectedProvider && (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 1.5, mb: 2 }}>
                  <FormControl size="small" sx={SX_FIELD}>
                    <InputLabel>Fee Type</InputLabel>
                    <Select
                      label="Fee Type" value={feeType}
                      onChange={e => { setFeeType(e.target.value); setApiError(null); }}
                    >
                      {selectedProvider.feeTypes.map(ft => (
                        <MenuItem key={ft.value} value={ft.value}>{ft.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ ...SX_FIELD, width: 100 }}>
                    <InputLabel>Year</InputLabel>
                    <Select label="Year" value={examYear} onChange={e => setExamYear(e.target.value)}>
                      {['2024', '2025', '2026'].map(y => (
                        <MenuItem key={y} value={y}>{y}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}

              {feeType && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth size="small" label="Candidate / Student Name"
                    value={candName} onChange={e => setCandName(e.target.value)}
                    placeholder="Enter candidate's full name" sx={SX_FIELD}
                  />
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    <TextField
                      fullWidth size="small" label="Reg / Exam Number"
                      value={regNo} onChange={e => setRegNo(e.target.value)}
                      placeholder="e.g. 234511099" sx={SX_FIELD}
                    />
                    <TextField
                      fullWidth size="small" label="Phone Number" type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      placeholder="08012345678" inputProps={{ maxLength: 11 }} sx={SX_FIELD}
                    />
                  </Box>
                  <TextField
                    fullWidth size="small" label="Amount (₦)" type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value.replace(/^0+/, ''))}
                    inputProps={{ min: selectedFeeType?.min ?? 1000, step: 100 }}
                    helperText={selectedFeeType?.min ? `Minimum: ₦${selectedFeeType.min.toLocaleString()}` : undefined}
                    sx={SX_FIELD}
                  />
                </Box>
              )}

              {feeType && (
                <>
                  <SectionLabel>Payment Method</SectionLabel>
                  <PaymentMethodSelector value={payMethod} onChange={v => { setPayMethod(v); setApiError(null); clearFlwError(); }} />
                </>
              )}

              <ErrorAlert message={apiError ?? flwError} />
              <BillCtaButton disabled={!canSubmit} loading={submitting || flwPaying}>
                {flwPaying
                  ? 'Opening checkout…'
                  : selectedFeeType
                    ? `Pay ₦${amtNum > 0 ? amtNum.toLocaleString() : '0'} — ${selectedFeeType.label}`
                    : 'Select exam body to continue'}
              </BillCtaButton>
            </form>
          </FormCard>
        }
        summary={
          <SummaryPanel
            title="Exam Fee Summary"
            displayAmt={amtNum > 0 ? amtNum.toLocaleString() : '0'}
            rows={summaryRows}
            trustBadges={['🔒 Official payment channel', '📧 PIN to email']}
          />
        }
      />
      <PinVerifyModal {...pinGate.props} />

      <BillReceiptDialog
        open={receipt} onClose={() => setReceipt(false)} onNew={resetForm}
        amount={amtNum} title="Fee Payment Successful!"
        subtitle={`${selectedProvider?.label ?? ''} ${selectedFeeType?.label ?? ''} confirmed`}
        rows={[
          { key: 'Exam body',   value: selectedProvider?.label ?? '—' },
          { key: 'Fee type',    value: selectedFeeType?.label ?? '—' },
          { key: 'Year',        value: examYear },
          { key: 'Candidate',   value: candName },
          { key: 'Reg. No.',    value: regNo || '—' },
          ...(pinToken ? [{ key: 'PIN / Token', value: pinToken, mono: true }] : []),
          { key: 'Status',      value: '✅ Confirmed' },
          { key: 'Reference',   value: txRef, mono: true },
          { key: 'Time',        value: new Date().toLocaleTimeString() },
        ]}
      />
    </Box>
  );
};

export { EducationFeePayment };
export default EducationFeePayment;
