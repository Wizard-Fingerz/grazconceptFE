import React, { useState } from "react";
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
} from "@mui/material";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";

// Demo/mock applications data
const mockApplications = [
  {
    id: "1",
    country: "Canada",
    job: "Software Engineer",
    organization: "MapleTech",
    status: "Interview Completed",
    currentStep: 3,
    appliedAt: "2024-05-01",
  },
  {
    id: "2",
    country: "UK",
    job: "Healthcare Assistant",
    organization: "NHS",
    status: "CV/Document Review",
    currentStep: 1,
    appliedAt: "2024-05-10",
  },
  {
    id: "3",
    country: "Australia",
    job: "Teacher",
    organization: "Aussie Schools",
    status: "Visa Processing",
    currentStep: 4,
    appliedAt: "2024-04-20",
  },
];

const visaSteps = [
  "Application Submitted",
  "CV/Document Review",
  "Interview Scheduled",
  "Interview Completed",
  "Visa Processing",
  "Visa Approved",
];

const statusDescriptions: Record<string, string> = {
  "Application Submitted": "Your application has been received and is under review.",
  "CV/Document Review": "Our team is reviewing your CV and supporting documents.",
  "Interview Scheduled": "Your interview has been scheduled. Please check your email for details.",
  "Interview Completed": "You have completed your interview. Awaiting next steps.",
  "Visa Processing": "Your visa application is being processed by the authorities.",
  "Visa Approved": "Congratulations! Your work visa has been approved.",
};

export const TrackProgress: React.FC = () => {
  // State: selected application id
  const [selectedId, setSelectedId] = useState<string | null>(
    mockApplications.length > 0 ? mockApplications[0].id : null
  );

  const selectedApp = mockApplications.find((app) => app.id === selectedId);

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
          Select an application to view its progress and details.
        </Typography>
      </CustomerPageHeader>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
          mt: 2,
        }}
      >
        {/* Applications List */}
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
              Your Applications
            </Typography>
            <List disablePadding>
              {mockApplications.length === 0 ? (
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  No applications found.
                </Typography>
              ) : (
                mockApplications.map((app) => (
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
                              <span className="font-semibold">{app.job}</span>
                              <Chip
                                size="small"
                                label={app.status}
                                color={
                                  app.currentStep === visaSteps.length - 1
                                    ? "success"
                                    : "default"
                                }
                                sx={{
                                  fontWeight: 500,
                                  bgcolor:
                                    app.currentStep === visaSteps.length - 1
                                      ? "#e6f4ea"
                                      : "#f5ebe1",
                                  color:
                                    app.currentStep === visaSteps.length - 1
                                      ? "#388e3c"
                                      : "#7c5a2e",
                                }}
                              />
                            </Stack>
                          }
                          secondary={
                            <>
                              <span>
                                {app.country} &middot; {app.organization}
                              </span>
                              <br />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Applied: {new Date(app.appliedAt).toLocaleDateString()}
                              </Typography>
                            </>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                    {app.id !== mockApplications[mockApplications.length - 1].id && (
                      <Divider />
                    )}
                  </React.Fragment>
                ))
              )}
            </List>
          </CardContent>
        </Card>

        {/* Progress Details */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {selectedApp ? (
            <Card className="rounded-2xl shadow-md">
              <CardContent>
                <Typography variant="h6" className="font-bold mb-2">
                  {selectedApp.job} at {selectedApp.organization}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {selectedApp.country} &middot; Applied:{" "}
                  {new Date(selectedApp.appliedAt).toLocaleDateString()}
                </Typography>
                <Stepper
                  activeStep={selectedApp.currentStep}
                  alternativeLabel
                  sx={{ mb: 2 }}
                >
                  {visaSteps.map((label, idx) => (
                    <Step key={label} completed={idx < selectedApp.currentStep}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
                <Box sx={{ mt: 3 }}>
                  <Alert
                    severity={
                      selectedApp.currentStep === visaSteps.length - 1
                        ? "success"
                        : "info"
                    }
                  >
                    {statusDescriptions[visaSteps[selectedApp.currentStep]]}
                  </Alert>
                </Box>
                <Box
                  sx={{
                    mt: 4,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  {/* Show "Schedule Interview" button only if at the right step */}
                  {selectedApp.currentStep === 2 && (
                    <Button
                      variant="contained"
                      className="bg-[#f5ebe1] text-black shadow-sm rounded-xl normal-case"
                      href="/customer/travel/work-visa/schedule-interview"
                    >
                      Schedule Interview
                    </Button>
                  )}
                </Box>
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
