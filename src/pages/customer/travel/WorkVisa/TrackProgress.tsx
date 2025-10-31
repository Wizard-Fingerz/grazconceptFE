import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
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
} from "@mui/material";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import { getMyRecentSudyVisaApplicaton } from "../../../../services/studyVisa";
import { getMyWorkVisaApplications } from "../../../../services/workVisaService";
import { getPilgrimageApplications } from "../../../../services/pilgrimageServices";
import { getAllVacationBookings } from "../../../../services/vacationService";

const VISA_STEPS = [
  "Application Submitted",
  "CV/Document Review",
  "Interview Scheduled",
  "Interview Completed",
  "Visa Processing",
  "Visa Approved",
];

const PILGRIMAGE_STEPS = [
  "Application Submitted",
  "Payment Pending",
  "Payment Confirmed",
  "Document Review",
  "Pilgrimage Booked",
  "Completed",
];

const VACATION_STEPS = [
  "Booking Submitted",
  "Payment Pending",
  "Payment Confirmed",
  "Trip Scheduled",
  "Trip Completed",
];

const statusDescriptions: Record<string, string> = {
  "Application Submitted": "Your application has been received and is under review.",
  "CV/Document Review": "Our team is reviewing your CV and supporting documents.",
  "Interview Scheduled": "Your interview has been scheduled. Please check your email for details.",
  "Interview Completed": "You have completed your interview. Awaiting next steps.",
  "Visa Processing": "Your visa application is being processed by the authorities.",
  "Visa Approved": "Congratulations! Your visa has been approved.",
  "Payment Pending": "Your payment is pending. Please complete payment to proceed.",
  "Payment Confirmed": "Your payment has been received and confirmed.",
  "Document Review": "Your documents are under review.",
  "Pilgrimage Booked": "Your pilgrimage has been booked. Details will be sent by email.",
  "Completed": "Congratulations! Your pilgrimage journey is complete.",
  "Booking Submitted": "Your vacation booking has been received.",
  "Trip Scheduled": "Your trip has been scheduled. Check your email for itinerary.",
  "Trip Completed": "Your vacation is complete. Thank you for booking with us!",
  "KINDLY COMPLETE YOUR APPLICATION": "Please complete your application to proceed.",
  "Draft": "Your application is in draft mode. Please review and submit."
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

// Helper for safe status text extraction
function extractStatusTextWork(status: any) {
  if (status == null) return "Application Submitted";
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
  return item.status_name
    ? item.status_name
    : typeof item.status === "string"
      ? item.status
      : "Application Submitted";
}

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

        // Defensive: results[0] is for workVisa, [1] is for studyVisa, [2] is for pilgrimage, [3] is for vacation
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
          // item.offer (object), item.status (object), etc.
          const offer = item.offer || {};
          const org = offer.organization || {};
          return {
            id: String(item.id),
            country:
              typeof offer.country === "object"
                ? offer.country?.label || offer.country?.name || JSON.stringify(offer.country)
                : offer.country || "-",
            job:
              offer.job_title || "-",
            organization:
              org.name || "-",
            status: extractStatusTextWork(item.status),
            currentStep: getStepFromStatus(extractStatusTextWork(item.status), VISA_STEPS),
            appliedAt: item.submitted_at || item.created_at,
            steps: VISA_STEPS,
            type: "workVisa" as ApplicationType,
          };
        });

      case "studyVisa":
        return studyVisa.map((item) => {
          return {
            id: String(item.id),
            country: item.destination_country || item.country || "-",
            job: item.course_of_study_name || "-", // was offer.school_name
            organization: item.institution_name || "-",
            status: extractStatusTextStudy(item),
            currentStep: getStepFromStatus(extractStatusTextStudy(item), VISA_STEPS),
            appliedAt: item.application_date || item.created_at || item.applied_at,
            steps: VISA_STEPS,
            type: "studyVisa" as ApplicationType,
          };
        });

      case "pilgrimage":
        return pilgrimage.map((item) => ({
          id: String(item.id),
          country: item.destination || "-", // from sample, "destination"
          job: item.offer_title || "-", // "offer_title" from API
          organization: "-", // No org in sample
          status: "Application Submitted",
          currentStep: getStepFromStatus("Application Submitted", PILGRIMAGE_STEPS),
          appliedAt: item.created_at || item.preferred_travel_date || item.application_date,
          steps: PILGRIMAGE_STEPS,
          type: "pilgrimage" as ApplicationType,
        }));

      case "vacation":
        return vacation.map((item) => ({
          id: String(item.id),
          country: item.country || "-",
          job: item.package?.title || "-",
          organization: item.package?.organization || "-",
          status: item.status_name || item.status || "Booking Submitted",
          currentStep: getStepFromStatus(item.status_name || item.status, VACATION_STEPS),
          appliedAt: item.created_at || item.applied_at,
          steps: VACATION_STEPS,
          type: "vacation" as ApplicationType,
        }));

      default:
        return [];
    }
  }

  function getStepFromStatus(status: string, steps: string[]): number {
    // Accept string, number, or object and try to map status string to a step index, fallback 0
    let statusVal = status;
    if (typeof status === "object" && status !== null) {
      // Safely access label/term/name with optional chaining and type assertions
      if ((status as any)?.label !== undefined) statusVal = (status as any).label;
      else if ((status as any)?.term !== undefined) statusVal = (status as any).term;
      else if ((status as any)?.name !== undefined) statusVal = (status as any).name;
      else statusVal = JSON.stringify(status);
    }
    statusVal = statusVal === null || statusVal === undefined ? "" : statusVal;
    const idx = steps.findIndex(
      (s) => s.toLowerCase() === String(statusVal || "").toLowerCase()
    );
    return idx === -1 ? 0 : idx;
  }

  const applications = getApplicationsForTab(tab);
  const selectedApp = applications.find((app) => String(app.id) === selectedId);

  // Helper: string-safe render for possibly-object values
  function renderMaybeObject(val: any) {
    if (val == null) return "-";
    if (typeof val === "object") {
      return (
        val.label ||
        val.name ||
        val.term ||
        JSON.stringify(val)
      );
    }
    return val;
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
          ) : selectedApp ? (
            <Card className="rounded-2xl shadow-md">
              <CardContent>
                <Typography variant="h6" className="font-bold mb-2">
                  {renderMaybeObject(selectedApp.job)} {selectedApp.organization && selectedApp.organization !== "-" ? `at ${renderMaybeObject(selectedApp.organization)}` : ""}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {renderMaybeObject(selectedApp.country)} &middot; Applied:{" "}
                  {selectedApp.appliedAt
                    ? new Date(selectedApp.appliedAt).toLocaleDateString()
                    : "-"}
                </Typography>
                <Stepper
                  activeStep={selectedApp.currentStep}
                  alternativeLabel
                  sx={{ mb: 2 }}
                >
                  {selectedApp.steps.map((label: string, idx: number) => (
                    <Step key={typeof label === "string" ? label : idx} completed={idx < selectedApp.currentStep}>
                      <StepLabel>{renderMaybeObject(label)}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
                <Box sx={{ mt: 3 }}>
                  <Alert
                    severity={
                      selectedApp.currentStep === selectedApp.steps.length - 1
                        ? "success"
                        : "info"
                    }
                  >
                    {statusDescriptions[
                      typeof selectedApp.steps[selectedApp.currentStep] === "string"
                        ? selectedApp.steps[selectedApp.currentStep]
                        : renderMaybeObject(selectedApp.steps[selectedApp.currentStep])
                    ] ||
                      renderMaybeObject(selectedApp.status)}
                  </Alert>
                </Box>
                {/* Show "Schedule Interview" button only for relevant steps for Work/Study Visa */}
                {["workVisa", "studyVisa"].includes(selectedApp.type) &&
                  selectedApp.currentStep === 2 && (
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
          ) : (
            <Card className="rounded-2xl shadow-md">
              <CardContent>
                <Typography variant="body1" color="text.secondary">
                  Select an application to view its progress.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TrackProgress;
