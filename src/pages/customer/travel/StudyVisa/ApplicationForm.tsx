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
  Autocomplete,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import { v4 as uuidv4 } from "uuid";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import { useAuth } from "../../../../context/AuthContext";
import { fetchCountries, fetchSponsorshipTypes, fetchUniversities, fetchVisaTypes } from "../../../../services/definitionService";

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
  // Convert Date to yyyy-MM-dd string for input value
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

// Step titles
const steps = [
  "Personal Information",
  "Educational Background",
  "Visa & Study Details",
  "Document Uploads",
  "Additional Information",
  "Review & Submit",
];

// // NOTE: We are NOT saving to localStorage anymore. The following helpers are now no-ops.
// function saveToLocalStorage(_data: any, _step: number) {
//   // No-op: localStorage saving removed
// }
function loadFromLocalStorage() {
  // No-op: always return empty data and step 0
  return {
    data: undefined,
    step: 0,
  };
}
function clearLocalStorage() {
  // No-op: localStorage clearing removed
}

// Validation functions for each step
function validatePersonalInfo(data: any) {
  const errors: any = {};
  if (!data.firstName) errors.firstName = "First name is required";
  if (!data.lastName) errors.lastName = "Last name is required";
  if (!data.email) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Invalid email";
  if (!data.phone) errors.phone = "Phone number is required";
  if (!data.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
  if (!data.gender) errors.gender = "Gender is required";
  if (!data.nationality) errors.nationality = "Nationality is required";
  if (!data.passportNumber) errors.passportNumber = "Passport number is required";
  if (!data.passportExpiry) errors.passportExpiry = "Passport expiry date is required";
  if (!data.currentAddress) errors.currentAddress = "Current address is required";
  if (!data.countryOfResidence) errors.countryOfResidence = "Country of residence is required";
  return errors;
}
function validateEducation(data: any) {
  const errors: any = {};
  if (!data.highestQualification) errors.highestQualification = "Qualification is required";
  if (!data.institutionName) errors.institutionName = "Institution name is required";
  if (!data.courseOfStudy) errors.courseOfStudy = "Course of study is required";
  if (data.cgpa === "" || data.cgpa === undefined || data.cgpa === null) errors.cgpa = "CGPA/Grade is required";
  else if (isNaN(Number(data.cgpa))) errors.cgpa = "CGPA/Grade must be a number";
  else if (Number(data.cgpa) < 0) errors.cgpa = "Minimum is 0";
  else if (Number(data.cgpa) > 5) errors.cgpa = "Maximum is 5";
  if (!data.graduationYear && data.graduationYear !== 0) errors.graduationYear = "Year of graduation is required";
  else if (isNaN(Number(data.graduationYear))) errors.graduationYear = "Year must be a number";
  else if (Number(data.graduationYear) < 1950) errors.graduationYear = "Year too old";
  else if (Number(data.graduationYear) > new Date().getFullYear()) errors.graduationYear = "Year cannot be in the future";
  return errors;
}
function validateVisaStudy(data: any) {
  const errors: any = {};
  if (!data.destinationCountry) errors.destinationCountry = "Destination country is required";
  if (!data.universityApplying) errors.universityApplying = "University/College is required";
  if (!data.intendedStartDate) errors.intendedStartDate = "Start date is required";
  if (!data.intendedEndDate) errors.intendedEndDate = "End date is required";
  else if (data.intendedStartDate && new Date(data.intendedEndDate) < new Date(data.intendedStartDate)) {
    errors.intendedEndDate = "End date must be after start date";
  }
  if (!data.visaType) errors.visaType = "Visa type is required";
  if (!data.sponsorship) errors.sponsorship = "Sponsorship is required";
  return errors;
}
function validateDocuments(data: any) {
  const errors: any = {};
  // Helper for file validation
  function checkFile(field: string, required: boolean, maxSize: number, types: string[]) {
    const file = data[field];
    if (required && !file) errors[field] = "This file is required";
    if (file) {
      if (file.size > maxSize * 1024 * 1024) errors[field] = "File too large";
      if (types.length && !types.includes(file.type)) errors[field] = "Unsupported format";
    }
  }
  checkFile("passportPhoto", true, 2, ["image/jpeg", "image/png", "image/jpg"]);
  checkFile("passportDoc", true, 5, ["application/pdf", "image/jpeg", "image/png", "image/jpg"]);
  checkFile("transcript", true, 5, ["application/pdf", "image/jpeg", "image/png", "image/jpg"]);
  checkFile("admissionLetter", false, 5, ["application/pdf", "image/jpeg", "image/png", "image/jpg"]);
  checkFile("financialStatement", true, 5, ["application/pdf", "image/jpeg", "image/png", "image/jpg"]);
  checkFile("englishTest", false, 5, ["application/pdf", "image/jpeg", "image/png", "image/jpg"]);
  return errors;
}
function validateAdditional(data: any) {
  const errors: any = {};
  if (!data.previousVisa) errors.previousVisa = "Please select Yes or No";
  if (data.previousVisa === "Yes" && !data.previousVisaDetails) errors.previousVisaDetails = "Please provide details";
  if (!data.emergencyContactName) errors.emergencyContactName = "Contact name is required";
  if (!data.emergencyContactPhone) errors.emergencyContactPhone = "Contact phone is required";
  if (!data.statementOfPurpose) errors.statementOfPurpose = "Statement of purpose is required";
  else if (data.statementOfPurpose.length < 30) errors.statementOfPurpose = "Statement should be at least 30 characters";
  return errors;
}
const stepValidators = [
  validatePersonalInfo,
  validateEducation,
  validateVisaStudy,
  validateDocuments,
  validateAdditional,
];

// File Upload Component with progress
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
      // Simulate upload progress
      let prog = 0;
      const interval = setInterval(() => {
        prog += 20;
        setProgress(Math.min(prog, 100));
        if (prog >= 100) {
          clearInterval(interval);
          onChange(f);
        }
      }, 100);
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

// Step 1: Personal Information
const StepPersonalInfo = ({
  values,
  errors,
  onChange,
  user,
}: any) => (
  <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <TextField
      label="First Name"
      required
      value={values.firstName}
      InputProps={{ readOnly: true }}
      error={!!errors.firstName}
      helperText={errors.firstName}
    />
    <TextField
      label="Last Name"
      required
      value={values.lastName}
      InputProps={{ readOnly: true }}
      error={!!errors.lastName}
      helperText={errors.lastName}
    />
    <TextField
      label="Middle Name"
      value={values.middleName}
      InputProps={{ readOnly: true }}
      error={!!errors.middleName}
      helperText={errors.middleName}
    />
    <TextField
      label="Email"
      required
      value={values.email}
      InputProps={{ readOnly: true }}
      error={!!errors.email}
      helperText={errors.email}
    />
    <TextField
      label="Phone Number"
      required
      value={values.phone}
      InputProps={{ readOnly: true }}
      error={!!errors.phone}
      helperText={errors.phone}
    />
    <DateInputField
      label="Date of Birth"
      required
      value={
        // Always get date of birth from user profile if available
        user?.date_of_birth
          ? new Date(user.date_of_birth)
          : values.dateOfBirth || null
      }
      onChange={() => {}}
      error={!!errors.dateOfBirth}
      helperText={errors.dateOfBirth}
      max={new Date().toISOString().slice(0, 10)}
      readOnly={true}
    />
    <TextField
      label="Gender"
      required
      value={values.gender}
      InputProps={{ readOnly: true }}
      error={!!errors.gender}
      helperText={errors.gender}
    />
    <TextField
      label="Nationality"
      required
      value={values.nationality}
      InputProps={{ readOnly: true }}
      error={!!errors.nationality}
      helperText={errors.nationality}
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
      label="Passport Expiry Date"
      required
      value={values.passportExpiry || null}
      onChange={date => onChange("passportExpiry", date)}
      error={!!errors.passportExpiry}
      helperText={errors.passportExpiry}
      min={new Date().toISOString().slice(0, 10)}
    />
    <TextField
      label="Current Address"
      required
      value={values.currentAddress}
      InputProps={{ readOnly: true }}
      error={!!errors.currentAddress}
      helperText={errors.currentAddress}
    />
    <TextField
      label="Country of Residence"
      required
      value={values.countryOfResidence}
      InputProps={{ readOnly: true }}
      error={!!errors.countryOfResidence}
      helperText={errors.countryOfResidence}
    />
  </Box>
);

// Step 2: Educational Background
const StepEducation = ({ values, errors, onChange }: any) => (
  <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <TextField
      label="Highest Qualification"
      required
      value={values.highestQualification}
      onChange={e => onChange("highestQualification", e.target.value)}
      error={!!errors.highestQualification}
      helperText={errors.highestQualification}
    />
    <TextField
      label="University/Institution Name"
      required
      value={values.institutionName}
      onChange={e => onChange("institutionName", e.target.value)}
      error={!!errors.institutionName}
      helperText={errors.institutionName}
    />
    <TextField
      label="Course of Study / Intended Program"
      required
      value={values.courseOfStudy}
      onChange={e => onChange("courseOfStudy", e.target.value)}
      error={!!errors.courseOfStudy}
      helperText={errors.courseOfStudy}
    />
    <TextField
      label="CGPA / Grade"
      required
      value={values.cgpa}
      onChange={e => onChange("cgpa", e.target.value)}
      error={!!errors.cgpa}
      helperText={errors.cgpa}
      type="number"
      inputProps={{ step: "0.01", min: 0, max: 5 }}
    />
    <TextField
      label="Year of Graduation"
      required
      value={values.graduationYear}
      onChange={e => onChange("graduationYear", e.target.value)}
      error={!!errors.graduationYear}
      helperText={errors.graduationYear}
      type="number"
      inputProps={{ min: 1950, max: new Date().getFullYear() }}
    />
  </Box>
);

// Step 3: Visa & Study Details
const StepVisaStudy = ({
  values,
  errors,
  onChange,
  countryOptions,
  universityOptions,
  visaTypeOptions,
  sponsorshipOptions,
}: any) => {
  return (
    <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Autocomplete
        options={countryOptions || []}
        value={values.destinationCountry || ""}
        onChange={(_, value) => onChange("destinationCountry", value)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Destination Country"
            required
            error={!!errors.destinationCountry}
            helperText={errors.destinationCountry}
          />
        )}
        loading={!countryOptions}
      />
      <Autocomplete
        options={universityOptions || []}
        value={values.universityApplying || ""}
        onChange={(_, value) => onChange("universityApplying", value)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="University/College Applying To"
            required
            error={!!errors.universityApplying}
            helperText={errors.universityApplying}
          />
        )}
        loading={!universityOptions}
      />
      <DateInputField
        label="Intended Start Date"
        required
        value={values.intendedStartDate || null}
        onChange={date => onChange("intendedStartDate", date)}
        error={!!errors.intendedStartDate}
        helperText={errors.intendedStartDate}
        min={new Date().toISOString().slice(0, 10)}
      />
      <DateInputField
        label="Intended End Date"
        required
        value={values.intendedEndDate || null}
        onChange={date => onChange("intendedEndDate", date)}
        error={!!errors.intendedEndDate}
        helperText={errors.intendedEndDate}
        min={
          values.intendedStartDate
            ? new Date(values.intendedStartDate).toISOString().slice(0, 10)
            : undefined
        }
      />
      <FormControl required error={!!errors.visaType}>
        <InputLabel>Type of Visa</InputLabel>
        <Select
          value={values.visaType}
          label="Type of Visa"
          onChange={e => onChange("visaType", e.target.value)}
        >
          {visaTypeOptions && visaTypeOptions.length > 0
            ? visaTypeOptions.map((v: string) => (
                <MenuItem key={v} value={v}>
                  {v}
                </MenuItem>
              ))
            : [
                <MenuItem key="Student" value="Student">
                  Student
                </MenuItem>,
                <MenuItem key="Exchange" value="Exchange">
                  Exchange
                </MenuItem>,
                <MenuItem key="Research" value="Research">
                  Research
                </MenuItem>,
              ]}
        </Select>
        <Typography color="error" variant="caption">
          {errors.visaType}
        </Typography>
      </FormControl>
      <FormControl required error={!!errors.sponsorship}>
        <InputLabel>Sponsorship</InputLabel>
        <Select
          value={values.sponsorship}
          label="Sponsorship"
          onChange={e => onChange("sponsorship", e.target.value)}
        >
          {sponsorshipOptions && sponsorshipOptions.length > 0
            ? sponsorshipOptions.map((s: string) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))
            : [
                <MenuItem key="Self-funded" value="Self-funded">
                  Self-funded
                </MenuItem>,
                <MenuItem key="Sponsored" value="Sponsored">
                  Sponsored
                </MenuItem>,
              ]}
        </Select>
        <Typography color="error" variant="caption">
          {errors.sponsorship}
        </Typography>
      </FormControl>
    </Box>
  );
};

// Step 4: Document Uploads
const StepDocuments = ({ values, errors, onChange }: any) => (
  <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <FileUploadField
      name="passportPhoto"
      label="Passport Photograph"
      accept="image/jpeg,image/png,image/jpg"
      maxSizeMB={2}
      required
      value={values.passportPhoto}
      onChange={file => onChange("passportPhoto", file)}
      error={errors.passportPhoto}
    />
    <FileUploadField
      name="passportDoc"
      label="International Passport (PDF or Image)"
      accept="application/pdf,image/jpeg,image/png,image/jpg"
      maxSizeMB={5}
      required
      value={values.passportDoc}
      onChange={file => onChange("passportDoc", file)}
      error={errors.passportDoc}
    />
    <FileUploadField
      name="transcript"
      label="Academic Transcript"
      accept="application/pdf,image/jpeg,image/png,image/jpg"
      maxSizeMB={5}
      required
      value={values.transcript}
      onChange={file => onChange("transcript", file)}
      error={errors.transcript}
    />
    <FileUploadField
      name="admissionLetter"
      label="Admission Letter (if available)"
      accept="application/pdf,image/jpeg,image/png,image/jpg"
      maxSizeMB={5}
      value={values.admissionLetter}
      onChange={file => onChange("admissionLetter", file)}
      error={errors.admissionLetter}
    />
    <FileUploadField
      name="financialStatement"
      label="Financial Statement / Bank Proof"
      accept="application/pdf,image/jpeg,image/png,image/jpg"
      maxSizeMB={5}
      required
      value={values.financialStatement}
      onChange={file => onChange("financialStatement", file)}
      error={errors.financialStatement}
    />
    <FileUploadField
      name="englishTest"
      label="English Proficiency Test (IELTS/TOEFL) if applicable"
      accept="application/pdf,image/jpeg,image/png,image/jpg"
      maxSizeMB={5}
      value={values.englishTest}
      onChange={file => onChange("englishTest", file)}
      error={errors.englishTest}
    />
  </Box>
);

// Step 5: Additional Information
const StepAdditional = ({ values, errors, onChange }: any) => (
  <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <FormControl required>
      <Typography className="mb-2">Previous Visa Applications?</Typography>
      <RadioGroup
        row
        value={values.previousVisa}
        onChange={e => onChange("previousVisa", e.target.value)}
      >
        <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
        <FormControlLabel value="No" control={<Radio />} label="No" />
      </RadioGroup>
      {errors.previousVisa && (
        <Typography color="error" variant="caption">
          {errors.previousVisa}
        </Typography>
      )}
    </FormControl>
    {values.previousVisa === "Yes" && (
      <TextField
        label="Details of Previous Visa Applications"
        required
        value={values.previousVisaDetails}
        onChange={e => onChange("previousVisaDetails", e.target.value)}
        error={!!errors.previousVisaDetails}
        helperText={errors.previousVisaDetails}
      />
    )}
    <TextField
      label="Travel History (Countries visited, Dates)"
      multiline
      minRows={2}
      value={values.travelHistory}
      onChange={e => onChange("travelHistory", e.target.value)}
      error={!!errors.travelHistory}
      helperText={errors.travelHistory}
    />
    <TextField
      label="Emergency Contact Name"
      required
      value={values.emergencyContactName}
      onChange={e => onChange("emergencyContactName", e.target.value)}
      error={!!errors.emergencyContactName}
      helperText={errors.emergencyContactName}
    />
    <TextField
      label="Emergency Contact Phone"
      required
      value={values.emergencyContactPhone}
      onChange={e => onChange("emergencyContactPhone", e.target.value)}
      error={!!errors.emergencyContactPhone}
      helperText={errors.emergencyContactPhone}
    />
    <TextField
      label="Short Statement of Purpose"
      required
      multiline
      minRows={4}
      value={values.statementOfPurpose}
      onChange={e => onChange("statementOfPurpose", e.target.value)}
      error={!!errors.statementOfPurpose}
      helperText={errors.statementOfPurpose}
    />
  </Box>
);

// Step 6: Review & Submit
const StepReview = ({ data, onEditStep }: { data: any; onEditStep: (step: number) => void }) => {
  // Helper to display file names
  const getFileName = (file: any) => (file ? file.name : "Not uploaded");
  return (
    <Box>
      <Typography variant="h6" className="font-bold mb-2">
        Review Your Application
      </Typography>
      <Box className="mb-4">
        <Typography variant="subtitle1" className="font-semibold">
          Personal Information
          <Button size="small" onClick={() => onEditStep(0)} className="ml-2 text-primary-1">Edit</Button>
        </Typography>
        <Typography variant="body2">
          {data.firstName} {data.middleName} {data.lastName} <br />
          Email: {data.email} | Phone: {data.phone} <br />
          DOB: {data.dateOfBirth?.toLocaleDateString?.() || data.dateOfBirth} | Gender: {data.gender} <br />
          Nationality: {data.nationality} <br />
          Passport: {data.passportNumber} (Expiry: {data.passportExpiry?.toLocaleDateString?.() || data.passportExpiry}) <br />
          Address: {data.currentAddress}, {data.countryOfResidence}
        </Typography>
      </Box>
      <Box className="mb-4">
        <Typography variant="subtitle1" className="font-semibold">
          Educational Background
          <Button size="small" onClick={() => onEditStep(1)} className="ml-2 text-primary-1">Edit</Button>
        </Typography>
        <Typography variant="body2">
          {data.highestQualification} from {data.institutionName} <br />
          Course: {data.courseOfStudy} <br />
          CGPA/Grade: {data.cgpa} <br />
          Graduation Year: {data.graduationYear}
        </Typography>
      </Box>
      <Box className="mb-4">
        <Typography variant="subtitle1" className="font-semibold">
          Visa & Study Details
          <Button size="small" onClick={() => onEditStep(2)} className="ml-2 text-primary-1">Edit</Button>
        </Typography>
        <Typography variant="body2">
          Destination: {data.destinationCountry} <br />
          University: {data.universityApplying} <br />
          Start: {data.intendedStartDate?.toLocaleDateString?.() || data.intendedStartDate} <br />
          End: {data.intendedEndDate?.toLocaleDateString?.() || data.intendedEndDate} <br />
          Visa Type: {data.visaType} <br />
          Sponsorship: {data.sponsorship}
        </Typography>
      </Box>
      <Box className="mb-4">
        <Typography variant="subtitle1" className="font-semibold">
          Documents
          <Button size="small" onClick={() => onEditStep(3)} className="ml-2 text-primary-1">Edit</Button>
        </Typography>
        <Typography variant="body2">
          Passport Photo: {getFileName(data.passportPhoto)} <br />
          International Passport: {getFileName(data.passportDoc)} <br />
          Transcript: {getFileName(data.transcript)} <br />
          Admission Letter: {getFileName(data.admissionLetter)} <br />
          Financial Statement: {getFileName(data.financialStatement)} <br />
          English Test: {getFileName(data.englishTest)}
        </Typography>
      </Box>
      <Box className="mb-4">
        <Typography variant="subtitle1" className="font-semibold">
          Additional Information
          <Button size="small" onClick={() => onEditStep(4)} className="ml-2 text-primary-1">Edit</Button>
        </Typography>
        <Typography variant="body2">
          Previous Visa: {data.previousVisa} <br />
          {data.previousVisa === "Yes" && <>Details: {data.previousVisaDetails} <br /></>}
          Travel History: {data.travelHistory} <br />
          Emergency Contact: {data.emergencyContactName} ({data.emergencyContactPhone}) <br />
          Statement of Purpose: <br />
          <span className="whitespace-pre-line">{data.statementOfPurpose}</span>
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
            // Download as JSON for demo; in real app, generate PDF
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "study-visa-application.json";
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
      Congratulations, your Study Visa Application has been received.
    </Typography>
    <Typography variant="body1" className="mb-4">
      Your reference number is: <span className="font-bold text-primary-1">{reference}</span>
    </Typography>
    <Button
      variant="contained"
      color="primary"
      className="rounded-full px-8 py-2"
      onClick={() => {
        clearLocalStorage();
        window.location.reload();
      }}
    >
      Start New Application
    </Button>
  </Box>
);

// Main Multi-Step Form Page
const StudyVisaApplicationForm: React.FC = () => {
  // Load from localStorage if available (now always returns empty)
  const { data: _savedData, step: savedStep } = loadFromLocalStorage();

  // Get logged-in user from useAuth
  const { user } = useAuth();

  // Build user prefill from logged-in user
  // USER_PREFILL: Build prefill object from user profile, using correct field names and fallbacks
  const USER_PREFILL = {
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    middleName: user?.middle_name || "",
    email: user?.email || "",
    phone: user?.phone_number || "",
    gender: user?.gender_name || "",
    dateOfBirth: user?.date_of_birth || "",
    nationality: user?.nationality || user?.country || "",
    currentAddress: user?.current_address || user?.address || "",
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

  // Dropdown state
  const [countryOptions, setCountryOptions] = useState<string[] | null>(null);
  const [universityOptions, setUniversityOptions] = useState<string[] | null>(null);
  const [visaTypeOptions, setVisaTypeOptions] = useState<string[] | null>(null);
  const [sponsorshipOptions, setSponsorshipOptions] = useState<string[] | null>(null);

  // Fetch dropdowns on mount
  useEffect(() => {
    fetchCountries().then(setCountryOptions);
    fetchUniversities().then(setUniversityOptions);
    fetchVisaTypes().then(setVisaTypeOptions);
    fetchSponsorshipTypes().then(setSponsorshipOptions);
  }, []);

  // Form state
  // Define a type for the form values to avoid 'never' property errors
  interface StudyVisaFormValues {
    // Step 1
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    phone: string;
    dateOfBirth: Date | null;
    gender: string;
    nationality: string;
    passportNumber: string;
    passportExpiry: Date | null;
    currentAddress: string;
    countryOfResidence: string;
    // Step 2
    highestQualification: string;
    institutionName: string;
    courseOfStudy: string;
    cgpa: string;
    graduationYear: string;
    // Step 3
    destinationCountry: string;
    universityApplying: string;
    intendedStartDate: Date | null;
    intendedEndDate: Date | null;
    visaType: string;
    sponsorship: string;
    // Step 4
    passportPhoto: File | null;
    passportDoc: File | null;
    transcript: File | null;
    admissionLetter: File | null;
    financialStatement: File | null;
    englishTest: File | null;
    // Step 5
    previousVisa: string;
    previousVisaDetails: string;
    travelHistory: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    statementOfPurpose: string;
  }

  const [formValues, setFormValues] = useState<StudyVisaFormValues>({
    // Step 1
    firstName: USER_PREFILL.firstName ?? "",
    lastName: USER_PREFILL.lastName ?? "",
    middleName: USER_PREFILL.middleName ?? "",
    email: USER_PREFILL.email ?? "",
    phone: USER_PREFILL.phone ?? "",
    dateOfBirth: USER_PREFILL.dateOfBirth ? new Date(USER_PREFILL.dateOfBirth) : null,
    gender: USER_PREFILL.gender || "",
    nationality: USER_PREFILL.nationality || "",
    passportNumber: "",
    passportExpiry: null,
    currentAddress: USER_PREFILL.currentAddress || "",
    countryOfResidence: USER_PREFILL.countryOfResidence || "",
    // Step 2
    highestQualification: "",
    institutionName: "",
    courseOfStudy: "",
    cgpa: "",
    graduationYear: "",
    // Step 3
    destinationCountry: "",
    universityApplying: "",
    intendedStartDate: null,
    intendedEndDate: null,
    visaType: "",
    sponsorship: "",
    // Step 4
    passportPhoto: null,
    passportDoc: null,
    transcript: null,
    admissionLetter: null,
    financialStatement: null,
    englishTest: null,
    // Step 5
    previousVisa: "",
    previousVisaDetails: "",
    travelHistory: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    statementOfPurpose: "",
  });

  const [formErrors, setFormErrors] = useState<any>({});

  // Stepper content
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <StepPersonalInfo
            values={formValues}
            errors={formErrors}
            onChange={handleFieldChange}
            user={user}
          />
        );
      case 1:
        return <StepEducation values={formValues} errors={formErrors} onChange={handleFieldChange} />;
      case 2:
        return (
          <StepVisaStudy
            values={formValues}
            errors={formErrors}
            onChange={handleFieldChange}
            countryOptions={countryOptions}
            universityOptions={universityOptions}
            visaTypeOptions={visaTypeOptions}
            sponsorshipOptions={sponsorshipOptions}
          />
        );
      case 3:
        return <StepDocuments values={formValues} errors={formErrors} onChange={handleFieldChange} />;
      case 4:
        return <StepAdditional values={formValues} errors={formErrors} onChange={handleFieldChange} />;
      case 5:
        return (
          <StepReview
            data={formValues}
            onEditStep={(s) => setActiveStep(s)}
          />
        );
      default:
        return null;
    }
  };

  // Handle field change
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

  // Validate current step
  function validateStep(): boolean {
    const validator = stepValidators[activeStep];
    if (!validator) return true;
    const errors = validator(formValues);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // Handle next/submit
  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) {
      setSnackbar({ open: true, message: "Please fix errors before continuing.", severity: "error" });
      return;
    }
    if (activeStep === steps.length - 1) {
      // Submit
      setSubmitting(true);
      try {
        // Prepare data for API (convert dates to ISO, remove files for demo)
        const values = { ...formValues };
        const payload = {
          ...values,
          // Always get date of birth from user profile if available
          dateOfBirth: user?.date_of_birth
            ? new Date(user.date_of_birth).toISOString()
            : values.dateOfBirth
            ? values.dateOfBirth.toISOString()
            : null,
          passportExpiry: values.passportExpiry ? values.passportExpiry.toISOString() : null,
          intendedStartDate: values.intendedStartDate ? values.intendedStartDate.toISOString() : null,
          intendedEndDate: values.intendedEndDate ? values.intendedEndDate.toISOString() : null,
          // For demo, just send file names
          passportPhoto: values.passportPhoto?.name || "",
          passportDoc: values.passportDoc?.name || "",
          transcript: values.transcript?.name || "",
          admissionLetter: values.admissionLetter?.name || "",
          financialStatement: values.financialStatement?.name || "",
          englishTest: values.englishTest?.name || "",
        };
        const res = await mockApiSubmit(payload);
        setSuccessRef(res.reference);
        clearLocalStorage();
      } catch (e) {
        setSnackbar({ open: true, message: "Submission failed. Please try again.", severity: "error" });
      } finally {
        setSubmitting(false);
      }
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  // Handle back
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Progress bar
  const progress = ((activeStep + 1) / steps.length) * 100;

  // If submitted, show success page
  if (successRef) {
    return <SuccessPage reference={successRef} />;
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
        <Typography variant="h4" className="font-bold mb-6">
          Study Visa Application
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

export default StudyVisaApplicationForm;
