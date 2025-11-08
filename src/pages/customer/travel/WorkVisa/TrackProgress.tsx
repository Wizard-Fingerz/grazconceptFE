import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import { getMyRecentSudyVisaApplicaton } from "../../../../services/studyVisa";
import { getMyWorkVisaApplications } from "../../../../services/workVisaService";
import { getPilgrimageApplications } from "../../../../services/pilgrimageServices";
import { getAllVacationBookings } from "../../../../services/vacationService";

// Steps, statusDescriptions, types, util functions, and hooks remain unchanged

const WORK_VISA_STEPS = [
  "Draft",
  "Application Received",
  "Pending Documents from Applicant",
  "Application Submitted to Employer/Agency",
  "Application on Hold",
  "Interview/Screening Scheduled",
  "Offer Letter Received",
  "Payment/Processing Fee Confirmed",
  "Work Permit/Approval in Progress",
  "Visa Application Submitted to Embassy",
  "Visa Granted",
  "Visa Denied",
  "Case Closed",
];

const VACATION_STEPS = [
  "Draft",
  "Application Received",
  "Pending Documents from Applicant",
  "Application Submitted to Travel Partner/Embassy",
  "Application on Hold",
  "Payment Confirmed",
  "Visa Application Submitted",
  "Visa Granted",
  "Visa Denied",
  "Flight Booking Confirmed",
  "Accommodation Reserved",
  "Trip in Progress",
  "Trip Completed",
  "Case Closed",
];

const STUDY_VISA_STEPS = [
  "Draft",
  "Completed",
  "Approved",
  "Rejected",
  "Received Application",
  "Pending From Student",
  "Application Submitted to the Institution",
  "Application on hold, Intake not yet open",
  "Case Closed",
  "Rejected By the institution",
  "Conditional offer Received",
  "Unconditional Offer received",
  "Payment Received",
  "Visa  granted",
  "Visa Denied",
];

const PILGRIMAGE_STEPS = [
  "Draft",
  "Application Received",
  "Pending Documents from Applicant",
  "Application Submitted to Embassy/Authority",
  "Application on Hold",
  "Payment Confirmed",
  "Visa Application Submitted",
  "Visa Granted",
  "Visa Denied",
  "Flight & Accommodation Confirmed",
  "Orientation/Briefing Completed",
  "Pilgrimage in Progress",
  "Return Completed",
  "Case Closed",
];

const statusDescriptions: Record<string, string> = {
  // ... unchanged ...
  "Draft": "Your application is in draft mode. Please review and submit.",
  "Application Received": "Your application has been received and is being reviewed.",
  "Pending Documents from Applicant": "We require additional documents from you to proceed.",
  "Application Submitted to Employer/Agency": "Your application has been submitted to the employer or agency for further processing.",
  "Application Submitted to Travel Partner/Embassy": "Your application has been sent to our travel partner or relevant embassy.",
  "Application Submitted to Embassy/Authority": "Your application has been submitted to the respective authority.",
  "Application Submitted to the Institution": "Your application has been submitted to the institution.",
  "Application on Hold": "Your application is currently on hold. Please check your email for next steps.",
  "Payment/Processing Fee Confirmed": "Your payment or processing fee has been received and confirmed.",
  "Payment Confirmed": "Your payment has been received and confirmed.",
  "Visa Application Submitted to Embassy": "Visa application has been formally submitted to the embassy.",
  "Visa Application Submitted": "Your visa application has been submitted.",
  "Interview/Screening Scheduled": "Your interview/screening has been scheduled. Please check your email for details.",
  "Offer Letter Received": "Congratulations, you have received an offer letter.",
  "Work Permit/Approval in Progress": "Your work permit or approval is being processed by authorities.",
  "Visa Granted": "Congratulations! Your visa has been granted.",
  "Visa  granted": "Congratulations! Your visa has been granted.",
  "Visa Approved": "Congratulations! Your visa has been approved.",
  "Visa Denied": "Unfortunately, your visa application has been denied.",
  "Rejected": "Unfortunately, your application was rejected.",
  "Rejected By the institution": "Unfortunately, your application was rejected by the institution.",
  "Completed": "Congratulations! The process is complete.",
  "Case Closed": "Your case has been closed.",
  "Conditional offer Received": "You have received a conditional offer.",
  "Unconditional Offer received": "You have received an unconditional offer.",
  "Payment Received": "Your payment has been received.",
  "Flight Booking Confirmed": "Your flight has been booked and confirmed.",
  "Accommodation Reserved": "Your accommodation has been reserved.",
  "Trip in Progress": "Your trip is currently in progress.",
  "Trip Completed": "Your vacation is complete. Thank you for booking with us!",
  "Flight & Accommodation Confirmed": "Both your flight and accommodation have been confirmed.",
  "Orientation/Briefing Completed": "You have completed pre-pilgrimage orientation.",
  "Pilgrimage in Progress": "Your pilgrimage is currently in progress.",
  "Return Completed": "Your pilgrimage return has been completed. Thank you.",
  "KINDLY COMPLETE YOUR APPLICATION": "Please complete your application to proceed.",
  "Received Application": "We have received your application.",
  "Pending From Student": "Pending action from student. Please check requests or update your application.",
  "Application on hold, Intake not yet open": "Application is on hold; intake has not yet opened.",
};

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

// NEW: Utility to find the furthest reached step in steps matching the current status or closest match
function findCurrentStepIndex(status: string, steps: string[]): number {
  if (!status || typeof status !== "string") {
    if (typeof status === "object" && status != null) {
      const possible = (status as Record<string, unknown>);
      status =
        (typeof possible.label === "string" && possible.label) ||
        (typeof possible.term === "string" && possible.term) ||
        (typeof possible.name === "string" && possible.name) ||
        JSON.stringify(status);
    } else {
      status = `${status}`;
    }
  }

  // Simple/exact
  let idx = steps.findIndex(
    (s) => s.toLowerCase() === status.toLowerCase()
  );
  if (idx !== -1) return idx;

  // Try contains status (for fuzzy status matching)
  idx = steps.findIndex(
    (s) =>
      status.toLowerCase().includes(s.toLowerCase()) ||
      s.toLowerCase().includes(status.toLowerCase())
  );
  if (idx !== -1) return idx;

  // Try normalized (ignore spaces)
  idx = steps.findIndex(
    (s) =>
      s.replace(/\s+/g, "").toLowerCase() ===
      status.replace(/\s+/g, "").toLowerCase()
  );
  if (idx !== -1) return idx;
  return 0;
}

// Flexbox-based responsive cards grid, highlight the status of the selected application
const StatusGrid: React.FC<{
  steps: string[];
  activeStepIdx: number | null;
  statusDescriptions: Record<string, string>;
}> = ({ steps, activeStepIdx, statusDescriptions }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        mb: 2,
        mt: 2,
      }}
    >
      {steps.map((step, idx) => {
        const isActive = activeStepIdx === idx;
        const isCompleted = activeStepIdx != null && activeStepIdx > idx;
        return (
          <Box
            key={step}
            sx={{
              flex: '1 1 320px',
              minWidth: { xs: '100%', sm: '48%', md: '31%' },
              maxWidth: { xs: '100%', sm: '48%', md: '32%' },
              boxSizing: 'border-box',
              display: 'flex',
            }}
          >
            <Card
              elevation={isActive ? 5 : 1}
              sx={{
                width: '100%',
                borderLeft: isActive
                  ? '4px solid #f5c062'
                  : isCompleted
                  ? '4px solid #409944'
                  : '4px solid #ececec',
                backgroundColor: isActive
                  ? '#fffbe7'
                  : isCompleted
                  ? '#eaf7ed'
                  : '#f6f6f7',
                mb: 0.5,
                px: 2,
                py: 1.5,
                transition: "background .2s, border .2s",
                boxShadow: isActive ? "0 0 10px #ffe08066" : undefined,
                position: "relative"
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Chip
                  label={idx + 1}
                  color={
                    isActive
                      ? "warning"
                      : isCompleted
                      ? "success"
                      : "default"
                  }
                  size="small"
                  sx={{
                    fontWeight: isActive ? 800 : 400,
                    minWidth: 26,
                    background: isActive
                      ? "#fae1a0"
                      : isCompleted
                      ? "#e2eed6"
                      : "#e6e4e0",
                    color: isActive
                      ? "#b78910"
                      : isCompleted
                      ? "#388e3c"
                      : "#b1a6a6",
                  }}
                />
                <PaginatedPhrase phrase={step} maxLength={22} sx={{ fontWeight: isActive ? 700 : 500, color: isActive ? "#c17b0b" : (isCompleted ? "#388e3c" : "#5d5b5b") }} />
                {isActive && (
                  <Tooltip title="Current Status">
                    <InfoOutlinedIcon sx={{ color: "#faad3d" }} fontSize="small" />
                  </Tooltip>
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 5, mt: 0.5 }}>
                {statusDescriptions[step as keyof typeof statusDescriptions] ?? ""}
              </Typography>
            </Card>
          </Box>
        );
      })}
    </Box>
  );
};

export const TrackProgress: React.FC = () => {
  // Tab selection
  const [tab, setTab] = useState<ApplicationType>("workVisa");

  // applications
  const [workVisa, setWorkVisa] = useState<any[]>([]);
  const [studyVisa, setStudyVisa] = useState<any[]>([]);
  const [pilgrimage, setPilgrimage] = useState<any[]>([]);
  const [vacation, setVacation] = useState<any[]>([]);

  // loading & error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // for currently displayed application
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
            country:
              typeof offer.country === "object"
                ? offer.country?.label || offer.country?.name || JSON.stringify(offer.country)
                : offer.country || "-",
            job: offer.job_title || "-",
            organization: org.name || "-",
            status: status,
            // ---- critical correction spot: use findCurrentStepIndex always, not item's field ----
            currentStep: findCurrentStepIndex(status, WORK_VISA_STEPS),
            appliedAt: item.submitted_at || item.created_at,
            steps: WORK_VISA_STEPS,
            type: "workVisa" as ApplicationType,
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
            currentStep: findCurrentStepIndex(status, STUDY_VISA_STEPS),
            appliedAt: item.application_date || item.created_at || item.applied_at,
            steps: STUDY_VISA_STEPS,
            type: "studyVisa" as ApplicationType,
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
            currentStep: findCurrentStepIndex(status, PILGRIMAGE_STEPS),
            appliedAt: item.created_at || item.preferred_travel_date || item.application_date,
            steps: PILGRIMAGE_STEPS,
            type: "pilgrimage" as ApplicationType,
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
            currentStep: findCurrentStepIndex(status, VACATION_STEPS),
            appliedAt: item.created_at || item.applied_at,
            steps: VACATION_STEPS,
            type: "vacation" as ApplicationType,
          };
        });

      default:
        return [];
    }
  }

  const applications = getApplicationsForTab(tab);
  const selectedApp = applications.find((app) => String(app.id) === selectedId);

  // Helper: string-safe render for possibly-object values
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

  // Get the steps/status list for the current selected tab
  function getCurrentCategorySteps(tab: ApplicationType): string[] {
    switch (tab) {
      case "workVisa":
        return WORK_VISA_STEPS;
      case "studyVisa":
        return STUDY_VISA_STEPS;
      case "pilgrimage":
        return PILGRIMAGE_STEPS;
      case "vacation":
        return VACATION_STEPS;
      default:
        return [];
    }
  }

  // Use the computed correct currentStep for selected application
  const currentCategorySteps = getCurrentCategorySteps(tab);
  const activeStepIdx =
    selectedApp && Array.isArray(selectedApp.steps)
      ? selectedApp.currentStep
      : null;

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
                                  color={
                                    app.currentStep === app.steps.length - 1
                                      ? "success"
                                      : "default"
                                  }
                                  sx={{
                                    fontWeight: 500,
                                    bgcolor:
                                      app.currentStep === app.steps.length - 1
                                        ? "#e6f4ea"
                                        : "#f5ebe1",
                                    color:
                                      app.currentStep === app.steps.length - 1
                                        ? "#388e3c"
                                        : "#7c5a2e",
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

        {/* Progress Details */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <Card className="rounded-2xl shadow-md">
              <CardContent>
                <Box sx={{ py: 4, width: "100%", textAlign: "center" }}>
                  <CircularProgress size={32} />
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl shadow-md"
              sx={{
                overflow: "visible",
                px: { xs: 1, md: 2 },
                maxWidth: "100%",
              }}
            >
              <CardContent>
                {/* 
                  If an application is selected, show app details
                */}
                {selectedApp ? (
                  <>
                    <Typography variant="h6" className="font-bold mb-2">
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
                  </>
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    Select an application to view its progress.
                  </Typography>
                )}

                {/* Show all statuses for the active category, with activeStepIdx highlighted */}
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle1" className="font-semibold mb-2" sx={{ mb: 2 }}>
                    {TABS.find((t) => t.key === tab)?.label} Statuses
                  </Typography>
                  <StatusGrid
                    steps={currentCategorySteps}
                    activeStepIdx={activeStepIdx}
                    statusDescriptions={statusDescriptions}
                  />
                </Box>

                {/* Show current status description as an alert if an app is selected */}
                {selectedApp && (
                  <Box sx={{ mt: 3 }}>
                    <Alert
                      severity={
                        selectedApp.currentStep === selectedApp.steps.length - 1
                          ? "success"
                          : "info"
                      }
                    >
                      {
                        (() => {
                          // Show the correct description for the status of the selected application
                          let statusValue = selectedApp.status;
                          let statusString =
                            typeof statusValue === "string"
                              ? statusValue
                              : (
                                  statusValue && (statusValue.label || statusValue.name || statusValue.term)
                                    ? statusValue.label || statusValue.name || statusValue.term
                                    : JSON.stringify(statusValue)
                                );
                          // Try to map to a normalized step if possible for more accurate lookup
                          let currentStepIndex = findCurrentStepIndex(statusString, selectedApp.steps);
                          let stepKey = selectedApp.steps[currentStepIndex] || statusString;
                          let description =
                            statusDescriptions[stepKey as keyof typeof statusDescriptions] ||
                            statusDescriptions[statusString as keyof typeof statusDescriptions];
                          if (description) return description;
                          return renderMaybeObject(selectedApp.status);
                        })()
                      }
                    </Alert>
                  </Box>
                )}

                {/* Show "Schedule Interview" button only for relevant steps for Work/Study Visa */}
                {selectedApp && ["workVisa", "studyVisa"].includes(selectedApp.type) &&
                  (
                    (selectedApp.type === "workVisa" &&
                      selectedApp.currentStep === WORK_VISA_STEPS.indexOf('Interview/Screening Scheduled')
                    )
                    ||
                    (selectedApp.type === "studyVisa" &&
                      selectedApp.currentStep === STUDY_VISA_STEPS.indexOf('Interview/Screening Scheduled')
                    ))
                  && (
                    <Box
                      sx={{
                        mt: 4,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="contained"
                        className="bg-[#f5ebe1] text-black shadow-sm rounded-xl normal-case"
                        href={
                          selectedApp.type === "workVisa"
                            ? "/travel/work-visa/schedule-interview"
                            : "/travel/study-visa/schedule-interview"
                        }
                      >
                        Schedule Interview
                      </Button>
                    </Box>
                  )}

              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TrackProgress;
