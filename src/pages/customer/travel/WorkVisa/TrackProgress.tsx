import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  Tooltip,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import InfoOutlinedIcon      from "@mui/icons-material/InfoOutlined";
import AttachFileIcon        from "@mui/icons-material/AttachFile";
import SendIcon              from "@mui/icons-material/Send";
import SearchIcon            from "@mui/icons-material/Search";
import FilterListIcon        from "@mui/icons-material/FilterList";
import RefreshIcon           from "@mui/icons-material/Refresh";
import MoreVertIcon          from "@mui/icons-material/MoreVert";
import FileDownloadIcon      from "@mui/icons-material/FileDownload";
import DescriptionIcon       from "@mui/icons-material/Description";
import CheckIcon             from "@mui/icons-material/Check";
import AddIcon               from "@mui/icons-material/Add";
import CloseIcon             from "@mui/icons-material/Close";
import ChatIcon              from "@mui/icons-material/Chat";
import { useNavigate }       from "react-router-dom";
import { getMyRecentSudyVisaApplicaton } from "../../../../services/studyVisa";
import { getMyWorkVisaApplications }     from "../../../../services/workVisaService";
import { getPilgrimageApplications }     from "../../../../services/pilgrimageServices";
import { getAllVacationBookings }         from "../../../../services/vacationService";
import * as commentsService              from "../../../../services/commentsService";

/* ─── Brand tokens (match Dashboard) ──────────────────────────── */
const C = {
  brand:    "#b66aed", brandHov: "#7c2bb5ff", brandDark: "#1E0A3C",
  accent:   "#bc62dfff", accentLt: "#EDE9FE", accentXL: "#F5F3FF",
  green:    "#059669", greenBg:  "#ECFDF5",
  red:      "#DC2626", redBg:    "#FEF2F2",
  amber:    "#ffae49", amberBg:  "#FFFBEB",
  blue:     "#2563EB", blueBg:   "#EFF6FF",
  g50:  "#FAFAFA", g100: "#F4F4F5", g200: "#E4E4E7",
  g300: "#D1D5DB", g400: "#A1A1AA", g500: "#71717A",
  g700: "#3F3F46", g900: "#18181B",
} as const;

/* ─── Step arrays ──────────────────────────────────────────────── */
const WORK_VISA_STEPS = [
  "Draft","Application Received","Pending Documents from Applicant",
  "Application Submitted to Employer/Agency","Application on Hold",
  "Interview/Screening Scheduled","Offer Letter Received",
  "Payment/Processing Fee Confirmed","Work Permit/Approval in Progress",
  "Visa Application Submitted to Embassy","Visa Granted","Visa Denied","Case Closed",
];
const VACATION_STEPS = [
  "Draft","Application Received","Pending Documents from Applicant",
  "Application Submitted to Travel Partner/Embassy","Application on Hold",
  "Payment Confirmed","Visa Application Submitted","Visa Granted","Visa Denied",
  "Flight Booking Confirmed","Accommodation Reserved","Trip in Progress",
  "Trip Completed","Case Closed",
];
const STUDY_VISA_STEPS = [
  "Draft","Completed","Approved","Rejected","Received Application",
  "Pending From Student","Application Submitted to the Institution",
  "Application on hold, Intake not yet open","Case Closed",
  "Rejected By the institution","Conditional offer Received",
  "Unconditional Offer received","Payment Received","Visa  granted","Visa Denied",
];
const PILGRIMAGE_STEPS = [
  "Draft","Application Received","Pending Documents from Applicant",
  "Application Submitted to Embassy/Authority","Application on Hold",
  "Payment Confirmed","Visa Application Submitted","Visa Granted","Visa Denied",
  "Flight & Accommodation Confirmed","Orientation/Briefing Completed",
  "Pilgrimage in Progress","Return Completed","Case Closed",
];

type ApplicationType = "workVisa"|"studyVisa"|"pilgrimage"|"vacation";

const TABS: { key: ApplicationType; label: string; emoji: string; iconBg: string }[] = [
  { key:"workVisa",   label:"Work Visa",   emoji:"💼", iconBg:"#F5F3FF" },
  { key:"studyVisa",  label:"Study Visa",  emoji:"📄", iconBg:"#ECFDF5" },
  { key:"pilgrimage", label:"Pilgrimage",  emoji:"🕌", iconBg:"#FEF2F2" },
  { key:"vacation",   label:"Vacation",    emoji:"🏖️", iconBg:"#FFF7ED" },
];

/* ─── Shared helpers ───────────────────────────────────────────── */
function extractStatusWork(s: any): string {
  if (s == null) return "Draft";
  if (typeof s === "string") return s;
  if (typeof s === "object") return s.term || s.label || s.name || JSON.stringify(s);
  return String(s);
}
function extractStatusStudy(item: any): string {
  return item.status_name || (typeof item.status === "string" ? item.status : "Draft");
}
function renderVal(v: any): string {
  if (v == null) return "-";
  if (typeof v === "object") return v.label || v.name || v.term || JSON.stringify(v);
  return String(v);
}
function fmtDate(raw: any): string {
  if (!raw) return "-";
  try { return new Date(raw).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}); }
  catch { return "-"; }
}
function getStepIdx(steps: string[], status: string): number {
  const n = (s: string) => s.toLowerCase().replace(/\s+/g," ").trim();
  const i = steps.findIndex(s => n(s) === n(status));
  return i >= 0 ? i : 0;
}
function statusStyle(s: string): { bg: string; color: string } {
  const v = (s||"").toLowerCase();
  if (v.includes("granted")||v.includes("completed")||v.includes("approved")||v.includes("unconditional"))
    return { bg:C.greenBg, color:C.green };
  if (v.includes("denied")||v.includes("rejected")||v.includes("hold"))
    return { bg:C.redBg, color:C.red };
  if (v.includes("interview")||v.includes("offer")||v.includes("conditional"))
    return { bg:C.blueBg, color:C.blue };
  if (v.includes("pending")||v.includes("payment"))
    return { bg:C.amberBg, color:C.amber };
  if (v==="draft"||v==="case closed") return { bg:C.g100, color:C.g500 };
  return { bg:C.accentXL, color:C.brand };
}

/* ─── PaginatedPhrase ──────────────────────────────────────────── */
function PP({ text, max=28 }: { text: string; max?: number }) {
  const [open,setOpen] = useState(false);
  const t = typeof text==="string" ? text.trim() : String(text);
  const ov = t.length > max;
  return (
    <span style={{display:"inline-flex",alignItems:"center"}}>
      {ov ? (
        <>
          <Tooltip title={t}><span>{t.slice(0,max)}…</span></Tooltip>
          <IconButton size="small" onClick={()=>setOpen(true)} sx={{ml:.3,p:.3}}>
            <InfoOutlinedIcon sx={{fontSize:11}}/>
          </IconButton>
          <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{fontSize:14,fontWeight:700}}>Full Text</DialogTitle>
            <DialogContent><Typography sx={{wordBreak:"break-word",fontSize:13}}>{t}</Typography></DialogContent>
          </Dialog>
        </>
      ) : <span>{t}</span>}
    </span>
  );
}

/* ─── Chat bubble ──────────────────────────────────────────────── */
function ChatBubble({ message,isMe,fileUrl,timestamp,sender_display }:{
  message:string; isMe:boolean; fileUrl?:string|null;
  timestamp?:string; sender_display?:any;
}) {
  const initials = isMe ? "You" : String(sender_display||"GC").slice(0,2).toUpperCase();
  return (
    <Box sx={{display:"flex",flexDirection:isMe?"row-reverse":"row",alignItems:"flex-end",gap:1,mb:1.5}}>
      <Box sx={{
        width:28,height:28,borderRadius:"50%",flexShrink:0,
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:9,fontWeight:800,
        bgcolor:isMe?"#FDE68A":C.accentXL,
        color:isMe?"#78350F":C.brand,
        border:`1px solid ${isMe?"#FCD34D":C.accentLt}`,
      }}>{initials}</Box>
      <Box sx={{display:"flex",flexDirection:"column",alignItems:isMe?"flex-end":"flex-start",maxWidth:220}}>
        {fileUrl && (
          <Box component="a" href={fileUrl} target="_blank" rel="noopener noreferrer"
            sx={{display:"flex",alignItems:"center",gap:1,mb:message?0.5:0,
              bgcolor:"#fff",border:`1.5px solid ${C.g200}`,borderRadius:"10px",
              p:"8px 12px",textDecoration:"none",transition:"all .15s",
              "&:hover":{borderColor:C.brand}}}>
            <Box sx={{width:30,height:30,borderRadius:"7px",bgcolor:C.redBg,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>📄</Box>
            <Box>
              <Typography sx={{fontSize:11,fontWeight:700,color:C.g900}}>Attached File</Typography>
              <Typography sx={{fontSize:9,color:C.g400}}>Click to view</Typography>
            </Box>
          </Box>
        )}
        {message && (
          <Box sx={{
            px:"13px",py:"10px",borderRadius:"12px",
            borderBottomRightRadius:isMe?"3px":"12px",
            borderBottomLeftRadius:isMe?"12px":"3px",
            bgcolor:isMe?C.brand:"#fff",color:isMe?"#fff":C.g900,
            border:isMe?"none":`1px solid ${C.g200}`,
            boxShadow:"0 1px 3px rgba(0,0,0,.06)",
            fontSize:12,lineHeight:1.5,wordBreak:"break-word",
          }}>{message}</Box>
        )}
        <Typography sx={{fontSize:9,color:C.g400,mt:.4,textAlign:isMe?"right":"left"}}>
          {timestamp||new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
        </Typography>
      </Box>
    </Box>
  );
}

/* ─── useCommentsForApp ────────────────────────────────────────── */
function useCommentsForApp(
  applicationId: string|null,
  applicationType?: "work"|"pilgrimage"|"study"|"vacation"
) {
  const [comments,setComments]   = useState<any[]>([]);
  const [loading,setLoading]     = useState(false);
  const [sendError,setSendError] = useState<string|null>(null);
  const wsRef    = useRef<any>(null);
  const wsReady  = useRef(false);
  const userId = (() => {
    try { const d=localStorage.getItem("user"); if(d){const p=JSON.parse(d);return p?.id||p?.user_id||null;} } catch{}
    return null;
  })();
  const fetch = useCallback(async()=>{
    if(!applicationId){setComments([]);setLoading(false);return;}
    setLoading(true);setSendError(null);
    try{
      const r=await commentsService.fetchComments({application_id:applicationId,application_type:applicationType});
      setComments(Array.isArray(r?.results)?r.results:[]);
    }catch{setComments([]);setSendError("Failed to load comments.");}
    setLoading(false);
  },[applicationId,applicationType]);
  useEffect(()=>{fetch();},[applicationId,applicationType]);
  useEffect(()=>{
    if(!(applicationType&&applicationId&&userId))return;
    if(wsRef.current){try{wsRef.current.disconnect();}catch{}wsRef.current=null;}
    wsReady.current=false;
    wsRef.current=new commentsService.VisaApplicationCommentsWebSocket(
      applicationId,applicationType,
      (data:any)=>{
        if(Array.isArray(data.results))setComments(data.results);
        else if(data.id&&data.text)setComments(p=>p.find(c=>c.id===data.id)?p:[...p,data]);
      },
      {userId,onOpen:()=>{wsReady.current=true;},onClose:()=>{wsReady.current=false;},onError:()=>{wsReady.current=false;}}
    );
    wsRef.current.connect();
    return()=>{if(wsRef.current){wsRef.current.disconnect();wsRef.current=null;wsReady.current=false;}};
  },[applicationId,applicationType,userId]);
  async function sendWS({text,attachment}:{text:string;attachment?:File|null}){
    if(!wsRef.current||!wsReady.current)throw new Error("Real-time connection not available");
    attachment instanceof File?wsRef.current.sendComment(text,attachment):wsRef.current.sendComment(text);
  }
  return{comments,loading,setComments,refresh:fetch,sendError,
    sendCommentWebSocket:applicationType===undefined?undefined:sendWS};
}

/* ─── Main Component ───────────────────────────────────────────── */
export const TrackProgress: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [tab,setTab]           = useState<ApplicationType>("workVisa");
  const [chatOpen,setChatOpen] = useState(false);
  const [workVisa,setWorkVisa] = useState<any[]>([]);
  const [studyVisa,setStudyVisa]   = useState<any[]>([]);
  const [pilgrimage,setPilgrimage] = useState<any[]>([]);
  const [vacation,setVacation]     = useState<any[]>([]);
  const [loading,setLoading]       = useState(true);
  const [error,setError]           = useState<string|null>(null);
  const [selectedId,setSelectedId] = useState<string|null>(null);
  const [search,setSearch]         = useState("");
  const [showAll,setShowAll]       = useState(false);
  const [msg,setMsg]               = useState("");
  const [file,setFile]             = useState<File|null>(null);
  const [sending,setSending]       = useState(false);
  const [sendErr,setSendErr]       = useState<string|null>(null);

  const fileRef    = useRef<HTMLInputElement>(null);
  const bottomRef  = useRef<HTMLDivElement>(null);

  /* load data */
  useEffect(()=>{
    let m=true; setLoading(true); setError(null);
    Promise.allSettled([
      getMyWorkVisaApplications(),
      getMyRecentSudyVisaApplicaton(),
      getPilgrimageApplications(),
      getAllVacationBookings(),
    ]).then(r=>{
      if(!m)return;
      const gl=(i:number)=>r[i].status==="fulfilled"&&Array.isArray((r[i] as PromiseFulfilledResult<any>).value.results)
        ?(r[i] as PromiseFulfilledResult<any>).value.results:[];
      setWorkVisa(gl(0));setStudyVisa(gl(1));setPilgrimage(gl(2));setVacation(gl(3));
    }).catch(()=>{if(m)setError("Failed to load applications.");})
    .finally(()=>{if(m)setLoading(false);});
    return()=>{m=false;};
  },[]);

  /* auto-select first item on tab/data change */
  useEffect(()=>{
    const map:Record<ApplicationType,any[]>={workVisa,studyVisa,pilgrimage,vacation};
    const list=map[tab]||[];
    setSelectedId(list.length>0?String(list[0].id):null);
    setShowAll(false); setSearch("");
  },[tab,workVisa,studyVisa,pilgrimage,vacation]);

  /* scroll chat to bottom */
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); });

  /* normalise API data */
  function getApps(t:ApplicationType) {
    switch(t){
      case "workVisa": return workVisa.map(item=>{
        const o=item.offer||{},org=o.organization||{};
        return{id:String(item.id),country:renderVal(o.country),job:o.job_title||"-",
          organization:org.name||"-",status:extractStatusWork(item.status),
          appliedAt:item.submitted_at||item.created_at,steps:WORK_VISA_STEPS,type:"workVisa" as ApplicationType,raw:item};
      });
      case "studyVisa": return studyVisa.map(item=>({
        id:String(item.id),country:item.destination_country||item.country||"-",
        job:item.course_of_study_name||"-",organization:item.institution_name||"-",
        status:extractStatusStudy(item),appliedAt:item.application_date||item.created_at||item.applied_at,
        steps:STUDY_VISA_STEPS,type:"studyVisa" as ApplicationType,raw:item,
      }));
      case "pilgrimage": return pilgrimage.map(item=>({
        id:String(item.id),country:item.destination||"-",job:item.offer_title||"-",organization:"-",
        status:item.status_name||item.status||"Draft",
        appliedAt:item.created_at||item.preferred_travel_date||item.application_date,
        steps:PILGRIMAGE_STEPS,type:"pilgrimage" as ApplicationType,raw:item,
      }));
      case "vacation": return vacation.map(item=>({
        id:String(item.id),country:item.country||"-",
        job:item.offer_title||item.package?.offer_title||"-",
        organization:item.applicant_detail?.name||item.package?.organization||"-",
        status:item.status_display||item.status_name||item.status||"Draft",
        appliedAt:item.created_at||item.applied_at,
        steps:VACATION_STEPS,type:"vacation" as ApplicationType,raw:item,
      }));
      default: return [];
    }
  }
  function apiType(t:ApplicationType):"work"|"pilgrimage"|"study"|"vacation"|undefined{
    return({workVisa:"work",studyVisa:"study",pilgrimage:"pilgrimage",vacation:"vacation"}[t]) as any;
  }

  const allApps = getApps(tab);
  const filtered = search.trim()
    ? allApps.filter(a=>{const q=search.toLowerCase();
        return a.job.toLowerCase().includes(q)||a.organization.toLowerCase().includes(q)
          ||a.country.toLowerCase().includes(q)||a.status.toLowerCase().includes(q);})
    : allApps;
  const sel      = allApps.find(a=>a.id===selectedId)||null;
  const selType  = sel?apiType(sel.type):undefined;
  const selCfg   = sel?TABS.find(t=>t.key===sel.type)!:null;

  const{comments,loading:loadComments,refresh:refreshComments,
    sendError:fetchErr,sendCommentWebSocket}=useCommentsForApp(sel?.id??null,selType);

  const stepIdx    = sel?getStepIdx(sel.steps,sel.status):0;
  const totalSteps = sel?.steps.length??1;
  const pct        = Math.round((stepIdx/Math.max(totalSteps-1,1))*100);
  const COLLAPSED  = Math.max(stepIdx+3,4);
  const visSteps   = showAll?(sel?.steps??[]):(sel?.steps??[]).slice(0,COLLAPSED);
  const counts:Record<ApplicationType,number>={workVisa:workVisa.length,studyVisa:studyVisa.length,pilgrimage:pilgrimage.length,vacation:vacation.length};

  /* send comment */
  async function handleSend(e?:React.FormEvent){
    if(e)e.preventDefault();
    if(!sel||(!msg.trim()&&!file))return;
    setSendErr(null);setSending(true);
    try{
      if(file){
        if(!(file instanceof File)){setSendErr("Attachment is not a file.");setSending(false);return;}
        await commentsService.postComment({application_id:sel.id,application_type:selType,
          attachment:file,sender_type:"applicant",text:msg.trim()});
        await refreshComments();
      } else if(typeof sendCommentWebSocket==="function"){
        await sendCommentWebSocket({text:msg.trim()});
      } else {
        await commentsService.postComment({application_id:sel.id,application_type:selType,
          text:msg.trim(),sender_type:"applicant"});
        await refreshComments();
      }
      setMsg("");setFile(null);
    }catch(err:any){setSendErr("Failed to send. "+(err?.message??"Please try again."));}
    setSending(false);
  }

  /* ── Shared card style ── */
  const card = {
    bgcolor:"#fff", border:`1px solid ${C.g200}`,
    borderRadius:"14px", boxShadow:"0 1px 2px rgba(0,0,0,.06)",
  } as const;

  /* panel height — fits inside existing layout */
  const PANEL_H = "calc(100vh - 310px)";
  const PANEL_MIN = 480;

  /* ══════════════════════════════════════════════════════════════ */
  return (
    <Box sx={{width:"100%",display:"flex",flexDirection:"column",gap:2}}>

      {/* ── Page title row ─────────────────────────────────────── */}
      <Box sx={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:1.5}}>
        <Box>
          <Typography sx={{fontSize:{xs:18,sm:22},fontWeight:800,color:C.g900,letterSpacing:"-.4px"}}>
            📋 My Applications
          </Typography>
          <Typography sx={{fontSize:12,color:C.g500,mt:"2px"}}>
            Track all your visa, travel and study applications in one place.
          </Typography>
        </Box>
        <Box sx={{display:"flex",gap:1,flexShrink:0}}>
          <Box onClick={()=>{}} sx={{
            display:"flex",alignItems:"center",gap:.7,px:2,py:1,
            border:`1.5px solid ${C.g200}`,borderRadius:"9px",
            bgcolor:"#fff",color:C.g700,fontSize:12,fontWeight:600,cursor:"pointer",
            transition:"all .15s","&:hover":{borderColor:C.brand,color:C.brand,bgcolor:C.accentXL},
          }}>
            <FileDownloadIcon sx={{fontSize:14}}/>Export
          </Box>
          <Box onClick={()=>navigate("/travel/book-flight")} sx={{
            display:"flex",alignItems:"center",gap:.7,px:2,py:1,
            bgcolor:C.brand,color:"#fff",borderRadius:"9px",
            fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .15s",
            "&:hover":{bgcolor:C.brandHov,boxShadow:"0 4px 16px rgba(182,106,237,.25)"},
          }}>
            <AddIcon sx={{fontSize:14}}/>New Application
          </Box>
        </Box>
      </Box>

      {/* ── Stat strip ─────────────────────────────────────────── */}
      <Box sx={{display:"grid",gridTemplateColumns:{xs:"repeat(2,1fr)",sm:"repeat(4,1fr)"},gap:1.5}}>
        {TABS.map(t=>{
          const isActive = tab===t.key;
          const cnt = loading?"–":counts[t.key];
          return(
            <Box key={t.key} onClick={()=>setTab(t.key)} sx={{
              ...card,
              p:"14px 16px",display:"flex",alignItems:"center",gap:1.5,
              cursor:"pointer",transition:"all .18s",
              border:`1.5px solid ${isActive?C.brand:C.g200}`,
              bgcolor:isActive?C.accentXL:"#fff",
              "&:hover":{borderColor:C.brand,boxShadow:"0 4px 14px rgba(182,106,237,.10)"},
            }}>
              <Box sx={{width:42,height:42,borderRadius:"11px",bgcolor:t.iconBg,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                {t.emoji}
              </Box>
              <Box>
                <Typography sx={{fontSize:11,color:isActive?C.brand:C.g500,fontWeight:500,mb:"2px"}}>
                  {t.label}
                </Typography>
                <Typography sx={{fontSize:22,fontWeight:900,letterSpacing:"-.5px",lineHeight:1,
                  color:isActive?C.brand:C.g900}}>
                  {cnt}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* ── 3-column panel ─────────────────────────────────────── */}
      <Box sx={{
        ...card,
        display:"grid",
        gridTemplateColumns:{xs:"1fr",lg:"280px 1fr 320px"},
        overflow:"hidden",
        height:{lg:PANEL_H},
        minHeight:PANEL_MIN,
      }}>

        {/* ── LEFT: list ──────────────────────────────────────── */}
        <Box sx={{
          borderRight:{lg:`1px solid ${C.g200}`},
          borderBottom:{xs:`1px solid ${C.g200}`,lg:"none"},
          display:"flex",flexDirection:"column",overflow:"hidden",
          height:{xs:320,lg:"100%"},
        }}>
          {/* header */}
          <Box sx={{display:"flex",alignItems:"center",justifyContent:"space-between",
            px:2,py:1.5,borderBottom:`1px solid ${C.g100}`,flexShrink:0}}>
            <Typography sx={{fontSize:11,fontWeight:700,color:C.g900,
              textTransform:"uppercase",letterSpacing:".3px"}}>
              Applications
            </Typography>
            <Box sx={{display:"flex",alignItems:"center",gap:.5,
              fontSize:11,color:C.accent,fontWeight:600,cursor:"pointer",
              "&:hover":{color:C.brand}}}>
              <FilterListIcon sx={{fontSize:13}}/>Filter
            </Box>
          </Box>

          {/* search */}
          <Box sx={{px:1.5,py:1,borderBottom:`1px solid ${C.g100}`,flexShrink:0}}>
            <Box sx={{display:"flex",alignItems:"center",gap:1,bgcolor:C.g100,
              borderRadius:"9px",px:1.3,py:.9,border:"1.5px solid transparent",
              transition:"all .15s","&:focus-within":{borderColor:C.accent,bgcolor:"#fff"}}}>
              <SearchIcon sx={{fontSize:14,color:C.g400,flexShrink:0}}/>
              <Box component="input" value={search}
                onChange={(e:React.ChangeEvent<HTMLInputElement>)=>setSearch(e.target.value)}
                placeholder="Search applications…"
                sx={{border:"none",background:"transparent",outline:"none",
                  fontSize:12,color:C.g700,width:"100%",fontFamily:"inherit",
                  "&::placeholder":{color:C.g400}}}/>
            </Box>
          </Box>

          {/* type pills */}
          <Box sx={{display:"flex",px:1.5,pt:1,pb:0,gap:.7,flexShrink:0,
            overflowX:"auto",scrollbarWidth:"none","&::-webkit-scrollbar":{display:"none"},
            borderBottom:`1px solid ${C.g200}`}}>
            {TABS.map(t=>(
              <Box key={t.key} onClick={()=>setTab(t.key)} sx={{
                fontSize:10,fontWeight:600,px:1.2,py:.5,borderRadius:"20px",
                cursor:"pointer",whiteSpace:"nowrap",mb:1,flexShrink:0,transition:"all .15s",
                border:`1.5px solid ${tab===t.key?C.brand:C.g200}`,
                bgcolor:tab===t.key?C.brand:"#fff",
                color:tab===t.key?"#fff":C.g500,
                "&:hover":{borderColor:C.brand,color:tab===t.key?"#fff":C.brand},
              }}>{t.emoji} {t.label}</Box>
            ))}
          </Box>

          {/* list */}
          <Box sx={{flex:1,overflowY:"auto",px:1,py:1,display:"flex",
            flexDirection:"column",gap:"2px",
            "&::-webkit-scrollbar":{width:"3px"},
            "&::-webkit-scrollbar-thumb":{bgcolor:C.g200,borderRadius:"4px"}}}>
            {loading?(
              <Box sx={{py:5,textAlign:"center"}}>
                <CircularProgress size={26} sx={{color:C.brand}}/>
              </Box>
            ):error?(
              <Alert severity="error" sx={{m:1,fontSize:11}}>{error}</Alert>
            ):filtered.length===0?(
              <Box sx={{py:5,textAlign:"center"}}>
                <Box sx={{width:44,height:44,borderRadius:"12px",bgcolor:C.accentXL,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:20,mx:"auto",mb:1.5}}>{TABS.find(t=>t.key===tab)?.emoji}</Box>
                <Typography sx={{fontSize:12,fontWeight:700,color:C.g900,mb:.5}}>
                  No {TABS.find(t=>t.key===tab)?.label} applications
                </Typography>
                <Typography sx={{fontSize:11,color:C.g400}}>
                  {search?"Try a different search":"Nothing here yet"}
                </Typography>
              </Box>
            ):filtered.map(app=>{
              const isSel=app.id===selectedId;
              const ss=statusStyle(app.status);
              const si=getStepIdx(app.steps,app.status);
              const pg=Math.round((si/Math.max(app.steps.length-1,1))*100);
              const cfg=TABS.find(t=>t.key===app.type)!;
              return(
                <Box key={app.id} onClick={()=>{setSelectedId(app.id);setShowAll(false);}}
                  sx={{
                    borderRadius:"10px",p:"11px 10px",cursor:"pointer",
                    border:`1.5px solid ${isSel?C.brand:"transparent"}`,
                    bgcolor:isSel?C.accentXL:"transparent",transition:"all .15s",
                    "&:hover":{bgcolor:isSel?C.accentXL:C.g50,
                      borderColor:isSel?C.brand:C.g200},
                  }}>
                  <Box sx={{display:"flex",alignItems:"flex-start",gap:1.2,mb:.8}}>
                    <Box sx={{width:34,height:34,borderRadius:"9px",bgcolor:cfg.iconBg,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:16,flexShrink:0}}>{cfg.emoji}</Box>
                    <Box sx={{flex:1,minWidth:0}}>
                      <Typography sx={{fontSize:12,fontWeight:700,color:C.g900,
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",mb:"2px"}}>
                        {app.job!=="-"?app.job:cfg.label} – {app.country}
                      </Typography>
                      <Typography sx={{fontSize:10,color:C.g500,
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {app.organization!=="-"?app.organization:app.country}
                      </Typography>
                    </Box>
                    <Box sx={{fontSize:9,fontWeight:700,px:.9,py:.3,
                      borderRadius:"20px",flexShrink:0,...ss}}>
                      {app.status.length>13?app.status.slice(0,12)+"…":app.status}
                    </Box>
                  </Box>
                  <Box sx={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <Typography sx={{fontSize:10,color:C.g400}}>{fmtDate(app.appliedAt)}</Typography>
                    <Box sx={{width:68,height:4,bgcolor:C.g200,borderRadius:"4px",overflow:"hidden"}}>
                      <Box sx={{height:"100%",borderRadius:"4px",width:`${pg}%`,
                        background:`linear-gradient(90deg,${C.brand},${C.accent})`}}/>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* ── MIDDLE: detail + stepper ────────────────────────── */}
        <Box sx={{
          overflowY:"auto",overflowX:"hidden",
          borderRight:{lg:`1px solid ${C.g200}`},
          bgcolor:C.g50,height:{xs:"auto",lg:"100%"},
          "&::-webkit-scrollbar":{width:"4px"},
          "&::-webkit-scrollbar-thumb":{bgcolor:C.g200,borderRadius:"4px"},
        }}>
          {!sel?(
            <Box sx={{display:"flex",flexDirection:"column",alignItems:"center",
              justifyContent:"center",height:"100%",minHeight:300,textAlign:"center",p:4}}>
              <Box sx={{width:60,height:60,borderRadius:"16px",bgcolor:C.accentXL,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,mb:2}}>📋</Box>
              <Typography sx={{fontSize:14,fontWeight:700,color:C.g900,mb:.5}}>
                No application selected
              </Typography>
              <Typography sx={{fontSize:12,color:C.g400,maxWidth:220,lineHeight:1.6}}>
                Choose an application from the list to view its details and progress.
              </Typography>
            </Box>
          ):(
            <>
              {/* ── Hero ── */}
              <Box sx={{
                background:`linear-gradient(135deg,#8b3fc7 0%,${C.brand} 55%,${C.accent} 100%)`,
                px:{xs:2.5,sm:3},pt:2.5,pb:0,position:"relative",overflow:"hidden",
              }}>
                <Box sx={{position:"absolute",width:200,height:200,borderRadius:"50%",
                  bgcolor:"rgba(255,255,255,.04)",top:-60,right:-40,pointerEvents:"none"}}/>
                <Box sx={{position:"absolute",width:110,height:110,borderRadius:"50%",
                  bgcolor:"rgba(255,255,255,.05)",bottom:-25,left:30,pointerEvents:"none"}}/>
                <Box sx={{position:"relative",zIndex:1}}>
                  {/* breadcrumb */}
                  <Box sx={{display:"flex",alignItems:"center",gap:.8,mb:1.5,
                    fontSize:10,color:"rgba(255,255,255,.5)",fontWeight:500,
                    overflow:"hidden"}}>
                    <span style={{flexShrink:0}}>{selCfg?.label}</span>
                    <span style={{color:"rgba(255,255,255,.3)",flexShrink:0}}>›</span>
                    <span style={{color:"rgba(255,255,255,.8)",
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {sel.job!=="-"?sel.job:selCfg?.label}
                    </span>
                  </Box>
                  {/* title */}
                  <Box sx={{display:"flex",alignItems:"flex-start",
                    justifyContent:"space-between",gap:1.5,mb:2}}>
                    <Box sx={{display:"flex",alignItems:"center",gap:1.5}}>
                      <Box sx={{width:48,height:48,borderRadius:"13px",fontSize:23,flexShrink:0,
                        bgcolor:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",
                        display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {selCfg?.emoji}
                      </Box>
                      <Box sx={{minWidth:0}}>
                        <Typography sx={{fontSize:10,fontWeight:600,letterSpacing:"1.2px",
                          textTransform:"uppercase",color:"rgba(255,255,255,.5)",mb:"4px"}}>
                          {selCfg?.label} · #{sel.id}
                        </Typography>
                        <Typography sx={{
                          fontSize:13,fontWeight:800,
                          color:"#fff",letterSpacing:"-.2px",lineHeight:1.3,
                          overflow:"hidden",textOverflow:"ellipsis",
                          display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",
                        }}>
                          {sel.job!=="-"?sel.job:selCfg?.label} – {sel.country}
                        </Typography>
                      </Box>
                    </Box>
                    <Tooltip title={sel.status} placement="bottom-end">
                      <Box sx={{fontSize:9,fontWeight:700,px:1.2,py:.5,borderRadius:"20px",
                        alignSelf:"flex-start",flexShrink:0,maxWidth:90,
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                        bgcolor:"rgba(255,255,255,.12)",color:"#fff",
                        border:"1px solid rgba(255,255,255,.2)",cursor:"default"}}>
                        {sel.status.length>14?sel.status.slice(0,13)+"…":sel.status}
                      </Box>
                    </Tooltip>
                  </Box>
                  {/* progress bar */}
                  <Box sx={{mb:2}}>
                    <Box sx={{display:"flex",justifyContent:"space-between",
                      alignItems:"center",mb:.8}}>
                      <Typography sx={{fontSize:10,color:"rgba(255,255,255,.6)",fontWeight:500}}>
                        Overall Progress
                      </Typography>
                      <Typography sx={{fontSize:11,color:"#fff",fontWeight:700}}>
                        Step {stepIdx+1} of {totalSteps} · {pct}%
                      </Typography>
                    </Box>
                    <Box sx={{height:6,bgcolor:"rgba(255,255,255,.15)",borderRadius:"6px",overflow:"hidden"}}>
                      <Box sx={{height:"100%",borderRadius:"6px",width:`${pct}%`,
                        background:"linear-gradient(90deg,#A78BFA,#C4B5FD)",transition:"width .4s ease"}}/>
                    </Box>
                  </Box>
                  {/* meta strip */}
                  <Box sx={{display:"flex",mx:{xs:-2.5,sm:-3},
                    borderTop:"1px solid rgba(255,255,255,.1)",
                    overflowX:"auto",scrollbarWidth:"none",
                    "&::-webkit-scrollbar":{display:"none"}}}>
                    {[
                      {l:"Organisation", v:sel.organization!=="-"?sel.organization:"–"},
                      {l:"Destination",  v:sel.country},
                      {l:"Visa Type",    v:selCfg?.label??"–"},
                      {l:"Applied On",   v:fmtDate(sel.appliedAt)},
                    ].map((m,i)=>(
                      <Box key={i} sx={{flex:"1 0 auto",py:1.6,px:2.5,minWidth:90,
                        borderRight:i<3?"1px solid rgba(255,255,255,.1)":"none"}}>
                        <Typography sx={{fontSize:9,textTransform:"uppercase",letterSpacing:"1px",
                          color:"rgba(255,255,255,.45)",mb:"4px",fontWeight:500}}>{m.l}</Typography>
                        <Typography sx={{fontSize:12,fontWeight:700,color:"#fff",
                          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.v}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>

              {/* ── Detail body ── */}
              <Box sx={{px:{xs:2,sm:2.5}}}>

                {/* action bar */}
                <Box sx={{display:"flex",gap:1,flexWrap:"wrap",
                  py:2,borderBottom:`1px solid ${C.g200}`}}>
                  {[
                    {icon:<AttachFileIcon sx={{fontSize:12}}/>,label:"Upload Document",primary:true,
                      onClick:()=>fileRef.current?.click()},
                    {icon:<DescriptionIcon sx={{fontSize:12}}/>,label:"View Full Details",primary:false,onClick:()=>{}},
                    {icon:<FileDownloadIcon sx={{fontSize:12}}/>,label:"Download Summary",primary:false,onClick:()=>{}},
                  ].map(b=>(
                    <Box key={b.label} onClick={b.onClick} sx={{
                      display:"flex",alignItems:"center",gap:.7,px:1.6,py:.8,
                      borderRadius:"9px",fontSize:12,fontWeight:600,cursor:"pointer",
                      transition:"all .15s",
                      ...(b.primary
                        ?{bgcolor:C.brand,color:"#fff","&:hover":{bgcolor:C.brandHov}}
                        :{bgcolor:"#fff",color:C.g700,border:`1.5px solid ${C.g200}`,
                          "&:hover":{borderColor:C.brand,color:C.brand,bgcolor:C.accentXL}}),
                    }}>{b.icon}{b.label}</Box>
                  ))}
                </Box>

                {/* stepper header */}
                <Box sx={{display:"flex",alignItems:"center",justifyContent:"space-between",
                  pt:2.2,mb:1.8}}>
                  <Typography sx={{fontSize:12,fontWeight:700,color:C.g900}}>
                    Application Progress
                  </Typography>
                  <Typography sx={{fontSize:11,color:C.g400}}>
                    {stepIdx} of {totalSteps} steps completed
                  </Typography>
                </Box>

                {/* stepper */}
                <Box sx={{display:"flex",flexDirection:"column"}}>
                  {visSteps.map((name,i)=>{
                    const done=i<stepIdx, active=i===stepIdx, pend=i>stepIdx;
                    const last=i===visSteps.length-1;
                    return(
                      <Box key={i} sx={{display:"flex",gap:1.8}}>
                        <Box sx={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                          <Box sx={{
                            width:24,height:24,borderRadius:"50%",flexShrink:0,zIndex:1,
                            display:"flex",alignItems:"center",justifyContent:"center",
                            fontSize:10,fontWeight:800,border:"2px solid transparent",
                            ...(done ?{bgcolor:C.green,color:"#fff",borderColor:C.green}:{}),
                            ...(active?{bgcolor:C.brand,color:"#fff",borderColor:C.brand,
                              boxShadow:`0 0 0 4px rgba(182,106,237,.15)`}:{}),
                            ...(pend ?{bgcolor:"#fff",color:C.g300,borderColor:C.g200}:{}),
                          }}>
                            {done?<CheckIcon sx={{fontSize:12}}/>:i+1}
                          </Box>
                          {!last&&(
                            <Box sx={{width:2,flex:1,minHeight:14,my:"3px",
                              bgcolor:done?C.green:C.g200}}/>
                          )}
                        </Box>
                        <Box sx={{pb:last?0:2.2,flex:1,minWidth:0,pt:"1px"}}>
                          <Typography sx={{fontSize:12,lineHeight:1.3,
                            fontWeight:active?700:done?400:400,
                            color:active?C.brand:done?C.g400:C.g300}}>
                            {name}
                          </Typography>
                          {active&&(
                            <Box sx={{display:"inline-flex",alignItems:"center",gap:.5,
                              mt:.8,fontSize:9,fontWeight:700,px:1,py:.4,borderRadius:"20px",
                              bgcolor:C.accentXL,color:C.brand,border:`1px solid ${C.accentLt}`}}>
                              ⚡ Current step
                            </Box>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
                {!showAll&&sel.steps.length>visSteps.length&&(
                  <Box onClick={()=>setShowAll(true)} sx={{textAlign:"center",py:1,
                    fontSize:11,color:C.accent,fontWeight:600,cursor:"pointer",
                    "&:hover":{color:C.brand}}}>
                    + Show {sel.steps.length-visSteps.length} more steps ↓
                  </Box>
                )}
                {showAll&&visSteps.length>5&&(
                  <Box onClick={()=>setShowAll(false)} sx={{textAlign:"center",py:1,
                    fontSize:11,color:C.g400,fontWeight:600,cursor:"pointer",
                    "&:hover":{color:C.g700}}}>Show less ↑</Box>
                )}

                {/* details grid */}
                <Box sx={{borderTop:`1px solid ${C.g200}`,mt:1}}>
                  <Typography sx={{fontSize:12,fontWeight:700,color:C.g900,pt:2.2,mb:1.5}}>
                    Application Details
                  </Typography>
                  <Box sx={{display:"grid",gridTemplateColumns:{xs:"1fr",sm:"1fr 1fr"},gap:1.2,pb:3}}>
                    {[
                      {l:"Role / Course",  v:sel.job},
                      {l:"Current Status", v:sel.status, brand:true},
                      {l:"Organisation",   v:sel.organization},
                      {l:"Destination",    v:sel.country},
                      {l:"Type",           v:selCfg?.label??"-"},
                      {l:"Applied On",     v:fmtDate(sel.appliedAt)},
                    ].map(d=>(
                      <Box key={d.l} sx={{bgcolor:"#fff",border:`1px solid ${C.g200}`,
                        borderRadius:"9px",px:1.7,py:1.5}}>
                        <Typography sx={{fontSize:9,fontWeight:600,textTransform:"uppercase",
                          letterSpacing:".8px",color:C.g400,mb:.5}}>{d.l}</Typography>
                        <Typography sx={{fontSize:12,fontWeight:700,
                          color:(d as any).brand?C.brand:C.g900,
                          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          <PP text={d.v!=="-"?d.v:"–"} max={22}/>
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </Box>

        {/* ── RIGHT: chat (desktop) ───────────────────────────── */}
        <Box sx={{
          display:{xs:"none",lg:"flex"},flexDirection:"column",
          bgcolor:"#fff",height:{lg:"100%"},overflow:"hidden",
        }}>
          {/* chat header */}
          <Box sx={{px:2,py:1.6,borderBottom:`1px solid ${C.g100}`,flexShrink:0}}>
            <Box sx={{display:"flex",alignItems:"center",gap:1.2,mb:"2px"}}>
              <Box sx={{width:36,height:36,borderRadius:"10px",bgcolor:C.accentXL,
                border:`1px solid ${C.accentLt}`,display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:18,flexShrink:0}}>🧑‍💼</Box>
              <Box sx={{flex:1,minWidth:0}}>
                <Typography sx={{fontSize:13,fontWeight:700,color:C.g900}}>
                  GrazConcept Support
                </Typography>
                <Box sx={{display:"flex",alignItems:"center",gap:.6,
                  fontSize:10,color:C.green,fontWeight:600}}>
                  <Box sx={{width:6,height:6,borderRadius:"50%",bgcolor:C.green,
                    boxShadow:`0 0 0 2px rgba(5,150,105,.2)`}}/>
                  Agent online
                </Box>
              </Box>
              <Box sx={{display:"flex",gap:.5}}>
                <IconButton size="small" onClick={()=>refreshComments()}
                  sx={{width:28,height:28,border:`1.5px solid ${C.g200}`,borderRadius:"7px",
                    "&:hover":{borderColor:C.brand,color:C.brand,bgcolor:C.accentXL}}}>
                  <RefreshIcon sx={{fontSize:12}}/>
                </IconButton>
                <IconButton size="small"
                  sx={{width:28,height:28,border:`1.5px solid ${C.g200}`,borderRadius:"7px",
                    "&:hover":{borderColor:C.brand,color:C.brand,bgcolor:C.accentXL}}}>
                  <MoreVertIcon sx={{fontSize:12}}/>
                </IconButton>
              </Box>
            </Box>
            {sel&&(
              <Typography sx={{fontSize:10,color:C.g400,mt:.2,
                overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                #{sel.id} · {sel.job!=="-"?sel.job:selCfg?.label}
              </Typography>
            )}
          </Box>

          {/* messages */}
          <Box sx={{flex:1,overflowY:"auto",px:2,py:1.8,
            display:"flex",flexDirection:"column",bgcolor:"#FAFAF9",
            "&::-webkit-scrollbar":{width:"3px"},
            "&::-webkit-scrollbar-thumb":{bgcolor:C.g200,borderRadius:"4px"}}}>
            {!sel?(
              <Box sx={{display:"flex",alignItems:"center",justifyContent:"center",
                height:"100%",textAlign:"center"}}>
                <Typography sx={{fontSize:12,color:C.g400}}>
                  Select an application to view its chat.
                </Typography>
              </Box>
            ):loadComments?(
              <Box sx={{textAlign:"center",py:4}}>
                <CircularProgress size={20} sx={{color:C.brand}}/>
              </Box>
            ):fetchErr?(
              <Typography sx={{fontSize:12,color:C.red,textAlign:"center",py:4}}>
                Failed to load comments.
              </Typography>
            ):comments.length===0?(
              <Box sx={{display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",height:"100%",textAlign:"center"}}>
                <Box sx={{width:42,height:42,borderRadius:"12px",bgcolor:C.accentXL,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:19,mb:1.5}}>💬</Box>
                <Typography sx={{fontSize:12,fontWeight:700,color:C.g900,mb:.5}}>
                  No messages yet
                </Typography>
                <Typography sx={{fontSize:11,color:C.g400,maxWidth:180,lineHeight:1.6}}>
                  Start the conversation — your agent will respond within 1–2 hours.
                </Typography>
              </Box>
            ):comments.map(c=>(
              <ChatBubble key={c.id} message={c.text}
                isMe={c.sender_type==="applicant"||c.sender_display==="You"}
                fileUrl={c.attachment}
                timestamp={c.created_at?new Date(c.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):""}
                sender_display={c.sender_display}/>
            ))}
            <div ref={bottomRef}/>
          </Box>

          {/* send error */}
          {sendErr&&(
            <Alert severity="error" onClose={()=>setSendErr(null)}
              sx={{mx:2,mb:.5,fontSize:11,py:.2}}>
              {sendErr}
            </Alert>
          )}

          {/* upload preview */}
          {file&&(
            <Box sx={{display:"flex",alignItems:"center",gap:1,mx:2,mb:.8,
              bgcolor:C.amberBg,border:"1.5px solid #FDE68A",borderRadius:"8px",
              px:1.5,py:.8}}>
              <AttachFileIcon sx={{fontSize:13,color:C.amber}}/>
              <Typography sx={{flex:1,overflow:"hidden",textOverflow:"ellipsis",
                whiteSpace:"nowrap",fontSize:11,fontWeight:600,color:"#92400E"}}>
                {file.name}
              </Typography>
              <Box onClick={()=>setFile(null)} sx={{cursor:"pointer",
                color:"#B45309",fontSize:16,lineHeight:1,"&:hover":{color:C.red}}}>×</Box>
            </Box>
          )}

          {/* input */}
          <Box sx={{px:2,py:1.5,flexShrink:0,borderTop:`1px solid ${C.g100}`}}>
            <input type="file" ref={fileRef} style={{display:"none"}}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={e=>{
                const f=e.target.files?.[0]; if(f instanceof File)setFile(f);
              }}/>
            <Box component="form" onSubmit={handleSend} sx={{
              display:"flex",alignItems:"flex-end",gap:1,
              bgcolor:C.g100,borderRadius:"12px",px:1.5,py:1,
              border:"1.5px solid transparent",transition:"border-color .15s",
              "&:focus-within":{borderColor:C.accent,bgcolor:"#fff"},
            }}>
              <Box component="textarea" value={msg}
                onChange={(e:React.ChangeEvent<HTMLTextAreaElement>)=>setMsg(e.target.value)}
                onKeyDown={(e:React.KeyboardEvent<HTMLTextAreaElement>)=>{
                  if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleSend();}
                }}
                placeholder="Type a message…"
                rows={1} disabled={sending||!sel} maxLength={1000}
                sx={{flex:1,border:"none",background:"transparent",outline:"none",
                  resize:"none",fontSize:12,fontFamily:"inherit",color:C.g900,
                  maxHeight:80,minHeight:20,lineHeight:1.4,
                  "&::placeholder":{color:C.g400},"&:disabled":{opacity:.5}}}/>
              <Box sx={{display:"flex",gap:.5,alignItems:"center"}}>
                <IconButton size="small" onClick={()=>fileRef.current?.click()}
                  disabled={sending||!sel}
                  sx={{width:28,height:28,borderRadius:"7px",
                    color:file?C.amber:C.g400,
                    "&:hover":{bgcolor:C.g200,color:C.g700}}}>
                  <AttachFileIcon sx={{fontSize:14}}/>
                </IconButton>
                <IconButton type="submit" size="small"
                  disabled={sending||!sel||(!msg.trim()&&!file)}
                  sx={{width:32,height:32,borderRadius:"9px",bgcolor:C.brand,color:"#fff",
                    "&:hover":{bgcolor:C.brandHov,boxShadow:"0 4px 16px rgba(182,106,237,.25)"},
                    "&:disabled":{bgcolor:C.g200,color:C.g400}}}>
                  {sending
                    ?<CircularProgress size={13} sx={{color:"#fff"}}/>
                    :<SendIcon sx={{fontSize:13}}/>}
                </IconButton>
              </Box>
            </Box>
            <Typography sx={{fontSize:10,color:C.g400,textAlign:"center",mt:.8}}>
              Replies within 1–2 business hours
            </Typography>
          </Box>
        </Box>

      </Box>{/* /3-col */}

      {/* ── MOBILE: floating chat button ────────────────────────── */}
      {isMobile && sel && (
        <Box
          onClick={() => setChatOpen(true)}
          sx={{
            position: "fixed", bottom: 24, right: 24, zIndex: 100,
            width: 52, height: 52, borderRadius: "50%",
            background: `linear-gradient(135deg,${C.brand},${C.accent})`,
            boxShadow: "0 6px 20px rgba(182,106,237,.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all .2s",
            "&:hover": { transform: "scale(1.08)", boxShadow: "0 8px 28px rgba(182,106,237,.55)" },
          }}
        >
          <ChatIcon sx={{ color: "#fff", fontSize: 22 }} />
        </Box>
      )}

      {/* ── MOBILE: chat slide-in drawer ────────────────────────── */}
      <Drawer
        anchor="right"
        open={isMobile && chatOpen}
        onClose={() => setChatOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100vw", sm: 380 },
            display: "flex", flexDirection: "column", overflow: "hidden",
          },
        }}
      >
        {/* drawer header */}
        <Box sx={{ px: 2, py: 1.6, borderBottom: `1px solid ${C.g100}`, flexShrink: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: C.accentXL,
              border: `1px solid ${C.accentLt}`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🧑‍💼</Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.g900 }}>
                GrazConcept Support
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: .6,
                fontSize: 10, color: C.green, fontWeight: 600 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: C.green,
                  boxShadow: `0 0 0 2px rgba(5,150,105,.2)` }}/>
                Agent online
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setChatOpen(false)}
              sx={{ width: 32, height: 32, borderRadius: "8px", bgcolor: C.g100,
                "&:hover": { bgcolor: C.g200 } }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
          {sel && (
            <Typography sx={{ fontSize: 10, color: C.g400, mt: .5,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              #{sel.id} · {sel.job !== "-" ? sel.job : selCfg?.label}
            </Typography>
          )}
        </Box>

        {/* messages */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 1.8,
          display: "flex", flexDirection: "column", bgcolor: "#FAFAF9",
          "&::-webkit-scrollbar": { width: "3px" },
          "&::-webkit-scrollbar-thumb": { bgcolor: C.g200, borderRadius: "4px" } }}>
          {!sel ? (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center",
              height: "100%", textAlign: "center" }}>
              <Typography sx={{ fontSize: 12, color: C.g400 }}>
                Select an application to view its chat.
              </Typography>
            </Box>
          ) : loadComments ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress size={20} sx={{ color: C.brand }} />
            </Box>
          ) : fetchErr ? (
            <Typography sx={{ fontSize: 12, color: C.red, textAlign: "center", py: 4 }}>
              Failed to load comments.
            </Typography>
          ) : comments.length === 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", textAlign: "center" }}>
              <Box sx={{ width: 42, height: 42, borderRadius: "12px", bgcolor: C.accentXL,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 19, mb: 1.5 }}>💬</Box>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: C.g900, mb: .5 }}>
                No messages yet
              </Typography>
              <Typography sx={{ fontSize: 11, color: C.g400, maxWidth: 200, lineHeight: 1.6 }}>
                Start the conversation — your agent will respond within 1–2 hours.
              </Typography>
            </Box>
          ) : comments.map(c => (
            <ChatBubble key={c.id} message={c.text}
              isMe={c.sender_type === "applicant" || c.sender_display === "You"}
              fileUrl={c.attachment}
              timestamp={c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
              sender_display={c.sender_display} />
          ))}
          <div ref={bottomRef} />
        </Box>

        {/* send error */}
        {sendErr && (
          <Alert severity="error" onClose={() => setSendErr(null)}
            sx={{ mx: 2, mb: .5, fontSize: 11, py: .2 }}>
            {sendErr}
          </Alert>
        )}

        {/* file preview */}
        {file && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mx: 2, mb: .8,
            bgcolor: C.amberBg, border: "1.5px solid #FDE68A", borderRadius: "8px",
            px: 1.5, py: .8 }}>
            <AttachFileIcon sx={{ fontSize: 13, color: C.amber }} />
            <Typography sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis",
              whiteSpace: "nowrap", fontSize: 11, fontWeight: 600, color: "#92400E" }}>
              {file.name}
            </Typography>
            <Box onClick={() => setFile(null)} sx={{ cursor: "pointer",
              color: "#B45309", fontSize: 16, lineHeight: 1, "&:hover": { color: C.red } }}>×</Box>
          </Box>
        )}

        {/* input */}
        <Box sx={{ px: 2, py: 1.5, flexShrink: 0, borderTop: `1px solid ${C.g100}` }}>
          <Box component="form" onSubmit={handleSend} sx={{
            display: "flex", alignItems: "flex-end", gap: 1,
            bgcolor: C.g100, borderRadius: "12px", px: 1.5, py: 1,
            border: "1.5px solid transparent", transition: "border-color .15s",
            "&:focus-within": { borderColor: C.accent, bgcolor: "#fff" },
          }}>
            <Box component="textarea" value={msg}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMsg(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              placeholder="Type a message…"
              rows={1} disabled={sending || !sel} maxLength={1000}
              sx={{ flex: 1, border: "none", background: "transparent", outline: "none",
                resize: "none", fontSize: 12, fontFamily: "inherit", color: C.g900,
                maxHeight: 80, minHeight: 20, lineHeight: 1.4,
                "&::placeholder": { color: C.g400 }, "&:disabled": { opacity: .5 } }} />
            <Box sx={{ display: "flex", gap: .5, alignItems: "center" }}>
              <IconButton size="small" onClick={() => fileRef.current?.click()}
                disabled={sending || !sel}
                sx={{ width: 28, height: 28, borderRadius: "7px",
                  color: file ? C.amber : C.g400,
                  "&:hover": { bgcolor: C.g200, color: C.g700 } }}>
                <AttachFileIcon sx={{ fontSize: 14 }} />
              </IconButton>
              <IconButton type="submit" size="small"
                disabled={sending || !sel || (!msg.trim() && !file)}
                sx={{ width: 32, height: 32, borderRadius: "9px", bgcolor: C.brand, color: "#fff",
                  "&:hover": { bgcolor: C.brandHov, boxShadow: "0 4px 16px rgba(182,106,237,.25)" },
                  "&:disabled": { bgcolor: C.g200, color: C.g400 } }}>
                {sending
                  ? <CircularProgress size={13} sx={{ color: "#fff" }} />
                  : <SendIcon sx={{ fontSize: 13 }} />}
              </IconButton>
            </Box>
          </Box>
          <Typography sx={{ fontSize: 10, color: C.g400, textAlign: "center", mt: .8 }}>
            Replies within 1–2 business hours
          </Typography>
        </Box>
      </Drawer>

    </Box>
  );
};

export default TrackProgress;
