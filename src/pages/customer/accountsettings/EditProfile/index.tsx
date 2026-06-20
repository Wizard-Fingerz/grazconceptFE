import React, { useEffect, useState, useRef } from "react";
import {
  Box, Typography, Avatar, Button, TextField, MenuItem,
  Paper, Grid, CircularProgress, Alert, IconButton, Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { useNavigate } from "react-router-dom";
import authService from "../../../../services/authService";
import userServices from "../../../../services/user";
import { useAuth } from "../../../../context/AuthContext";

/* ─── Brand tokens ─────────────────────────────────────────────── */
const C = {
  brand: "#8b2b8c",
  accentLight: "#f0d9fb",
  accentXL: "#f9f0fe",
  brandDark: "#8b3fc7",
  g50: "#FAFAFA",
  g100: "#F4F4F5",
  g200: "#E4E4E7",
  g300: "#D4D4D8",
  g400: "#A1A1AA",
  g500: "#71717A",
  g700: "#3F3F46",
  g900: "#18181B",
  green: "#16A34A",
  greenLight: "#DCFCE7",
  greenBorder: "#86EFAC",
  red: "#DC2626",
  redLight: "#FEE2E2",
} as const;

/* ─── Shared input style ────────────────────────────────────────── */
const SX_INPUT = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontSize: 13,
    bgcolor: "#fff",
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: C.brand },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: C.brand },
};

/* ─── Section card ──────────────────────────────────────────────── */
const SectionCard: React.FC<{
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, subtitle, icon, children }) => (
  <Paper
    variant="outlined"
    sx={{
      borderRadius: "18px",
      mb: 2.5,
      overflow: "hidden",
      borderColor: C.g200,
    }}
  >
    {/* Header */}
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 3,
        py: 2,
        borderBottom: `1px solid ${C.g100}`,
        bgcolor: C.g50,
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: "12px",
          bgcolor: C.accentXL,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          flexShrink: 0,
          border: `1px solid ${C.accentLight}`,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: 15, color: C.g900, lineHeight: 1.3 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: 12, color: C.g400, mt: 0.15 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
    {/* Body */}
    <Box sx={{ px: 3, py: 3 }}>{children}</Box>
  </Paper>
);

/* ─── Doc upload slot ───────────────────────────────────────────── */
const DocSlot: React.FC<{
  term: string;
  accept: string;
  hint: string;
  services: string[];
  uploading: boolean;
  done: boolean;
  onFile: (f: File) => void;
}> = ({ term, accept, hint, services, uploading, done, onFile }) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: "14px",
        p: 2,
        borderColor: done ? C.greenBorder : C.g200,
        bgcolor: done ? C.greenLight : "#fff",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
      }}
    >
      {/* Title row */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: C.g900 }}>
          {term}
        </Typography>
        {done && <CheckCircleIcon sx={{ fontSize: 16, color: C.green }} />}
      </Box>

      {/* Service tags */}
      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
        {services.map(s => (
          <Chip
            key={s}
            label={s}
            size="small"
            sx={{
              height: 18,
              fontSize: 10,
              fontWeight: 700,
              bgcolor: done ? "#fff" : C.accentXL,
              color: done ? C.green : C.brandDark,
              border: `1px solid ${done ? C.greenBorder : C.accentLight}`,
            }}
          />
        ))}
      </Box>

      <Typography sx={{ fontSize: 11, color: C.g400, lineHeight: 1.4 }}>{hint}</Typography>

      {/* Upload control */}
      <Box sx={{ mt: "auto", pt: 1 }}>
        {uploading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={14} sx={{ color: C.brand }} />
            <Typography sx={{ fontSize: 11, color: C.g500 }}>Uploading…</Typography>
          </Box>
        ) : done ? (
          <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: C.green }}>
            ✓ Uploaded successfully
          </Typography>
        ) : (
          <>
            <input
              ref={ref}
              type="file"
              accept={accept}
              style={{ display: "none" }}
              onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }}
            />
            <Button
              size="small"
              startIcon={<UploadFileOutlinedIcon sx={{ fontSize: "14px !important" }} />}
              onClick={() => ref.current?.click()}
              sx={{
                fontSize: 11.5,
                fontWeight: 700,
                color: C.brand,
                border: `1px solid ${C.accentLight}`,
                borderRadius: "8px",
                textTransform: "none",
                px: 1.5,
                bgcolor: C.accentXL,
                "&:hover": { bgcolor: C.accentLight },
              }}
            >
              Choose file
            </Button>
          </>
        )}
      </Box>
    </Paper>
  );
};

/* ─── Constants ─────────────────────────────────────────────────── */
const DOC_UPLOAD_SLOTS = [
  { term: "Passport Photo", accept: "image/*", hint: "JPG/PNG, white background, max 2MB", services: ["Study", "Work", "Pilgrimage"] },
  { term: "Passport", accept: ".pdf,image/*", hint: "All data pages scanned — PDF or JPG", services: ["Study", "Work", "Vacation"] },
  { term: "Transcript", accept: ".pdf,image/*", hint: "Official academic transcript", services: ["Study"] },
  { term: "Bank Statement", accept: ".pdf", hint: "Last 3–6 months, PDF", services: ["Study", "Work"] },
  { term: "CV / Resume", accept: ".pdf,.doc,.docx", hint: "Updated CV — PDF preferred", services: ["Work"] },
  { term: "English Test", accept: ".pdf,image/*", hint: "IELTS / TOEFL / PTE certificate", services: ["Study", "Work"] },
  { term: "Medical Certificate", accept: ".pdf,image/*", hint: "Issued by a licensed physician", services: ["Pilgrimage"] },
  { term: "Offer Letter", accept: ".pdf,image/*", hint: "Employment or admission offer letter", services: ["Work", "Study"] },
];

const QUALIFICATION_OPTIONS = ["Secondary School", "OND", "HND", "Bachelor's Degree", "Master's Degree", "MBA", "PhD", "Professional Certificate", "Other"];
const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"];
const RELATIONSHIP_OPTIONS = ["Parent", "Spouse", "Sibling", "Child", "Friend", "Colleague", "Other"];

/* ─── Main component ────────────────────────────────────────────── */
const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docTypes, setDocTypes] = useState<any[]>([]);
  const [docUploading, setDocUploading] = useState<Record<string, boolean>>({});
  const [docSuccess, setDocSuccess] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<number | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    first_name: "", middle_name: "", last_name: "",
    phone_number: "", date_of_birth: "", gender: "",
    nationality: "", country_of_residence: "", current_address: "",
    passport_number: "", passport_expiry_date: "", nin: "", bvn: "",
    highest_qualification: "", graduation_year: "",
    previous_university: "", previous_course_of_study: "", cgpa: "",
    previous_job_title: "", previous_employer: "",
    years_of_experience: "", year_left_previous_job: "",
    emergency_contact_name: "", emergency_contact_relationship: "", emergency_contact_phone: "",
    travel_history: "", previous_visa_applications: "false", previous_visa_details: "",
  });

  useEffect(() => {
    let alive = true;
    Promise.all([authService.getProfile(), userServices.getAllDocumentType()])
      .then(([profile, types]) => {
        if (!alive) return;
        setUserId(profile.id);
        const p = profile as any;
        setForm(prev => ({
          ...prev,
          first_name: p.first_name ?? "",
          middle_name: p.middle_name ?? "",
          last_name: p.last_name ?? "",
          phone_number: p.phone_number ?? "",
          date_of_birth: p.date_of_birth ?? "",
          gender: p.gender_name ?? "",
          nationality: (typeof p.nationality === 'object' && p.nationality !== null)
            ? ((p.nationality as any)?.code ?? "")
            : (p.nationality ?? ""),
          country_of_residence: (typeof p.country_of_residence === 'object' && p.country_of_residence !== null)
            ? ((p.country_of_residence as any)?.code ?? "")
            : (p.country_of_residence ?? ""),
          current_address: p.current_address ?? "",
          passport_number: p.passport_number ?? "",
          passport_expiry_date: p.passport_expiry_date ?? "",
          nin: p.nin ?? "",
          bvn: p.bvn ?? "",
          highest_qualification: p.highest_qualification ?? "",
          graduation_year: p.graduation_year ?? "",
          previous_university: p.previous_university ?? "",
          previous_course_of_study: p.previous_course_of_study ?? "",
          cgpa: p.cgpa ?? "",
          previous_job_title: p.previous_job_title ?? "",
          previous_employer: p.previous_employer ?? "",
          years_of_experience: p.years_of_experience != null ? String(p.years_of_experience) : "",
          year_left_previous_job: p.year_left_previous_job ?? "",
          emergency_contact_name: p.emergency_contact_name ?? "",
          emergency_contact_relationship: p.emergency_contact_relationship ?? "",
          emergency_contact_phone: p.emergency_contact_phone ?? "",
          travel_history: p.travel_history ?? "",
          previous_visa_applications: p.previous_visa_applications ? "true" : "false",
          previous_visa_details: p.previous_visa_details ?? "",
        }));
        setDocTypes(Array.isArray(types) ? types : types?.results ?? []);
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const set = (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await authService.updateProfile({
        first_name: form.first_name,
        middle_name: form.middle_name as any,
        last_name: form.last_name,
        phone_number: form.phone_number as any,
        date_of_birth: form.date_of_birth as any,
        gender: form.gender as any,
        nationality: form.nationality as any,
        country_of_residence: form.country_of_residence as any,
        current_address: form.current_address as any,
        ...(form.passport_number && { passport_number: form.passport_number }),
        ...(form.passport_expiry_date && { passport_expiry_date: form.passport_expiry_date }),
        ...(form.nin && { nin: form.nin }),
        ...(form.bvn && { bvn: form.bvn }),
        ...(form.highest_qualification && { highest_qualification: form.highest_qualification }),
        ...(form.graduation_year && { graduation_year: form.graduation_year }),
        ...(form.previous_university && { previous_university: form.previous_university }),
        ...(form.previous_course_of_study && { previous_course_of_study: form.previous_course_of_study }),
        ...(form.cgpa && { cgpa: form.cgpa }),
        ...(form.previous_job_title && { previous_job_title: form.previous_job_title }),
        ...(form.previous_employer && { previous_employer: form.previous_employer }),
        ...(form.years_of_experience && { years_of_experience: Number(form.years_of_experience) }),
        ...(form.year_left_previous_job && { year_left_previous_job: form.year_left_previous_job as string }),
        ...(form.emergency_contact_name && { emergency_contact_name: form.emergency_contact_name }),
        ...(form.emergency_contact_relationship && { emergency_contact_relationship: form.emergency_contact_relationship }),
        ...(form.emergency_contact_phone && { emergency_contact_phone: form.emergency_contact_phone }),
        ...(form.travel_history && { travel_history: form.travel_history }),
        previous_visa_applications: form.previous_visa_applications === "true",
        ...(form.previous_visa_details && { previous_visa_details: form.previous_visa_details }),
      });
      await updateUser();
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDocUpload = async (typeTerm: string, file: File) => {
    if (!userId) return;
    // Split on "/" to get all sub-terms (e.g. "CV / Resume" → ["cv", "resume"])
    const subTerms = typeTerm.toLowerCase().split("/").map(t => t.trim());
    const match = docTypes.find(dt => {
      const dbTerm = dt.term.toLowerCase();
      return (
        subTerms.some(s => dbTerm.includes(s) || s.includes(dbTerm)) ||
        subTerms.some(s => dbTerm === s)
      );
    });
    if (!match?.id) {
      setError(`Document type "${typeTerm}" is not yet configured in the system. Please contact your administrator.`);
      return;
    }
    setDocUploading(prev => ({ ...prev, [typeTerm]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("client", String(userId));
      fd.append("type", String(match.id));
      await userServices.uploadClientDocument(fd);
      setDocSuccess(prev => ({ ...prev, [typeTerm]: true }));
    } catch {
      setError(`Failed to upload ${typeTerm}. Please try again.`);
    } finally {
      setDocUploading(prev => ({ ...prev, [typeTerm]: false }));
    }
  };

  /* ── Loading ─────────────────────────────────────────────────── */
  if (loading) return (
    <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <CircularProgress sx={{ color: C.brand }} />
    </Box>
  );

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <Box sx={{ py: 3, pb: 10 }}>

      {/* Page header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <IconButton
          onClick={() => navigate("/settings/profile")}
          sx={{ color: C.g500, border: `1px solid ${C.g200}`, borderRadius: "10px", p: 0.75 }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 22, color: C.g900, lineHeight: 1.2 }}>
            Edit Profile
          </Typography>
          <Typography sx={{ fontSize: 13, color: C.g400, mt: 0.25 }}>
            Saved details are pre-filled automatically across all applications.
          </Typography>
        </Box>
      </Box>

      {success && (
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2.5, borderRadius: "12px" }}>
          Profile updated successfully!
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: "12px" }}>{error}</Alert>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Personal Information                                       */}
      {/* ══════════════════════════════════════════════════════════ */}
      <SectionCard title="Personal Information" subtitle="Your basic identity — used everywhere." icon="👤">
        {/* Avatar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
            p: 2,
            borderRadius: "12px",
            border: `1px dashed ${C.g200}`,
            bgcolor: C.g50,
          }}
        >
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: C.brand,
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            {form.first_name?.[0]?.toUpperCase() || "U"}
          </Avatar>
          <Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PhotoCameraIcon sx={{ fontSize: "14px !important" }} />}
              onClick={() => photoRef.current?.click()}
              sx={{
                color: C.brand,
                borderColor: C.accentLight,
                fontWeight: 700,
                fontSize: 12,
                borderRadius: "8px",
                textTransform: "none",
                bgcolor: C.accentXL,
                "&:hover": { bgcolor: C.accentLight },
              }}
            >
              Change photo
            </Button>
            <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} />
            <Typography sx={{ fontSize: 11, color: C.g400, mt: 0.5 }}>
              JPG or PNG · Square image recommended
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}><TextField label="First Name" required fullWidth value={form.first_name} onChange={set("first_name")} size="small" sx={SX_INPUT} /></Grid>
          <Grid size={{ xs: 12, sm: 4 }}><TextField label="Middle Name" fullWidth value={form.middle_name} onChange={set("middle_name")} size="small" sx={SX_INPUT} /></Grid>
          <Grid size={{ xs: 12, sm: 4 }}><TextField label="Last Name" required fullWidth value={form.last_name} onChange={set("last_name")} size="small" sx={SX_INPUT} /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Email Address"
              fullWidth value="" disabled size="small" sx={SX_INPUT}
              helperText="Email cannot be changed — contact support."
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Phone Number" fullWidth value={form.phone_number} onChange={set("phone_number")} size="small" sx={SX_INPUT} placeholder="+234 800 000 0000" />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Date of Birth" type="date" fullWidth value={form.date_of_birth} onChange={set("date_of_birth")} size="small" InputLabelProps={{ shrink: true }} sx={SX_INPUT} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Gender" select fullWidth value={form.gender} onChange={set("gender")} size="small" sx={SX_INPUT}>
              {GENDER_OPTIONS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Nationality" fullWidth value={form.nationality} onChange={set("nationality")} size="small" sx={SX_INPUT} placeholder="e.g. Nigerian" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Country of Residence" fullWidth value={form.country_of_residence} onChange={set("country_of_residence")} size="small" sx={SX_INPUT} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Current Address" fullWidth value={form.current_address} onChange={set("current_address")} size="small" sx={SX_INPUT} />
          </Grid>
        </Grid>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Passport & ID                                              */}
      {/* ══════════════════════════════════════════════════════════ */}
      <SectionCard title="Passport & Identity" subtitle="Stored securely — pre-fills all visa applications." icon="🛂">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Passport Number" fullWidth value={form.passport_number} onChange={set("passport_number")} size="small" sx={SX_INPUT} placeholder="e.g. A12345678" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Passport Expiry Date" type="date" fullWidth value={form.passport_expiry_date} onChange={set("passport_expiry_date")} size="small" InputLabelProps={{ shrink: true }} sx={SX_INPUT} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="NIN (National ID Number)" fullWidth value={form.nin} onChange={set("nin")} size="small" sx={SX_INPUT} placeholder="11-digit NIN" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="BVN (Bank Verification Number)" fullWidth value={form.bvn} onChange={set("bvn")} size="small" sx={SX_INPUT} placeholder="11-digit BVN"
              helperText="Optional — used for financial services only." />
          </Grid>
        </Grid>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Education                                                  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <SectionCard title="Educational Background" subtitle="Used for Study Abroad and Work Abroad applications." icon="🎓">
        <Grid container spacing={2}>
          <Grid size={6} key={"highest_qualification"}>
            <TextField label="Highest Qualification" select fullWidth value={form.highest_qualification} onChange={set("highest_qualification")} size="small" sx={SX_INPUT}>
              {QUALIFICATION_OPTIONS.map(q => <MenuItem key={q} value={q}>{q}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={6} key={"graduation_year"}>
            <TextField label="Graduation Year" type="number" fullWidth value={form.graduation_year} onChange={set("graduation_year")} size="small" sx={SX_INPUT} inputProps={{ min: 1980, max: 2030 }} />
          </Grid>
          <Grid size={6} key={"previous_university"}>
            <TextField label="Previous University / Institution" fullWidth value={form.previous_university} onChange={set("previous_university")} size="small" sx={SX_INPUT} />
          </Grid>
          <Grid size={6} key={"previous_course_of_study"}>
            <TextField label="Course / Field of Study" fullWidth value={form.previous_course_of_study} onChange={set("previous_course_of_study")} size="small" sx={SX_INPUT} />
          </Grid>
          <Grid size={4} key={"cpag"}>
            <TextField label="CGPA / Final Grade" fullWidth value={form.cgpa} onChange={set("cgpa")} size="small" sx={SX_INPUT} placeholder="e.g. 4.5/5.0 or First Class" />
          </Grid>
        </Grid>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Employment                                                 */}
      {/* ══════════════════════════════════════════════════════════ */}
      <SectionCard title="Employment History" subtitle="Used for Work Abroad applications." icon="💼">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Current / Most Recent Job Title" fullWidth value={form.previous_job_title} onChange={set("previous_job_title")} size="small" sx={SX_INPUT} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Most Recent Employer" fullWidth value={form.previous_employer} onChange={set("previous_employer")} size="small" sx={SX_INPUT} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Total Years of Experience" type="number" fullWidth value={form.years_of_experience} onChange={set("years_of_experience")} size="small" sx={SX_INPUT} inputProps={{ min: 0, max: 60 }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Year Left Previous Job" type="number" fullWidth value={form.year_left_previous_job} onChange={set("year_left_previous_job")} size="small" sx={SX_INPUT} inputProps={{ min: 1990, max: 2030 }} />
          </Grid>
        </Grid>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Emergency Contact                                          */}
      {/* ══════════════════════════════════════════════════════════ */}
      <SectionCard title="Emergency Contact" subtitle="Required for all visa and travel applications." icon="🆘">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Full Name" required fullWidth value={form.emergency_contact_name} onChange={set("emergency_contact_name")} size="small" sx={SX_INPUT} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Relationship" select fullWidth value={form.emergency_contact_relationship} onChange={set("emergency_contact_relationship")} size="small" sx={SX_INPUT}>
              {RELATIONSHIP_OPTIONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Phone Number" required fullWidth value={form.emergency_contact_phone} onChange={set("emergency_contact_phone")} size="small" sx={SX_INPUT} placeholder="+234..." />
          </Grid>
        </Grid>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Travel History                                             */}
      {/* ══════════════════════════════════════════════════════════ */}
      <SectionCard title="Travel History" subtitle="Optional — strengthens your visa applications." icon="🌍">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Countries visited (with dates and purpose)"
              multiline rows={3} fullWidth
              value={form.travel_history}
              onChange={set("travel_history")}
              size="small" sx={SX_INPUT}
              placeholder="e.g. UAE (Nov 2023 – Tourism), Ghana (Mar 2022 – Business)"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Previous visa denials?" select fullWidth value={form.previous_visa_applications} onChange={set("previous_visa_applications")} size="small" sx={SX_INPUT}>
              <MenuItem value="false">No</MenuItem>
              <MenuItem value="true">Yes — provide details below</MenuItem>
            </TextField>
          </Grid>
          {form.previous_visa_applications === "true" && (
            <Grid size={{ xs: 12 }}>
              <TextField label="Details of visa denial(s)" multiline rows={2} fullWidth value={form.previous_visa_details} onChange={set("previous_visa_details")} size="small" sx={SX_INPUT} />
            </Grid>
          )}
        </Grid>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Documents                                                  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <SectionCard title="Upload Documents" subtitle="Upload once — automatically reused in all future applications." icon="📎">
        <Alert severity="info" sx={{ mb: 2.5, borderRadius: "10px", fontSize: 12.5 }}>
          Service tags show which applications each document is used for. Documents already uploaded on your profile page are not shown here.
        </Alert>
        <Grid container spacing={2}>
          {DOC_UPLOAD_SLOTS.map(slot => (
            <Grid size={{ xs: 12, sm: 6 }} key={slot.term}>
              <DocSlot
                term={slot.term}
                accept={slot.accept}
                hint={slot.hint}
                services={slot.services}
                uploading={!!docUploading[slot.term]}
                done={!!docSuccess[slot.term]}
                onFile={f => handleDocUpload(slot.term, f)}
              />
            </Grid>
          ))}
        </Grid>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Sticky save bar                                            */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          bgcolor: "#fff",
          borderTop: `1px solid ${C.g200}`,
          boxShadow: "0 -4px 24px rgba(0,0,0,.06)",
          px: { xs: 1, sm: 2, md: 4 },
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 1.5,
        }}
      >
        <Button
          variant="outlined"
          onClick={() => navigate("/settings/profile")}
          sx={{
            color: C.g500,
            borderColor: C.g200,
            fontWeight: 600,
            borderRadius: "10px",
            textTransform: "none",
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={saving}
          onClick={handleSave}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          sx={{
            bgcolor: C.brand,
            fontWeight: 700,
            borderRadius: "10px",
            textTransform: "none",
            px: 3,
            boxShadow: "0 2px 10px rgba(182,106,237,.35)",
            "&:hover": { bgcolor: C.brandDark },
            "&.Mui-disabled": { bgcolor: C.g200 },
          }}
        >
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </Box>
    </Box>
  );
};

export default EditProfilePage;
