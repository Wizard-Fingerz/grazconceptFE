import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Stepper,
    Step,
    StepLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    LinearProgress,
    Tooltip,
    // Grid removed due to deprecation
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useNavigate } from "react-router-dom";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import { CountrySelect } from "../../../../components/CountrySelect";
import { useAuth } from "../../../../context/AuthContext";

// List of jobs and sample interview resources
const availableJobs = [
    "Software Engineer",
    "Healthcare Assistant",
    "Construction Worker",
    "Hospitality Staff",
    "Teacher",
    "Driver",
    "Warehouse Operative",
    "Other",
];

const interviewTips = [
    "Research the company and country before your interview.",
    "Prepare and bring all necessary documents (passport, CV, qualifications).",
    "Dress professionally and be on time.",
    "Practice answering common interview questions.",
    "Be honest about your skills and work history.",
    "Know the next steps in your work visa process.",
];

const interviewFAQs = [
    {
        question: "Do I need to attend the interview in person?",
        answer: "Some interviews are held virtually, while others require in-person attendance. The embassy or employer will specify which.",
    },
    {
        question: "Can I reschedule my interview?",
        answer: "Most embassies and recruiters allow you to reschedule with advance notice. Contact them as soon as possible to request a new date.",
    },
    {
        question: "What documents should I bring?",
        answer: "Bring your passport, degree, proof of experience, job offer letter, visa application forms, and any documents requested in your interview invitation.",
    },
];

const steps = [
    "Fill in your details",
    "Pick a country and job",
    "Choose an interview slot",
    "Confirm & attend!"
];

// Status progress states for interviews
const PROGRESS_MAP = {
    "Scheduled": 33,
    "Attending": 67,
    "Completed": 100
};

const STATUS_COLOR = {
    "Scheduled": "info",
    "Attending": "warning",
    "Completed": "success",
};

const STATUS_LABEL = {
    "Scheduled": "Scheduled",
    "Attending": "Awaiting/Attending",
    "Completed": "Completed"
};

// Example initial interview list (historical + scheduled)
const initialInterviewList = [
    {
        date: "2024-03-02",
        time: "10:00",
        country: "Germany",
        job: "Software Engineer",
        status: "Completed"
    },
    {
        date: "2024-04-10",
        time: "14:00",
        country: "Netherlands",
        job: "Healthcare Assistant",
        status: "Scheduled"
    }
];

// For a simple status icon based on status
const getStatusIcon = (status: string) => {
    switch (status) {
        case "Scheduled":
            return <ScheduleIcon color="info" />;
        case "Completed":
            return <DoneAllIcon color="success" />;
        case "Attending":
            return <HourglassBottomIcon color="warning" />;
        default:
            return <EventAvailableIcon />;
    }
};

export const ScheduleInterview: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // Assume useAuth returns { user: { name, email, ... } }

    const getInitialForm = React.useCallback(() => {
        const fullName = [user?.first_name, user?.middle_name, user?.last_name]
            .filter(Boolean)
            .join(" ")
            .trim();
        return {
            fullName: fullName || "",
            email: user?.email || "",
            country: "",
            job: "",
            date: "",
            time: "",
        };
    }, [user?.first_name, user?.middle_name, user?.last_name, user?.email]);

    const [interviewList, setInterviewList] = useState(initialInterviewList);
    const [form, setForm] = useState(getInitialForm);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeStep, setActiveStep] = useState(0);
    const [showSummary, setShowSummary] = useState(false);
    const [openFaq, setOpenFaq] = useState<boolean>(false);
    const [openHistory, setOpenHistory] = useState<boolean>(false);

    useEffect(() => {
        const fullName = [user?.first_name, user?.middle_name, user?.last_name]
            .filter(Boolean)
            .join(" ")
            .trim();
        setForm((prev) => ({
            ...prev,
            fullName,
            email: user?.email || "",
        }));
    }, [user?.first_name, user?.middle_name, user?.last_name, user?.email]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name as string]: value,
        }));
    };

    const handleCountryChange = (value: string) => {
        setForm((prev) => ({
            ...prev,
            country: value,
        }));
    };

    const isStepValid = (step: number) => {
        switch (step) {
            case 0:
                return !!form.fullName && !!form.email;
            case 1:
                return !!form.country && !!form.job;
            case 2:
                return !!form.date && !!form.time;
            default:
                return true;
        }
    };

    const handleNext = () => {
        if (activeStep < 2) {
            if (isStepValid(activeStep)) setActiveStep((s) => s + 1);
            else setError("Please complete required fields for this step.");
        } else if (activeStep === 2) {
            setShowSummary(true);
        }
    };

    const handleBack = () => {
        setError(null);
        if (activeStep > 0) setActiveStep((s) => s - 1);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        setTimeout(() => {
            setSubmitting(false);
            setSuccess("Your interview has been scheduled! You will receive a confirmation email shortly.");
            setShowSummary(false);
            setActiveStep(0);
            setInterviewList((prevList) => [
                ...prevList,
                {
                    date: form.date,
                    time: form.time,
                    country: form.country,
                    job: form.job,
                    status: "Scheduled"
                }
            ]);
            setForm({
                fullName: user?.full_name || "",
                email: user?.email || "",
                country: "",
                job: "",
                date: "",
                time: "",
            });
        }, 1500);
    };

    const getProgress = (status: string) => {
        if (status in PROGRESS_MAP) {
            return PROGRESS_MAP[status as keyof typeof PROGRESS_MAP];
        }
        return 0;
    };

    const StatusChip: React.FC<{ status: string }> = ({ status }) => (
        <Chip
            label={STATUS_LABEL[status as keyof typeof STATUS_LABEL] || status}
            color={
                (["primary", "secondary", "success", "error", "info", "warning", "default"] as const).includes(
                    STATUS_COLOR[status as keyof typeof STATUS_COLOR] as any
                )
                    ? (STATUS_COLOR[status as keyof typeof STATUS_COLOR] as
                        | "primary"
                        | "secondary"
                        | "success"
                        | "error"
                        | "info"
                        | "warning"
                        | "default")
                    : "default"
            }
            icon={getStatusIcon(status)}
            size="small"
            sx={{ minWidth: 120, color: "#222", fontWeight: 600 }}
        />
    );

    // Responsive column arrangement using Flexbox instead of deprecated Grid
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
                <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                    Schedule Your Work Visa Interview
                </Typography>
                <Typography variant="body1" sx={{ mb: 0, color: 'text.secondary' }}>
                    Book your work visa interview in just a few steps. Use the prep resources to maximize your success!
                </Typography>
            </CustomerPageHeader>

            {/* Main responsive 2-column flex layout replacing deprecated Grid */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 4,
                    my: 0,
                    maxWidth: 1200,
                    mx: "auto",
                }}
            >
                {/* Form panel (left, majority width on desktop) */}
                <Box
                    sx={{
                        flex: { md: "0 1 58%", xs: "1 1 100%" },
                        order: { xs: 2, md: 1 },
                        minWidth: 0,
                    }}
                >
                    {/* Stepper always at top of modal, then form */}
                    <Box sx={{ maxWidth: 700, mx: "auto", mb: 3 }}>
                        <Stepper activeStep={activeStep} alternativeLabel>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>
                    <Card className="rounded-2xl shadow-md" sx={{ maxWidth: 700, mx: "auto" }}>
                        <CardContent>
                            {success && (
                                <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
                            )}
                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                            )}
                            <form autoComplete="off" onSubmit={handleSubmit}>
                                <Box display="flex" flexDirection="column" gap={2}>
                                    {/* Step 1: Personal Details */}
                                    {activeStep === 0 && (
                                        <>
                                            <TextField
                                                label="Full Name"
                                                name="fullName"
                                                value={form.fullName}
                                                onChange={handleChange}
                                                required
                                                fullWidth
                                                disabled
                                            />
                                            <TextField
                                                label="Email"
                                                name="email"
                                                type="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                required
                                                fullWidth
                                                disabled
                                            />
                                        </>
                                    )}

                                    {/* Step 2: Country & Job */}
                                    {activeStep === 1 && (
                                        <>
                                            <CountrySelect
                                                label="Country"
                                                value={form.country}
                                                onChange={(value: string | null) => handleCountryChange(value ?? "")}
                                                required
                                                fullWidth
                                            />
                                            <FormControl fullWidth required>
                                                <InputLabel>Job</InputLabel>
                                                <Select
                                                    label="Job"
                                                    name="job"
                                                    value={form.job}
                                                    onChange={(event) => {
                                                        const { name, value } = event.target;
                                                        handleChange({
                                                            target: { name, value }
                                                        } as React.ChangeEvent<HTMLInputElement>);
                                                    }}
                                                >
                                                    {availableJobs.map((job) => (
                                                        <MenuItem key={job} value={job}>
                                                            {job}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </>
                                    )}

                                    {/* Step 3: Interview Slot */}
                                    {activeStep === 2 && (
                                        <>
                                            <TextField
                                                label="Interview Date"
                                                name="date"
                                                type="date"
                                                value={form.date}
                                                onChange={handleChange}
                                                required
                                                InputLabelProps={{ shrink: true }}
                                                fullWidth
                                            />
                                            <TextField
                                                label="Interview Time"
                                                name="time"
                                                type="time"
                                                value={form.time}
                                                onChange={handleChange}
                                                required
                                                InputLabelProps={{ shrink: true }}
                                                fullWidth
                                            />
                                        </>
                                    )}

                                    <Box display="flex" gap={1} mt={2}>
                                        <Button
                                            variant="outlined"
                                            onClick={handleBack}
                                            disabled={activeStep === 0 || submitting}
                                            fullWidth
                                        >
                                            Back
                                        </Button>
                                        {activeStep < 2 ? (
                                            <Button
                                                variant="contained"
                                                onClick={handleNext}
                                                className="bg-[#f5ebe1] text-black shadow-sm rounded-xl normal-case"
                                                fullWidth
                                                disabled={submitting}
                                            >
                                                Next
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="contained"
                                                onClick={() => {
                                                    if (isStepValid(2)) setShowSummary(true);
                                                    else setError("Please pick your interview date and time.");
                                                }}
                                                className="bg-[#f5ebe1] text-black shadow-sm rounded-xl normal-case"
                                                fullWidth
                                                disabled={submitting}
                                            >
                                                Review Summary
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            </form>
                            {/* Action buttons under form */}
                            <Box display="flex" gap={2} mt={4} mb={1}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setOpenFaq(true)}
                                    startIcon={<InfoOutlinedIcon />}
                                >
                                    Interview FAQs
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => setOpenHistory(true)}
                                    startIcon={<ScheduleIcon />}
                                >
                                    Interview History
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
                {/* Side/resources panel (right) */}
                <Box
                    sx={{
                        flex: { md: "0 1 40%", xs: "1 1 100%" },
                        order: { xs: 1, md: 2 },
                        minWidth: 0,
                    }}
                >
                    <Box sx={{ maxWidth: 500, mx: "auto" }}>
                        {/* Scheduled interviews overview */}
                        <Card className="rounded-xl mb-4" sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", color: "#1665b2" }}>
                                    <ScheduleIcon sx={{ mr: 1 }} />
                                    Your Scheduled Interviews
                                </Typography>
                                {interviewList && interviewList.length > 0 ? (
                                    <List>
                                        {[...interviewList].sort((a, b) => {
                                            if (a.status === "Completed" && b.status !== "Completed") return 1;
                                            if (a.status !== "Completed" && b.status === "Completed") return -1;
                                            if (a.date !== b.date) return a.date < b.date ? -1 : 1;
                                            if (a.time && b.time && a.time !== b.time) return a.time < b.time ? -1 : 1;
                                            return 0;
                                        }).slice(0, 3).map((iv, i) => (
                                            <ListItem key={i} alignItems="flex-start" sx={{ flexDirection: "column", alignItems: "stretch", mb: 1 }}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight={600}>
                                                            {iv.country} – {iv.job}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {iv.date} at {iv.time}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <StatusChip status={iv.status} />
                                                    </Box>
                                                </Box>
                                                <Box mt={1}>
                                                    <Tooltip title={iv.status === "Completed" ? "Interview process completed" : "In progress"}>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={getProgress(iv.status)}
                                                            color={
                                                                iv.status === "Completed"
                                                                    ? "success"
                                                                    : iv.status === "Attending"
                                                                        ? "warning"
                                                                        : "info"
                                                            }
                                                            sx={{
                                                                height: 7,
                                                                borderRadius: 2,
                                                                background: "#f7f7f7",
                                                                my: 0.5
                                                            }}
                                                        />
                                                    </Tooltip>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Progress: {getProgress(iv.status)}%
                                                    </Typography>
                                                </Box>
                                            </ListItem>
                                        ))}
                                        {interviewList.length > 3 && (
                                            <ListItem>
                                                <Button variant="text" size="small" onClick={() => setOpenHistory(true)} sx={{ px: 0 }}>Show all...</Button>
                                            </ListItem>
                                        )}
                                    </List>
                                ) : (
                                    <Typography sx={{ py: 1, px: 2 }} color="text.secondary">
                                        No interviews scheduled yet.
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                        {/* Tips */}
                        <Card className="rounded-xl shadow-sm mb-4">
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 1, display: "flex", alignItems: "center" }}>
                                    <InfoOutlinedIcon sx={{ mr: 1, color: "#ec9706" }} /> Interview Preparation Tips
                                </Typography>
                                <List dense sx={{ pl: 1 }}>
                                    {interviewTips.map((tip, idx) => (
                                        <ListItem key={idx} sx={{ pb: 0.5 }}>
                                            <ListItemIcon sx={{ minWidth: 26 }}>
                                                <CheckCircleIcon color="success" fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText primary={tip} sx={{ my: 0 }} />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </Box>

            {/* Dialogs for summary, FAQs, and history (remain global) */}
            {/* History Dialog */}
            <Dialog open={openHistory} onClose={() => setOpenHistory(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Past & Upcoming Interviews</DialogTitle>
                <DialogContent>
                    {interviewList.length === 0 ? (
                        <Typography>No interview records found.</Typography>
                    ) : (
                        <List>
                            {interviewList.map((entry, i) => (
                                <ListItem key={i}>
                                    <ListItemText
                                        primary={`${entry.country} – ${entry.job}`}
                                        secondary={`On ${entry.date} at ${entry.time} (${entry.status})`}
                                    />
                                    <StatusChip status={entry.status} />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenHistory(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* FAQs Dialog */}
            <Dialog open={openFaq} onClose={() => setOpenFaq(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Interview FAQs</DialogTitle>
                <DialogContent>
                    {interviewFAQs.map((faq, i) => (
                        <Box key={i} mb={3}>
                            <Typography fontWeight={600}>{faq.question}</Typography>
                            <Typography variant="body2">{faq.answer}</Typography>
                        </Box>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenFaq(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Summary Dialog */}
            <Dialog open={showSummary} onClose={() => setShowSummary(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Confirm Interview Details</DialogTitle>
                <DialogContent>
                    <List>
                        <ListItem>
                            <ListItemText
                                primary="Full Name"
                                secondary={
                                    [form.fullName,]
                                        .filter(Boolean)
                                        .join(" ") || "-"
                                }
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Email" secondary={form.email || "-"} />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Country" secondary={form.country || "-"} />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Job" secondary={form.job || "-"} />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Interview Date" secondary={form.date || "-"} />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Interview Time" secondary={form.time || "-"} />
                        </ListItem>
                    </List>
                    {submitting && (
                        <Box textAlign="center" mt={2}>
                            <CircularProgress />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowSummary(false)} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        className="bg-[#f5ebe1] text-black shadow-sm rounded-xl normal-case"
                        disabled={submitting}
                    >
                        Confirm & Schedule
                    </Button>
                </DialogActions>
            </Dialog>

            <Box mt={3} textAlign="center">
                <Button
                    variant="text"
                    onClick={() => navigate("/travel/work-visa")}
                    sx={{ textTransform: "none" }}
                >
                    &larr; Back to Work Visa Home
                </Button>
            </Box>
        </Box>
    );
};

export default ScheduleInterview;
