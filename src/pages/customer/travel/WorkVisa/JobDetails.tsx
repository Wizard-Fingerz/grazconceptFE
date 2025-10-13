import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Paper,
  Divider,
  Button,
  TextField,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  Stack,
  FormControlLabel,
  Checkbox,
  Chip,
  Link,
  Breadcrumbs
} from "@mui/material";
import { useAuth } from "../../../../context/AuthContext";
import api from "../../../../services/api";

// *** Toasts ***
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { type AlertProps } from "@mui/material/Alert";

// Alert component for Snackbar/Toast
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const FORM_STEPS = [
  {
    label: "Personal Information",
    fields: [
      "applicant",
      "passport_number",
      "country",
      "passport_expiry_date",
    ],
  },
  {
    label: "Job Background",
    fields: [
      "highest_degree",
      "years_of_experience",
      "previous_employer",
      "previous_job_title",
      "year_left_previous_job",
    ],
  },
  {
    label: "Work Visa Details",
    fields: [
      "intended_start_date",
      "intended_end_date",
      "visa_type",
      "sponsorship_details",
    ],
  },
  {
    label: "Document Uploads",
    fields: [
      "passport_photo",
      "international_passport",
      "updated_resume",
      "reference_letter",
      "employment_letter",
      "financial_statement",
      "english_proficiency_test",
    ],
  },
  {
    label: "Additional Information",
    fields: [
      "previous_visa_applications",
      "previous_visa_details",
      "travel_history",
      "emergency_contact_name",
      "emergency_contact_relationship",
      "emergency_contact_phone",
      "statement_of_purpose",
    ],
  },
];

// Reuse live description
function renderDescriptionLive(text: string) {
  if (!text) return null;
  const paragraphs = text.split(/\r?\n\r?\n/);
  return paragraphs.map((para, idx) => (
    <Typography
      key={idx}
      variant="body1"
      className="mb-2"
      component="div"
      sx={{ whiteSpace: "pre-line" }}
    >
      {para.split(/\r?\n/).map((line, lidx, arr) =>
        lidx < arr.length - 1 ? (
          <React.Fragment key={lidx}>
            {line}
            <br />
          </React.Fragment>
        ) : (
          line
        )
      )}
    </Typography>
  ));
}

// Helper to prettify status, draft, submitted, etc.
function prettyStatus(status: any) {
  if (!status) return "Submitted";
  if (typeof status === "string") return status.charAt(0).toUpperCase() + status.slice(1);
  if (typeof status === "object" && status.term)
    return status.term.charAt(0).toUpperCase() + status.term.slice(1);
  return String(status);
}

// Format a value or show fallback
function formatValue(val: any) {
  if (val === null || val === undefined || String(val).trim() === "") return <em>Not Provided</em>;
  return val;
}

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Compose full name from user details
  const getUserFullName = () => {
    if (!user) return "";
    const first = user.first_name || "";
    const middle = user.middle_name || "";
    const last = user.last_name || "";
    if (first || middle || last) {
      return [first, middle, last].filter(Boolean).join(" ").trim();
    }
    return user.email || "";
  };

  const [form, setForm] = useState({
    applicant: getUserFullName(),
    passport_number: "",
    country: "",
    passport_expiry_date: "",
    highest_degree: "",
    years_of_experience: "",
    previous_employer: "",
    previous_job_title: "",
    year_left_previous_job: "",
    intended_start_date: "",
    intended_end_date: "",
    visa_type: "",
    sponsorship_details: "",
    passport_photo: null as File | null,
    international_passport: null as File | null,
    updated_resume: null as File | null,
    reference_letter: null as File | null,
    employment_letter: null as File | null,
    financial_statement: null as File | null,
    english_proficiency_test: null as File | null,
    previous_visa_applications: false,
    previous_visa_details: "",
    travel_history: "",
    emergency_contact_name: "",
    emergency_contact_relationship: "",
    emergency_contact_phone: "",
    statement_of_purpose: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // NOTE: We remove submitSuccess from here, so we do not keep internal state of submitSuccess.
  // const [submitSuccess, setSubmitSuccess] = useState(false); // Removed

  const [activeStep, setActiveStep] = useState(0);
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Track work visa application(s)
  // Removed the unused existingApplications state
  // const [existingApplications, setExistingApplications] = useState<any[]>([]);
  const [latestApplication, setLatestApplication] = useState<any>(null);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);

  // For live description typing effect
  const [liveDescription, setLiveDescription] = useState<string>("");
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "info" | "warning" | "error">("info");

  // Fetch job offer
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    api
      .get(`/app/work-visa-offers/${id}/`)
      .then((res) => {
        setOffer(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load job details.");
        setLoading(false);
      });
  }, [id]);

  // Set full name if user changes
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      applicant: getUserFullName(),
    }));
    // eslint-disable-next-line
  }, [user]);

  // Check if user has already applied for this offer
  useEffect(() => {
    if (!id || !user) {
      // Removed setExistingApplications([])
      setLatestApplication(null);
      return;
    }
    setApplicationLoading(true);
    setApplicationError(null);

    api
      .get("/app/work-visa-application/", {
        params: { offer_id: id },
      })
      .then((res) => {
        const results = Array.isArray(res.data?.results)
          ? res.data.results
          : Array.isArray(res.data)
          ? res.data
          : [];

        // Filter by matching user's client or applicant (best effort)
        let matches = results.filter(
          (a: any) =>
            (a?.client === user.id) ||
            (a?.applicant &&
              getUserFullName() &&
              String(a.applicant).toLowerCase().trim() ===
                getUserFullName().toLowerCase().trim())
        );

        matches = matches.sort((a: any, b: any) => {
          if (a.submitted_at && b.submitted_at) {
            return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
          }
          return (b.id || 0) - (a.id || 0);
        });

        // Removed setExistingApplications(matches);
        setLatestApplication(matches[0] || null);
        setApplicationLoading(false);
      })
      .catch(() => {
        // Removed setExistingApplications([]);
        setLatestApplication(null);
        setApplicationError("Could not determine application status.");
        setApplicationLoading(false);
      });
    // eslint-disable-next-line
  }, [id, user]);

  // Compose visible form fields
  const formFields = [
    { name: "applicant", label: "Full Name", type: "text", required: true },
    { name: "passport_number", label: "Passport Number", type: "text", required: true },
    { name: "country", label: "Country of Citizenship", type: "text", required: true },
    { name: "passport_expiry_date", label: "Passport Expiry Date", type: "date", required: true },
    { name: "highest_degree", label: "Highest Degree", type: "text", required: true },
    { name: "years_of_experience", label: "Years of Experience", type: "number", required: true },
    { name: "previous_employer", label: "Previous Employer", type: "text", required: false },
    { name: "previous_job_title", label: "Previous Job Title", type: "text", required: false },
    { name: "year_left_previous_job", label: "Year Left Previous Job", type: "number", required: false },
    { name: "intended_start_date", label: "Intended Start Date", type: "date", required: true },
    { name: "intended_end_date", label: "Intended End Date", type: "date", required: true },
    { name: "visa_type", label: "Visa Type", type: "text", required: true },
    { name: "sponsorship_details", label: "Sponsorship Details", type: "text", required: false },
    { name: "passport_photo", label: "Passport Photo", type: "file", required: true },
    { name: "international_passport", label: "International Passport", type: "file", required: true },
    { name: "updated_resume", label: "Updated Resume", type: "file", required: true },
    { name: "reference_letter", label: "Reference Letter", type: "file", required: false },
    { name: "employment_letter", label: "Employment Letter", type: "file", required: false },
    { name: "financial_statement", label: "Financial Statement", type: "file", required: false },
    { name: "english_proficiency_test", label: "English Proficiency Test", type: "file", required: false },
    { name: "previous_visa_applications", label: "Previous Visa Applications", type: "boolean", required: false },
    { name: "previous_visa_details", label: "Previous Visa Details", type: "text", required: false },
    { name: "travel_history", label: "Travel History", type: "text", required: false },
    { name: "emergency_contact_name", label: "Emergency Contact Name", type: "text", required: true },
    { name: "emergency_contact_relationship", label: "Emergency Contact Relationship", type: "text", required: true },
    { name: "emergency_contact_phone", label: "Emergency Contact Phone", type: "text", required: true },
    { name: "statement_of_purpose", label: "Statement of Purpose", type: "textarea", required: true },
  ];

  // Remove fields not for input
  const visibleFormFields = formFields.filter((field) => {
    const forbidden = [
      "id", "work_visa_offer", "employer", "job_title", "location",
      "status", "notes", "application_date", "is_submitted", "submitted_at"
    ];
    if (forbidden.includes(field.name)) return false;
    const present = offer && (offer[field.name] || (offer.employer && offer.employer[field.name]));
    if (present) return false;
    return true;
  });
  const visibleFormFieldsMap = Object.fromEntries(
    visibleFormFields.map((f) => [f.name, f])
  );
  // Group fields into visible steps
  const visibleSteps = FORM_STEPS.map((step) => ({
    ...step,
    fields: step.fields.filter((fname) => visibleFormFieldsMap[fname]),
  })).filter((step) => step.fields.length > 0);

  // Form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, files, checked } = e.target as any;
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));

    if (name === "applicant") return;

    if (type === "number") {
      setForm((prev) => ({
        ...prev,
        [name]: value === "" ? "" : value,
      }));
    } else if (type === "file") {
      setForm((prev) => ({
        ...prev,
        [name]: files && files.length > 0 ? files[0] : null,
      }));
    } else if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const isStepValid = () => {
    const stepFields = visibleSteps[activeStep]?.fields || [];
    return stepFields.every((fname) => {
      const field = visibleFormFieldsMap[fname];
      if (!field) return true;
      if (!field.required) return true;
      if (field.type === "file") return !!form[fname as keyof typeof form];
      if (fname === "applicant") return !!getUserFullName();
      if (field.type === "boolean") return true;
      // For number/integer fields, ensure entry is a number and not empty
      if (field.type === "number") {
        const val = form[fname as keyof typeof form];
        if (field.required) return String(val).trim().length > 0 && !isNaN(Number(val));
        return true;
      }
      return String(form[fname as keyof typeof form]).trim().length > 0;
    });
  };

  const handleNext = () => {
    setFormErrors({});
    if (activeStep < visibleSteps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setFormErrors({});
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleToastClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setToastOpen(false);
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // No need to manage submitSuccess state variable, so we remove setSubmitSuccess.
    setFormErrors({});

    try {
      const formData = new FormData();
      for (const key in form) {
        if (Object.prototype.hasOwnProperty.call(form, key)) {
          if (visibleFormFields.find((f) => f.name === key)) {
            if (key === "applicant") continue;
            if (key === "previous_visa_applications") {
              formData.append(key, form[key] ? "true" : "false");
              continue;
            }
            // convert numeric fields as numbers, else ""
            const numericFields = ["years_of_experience", "year_left_previous_job"];
            if (numericFields.includes(key)) {
              const val = form[key as keyof typeof form];
              formData.append(key, val !== "" ? String(Number(val)) : "");
              continue;
            }

            if (form[key as keyof typeof form] instanceof File) {
              if (form[key as keyof typeof form]) {
                formData.append(key, form[key as keyof typeof form] as File);
              }
            } else {
              const value = form[key as keyof typeof form];
              if (typeof value === "boolean") {
                formData.append(key, value ? "true" : "false");
              } else if (value === null || value === undefined) {
                formData.append(key, "");
              } else {
                formData.append(key, String(value));
              }
            }
          }
        }
      }
      // Required: use `offer_id` for the offer reference field
      formData.append("offer_id", id as string);

      await api.post("/app/work-visa-application/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setToastMessage("Application submitted successfully!");
      setToastSeverity("success");
      setToastOpen(true);
      setForm({
        applicant: getUserFullName(),
        passport_number: "",
        country: "",
        passport_expiry_date: "",
        highest_degree: "",
        years_of_experience: "",
        previous_employer: "",
        previous_job_title: "",
        year_left_previous_job: "",
        intended_start_date: "",
        intended_end_date: "",
        visa_type: "",
        sponsorship_details: "",
        passport_photo: null,
        international_passport: null,
        updated_resume: null,
        reference_letter: null,
        employment_letter: null,
        financial_statement: null,
        english_proficiency_test: null,
        previous_visa_applications: false,
        previous_visa_details: "",
        travel_history: "",
        emergency_contact_name: "",
        emergency_contact_relationship: "",
        emergency_contact_phone: "",
        statement_of_purpose: "",
      });
      setActiveStep(0);

      // After successful submission, trigger a refetch to show status view
      // Directly update latestApplication to reflect submission and show "application submitted" UI
      setLatestApplication({
        ...form,
        status: "Submitted",
        submitted_at: new Date().toISOString(),
      });

      // In background, fire actual refetch to update with backend's canonical data
      setTimeout(() => {
        setApplicationLoading(true);
        api
          .get("/app/work-visa-application/", { params: { offer_id: id } })
          .then((res) => {
            const results = Array.isArray(res.data?.results)
              ? res.data.results
              : Array.isArray(res.data)
              ? res.data
              : [];
            let matches = results.filter(
              (a: any) =>
                (user && a?.client === user.id) ||
                (
                  a?.applicant &&
                  getUserFullName() &&
                  String(a.applicant).toLowerCase().trim() ===
                    getUserFullName().toLowerCase().trim()
                )
            );

            matches = matches.sort((a: any, b: any) => {
              if (a.submitted_at && b.submitted_at) {
                return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
              }
              return (b.id || 0) - (a.id || 0);
            });

            // Only update latestApplication, do not use existingApplications
            setLatestApplication(matches[0] || null);
            setApplicationLoading(false);
          })
          .catch(() => {
            setLatestApplication(null);
            setApplicationLoading(false);
          });
      }, 1600);
    } catch (err: any) {
      if (err?.response?.data) {
        const serverErrors = err.response.data;
        const mappedErrors: { [key: string]: string } = {};

        for (const field in serverErrors) {
          if (Array.isArray(serverErrors[field]) && serverErrors[field][0]) {
            mappedErrors[field] = serverErrors[field][0];
          }
        }
        setFormErrors(mappedErrors);

        if (serverErrors["offer_id"]) {
          setToastMessage("This field is required.");
        } else {
          setToastMessage("Submission failed. Please correct highlighted fields.");
        }
        setToastSeverity("error");
        setToastOpen(true);
      } else {
        setToastMessage("Submission failed. Please try again.");
        setToastSeverity("error");
        setToastOpen(true);
      }
    }
    setSubmitting(false);
  };

  // Live description typing effect
  useEffect(() => {
    if (!offer) {
      setLiveDescription("");
      return;
    }
    const desc: string = offer.description || offer.job_description || "";
    if (!desc) {
      setLiveDescription("");
      return;
    }
    if (liveDescription === desc) return;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    let currentLength = liveDescription.length;
    const typeNext = () => {
      if (currentLength < desc.length) {
        setLiveDescription(desc.slice(0, currentLength + 1));
        currentLength++;
        typingTimeoutRef.current = setTimeout(typeNext, 6);
      }
    };
    typeNext();
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
    // eslint-disable-next-line
  }, [offer, offer?.description, offer?.job_description]);

  if (loading || applicationLoading) {
    return (
      <Box className="flex items-center justify-center min-h-[300px]">
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box className="flex items-center justify-center min-h-[300px]">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  if (!offer) {
    return (
      <Box className="flex items-center justify-center min-h-[300px]">
        <Typography>No job details found.</Typography>
      </Box>
    );
  }

  // Specialized parsing of requirements for new API structure
  const requirements: string[] =
    Array.isArray(offer.requirements) && offer.requirements.length
      ? offer.requirements.map((r: any) => r.description || "")
      : [];

  const org =
    offer.organization ||
    (typeof offer.employer === "object" && offer.employer) ||
    {};

  const salary =
    offer.salary !== undefined && offer.salary !== null
      ? `${offer.currency || "USD"} ${Number(offer.salary).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "N/A";

  const startDate = offer.start_date
    ? new Date(offer.start_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";
  const endDate = offer.end_date
    ? new Date(offer.end_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const jobTitle = offer.job_title || "Work Visa Job";
  const orgName = org.name || offer.employer || offer.company_name || "Employer";
  const location = (org.city && org.country)
    ? `${org.city}, ${org.country}`
    : offer.city && offer.country
    ? `${offer.city}, ${offer.country}`
    : offer.location ||
      (typeof offer.employer === "object" && offer.employer.location) ||
      "N/A";

  const createdAt = offer.created_at
    ? new Date(offer.created_at).toLocaleString()
    : undefined;
  const updatedAt = offer.updated_at
    ? new Date(offer.updated_at).toLocaleString()
    : undefined;

  // No company logo or images API in provided sample (leave blank, fallback)
  const images: string[] = [];
  const employerLogo = null;

  // -- Render Application Status/Details if already applied --
  function renderApplicationDetails(app: any) {
    if (!app) return null;
    // Gather application fields (all keys except offer, id, client, status objects)
    // Show a summary card with main fields, plus links to uploaded files
    const summaryFields: { key: string; label: string; render?: (val: any) => React.ReactNode }[] = [
      { key: "applicant", label: "Applicant" },
      { key: "passport_number", label: "Passport Number" },
      { key: "country", label: "Country of Citizenship" },
      { key: "passport_expiry_date", label: "Passport Expiry Date" },
      { key: "highest_degree", label: "Highest Degree" },
      { key: "years_of_experience", label: "Years of Experience" },
      { key: "previous_employer", label: "Previous Employer" },
      { key: "previous_job_title", label: "Previous Job Title" },
      { key: "year_left_previous_job", label: "Year Left Previous Job" },
      { key: "intended_start_date", label: "Intended Start Date" },
      { key: "intended_end_date", label: "Intended End Date" },
      { key: "visa_type", label: "Visa Type" },
      { key: "sponsorship_details", label: "Sponsorship Details" },
      { key: "previous_visa_applications", label: "Has Previous Visa Applications?", render: (v) => String(v) },
      { key: "previous_visa_details", label: "Previous Visa Details" },
      { key: "travel_history", label: "Travel History" },
      { key: "emergency_contact_name", label: "Emergency Contact Name" },
      { key: "emergency_contact_relationship", label: "Emergency Contact Relationship" },
      { key: "emergency_contact_phone", label: "Emergency Contact Phone" },
      { key: "statement_of_purpose", label: "Statement of Purpose" },
      // File fields
      { key: "passport_photo", label: "Passport Photo", render: (url) => url ? <Link href={url} target="_blank" rel="noopener noreferrer" underline="hover">View</Link> : <em>Not Uploaded</em> },
      { key: "international_passport", label: "International Passport", render: (url) => url ? <Link href={url} target="_blank" rel="noopener noreferrer" underline="hover">View</Link> : <em>Not Uploaded</em> },
      { key: "updated_resume", label: "Resume", render: (url) => url ? <Link href={url} target="_blank" rel="noopener noreferrer" underline="hover">View</Link> : <em>Not Uploaded</em> },
      { key: "reference_letter", label: "Reference Letter", render: (url) => url ? <Link href={url} target="_blank" rel="noopener noreferrer" underline="hover">View</Link> : <em>Not Uploaded</em> },
      { key: "employment_letter", label: "Employment Letter", render: (url) => url ? <Link href={url} target="_blank" rel="noopener noreferrer" underline="hover">View</Link> : <em>Not Uploaded</em> },
      { key: "financial_statement", label: "Financial Statement", render: (url) => url ? <Link href={url} target="_blank" rel="noopener noreferrer" underline="hover">View</Link> : <em>Not Uploaded</em> },
      { key: "english_proficiency_test", label: "English Proficiency Test", render: (url) => url ? <Link href={url} target="_blank" rel="noopener noreferrer" underline="hover">View</Link> : <em>Not Uploaded</em> },
    ];

    // Format status chip color
    const mainStatus = prettyStatus(app.status);

    let chipColor: "success" | "error" | "info" | "warning" = "info";
    if (mainStatus.toLowerCase() === "approved") chipColor = "success";
    else if (mainStatus.toLowerCase() === "rejected") chipColor = "error";
    else if (mainStatus.toLowerCase() === "draft") chipColor = "info";
    else if (mainStatus.toLowerCase() === "under review") chipColor = "warning";

    const submittedAt = app.submitted_at
      ? new Date(app.submitted_at).toLocaleString()
      : app.application_date
      ? new Date(app.application_date).toLocaleString()
      : "";

    // Admin note field (renamed in sample as admin_note)
    const notes = app.admin_note || app.notes;

    return (
      <Box
        sx={{
          flex: 1,
          alignSelf: "flex-start",
          bgcolor: "#fff",
          borderRadius: 3,
          boxShadow: 2,
          p: 3,
          width: "100%",
          minWidth: 0,
        }}
      >
        <Typography variant="h6" className="font-bold mb-2">
          Your Application Details
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Chip
            label={`Status: ${mainStatus}`}
            color={chipColor}
            sx={{ fontWeight: 500, mb: 1 }}
            variant="outlined"
          />
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Submitted:</strong> {submittedAt || "Unknown"}
          </Typography>
          {notes && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Notes:</strong>{" "}
              {notes}
            </Typography>
          )}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" sx={{ mb: 2 }}>
          Your application for this work visa job has been{" "}
          {mainStatus === "Approved"
            ? "approved."
            : mainStatus === "Rejected"
            ? "rejected."
            : mainStatus === "Draft"
            ? "saved as a draft and not yet finalized."
            : mainStatus === "Submitted"
            ? "submitted and is currently under review."
            : `marked as "${mainStatus}".`}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Application Overview
        </Typography>
        <Box component="dl" sx={{ mb: 0 }}>
          {summaryFields.map(({ key, label, render }) =>
            app.hasOwnProperty(key) ? (
              <Box key={key} sx={{ mb: 1.1, display: "flex" }}>
                <Typography
                  variant="subtitle2"
                  component="dt"
                  sx={{ minWidth: 150, fontWeight: 500 }}
                >
                  {label}:
                </Typography>
                <Typography
                  variant="body2"
                  component="dd"
                  sx={{ ml: 1 }}
                >
                  {render
                    ? render(app[key])
                    : formatValue(app[key])}
                </Typography>
              </Box>
            ) : null
          )}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">
          If you need to amend your application or provide more information, please contact support.
        </Typography>
      </Box>
    );
  }

  // ----------- Main Render -----------
  return (
    <>
      <Snackbar
        open={toastOpen}
        autoHideDuration={6000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleToastClose} severity={toastSeverity} sx={{ width: "100%" }}>
          {toastMessage}
        </Alert>
      </Snackbar>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          px: { xs: 1, sm: 2, md: 4 },
          py: { xs: 2, md: 4 },
          mx: "auto",
        }}
      >
        {/* Breadcrumb / Navigation Section */}
        <Box sx={{ mb: 2 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
            <Link
              color="inherit"
              component="button"
              underline="hover"
              onClick={() => navigate(-1)}
              sx={{
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Back
            </Link>
            <Typography color="text.primary">
              Job Details
            </Typography>
          </Breadcrumbs>
        </Box>
        {/* Main Details & Application - restore flex row */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
          }}
        >
          {/* Main Details Section */}
          <Box sx={{ flex: 2, minWidth: 0 }}>
            <Card className="mb-4 rounded-2xl shadow-md">
              <CardContent>
                <Box className="flex items-center gap-4 mb-4">
                  {employerLogo && (
                    <CardMedia
                      component="img"
                      image={employerLogo}
                      alt="Company Logo"
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 2,
                        objectFit: "contain",
                        bgcolor: "#f5f5f5",
                      }}
                    />
                  )}
                  <Box>
                    <Typography variant="h5" className="font-bold">
                      {orgName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {location}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h6" className="font-semibold mb-2">
                  {jobTitle}
                </Typography>
                {/* Render the description as it is being typed */}
                <Box className="mb-2">
                  {liveDescription
                    ? renderDescriptionLive(liveDescription)
                    : (
                      <Typography variant="body1" color="text.secondary">
                        No description available.
                      </Typography>
                    )
                  }
                </Box>
                <Divider sx={{ my: 2 }} />

                <Stack
                  direction="row"
                  flexWrap="wrap"
                  spacing={1}
                  useFlexGap
                  sx={{ mb: 2 }}
                >
                  <Box sx={{ flex: "1 1 300px", minWidth: 0, maxWidth: { xs: "100%", sm: "50%", md: "33.33%" }, mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Salary
                    </Typography>
                    <Typography variant="body2">{salary}</Typography>
                  </Box>
                  <Box sx={{ flex: "1 1 300px", minWidth: 0, maxWidth: { xs: "100%", sm: "50%", md: "33.33%" }, mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Start Date
                    </Typography>
                    <Typography variant="body2">{startDate}</Typography>
                  </Box>
                  <Box sx={{ flex: "1 1 300px", minWidth: 0, maxWidth: { xs: "100%", sm: "50%", md: "33.33%" }, mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      End Date
                    </Typography>
                    <Typography variant="body2">{endDate}</Typography>
                  </Box>
                  <Box sx={{ flex: "1 1 300px", minWidth: 0, maxWidth: { xs: "100%", sm: "50%", md: "33.33%" }, mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body2">{createdAt || "N/A"}</Typography>
                  </Box>
                  <Box sx={{ flex: "1 1 300px", minWidth: 0, maxWidth: { xs: "100%", sm: "50%", md: "33.33%" }, mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Updated At
                    </Typography>
                    <Typography variant="body2">{updatedAt || "N/A"}</Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" className="font-semibold mb-1">
                  Requirements
                </Typography>
                {requirements && requirements.length > 0 ? (
                  <ul className="list-disc pl-6">
                    {requirements.map((req, idx) => (
                      <li key={idx}>
                        <Typography variant="body2">{req}</Typography>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No specific requirements listed.
                  </Typography>
                )}
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" className="font-semibold mb-1">
                  Company Images
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
                  {images.length > 0 ? (
                    images.map((img: string, idx: number) => (
                      <CardMedia
                        key={idx}
                        component="img"
                        image={img}
                        alt={`Company Image ${idx + 1}`}
                        sx={{
                          width: 120,
                          height: 80,
                          borderRadius: 2,
                          objectFit: "cover",
                          bgcolor: "#f5f5f5",
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No images available.
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
            {/* Additional details can go here */}
            <Paper className="p-4 mt-4" elevation={0} sx={{ bgcolor: "#f9f9f9" }}>
              <Typography variant="subtitle1" className="font-semibold mb-1">
                More about the Employer
              </Typography>
              <Typography variant="body2">
                {(org && (org.description || org.registration_number || org.address)) ||
                  "No additional information provided."}
              </Typography>
            </Paper>
          </Box>

          {/* Application Form/Status Section */}
          {applicationError && (
            <Box
              sx={{
                flex: 1,
                alignSelf: "flex-start",
                bgcolor: "#fff",
                borderRadius: 3,
                boxShadow: 2,
                p: 3,
              }}
            >
              <Typography color="error" sx={{ mb: 2 }}>
                {applicationError}
              </Typography>
            </Box>
          )}

          {/* If user has already applied, show application details instead of form */}
          {!applicationError && latestApplication ? (
            renderApplicationDetails(latestApplication)
          ) : (
            <Box
              sx={{
                flex: 1,
                alignSelf: "flex-start",
                bgcolor: "#fff",
                borderRadius: 3,
                boxShadow: 2,
                p: 3,
              }}
            >
              <Typography variant="h6" className="font-bold mb-2">
                Apply for this Job
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mb-3">
                Fill in your details to start your application for this work visa job.
              </Typography>
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2 }}>
                {visibleSteps.map((step, idx) => (
                  <Step key={step.label} completed={activeStep > idx}>
                    <StepLabel
                      sx={{
                        '& .MuiStepLabel-label': {
                          fontSize: '0.7rem',
                        },
                      }}
                    >
                      {step.label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
              <form
                onSubmit={handleApplicationSubmit}
                encType="multipart/form-data"
                autoComplete="off"
              >
                {visibleSteps[activeStep]?.fields.map((fname) => {
                  const field = visibleFormFieldsMap[fname];
                  if (!field) return null;
                  let errorMsg = formErrors[fname];

                  if (field.type === "textarea") {
                    return (
                      <TextField
                        key={field.name}
                        name={field.name}
                        label={field.label}
                        value={form[field.name as keyof typeof form] as string}
                        onChange={handleInputChange}
                        fullWidth
                        required={field.required}
                        margin="normal"
                        multiline
                        minRows={4}
                        error={!!errorMsg}
                        helperText={errorMsg}
                      />
                    );
                  }
                  if (field.type === "file") {
                    return (
                      <Box key={field.name} sx={{ my: 1 }}>
                        <InputLabel shrink>
                          {field.label}
                          {field.required ? " *" : ""}
                        </InputLabel>
                        <input
                          name={field.name}
                          type="file"
                          accept={field.name === "passport_photo" ? "image/*" : undefined}
                          onChange={handleInputChange}
                          required={field.required}
                          style={{ marginTop: 4, marginBottom: 8 }}
                        />
                        {errorMsg && (
                          <Typography color="error" sx={{ fontSize: "0.8rem" }}>
                            {errorMsg}
                          </Typography>
                        )}
                      </Box>
                    );
                  }
                  if (field.type === "date") {
                    return (
                      <TextField
                        key={field.name}
                        name={field.name}
                        label={field.label}
                        type="date"
                        value={form[field.name as keyof typeof form] as string}
                        onChange={handleInputChange}
                        fullWidth
                        required={field.required}
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        error={!!errorMsg}
                        helperText={errorMsg}
                      />
                    );
                  }
                  if (field.type === "boolean") {
                    return (
                      <FormControlLabel
                        key={field.name}
                        control={
                          <Checkbox
                            name={field.name}
                            checked={!!form[field.name as keyof typeof form]}
                            onChange={handleInputChange}
                            color="primary"
                          />
                        }
                        label={field.label}
                        sx={{ my: 1 }}
                      />
                    );
                  }
                  if (field.name === "applicant") {
                    return (
                      <TextField
                        key={field.name}
                        name={field.name}
                        label={field.label}
                        value={getUserFullName()}
                        fullWidth
                        required={field.required}
                        margin="normal"
                        disabled
                        error={!!errorMsg}
                        helperText={errorMsg}
                      />
                    );
                  }
                  // Handle number/integer fields
                  if (field.type === "number") {
                    return (
                      <TextField
                        key={field.name}
                        name={field.name}
                        label={field.label}
                        value={form[field.name as keyof typeof form] as string}
                        onChange={handleInputChange}
                        fullWidth
                        required={field.required}
                        margin="normal"
                        type="number"
                        inputProps={{
                          step: "1",
                          min: "0",
                        }}
                        error={!!errorMsg}
                        helperText={errorMsg}
                      />
                    );
                  }
                  return (
                    <TextField
                      key={field.name}
                      name={field.name}
                      label={field.label}
                      value={form[field.name as keyof typeof form] as string}
                      onChange={handleInputChange}
                      fullWidth
                      required={field.required}
                      margin="normal"
                      error={!!errorMsg}
                      helperText={errorMsg}
                    />
                  );
                })}
                <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                  {activeStep > 0 && (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleBack}
                      disabled={submitting}
                      fullWidth
                    >
                      Back
                    </Button>
                  )}
                  {activeStep < visibleSteps.length - 1 && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      disabled={!isStepValid() || submitting}
                      fullWidth
                    >
                      Next
                    </Button>
                  )}
                  {activeStep === visibleSteps.length - 1 && (
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      className="rounded-full"
                      disabled={
                        submitting ||
                        !isStepValid()
                      }
                    >
                      {submitting ? (
                        <CircularProgress size={22} color="inherit" />
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  )}
                </Box>
              </form>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default JobDetails;
