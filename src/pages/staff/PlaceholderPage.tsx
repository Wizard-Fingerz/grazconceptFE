/**
 * StaffPlaceholderPage — on-brand "coming soon" page for the staff/agent portal.
 * Matches the GrazConcept dashboard design language.
 */
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useNavigate } from 'react-router-dom';

const C = {
  brand:       '#8b2b8c',
  brandDark:   '#6d1f6e',
  brandMid:    '#a93dab',
  accent:      '#f5e6f5',
  accentBorder:'#d4a8d4',
  g50:         '#FAFAFA',
  g100:        '#F4F4F5',
  g200:        '#E4E4E7',
  g400:        '#A1A1AA',
  g500:        '#71717A',
  g700:        '#3F3F46',
};

interface StaffPlaceholderPageProps {
  title: string;
  description?: string;
  onBack?: () => void;
  icon?: string;
  comingFeatures?: string[];
}

const DEFAULT_FEATURES = [
  'Real-time analytics and reporting dashboard',
  'Team collaboration and assignment tools',
  'Automated workflows and client notifications',
];

export const StaffPlaceholderPage: React.FC<StaffPlaceholderPageProps> = ({
  title,
  description,
  onBack,
  icon = '🛠️',
  comingFeatures = DEFAULT_FEATURES,
}) => {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: C.g50, minHeight: '80vh' }}>
      <Box sx={{
        maxWidth: 660,
        borderRadius: '20px',
        overflow: 'hidden',
        bgcolor: '#fff',
        boxShadow: '0 4px 28px rgba(139,43,140,.10)',
      }}>

        {/* Gradient header */}
        <Box sx={{
          background: `linear-gradient(135deg, ${C.brandDark} 0%, ${C.brand} 50%, ${C.brandMid} 100%)`,
          px: { xs: 3, sm: 4 },
          pt: { xs: 3.5, sm: 4.5 },
          pb: { xs: 2.5, sm: 3.5 },
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Orbs */}
          <Box sx={{ position:'absolute', top:-50, right:-50, width:180, height:180,
            bgcolor:'rgba(255,255,255,.06)', borderRadius:'50%', pointerEvents:'none' }}/>
          <Box sx={{ position:'absolute', bottom:-60, left:-20, width:140, height:140,
            bgcolor:'rgba(255,255,255,.04)', borderRadius:'50%', pointerEvents:'none' }}/>

          {/* Badge */}
          <Box sx={{ display:'inline-flex', alignItems:'center', gap:0.75,
            bgcolor:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.25)',
            borderRadius:'20px', px:1.5, py:0.4, mb:2.5 }}>
            <Box sx={{ width:6, height:6, borderRadius:'50%', bgcolor:'#fde68a',
              animation:'blink 2s ease-in-out infinite',
              '@keyframes blink':{ '0%,100%':{ opacity:1 }, '50%':{ opacity:.3 } } }}/>
            <Typography sx={{ fontSize:10.5, fontWeight:700, color:'rgba(255,255,255,.9)',
              textTransform:'uppercase', letterSpacing:'0.8px' }}>
              Under Development
            </Typography>
          </Box>

          <Box sx={{ fontSize:{ xs:40, sm:48 }, lineHeight:1, mb:1.5 }}>{icon}</Box>

          <Typography sx={{ fontSize:{ xs:20, sm:26 }, fontWeight:900, color:'#fff',
            letterSpacing:'-0.5px', lineHeight:1.2, mb:0.75, position:'relative', zIndex:1 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize:13.5, color:'rgba(255,255,255,.7)', lineHeight:1.65,
            maxWidth:460, position:'relative', zIndex:1 }}>
            {description ||
              "This section is being built out. Full functionality will be available soon."}
          </Typography>
        </Box>

        {/* Body */}
        <Box sx={{ px:{ xs:3, sm:4 }, py:{ xs:3, sm:4 } }}>

          <Typography sx={{ fontSize:11, fontWeight:700, color:C.g400,
            textTransform:'uppercase', letterSpacing:'0.8px', mb:1.75 }}>
            Planned features
          </Typography>

          <Box sx={{ display:'flex', flexDirection:'column', gap:1, mb:3.5 }}>
            {comingFeatures.map((f, i) => (
              <Box key={i} sx={{
                display:'flex', alignItems:'center', gap:1.5,
                p:1.5, borderRadius:'12px', bgcolor:C.g50, border:`1px solid ${C.g100}`,
              }}>
                <Box sx={{
                  width:26, height:26, borderRadius:'8px', flexShrink:0,
                  background:`linear-gradient(135deg, ${C.brand} 0%, ${C.brandMid} 100%)`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <RocketLaunchIcon sx={{ fontSize:13, color:'#fff' }}/>
                </Box>
                <Typography sx={{ fontSize:13, color:C.g700, fontWeight:500 }}>{f}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ p:1.5, borderRadius:'10px', bgcolor:C.accent,
            border:`1px solid ${C.accentBorder}`, mb:3 }}>
            <Typography sx={{ fontSize:12, color:C.brand, lineHeight:1.65 }}>
              Need this functionality now? Reach out via{' '}
              <strong>support@grazconcept.com.ng</strong> and our team will assist you directly.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<ArrowBackIcon/>}
            onClick={handleBack}
            size="small"
            sx={{
              bgcolor:C.brand, fontWeight:700, borderRadius:'10px',
              textTransform:'none', px:2.5, py:1,
              boxShadow:'0 3px 12px rgba(139,43,140,.3)',
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

export default StaffPlaceholderPage;
