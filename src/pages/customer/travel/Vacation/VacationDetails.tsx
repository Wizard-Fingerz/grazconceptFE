import React, { useState, useEffect, useRef } from "react";
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
  Breadcrumbs,
  Snackbar,
} from "@mui/material";
import MuiAlert, { type AlertProps } from "@mui/material/Alert";
import { useAuth } from "../../../../context/AuthContext";
import api from "../../../../services/api";
import { capitalizeWords } from "../../../../utils";

// Alert wrapper for Snackbar
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Steps for Vacation Application Form
const VACATION_FORM_STEPS = [
  {
    label: "Personal Information",
    fields: ["applicant", "passport_number", "date_of_birth"],
  },
  {
    label: "Vacation Details",
    fields: [
      "destination",
      "travel_date",
      "number_of_people",
      "accommodation_type",
    ],
  },
  {
    label: "Document Uploads",
    fields: ["identification_document"],
  },
  {
    label: "Emergency Contact",
    fields: [
      "emergency_contact_name",
      "emergency_contact_phone",
      "emergency_contact_relationship",
    ],
  },
];

// Render multiline description
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

// Prettify status string
function prettyStatus(status: any) {
  if (!status) return "Submitted";
  if (typeof status === "string")
    return status.charAt(0).toUpperCase() + status.slice(1);
  if (typeof status === "object" && status.term)
    return status.term.charAt(0).toUpperCase() + status.term.slice(1);
  return String(status);
}

function formatValue(val: any) {
  if (val === null || val === undefined || String(val).trim() === "")
    return <em>Not Provided</em>;
  return val;
}

function renderApplicationField(app: any, field: any) {
  if (!field) return null;
  const value = app[field.name];
  if (field.type === "boolean") {
    return value === true || value === "true" ? "Yes" : "No";
  }
  if (field.type === "file" && value && typeof value === "string") {
    return (
      <Link href={value} target="_blank" rel="noopener noreferrer">
        {field.label}
      </Link>
    );
  }
  return formatValue(value);
}

const VacationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Compose full name for the applicant
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

  // Application form state
  const [form, setForm] = useState({
    applicant: getUserFullName(),
    passport_number: "",
    date_of_birth: "",
    destination: "",
    travel_date: "",
    number_of_people: "",
    accommodation_type: "",
    identification_document: null as File | null,
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Toast error state
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);

  // Stepper state
  const [activeStep, setActiveStep] = useState(0);

  // Offer state
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User's previous application state
  const [latestApplication, setLatestApplication] = useState<any>(null);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);

  // For animated typing effect in the description
  const [liveDescription, setLiveDescription] = useState<string>("");
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Field config for application form
  const formFields = [
    { name: "applicant", label: "Full Name", type: "text", required: true },
    { name: "passport_number", label: "Passport Number", type: "text", required: true },
    { name: "date_of_birth", label: "Date of Birth", type: "date", required: true },
    { name: "destination", label: "Destination", type: "text", required: true },
    { name: "travel_date", label: "Travel Date", type: "date", required: true },
    { name: "number_of_people", label: "Number of People", type: "text", required: true },
    { name: "accommodation_type", label: "Accommodation Preference", type: "text", required: false },
    { name: "identification_document", label: "Identification Document", type: "file", required: true },
    { name: "emergency_contact_name", label: "Emergency Contact Name", type: "text", required: true },
    { name: "emergency_contact_phone", label: "Emergency Contact Phone", type: "text", required: true },
    { name: "emergency_contact_relationship", label: "Emergency Contact Relationship", type: "text", required: true },
  ];

  // Remove fields already present in the offer or not for user input
  const offerFields = [
    "id",
    "status",
    "notes",
    "application_date",
    "is_submitted",
    "submitted_at",
  ];
  const getOfferField = (field: string) => (offer ? offer[field] : undefined);
  const visibleFormFields = formFields.filter((field) => {
    if (offerFields.includes(field.name)) return false;
    if (getOfferField(field.name)) return false;
    return true;
  });
  const visibleFormFieldsMap = Object.fromEntries(
    visibleFormFields.map((f) => [f.name, f])
  );

  // For each step, filter visible fields
  const visibleSteps = VACATION_FORM_STEPS.map((step) => ({
    ...step,
    fields: step.fields.filter((fname) => visibleFormFieldsMap[fname]),
  })).filter((step) => step.fields.length > 0);

  // Form field change handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, files } = e.target as any;
    if (name === "applicant") return;
    if (type === "file") {
      setForm((prev) => ({
        ...prev,
        [name]: files && files.length > 0 ? files[0] : null,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Is step valid
  const isStepValid = () => {
    const stepFields = visibleSteps[activeStep]?.fields || [];
    return stepFields.every((fname) => {
      const field = visibleFormFieldsMap[fname];
      if (!field) return true;
      if (!field.required) return true;
      if (field.type === "file") {
        return !!form[fname as keyof typeof form];
      }
      if (fname === "applicant") {
        return !!getUserFullName();
      }
      return String(form[fname as keyof typeof form]).trim().length > 0;
    });
  };

  const handleNext = () => {
    if (activeStep < visibleSteps.length - 1)
      setActiveStep((prev) => prev + 1);
  };
  const handleBack = () => {
    if (activeStep > 0)
      setActiveStep((prev) => prev - 1);
  };

  // Toast close handler
  const handleToastClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setToastOpen(false);
  };

  // Submit application
  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);
    try {
      const formData = new FormData();
      for (const key in form) {
        if (Object.prototype.hasOwnProperty.call(form, key)) {
          if (visibleFormFields.find((f) => f.name === key)) {
            if (key === "applicant") continue;
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
      formData.append("offer", id as string);

      await api.post("/app/vacation-application/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSubmitSuccess(true);
      setForm({
        applicant: getUserFullName(),
        passport_number: "",
        date_of_birth: "",
        destination: "",
        travel_date: "",
        number_of_people: "",
        accommodation_type: "",
        identification_document: null,
        emergency_contact_name: "",
        emergency_contact_phone: "",
        emergency_contact_relationship: "",
      });
      setActiveStep(0);
    } catch (err: any) {
      let errorMsg =
        "An error occurred while submitting your application.";
      // Try to extract error info
      if (err && err.response && err.response.data) {
        if (typeof err.response.data === "string") {
          errorMsg = err.response.data;
        } else if (typeof err.response.data === "object") {
          if (err.response.data.detail) errorMsg = err.response.data.detail;
          else {
            const keys = Object.keys(err.response.data);
            if (keys.length > 0) {
              const messages = keys.map(
                (key) =>
                  `${key}: ${
                    Array.isArray(err.response.data[key])
                      ? err.response.data[key].join(" ")
                      : String(err.response.data[key])
                  }`
              );
              errorMsg = messages.join(" | ");
            }
          }
        }
      }
      setSubmitError(errorMsg);
      setToastOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Load offer details
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    api
      .get(`/app/vacation-offer/${id}/`)
      .then((res: any) => {
        setOffer(res.data || res);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load vacation offer details.");
        setLoading(false);
      });
  }, [id]);

  // Reset applicant field if user changes
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      applicant: getUserFullName(),
    }));
    // eslint-disable-next-line
  }, [user]);

  // Fetch user's application for this vacation offer
  useEffect(() => {
    if (!id || !user) {
      setLatestApplication(null);
      setApplicationError(null);
      return;
    }
    setApplicationLoading(true);
    setApplicationError(null);

    api
      .get("/app/vacation-application/", {
        params: { offer_id: id },
      })
      .then((res) => {
        const results = Array.isArray(res.data?.results)
          ? res.data.results
          : Array.isArray(res.data)
          ? res.data
          : [];

        let matches = results.filter(
          (a: any) =>
            (a?.client === user.id) ||
            (a?.applicant &&
              getUserFullName() &&
              String(a.applicant).toLowerCase().trim() ===
                getUserFullName().toLowerCase().trim())
        );
        matches = matches.sort((a: any, b: any) => {
          if (a.submitted_at && b.submitted_at)
            return (
              new Date(b.submitted_at).getTime() -
              new Date(a.submitted_at).getTime()
            );
          return (b.id || 0) - (a.id || 0);
        });

        const found = matches.find(
          (a: any) =>
            (!!a.vacation_offer && String(a.vacation_offer) === String(id)) ||
            (!!a.offer &&
              (typeof a.offer === "object"
                ? String(a.offer.id) === String(id)
                : String(a.offer) === String(id)))
        );
        setLatestApplication(found || null);
        setApplicationLoading(false);
      })
      .catch(() => {
        setLatestApplication(null);
        setApplicationError("Failed to check previous applications.");
        setApplicationLoading(false);
      });
    // eslint-disable-next-line
  }, [id, user]);

  // Animated description typing effect
  useEffect(() => {
    if (!offer) {
      setLiveDescription("");
      return;
    }
    const desc: string =
      offer.description || offer.vacation_description || "";
    if (!desc) {
      setLiveDescription("");
      return;
    }
    if (liveDescription === desc) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
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
  }, [offer, offer?.description, offer?.vacation_description]);

  // Returns for load and error states
  if (loading) {
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
        <Typography>No vacation offer details found.</Typography>
      </Box>
    );
  }

  // Requirements
  const requirements = Array.isArray(offer.included_items)
    ? offer.included_items
        .map((item: any) => {
          if (item.name && item.description) {
            return `${item.name}: ${item.description}`;
          } else if (item.name) {
            return item.name;
          } else if (item.description) {
            return item.description;
          }
          return "";
        })
        .filter((r: string) => !!r)
    : [];

  // Images
  const images = Array.isArray(offer.images) ? offer.images : [];

  // Compose display fields
  const vacationTitle = offer.title || offer.vacation_name || "Vacation Offer";
  const organization =
    offer.organization_name ||
    (typeof offer.organization === "object" && offer.organization.name) ||
    offer.organization ||
    "";
  const destination =
    offer.destination_city && offer.destination_country
      ? `${offer.destination_city}, ${offer.destination_country}`
      : offer.destination || offer.country || offer.destination_country || "N/A";
  const cost =
    offer.price !== undefined && offer.price !== null
      ? `${offer.currency === "NAIRA" || offer.currency === "Naira" ? "₦" : ""}${Number(
          offer.price
        ).toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })} ${offer.currency && offer.currency !== "NAIRA" ? offer.currency : ""}`.trim()
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
  const deadline = offer.application_deadline
    ? new Date(offer.application_deadline).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";
  const statusDisplay = prettyStatus(offer.status);

  // Dates
  const createdAt = offer.created_at
    ? new Date(offer.created_at).toLocaleString()
    : null;
  const updatedAt = offer.updated_at
    ? new Date(offer.updated_at).toLocaleString()
    : null;

  // Organization logo
  const organizationLogo =
    offer.organization_logo ||
    (typeof offer.organization === "object" && offer.organization.logo) ||
    null;

  // Application fields to display for read-only application display
  const displayFields = [
    "applicant",
    "passport_number",
    "date_of_birth",
    "destination",
    "travel_date",
    "number_of_people",
    "accommodation_type",
    "identification_document",
    "emergency_contact_name",
    "emergency_contact_phone",
    "emergency_contact_relationship",
  ];

  function renderApplicationDetails(app: any) {
    return (
      <Box>
        <Typography variant="h6" className="font-bold mb-2">
          Your Application
        </Typography>
        <Chip
          size="small"
          label={prettyStatus(app.status)}
          color={String(app.status).toLowerCase().includes("approved") ? "success" : "primary"}
          sx={{ mb: 2 }}
        />
        <Stack spacing={1} sx={{ mb: 2 }}>
          {displayFields.map((fname) => {
            const field = formFields.find((f) => f.name === fname);
            if (!field || typeof app[fname] === "undefined") return null;
            return (
              <Box key={fname}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {field.label}
                </Typography>
                <Typography variant="body2" sx={{ ml: 1, mb: 1 }}>
                  {renderApplicationField(app, field)}
                </Typography>
              </Box>
            );
          })}
          {app.submitted_at && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Submitted at:&nbsp;{new Date(app.submitted_at).toLocaleString()}
            </Typography>
          )}
        </Stack>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/customer/applications")}
        >
          View all Applications
        </Button>
      </Box>
    );
  }

  return (
    <>
      {/* Error Toast Snackbar */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={7000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleToastClose} severity="error" sx={{ width: "100%" }}>
          {submitError}
        </Alert>
      </Snackbar>
      <Box
        sx={{
          flex: 1,
          alignSelf: "flex-start",
          p: 1,
          width: "100%",
          minWidth: 0,
        }}
      >
        {/* Breadcrumb */}
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
              Offer Details
            </Typography>
          </Breadcrumbs>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            px: { xs: 1, sm: 2, md: 4 },
            py: { xs: 2, md: 4 },
            mx: "auto",
          }}
        >
          {/* Main Details Section */}
          <Box sx={{ flex: 2, minWidth: 0 }}>
            <Card className="mb-4 rounded-2xl shadow-md">
              <CardContent>
                <Box className="flex items-center gap-4 mb-4">
                  {organizationLogo && (
                    <CardMedia
                      component="img"
                      image={organizationLogo}
                      alt="Organization Logo"
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
                      {capitalizeWords(organization)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {destination}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h6" className="font-semibold mb-2">
                  {vacationTitle}
                </Typography>
                <Box className="mb-2">
                  {liveDescription ? (
                    renderDescriptionLive(liveDescription)
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      No description available.
                    </Typography>
                  )}
                </Box>
                <Divider sx={{ my: 2 }} />
                {/* Details */}
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  spacing={1}
                  useFlexGap
                  sx={{ mb: 2 }}
                >
                  <Box
                    sx={{
                      flex: "1 1 300px",
                      minWidth: 0,
                      maxWidth: { xs: "100%", sm: "50%", md: "33.33%" },
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      Cost
                    </Typography>
                    <Typography variant="body2">{cost}</Typography>
                  </Box>
                  <Box
                    sx={{
                      flex: "1 1 300px",
                      minWidth: 0,
                      maxWidth: { xs: "100%", sm: "50%", md: "33.33%" },
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      Application Deadline
                    </Typography>
                    <Typography variant="body2">{deadline}</Typography>
                  </Box>
                  <Box
                    sx={{
                      flex: "1 1 300px",
                      minWidth: 0,
                      maxWidth: { xs: "100%", sm: "50%", md: "33.33%" },
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      Start Date
                    </Typography>
                    <Typography variant="body2">{startDate}</Typography>
                  </Box>
                  <Box
                    sx={{
                      flex: "1 1 300px",
                      minWidth: 0,
                      maxWidth: { xs: "100%", sm: "50%", md: "33.33%" },
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      End Date
                    </Typography>
                    <Typography variant="body2">{endDate}</Typography>
                  </Box>
                  <Box
                    sx={{
                      flex: "1 1 300px",
                      minWidth: 0,
                      maxWidth: { xs: "100%", sm: "50%", md: "33.33%" },
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body2">{statusDisplay}</Typography>
                  </Box>
                  <Box
                    sx={{
                      flex: "1 1 300px",
                      minWidth: 0,
                      maxWidth: { xs: "100%", sm: "50%", md: "33.33%" },
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body2">{createdAt || "N/A"}</Typography>
                  </Box>
                  <Box
                    sx={{
                      flex: "1 1 300px",
                      minWidth: 0,
                      maxWidth: { xs: "100%", sm: "50%", md: "33.33%" },
                      mb: 1,
                    }}
                  >
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
                {Array.isArray(requirements) && requirements.length > 0 ? (
                  <ul className="list-disc pl-6">
                    {requirements.map((req: any, idx: number) => (
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
                  Images
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
                  {Array.isArray(images) && images.length > 0 ? (
                    images.map((img: string, idx: number) => (
                      <CardMedia
                        key={idx}
                        component="img"
                        image={img}
                        alt={`Image ${idx + 1}`}
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
            <Paper className="p-4 mt-4" elevation={0} sx={{ bgcolor: "#f9f9f9" }}>
              <Typography variant="subtitle1" className="font-semibold mb-1">
                More about the Organization
              </Typography>
              <Typography variant="body2">
                {offer.organization_description ||
                  (typeof offer.organization === "object" && offer.organization.description) ||
                  "No additional information provided."}
              </Typography>
            </Paper>
          </Box>

          {/* Application Section */}
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
            {applicationLoading && (
              <Box sx={{ display: "flex", alignItems: "center", minHeight: 130, mb: 2 }}>
                <CircularProgress size={28} sx={{ mr: 2 }} />
                <Typography>Loading your application...</Typography>
              </Box>
            )}

            {applicationError && (
              <Typography color="error" sx={{ mb: 1 }}>
                {applicationError}
              </Typography>
            )}

            {/* If user already applied, show their application (do not show form) */}
            {!applicationError && latestApplication ? (
              renderApplicationDetails(latestApplication)
            ) : (
              <>
                <Typography variant="h6" className="font-bold mb-2">
                  Apply for this Vacation
                </Typography>
                <Typography variant="body2" color="text.secondary" className="mb-3">
                  Fill in your details to start your application for this vacation offer.
                </Typography>
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2 }}>
                  {visibleSteps.map((step, idx) => (
                    <Step key={step.label} completed={activeStep > idx}>
                      <StepLabel
                        sx={{
                          "& .MuiStepLabel-label": {
                            fontSize: "0.7rem",
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
                            onChange={handleInputChange}
                            required={field.required}
                            style={{ marginTop: 4, marginBottom: 8 }}
                          />
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
                        disabled={submitting || !isStepValid()}
                      >
                        {submitting ? (
                          <CircularProgress size={22} color="inherit" />
                        ) : (
                          "Submit Application"
                        )}
                      </Button>
                    )}
                  </Box>
                  {submitSuccess && (
                    <Typography color="success.main" className="mt-2">
                      Application submitted successfully!
                    </Typography>
                  )}
                </form>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default VacationDetails;
