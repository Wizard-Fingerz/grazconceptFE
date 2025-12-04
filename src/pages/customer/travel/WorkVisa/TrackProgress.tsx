import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Chip,
  Stack,
  CircularProgress,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Avatar,
  TextField,
  InputAdornment,
  Paper,
  LinearProgress,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import { getMyRecentSudyVisaApplicaton } from "../../../../services/studyVisa";
import { getMyWorkVisaApplications } from "../../../../services/workVisaService";
import { getPilgrimageApplications } from "../../../../services/pilgrimageServices";
import { getAllVacationBookings } from "../../../../services/vacationService";
// --- Import real comments API service ---
import * as commentsService from "../../../../services/commentsService";

const WORK_VISA_STEPS = [
  "Draft", "Application Received", "Pending Documents from Applicant", "Application Submitted to Employer/Agency", "Application on Hold", "Interview/Screening Scheduled", "Offer Letter Received", "Payment/Processing Fee Confirmed", "Work Permit/Approval in Progress", "Visa Application Submitted to Embassy", "Visa Granted", "Visa Denied", "Case Closed"
];
const VACATION_STEPS = [
  "Draft", "Application Received", "Pending Documents from Applicant", "Application Submitted to Travel Partner/Embassy", "Application on Hold", "Payment Confirmed", "Visa Application Submitted", "Visa Granted", "Visa Denied", "Flight Booking Confirmed", "Accommodation Reserved", "Trip in Progress", "Trip Completed", "Case Closed"
];
const STUDY_VISA_STEPS = [
  "Draft", "Completed", "Approved", "Rejected", "Received Application", "Pending From Student", "Application Submitted to the Institution", "Application on hold, Intake not yet open", "Case Closed", "Rejected By the institution", "Conditional offer Received", "Unconditional Offer received", "Payment Received", "Visa  granted", "Visa Denied"
];
const PILGRIMAGE_STEPS = [
  "Draft", "Application Received", "Pending Documents from Applicant", "Application Submitted to Embassy/Authority", "Application on Hold", "Payment Confirmed", "Visa Application Submitted", "Visa Granted", "Visa Denied", "Flight & Accommodation Confirmed", "Orientation/Briefing Completed", "Pilgrimage in Progress", "Return Completed", "Case Closed"
];

type ApplicationType = "workVisa" | "studyVisa" | "pilgrimage" | "vacation";

const TABS: {
  key: ApplicationType;
  label: string;
}[] = [
  { key: "workVisa", label: "Work Visa" },
  { key: "studyVisa", label: "Study Visa" },
  { key: "pilgrimage", label: "Pilgrimage" },
  { key: "vacation", label: "Vacation" },
];

function extractStatusTextWork(status: any) {
  if (status == null) return "Draft";
  if (typeof status === "string") return status;
  if (typeof status === "object") {
    if (status.term) return status.term;
    if (status.label) return status.label;
    if (status.name) return status.name;
    return JSON.stringify(status);
  }
  return String(status);
}
function extractStatusTextStudy(item: any) {
  if (item.status_name) return item.status_name;
  if (typeof item.status === "string") return item.status;
  return "Draft";
}

// PaginatedPhrase as in original
function PaginatedPhrase({
  phrase,
  maxLength = 16,
  showToolIcon = true,
  sx = {},
}: {
  phrase: string;
  maxLength?: number;
  showToolIcon?: boolean;
  sx?: any;
}) {
  const [open, setOpen] = useState(false);
  if (typeof phrase !== "string") phrase = `${phrase}`;
  let trimmed = phrase?.trim() ?? "";
  const isOverflow = trimmed.length > maxLength;
  const shortText = isOverflow
    ? trimmed.slice(0, maxLength) + "…"
    : trimmed;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", ...sx }}>
      {isOverflow ? (
        <>
          <Tooltip title={trimmed}>
            <span>{shortText}</span>
          </Tooltip>
          {showToolIcon && (
            <>
              <IconButton
                size="small"
                onClick={() => setOpen(true)}
                sx={{ ml: 0.5, p: 0.5 }}
                aria-label="Show full phrase"
              >
                <InfoOutlinedIcon fontSize="inherit" />
              </IconButton>
              <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Complete Phrase</DialogTitle>
                <DialogContent>
                  <Typography style={{ wordBreak: "break-word" }}>
                    {trimmed}
                  </Typography>
                </DialogContent>
              </Dialog>
            </>
          )}
        </>
      ) : (
        <span>{shortText}</span>
      )}
    </span>
  );
}

// Chat bubble with API data
function ChatBubble({
  message,
  isMe,
  fileUrl,
  timestamp,
  sender_display,
}: {
  message: string;
  isMe: boolean;
  fileUrl?: string | null;
  timestamp?: string;
  sender_display?: string;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", mb: 1 }}>
      <Avatar sx={{ bgcolor: isMe ? "#ffe3aa" : "#ccc", width: 32, height: 32 }}>
        {isMe ? "You" : (sender_display ? sender_display[0] : "A")}
      </Avatar>
      <Box sx={{ mx: 1.5, flex: 1 }}>
        <Paper
          sx={{
            p: 1.5,
            bgcolor: isMe ? "#fdf6e5" : "#f5f5f5",
            color: "#222",
            borderRadius: isMe
              ? "14px 0 14px 14px"
              : "0 14px 14px 14px",
            boxShadow: 0,
            minWidth: 80,
            maxWidth: 420,
            display: "inline-block",
            wordBreak: "break-word",
            mb: 0.2,
          }}
        >
          <span>{message}</span>
          {fileUrl && (
            <Box sx={{ mt: 0.5 }}>
              <Button
                href={fileUrl}
                size="small"
                sx={{ textTransform: "none" }}
                startIcon={<AttachFileIcon />}
                target="_blank"
                rel="noopener noreferrer"
              >
                Attached File
              </Button>
            </Box>
          )}
        </Paper>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.2 }}>
          <Typography variant="caption" color="text.secondary">
            {timestamp ||
              new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// Hook for fetching/posting comments using API
function useCommentsForApp(applicationId: string | null) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!applicationId) {
      setComments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setSendError(null);
    try {
      // Use the application_type and application_id
      const res = await commentsService.fetchComments({
        application_id: applicationId,
      });
      setComments(Array.isArray(res?.results) ? res.results : []);
    } catch (err: any) {
      setComments([]);
      setSendError("Failed to load comments.");
    }
    setLoading(false);
  }, [applicationId]);

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [applicationId]);

  // Add a comment to UI optimistically, optional after post
  function addComment(comment: any) {
    setComments((prev) => [...prev, comment]);
  }

  // Allow parent to refetch after send
  return {
    comments,
    loading,
    setComments,
    refresh: fetchComments,
    sendError,
    addComment
  };
}

function CommentsList({ comments }: { comments: any[] }) {
  return (
    <Box>
      {comments.map((com) => (
        <ChatBubble
          key={com.id}
          message={com.text}
          isMe={com.sender_type === "applicant" || com.sender_display === "You"}
          fileUrl={com.attachment}
          timestamp={com.created_at ? new Date(com.created_at).toLocaleString() : ""}
          sender_display={com.sender_display}
        />
      ))}
    </Box>
  );
}

export const TrackProgress: React.FC = () => {
  // Tab selection
  const [tab, setTab] = useState<ApplicationType>("workVisa");
  // applications state
  const [workVisa, setWorkVisa] = useState<any[]>([]);
  const [studyVisa, setStudyVisa] = useState<any[]>([]);
  const [pilgrimage, setPilgrimage] = useState<any[]>([]);
  const [vacation, setVacation] = useState<any[]>([]);
  // loading & error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Comment add
  const [newComment, setNewComment] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [sendCommentError, setSendCommentError] = useState<string | null>(null);

  // Effect to fetch all applications
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    Promise.allSettled([
      getMyWorkVisaApplications(),
      getMyRecentSudyVisaApplicaton(),
      getPilgrimageApplications(),
      getAllVacationBookings(),
    ])
      .then((results) => {
        if (!mounted) return;
        const getList = (idx: number) =>
          (results[idx].status === "fulfilled" &&
            Array.isArray((results[idx] as PromiseFulfilledResult<any>).value.results)
            ? (results[idx] as PromiseFulfilledResult<any>).value.results
            : []);
        setWorkVisa(getList(0));
        setStudyVisa(getList(1));
        setPilgrimage(getList(2));
        setVacation(getList(3));
      })
      .catch(() => {
        if (mounted) setError("Failed to load applications. Please try again later.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-select first application in current tab
  useEffect(() => {
    let list: any[] = [];
    switch (tab) {
      case "workVisa":
        list = workVisa;
        break;
      case "studyVisa":
        list = studyVisa;
        break;
      case "pilgrimage":
        list = pilgrimage;
        break;
      case "vacation":
        list = vacation;
        break;
      default:
        list = [];
    }
    setSelectedId(list.length > 0 ? String(list[0].id) : null);
  }, [tab, workVisa, studyVisa, pilgrimage, vacation]);

  // Map applications to a common format for rendering
  function getApplicationsForTab(tab: ApplicationType) {
    switch (tab) {
      case "workVisa":
        return workVisa.map((item) => {
          const offer = item.offer || {};
          const org = offer.organization || {};
          const status = extractStatusTextWork(item.status);
          return {
            id: String(item.id),
            country: typeof offer.country === "object"
              ? offer.country?.label || offer.country?.name || JSON.stringify(offer.country)
              : offer.country || "-",
            job: offer.job_title || "-",
            organization: org.name || "-",
            status: status,
            currentStep: 0,
            appliedAt: item.submitted_at || item.created_at,
            steps: WORK_VISA_STEPS,
            type: "workVisa" as ApplicationType,
            raw: item
          };
        });

      case "studyVisa":
        return studyVisa.map((item) => {
          const status = extractStatusTextStudy(item);
          return {
            id: String(item.id),
            country: item.destination_country || item.country || "-",
            job: item.course_of_study_name || "-",
            organization: item.institution_name || "-",
            status: status,
            currentStep: 0,
            appliedAt: item.application_date || item.created_at || item.applied_at,
            steps: STUDY_VISA_STEPS,
            type: "studyVisa" as ApplicationType,
            raw: item
          };
        });

      case "pilgrimage":
        return pilgrimage.map((item) => {
          const status = item.status_name || item.status || "Draft";
          return {
            id: String(item.id),
            country: item.destination || "-",
            job: item.offer_title || "-",
            organization: "-",
            status: status,
            currentStep: 0,
            appliedAt: item.created_at || item.preferred_travel_date || item.application_date,
            steps: PILGRIMAGE_STEPS,
            type: "pilgrimage" as ApplicationType,
            raw: item
          };
        });

      case "vacation":
        return vacation.map((item) => {
          const status = item.status_name || item.status || "Draft";
          return {
            id: String(item.id),
            country: item.country || "-",
            job: item.package?.title || "-",
            organization: item.package?.organization || "-",
            status: status,
            currentStep: 0,
            appliedAt: item.created_at || item.applied_at,
            steps: VACATION_STEPS,
            type: "vacation" as ApplicationType,
            raw: item
          };
        });

      default:
        return [];
    }
  }

  const applications = getApplicationsForTab(tab);
  const selectedApp = applications.find((app) => String(app.id) === selectedId);
  // Comments real API
  const {
    comments,
    loading: loadingComments,
    refresh: refreshComments,
    sendError: commentsFetchError,
    // addComment
  } = useCommentsForApp(selectedApp ? selectedApp.id : null);

  // Comment send via API
  async function handleSendComment(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!selectedApp) return;
    if (!newComment.trim() && !uploadFile) return;
    setSendCommentError(null);
    setSending(true);
    try {
      let attachmentFileId = null;
      // If file to upload, upload first (API must support this)
      if (uploadFile) {
        // This should be a call to something like: commentsService.uploadAttachment
        // We'll check if it exists; otherwise fallback to the below dummy.
        if (typeof commentsService.uploadAttachment === "function") {
          const result = await commentsService.uploadAttachment(uploadFile);
          attachmentFileId = result?.id || result?.file || null;
        } else {
          // fallback: don't upload, skip file
        }
      }
      // Post the comment via API
      await commentsService.postComment({
        application_id: selectedApp.id,
        // Map "workVisa" to "work", "studyVisa" to "study", etc., if needed
        application_type: 
          selectedApp.type === "workVisa" ? "work"
          : selectedApp.type === "studyVisa" ? "study"
          : selectedApp.type === "pilgrimage" ? "pilgrimage"
          : selectedApp.type === "vacation" ? "vacation"
          : undefined,
        text: newComment.trim(),
        attachment: attachmentFileId,
        // in case you want to know who's sending, e.g., applicant
        sender_type: "applicant"
      });

      // Refresh chat on success (or optimistically append)
      await refreshComments();
      setNewComment("");
      setUploadFile(null);
      setSending(false);
    } catch (err: any) {
      setSendCommentError("Failed to send comment. Please try again.");
      setSending(false);
    }
  }

  // File input
  const fileInputRef = useRef<HTMLInputElement>(null);
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setUploadFile(file);
  }

  // Helper for maybe-object text rendering
  function renderMaybeObject(val: any, opts?: { phraseMax?: number }) {
    if (val == null) return "-";
    let display =
      typeof val === "object"
        ? val.label || val.name || val.term || JSON.stringify(val)
        : val;
    if (typeof display !== "string") display = `${display}`;
    const phraseMax = opts?.phraseMax ?? 16;
    return (
      <PaginatedPhrase
        phrase={display}
        maxLength={phraseMax}
      />
    );
  }

  return (
    <Box
      sx={{
        px: { xs: 1, sm: 2, md: 4 },
        py: { xs: 1, sm: 2 },
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      <CustomerPageHeader>
        <Typography variant="h4" className="font-bold mb-2">
          Track Application Progress
        </Typography>
        <Typography variant="body1" className="text-gray-700 mb-4">
          Select an application type and track your progress.
        </Typography>
      </CustomerPageHeader>

      <Box sx={{ mt: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, val) => setTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Application Types"
        >
          {TABS.map((tabObj) => (
            <Tab key={tabObj.key} value={tabObj.key} label={tabObj.label} />
          ))}
        </Tabs>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
          mt: 2,
        }}
      >
        <Card
          className="rounded-2xl shadow-md"
          sx={{
            minWidth: { xs: "100%", md: 320 },
            maxWidth: { xs: "100%", md: 350 },
            mb: { xs: 2, md: 0 },
            flexShrink: 0,
          }}
        >
          <CardContent>
            <Typography variant="h6" className="font-bold mb-2">
              Your {TABS.find((t) => t.key === tab)?.label} Applications
            </Typography>
            {loading ? (
              <Box sx={{ py: 4, width: "100%", textAlign: "center" }}>
                <CircularProgress size={32} />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <List disablePadding>
                {applications.length === 0 ? (
                  <Typography color="text.secondary" sx={{ mt: 2 }}>
                    No applications found.
                  </Typography>
                ) : (
                  applications.map((app, idx) => (
                    <React.Fragment key={app.id}>
                      <ListItem disablePadding>
                        <ListItemButton
                          selected={selectedId === app.id}
                          onClick={() => setSelectedId(app.id)}
                          sx={{
                            borderRadius: 2,
                            mb: 1,
                            alignItems: "flex-start",
                          }}
                        >
                          <ListItemText
                            primary={
                              <Stack direction="row" alignItems="center" gap={1}>
                                <span className="font-semibold">
                                  {renderMaybeObject(app.job)}
                                </span>
                                <Chip
                                  size="small"
                                  label={
                                    renderMaybeObject(app.status)
                                  }
                                  color="default"
                                  sx={{
                                    fontWeight: 500,
                                    bgcolor: "#f5ebe1",
                                    color: "#7c5a2e",
                                  }}
                                />
                              </Stack>
                            }
                            secondary={
                              <>
                                <span>
                                  {renderMaybeObject(app.country)} &middot; {renderMaybeObject(app.organization)}
                                </span>
                                <br />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Applied:{" "}
                                  {app.appliedAt
                                    ? new Date(app.appliedAt).toLocaleDateString()
                                    : "-"}
                                </Typography>
                              </>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                      {idx < applications.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                )}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Comments/Chat Card for Application */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {
            !selectedApp ? (
              <Card className="rounded-2xl shadow-md">
                <CardContent>
                  <Box sx={{ py: 4, width: "100%", textAlign: "center" }}>
                    <Typography variant="body1" color="text.secondary">
                      Select an application to view and post comments.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Card
                className="rounded-2xl shadow-md"
                sx={{
                  overflow: "visible",
                  px: { xs: 1, md: 2 },
                  maxWidth: "100%",
                  minHeight: 500,
                  display: "flex",
                  flexDirection: "column",
                  height: { md: 600, xs: 'auto' },
                  transition: "background .3s, border .2s, box-shadow .3s"
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    p: { xs: 1, md: 2 },
                  }}
                >
                  {/* Header */}
                  <Box>
                    <Typography variant="h6" className="font-bold mb-2">
                      Comments on{" "}
                      {renderMaybeObject(selectedApp.job, { phraseMax: 24 })}{" "}
                      {selectedApp.organization && selectedApp.organization !== "-" ? (
                        <>
                          at{" "}
                          {renderMaybeObject(selectedApp.organization, { phraseMax: 24 })}
                        </>
                      ) : ""}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {renderMaybeObject(selectedApp.country, { phraseMax: 20 })} &middot; Applied:{" "}
                      {selectedApp.appliedAt
                        ? new Date(selectedApp.appliedAt).toLocaleDateString()
                        : "-"}
                    </Typography>
                  </Box>

                  {/* Chat Window */}
                  <Box
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                      overflowY: "auto",
                      bgcolor: "#fafafb",
                      py: 2,
                      px: { xs: 0, md: 1.5 },
                      mt: 1,
                      mb: 2,
                    }}
                  >
                    {loadingComments ? (
                      <Box sx={{ textAlign: "center", my: 4 }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : (commentsFetchError ? (
                      <Typography variant="body2" color="error" sx={{ m: 4, textAlign: "center" }}>
                        Failed to load comments. Please try again later.
                      </Typography>
                    ) : comments.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ m: 4, textAlign: "center" }}>
                        No comments yet. Start the conversation!
                      </Typography>
                    ) : (
                      <CommentsList comments={comments} />
                    ))}
                  </Box>
                  {sendCommentError && (
                    <Alert severity="error" sx={{ mb: 1 }}>{sendCommentError}</Alert>
                  )}
                  {/* Upload and Add Comment bar */}
                  <form style={{ width: "100%" }} onSubmit={handleSendComment} autoComplete="off">
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "flex-end",
                        bgcolor: "#fcf6ee",
                        borderRadius: 2,
                        px: 1.5,
                        py: 1,
                        boxShadow: '0 1px 2px #eae5de29',
                        flexWrap: "wrap"
                      }}
                    >
                      <input
                        type="file"
                        style={{ display: "none" }}
                        ref={fileInputRef}
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                      />
                      <IconButton
                        aria-label="Attach document"
                        onClick={() => fileInputRef.current?.click()}
                        sx={{ color: uploadFile ? "#906100" : "#c4b79f" }}
                        size="large"
                        disabled={sending}
                      >
                        <AttachFileIcon />
                      </IconButton>
                      <TextField
                        sx={{ flex: 1, minWidth: 120 }}
                        size="small"
                        placeholder="Type your comment"
                        variant="outlined"
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        multiline
                        minRows={1}
                        maxRows={3}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                type="submit"
                                color="primary"
                                size="small"
                                disabled={sending || (!newComment.trim() && !uploadFile)}
                                aria-label="Send"
                              >
                                <SendIcon />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        disabled={sending}
                        inputProps={{ maxLength: 1000 }}
                      />
                      {uploadFile && (
                        <Button
                          size="small"
                          color="primary"
                          startIcon={<CloudUploadIcon />}
                          sx={{ minWidth: 0, ml: 1, fontSize: 12 }}
                          onClick={() => setUploadFile(null)}
                          disabled={sending}
                        >
                          {uploadFile.name}
                          <span style={{ marginLeft: 6, fontWeight: 400, color: "#e65733" }}>×</span>
                        </Button>
                      )}
                    </Box>
                  </form>
                  {sending && (
                    <LinearProgress color="warning" sx={{ mt: 1, borderRadius: 1 }} />
                  )}
                </CardContent>
              </Card>
            )
          }
        </Box>
      </Box>
    </Box>
  );
};

export default TrackProgress;
