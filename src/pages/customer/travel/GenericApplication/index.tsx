/**
 * GenericApplication — Single-page application entry-point.
 *
 * All sections visible at once: service selector → profile prefill summary
 * → document checklist → CTA. No stepper / multi-step flow.
 */
import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Grid, Button, CircularProgress,
  Chip, Alert, Divider, LinearProgress, Tooltip, Avatar,
} from "@mui/material";
import CheckCircleIcon       from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon      from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon      from "@mui/icons-material/WarningAmber";
import ArrowForwardIcon      from "@mui/icons-material/ArrowForward";
import EditOutlinedIcon      from "@mui/icons-material/EditOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import SchoolOutlinedIcon    from "@mui/icons-material/SchoolOutlined";
import WorkOutlinedIcon      from "@mui/icons-material/WorkOutlined";
import MosqueOutlinedIcon    from "@mui/icons-material/MosqueOutlined";
import BeachAccessOutlinedIcon from "@mui/icons-material/BeachAccessOutlined";
import LockPersonOutlinedIcon  from "@mui/icons-material/LockPersonOutlined";
import { useNavigate, useSearchParams } from "react-router-dom";
import authService from "../../../../services/authService";
import userServices from "../../../../services/user";

/* ─── Brand tokens ─────────────────────────────────────────────────────── */
const C = {
  brand:       "#b66aed",
  accent:      "#cfa5f2",
  accentLight: "#f0d9fb",
  accentXL:    "#f9f0fe",
  brandDark:   "#8b3fc7",
  g50:  "#FAFAFA",
  g100: "#F4F4F5",
  g200: "#E4E4E7",
  g300: "#D4D4D8",
  g400: "#A1A1AA",
  g500: "#71717A",
  g700: "#3F3F46",
  g900: "#18181B",
  green:       "#16A34A",
  greenLight:  "#DCFCE7",
  greenBorder: "#86EFAC",
  amber:       "#D97706",
  amberLight:  "#FEF3C7",
  amberBorder: "#FCD34D",
  red:         "#DC2626",
  redLight:    "#FEE2E2",
  redBorder:   "#FCA5A5",
} as const;

/* ─── Service config ───────────────────────────────────────────────────── */
type ServiceKey = "study" | "work" | "pilgrimage" | "vacation";

interface ServiceConfig {
  key:             ServiceKey;
  Icon:            React.ElementType;
  label:           string;
  description:     string;
  gradient:        string;
  browseRoute:     string;
  requiredDocs:    string[];
  requiredProfile: string[];
}

const SERVICES: ServiceConfig[] = [
  {
    key:         "study",
    Icon:        SchoolOutlinedIcon,
    label:       "Study Abroad",
    description: "University & college programmes worldwide",
    gradient:    "linear-gradient(135deg,#7c3aed,#b66aed)",
    browseRoute: "/travel/study-visa",
    requiredDocs:    ["Passport", "Passport Photo", "Transcript", "Bank Statement"],
    requiredProfile: ["first_name","last_name","passport_number","passport_expiry_date","date_of_birth","highest_qualification","previous_university","emergency_contact_name"],
  },
  {
    key:         "work",
    Icon:        WorkOutlinedIcon,
    label:       "Work Abroad",
    description: "International job placements & work visas",
    gradient:    "linear-gradient(135deg,#0369a1,#0ea5e9)",
    browseRoute: "/travel/work-visa/countries-jobs",
    requiredDocs:    ["Passport", "Passport Photo", "CV / Resume", "Bank Statement"],
    requiredProfile: ["first_name","last_name","passport_number","passport_expiry_date","date_of_birth","previous_employer","years_of_experience","emergency_contact_name"],
  },
  {
    key:         "pilgrimage",
    Icon:        MosqueOutlinedIcon,
    label:       "Pilgrimage",
    description: "Hajj, Umrah & other spiritual journeys",
    gradient:    "linear-gradient(135deg,#065f46,#10b981)",
    browseRoute: "/travel/pilgrimage/offers",
    requiredDocs:    ["Passport", "Passport Photo", "Medical Certificate"],
    requiredProfile: ["first_name","last_name","passport_number","date_of_birth","emergency_contact_name"],
  },
  {
    key:         "vacation",
    Icon:        BeachAccessOutlinedIcon,
    label:       "Travel & Vacation",
    description: "Holiday packages and leisure travel",
    gradient:    "linear-gradient(135deg,#b45309,#f59e0b)",
    browseRoute: "/travel/vacation",
    requiredDocs:    ["Passport"],
    requiredProfile: ["first_name","last_name","passport_number","date_of_birth"],
  },
];

const FIELD_LABELS: Record<string, string> = {
  first_name:              "First Name",
  last_name:               "Last Name",
  passport_number:         "Passport Number",
  passport_expiry_date:    "Passport Expiry",
  date_of_birth:           "Date of Birth",
  highest_qualification:   "Highest Qualification",
  previous_university:     "Previous University",
  emergency_contact_name:  "Emergency Contact",
  previous_employer:       "Previous Employer",
  years_of_experience:     "Years of Experience",
};

const DOC_TYPE_MATCH: Record<string, string[]> = {
  "Passport":             ["Passport", "passport"],
  "Passport Photo":       ["Passport Photo", "photo"],
  "Transcript":           ["Transcript"],
  "Bank Statement":       ["Bank Statement", "bank"],
  "CV / Resume":          ["CV", "Resume"],
  "Medical Certificate":  ["Medical"],
};

/* ─── Sub-components ───────────────────────────────────────────────────── */

/** Horizontal service selector card */
const ServiceCard: React.FC<{
  svc:      ServiceConfig;
  selected: boolean;
  onSelect: () => void;
}> = ({ svc, selected, onSelect }) => {
  const { Icon } = svc;
  return (
    <Paper
      variant="outlined"
      onClick={onSelect}
      sx={{
        borderRadius: "16px",
        p: 2.5,
        cursor: "pointer",
        transition: "all .18s ease",
        borderColor:  selected ? C.brand : C.g200,
        borderWidth:  selected ? 2 : 1,
        bgcolor:      selected ? C.accentXL : "#fff",
        display:      "flex",
        alignItems:   "center",
        gap:          2,
        userSelect:   "none",
        "&:hover": {
          borderColor: C.brand,
          bgcolor:     C.accentXL,
          transform:   "translateY(-1px)",
          boxShadow:   "0 4px 14px rgba(182,106,237,.15)",
        },
      }}
    >
      <Box
        sx={{
          width:          48,
          height:         48,
          borderRadius:   "14px",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          background:     selected ? svc.gradient : C.g100,
          flexShrink:     0,
          transition:     "background .18s",
        }}
      >
        <Icon sx={{ fontSize: 22, color: selected ? "#fff" : C.g400 }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14, color: C.g900, lineHeight: 1.3 }}>
          {svc.label}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: C.g400, mt: 0.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {svc.description}
        </Typography>
      </Box>

      {selected && (
        <CheckCircleIcon sx={{ color: C.brand, fontSize: 20, flexShrink: 0 }} />
      )}
    </Paper>
  );
};

/** Single profile field row */
const ProfileRow: React.FC<{ label: string; value?: string | null; ok: boolean }> = ({ label, value, ok }) => (
  <Box
    sx={{
      display:      "flex",
      alignItems:   "flex-start",
      gap:          1.5,
      py:           1.25,
      borderBottom: `1px solid ${C.g100}`,
      "&:last-child": { borderBottom: 0 },
    }}
  >
    {ok
      ? <CheckCircleIcon    sx={{ fontSize: 16, color: C.green, mt: 0.2, flexShrink: 0 }} />
      : <ErrorOutlineIcon   sx={{ fontSize: 16, color: C.red,   mt: 0.2, flexShrink: 0 }} />
    }
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: "0.6px" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 13, color: ok ? C.g700 : C.red, mt: 0.15 }}>
        {ok ? value : "Not set — add it in your profile"}
      </Typography>
    </Box>
  </Box>
);

/** Single document checklist row */
const DocRow: React.FC<{ term: string; uploaded: boolean; onUpload: () => void }> = ({ term, uploaded, onUpload }) => (
  <Box
    sx={{
      display:     "flex",
      alignItems:  "center",
      gap:         1.5,
      py:          1.2,
      px:          2,
      borderRadius:"12px",
      mb:          1,
      bgcolor:     uploaded ? C.greenLight : C.redLight,
      border:      `1px solid ${uploaded ? C.greenBorder : C.redBorder}`,
    }}
  >
    {uploaded
      ? <CheckCircleIcon  sx={{ fontSize: 18, color: C.green, flexShrink: 0 }} />
      : <ErrorOutlineIcon sx={{ fontSize: 18, color: C.red,   flexShrink: 0 }} />
    }
    <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.g900 }}>
      {term}
    </Typography>
    {uploaded
      ? (
        <Chip
          label="Uploaded"
          size="small"
          sx={{ bgcolor: "#fff", color: C.green, fontWeight: 700, fontSize: 11, border: `1px solid ${C.greenBorder}` }}
        />
      )
      : (
        <Button
          size="small"
          startIcon={<UploadFileOutlinedIcon sx={{ fontSize: "14px !important" }} />}
          onClick={onUpload}
          sx={{
            fontSize:        11,
            fontWeight:      700,
            bgcolor:         C.brand,
            color:           "#fff",
            borderRadius:    "8px",
            px:              1.5,
            textTransform:   "none",
            "&:hover":       { bgcolor: C.brandDark },
          }}
        >
          Upload
        </Button>
      )
    }
  </Box>
);

/* ─── Section wrapper ──────────────────────────────────────────────────── */
const Section: React.FC<{
  number: number;
  title:  string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}> = ({ number, title, badge, children }) => (
  <Paper
    variant="outlined"
    sx={{
      borderRadius: "18px",
      border:       `1px solid ${C.g200}`,
      overflow:     "hidden",
      mb:           2.5,
    }}
  >
    {/* Section header */}
    <Box
      sx={{
        display:    "flex",
        alignItems: "center",
        gap:        1.5,
        px:         3,
        py:         2,
        borderBottom: `1px solid ${C.g100}`,
        bgcolor:    C.g50,
      }}
    >
      <Avatar
        sx={{
          width:   30,
          height:  30,
          bgcolor: C.brand,
          fontSize: 13,
          fontWeight: 800,
        }}
      >
        {number}
      </Avatar>
      <Typography sx={{ fontWeight: 700, fontSize: 15, color: C.g900, flex: 1 }}>
        {title}
      </Typography>
      {badge}
    </Box>

    {/* Section body */}
    <Box sx={{ px: 3, py: 2.5 }}>{children}</Box>
  </Paper>
);

/* ─── Readiness badge ──────────────────────────────────────────────────── */
const ReadinessBadge: React.FC<{ ok: boolean; missing: number; label: string }> = ({ ok, missing, label }) => (
  <Chip
    icon={ok ? <CheckCircleIcon /> : <WarningAmberIcon />}
    label={ok ? label : `${missing} missing`}
    size="small"
    sx={{
      bgcolor:    ok ? C.greenLight  : C.amberLight,
      color:      ok ? C.green       : C.amber,
      border:     `1px solid ${ok ? C.greenBorder : C.amberBorder}`,
      fontWeight: 700,
      fontSize:   11,
      "& .MuiChip-icon": { fontSize: 14 },
    }}
  />
);

/* ─── Main Component ───────────────────────────────────────────────────── */
const GenericApplicationForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get("service") as ServiceKey | null;

  const [selectedKey, setSelectedKey] = useState<ServiceKey | null>(initialService);
  const [profile,     setProfile]     = useState<any>(null);
  const [clientDocs,  setClientDocs]  = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([authService.getProfile(), userServices.getAllClientsDocument()])
      .then(([p, docs]) => {
        setProfile(p);
        setClientDocs(Array.isArray(docs) ? docs : docs?.results ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const service = SERVICES.find(s => s.key === selectedKey) ?? null;

  /* helpers */
  const profileCheck = (field: string): boolean => {
    if (!profile) return false;
    const val = (profile as any)[field];
    return val !== null && val !== undefined && String(val).trim() !== "";
  };

  const docUploaded = (term: string): boolean => {
    const aliases = DOC_TYPE_MATCH[term] ?? [term];
    return clientDocs.some(d => {
      const t: string = d.type_term ?? d.type?.term ?? "";
      return aliases.some(a => t.toLowerCase().includes(a.toLowerCase()));
    });
  };

  const missingProfile = service?.requiredProfile.filter(f => !profileCheck(f)) ?? [];
  const missingDocs    = service?.requiredDocs.filter(d => !docUploaded(d)) ?? [];
  const profileOk      = missingProfile.length === 0;
  const docsOk         = missingDocs.length === 0;
  const allReady       = profileOk && docsOk;

  const readiness = service
    ? Math.round(
        ((service.requiredProfile.length - missingProfile.length +
          service.requiredDocs.length    - missingDocs.length) /
          (service.requiredProfile.length + service.requiredDocs.length)) * 100
      )
    : 0;

  /* ─── Loading ─────────────────────────────────────────────────── */
  if (loading) return (
    <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <CircularProgress sx={{ color: C.brand }} />
    </Box>
  );

  /* ─── Render ──────────────────────────────────────────────────── */
  return (
    <Box sx={{ py: 3 }}>

      {/* ── Page header ── */}
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize:   { xs: 22, sm: 26 },
            color:      C.g900,
            lineHeight: 1.2,
          }}
        >
          New Application
        </Typography>
        <Typography sx={{ fontSize: 14, color: C.g400, mt: 0.5 }}>
          Select a service, review your profile, and check your documents — then start your application.
        </Typography>
      </Box>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — Service Selection                             */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Section number={1} title="Choose a Service">
        <Grid container spacing={1.5}>
          {SERVICES.map(svc => (
            <Grid item xs={12} sm={6} key={svc.key}>
              <ServiceCard
                svc={svc}
                selected={selectedKey === svc.key}
                onSelect={() => setSelectedKey(svc.key)}
              />
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — Profile Summary (conditional on service)      */}
      {/* ══════════════════════════════════════════════════════════ */}
      {service && (
        <Section
          number={2}
          title="Profile Information"
          badge={<ReadinessBadge ok={profileOk} missing={missingProfile.length} label="Profile complete" />}
        >
          {/* Progress bar */}
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
              <Typography sx={{ fontSize: 12, color: C.g500, fontWeight: 600 }}>
                Application readiness
              </Typography>
              <Typography
                sx={{
                  fontSize:   12,
                  fontWeight: 700,
                  color:      readiness >= 80 ? C.green : C.amber,
                }}
              >
                {readiness}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={readiness}
              sx={{
                height:       8,
                borderRadius: 6,
                bgcolor:      C.g100,
                "& .MuiLinearProgress-bar": {
                  bgcolor:      readiness >= 80 ? C.green : C.brand,
                  borderRadius: 6,
                  transition:   "transform .5s ease",
                },
              }}
            />
          </Box>

          {!profileOk && (
            <Alert
              severity="warning"
              icon={<LockPersonOutlinedIcon />}
              sx={{ mb: 2.5, borderRadius: "12px", fontSize: 13 }}
            >
              <strong>{missingProfile.length} required field(s) missing.</strong> Update your profile and they'll be auto-filled on every future application.
              <Box component="span" sx={{ display: "inline-block", ml: 1 }}>
                <Button
                  size="small"
                  onClick={() => navigate("/settings/profile/edit")}
                  sx={{ fontSize: 12, fontWeight: 700, color: C.brandDark, p: 0, textTransform: "none", minWidth: 0 }}
                >
                  Update profile →
                </Button>
              </Box>
            </Alert>
          )}

          <Grid container spacing={0}>
            {service.requiredProfile.map(field => (
              <Grid item xs={12} sm={6} key={field}>
                <ProfileRow
                  label={FIELD_LABELS[field] ?? field}
                  value={profileCheck(field) ? String((profile as any)[field]) : null}
                  ok={profileCheck(field)}
                />
              </Grid>
            ))}
          </Grid>

          {/* Edit profile link */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              size="small"
              startIcon={<EditOutlinedIcon sx={{ fontSize: "14px !important" }} />}
              onClick={() => navigate("/settings/profile/edit")}
              sx={{
                fontSize:      12,
                fontWeight:    700,
                color:         C.brand,
                textTransform: "none",
                border:        `1px solid ${C.accentLight}`,
                borderRadius:  "8px",
                px:            1.5,
                "&:hover":     { bgcolor: C.accentXL },
              }}
            >
              Edit profile
            </Button>
          </Box>
        </Section>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* SECTION 3 — Document Checklist                            */}
      {/* ══════════════════════════════════════════════════════════ */}
      {service && (
        <Section
          number={3}
          title="Required Documents"
          badge={<ReadinessBadge ok={docsOk} missing={missingDocs.length} label="All uploaded" />}
        >
          {!docsOk && (
            <Alert
              severity="info"
              sx={{ mb: 2, borderRadius: "12px", fontSize: 13 }}
            >
              Documents already in your vault are reused automatically. You can also upload missing ones now or during the application.
            </Alert>
          )}

          {service.requiredDocs.map(term => (
            <DocRow
              key={term}
              term={term}
              uploaded={docUploaded(term)}
              onUpload={() => navigate("/settings/profile/edit?tab=documents")}
            />
          ))}

          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontSize: 12, color: C.g400 }}>
              {clientDocs.length} document{clientDocs.length !== 1 ? "s" : ""} in your profile vault
            </Typography>
            <Button
              size="small"
              onClick={() => navigate("/settings/profile?tab=documents")}
              sx={{ fontSize: 12, color: C.brand, fontWeight: 700, textTransform: "none" }}
            >
              Manage documents →
            </Button>
          </Box>
        </Section>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* SECTION 4 — Launch CTA                                    */}
      {/* ══════════════════════════════════════════════════════════ */}
      {service && (
        <Paper
          variant="outlined"
          sx={{
            borderRadius: "18px",
            overflow:     "hidden",
            border:       `1px solid ${C.g200}`,
            mb: 4,
          }}
        >
          {/* Gradient banner */}
          <Box
            sx={{
              background: service.gradient,
              px:         3,
              py:         2.5,
              color:      "#fff",
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: 18, mb: 0.5 }}>
              {allReady ? "🎉 You're ready to apply!" : "⚡ Start your application"}
            </Typography>
            <Typography sx={{ fontSize: 13, opacity: 0.9 }}>
              {allReady
                ? "Your profile and documents are all set. Browse offers to proceed."
                : "You can still apply — missing items can be added during the process."}
            </Typography>
          </Box>

          <Box sx={{ px: 3, py: 2.5 }}>
            {/* Status chips */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2.5 }}>
              <Chip
                icon={profileOk ? <CheckCircleIcon /> : <WarningAmberIcon />}
                label={profileOk ? "Profile complete" : `${missingProfile.length} field(s) missing`}
                size="small"
                sx={{
                  bgcolor:    profileOk ? C.greenLight  : C.amberLight,
                  color:      profileOk ? C.green       : C.amber,
                  fontWeight: 700,
                  fontSize:   11,
                  "& .MuiChip-icon": { fontSize: 14 },
                }}
              />
              <Chip
                icon={docsOk ? <CheckCircleIcon /> : <WarningAmberIcon />}
                label={docsOk ? "All documents uploaded" : `${missingDocs.length} document(s) missing`}
                size="small"
                sx={{
                  bgcolor:    docsOk ? C.greenLight  : C.amberLight,
                  color:      docsOk ? C.green       : C.amber,
                  fontWeight: 700,
                  fontSize:   11,
                  "& .MuiChip-icon": { fontSize: 14 },
                }}
              />
            </Box>

            {/* Primary CTA */}
            <Tooltip
              title={!selectedKey ? "Please select a service above first" : ""}
              arrow
              placement="top"
            >
              <span style={{ display: "block" }}>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={!selectedKey}
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => service && navigate(service.browseRoute)}
                  sx={{
                    bgcolor:       C.brand,
                    fontWeight:    700,
                    fontSize:      15,
                    borderRadius:  "12px",
                    py:            1.6,
                    textTransform: "none",
                    boxShadow:     "0 4px 14px rgba(182,106,237,.35)",
                    "&:hover":     { bgcolor: C.brandDark, boxShadow: "0 6px 20px rgba(139,63,199,.4)" },
                    "&.Mui-disabled": { bgcolor: C.g200, boxShadow: "none", color: C.g400 },
                  }}
                >
                  Browse {service?.label ?? "Service"} Offers
                </Button>
              </span>
            </Tooltip>

            <Typography sx={{ fontSize: 11.5, color: C.g400, textAlign: "center", mt: 1.5, lineHeight: 1.5 }}>
              You'll choose a specific offer on the next page — your profile details will be pre-filled.
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Empty state when no service selected and no ?service= param */}
      {!service && !loading && (
        <Box
          sx={{
            textAlign:  "center",
            py:          6,
            color:      C.g400,
          }}
        >
          <Box sx={{ fontSize: 48, mb: 1.5 }}>✈️</Box>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: C.g500 }}>
            Select a service above to see your readiness details
          </Typography>
          <Typography sx={{ fontSize: 13, mt: 0.5 }}>
            Your profile info and documents will be checked automatically.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default GenericApplicationForm;
