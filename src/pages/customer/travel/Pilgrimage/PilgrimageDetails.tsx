import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, CardMedia, CircularProgress,
  Paper, Divider, Button, TextField, Chip, Link, Breadcrumbs,
  Alert, LinearProgress, Collapse, Avatar, FormControlLabel, Checkbox,
  Select, MenuItem, FormControl, InputLabel,
} from "@mui/material";
import CheckCircleIcon      from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon     from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon     from "@mui/icons-material/WarningAmber";
import EditOutlinedIcon     from "@mui/icons-material/EditOutlined";
import RocketLaunchIcon     from "@mui/icons-material/RocketLaunch";
import TaskAltIcon          from "@mui/icons-material/TaskAlt";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon  from "@mui/icons-material/KeyboardArrowUp";

import { useAuth }       from "../../../../context/AuthContext";
import authService       from "../../../../services/authService";
import userServices      from "../../../../services/user";
import api               from "../../../../services/api";
import { capitalizeWords } from "../../../../utils";

/* ─── Brand tokens ─────────────────────────────────────────────────── */
const C = {
  brand:"#8b2b8c", brandDark:"#8b3fc7", accentLight:"#f0d9fb", accentXL:"#f9f0fe",
  g50:"#FAFAFA", g100:"#F4F4F5", g200:"#E4E4E7", g400:"#A1A1AA", g500:"#71717A",
  g700:"#3F3F46", g900:"#18181B",
  green:"#16A34A", greenLight:"#DCFCE7", greenBorder:"#86EFAC",
  amber:"#D97706", amberLight:"#FEF3C7", amberBorder:"#FCD34D",
  red:"#DC2626",  redLight:"#FEE2E2",  redBorder:"#FCA5A5",
} as const;

const SX_INPUT = {
  "& .MuiOutlinedInput-root":{ borderRadius:"10px", fontSize:13,
    "&.Mui-focused .MuiOutlinedInput-notchedOutline":{ borderColor:C.brand } },
  "& .MuiInputLabel-root.Mui-focused":{ color:C.brand },
};

/* ─── Readiness config ─────────────────────────────────────────────── */
const REQUIRED_CHECKS = [
  { label:"Full Name",       field:"full_name",           category:"personal"  },
  { label:"Passport Number", field:"passport_number",      category:"personal"  },
  { label:"Date of Birth",   field:"date_of_birth",        category:"personal"  },
  { label:"Nationality",     field:"nationality",          category:"personal"  },
  { label:"Emergency Name",  field:"emergency_contact_name",  category:"emergency" },
  { label:"Emergency Phone", field:"emergency_contact_phone", category:"emergency" },
];
const DOC_CHECKS = ["Passport", "Passport Photo", "Medical Certificate"];
const DOC_ALIAS: Record<string,string[]> = {
  "Passport":             ["passport"],
  "Passport Photo":       ["passport photo","photo"],
  "Medical Certificate":  ["medical"],
};
const CATEGORY_LABELS: Record<string,string> = {
  personal:"Personal & Passport", emergency:"Emergency Contact",
};

/* ─── Helpers ──────────────────────────────────────────────────────── */
function renderDesc(text: string) {
  return text.split(/\r?\n\r?\n/).map((p,i) => (
    <Typography key={i} variant="body1" sx={{ whiteSpace:"pre-line", mb:1 }}>{p}</Typography>
  ));
}
function prettyStatus(s: any) {
  if (!s) return "Submitted";
  if (typeof s === "string") return s.charAt(0).toUpperCase()+s.slice(1);
  if (s?.term) return s.term.charAt(0).toUpperCase()+s.term.slice(1);
  return String(s);
}

/* ─── AppliedPanel ─────────────────────────────────────────────────── */
const AppliedPanel: React.FC<{app:any; onViewAll:()=>void}> = ({app,onViewAll}) => (
  <Box>
    <Box sx={{ display:"flex", alignItems:"center", gap:1.5, mb:2.5 }}>
      <Avatar sx={{ bgcolor:C.green, width:40, height:40 }}><TaskAltIcon/></Avatar>
      <Box>
        <Typography sx={{ fontWeight:800, fontSize:15, color:C.g900 }}>Already Applied</Typography>
        <Typography sx={{ fontSize:12, color:C.g400 }}>You've submitted an application for this offer.</Typography>
      </Box>
    </Box>
    <Chip label={prettyStatus(app.status)}
      sx={{ mb:2.5, bgcolor:C.accentXL, color:C.brand, fontWeight:700, border:`1px solid ${C.accentLight}` }} />
    {app.submitted_at && (
      <Typography sx={{ fontSize:12, color:C.g400, mb:2 }}>
        Submitted {new Date(app.submitted_at).toLocaleDateString(undefined,{year:"numeric",month:"long",day:"numeric"})}
      </Typography>
    )}
    <Button variant="outlined" fullWidth onClick={onViewAll}
      sx={{ borderColor:C.accentLight, color:C.brand, fontWeight:700, borderRadius:"10px", textTransform:"none",
        "&:hover":{ bgcolor:C.accentXL } }}>
      View all Applications
    </Button>
  </Box>
);

/* ─── SmartApplyPanel ──────────────────────────────────────────────── */
interface PanelProps {
  offer:any; profile:any; clientDocs:any[]; offerId:string; onSuccess:()=>void;
}
const SmartApplyPanel: React.FC<PanelProps> = ({profile,clientDocs,offerId,onSuccess}) => {
  const navigate = useNavigate();
  const ACCOMMODATION_OPTIONS = ["Standard","Deluxe","Shared","Private","Budget","Premium"];
  const PILGRIMAGE_OPTIONS    = ["Hajj","Umrah","Other"];

  const [form,setForm] = useState({
    pilgrimage_type:"", accommodation_type:"", preferred_travel_date:"", group_travel:false,
  });
  const [submitting,setSubmitting]   = useState(false);
  const [submitError,setSubmitError] = useState<string|null>(null);
  const [expandedCat,setExpandedCat] = useState<string|null>(null);

  const isFieldOk = (f:string) => {
    if (!profile) return false;
    const v = profile[f];
    if (typeof v === "object" && v !== null) return !!(v as any).code || !!(v as any).name;
    return v !== null && v !== undefined && String(v).trim() !== "";
  };
  const isDocOk = (term:string) => {
    const aliases = DOC_ALIAS[term] ?? [term.toLowerCase()];
    return clientDocs.some(d => {
      const t:string = d.type_term ?? d.type?.term ?? "";
      return aliases.some(a => t.toLowerCase().includes(a));
    });
  };

  const missingFields = REQUIRED_CHECKS.filter(c => !isFieldOk(c.field));
  const missingDocs   = DOC_CHECKS.filter(d => !isDocOk(d));
  const totalItems    = REQUIRED_CHECKS.length + DOC_CHECKS.length;
  const okItems       = (REQUIRED_CHECKS.length - missingFields.length) + (DOC_CHECKS.length - missingDocs.length);
  const readiness     = Math.round((okItems/totalItems)*100);
  const allReady      = missingFields.length === 0 && missingDocs.length === 0;
  const categories    = ["personal","emergency"];

  const handleSubmit = async () => {
    setSubmitting(true); setSubmitError(null);
    try {
      const fd = new FormData();
      fd.append("pilgrimage_offer",           offerId);
      fd.append("applicant",                  profile?.full_name ?? "");
      fd.append("passport_number",            profile?.passport_number ?? "");
      fd.append("date_of_birth",              profile?.date_of_birth ?? "");
      fd.append("pilgrimage_type",            form.pilgrimage_type);
      fd.append("accommodation_type",         form.accommodation_type);
      fd.append("preferred_travel_date",      form.preferred_travel_date);
      fd.append("group_travel",               String(form.group_travel));
      fd.append("emergency_contact_name",     profile?.emergency_contact_name ?? "");
      fd.append("emergency_contact_phone",    profile?.emergency_contact_phone ?? "");
      fd.append("emergency_contact_relationship", profile?.emergency_contact_relationship ?? "");
      await api.post("/app/pilgrimage-application/", fd, { headers:{"Content-Type":"multipart/form-data"} });
      onSuccess();
    } catch(err:any) {
      const d = err?.response?.data;
      setSubmitError(d
        ? Object.entries(d).map(([k,v])=>`${k}: ${Array.isArray(v)?(v as string[]).join(", "):v}`).join(" | ")
        : "Submission failed. Please try again.");
    } finally { setSubmitting(false); }
  };

  return (
    <Box>
      <Box sx={{ mb:2.5 }}>
        <Typography sx={{ fontWeight:800, fontSize:17, color:C.g900, lineHeight:1.3 }}>Apply for this Offer</Typography>
        <Typography sx={{ fontSize:12.5, color:C.g400, mt:0.25 }}>Your profile details are pre-filled automatically.</Typography>
      </Box>

      {/* Readiness bar */}
      <Box sx={{ mb:2.5 }}>
        <Box sx={{ display:"flex", justifyContent:"space-between", mb:0.75 }}>
          <Typography sx={{ fontSize:12, fontWeight:600, color:C.g500 }}>Application readiness</Typography>
          <Typography sx={{ fontSize:12, fontWeight:800, color:readiness===100?C.green:C.amber }}>{readiness}%</Typography>
        </Box>
        <LinearProgress variant="determinate" value={readiness}
          sx={{ height:7, borderRadius:4, bgcolor:C.g100,
            "& .MuiLinearProgress-bar":{ bgcolor:readiness===100?C.green:C.brand, borderRadius:4 } }} />
      </Box>

      {(missingFields.length>0||missingDocs.length>0) && (
        <Alert severity="warning" icon={<WarningAmberIcon sx={{fontSize:18}}/>}
          sx={{ mb:2, borderRadius:"12px", fontSize:12.5, py:1 }}
          action={<Button size="small" onClick={()=>navigate("/settings/profile/edit")}
            sx={{ fontSize:11, fontWeight:700, color:C.brandDark, textTransform:"none", whiteSpace:"nowrap" }}>
            Fix now →</Button>}>
          <strong>{missingFields.length+missingDocs.length} item(s) incomplete</strong> — you can still apply now.
        </Alert>
      )}

      {/* Collapsible checklist */}
      <Paper variant="outlined" sx={{ borderRadius:"14px", mb:2, borderColor:C.g200, overflow:"hidden" }}>
        {categories.map((cat,ci) => {
          const items = REQUIRED_CHECKS.filter(c=>c.category===cat);
          const catOk = items.every(c=>isFieldOk(c.field));
          const catMissing = items.filter(c=>!isFieldOk(c.field)).length;
          const open = expandedCat===cat;
          return (
            <Box key={cat} sx={{ borderBottom:ci<categories.length-1?`1px solid ${C.g100}`:"none" }}>
              <Box onClick={()=>setExpandedCat(open?null:cat)}
                sx={{ display:"flex", alignItems:"center", gap:1.5, px:2, py:1.5, cursor:"pointer",
                  bgcolor:open?C.accentXL:"#fff", "&:hover":{bgcolor:C.accentXL}, transition:"background .15s" }}>
                {catOk
                  ? <TaskAltIcon sx={{fontSize:17,color:C.green,flexShrink:0}}/>
                  : <WarningAmberIcon sx={{fontSize:17,color:C.amber,flexShrink:0}}/>}
                <Typography sx={{ flex:1, fontSize:12.5, fontWeight:700, color:C.g900 }}>{CATEGORY_LABELS[cat]}</Typography>
                <Chip label={catOk?"Complete":`${catMissing} missing`} size="small"
                  sx={{ height:20, fontSize:10, fontWeight:700,
                    bgcolor:catOk?C.greenLight:C.amberLight, color:catOk?C.green:C.amber,
                    border:`1px solid ${catOk?C.greenBorder:C.amberBorder}` }} />
                {open ? <KeyboardArrowUpIcon sx={{fontSize:18,color:C.g400}}/> : <KeyboardArrowDownIcon sx={{fontSize:18,color:C.g400}}/>}
              </Box>
              <Collapse in={open}>
                <Box sx={{ px:2, pb:1.5, pt:0.5 }}>
                  {items.map(item => {
                    const ok = isFieldOk(item.field);
                    const raw = profile?.[item.field];
                    const display = ok ? (typeof raw==="object"?(raw as any).name??(raw as any).code:String(raw)) : null;
                    return (
                      <Box key={item.field} sx={{ display:"flex", alignItems:"center", gap:1.5, py:0.75 }}>
                        {ok
                          ? <CheckCircleIcon sx={{fontSize:14,color:C.green,flexShrink:0}}/>
                          : <ErrorOutlineIcon sx={{fontSize:14,color:C.red,flexShrink:0}}/>}
                        <Box sx={{ flex:1, minWidth:0 }}>
                          <Typography sx={{ fontSize:10.5, fontWeight:700, color:C.g400, textTransform:"uppercase", letterSpacing:"0.5px" }}>{item.label}</Typography>
                          <Typography sx={{ fontSize:12.5, color:ok?C.g700:C.red }}>{ok?display:"Not set"}</Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Collapse>
            </Box>
          );
        })}

        {/* Documents */}
        <Box sx={{ borderTop:`1px solid ${C.g100}` }}>
          <Box onClick={()=>setExpandedCat(expandedCat==="docs"?null:"docs")}
            sx={{ display:"flex", alignItems:"center", gap:1.5, px:2, py:1.5, cursor:"pointer",
              bgcolor:expandedCat==="docs"?C.accentXL:"#fff", "&:hover":{bgcolor:C.accentXL} }}>
            {missingDocs.length===0
              ? <TaskAltIcon sx={{fontSize:17,color:C.green}}/>
              : <WarningAmberIcon sx={{fontSize:17,color:C.amber}}/>}
            <Typography sx={{ flex:1, fontSize:12.5, fontWeight:700, color:C.g900 }}>Documents</Typography>
            <Chip label={missingDocs.length===0?"All uploaded":`${missingDocs.length} missing`} size="small"
              sx={{ height:20, fontSize:10, fontWeight:700,
                bgcolor:missingDocs.length===0?C.greenLight:C.amberLight,
                color:missingDocs.length===0?C.green:C.amber,
                border:`1px solid ${missingDocs.length===0?C.greenBorder:C.amberBorder}` }} />
            {expandedCat==="docs" ? <KeyboardArrowUpIcon sx={{fontSize:18,color:C.g400}}/> : <KeyboardArrowDownIcon sx={{fontSize:18,color:C.g400}}/>}
          </Box>
          <Collapse in={expandedCat==="docs"}>
            <Box sx={{ px:2, pb:1.5, pt:0.5 }}>
              {DOC_CHECKS.map(doc => {
                const ok = isDocOk(doc);
                return (
                  <Box key={doc} sx={{ display:"flex", alignItems:"center", gap:1.5, py:0.75 }}>
                    {ok ? <CheckCircleIcon sx={{fontSize:14,color:C.green}}/> : <ErrorOutlineIcon sx={{fontSize:14,color:C.red}}/>}
                    <Typography sx={{ flex:1, fontSize:12.5, color:ok?C.g700:C.red }}>{doc}</Typography>
                    {!ok && (
                      <Button size="small" onClick={()=>navigate("/settings/profile/edit")}
                        sx={{ fontSize:10, fontWeight:700, color:C.brand, textTransform:"none", p:0.25, minWidth:0 }}>
                        Upload →</Button>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Collapse>
        </Box>
      </Paper>

      {/* App-specific fields */}
      <Divider sx={{ mb:2 }}>
        <Typography sx={{ fontSize:11, fontWeight:700, color:C.g400, textTransform:"uppercase", letterSpacing:"0.6px" }}>Pilgrimage details</Typography>
      </Divider>

      <Box sx={{ display:"flex", flexDirection:"column", gap:1.5, mb:2.5 }}>
        <FormControl fullWidth size="small" sx={SX_INPUT}>
          <InputLabel>Type of Pilgrimage *</InputLabel>
          <Select label="Type of Pilgrimage *" value={form.pilgrimage_type}
            onChange={e=>setForm(p=>({...p,pilgrimage_type:e.target.value}))}>
            {PILGRIMAGE_OPTIONS.map(o=><MenuItem key={o} value={o}>{o}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl fullWidth size="small" sx={SX_INPUT}>
          <InputLabel>Accommodation Preference *</InputLabel>
          <Select label="Accommodation Preference *" value={form.accommodation_type}
            onChange={e=>setForm(p=>({...p,accommodation_type:e.target.value}))}>
            {ACCOMMODATION_OPTIONS.map(o=><MenuItem key={o} value={o}>{o}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="Preferred Travel Date *" type="date" size="small" fullWidth
          value={form.preferred_travel_date} InputLabelProps={{shrink:true}} sx={SX_INPUT}
          onChange={e=>setForm(p=>({...p,preferred_travel_date:e.target.value}))} />
        <FormControlLabel
          control={<Checkbox checked={form.group_travel} onChange={e=>setForm(p=>({...p,group_travel:e.target.checked}))}
            sx={{ color:C.brand, "&.Mui-checked":{color:C.brand} }} />}
          label={<Typography sx={{ fontSize:13, color:C.g700 }}>Travelling as a group</Typography>}
        />
      </Box>

      {submitError && (
        <Alert severity="error" sx={{ mb:2, borderRadius:"10px", fontSize:12 }}>{submitError}</Alert>
      )}

      <Button variant="contained" fullWidth onClick={handleSubmit}
        disabled={submitting || !form.pilgrimage_type || !form.accommodation_type || !form.preferred_travel_date}
        startIcon={submitting ? <CircularProgress size={16} color="inherit"/> : <RocketLaunchIcon/>}
        sx={{ bgcolor:C.brand, fontWeight:800, fontSize:14, borderRadius:"12px", py:1.6,
          textTransform:"none", boxShadow:"0 4px 14px rgba(139,43,140,.35)",
          "&:hover":{bgcolor:C.brandDark},
          "&.Mui-disabled":{bgcolor:C.g200, color:C.g400, boxShadow:"none"} }}>
        {submitting ? "Submitting…" : allReady ? "Submit Application" : "Submit Application Anyway"}
      </Button>

      {!allReady && (
        <Box sx={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0.5, mt:1.5 }}>
          <EditOutlinedIcon sx={{fontSize:13,color:C.g400}}/>
          <Typography component="span" onClick={()=>navigate("/settings/profile/edit")}
            sx={{ fontSize:12, color:C.brand, fontWeight:600, cursor:"pointer", textDecoration:"underline" }}>
            Complete your profile</Typography>
          <Typography sx={{ fontSize:12, color:C.g400 }}>to strengthen this application</Typography>
        </Box>
      )}
    </Box>
  );
};

/* ─── Main Component ───────────────────────────────────────────────── */
const PilgrimageDetails: React.FC = () => {
  const { id } = useParams<{id:string}>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [offer,setOffer]             = useState<any>(null);
  const [loading,setLoading]         = useState(true);
  const [error,setError]             = useState<string|null>(null);
  const [profile,setProfile]         = useState<any>(null);
  const [clientDocs,setClientDocs]   = useState<any[]>([]);
  const [latestApp,setLatestApp]     = useState<any>(null);
  const [appLoading,setAppLoading]   = useState(false);
  const [submitSuccess,setSubmitSuccess] = useState(false);
  const [liveDescription,setLiveDesc] = useState("");
  const typingRef = useRef<ReturnType<typeof setTimeout>|null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/app/pilgrimage-offer/${id}/`).then(r=>r.data),
      authService.getProfile(),
      userServices.getAllClientsDocument(),
    ]).then(([offerData,profileData,docsData]) => {
      setOffer(offerData);
      setProfile(profileData);
      setClientDocs(Array.isArray(docsData)?docsData:docsData?.results??[]);
    }).catch(()=>setError("Failed to load offer details."))
      .finally(()=>setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !user) return;
    setAppLoading(true);
    api.get("/app/pilgrimage-application/", { params:{offer_id:id} })
      .then(res => {
        const results = Array.isArray(res.data?.results)?res.data.results:Array.isArray(res.data)?res.data:[];
        const found = results.find((a:any) =>
          String(a.pilgrimage_offer??a.offer?.id??a.offer)===String(id)
        );
        setLatestApp(found??null);
      })
      .catch(()=>setLatestApp(null))
      .finally(()=>setAppLoading(false));
  }, [id,user]);

  useEffect(() => {
    if (!offer) return;
    const desc = offer.description||offer.program_description||"";
    if (!desc||liveDescription===desc) return;
    if (typingRef.current) clearTimeout(typingRef.current);
    let n = liveDescription.length;
    const tick = () => {
      if (n<desc.length) { setLiveDesc(desc.slice(0,n+1)); n++; typingRef.current=setTimeout(tick,6); }
    };
    tick();
    return ()=>{ if(typingRef.current) clearTimeout(typingRef.current); };
  }, [offer]);

  if (loading) return <Box sx={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}><CircularProgress sx={{color:C.brand}}/></Box>;
  if (error||!offer) return <Box sx={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}><Typography color="error">{error??"Offer not found."}</Typography></Box>;

  const institution = (typeof offer.institution==="object"&&offer.institution)||{name:offer.institution_name||offer.name||"N/A"};
  const fmtDate = (d:string)=>d?new Date(d).toLocaleDateString(undefined,{year:"numeric",month:"long",day:"numeric"}):"N/A";
  const str=(v:any):string=>{
    if (v==null) return "N/A";
    if (typeof v==="object") return v.name??v.term??v.description??v.code??JSON.stringify(v);
    return String(v);
  };
  const META_COLS = [
    {label:"Pilgrimage Type", value:Array.isArray(offer.pilgrimage_type_display)?offer.pilgrimage_type_display.map(str).join(", "):str(offer.pilgrimage_type_display??offer.pilgrimage_type)},
    {label:"Duration",        value:str(offer.duration)},
    {label:"Price",           value:offer.price!=null?`£${Number(offer.price).toLocaleString()}`:"N/A"},
    {label:"Departure Date",  value:fmtDate(offer.departure_date)},
    {label:"Return Date",     value:fmtDate(offer.return_date)},
    {label:"Available Slots", value:str(offer.available_slots)},
  ];

  return (
    <Box sx={{ p:1, width:"100%" }}>
      <Breadcrumbs sx={{ mb:2 }}>
        <Link component="button" underline="hover" color="inherit" onClick={()=>navigate(-1)} sx={{fontWeight:500,cursor:"pointer"}}>Back</Link>
        <Typography color="text.primary">Pilgrimage Details</Typography>
      </Breadcrumbs>

      <Box sx={{ display:"flex", flexDirection:{xs:"column",md:"row"}, gap:4, px:{xs:0,md:2} }}>
        {/* Left — Offer Details */}
        <Box sx={{ flex:2, minWidth:0 }}>
          <Card sx={{ borderRadius:"18px", boxShadow:"0 2px 12px rgba(0,0,0,.07)", mb:3 }}>
            <CardContent sx={{ p:3 }}>
              <Box sx={{ display:"flex", alignItems:"center", gap:2, mb:2.5 }}>
                {offer.image && (
                  <CardMedia component="img" image={offer.image} alt="Offer"
                    sx={{ width:64, height:64, borderRadius:2, objectFit:"contain", bgcolor:C.g50 }} />
                )}
                <Box>
                  <Typography variant="h5" sx={{ fontWeight:800, color:C.g900 }}>
                    {capitalizeWords(typeof institution==="object"?institution.name:institution)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{offer.country??""}</Typography>
                </Box>
              </Box>

              <Typography variant="h6" sx={{ fontWeight:700, mb:1.5 }}>
                {offer.offer_title??offer.title??offer.name??"Pilgrimage Offer"}
              </Typography>

              {liveDescription ? renderDesc(liveDescription) : <Typography variant="body1" color="text.secondary">No description available.</Typography>}

              <Divider sx={{ my:2.5 }}/>
              <Box sx={{ display:"grid", gridTemplateColumns:{xs:"1fr",sm:"1fr 1fr",md:"1fr 1fr 1fr"}, gap:2 }}>
                {META_COLS.map(m=>(
                  <Box key={m.label}>
                    <Typography sx={{ fontSize:11, fontWeight:700, color:C.g400, textTransform:"uppercase", letterSpacing:"0.5px", mb:0.25 }}>{m.label}</Typography>
                    <Typography sx={{ fontSize:13.5, color:C.g900, fontWeight:600 }}>{m.value}</Typography>
                  </Box>
                ))}
              </Box>

              {offer.inclusions && (
                <>
                  <Divider sx={{ my:2.5 }}/>
                  <Typography variant="subtitle1" sx={{ fontWeight:700, mb:1 }}>What's Included</Typography>
                  <Typography variant="body2">{offer.inclusions}</Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Right — Smart Apply Panel */}
        <Box sx={{ flex:1, alignSelf:"flex-start", bgcolor:"#fff", borderRadius:"18px",
          border:`1px solid ${C.g200}`, boxShadow:"0 4px 20px rgba(0,0,0,.08)", p:3,
          position:{md:"sticky"}, top:{md:24} }}>
          {appLoading ? (
            <Box sx={{display:"flex",alignItems:"center",gap:1.5,py:2}}>
              <CircularProgress size={20} sx={{color:C.brand}}/>
              <Typography sx={{fontSize:13,color:C.g500}}>Checking your applications…</Typography>
            </Box>
          ) : submitSuccess ? (
            <Box sx={{textAlign:"center",py:3}}>
              <TaskAltIcon sx={{fontSize:56,color:C.green,mb:1.5}}/>
              <Typography sx={{fontWeight:800,fontSize:18,color:C.g900,mb:0.75}}>Application Submitted!</Typography>
              <Typography sx={{fontSize:13,color:C.g500,mb:3}}>We've received your pilgrimage application.</Typography>
              <Button variant="outlined" fullWidth onClick={()=>navigate("/customer/applications")}
                sx={{borderColor:C.accentLight,color:C.brand,fontWeight:700,borderRadius:"10px",textTransform:"none"}}>
                View my Applications</Button>
            </Box>
          ) : latestApp ? (
            <AppliedPanel app={latestApp} onViewAll={()=>navigate("/customer/applications")}/>
          ) : (
            <SmartApplyPanel offer={offer} profile={profile} clientDocs={clientDocs}
              offerId={id??""} onSuccess={()=>setSubmitSuccess(true)}/>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PilgrimageDetails;
