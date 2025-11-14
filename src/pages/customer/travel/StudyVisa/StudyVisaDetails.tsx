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
  Breadcrumbs,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { getStudyVisaOfferById } from "../../../../services/studyVisa";
import { useAuth } from "../../../../context/AuthContext";
import api from "../../../../services/api";
import { capitalizeWords } from "../../../../utils";
import {
  fetchStudySponsorshipTypes,
  fetchStudyVisaTypes,
} from "../../../../services/definitionService";
 
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

// Helper to prettify status string
function prettyStatus(status: any) {
  if (!status) return "Submitted";
  if (typeof status === "string")
    return status.charAt(0).toUpperCase() + status.slice(1);
  if (typeof status === "object" && status.term)
    return status.term.charAt(0).toUpperCase() + status.term.slice(1);
  return String(status);
}

// Format a value or show fallback
function formatValue(val: any) {
  if (val === null || val === undefined || String(val).trim() === "") return <em>Not Provided</em>;
  return val;
}

// Return the string/JSX representation of an application's field value
function renderApplicationField(app: any, field: any) {
  if (!field) return null;
  const value = app[field.name];
  if (field.type === "boolean") {
    return value === true || value === "true" ? "Yes" : "No";
  }
  if (field.type === "file" && value && typeof value === "string") {
    // Try to show a file download link/image for images
    return (
      <Link
        href={value}
        target="_blank"
        rel="noopener noreferrer"
      >
        {field.label}
      </Link>
    );
  }
  return formatValue(value);
}

const StudyVisaDetails: React.FC = () => {
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

  // Visa type and sponsorship options from API services
  const [visaTypeOptions, setVisaTypeOptions] = useState<{ value: string; label: string }[]>([
    { value: "", label: "Please select Visa Type" },
  ]);
  const [sponsorshipOptions, setSponsorshipOptions] = useState<{ value: string; label: string }[]>([
    { value: "", label: "Please select Sponsorship Option" },
  ]);
  const [loadingVisaOptions, setLoadingVisaOptions] = useState<boolean>(false);
  const [loadingSponsorshipOptions, setLoadingSponsorshipOptions] = useState<boolean>(false);

  // Application form state
  const [form, setForm] = useState({
    applicant: getUserFullName(),
    passport_number: "",
    country: "",
    passport_expiry_date: "",
    highest_qualification: "",
    previous_university: "",
    previous_course_of_study: "",
    cgpa: "",
    graduation_year: "",
    destination_country: "",
    institution: "",
    course_of_study: "",
    program_type: "",
    intended_start_date: "",
    intended_end_date: "",
    visa_type: "",
    sponsorship: "",
    passport_photo: null as File | null,
    passport_document: null as File | null,
    academic_transcript: null as File | null,
    admission_letter: null as File | null,
    financial_statement: null as File | null,
    english_test_result: null as File | null,
    previous_visa_applications: false,
    previous_visa_details: "",
    travel_history: "",
    emergency_contact_name: "",
    emergency_contact_relationship: "",
    emergency_contact_phone: "",
    statement_of_purpose: "",
    is_submitted: false,
    submitted_at: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  // For live description typing effect
  const [liveDescription, setLiveDescription] = useState<string>("");
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Steps definition (move statement_of_purpose field to "Document Uploads")
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
        "cgpa",
        "graduation_year",
      ],
    },
    {
      label: "Visa & Study Details",
      fields: [
        "destination_country",
        "institution",
        "course_of_study",
        "program_type",
        "intended_start_date",
        "intended_end_date",
        "visa_type",
        "sponsorship",
      ],
    },
    {
      label: "Document Uploads",
      fields: [
        "passport_photo",
        "passport_document",
        "academic_transcript",
        "admission_letter",
        "financial_statement",
        "english_test_result",
        "statement_of_purpose", // <--- Move to Document Uploads step
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
        // "statement_of_purpose", <-- REMOVED FROM HERE
      ],
    },
    {
      label: "Review & Submit",
      fields: [
        "is_submitted",
        "submitted_at",
      ],
    },
  ];

  // Load offer details only
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

  // Fetch visa type and sponsorship type options from their API services (expect new API data structure)
  useEffect(() => {
    setLoadingVisaOptions(true);
    fetchStudyVisaTypes()
      .then((data) => {
        // Expecting API response: {results: [{id, term, ...}]}
        const rawItems = Array.isArray(data?.results) ? data.results : [];
        const options: { value: string; label: string }[] = [
          { value: "", label: "Please select Visa Type" },
          ...rawItems.map((v: any) => ({
            value: v.id?.toString() ?? v.term,
            label: v.term ?? v.id?.toString() ?? "",
          })),
        ];
        setVisaTypeOptions(options.length > 1 ? options : [
          { value: "", label: "Please select Visa Type" },
          { value: "Other", label: "Other" },
        ]);
        setLoadingVisaOptions(false);
      })
      .catch(() => {
        setVisaTypeOptions([
          { value: "", label: "Please select Visa Type" },
          { value: "Other", label: "Other" },
        ]);
        setLoadingVisaOptions(false);
      });

    setLoadingSponsorshipOptions(true);
    fetchStudySponsorshipTypes()
      .then((data) => {
        const rawItems = Array.isArray(data?.results) ? data.results : [];
        const options: { value: string; label: string }[] = [
          { value: "", label: "Please select Sponsorship Option" },
          ...rawItems.map((v: any) => ({
            value: v.id?.toString() ?? v.term,
            label: v.term ?? v.id?.toString() ?? "",
          })),
        ];
        setSponsorshipOptions(options.length > 1 ? options : [
          { value: "", label: "Please select Sponsorship Option" },
          { value: "Other", label: "Other" },
        ]);
        setLoadingSponsorshipOptions(false);
      })
      .catch(() => {
        setSponsorshipOptions([
          { value: "", label: "Please select Sponsorship Option" },
          { value: "Other", label: "Other" },
        ]);
        setLoadingSponsorshipOptions(false);
      });
  }, []);

  // Reset applicant field if user changes
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      applicant: getUserFullName(),
    }));
    // eslint-disable-next-line
  }, [user]);

  // Fetch this user's application for this study visa offer
  useEffect(() => {
    if (!id || !user) {
      setLatestApplication(null);
      setApplicationError(null);
      return;
    }
    setApplicationLoading(true);
    setApplicationError(null);

    api
      .get("/app/study-visa-application/", {
        params: { offer_id: id }
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
              String(a.applicant).toLowerCase().trim() === getUserFullName().toLowerCase().trim())
        );
        matches = matches.sort((a: any, b: any) => {
          if (a.submitted_at && b.submitted_at)
            return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
          return (b.id || 0) - (a.id || 0);
        });

        const found = matches.find(
          (a: any) =>
            (!!a.study_visa_offer && String(a.study_visa_offer) === String(id)) ||
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

  // Map of field name to label and type (all fields for this application's purposes)
  const formFields = [
    // Personal Information
    { name: "applicant", label: "Full Name", type: "text", required: true },
    { name: "passport_number", label: "Passport Number", type: "text", required: true },
    { name: "country", label: "Country of Citizenship", type: "text", required: true },
    { name: "passport_expiry_date", label: "Passport Expiry Date", type: "date", required: true },

    // Educational Background
    { name: "highest_qualification", label: "Highest Qualification", type: "text", required: true },
    { name: "previous_university", label: "Previous University", type: "text", required: false },
    { name: "previous_course_of_study", label: "Previous Course of Study", type: "text", required: false },
    { name: "cgpa", label: "CGPA", type: "text", required: false },
    { name: "graduation_year", label: "Graduation Year", type: "text", required: false },

    // Visa & Study Details
    { name: "destination_country", label: "Destination Country", type: "text", required: false },
    { name: "institution", label: "Institution", type: "text", required: false },
    { name: "course_of_study", label: "Course of Study", type: "text", required: false },
    { name: "program_type", label: "Program Type", type: "text", required: false },
    { name: "intended_start_date", label: "Intended Start Date", type: "date", required: true },
    { name: "intended_end_date", label: "Intended End Date", type: "date", required: true },
    { name: "visa_type", label: "Visa Type", type: "select", required: true },
    { name: "sponsorship", label: "Sponsorship", type: "select", required: false },

    // Document Uploads
    { name: "passport_photo", label: "Passport Photo", type: "file", required: true },
    { name: "passport_document", label: "Passport Document", type: "file", required: true },
    { name: "academic_transcript", label: "Academic Transcript", type: "file", required: false },
    { name: "admission_letter", label: "Admission Letter", type: "file", required: false },
    { name: "financial_statement", label: "Financial Statement", type: "file", required: false },
    { name: "english_test_result", label: "English Test Result", type: "file", required: false },
    { name: "statement_of_purpose", label: "Statement of Purpose", type: "file", required: true }, // <--- already file

    // Additional Information
    { name: "previous_visa_applications", label: "Previous Visa Applications", type: "boolean", required: false },
    { name: "previous_visa_details", label: "Previous Visa Details", type: "text", required: false },
    { name: "travel_history", label: "Travel History", type: "text", required: false },
    { name: "emergency_contact_name", label: "Emergency Contact Name", type: "text", required: true },
    { name: "emergency_contact_relationship", label: "Emergency Contact Relationship", type: "text", required: true },
    { name: "emergency_contact_phone", label: "Emergency Contact Phone", type: "text", required: true },
    // statement_of_purpose REMOVED from here

    // Review & Submit
    { name: "is_submitted", label: "Application Submitted", type: "boolean", required: false },
    { name: "submitted_at", label: "Submitted At", type: "text", required: false },

    // System fields & naming for display only
    { name: "application_date", label: "Application Date", type: "text", required: false },
    { name: "status", label: "Status", type: "text", required: false },
    { name: "notes", label: "Notes", type: "text", required: false },
    { name: "institution_name", label: "Institution Name", type: "text", required: false },
    { name: "course_of_study_name", label: "Course of Study Name", type: "text", required: false },
    { name: "program_type_name", label: "Program Type Name", type: "text", required: false },
    { name: "status_name", label: "Status Name", type: "text", required: false },
  ];

  // Remove fields that are already present in the offer, or are system fields
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
    "institution_name",
    "course_of_study_name",
    "program_type_name",
    "status_name",
  ];

  const visibleFormFields = formFields.filter((field) => {
    if (offerFields.includes(field.name)) return false;
    if (getOfferField(field.name)) return false;
    return true;
  });

  // Map: field name -> config
  const visibleFormFieldsMap = Object.fromEntries(
    visibleFormFields.map((f) => [f.name, f])
  );

  // Get only visible fields for each step
  const visibleSteps = FORM_STEPS.map((step) => ({
    ...step,
    fields: step.fields.filter((fname) => visibleFormFieldsMap[fname]),
  })).filter((step) => step.fields.length > 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const target = e.target;
    const { name, value, type, files, checked } = target;
    if (name === "applicant") return;
    if (type === "file") {
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
      if (field.type === "file") {
        return !!form[fname as keyof typeof form];
      }
      if (fname === "applicant") {
        return !!getUserFullName();
      }
      if (field.type === "boolean") {
        return true;
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

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitSuccess(false);
    try {
      // Prepare form data for submission
      const formData = new FormData();
      for (const key in form) {
        if (Object.prototype.hasOwnProperty.call(form, key)) {
          if (visibleFormFields.find((f) => f.name === key)) {
            if (key === "applicant") continue;
            if (key === "previous_visa_applications" || key === "is_submitted") {
              formData.append(key, form[key] ? "true" : "false");
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
      formData.append("study_visa_offer", id as string);

      await api.post("/app/study-visa-application/", formData, {
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
        cgpa: "",
        graduation_year: "",
        destination_country: "",
        institution: "",
        course_of_study: "",
        program_type: "",
        intended_start_date: "",
        intended_end_date: "",
        visa_type: "",
        sponsorship: "",
        passport_photo: null,
        passport_document: null,
        academic_transcript: null,
        admission_letter: null,
        financial_statement: null,
        english_test_result: null,
        previous_visa_applications: false,
        previous_visa_details: "",
        travel_history: "",
        emergency_contact_name: "",
        emergency_contact_relationship: "",
        emergency_contact_phone: "",
        statement_of_purpose: "",
        is_submitted: false,
        submitted_at: "",
      });
      setActiveStep(0);
    } catch (err) {
      setSubmitSuccess(false);
    }
    setSubmitting(false);
  };

  // --- Live description typing effect ---
  useEffect(() => {
    if (!offer) {
      setLiveDescription("");
      return;
    }
    const desc: string = offer.description || offer.program_description || "";
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
  const institution =
    (typeof offer.university === "object" && offer.university) ||
    (typeof offer.institution_name === "object" && offer.institution_name) ||
    { name: offer.institution_name || "N/A" };

  // Requirements logic as before
  const requirements = (() => {
    if (Array.isArray(offer.requirements) && offer.requirements.length > 0) {
      const minEnglishScoreText = "Minimum English Score: 5.0";
      const alreadyIncluded = offer.requirements.some(
        (req: string) =>
          req.toLowerCase().includes("minimum english score") ||
          req.toLowerCase().includes("minimum_english_score")
      );
      return alreadyIncluded
        ? offer.requirements
        : [...offer.requirements, minEnglishScoreText];
    }
    const reqs = [
      ...(offer.minimum_qualification ? [`Minimum Qualification: ${offer.minimum_qualification}`] : []),
      ...(offer.minimum_grade ? [`Minimum Grade: ${offer.minimum_grade}`] : []),
      ...(offer.english_proficiency_required
        ? [
            `English Proficiency Required: Yes`,
            offer.english_test_type ? `Test Type: ${offer.english_test_type}` : "",
            offer.minimum_english_score
              ? `Minimum Score: ${offer.minimum_english_score}`
              : "",
          ].filter(Boolean)
        : [`English Proficiency Required: No`]),
      ...(offer.other_requirements ? [offer.other_requirements] : []),
    ];
    if (offer.minimum_english_score !== undefined && offer.minimum_english_score !== null) {
      reqs.push(`Minimum English Score: ${offer.minimum_english_score}`);
    }
    return reqs;
  })();

  const images = offer.images || offer.institution_images || [];
  const institutionLogo =
    offer.institution_logo ||
    (typeof institution === "object" && institution.logo) ||
    null;

  // Compose display fields
  const statusDisplay =
    offer.status_display ||
    (typeof offer.status === "number" ? `Status Code: ${offer.status}` : undefined);

  const tuitionFee =
    offer.tuition_fee !== undefined && offer.tuition_fee !== null
      ? `£${Number(offer.tuition_fee).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "N/A";

  const applicationDeadline = offer.application_deadline
    ? new Date(offer.application_deadline).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
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

  const programType =
    offer.program_type_name ||
    (typeof offer.program_type === "string" ? offer.program_type : undefined) ||
    "N/A";

  const courseOfStudy =
    offer.course_of_study_name ||
    (typeof offer.course_of_study === "string" ? offer.course_of_study : undefined) ||
    "N/A";

  const country =
    offer.country ||
    (typeof institution === "object" && institution.country) ||
    "N/A";

  const offerTitle = offer.offer_title || offer.program_name || offer.program || "Study Visa Offer";

  const createdAt = offer.created_at
    ? new Date(offer.created_at).toLocaleString()
    : undefined;
  const updatedAt = offer.updated_at
    ? new Date(offer.updated_at).toLocaleString()
    : undefined;

  // --- RENDER APPLICATION DETAILS IF ALREADY APPLIED ---
  const renderApplicationDetails = (app: any) => {
    if (!app) return null;

    // List fields in nice order matching the Python fields order
    const displayFields = [
      // 1️⃣ Personal Information
      "applicant",
      "study_visa_offer",
      "passport_number",
      "country",
      "passport_expiry_date",
      // 2️⃣ Educational Background
      "highest_qualification",
      "previous_university",
      "previous_course_of_study",
      "cgpa",
      "graduation_year",
      // 3️⃣ Visa & Study Details
      "destination_country",
      "institution",
      "course_of_study",
      "program_type",
      "intended_start_date",
      "intended_end_date",
      "visa_type",
      "sponsorship",
      // 4️⃣ Document Uploads
      "passport_photo",
      "passport_document",
      "academic_transcript",
      "admission_letter",
      "financial_statement",
      "english_test_result",
      "statement_of_purpose", // <--- MOVED HERE
      // 5️⃣ Additional Information
      "previous_visa_applications",
      "previous_visa_details",
      "travel_history",
      "emergency_contact_name",
      "emergency_contact_relationship",
      "emergency_contact_phone",
      // "statement_of_purpose", <-- REMOVED FROM HERE
      // 6️⃣ Review & Submit
      "is_submitted",
      "submitted_at",
      // System fields
      "application_date",
      "status",
      "notes",
      "institution_name",
      "course_of_study_name",
      "program_type_name",
      "status_name",
    ];

    return (
      <Box>
        <Typography variant="h6" className="font-bold mb-2">
          Application Details
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mb-2">
          You have already submitted your application for this study visa offer.
        </Typography>
        {app.status && (
          <Chip
            label={prettyStatus(app.status)}
            color={String(app.status).toLowerCase().includes("approved") ? "success" : "primary"}
            sx={{ mb: 2 }}
          />
        )}
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
          {/* Extra: submission time */}
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
  };

  return (
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
            Program Details
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
                    {capitalizeWords(
                      typeof institution === "object"
                        ? institution.name || offer.institution_name
                        : institution || offer.institution_name
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {country}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h6" className="font-semibold mb-2">
                {offerTitle}
              </Typography>
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
                {/* Render fields for the current step */}
                {visibleSteps[activeStep]?.fields.map((fname) => {
                  const field = visibleFormFieldsMap[fname];
                  if (!field) return null;

                  // Visa Type select
                  if (field.name === "visa_type") {
                    return (
                      <FormControl
                        fullWidth
                        margin="normal"
                        required={field.required}
                        key={field.name}
                        disabled={loadingVisaOptions}
                      >
                        <InputLabel id="visa-type-label">{field.label}</InputLabel>
                        <Select
                          labelId="visa-type-label"
                          id="visa-type"
                          name={field.name}
                          label={field.label}
                          value={form[field.name]}
                          onChange={handleInputChange}
                        >
                          {visaTypeOptions.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    );
                  }

                  // Sponsorship select
                  if (field.name === "sponsorship") {
                    return (
                      <FormControl
                        fullWidth
                        margin="normal"
                        required={field.required}
                        key={field.name}
                        disabled={loadingSponsorshipOptions}
                      >
                        <InputLabel id="sponsorship-label">{field.label}</InputLabel>
                        <Select
                          labelId="sponsorship-label"
                          id="sponsorship"
                          name={field.name}
                          label={field.label}
                          value={form[field.name]}
                          onChange={handleInputChange}
                        >
                          {sponsorshipOptions.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    );
                  }

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
  );
};

export default StudyVisaDetails;
