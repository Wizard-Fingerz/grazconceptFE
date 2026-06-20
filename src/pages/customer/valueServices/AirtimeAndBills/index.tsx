import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { C } from './_shared';

/* ─── Service tiles ─────────────────────────────────────────────── */
const SERVICES = [
  { icon: '📱', iconBg: '#fce4ec', name: 'Buy Airtime',      desc: 'All networks · Instant',         to: '/services/airtime',        badge: 'Instant',    badgeColor: C.green,   badgeBg: C.greenLight },
  { icon: '📶', iconBg: '#eff6ff', name: 'Data Bundle',      desc: 'Best rates · All plans',         to: '/services/data-bundle',    badge: 'Best Value', badgeColor: '#1d4ed8', badgeBg: '#eff6ff'    },
  { icon: '⚡', iconBg: '#fef3c7', name: 'Electricity Bill', desc: 'Prepaid & postpaid meters',      to: '/services/bills'                                                                                 },
  { icon: '📺', iconBg: '#fee2e2', name: 'Cable & Internet', desc: 'DSTV, GOtv, Startimes & more',  to: '/services/cable-internet'                                                                        },
  { icon: '🎓', iconBg: '#dcfce7', name: 'Education Fees',   desc: 'WAEC · NECO · JAMB · NABTEB',   to: '/services/education-fees'                                                                        },
] as const;

/* ─── Static recent transactions ───────────────────────────────── */
const RECENT_TX = [
  { icon: '⚡', iconBg: '#fef3c7', name: 'Ikeja Electric',  meta: 'Meter: 1234567890 · Prepaid',  amount: '₦5,000',  ok: true,  status: 'Delivered'  },
  { icon: '📱', iconBg: '#fce4ec', name: 'Airtel Airtime',  meta: '0802 345 6789 · Yesterday',    amount: '₦500',    ok: true,  status: 'Delivered'  },
  { icon: '📺', iconBg: '#eff6ff', name: 'DSTV Compact',    meta: 'IUC: 7001234567 · 2 days ago', amount: '₦14,500', ok: true,  status: 'Activated'  },
  { icon: '📶', iconBg: '#dcfce7', name: 'MTN Data — 5GB',  meta: '0803 123 4567 · Jun 14',       amount: '₦2,000',  ok: false, status: 'Processing' },
];

/* ─── Section label (matches dashboard pattern) ─────────────────── */
const SLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography sx={{
    fontSize: 11, fontWeight: 700, color: C.g400,
    textTransform: 'uppercase', letterSpacing: '.8px', mb: 1.5,
  }}>
    {children}
  </Typography>
);

/* ─── Component ─────────────────────────────────────────────────── */
const AirtimeAndBillsHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box>

      {/* ── Page header ─────────────────────────────────────────────── */}
      <Box sx={{
        bgcolor: '#fff', border: `1px solid ${C.g200}`, borderRadius: '14px',
        p: { xs: 2, sm: 2.5 }, mb: 3,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 2,
        boxShadow: '0 1px 2px rgba(0,0,0,.06)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: '12px',
            background: `linear-gradient(135deg, ${C.brandDark}, ${C.brandMid})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
          }}>
            💳
          </Box>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: C.g900, lineHeight: 1.2 }}>
              Bills &amp; Value Services
            </Typography>
            <Typography sx={{ fontSize: 12, color: C.g500, mt: .25 }}>
              Instant delivery · Zero hidden fees
            </Typography>
          </Box>
        </Box>

        {/* Compact stat row */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {[
            { label: 'Today',       value: '2,341 txns' },
            { label: 'Avg. delivery', value: '< 5 sec'  },
            { label: 'Success rate',  value: '99.9%'     },
          ].map(s => (
            <Box key={s.label} sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: 10.5, color: C.g400, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>
                {s.label}
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: C.g900, letterSpacing: '-.3px' }}>
                {s.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Quick services ─────────────────────────────────────────────── */}
      <SLabel>Quick Services</SLabel>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(3,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(6,1fr)' },
        gap: 1.25, mb: 3.5,
      }}>
        {SERVICES.map(s => (
          <Box
            key={s.name}
            onClick={() => navigate(s.to)}
            sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: .75, py: { xs: 1.75, sm: 2 }, px: .5,
              bgcolor: '#fff', border: `1.5px solid ${C.g200}`, borderRadius: '14px',
              cursor: 'pointer', position: 'relative', transition: 'all .18s',
              '&:hover': {
                borderColor: C.brandMd,
                bgcolor: C.brandXs,
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(139,43,140,.1)',
              },
            }}
          >
            <Box sx={{
              width: 44, height: 44, borderRadius: '12px', bgcolor: s.iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
            }}>
              {s.icon}
            </Box>
            <Typography sx={{
              fontSize: { xs: 10, sm: 11 }, fontWeight: 700, color: C.g700,
              textAlign: 'center', lineHeight: 1.3,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {s.name}
            </Typography>
            {'badge' in s && s.badge && (
              <Box sx={{
                position: 'absolute', top: 7, right: 7,
                bgcolor: s.badgeBg, color: s.badgeColor,
                fontSize: 8.5, fontWeight: 700, px: .75, py: .2,
                borderRadius: '8px',
              }}>
                {s.badge}
              </Box>
            )}
          </Box>
        ))}

        {/* Coming soon */}
        <Box sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: .75, py: { xs: 1.75, sm: 2 }, px: .5,
          bgcolor: C.g50, border: `1.5px dashed ${C.g300}`, borderRadius: '14px',
        }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: '12px', bgcolor: C.g100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>
            ➕
          </Box>
          <Typography sx={{ fontSize: { xs: 10, sm: 11 }, fontWeight: 600, color: C.g400, textAlign: 'center', lineHeight: 1.3 }}>
            More Soon
          </Typography>
        </Box>
      </Box>

      {/* ── How it works ────────────────────────────────────────────── */}
      <SLabel>How it works</SLabel>
      <Box sx={{
        bgcolor: '#fff', border: `1px solid ${C.g200}`, borderRadius: '14px',
        p: { xs: 2, sm: 2.5 }, mb: 3.5,
        display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3,1fr)' },
        gap: { xs: 2, sm: 0 },
        boxShadow: '0 1px 2px rgba(0,0,0,.06)',
      }}>
        {[
          { num: '01', title: 'Select service',   sub: 'Airtime, data, electricity, cable or education.' },
          { num: '02', title: 'Enter details',    sub: 'Number, meter ID or account — confirm amount.'   },
          { num: '03', title: 'Instant delivery', sub: 'Processed and activated in seconds.'             },
        ].map((s, i) => (
          <Box key={s.num} sx={{
            display: 'flex', gap: 1.5, alignItems: 'flex-start',
            px: { xs: 0, sm: 2 },
            borderLeft: { xs: 'none', sm: i > 0 ? `1px solid ${C.g100}` : 'none' },
          }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '9px',
              bgcolor: C.brandXs, border: `1.5px solid ${C.brandSm}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 900, color: C.brand, flexShrink: 0,
            }}>
              {s.num}
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.g900, mb: .35 }}>{s.title}</Typography>
              <Typography sx={{ fontSize: 11.5, color: C.g500, lineHeight: 1.6 }}>{s.sub}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* ── Recent transactions ──────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <SLabel>Recent Transactions</SLabel>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: C.brand, cursor: 'pointer', mb: 1.5 }}>
          View all →
        </Typography>
      </Box>
      <Box sx={{
        bgcolor: '#fff', border: `1px solid ${C.g200}`, borderRadius: '14px',
        overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,.06)',
      }}>
        {RECENT_TX.map((tx, i) => (
          <Box key={i} sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5,
            borderBottom: i < RECENT_TX.length - 1 ? `1px solid ${C.g100}` : 'none',
            cursor: 'pointer', transition: '.12s', '&:hover': { bgcolor: C.g50 },
          }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '9px', bgcolor: tx.iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, flexShrink: 0,
            }}>
              {tx.icon}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: C.g900 }}>{tx.name}</Typography>
              <Typography sx={{
                fontSize: 11, color: C.g400, mt: .1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {tx.meta}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: C.g900 }}>−{tx.amount}</Typography>
              <Typography sx={{ fontSize: 10.5, fontWeight: 600, mt: .2, color: tx.ok ? C.green : C.amber }}>
                {tx.status}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

    </Box>
  );
};

export default AirtimeAndBillsHome;
