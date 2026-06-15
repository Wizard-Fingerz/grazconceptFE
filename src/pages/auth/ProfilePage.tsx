import React, { useEffect, useRef, useState } from "react";
import {
  Box, Typography, Avatar, CircularProgress, Chip,
  LinearProgress, IconButton, Tooltip, Alert,
  Grid, Paper, Divider, Button,
} from "@mui/material";
import EditIcon         from "@mui/icons-material/Edit";
import AddIcon          from "@mui/icons-material/Add";
import UploadFileIcon   from "@mui/icons-material/UploadFile";
import CheckCircleIcon  from "@mui/icons-material/CheckCircle";
import { useAuth }      from "../../context/AuthContext";
import { useNavigate }  from "react-router-dom";
import authService      from "../../services/authService";
import userServices     from "../../services/user";

/* ─── Brand tokens ───────────────────────────────────────────────── */
const C = {
  brand:       "#b66aed",
  accent:      "#cfa5f2",
  accentLight: "#f0d9fb",
  accentXL:    "#f9f0fe",
  brandDark:   "#8b3fc7",
  g50:  "#FAFAFA", g100: "#F4F4F5", g200: "#E4E4E7",
  g400: "#A1A1AA", g500: "#71717A", g700: "#3F3F46", g900: "#18181B",
  green:       "#16A34A",
  greenLight:  "#DCFCE7",
  greenBorder: "#86EFAC",
  amber:       "#D97706",
  amberLight:  "#FEF3C7",
  red:         "#DC2626",
  redLight:    "#FEE2E2",
} as const;

/* ─── Doc ↔ service mapping ──────────────────────────────────────── */
const DOC_SERVICE_MAP: Record<string, string[]> = {
  "Passport":              ["Study", "Work", "Vacation"],
  "General":               ["Study", "Work", "Pilgrimage", "Vacation"],
  "Transcript":            ["Study"],
  "Bank Statement":        ["Study", "Work"],
  "ID Card":               ["Vacation", "Pilgrimage"],
  "Visa":                  ["General"],
  "Offer Letter":          ["Work"],
  "Passport Photo":        ["Study", "Work", "Pilgrimage"],
  "CV / Resume":           ["Work"],
  "English Test":          ["Study", "Work"],
  "Medical Certificate":   ["Pilgrimage"],
  "Admission Letter":      ["Study"],
  "Financial Statement":   ["Study", "Work"],
  "Statement of Purpose":  ["Study"],
  "Reference Letter":      ["Work"],
  "Employment Letter":     ["Work"],
  "Other":                 [],
};

const BASIC_FIELDS = [
  "first_name","last_name","email","phone_number",
  "date_of_birth","gender","nationality","current_address","country_of_residence",
];

function calcCompleteness(user: any): number {
  if (!user) return 0;
  const all = [...BASIC_FIELDS, "passport_number","emergency_contact_name","highest_qualification"];
  const filled = all.filter(k => {
    const v = user[k];
    return v != null && String(v).trim() !== "" && String(v) !== "[object Object]";
  }).length;
  return Math.round((filled / all.length) * 100);
}

/** Safely stringify a value that may be an object with a name/label field */
function fmt(val: any): string | null {
  if (val == null || val === "") return null;
  if (typeof val === "object") return val.name ?? val.label ?? val.term ?? null;
  return String(val).trim() || null;
}

/* ─── Section anchors ────────────────────────────────────────────── */
const SECTIONS = [
  { id: "personal",   label: "Personal"   },
  { id: "passport",   label: "Passport"   },
  { id: "education",  label: "Education"  },
  { id: "employment", label: "Employment" },
  { id: "emergency",  label: "Emergency"  },
  { id: "documents",  label: "Documents"  },
  { id: "travel",     label: "Travel"     },
];

/* ─── InfoRow ────────────────────────────────────────────────────── */
const InfoRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <Box sx={{ display:"flex", flexDirection:"column", gap:0.3, py:0.5 }}>
    <Typography sx={{ fontSize:10.5, fontWeight:700, color:C.g400, textTransform:"uppercase", letterSpacing:"0.6px" }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize:13.5, color: value ? C.g900 : C.g400, fontStyle: value ? "normal" : "italic" }}>
      {value || "Not provided"}
    </Typography>
  </Box>
);

/* ─── SectionBlock ───────────────────────────────────────────────── */
const SectionBlock: React.FC<{
  id:       string;
  icon:     string;
  title:    string;
  status?:  "complete" | "partial" | "missing";
  children: React.ReactNode;
}> = ({ id, icon, title, status, children }) => {
  const navigate = useNavigate();
  return (
    <Paper
      id={id}
      variant="outlined"
      sx={{
        borderRadius: "16px",
        mb:           2.5,
        overflow:     "hidden",
        borderColor:  C.g200,
        scrollMarginTop: 108, // offset for sticky nav + header
      }}
    >
      <Box
        sx={{
          display:      "flex",
          alignItems:   "center",
          gap:          1.5,
          px:           3,
          py:           2,
          borderBottom: `1px solid ${C.g100}`,
          bgcolor:      C.g50,
        }}
      >
        <Box
          sx={{
            width:36, height:36, borderRadius:"10px",
            bgcolor:C.accentXL, border:`1px solid ${C.accentLight}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:17, flexShrink:0,
          }}
        >
          {icon}
        </Box>
        <Typography sx={{ fontWeight:700, fontSize:15, color:C.g900, flex:1 }}>
          {title}
        </Typography>
        {status === "complete" && <Chip label="Complete" size="small" sx={{ bgcolor:C.greenLight, color:C.green, fontWeight:700, fontSize:11, border:`1px solid ${C.greenBorder}` }} />}
        {status === "partial"  && <Chip label="Partial"  size="small" sx={{ bgcolor:C.amberLight, color:C.amber, fontWeight:700, fontSize:11 }} />}
        {status === "missing"  && <Chip label="Missing"  size="small" sx={{ bgcolor:C.redLight,   color:C.red,   fontWeight:700, fontSize:11 }} />}
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => navigate("/settings/profile/edit")}
            sx={{ color:C.g400, "&:hover":{ color:C.brand } }}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ px:3, py:2.5 }}>{children}</Box>
    </Paper>
  );
};

/* ─── DocCard ────────────────────────────────────────────────────── */
const DocCard: React.FC<{
  typeTerm: string;
  uploaded?: { id:number; file:string; uploaded_at:string };
  onUpload:  (typeId:number, typeTerm:string) => void;
  typeId:    number;
}> = ({ typeTerm, uploaded, onUpload, typeId }) => {
  const services = DOC_SERVICE_MAP[typeTerm] ?? [];
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: "12px", p:2,
        display:"flex", flexDirection:"column", gap:0.75,
        borderColor: uploaded ? C.greenBorder : C.g200,
        bgcolor:     uploaded ? C.greenLight  : "#fff",
        cursor:      !uploaded ? "pointer" : "default",
        transition:  "all .15s",
        "&:hover":   !uploaded ? { borderColor:C.brand, bgcolor:C.accentXL } : {},
      }}
      onClick={() => !uploaded && onUpload(typeId, typeTerm)}
    >
      <Box sx={{ display:"flex", alignItems:"flex-start", gap:1.2 }}>
        <Box
          sx={{
            width:34, height:34, borderRadius:"8px",
            bgcolor: uploaded ? "#fff" : C.g100,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:16, flexShrink:0,
            border: uploaded ? `1px solid ${C.greenBorder}` : "none",
          }}
        >
          {uploaded ? "✅" : "📄"}
        </Box>
        <Box sx={{ flex:1, minWidth:0 }}>
          <Typography sx={{ fontSize:12.5, fontWeight:700, color:C.g900 }}>{typeTerm}</Typography>
          {uploaded
            ? <Typography sx={{ fontSize:11, color:C.green }}>Uploaded · {new Date(uploaded.uploaded_at).toLocaleDateString()}</Typography>
            : <Typography sx={{ fontSize:11, color:C.g400 }}>Not uploaded</Typography>
          }
        </Box>
        {uploaded
          ? <CheckCircleIcon sx={{ fontSize:17, color:C.green, flexShrink:0 }} />
          : <UploadFileIcon  sx={{ fontSize:17, color:C.g400,  flexShrink:0 }} />
        }
      </Box>
      {services.length > 0 && (
        <Box sx={{ display:"flex", gap:0.5, flexWrap:"wrap" }}>
          {services.map(s => (
            <Chip key={s} label={s} size="small"
              sx={{
                height:17, fontSize:10, fontWeight:600,
                bgcolor: uploaded ? "#fff"    : C.accentXL,
                color:   uploaded ? C.green   : C.brandDark,
                border:  `1px solid ${uploaded ? C.greenBorder : C.accentLight}`,
              }}
            />
          ))}
        </Box>
      )}
      {!uploaded && (
        <Button size="small" variant="outlined" startIcon={<AddIcon />}
          onClick={e => { e.stopPropagation(); onUpload(typeId, typeTerm); }}
          sx={{
            mt:0.5, color:C.brand, borderColor:C.accentLight,
            fontWeight:700, fontSize:11, borderRadius:"7px",
            textTransform:"none", bgcolor:C.accentXL,
            "&:hover":{ bgcolor:C.accentLight },
          }}
        >
          Upload
        </Button>
      )}
    </Paper>
  );
};

/* ─── Inline upload panel ────────────────────────────────────────── */
const UploadPanel: React.FC<{
  typeId:   number;
  typeTerm: string;
  userId:   number;
  onDone:   () => void;
  onCancel: () => void;
}> = ({ typeId, typeTerm, userId, onDone, onCancel }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file,      setFile]      = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [err,       setErr]       = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("client", String(userId));
      fd.append("type", String(typeId));
      await userServices.uploadClientDocument(fd);
      onDone();
    } catch { setErr("Upload failed. Please try again."); }
    finally  { setUploading(false); }
  };

  return (
    <Paper variant="outlined"
      sx={{ borderRadius:"12px", p:2.5, mb:2, borderColor:C.brand, bgcolor:C.accentXL }}
    >
      <Typography sx={{ fontWeight:700, fontSize:14, color:C.g900, mb:1.5 }}>
        Upload: {typeTerm}
      </Typography>
      <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        style={{ display:"block", marginBottom:12, fontSize:13 }}
        onChange={e => setFile(e.target.files?.[0] ?? null)} />
      {err && <Alert severity="error" sx={{ mb:1.5, fontSize:12 }}>{err}</Alert>}
      <Box sx={{ display:"flex", gap:1 }}>
        <Button variant="contained" disabled={!file || uploading} onClick={handleUpload}
          sx={{ bgcolor:C.brand, fontWeight:700, fontSize:12, borderRadius:"8px",
                "&:hover":{ bgcolor:C.brandDark } }}>
          {uploading ? <CircularProgress size={16} color="inherit" /> : "Confirm Upload"}
        </Button>
        <Button variant="outlined" onClick={onCancel}
          sx={{ color:C.g500, borderColor:C.g200, fontWeight:600, fontSize:12, borderRadius:"8px" }}>
          Cancel
        </Button>
      </Box>
    </Paper>
  );
};

/* ─── Main ProfilePage ───────────────────────────────────────────── */
const ProfilePage: React.FC = () => {
  const { user: authUser } = useAuth();
  const [user,       setUser]       = useState<any>(authUser);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [docTypes,   setDocTypes]   = useState<any[]>([]);
  const [clientDocs, setClientDocs] = useState<any[]>([]);
  const [docsLoading,setDocsLoading]= useState(false);
  const [uploadPanel,setUploadPanel]= useState<{ typeId:number; typeTerm:string } | null>(null);
  const [activeSection, setActiveSection] = useState("personal");
  const navigate = useNavigate();
  const navRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      authService.getProfile(),
      userServices.getAllDocumentType(),
      userServices.getAllClientsDocument(),
    ])
      .then(([profile, types, docs]) => {
        if (!alive) return;
        setUser(profile);
        setDocTypes(Array.isArray(types) ? types : types?.results ?? []);
        setClientDocs(Array.isArray(docs) ? docs : docs?.results ?? []);
      })
      .catch(() => { if (alive) setError("Failed to load profile."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  /* Track active section on scroll */
  useEffect(() => {
    const handler = () => {
      for (const s of [...SECTIONS].reverse()) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 130) {
          setActiveSection(s.id);
          return;
        }
      }
      setActiveSection("personal");
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  };

  const reloadDocs = async () => {
    setDocsLoading(true);
    try {
      const docs = await userServices.getAllClientsDocument();
      setClientDocs(Array.isArray(docs) ? docs : docs?.results ?? []);
    } finally { setDocsLoading(false); }
  };

  const uploadedForType = (typeId: number) =>
    clientDocs.find(d => d.type === typeId || d.type?.id === typeId);

  const completeness     = calcCompleteness(user);
  const profileImageUrl  = user?.profile_picture_url || user?.profile_picture || undefined;

  /* ── Loading / Error ──────────────────────────────────────────── */
  if (loading) return (
    <Box sx={{ minHeight:"60vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <CircularProgress sx={{ color:C.brand }} />
    </Box>
  );
  if (error || !user) return (
    <Box sx={{ minHeight:"60vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Typography color="text.secondary">{error || "Profile unavailable."}</Typography>
    </Box>
  );

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <Box sx={{ py:2 }}>

      {/* ── HEADER CARD ── */}
      <Box
        sx={{
          background:    `linear-gradient(135deg,${C.brandDark} 0%,${C.brand} 60%,${C.accent} 100%)`,
          borderRadius:  "18px",
          p:             { xs:2.5, sm:3 },
          mb:            2,
          color:         "#fff",
          display:       "flex",
          alignItems:    { xs:"flex-start", sm:"center" },
          gap:           { xs:2, sm:3 },
          flexDirection: { xs:"column", sm:"row" },
        }}
      >
        {/* Avatar */}
        <Box sx={{ position:"relative", flexShrink:0 }}>
          <Avatar
            src={profileImageUrl}
            sx={{
              width:80, height:80,
              bgcolor:"rgba(255,255,255,.2)",
              fontSize:28, fontWeight:800,
              border:"3px solid rgba(255,255,255,.4)",
            }}
          >
            {!profileImageUrl && (user.first_name?.[0] || "U").toUpperCase()}
          </Avatar>
          <Tooltip title="Edit Profile">
            <IconButton size="small"
              onClick={() => navigate("/settings/profile/edit")}
              sx={{
                position:"absolute", bottom:0, right:0,
                bgcolor:"#fff", border:`2px solid ${C.brand}`,
                width:26, height:26,
                "&:hover":{ bgcolor:C.accentXL },
              }}
            >
              <EditIcon sx={{ fontSize:13, color:C.brand }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Name + meta */}
        <Box sx={{ flex:1 }}>
          <Typography sx={{ fontSize:{ xs:20, sm:24 }, fontWeight:800, lineHeight:1.2 }}>
            {user.first_name} {user.last_name}
          </Typography>
          <Typography sx={{ fontSize:13, opacity:.8, mt:0.25 }}>{user.email}</Typography>
          <Box sx={{ display:"flex", gap:1, mt:1, flexWrap:"wrap" }}>
            {fmt(user.nationality) && <Chip label={`🌍 ${fmt(user.nationality)}`} size="small" sx={{ bgcolor:"rgba(255,255,255,.2)", color:"#fff", fontWeight:600, fontSize:11 }} />}
            <Chip label={user.user_type_name || "Customer"} size="small" sx={{ bgcolor:"rgba(255,255,255,.2)", color:"#fff", fontWeight:600, fontSize:11 }} />
            {user.custom_id && <Chip label={`ID: ${user.custom_id}`} size="small" sx={{ bgcolor:"rgba(255,255,255,.2)", color:"#fff", fontWeight:600, fontSize:11 }} />}
          </Box>

          {/* Completeness */}
          <Box sx={{ bgcolor:"rgba(255,255,255,.15)", borderRadius:"10px", p:"10px 14px", mt:1.5, maxWidth:480 }}>
            <Box sx={{ display:"flex", justifyContent:"space-between", mb:0.6 }}>
              <Typography sx={{ fontSize:12, fontWeight:600 }}>Profile Completeness</Typography>
              <Typography sx={{ fontSize:15, fontWeight:800 }}>{completeness}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={completeness}
              sx={{ height:6, borderRadius:3, bgcolor:"rgba(255,255,255,.2)", "& .MuiLinearProgress-bar":{ bgcolor:"#fff", borderRadius:3 } }} />
            <Typography sx={{ fontSize:11, opacity:.7, mt:0.5 }}>
              Complete your profile to speed up all applications
            </Typography>
          </Box>
        </Box>

        <Button variant="outlined" startIcon={<EditIcon />}
          onClick={() => navigate("/settings/profile/edit")}
          sx={{
            color:"#fff", borderColor:"rgba(255,255,255,.4)",
            bgcolor:"rgba(255,255,255,.1)", fontWeight:700, fontSize:12,
            borderRadius:"10px", flexShrink:0, textTransform:"none",
            "&:hover":{ bgcolor:"rgba(255,255,255,.2)" },
            alignSelf:{ xs:"flex-start", sm:"flex-start" },
          }}
        >
          Edit Profile
        </Button>
      </Box>

      {completeness < 70 && (
        <Alert severity="warning" sx={{ mb:2, borderRadius:"12px", fontSize:13 }}>
          <strong>Profile incomplete.</strong> Add your passport details, emergency contact, and documents to apply for any service without re-entering information.
        </Alert>
      )}

      {/* ── STICKY SECTION NAV ── */}
      <Box
        ref={navRef}
        sx={{
          position:   "sticky",
          top:        64,
          zIndex:     100,
          bgcolor:    "#fff",
          borderBottom:`1px solid ${C.g200}`,
          display:    "flex",
          gap:        0,
          overflowX:  "auto",
          mb:         2.5,
          mx:         { xs:-1, sm:-2, md:-4 },   // bleed to edge of layout padding
          px:         { xs:1, sm:2, md:4 },
          "&::-webkit-scrollbar":{ display:"none" },
          scrollbarWidth:"none",
        }}
      >
        {SECTIONS.map(s => (
          <Box
            key={s.id}
            onClick={() => scrollTo(s.id)}
            sx={{
              px:         2,
              py:         1.5,
              fontSize:   13,
              fontWeight: activeSection === s.id ? 700 : 500,
              color:      activeSection === s.id ? C.brand  : C.g500,
              borderBottom: activeSection === s.id ? `2px solid ${C.brand}` : "2px solid transparent",
              cursor:     "pointer",
              whiteSpace: "nowrap",
              transition: "all .15s",
              "&:hover":  { color:C.brand },
            }}
          >
            {s.label}
          </Box>
        ))}
      </Box>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* PERSONAL                                                   */}
      {/* ══════════════════════════════════════════════════════════ */}
      <SectionBlock id="personal" icon="👤" title="Personal Information"
        status={BASIC_FIELDS.every(k => {
          const v = user[k]; return v && String(v).trim() && String(v) !== "[object Object]";
        }) ? "complete" : "partial"}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6} md={4}><InfoRow label="First Name"          value={fmt(user.first_name)} /></Grid>
          <Grid item xs={12} sm={6} md={4}><InfoRow label="Middle Name"          value={fmt(user.middle_name)} /></Grid>
          <Grid item xs={12} sm={6} md={4}><InfoRow label="Last Name"            value={fmt(user.last_name)} /></Grid>
          <Grid item xs={12} sm={6} md={4}><InfoRow label="Email"                value={fmt(user.email)} /></Grid>
          <Grid item xs={12} sm={6} md={4}><InfoRow label="Phone Number"         value={fmt(user.phone_number)} /></Grid>
          <Grid item xs={12} sm={6} md={4}><InfoRow label="Date of Birth"        value={user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString(undefined,{year:"numeric",month:"long",day:"numeric"}) : null} /></Grid>
          <Grid item xs={12} sm={6} md={4}><InfoRow label="Gender"               value={fmt(user.gender_name || user.gender)} /></Grid>
          <Grid item xs={12} sm={6} md={4}><InfoRow label="Nationality"          value={fmt(user.nationality)} /></Grid>
          <Grid item xs={12} sm={6} md={4}><InfoRow label="Country of Residence" value={fmt(user.country_of_residence)} /></Grid>
          <Grid item xs={12}>              <InfoRow label="Current Address"       value={fmt(user.current_address)} /></Grid>
        </Grid>
      </SectionBlock>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* PASSPORT & ID                                              */}
      {/* ══════════════════════════════════════════════════════════ */}
      <SectionBlock id="passport" icon="🛂" title="Passport & Identity"
        status={user.passport_number ? "complete" : "missing"}>
        {!user.passport_number && (
          <Alert severity="warning" sx={{ mb:2, borderRadius:"10px", fontSize:12.5 }}>
            Passport details are missing. Add them once — they'll be used across all your visa applications.
          </Alert>
        )}
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}><InfoRow label="Passport Number"      value={fmt(user.passport_number)} /></Grid>
          <Grid item xs={12} sm={6}><InfoRow label="Passport Expiry Date" value={user.passport_expiry_date ? new Date(user.passport_expiry_date).toLocaleDateString() : null} /></Grid>
          <Grid item xs={12} sm={6}><InfoRow label="NIN"                  value={fmt(user.nin)} /></Grid>
          <Grid item xs={12} sm={6}><InfoRow label="BVN"                  value={user.bvn ? "••••••••" + String(user.bvn).slice(-3) : null} /></Grid>
        </Grid>
        <Divider sx={{ my:2 }} />
        <Button variant="outlined" size="small" startIcon={<EditIcon />}
          onClick={() => navigate("/settings/profile/edit")}
          sx={{ color:C.brand, borderColor:C.accentLight, fontWeight:700, fontSize:12, borderRadius:"8px", textTransform:"none", bgcolor:C.accentXL, "&:hover":{ bgcolor:C.accentLight } }}>
          {user.passport_number ? "Update passport details" : "Add passport details"}
        </Button>
      </SectionBlock>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* EDUCATION                                                  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <SectionBlock id="education" icon="🎓" title="Educational Background"
        status={user.highest_qualification ? (user.previous_university ? "complete" : "partial") : "missing"}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}><InfoRow label="Highest Qualification"  value={fmt(user.highest_qualification)} /></Grid>
          <Grid item xs={12} sm={6}><InfoRow label="Graduation Year"        value={fmt(user.graduation_year)} /></Grid>
          <Grid item xs={12} sm={6}><InfoRow label="Previous University"    value={fmt(user.previous_university)} /></Grid>
          <Grid item xs={12} sm={6}><InfoRow label="Field of Study"         value={fmt(user.previous_course_of_study)} /></Grid>
          <Grid item xs={12} sm={6}><InfoRow label="CGPA / Final Grade"     value={fmt(user.cgpa)} /></Grid>
        </Grid>
      </SectionBlock>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* EMPLOYMENT                                                 */}
      {/* ══════════════════════════════════════════════════════════ */}
      <SectionBlock id="employment" icon="💼" title="Employment History"
        status={user.previous_employer ? "partial" : "missing"}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}><InfoRow label="Job Title"          value={fmt(user.previous_job_title)} /></Grid>
          <Grid item xs={12} sm={6}><InfoRow label="Most Recent Employer"value={fmt(user.previous_employer)} /></Grid>
          <Grid item xs={12} sm={6}><InfoRow label="Years of Experience" value={user.years_of_experience != null ? `${user.years_of_experience} years` : null} /></Grid>
          <Grid item xs={12} sm={6}><InfoRow label="Year Left"           value={fmt(user.year_left_previous_job)} /></Grid>
        </Grid>
      </SectionBlock>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* EMERGENCY CONTACT                                          */}
      {/* ══════════════════════════════════════════════════════════ */}
      <SectionBlock id="emergency" icon="🆘" title="Emergency Contact"
        status={user.emergency_contact_name ? "complete" : "missing"}>
        {!user.emergency_contact_name && (
          <Alert severity="error" sx={{ mb:2, borderRadius:"10px", fontSize:12.5 }}>
            Emergency contact is required for all visa and travel applications.
          </Alert>
        )}
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={4}><InfoRow label="Full Name"     value={fmt(user.emergency_contact_name)} /></Grid>
          <Grid item xs={12} sm={4}><InfoRow label="Relationship"  value={fmt(user.emergency_contact_relationship)} /></Grid>
          <Grid item xs={12} sm={4}><InfoRow label="Phone Number"  value={fmt(user.emergency_contact_phone)} /></Grid>
        </Grid>
        <Divider sx={{ my:2 }} />
        <Button variant="outlined" size="small" startIcon={<EditIcon />}
          onClick={() => navigate("/settings/profile/edit")}
          sx={{ color:C.brand, borderColor:C.accentLight, fontWeight:700, fontSize:12, borderRadius:"8px", textTransform:"none", bgcolor:C.accentXL, "&:hover":{ bgcolor:C.accentLight } }}>
          {user.emergency_contact_name ? "Update emergency contact" : "Add emergency contact"}
        </Button>
      </SectionBlock>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* DOCUMENTS                                                  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Paper id="documents" variant="outlined"
        sx={{ borderRadius:"16px", mb:2.5, overflow:"hidden", borderColor:C.g200, scrollMarginTop:108 }}>
        <Box sx={{ display:"flex", alignItems:"center", gap:1.5, px:3, py:2, borderBottom:`1px solid ${C.g100}`, bgcolor:C.g50 }}>
          <Box sx={{ width:36, height:36, borderRadius:"10px", bgcolor:C.accentXL, border:`1px solid ${C.accentLight}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>
            📎
          </Box>
          <Typography sx={{ fontWeight:700, fontSize:15, color:C.g900, flex:1 }}>My Documents</Typography>
          <Chip label={`${clientDocs.length} uploaded`} size="small"
            sx={{ bgcolor:C.greenLight, color:C.green, fontWeight:700, fontSize:11, border:`1px solid ${C.greenBorder}` }} />
        </Box>
        <Box sx={{ px:3, py:2.5 }}>
          <Alert severity="info" sx={{ mb:2.5, borderRadius:"10px", fontSize:12.5 }}>
            Documents uploaded here are automatically reused across all your applications — no need to re-upload each time.
          </Alert>
          {uploadPanel && (
            <UploadPanel
              typeId={uploadPanel.typeId} typeTerm={uploadPanel.typeTerm}
              userId={user.id}
              onDone={async () => { await reloadDocs(); setUploadPanel(null); }}
              onCancel={() => setUploadPanel(null)}
            />
          )}
          {docsLoading ? (
            <Box sx={{ textAlign:"center", py:3 }}><CircularProgress sx={{ color:C.brand }} size={28} /></Box>
          ) : (
            <Grid container spacing={1.5}>
              {docTypes.map((dt: any) => {
                const uploaded = uploadedForType(dt.id);
                return (
                  <Grid item xs={12} sm={6} md={4} key={dt.id}>
                    <DocCard typeId={dt.id} typeTerm={dt.term}
                      uploaded={uploaded ? { id:uploaded.id, file:uploaded.file, uploaded_at:uploaded.uploaded_at } : undefined}
                      onUpload={(id, term) => setUploadPanel({ typeId:id, typeTerm:term })}
                    />
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </Paper>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* TRAVEL HISTORY                                             */}
      {/* ══════════════════════════════════════════════════════════ */}
      <SectionBlock id="travel" icon="🌍" title="Travel History"
        status={user.travel_history ? "partial" : "missing"}>
        <Alert severity="info" sx={{ mb:2, borderRadius:"10px", fontSize:12.5 }}>
          Travel history is optional but strengthens your visa applications.
        </Alert>
        {user.travel_history
          ? <Typography sx={{ fontSize:13.5, color:C.g700, whiteSpace:"pre-wrap", lineHeight:1.7 }}>{user.travel_history}</Typography>
          : <Typography sx={{ fontSize:13, color:C.g400, fontStyle:"italic" }}>No travel history recorded.</Typography>
        }
        <Divider sx={{ my:2 }} />
        <Box sx={{ display:"flex", alignItems:"center", gap:1.5 }}>
          <Typography sx={{ fontSize:12.5, color:C.g500 }}>Previous visa denials?</Typography>
          <Chip
            label={user.previous_visa_applications ? "Yes" : "No"}
            size="small"
            sx={{ bgcolor: user.previous_visa_applications ? C.amberLight : C.greenLight,
                  color:   user.previous_visa_applications ? C.amber      : C.green,
                  fontWeight:700 }}
          />
        </Box>
        {user.previous_visa_applications && user.previous_visa_details && (
          <Typography sx={{ fontSize:12.5, color:C.g700, mt:1, p:1.5, bgcolor:C.amberLight, borderRadius:"8px", lineHeight:1.6 }}>
            {user.previous_visa_details}
          </Typography>
        )}
      </SectionBlock>

      {/* bottom spacer */}
      <Box sx={{ height:32 }} />
    </Box>
  );
};

export default ProfilePage;
