/**
 * CustomerPlaceholderPage — on-brand "coming soon" page
 * Matches the GrazConcept dashboard design language.
 */
import React from 'react';
import { Box, Typography, Button, } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useNavigate } from 'react-router-dom';

/* ─── Brand tokens ─────────────────────────────────────────────────────────── */
const C = {
  brand:      '#8b2b8c',
  brandDark:  '#6d1f6e',
  brandMid:   '#a93dab',
  brandLight: '#c96acb',
  accent:     '#f5e6f5',
  accentBorder:'#d4a8d4',
  g50:        '#FAFAFA',
  g100:       '#F4F4F5',
  g200:       '#E4E4E7',
  g400:       '#A1A1AA',
  g500:       '#71717A',
  g700:       '#3F3F46',
  g900:       '#18181B',
};

interface CustomerPlaceholderPageProps {
  title: string;
  description?: string;
  onBack?: () => void;
  /** Optional icon emoji shown in the hero, default ✨ */
  icon?: string;
  /** Optional teaser list of features coming to this page */
  comingFeatures?: string[];
}

const DEFAULT_FEATURES = [
  'Full dashboard with real-time data',
  'Seamless application & tracking flow',
  'Integrated payments & notifications',
];

export const CustomerPlaceholderPage: React.FC<CustomerPlaceholderPageProps> = ({
  title,
  description,
  onBack,
  icon = '✨',
  comingFeatures = DEFAULT_FEATURES,
}) => {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  return (
    <Box sx={{ minHeight: '80vh', bgcolor: C.g50, px: { xs: 2, sm: 4 }, py: { xs: 3, sm: 5 } }}>

      {/* ── Hero card ──────────────────────────────────────────────────────── */}
      <Box sx={{
        maxWidth: 680,
        mx: 'auto',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(139,43,140,.14)',
        bgcolor: '#fff',
      }}>

        {/* Gradient banner */}
        <Box sx={{
          background: `linear-gradient(135deg, ${C.brandDark} 0%, ${C.brand} 50%, ${C.brandMid} 100%)`,
          px: { xs: 3, sm: 5 },
          pt: { xs: 4, sm: 5 },
          pb: { xs: 3, sm: 4 },
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative orbs */}
          <Box sx={{ position:'absolute', top:-60, right:-60, width:200, height:200,
            bgcolor:'rgba(255,255,255,.06)', borderRadius:'50%', pointerEvents:'none' }}/>
          <Box sx={{ position:'absolute', bottom:-80, left:-30, width:160, height:160,
            bgcolor:'rgba(255,255,255,.04)', borderRadius:'50%', pointerEvents:'none' }}/>

          {/* Badge */}
          <Box sx={{ display:'inline-flex', alignItems:'center', gap:0.75,
            bgcolor:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.25)',
            borderRadius:'20px', px:1.5, py:0.4, mb:2.5 }}>
            <Box sx={{ width:6, height:6, borderRadius:'50%', bgcolor:'#fde68a',
              animation:'pulse 2s ease-in-out infinite',
              '@keyframes pulse':{ '0%,100%':{ opacity:1 }, '50%':{ opacity:.35 } } }}/>
            <Typography sx={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.9)',
              textTransform:'uppercase', letterSpacing:'0.8px' }}>
              Coming Soon
            </Typography>
          </Box>

          {/* Big icon */}
          <Box sx={{ fontSize: { xs:48, sm:60 }, lineHeight:1, mb:2 }}>{icon}</Box>

          <Typography sx={{ fontSize:{ xs:24, sm:30 }, fontWeight:900, color:'#fff',
            letterSpacing:'-0.5px', lineHeight:1.15, mb:1, position:'relative', zIndex:1 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize:14, color:'rgba(255,255,255,.7)', lineHeight:1.65,
            maxWidth:480, position:'relative', zIndex:1 }}>
            {description ||
              "We're building something great for this section. It will be live soon — stay tuned!"}
          </Typography>
        </Box>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <Box sx={{ px:{ xs:3, sm:5 }, py:{ xs:3, sm:4 } }}>

          {/* What's coming */}
          <Typography sx={{ fontSize:12, fontWeight:700, color:C.g400,
            textTransform:'uppercase', letterSpacing:'0.8px', mb:2 }}>
            What's coming
          </Typography>

          <Box sx={{ display:'flex', flexDirection:'column', gap:1.25, mb:4 }}>
            {comingFeatures.map((f, i) => (
              <Box key={i} sx={{
                display:'flex', alignItems:'center', gap:1.5,
                p:1.75, borderRadius:'14px', bgcolor:C.g50,
                border:`1px solid ${C.g100}`,
              }}>
                <Box sx={{
                  width:28, height:28, borderRadius:'8px', flexShrink:0,
                  background:`linear-gradient(135deg, ${C.brand} 0%, ${C.brandMid} 100%)`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <RocketLaunchIcon sx={{ fontSize:14, color:'#fff' }}/>
                </Box>
                <Typography sx={{ fontSize:13.5, color:C.g700, fontWeight:500 }}>
                  {f}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* ETA note */}
          <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:3,
            p:1.5, borderRadius:'12px', bgcolor:C.accent, border:`1px solid ${C.accentBorder}` }}>
            <Typography sx={{ fontSize:12.5, color:C.brand, lineHeight:1.6 }}>
              Our team is actively working on this page. If you need assistance in the meantime,
              please contact <strong>support@grazconcept.com.ng</strong>.
            </Typography>
          </Box>

          {/* CTA */}
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon/>}
            onClick={handleBack}
            sx={{
              bgcolor: C.brand, fontWeight:700, borderRadius:'12px',
              textTransform:'none', px:3, py:1.2, fontSize:14,
              boxShadow:'0 4px 16px rgba(139,43,140,.3)',
              '&:hover':{ bgcolor:C.brandDark },
            }}
          >
            Go Back
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CustomerPlaceholderPage;
