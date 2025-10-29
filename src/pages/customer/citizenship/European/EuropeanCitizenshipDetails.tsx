import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  LinearProgress,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import { v4 as uuidv4 } from "uuid";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import { useAuth } from "../../../../context/AuthContext";
import { fetchCountries } from "../../../../services/definitionService";
import { getEuropeanCitizenshipProgramsById } from "../../../../services/citizenshipServices";
import { useParams } from "react-router-dom";

// --- DateInputField: A simple date input replacement for DatePicker ---
const DateInputField: React.FC<{
  label: string;
  required?: boolean;
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: boolean;
  helperText?: string;
  min?: string;
  max?: string;
  readOnly?: boolean;
}> = ({
  label,
  required,
  value,
  onChange,
  error,
  helperText,
  min,
  max,
  readOnly = false,
}) => {
  const getStringValue = (date: Date | null) =>
    date
      ? new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 10)
      : "";
  return (
    <TextField
      label={label}
      required={required}
      type="date"
      value={getStringValue(value)}
      onChange={e => {
        const val = e.target.value;
        onChange(val ? new Date(val) : null);
      }}
      error={error}
      helperText={helperText}
      InputLabelProps={{ shrink: true }}
      inputProps={{
        min,
        max,
        readOnly,
      }}
    />
  );
};

// Mocked API for submission
const mockApiSubmit = (_data: any) =>
  new Promise<{ reference: string }>((resolve) =>
    setTimeout(() => resolve({ reference: uuidv4().slice(0, 8).toUpperCase() }), 2000)
  );

// European Citizenship Application Steps
const steps = [
  "Check Application Requirements",
  "Select Investment Option",
  "KYC Information",
  "Upload Documents",
  "Additional Applicant Details",
  "Review & Submit",
];

// --- Validation for each step ---
function validateRequirements(_data: any) {
  // placeholder, usually no input, so always valid
  return {};
}
function validateInvestmentOption(data: any) {
  const errors: any = {};
  if (!data.investmentType) errors.investmentType = "Investment option is required";
  if (data.investmentType === "Real Estate" && !data.realEstateValue) errors.realEstateValue = "Enter property value";
  if (data.investmentType === "Donation" && !data.donationAmount) errors.donationAmount = "Enter donation amount";
  return errors;
}
function validateKYC(data: any) {
  const errors: any = {};
  if (!data.firstName) errors.firstName = "First name is required";
  if (!data.lastName) errors.lastName = "Last name is required";
  if (!data.nationality) errors.nationality = "Nationality is required";
  if (!data.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
  if (!data.passportNumber) errors.passportNumber = "Passport number is required";
  if (!data.passportExpiry) errors.passportExpiry = "Passport expiry date is required";
  if (!data.countryOfResidence) errors.countryOfResidence = "Country of residence is required";
  return errors;
}
function validateUploads(data: any) {
  const errors: any = {};
  function checkFile(field: string, required: boolean, maxSize: number, types: string[]) {
    const file = data[field];
    if (required && !file) errors[field] = "This file is required";
    if (file) {
      if (file.size > maxSize * 1024 * 1024) errors[field] = "File too large";
      if (types.length && !types.includes(file.type)) errors[field] = "Unsupported format";
    }
  }
  checkFile("passportScan", true, 5, ["application/pdf", "image/jpeg", "image/jpg", "image/png"]);
  checkFile("kycProof", true, 5, ["application/pdf", "image/jpeg", "image/jpg", "image/png"]);
  return errors;
}
function validateAdditionalApplicant(data: any) {
  const errors: any = {};
  if (!data.maritalStatus) errors.maritalStatus = "Marital status is required";
  if (!data.hasCriminalRecord) errors.hasCriminalRecord = "Please select yes or no for criminal record";
  if (data.hasCriminalRecord === "Yes" && !data.criminalRecordDetails) errors.criminalRecordDetails = "Please provide details";
  return errors;
}
const stepValidators = [
  validateRequirements,
  validateInvestmentOption,
  validateKYC,
  validateUploads,
  validateAdditionalApplicant,
];

// File Upload Field
const FileUploadField: React.FC<{
  name: string;
  label: string;
  accept: string;
  maxSizeMB: number;
  required?: boolean;
  value: any;
  onChange: (file: File | null) => void;
  error?: string;
}> = ({ label, accept, maxSizeMB, required, value, onChange, error }) => {
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setProgress(0);
      let prog = 0;
      const interval = setInterval(() => {
        prog += 25;
        setProgress(Math.min(prog, 100));
        if (prog >= 100) {
          clearInterval(interval);
          onChange(f);
        }
      }, 80);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel shrink>{label}{required ? " *" : ""}</InputLabel>
      <Box
        className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center bg-gray-50"
        sx={{ cursor: "pointer" }}
        onClick={() => inputRef.current?.click()}
      >
        <CloudUploadIcon className="text-primary-1 mb-2" fontSize="large" />
        <Typography variant="body2" className="mb-2">
          {value ? value.name : `Drag & drop or click to upload (${accept})`}
        </Typography>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        {value && (
          <Box className="w-full flex items-center mt-2">
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ flex: 1, mr: 2 }}
            />
            <IconButton onClick={handleRemove} size="small" color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
        <Typography variant="caption" className="mt-1 text-gray-500">
          Max size: {maxSizeMB}MB
        </Typography>
      </Box>
      {error && (
        <Typography color="error" variant="caption">
          {error}
        </Typography>
      )}
    </FormControl>
  );
};

// Step 1: Application Requirements (info fetched from API)
// Following the sample, show requirements as formatted lines (split by newline and dash as bullet), and render description in its format, preserving newlines and emojis, with a monospaced font or as a <pre> block.
const StepRequirements: React.FC<{
  loading: boolean;
  offer: any | null;
  error: string | null;
}> = ({ loading, offer, error }) => {
  // Helper: format requirements (from newline/CRLF or comma separated string)
  const formatRequirements = (reqString: string) => {
    // Split by line break, trim, filter out empty
    return reqString
      .split(/\r?\n/)
      .map(r => r.trim())
      .filter(Boolean);
  };

  return (
    <Box className="space-y-3">
      <Typography variant="h6" className="font-bold mb-3">Application Requirements</Typography>
      {loading ? (
        <Box display="flex" alignItems="center">
          <CircularProgress size={24} />
          <Typography className="ml-2" component="span">Loading requirements...</Typography>
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : offer ? (
        <Box>
          {offer.requirements && typeof offer.requirements === "string" && offer.requirements.trim() ? (
            <ul className="list-disc list-inside text-sm mb-2">
              {formatRequirements(offer.requirements).map((req: string, idx: number) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No requirements listed for this program.
            </Typography>
          )}

          {offer.description && (
            <Box className="mt-2">
              {/* Use <pre> for formatting and preserve line breaks, emoji, and structure */}
              <Typography variant="body2" color="text.secondary" component="pre" sx={{
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
                backgroundColor: "#fafbfc",
                borderRadius: 1,
                p: 2,
                fontSize: "1em"
              }}>
                {offer.description}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="primary" className="mt-2">
            Please ensure that you meet all requirements before continuing.
          </Typography>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Requirements not available.
        </Typography>
      )}
    </Box>
  );
};

// Step 2: Investment Options (Use Checkboxes)
import { Checkbox, FormGroup } from "@mui/material"; // Remove duplicate FormControlLabel import

const investmentOptions = [
  {
    value: "Real Estate",
    label: "Real Estate (min €250,000)",
    minAmount: 250000,
    amountField: "realEstateValue",
    amountLabel: "Real Estate Value (€)",
  },
  {
    value: "Government Bonds",
    label: "Government Bonds (min €350,000)",
    minAmount: 350000,
    // no extra amount field
  },
  {
    value: "Donation",
    label: "Donation (min €100,000)",
    minAmount: 100000,
    amountField: "donationAmount",
    amountLabel: "Donation Amount (€)",
  },
  {
    value: "Business Investment",
    label: "Business Investment (min €500,000)",
    minAmount: 500000,
    // no extra amount field
  },
];

const StepInvestment = ({ values, errors, onChange }: any) => {
  // Convert values.investmentType to array for supporting multiple selection via checkbox
  // If it's not array, treat it as array (for migration)
  const selectedTypes =
    Array.isArray(values.investmentType) && values.investmentType.length
      ? values.investmentType
      : values.investmentType
      ? [values.investmentType]
      : [];

  const handleCheckboxChange = (optionValue: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.checked) {
      // add to array
      onChange("investmentType", [...selectedTypes, optionValue]);
    } else {
      // remove from array
      onChange(
        "investmentType",
        selectedTypes.filter((val: string) => val !== optionValue)
      );
    }
  };

  return (
    <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormControl
        required
        error={!!errors.investmentType}
        component="fieldset"
        variant="standard"
      >
        <Typography component="legend" sx={{ mb: 1 }}>
          Investment Options
        </Typography>
        <FormGroup>
          {investmentOptions.map(opt => (
            <FormControlLabel
              key={opt.value}
              control={
                <Checkbox
                  checked={selectedTypes.includes(opt.value)}
                  onChange={handleCheckboxChange(opt.value)}
                  name={opt.value}
                />
              }
              label={opt.label}
            />
          ))}
        </FormGroup>
        {errors.investmentType && (
          <Typography color="error" variant="caption">
            {errors.investmentType}
          </Typography>
        )}
      </FormControl>

      {/* Amount fields for selected types */}
      {investmentOptions.map(opt =>
        selectedTypes.includes(opt.value) && opt.amountField ? (
          <TextField
            key={opt.amountField}
            label={opt.amountLabel}
            required
            type="number"
            value={values[opt.amountField] || ""}
            onChange={e => onChange(opt.amountField, e.target.value)}
            error={!!errors[opt.amountField]}
            helperText={errors[opt.amountField]}
            inputProps={{ min: opt.minAmount }}
          />
        ) : null
      )}
    </Box>
  );
};

// Step 3: KYC Information
const StepKYC = ({ values, errors, onChange, user, countryOptions }: any) => {
  // Prefill logic: If the KYC fields are empty (undefined/null/""), fill with user data
  // Only runs on first render of the step (or when user changes)
  React.useEffect(() => {
    if (user) {
      if (!values.firstName && user.firstName) onChange("firstName", user.firstName);
      if (!values.lastName && user.lastName) onChange("lastName", user.lastName);
      if (!values.nationality && user.nationality) onChange("nationality", user.nationality);
      if (!values.dateOfBirth && user.dateOfBirth) {
        let dob = user.dateOfBirth;
        // If ISO string, convert to Date
        onChange(
          "dateOfBirth",
          typeof dob === "string" ? new Date(dob) : dob
        );
      }
      if (!values.countryOfResidence && user.countryOfResidence)
        onChange("countryOfResidence", user.countryOfResidence);
      if (!values.passportNumber && user.passportNumber)
        onChange("passportNumber", user.passportNumber);
      if (!values.passportExpiry && user.passportExpiry) {
        let pexp = user.passportExpiry;
        onChange(
          "passportExpiry",
          typeof pexp === "string" ? new Date(pexp) : pexp
        );
      }
    }
    // Only run once, unless user or values change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TextField
        label="First Name"
        required
        value={values.firstName}
        onChange={e => onChange("firstName", e.target.value)}
        error={!!errors.firstName}
        helperText={errors.firstName}
      />
      <TextField
        label="Last Name"
        required
        value={values.lastName}
        onChange={e => onChange("lastName", e.target.value)}
        error={!!errors.lastName}
        helperText={errors.lastName}
      />
      <TextField
        label="Nationality"
        required
        value={values.nationality}
        onChange={e => onChange("nationality", e.target.value)}
        error={!!errors.nationality}
        helperText={errors.nationality}
      />
      <DateInputField
        label="Date of Birth"
        required
        value={values.dateOfBirth || null}
        onChange={date => onChange("dateOfBirth", date)}
        error={!!errors.dateOfBirth}
        helperText={errors.dateOfBirth}
        max={new Date().toISOString().slice(0, 10)}
      />
      <TextField
        label="Passport Number"
        required
        value={values.passportNumber}
        onChange={e => onChange("passportNumber", e.target.value)}
        error={!!errors.passportNumber}
        helperText={errors.passportNumber}
      />
      <DateInputField
        label="Passport Expiry"
        required
        value={values.passportExpiry || null}
        onChange={date => onChange("passportExpiry", date)}
        error={!!errors.passportExpiry}
        helperText={errors.passportExpiry}
        min={new Date().toISOString().slice(0, 10)}
      />
      <FormControl fullWidth required error={!!errors.countryOfResidence}>
        <InputLabel>Country of Residence</InputLabel>
        <Select
          label="Country of Residence"
          value={values.countryOfResidence || ""}
          onChange={e => onChange("countryOfResidence", e.target.value)}
        >
          {(countryOptions || []).map((c: string) => (
            <MenuItem key={c} value={c}>{c}</MenuItem>
          ))}
        </Select>
        {errors.countryOfResidence &&
          <Typography color="error" variant="caption">
            {errors.countryOfResidence}
          </Typography>
        }
      </FormControl>
    </Box>
  );
};

// Step 4: Document Uploads
const StepUploads = ({ values, errors, onChange }: any) => (
  <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <FileUploadField
      name="passportScan"
      label="Passport Scan"
      accept="application/pdf,image/jpeg,image/jpg,image/png"
      maxSizeMB={5}
      required
      value={values.passportScan}
      onChange={file => onChange("passportScan", file)}
      error={errors.passportScan}
    />
    <FileUploadField
      name="kycProof"
      label="Proof of Funds / KYC Document"
      accept="application/pdf,image/jpeg,image/jpg,image/png"
      maxSizeMB={5}
      required
      value={values.kycProof}
      onChange={file => onChange("kycProof", file)}
      error={errors.kycProof}
    />
  </Box>
);

// Step 5: Additional Information
const StepAdditional = ({ values, errors, onChange }: any) => (
  <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <FormControl required error={!!errors.maritalStatus}>
      <InputLabel>Marital Status</InputLabel>
      <Select
        value={values.maritalStatus || ""}
        label="Marital Status"
        onChange={e => onChange("maritalStatus", e.target.value)}
      >
        <MenuItem value="Single">Single</MenuItem>
        <MenuItem value="Married">Married</MenuItem>
        <MenuItem value="Divorced">Divorced</MenuItem>
        <MenuItem value="Widowed">Widowed</MenuItem>
      </Select>
      {errors.maritalStatus &&
        <Typography color="error" variant="caption">
          {errors.maritalStatus}
        </Typography>
      }
    </FormControl>
    <FormControl required error={!!errors.hasCriminalRecord}>
      <Typography className="mb-2">Have you ever been convicted of a crime?</Typography>
      <RadioGroup
        row
        value={values.hasCriminalRecord || ""}
        onChange={e => onChange("hasCriminalRecord", e.target.value)}
      >
        <FormControlLabel value="No" control={<Radio />} label="No" />
        <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
      </RadioGroup>
      {errors.hasCriminalRecord &&
        <Typography color="error" variant="caption">
          {errors.hasCriminalRecord}
        </Typography>
      }
    </FormControl>
    {values.hasCriminalRecord === "Yes" && (
      <TextField
        label="Criminal Record Details"
        required
        value={values.criminalRecordDetails}
        onChange={e => onChange("criminalRecordDetails", e.target.value)}
        error={!!errors.criminalRecordDetails}
        helperText={errors.criminalRecordDetails}
        multiline
        minRows={2}
      />
    )}
  </Box>
);

// Step 6: Review & Submit
const StepReview = ({ data, onEditStep }: { data: any; onEditStep: (step: number) => void }) => {
  const getFileName = (file: any) => (file ? file.name : "Not uploaded");
  return (
    <Box>
      <Typography variant="h6" className="font-bold mb-2">Review Your Application</Typography>
      <Box className="mb-4">
        <Typography variant="subtitle1" className="font-semibold">
          Requirements
          <Button size="small" onClick={() => onEditStep(0)} className="ml-2 text-primary-1">Edit</Button>
        </Typography>
        <Typography variant="body2">
          You have confirmed you meet all application requirements.
        </Typography>
      </Box>
      <Box className="mb-4">
        <Typography variant="subtitle1" className="font-semibold">
          Investment Option
          <Button size="small" onClick={() => onEditStep(1)} className="ml-2 text-primary-1">Edit</Button>
        </Typography>
        <Typography variant="body2">
          Option: {data.investmentType} <br />
          {data.investmentType === "Real Estate" && <>Property Value: €{data.realEstateValue}</>}
          {data.investmentType === "Donation" && <>Donation: €{data.donationAmount}</>}
        </Typography>
      </Box>
      <Box className="mb-4">
        <Typography variant="subtitle1" className="font-semibold">
          KYC Information
          <Button size="small" onClick={() => onEditStep(2)} className="ml-2 text-primary-1">Edit</Button>
        </Typography>
        <Typography variant="body2">
          {data.firstName} {data.lastName} <br />
          Nationality: {data.nationality} <br />
          DOB: {data.dateOfBirth?.toLocaleDateString?.() || data.dateOfBirth} <br />
          Passport: {data.passportNumber} (Expiry: {data.passportExpiry?.toLocaleDateString?.() || data.passportExpiry}) <br />
          Country of Residence: {data.countryOfResidence}
        </Typography>
      </Box>
      <Box className="mb-4">
        <Typography variant="subtitle1" className="font-semibold">
          Uploads
          <Button size="small" onClick={() => onEditStep(3)} className="ml-2 text-primary-1">Edit</Button>
        </Typography>
        <Typography variant="body2">
          Passport Scan: {getFileName(data.passportScan)} <br />
          KYC Proof: {getFileName(data.kycProof)}
        </Typography>
      </Box>
      <Box className="mb-4">
        <Typography variant="subtitle1" className="font-semibold">
          Additional Details
          <Button size="small" onClick={() => onEditStep(4)} className="ml-2 text-primary-1">Edit</Button>
        </Typography>
        <Typography variant="body2">
          Marital Status: {data.maritalStatus} <br />
          Criminal Record: {data.hasCriminalRecord} <br />
          {data.hasCriminalRecord === "Yes" && <>Details: {data.criminalRecordDetails} <br /></>}
        </Typography>
      </Box>
      <Box className="flex gap-2 mt-4">
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
        >
          Print
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "eu-citizenship-application.json";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Download
        </Button>
      </Box>
    </Box>
  );
};

// Success Page
const SuccessPage = ({ reference }: { reference: string }) => (
  <Box className="flex flex-col items-center justify-center min-h-[60vh]">
    <Typography variant="h4" className="font-bold mb-4 text-green-700">
      🎉 Application Submitted!
    </Typography>
    <Typography variant="h6" className="mb-2">
      Congratulations, your European Citizenship Application has been received.
    </Typography>
    <Typography variant="body1" className="mb-4">
      Your reference number is: <span className="font-bold text-primary-1">{reference}</span>
    </Typography>
    <Button
      variant="contained"
      color="primary"
      className="rounded-full px-8 py-2"
      onClick={() => {
        // Clear form by refreshing
        window.location.reload();
      }}
    >
      Start New Application
    </Button>
  </Box>
);

// Main Multi-Step Form Page
const EuropeanCitizenshipForm: React.FC = () => {
  // Get offer ID from params.
  const { id } = useParams<{ id: string }>();

  // State for offer details in Step 1
  const [offerLoading, setOfferLoading] = useState(true);
  const [offerError, setOfferError] = useState<string | null>(null);
  const [offer, setOffer] = useState<any | null>(null);

  useEffect(() => {
    let ignore = false;
    setOfferLoading(true);
    setOfferError(null);
    setOffer(null);
    if (id) {
      getEuropeanCitizenshipProgramsById(id)
        .then((data) => {
          if (!ignore) {
            setOffer(data);
            setOfferLoading(false);
          }
        })
        .catch((err) => {
          if (!ignore) {
            setOfferError(
              err && err.message ? err.message : "Failed to load requirements/data."
            );
            setOfferLoading(false);
          }
        });
    } else {
      setOfferError("No citizenship offer ID provided in the URL.");
      setOfferLoading(false);
    }
    return () => {
      ignore = true;
    };
  }, [id]);

  // Load from localStorage if available (here: always returns empty)
  function loadFromLocalStorage() {
      return { data: undefined, step: 0 };
  }
  const { data: _savedData, step: savedStep } = loadFromLocalStorage();

  // Current user
  const { user } = useAuth();

  // Prefill logic if desired
  const USER_PREFILL = {
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    nationality: user?.nationality || user?.country || "",
    dateOfBirth: user?.date_of_birth || "",
    countryOfResidence: user?.country_of_residence || user?.country || "",
  };

  // State for stepper
  const [activeStep, setActiveStep] = useState(savedStep || 0);
  const [submitting, setSubmitting] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Dropdowns
  const [countryOptions, setCountryOptions] = useState<string[] | null>(null);
  useEffect(() => {
    fetchCountries().then(setCountryOptions);
  }, []);

  // Form values
  interface CitizenshipFormValues {
    // Requirements: no input
    // Step 2 - Investment
    investmentType?: string;
    realEstateValue?: string;
    donationAmount?: string;
    // Step 3 - KYC
    firstName: string;
    lastName: string;
    nationality: string;
    dateOfBirth: Date | null;
    passportNumber: string;
    passportExpiry: Date | null;
    countryOfResidence: string;
    // Step 4 - Uploads
    passportScan: File | null;
    kycProof: File | null;
    // Step 5 - Additional
    maritalStatus?: string;
    hasCriminalRecord?: string;
    criminalRecordDetails?: string;
  }
  const [formValues, setFormValues] = useState<CitizenshipFormValues>({
    // Step 2
    investmentType: "",
    realEstateValue: "",
    donationAmount: "",
    // Step 3
    firstName: USER_PREFILL.firstName || "",
    lastName: USER_PREFILL.lastName || "",
    nationality: USER_PREFILL.nationality || "",
    dateOfBirth: USER_PREFILL.dateOfBirth ? new Date(USER_PREFILL.dateOfBirth) : null,
    passportNumber: "",
    passportExpiry: null,
    countryOfResidence: USER_PREFILL.countryOfResidence || "",
    // Step 4
    passportScan: null,
    kycProof: null,
    // Step 5
    maritalStatus: "",
    hasCriminalRecord: "",
    criminalRecordDetails: "",
  });

  const [formErrors, setFormErrors] = useState<any>({});

  // Stepper content
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <StepRequirements loading={offerLoading} offer={offer} error={offerError} />;
      case 1:
        return <StepInvestment values={formValues} errors={formErrors} onChange={handleFieldChange} />;
      case 2:
        return <StepKYC values={formValues} errors={formErrors} onChange={handleFieldChange} user={user} countryOptions={countryOptions} />;
      case 3:
        return <StepUploads values={formValues} errors={formErrors} onChange={handleFieldChange} />;
      case 4:
        return <StepAdditional values={formValues} errors={formErrors} onChange={handleFieldChange} />;
      case 5:
        return <StepReview data={formValues} onEditStep={s => setActiveStep(s)} />;
      default:
        return null;
    }
  };

  function handleFieldChange(field: string, value: any) {
    setFormValues((prev: any) => ({
      ...prev,
      [field]: value,
    }));
    setFormErrors((prev: any) => ({
      ...prev,
      [field]: undefined,
    }));
  }

  function validateStep(): boolean {
    const validator = stepValidators[activeStep];
    if (!validator) return true;
    const errors = validator(formValues);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) {
      setSnackbar({ open: true, message: "Please fix errors before continuing.", severity: "error" });
      return;
    }
    if (activeStep === steps.length - 1) {
      setSubmitting(true);
      try {
        // For demo: convert files to file names and format dates as ISO
        const values = { ...formValues };
        const payload = {
          ...values,
          dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null,
          passportExpiry: values.passportExpiry ? values.passportExpiry.toISOString() : null,
          passportScan: values.passportScan?.name || "",
          kycProof: values.kycProof?.name || "",
        };
        const res = await mockApiSubmit(payload);
        setSuccessRef(res.reference);
      } catch (e) {
        setSnackbar({ open: true, message: "Submission failed. Please try again.", severity: "error" });
      } finally {
        setSubmitting(false);
      }
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => setActiveStep(prev => prev - 1);

  const progress = ((activeStep + 1) / steps.length) * 100;

  if (successRef) return <SuccessPage reference={successRef} />;

  return (
    <Box sx={{
      px: { xs: 1, sm: 2, md: 4 },
      py: { xs: 1, sm: 2 },
      width: "100%",
      maxWidth: 1400,
      mx: "auto",
    }}>
      <CustomerPageHeader>
        <Typography variant="h4" className="font-bold mb-6">
          European Citizenship Application
        </Typography>
      </CustomerPageHeader>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ height: 8, borderRadius: 4, mb: 3 }}
        color="primary"
      />
      <Stepper activeStep={activeStep} alternativeLabel className="mb-6">
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>
              <span className="text-xs md:text-sm">{label}</span>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      <form
        onSubmit={handleNext}
        autoComplete="off"
        className="flex flex-col gap-6"
      >
        <Box>{getStepContent(activeStep)}</Box>
        <Box className="flex justify-between mt-4">
          <Button
            disabled={activeStep === 0 || submitting}
            onClick={handleBack}
            variant="outlined"
            className="rounded-full px-6"
          >
            Back
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className="rounded-full px-8"
            disabled={submitting}
          >
            {submitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : activeStep === steps.length - 1 ? (
              "Submit"
            ) : (
              "Next"
            )}
          </Button>
        </Box>
      </form>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EuropeanCitizenshipForm;
