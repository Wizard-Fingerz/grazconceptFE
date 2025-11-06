import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WorkIcon from "@mui/icons-material/Work";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import BuildIcon from "@mui/icons-material/Build";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useNavigate } from "react-router-dom";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import { CountrySelect } from "../../../../components/CountrySelect";
import { fetchJobSkills } from "../../../../services/definitionService";

// Simulate available jobs for the sidebar (could fetch from API)
const jobList = [
  {
    title: "Software Engineer",
    location: "Sweden",
    description: "Specialists needed for SaaS web/mobile projects. Relocation included.",
    urgent: true,
  },
  {
    title: "Healthcare Assistant",
    location: "UK",
    description: "Support patients in care homes with sponsored visa.",
    urgent: false,
  },
  {
    title: "Construction Worker",
    location: "Germany",
    description: "Secure legal EU employment on large infrastructure teams.",
    urgent: false,
  },
  {
    title: "Hospitality Staff",
    location: "Netherlands",
    description: "Chefs & front desk staff for international hotels.",
    urgent: false,
  },
  {
    title: "Driver (HGV/Buses)",
    location: "Ireland",
    description: "International driving license required. Good monthly pay.",
    urgent: false,
  },
];

const allowedFileTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const maxFileSizeMB = 5;

// Infer Skill Type: If skillTerms = response.results, which are objects with id and term
type JobSkill = { id: number; term: string; [key: string]: any };

export const SubmitCV: React.FC = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    job: "",
    skills: [] as JobSkill[],
    coverLetter: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileError, setCvFileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Skills from API (will hold array of JobSkill objects)
  const [jobSkills, setJobSkills] = useState<JobSkill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState<boolean>(false);

  // State for job details dialog
  const [openJobDialog, setOpenJobDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Fetch job skills for the autocomplete on mount
  useEffect(() => {
    let mounted = true;
    setLoadingSkills(true);
    fetchJobSkills()
      .then((response: any) => {
        if (mounted) {
          let skillTerms: JobSkill[] = [];
          // Acceptable response: { results: [ { id, term, ... }, ... ] }
          if (response && Array.isArray(response.results)) {
            skillTerms = response.results;
          }
          setJobSkills(skillTerms);
          console.log(skillTerms);
        }
      })
      .catch(() => {
        setJobSkills([]);
      })
      .finally(() => setLoadingSkills(false));
    return () => {
      mounted = false;
    };
  }, []);

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

  // const handleJobChange = (
  //   _event: React.SyntheticEvent,
  //   value: string | null
  // ) => {
  //   setForm((prev) => ({
  //     ...prev,
  //     job: value ?? "",
  //   }));
  // };

  /**
   * Handle selection and value map for job skills, which are JobSkill objects.
   * Value is an array of JobSkill, but submission can extract .term from those.
   */
  const handleSkillsChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: JobSkill[]
  ) => {
    setForm((prev) => ({
      ...prev,
      skills: value,
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
      setSuccess(
        "Your CV has been submitted successfully! Our team will review your application and contact you soon."
      );
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

  // Job Details Dialog UI
  const handleOpenJobDialog = (job: any) => {
    setSelectedJob(job);
    setOpenJobDialog(true);
  };
  const handleCloseJobDialog = () => {
    setOpenJobDialog(false);
    setSelectedJob(null);
  };
  const handleApplyForJob = () => {
    if (selectedJob) {
      setForm((prev) => ({
        ...prev,
        job: selectedJob.title,
        country: selectedJob.location,
      }));
    }
    setOpenJobDialog(false);
    setSelectedJob(null);
  };

  // Highlighted or featured job section sidebar
  const JobSidePanel = () => (
    <>
      <Card
        className="rounded-xl shadow-md"
        sx={{
          minWidth: { xs: "100%", md: 340 },
          maxWidth: 376,
          mb: { xs: 2, md: 0 }
        }}
      >
        <CardContent sx={{ pb: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: "primary.main" }}>
            Current Work Visa Job Openings
          </Typography>
          <List dense>
            {jobList.map((job, idx) => (
              <ListItem
                alignItems="flex-start"
                key={job.title + job.location}
                sx={{
                  mb: idx === jobList.length - 1 ? 0 : 1,
                  bgcolor: job.urgent ? "#ffe1e1" : "inherit",
                  borderRadius: 1
                }}
                secondaryAction={
                  <Box display="flex" gap={1}>
                    <Tooltip title="View job details">
                      <Button
                        size="small"
                        sx={{ minWidth: 0, px: 0.5 }}
                        color="primary"
                        onClick={() => handleOpenJobDialog(job)}
                        aria-label="view details"
                      >
                        <InfoOutlinedIcon fontSize="inherit" />
                      </Button>
                    </Tooltip>
                    <Tooltip title="Autofill job title & country">
                      <Button
                        size="small"
                        sx={{ minWidth: 0, px: 0.5, ml: 0.5 }}
                        onClick={() =>
                          setForm((prev) => ({ ...prev, job: job.title, country: job.location }))
                        }
                        color="primary"
                        aria-label="autofill"
                      >
                        <ArrowRightAltIcon fontSize="inherit" />
                      </Button>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemIcon sx={{ minWidth: 32, mt: .35 }}>
                  <WorkIcon color={job.urgent ? "error" : "primary"} fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <span style={{ fontWeight: 600 }}>
                        {job.title}
                      </span>
                      <span style={{
                        fontSize: ".95em",
                        color: "#666"
                      }}>
                        — {job.location}
                      </span>
                      {job.urgent && (
                        <Chip
                          label="Urgent"
                          color="error"
                          size="small"
                          sx={{ ml: 1 }}
                          style={{ fontWeight: 600 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                      {job.description}
                    </Typography>
                  }
                  sx={{ my: 0 }}
                />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Button
            variant="outlined"
            fullWidth
            color="primary"
            size="small"
            sx={{ borderRadius: 3, py: 1 }}
            startIcon={<BuildIcon />}
            onClick={() => navigate("/value-added/cv-builder")}
          >
            Not ready? Use our CV Builder!
          </Button>
        </CardContent>
      </Card>
      <Dialog
        open={openJobDialog && !!selectedJob}
        onClose={handleCloseJobDialog}
        maxWidth="xs"
        fullWidth
        aria-labelledby="job-dialog-title"
      >
        <DialogTitle id="job-dialog-title">
          <Box display="flex" alignItems="center" gap={1}>
            <WorkIcon color={selectedJob?.urgent ? "error" : "primary"} fontSize="small" />
            <Typography variant="h6" fontWeight={700}>
              {selectedJob?.title}
            </Typography>
            {selectedJob?.urgent && (
              <Chip
                label="Urgent"
                color="error"
                size="small"
                sx={{ ml: 1 }}
                style={{ fontWeight: 600 }}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box mb={1}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Location:
            </Typography>
            <Typography variant="body1">{selectedJob?.location}</Typography>
          </Box>
          <Box mb={1}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Description:
            </Typography>
            <Typography variant="body1">{selectedJob?.description}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleApplyForJob} variant="contained" color="primary">
            Apply for this job
          </Button>
          <Button onClick={handleCloseJobDialog} variant="outlined" color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  // Main responsive 2-column layout (form on left, jobs/resources on right)
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
        <Typography variant="h4" fontWeight={700} className="mb-2">
          Submit Your CV for Work Visa Jobs
        </Typography>
        <Typography variant="body1" color="text.secondary" className="mb-4">
          Upload your CV and provide your details to apply for a listed job or any eligible work visa opportunity. 
          Browse job options or use our fast CV builder. Our team will review applications and contact suitable candidates.
        </Typography>
      </CustomerPageHeader>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
          maxWidth: 1200,
          mx: "auto",
        }}
      >
        {/* Left: form */}
        <Box flex={{ md: "0 1 58%", xs: "1 1 100%" }} order={{ xs: 2, md: 1 }} minWidth={0}>
          <Card className="rounded-2xl shadow-md" sx={{ maxWidth: 700, mx: "auto" }}>
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
                  <Autocomplete
                    multiple
                    id="skills-autocomplete"
                    options={jobSkills}
                    value={form.skills}
                    onChange={handleSkillsChange}
                    loading={loadingSkills}
                    disableCloseOnSelect
                    freeSolo={false}
                    // --- The fix: ensure each option has a string label ---
                    getOptionLabel={
                      (option: JobSkill | string) =>
                        typeof option === "string"
                          ? option
                          : option.term || ""
                    }
                    isOptionEqualToValue={(option, value) =>
                      // If jobs from API always have unique id, compare by id, else by label
                      (typeof option === "string" || typeof value === "string")
                        ? option === value
                        : option.id === value.id
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Skills (select multiple)"
                        placeholder="Start typing to search skills"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingSkills ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => (
                        <Chip
                          variant="outlined"
                          color="primary"
                          label={typeof option === "string" ? option : option.term}
                          {...getTagProps({ index })}
                          key={
                            typeof option === "string"
                              ? option
                              : option.id || option.term
                          }
                        />
                      ))
                    }
                  />
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
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, display: "block" }}
                    >
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
                  <Button
                    variant="outlined"
                    color="secondary"
                    sx={{
                      alignSelf: "flex-end",
                      mt: 1,
                      mb: -1,
                      minWidth: 175,
                      borderRadius: 3,
                      textTransform: "none",
                    }}
                    startIcon={<BuildIcon />}
                    onClick={() => navigate("/value-added/cv-builder")}
                  >
                    Use CV Builder Instead
                  </Button>
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
        {/* Right: Job board panel */}
        <Box
          flex={{ md: "0 1 41%", xs: "1 1 100%" }}
          order={{ xs: 1, md: 2 }}
          minWidth={0}
        >
          <JobSidePanel />
          {/* Could add extra tips or resources here in future */}
        </Box>
      </Box>
    </Box>
  );
};

export default SubmitCV;
