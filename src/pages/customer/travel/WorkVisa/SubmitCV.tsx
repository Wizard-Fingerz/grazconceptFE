import React, { useState, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputLabel,
  FormControl,
  MenuItem,
  Select,
  Chip,
  Stack,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import { CountrySelect } from "../../../../components/CountrySelect";

const allowedFileTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const maxFileSizeMB = 5;

const skillsList = [
  "JavaScript",
  "Python",
  "Project Management",
  "Customer Service",
  "Data Analysis",
  "Healthcare",
  "Construction",
  "Teaching",
  "Driving",
  "Warehouse Operations",
  "Other",
];

export const SubmitCV: React.FC = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    job: "",
    skills: [] as string[],
    coverLetter: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileError, setCvFileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
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

  const handleSkillsChange = (
    event: React.ChangeEvent<HTMLInputElement> | { target: { value: unknown } }
  ) => {
    const value =
      "target" in event && event.target
        ? event.target.value
        : (event as any).value;
    setForm((prev) => ({
      ...prev,
      skills: typeof value === "string" ? value.split(",") : (value as string[]),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!allowedFileTypes.includes(file.type)) {
      setCvFileError("Invalid file type. Please upload a PDF or Word document.");
      setCvFile(null);
      return;
    }
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      setCvFileError(`File size exceeds ${maxFileSizeMB}MB.`);
      setCvFile(null);
      return;
    }
    setCvFile(file);
  };

  const handleRemoveFile = () => {
    setCvFile(null);
    setCvFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateForm = () => {
    if (!form.fullName || !form.email || !form.phone || !form.country || !form.job) {
      setError("Please fill in all required fields.");
      return false;
    }
    if (!cvFile) {
      setError("Please upload your CV.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    setSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setSuccess("Your CV has been submitted successfully! Our team will review your application and contact you soon.");
      setForm({
        fullName: "",
        email: "",
        phone: "",
        country: "",
        job: "",
        skills: [],
        coverLetter: "",
      });
      setCvFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 1800);
  };

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
          Submit Your CV
        </Typography>
        <Typography variant="body1" className="text-gray-700 mb-4">
          Upload your CV and provide your details to apply for a work visa job. Our team will review your application and get in touch with you.
        </Typography>
      </CustomerPageHeader>

      <Card className="rounded-2xl shadow-md mt-4">
        <CardContent>
          <form onSubmit={handleSubmit} autoComplete="off">
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Full Name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="Phone Number"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                required
                fullWidth
                inputProps={{ maxLength: 20 }}
              />
              <CountrySelect
                label="Country Applying For"
                value={form.country}
                onChange={(value: string | null) => handleCountryChange(value ?? "")}
                required
                fullWidth
              />
              <TextField
                label="Job Title"
                name="job"
                value={form.job}
                onChange={handleChange}
                required
                fullWidth
                placeholder="e.g. Software Engineer, Healthcare Assistant"
              />
              <FormControl fullWidth>
                <InputLabel id="skills-label">Skills (select multiple)</InputLabel>
                <Select
                  labelId="skills-label"
                  multiple
                  value={form.skills}
                  onChange={(event) => {
                    handleSkillsChange(event);
                  }}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                  label="Skills (select multiple)"
                >
                  {skillsList.map((skill) => (
                    <MenuItem key={skill} value={skill}>
                      {skill}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Upload CV <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    className="rounded-xl normal-case"
                  >
                    {cvFile ? "Change File" : "Upload File"}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      hidden
                      onChange={handleFileChange}
                    />
                  </Button>
                  {cvFile && (
                    <Chip
                      icon={<CheckCircleIcon color="success" />}
                      label={cvFile.name}
                      onDelete={handleRemoveFile}
                      deleteIcon={<DeleteIcon />}
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                  Accepted formats: PDF, DOC, DOCX. Max size: {maxFileSizeMB}MB.
                </Typography>
                {cvFileError && <Alert severity="error" sx={{ mt: 1 }}>{cvFileError}</Alert>}
              </Box>
              <TextField
                label="Cover Letter (optional)"
                name="coverLetter"
                value={form.coverLetter}
                onChange={handleChange}
                multiline
                minRows={4}
                fullWidth
                placeholder="Write a brief cover letter to support your application..."
              />
              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">{success}</Alert>}
              <Button
                type="submit"
                variant="contained"
                className="bg-[#f5ebe1] text-black shadow-sm rounded-xl normal-case"
                disabled={submitting}
                fullWidth
                sx={{ mt: 2 }}
              >
                {submitting ? <CircularProgress size={24} /> : "Submit CV"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SubmitCV;
