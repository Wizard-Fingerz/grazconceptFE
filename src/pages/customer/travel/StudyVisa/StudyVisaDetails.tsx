import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
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
} from "@mui/material";
import { getStudyVisaOfferById } from "../../../../services/studyVisa";
import { useAuth } from "../../../../context/AuthContext";
import api from "../../../../services/api"; // <-- Import the api

// Define the steps and their fields
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
    label: "Educational Background",
    fields: [
      "highest_qualification",
      "previous_university",
      "previous_course_of_study",
      "cgpa_grade",
      "year_of_graduation",
    ],
  },
  {
    label: "Visa & Study Details",
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
      "academic_transcripts",
      "admission_letter",
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

// Utility: Convert plain text with \r\n or \n to React elements with paragraphs and line breaks
function renderDescriptionLive(text: string) {
  if (!text) return null;
  // Split into paragraphs by double newlines
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

const StudyVisaDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  // Compose full name from user details
  const getUserFullName = () => {
    if (!user) return "";
    // Try to use first_name, middle_name, last_name if available
    const first = user.first_name || "";
    const middle = user.middle_name || "";
    const last = user.last_name || "";
    // If all are empty, fallback to user.name or ""
    if (first || middle || last) {
      return [first, middle, last].filter(Boolean).join(" ").trim();
    }
    return user.email || "";
  };

  // Application form state, prefill applicant with user full name
  const [form, setForm] = useState({
    applicant: getUserFullName(),
    passport_number: "",
    country: "",
    passport_expiry_date: "",
    highest_qualification: "",
    previous_university: "",
    previous_course_of_study: "",
    cgpa_grade: "",
    year_of_graduation: "",
    intended_start_date: "",
    intended_end_date: "",
    visa_type: "",
    sponsorship_details: "",
    passport_photo: null as File | null,
    international_passport: null as File | null,
    academic_transcripts: null as File | null,
    admission_letter: null as File | null,
    financial_statement: null as File | null,
    english_proficiency_test: null as File | null,
    previous_visa_applications: "",
    previous_visa_details: "",
    travel_history: "",
    emergency_contact_name: "",
    emergency_contact_relationship: "",
    emergency_contact_phone: "",
    statement_of_purpose: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Stepper state
  const [activeStep, setActiveStep] = useState(0);

  // Offer state
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For live description typing effect
  const [liveDescription, setLiveDescription] = useState<string>("");
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getStudyVisaOfferById(id)
      .then((data) => {
        setOffer(data);
        setLoading(false);
      })
      .catch((_err) => {
        setError("Failed to load offer details.");
        setLoading(false);
      });
  }, [id]);

  // If user changes (e.g. login), update applicant field
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      applicant: getUserFullName(),
    }));
    // eslint-disable-next-line
  }, [user]);

  // Helper: get value from offer or institution
  const getOfferField = (field: string) => {
    if (!offer) return undefined;
    if (offer[field]) return offer[field];
    if (offer.university && typeof offer.university === "object" && offer.university[field]) {
      return offer.university[field];
    }
    if (offer.institution_name && typeof offer.institution_name === "object" && offer.institution_name[field]) {
      return offer.institution_name[field];
    }
    return undefined;
  };

  // Map of field name to label and type
  const formFields = [
    // 1️⃣ Personal Information
    { name: "applicant", label: "Full Name", type: "text", required: true },
    { name: "passport_number", label: "Passport Number", type: "text", required: true },
    { name: "country", label: "Country of Citizenship", type: "text", required: true },
    { name: "passport_expiry_date", label: "Passport Expiry Date", type: "date", required: true },

    // 2️⃣ Educational Background
    { name: "highest_qualification", label: "Highest Qualification", type: "text", required: true },
    { name: "previous_university", label: "Previous University", type: "text", required: false },
    { name: "previous_course_of_study", label: "Previous Course of Study", type: "text", required: false },
    { name: "cgpa_grade", label: "CGPA/Grade", type: "text", required: false },
    { name: "year_of_graduation", label: "Year of Graduation", type: "text", required: false },

    // 3️⃣ Visa & Study Details
    { name: "intended_start_date", label: "Intended Start Date", type: "date", required: true },
    { name: "intended_end_date", label: "Intended End Date", type: "date", required: true },
    { name: "visa_type", label: "Visa Type", type: "text", required: true },
    { name: "sponsorship_details", label: "Sponsorship Details", type: "text", required: false },

    // 4️⃣ Document Uploads
    { name: "passport_photo", label: "Passport Photo", type: "file", required: true },
    { name: "international_passport", label: "International Passport", type: "file", required: true },
    { name: "academic_transcripts", label: "Academic Transcripts", type: "file", required: false },
    { name: "admission_letter", label: "Admission Letter", type: "file", required: false },
    { name: "financial_statement", label: "Financial Statement", type: "file", required: false },
    { name: "english_proficiency_test", label: "English Proficiency Test", type: "file", required: false },

    // 5️⃣ Additional Information
    { name: "previous_visa_applications", label: "Previous Visa Applications", type: "text", required: false },
    { name: "previous_visa_details", label: "Previous Visa Details", type: "text", required: false },
    { name: "travel_history", label: "Travel History", type: "text", required: false },
    { name: "emergency_contact_name", label: "Emergency Contact Name", type: "text", required: true },
    { name: "emergency_contact_relationship", label: "Emergency Contact Relationship", type: "text", required: true },
    { name: "emergency_contact_phone", label: "Emergency Contact Phone", type: "text", required: true },
    { name: "statement_of_purpose", label: "Statement of Purpose", type: "textarea", required: true },
  ];

  // Remove fields that are already present in the offer
  const visibleFormFields = formFields.filter((field) => {
    // For fields that are part of the offer, don't show in form
    // The following fields are in the offer and should NOT be in the form:
    // study_visa_offer, destination_country, institution, course_of_study, program_type
    // (and also id, status, notes, application_date, is_submitted, submitted_at)
    const offerFields = [
      "id",
      "study_visa_offer",
      "destination_country",
      "institution",
      "course_of_study",
      "program_type",
      "status",
      "notes",
      "application_date",
      "is_submitted",
      "submitted_at",
    ];
    if (offerFields.includes(field.name)) return false;
    // If the offer already has this field filled, don't show in form
    if (getOfferField(field.name)) return false;
    return true;
  });

  // Map: field name -> field config
  const visibleFormFieldsMap = Object.fromEntries(
    visibleFormFields.map((f) => [f.name, f])
  );

  // For each step, get only the visible fields
  const visibleSteps = FORM_STEPS.map((step) => ({
    ...step,
    fields: step.fields.filter((fname) => visibleFormFieldsMap[fname]),
  })).filter((step) => step.fields.length > 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, files } = e.target as any;
    // If the field is applicant, ignore manual changes (keep it always filled from user)
    if (name === "applicant") {
      // Do nothing, keep applicant always filled from user
      return;
    }
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

  // Validation for current step
  const isStepValid = () => {
    const stepFields = visibleSteps[activeStep]?.fields || [];
    return stepFields.every((fname) => {
      const field = visibleFormFieldsMap[fname];
      if (!field) return true;
      if (!field.required) return true;
      if (field.type === "file") {
        return !!form[fname as keyof typeof form];
      }
      // For applicant, always valid if user exists
      if (fname === "applicant") {
        return !!getUserFullName();
      }
      return String(form[fname as keyof typeof form]).trim().length > 0;
    });
  };

  const handleNext = () => {
    if (activeStep < visibleSteps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  // --- REWRITE: Use api.post to submit the application to study-visa-application endpoint ---
  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitSuccess(false);
    try {
      // Prepare form data for submission
      const formData = new FormData();
      for (const key in form) {
        if (Object.prototype.hasOwnProperty.call(form, key)) {
          // Only append if field is visible in the form
          if (visibleFormFields.find((f) => f.name === key)) {
            if (form[key as keyof typeof form] instanceof File) {
              if (form[key as keyof typeof form]) {
                formData.append(key, form[key as keyof typeof form] as File);
              }
            } else {
              // For applicant, always use the user full name
              if (key === "applicant") {
                formData.append("applicant", getUserFullName());
              } else {
                formData.append(key, form[key as keyof typeof form] ?? "");
              }
            }
          }
        }
      }
      // Add offer id and any offer fields needed for backend
      formData.append("study_visa_offer", id as string);

      // Use api.post to submit the application
      await api.post("/study-visa-application/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSubmitSuccess(true);
      setForm({
        applicant: getUserFullName(),
        passport_number: "",
        country: "",
        passport_expiry_date: "",
        highest_qualification: "",
        previous_university: "",
        previous_course_of_study: "",
        cgpa_grade: "",
        year_of_graduation: "",
        intended_start_date: "",
        intended_end_date: "",
        visa_type: "",
        sponsorship_details: "",
        passport_photo: null,
        international_passport: null,
        academic_transcripts: null,
        admission_letter: null,
        financial_statement: null,
        english_proficiency_test: null,
        previous_visa_applications: "",
        previous_visa_details: "",
        travel_history: "",
        emergency_contact_name: "",
        emergency_contact_relationship: "",
        emergency_contact_phone: "",
        statement_of_purpose: "",
      });
      setActiveStep(0);
    } catch (err) {
      // Handle error
    }
    setSubmitting(false);
  };
  // --- END REWRITE ---

  // --- Live description typing effect ---
  useEffect(() => {
    // Only run if offer is loaded
    if (!offer) {
      setLiveDescription("");
      return;
    }
    // Use offer.description or offer.program_description
    const desc: string =
      offer.description ||
      offer.program_description ||
      "";

    // If no description, clear
    if (!desc) {
      setLiveDescription("");
      return;
    }

    // If already fully typed, do nothing
    if (liveDescription === desc) return;

    // If description is being updated, clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Typing effect: reveal one character at a time
    let currentLength = liveDescription.length;
    const typeNext = () => {
      if (currentLength < desc.length) {
        setLiveDescription(desc.slice(0, currentLength + 1));
        currentLength++;
        typingTimeoutRef.current = setTimeout(typeNext, 6); // Fast typing, adjust as needed
      }
    };
    typeNext();

    // Cleanup on unmount
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
    // eslint-disable-next-line
  }, [offer, offer?.description, offer?.program_description]);
  // --- End live description typing effect ---

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
        <Typography>No offer details found.</Typography>
      </Box>
    );
  }

  // Extract institution details, requirements, images, etc.
  // Map the details according to the provided offer structure
  const institution =
    (typeof offer.university === "object" && offer.university) ||
    (typeof offer.institution_name === "object" && offer.institution_name) ||
    { name: offer.institution_name || "N/A" };

  // --- REQUIREMENTS LOGIC MODIFIED TO INCLUDE MINIMUM ENGLISH SCORE 5.0 ---
  const requirements = (() => {
    // If offer.requirements is a non-empty array, use it and append the minimum_english_score
    if (Array.isArray(offer.requirements) && offer.requirements.length > 0) {
      // Only add the minimum_english_score if not already present
      const minEnglishScoreText = 'Minimum English Score: 5.0';
      const alreadyIncluded = offer.requirements.some(
        (req: string) =>
          req.toLowerCase().includes("minimum english score") ||
          req.toLowerCase().includes("minimum_english_score")
      );
      return alreadyIncluded
        ? offer.requirements
        : [...offer.requirements, minEnglishScoreText];
    }
    // Otherwise, build the requirements array as before, but always include minimum_english_score: 5.0
    const reqs = [
      ...(offer.minimum_qualification ? [`Minimum Qualification: ${offer.minimum_qualification}`] : []),
      ...(offer.minimum_grade ? [`Minimum Grade: ${offer.minimum_grade}`] : []),
      ...(offer.english_proficiency_required
        ? [
            `English Proficiency Required: Yes`,
            offer.english_test_type
              ? `Test Type: ${offer.english_test_type}`
              : "",
            offer.minimum_english_score
              ? `Minimum Score: ${offer.minimum_english_score}`
              : "",
          ].filter(Boolean)
        : [`English Proficiency Required: No`]),
      ...(offer.other_requirements
        ? [offer.other_requirements]
        : []),
    ];
    // Always include the actual minimum_english_score value from the backend if available
    if (offer.minimum_english_score !== undefined && offer.minimum_english_score !== null) {
      reqs.push(`Minimum English Score: ${offer.minimum_english_score}`);
    }
    return reqs;
  })();
  // --- END REQUIREMENTS LOGIC MODIFIED ---

  const images = offer.images || offer.institution_images || [];
  const institutionLogo =
    offer.institution_logo ||
    (typeof institution === "object" && institution.logo) ||
    null;

  // Map status code to display (if available)
  const statusDisplay =
    offer.status_display ||
    (typeof offer.status === "number"
      ? `Status Code: ${offer.status}`
      : undefined);

  // Format tuition fee
  const tuitionFee =
    offer.tuition_fee !== undefined && offer.tuition_fee !== null
      ? `£${Number(offer.tuition_fee).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "N/A";

  // Format application deadline
  const applicationDeadline = offer.application_deadline
    ? new Date(offer.application_deadline).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  // Format start and end dates
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

  // Compose program type
  const programType =
    offer.program_type_name ||
    (typeof offer.program_type === "string" ? offer.program_type : undefined) ||
    "N/A";

  // Compose course of study
  const courseOfStudy =
    offer.course_of_study_name ||
    (typeof offer.course_of_study === "string" ? offer.course_of_study : undefined) ||
    "N/A";

  // Compose country
  const country =
    offer.country ||
    (typeof institution === "object" && institution.country) ||
    "N/A";

  // Compose offer title
  const offerTitle = offer.offer_title || offer.program_name || offer.program || "Study Visa Offer";

  // Compose description (now handled by liveDescription)
  // const description = offer.description || offer.program_description || "No description available.";

  // Compose created/updated at
  const createdAt = offer.created_at
    ? new Date(offer.created_at).toLocaleString()
    : undefined;
  const updatedAt = offer.updated_at
    ? new Date(offer.updated_at).toLocaleString()
    : undefined;

  return (
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
              {institutionLogo && (
                <CardMedia
                  component="img"
                  image={institutionLogo}
                  alt="Institution Logo"
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
                  {typeof institution === "object"
                    ? institution.name || offer.institution_name
                    : institution || offer.institution_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {country}
                </Typography>
              </Box>
            </Box>
            <Typography variant="h6" className="font-semibold mb-2">
              {offerTitle}
            </Typography>
            {/* Render the description as it is being typed in the backend */}
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

            {/* Replace deprecated Grid with Stack for layout */}
            <Stack
              direction="row"
              flexWrap="wrap"
              spacing={1}
              useFlexGap
              sx={{ mb: 2 }}
            >
              <Box sx={{ flex: "1 1 300px", minWidth: 0, maxWidth: { xs: "100%", sm: "50%", md: "33.33%" }, mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Program Type
                </Typography>
                <Typography variant="body2">{programType}</Typography>
              </Box>
              <Box sx={{ flex: "1 1 300px", minWidth: 0, maxWidth: { xs: "100%", sm: "50%", md: "33.33%" }, mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Course of Study
                </Typography>
                <Typography variant="body2">{courseOfStudy}</Typography>
              </Box>
              <Box sx={{ flex: "1 1 300px", minWidth: 0, maxWidth: { xs: "100%", sm: "50%", md: "33.33%" }, mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Tuition Fee
                </Typography>
                <Typography variant="body2">{tuitionFee}</Typography>
              </Box>
              <Box sx={{ flex: "1 1 300px", minWidth: 0, maxWidth: { xs: "100%", sm: "50%", md: "33.33%" }, mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Application Deadline
                </Typography>
                <Typography variant="body2">{applicationDeadline}</Typography>
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
                  Status
                </Typography>
                <Typography variant="body2">
                  {statusDisplay}
                </Typography>
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
              Institution Images
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
              {Array.isArray(images) && images.length > 0 ? (
                images.map((img: string, idx: number) => (
                  <CardMedia
                    key={idx}
                    component="img"
                    image={img}
                    alt={`Institution Image ${idx + 1}`}
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
            More about the Institution
          </Typography>
          <Typography variant="body2">
            {offer.institution_description ||
              (typeof institution === "object" && institution.description) ||
              "No additional information provided."}
          </Typography>
        </Paper>
      </Box>

      {/* Application Form Section */}
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
          Apply for this Offer
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mb-3">
          Fill in your details to start your application for this study visa offer.
        </Typography>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2 }}>
          {visibleSteps.map((step, idx) => (
            <Step key={step.label} completed={activeStep > idx}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: '0.7rem', // Reduce font size of the label
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
          {/* Render fields for the current step */}
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
                    accept={field.name === "passport_photo" ? "image/*" : undefined}
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
            // Default: text
            // For applicant, always show as disabled and filled with user full name
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
          {submitSuccess && (
            <Typography color="success.main" className="mt-2">
              Application submitted successfully!
            </Typography>
          )}
        </form>
      </Box>
    </Box>
  );
};

export default StudyVisaDetails;
