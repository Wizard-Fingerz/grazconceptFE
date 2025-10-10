import React, { useState, useRef } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Chip,
    Stepper,
    Step,
    StepLabel,
    Alert,
    IconButton,
    Divider,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    CircularProgress,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";

const initialPersonal = {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    summary: "",
    photo: null as File | null,
};

const initialEducation = [
    {
        institution: "",
        degree: "",
        field: "",
        startYear: "",
        endYear: "",
        grade: "",
        description: "",
    },
];

const initialExperience = [
    {
        organization: "",
        position: "",
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
        location: "",
        description: "",
        current: false,
    },
];

const initialCertifications = [
    {
        name: "",
        issuer: "",
        issueMonth: "",
        issueYear: "",
        description: "",
    },
];

const initialSkills: string[] = [];
const initialLanguages = [
    { name: "", proficiency: "" },
];

const initialPublications = [
    {
        title: "",
        journal: "",
        year: "",
        link: "",
        description: "",
    },
];

const proficiencyOptions = [
    "Native",
    "Fluent",
    "Professional Working",
    "Conversational",
    "Basic",
];

const steps = [
    "Personal Details",
    "Education",
    "Experience",
    "Certifications",
    "Skills & Languages",
    "Publications",
    "Review & Export",
];

const countries = [
    "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "India", "China", "Japan", "Sweden", "Nigeria", "Brazil",
];

const skillExamples = [
    "JavaScript", "Python", "Project Management", "Data Analysis", "Teaching", "Team Leadership", "Public Speaking", "C++", "Machine Learning", "Research Writing"
];
const CVBuilder: React.FC = () => {
    // State
    const [step, setStep] = useState(0);
    const [personal, setPersonal] = useState({ ...initialPersonal });
    const [education, setEducation] = useState([...initialEducation]);
    const [experience, setExperience] = useState([...initialExperience]);
    const [certifications, setCertifications] = useState([...initialCertifications]);
    const [skills, setSkills] = useState([...initialSkills]);
    const [skillInput, setSkillInput] = useState("");
    const [languages, setLanguages] = useState([...initialLanguages]);
    const [publications, setPublications] = useState([...initialPublications]);
    const [error, setError] = useState<string | null>(null);
    const [submissionDialog, setSubmissionDialog] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [cvGenerated, setCvGenerated] = useState(false);

    // Refs
    const photoInputRef = useRef<HTMLInputElement>(null);

    // Navigation
    const handleNext = () => {
        setError(null);
        if (!validateStep()) return;
        setStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setError(null);
        setStep((prev) => Math.max(prev - 1, 0));
    };

    // Validation per step
    function validateStep() {
        switch (step) {
            case 0:
                if (
                    !personal.fullName ||
                    !personal.email ||
                    !personal.phone ||
                    !personal.address ||
                    !personal.country
                ) {
                    setError("Please complete all required personal details.");
                    return false;
                }
                return true;
            case 1:
                if (
                    !education.every(
                        (e) =>
                            e.institution &&
                            e.degree &&
                            e.field &&
                            e.startYear
                    )
                ) {
                    setError("Please complete at least one education entry with required fields.");
                    return false;
                }
                return true;
            case 2:
                if (
                    !experience.every(
                        (xp) =>
                            xp.organization && xp.position && xp.startMonth && xp.startYear
                    )
                ) {
                    setError("Please complete at least one professional experience with required fields.");
                    return false;
                }
                return true;
            case 3:
                // Certification is optional but validate if filled
                if (
                    certifications.some(
                        (c) =>
                            (c.name || c.issuer || c.issueMonth || c.issueYear) &&
                            !(c.name && c.issuer && c.issueYear)
                    )
                ) {
                    setError(
                        "If you add a certification, please fill in name, issuer, and year."
                    );
                    return false;
                }
                return true;
            case 4:
                if (skills.length === 0) {
                    setError("Add at least one skill.");
                    return false;
                }
                if (
                    languages.some(
                        (l) =>
                            (l.name || l.proficiency) && !(l.name && l.proficiency)
                    )
                ) {
                    setError("Fill both language and proficiency for each entry.");
                    return false;
                }
                return true;
            default:
                return true;
        }
    }

    // Handlers for dynamic fields
    // --- EDUCATION ---
    const handleEducationChange = (idx: number, field: string, value: any) => {
        setEducation((prev) => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], [field]: value };
            return updated;
        });
    };
    const handleAddEducation = () =>
        setEducation((prev) => [...prev, { ...initialEducation[0] }]);
    const handleRemoveEducation = (idx: number) =>
        setEducation((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));

    // --- EXPERIENCE ---
    const handleExperienceChange = (idx: number, field: string, value: any) => {
        setExperience((prev) => {
            const updated = [...prev];
            if (field === "current") {
                updated[idx][field] = value;
                if (value) {
                    updated[idx].endMonth = "";
                    updated[idx].endYear = "";
                }
            } else {
                // Safely assign value only if 'field' is a valid key of the experience object
                if (
                    [
                        "organization",
                        "position",
                        "startMonth",
                        "startYear",
                        "endMonth",
                        "endYear",
                        "location",
                        "description",
                        "current",
                    ].includes(field)
                ) {
                    if (Object.prototype.hasOwnProperty.call(updated[idx], field)) {
                        (updated[idx] as Record<string, any>)[field] = value;
                    }
                }
            }
            return updated;
        });
    };
    const handleAddExperience = () =>
        setExperience((prev) => [...prev, { ...initialExperience[0] }]);
    const handleRemoveExperience = (idx: number) =>
        setExperience((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));

    // --- CERTIFICATIONS ---
    const handleCertificationChange = (idx: number, field: string, value: any) => {
        setCertifications((prev) => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], [field]: value };
            return updated;
        });
    };
    const handleAddCertification = () =>
        setCertifications((prev) => [...prev, { ...initialCertifications[0] }]);
    const handleRemoveCertification = (idx: number) =>
        setCertifications((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));

    // --- SKILLS ---
    const handleAddSkill = () => {
        const val = skillInput.trim();
        if (val && !skills.includes(val)) {
            setSkills((prev) => [...prev, val]);
        }
        setSkillInput("");
    };
    const handleRemoveSkill = (s: string) => setSkills((prev) => prev.filter((sk) => sk !== s));

    // --- LANGUAGES ---
    const handleLanguageChange = (idx: number, field: string, value: string) => {
        setLanguages((prev) => {
            const updated = [...prev];
            updated[idx][field as "name" | "proficiency"] = value;
            return updated;
        });
    };
    const handleAddLanguage = () =>
        setLanguages((prev) => [...prev, { ...initialLanguages[0] }]);
    const handleRemoveLanguage = (idx: number) =>
        setLanguages((prev) =>
            prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)
        );

    // --- PUBLICATIONS ---
    const handlePublicationChange = (idx: number, field: string, value: string) => {
        setPublications((prev) => {
            const updated = [...prev];
            if (["title", "journal", "year", "link", "description"].includes(field)) {
                updated[idx] = { ...updated[idx], [field]: value };
            }
            return updated;
        });
    };
    const handleAddPublication = () =>
        setPublications((prev) => [...prev, { ...initialPublications[0] }]);
    const handleRemovePublication = (idx: number) =>
        setPublications((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));

    // --- PHOTO UPLOAD ---
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (
            file &&
            ["image/png", "image/jpeg", "image/jpg"].includes(file.type) &&
            file.size < 3 * 1024 * 1024
        ) {
            setPersonal((p) => ({ ...p, photo: file }));
        } else if (file) {
            setError("Invalid photo file (max 3MB, JPG/PNG only)");
        }
    };
    const removePhoto = () => setPersonal((p) => ({ ...p, photo: null }));

    // --- EXPORT/CV GENERATE ---
    const handleGenerateCV = () => {
        setError(null);
        setSubmissionDialog(false);
        setGenerating(true);
        setTimeout(() => {
            setCvGenerated(true);
            setGenerating(false);
        }, 2000); // simulate export
    };

    const handleEdit = () => {
        setCvGenerated(false);
        setStep(0);
    };

    // --- UI PER STEP ---
    function StepPersonal() {
        return (
            <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                    label="Full Name"
                    value={personal.fullName}
                    required
                    onChange={(e) => setPersonal((p) => ({ ...p, fullName: e.target.value }))}
                    fullWidth
                />
                <TextField
                    label="Email"
                    type="email"
                    value={personal.email}
                    required
                    onChange={(e) => setPersonal((p) => ({ ...p, email: e.target.value }))}
                    fullWidth
                />
                <TextField
                    label="Phone"
                    value={personal.phone}
                    required
                    onChange={(e) => setPersonal((p) => ({ ...p, phone: e.target.value }))}
                    fullWidth
                />
                <TextField
                    label="Address"
                    value={personal.address}
                    onChange={(e) => setPersonal((p) => ({ ...p, address: e.target.value }))}
                    required
                    fullWidth
                />
                <FormControl fullWidth required>
                    <InputLabel>Country</InputLabel>
                    <Select
                        value={personal.country}
                        label="Country"
                        onChange={(e) =>
                            setPersonal((p) => ({ ...p, country: e.target.value as string }))
                        }
                    >
                        {countries.map((c) => (
                            <MenuItem key={c} value={c}>{c}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    label="Professional Summary"
                    value={personal.summary}
                    onChange={(e) => setPersonal((p) => ({ ...p, summary: e.target.value }))}
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Briefly introduce yourself, experience and academic focus"
                />
                <Box>
                    <Button
                        startIcon={<UploadFileIcon />}
                        variant="outlined"
                        component="label"
                        size="small"
                        sx={{ mr: 2 }}
                    >
                        Upload Photo
                        <input
                            type="file"
                            accept="image/jpeg, image/png"
                            hidden
                            ref={photoInputRef}
                            onChange={handlePhotoChange}
                        />
                    </Button>
                    {personal.photo && (
                        <Chip
                            label={personal.photo.name}
                            onDelete={removePhoto}
                            sx={{ maxWidth: 180, mt: 1 }}
                            color="success"
                            variant="outlined"
                        />
                    )}
                </Box>
            </Box>
        );
    }

    function StepEducation() {
        return (
            <Box>
                {education.map((ed, i) => (
                    <Card key={i} sx={{ mb: 2 }}>
                        <CardContent>
                            <Box display="flex" gap={2}>
                                <TextField
                                    label="Institution"
                                    value={ed.institution}
                                    required
                                    onChange={(e) => handleEducationChange(i, "institution", e.target.value)}
                                    fullWidth
                                />
                                <TextField
                                    label="Degree"
                                    value={ed.degree}
                                    required
                                    onChange={(e) => handleEducationChange(i, "degree", e.target.value)}
                                    fullWidth
                                />
                            </Box>
                            <Box display="flex" gap={2} mt={2}>
                                <TextField
                                    label="Field of Study"
                                    value={ed.field}
                                    required
                                    onChange={(e) => handleEducationChange(i, "field", e.target.value)}
                                    fullWidth
                                />
                                <TextField
                                    label="Grade/Result"
                                    value={ed.grade}
                                    onChange={(e) => handleEducationChange(i, "grade", e.target.value)}
                                    fullWidth
                                />
                            </Box>
                            <Box display="flex" gap={2} mt={2} alignItems="center">
                                <TextField
                                    label="Start Year"
                                    value={ed.startYear}
                                    required
                                    onChange={(e) => handleEducationChange(i, "startYear", e.target.value)}
                                    type="number"
                                    sx={{ width: 150 }}
                                    inputProps={{ min: 1940, max: 2100 }}
                                />
                                <TextField
                                    label="End Year"
                                    value={ed.endYear}
                                    onChange={(e) => handleEducationChange(i, "endYear", e.target.value)}
                                    type="number"
                                    sx={{ width: 150 }}
                                    inputProps={{ min: 1940, max: 2100 }}
                                />
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoveEducation(i)}
                                    disabled={education.length === 1}
                                    sx={{ mt: 1.5, ml: 1 }}
                                >
                                    <RemoveCircleOutlineIcon />
                                </IconButton>
                            </Box>
                            <TextField
                                label="Description (optional)"
                                value={ed.description}
                                onChange={(e) =>
                                    handleEducationChange(i, "description", e.target.value)
                                }
                                multiline
                                fullWidth
                                rows={2}
                                sx={{ mt: 2 }}
                                placeholder="Courses, research projects, awards, etc."
                            />
                        </CardContent>
                    </Card>
                ))}
                <Button
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleAddEducation}
                    sx={{ my: 1 }}
                >
                    Add Education
                </Button>
            </Box>
        );
    }

    function StepExperience() {
        return (
            <Box>
                {experience.map((xp, i) => (
                    <Card key={i} sx={{ mb: 2 }}>
                        <CardContent>
                            <Box display="flex" gap={2}>
                                <TextField
                                    label="Organization"
                                    value={xp.organization}
                                    required
                                    onChange={(e) => handleExperienceChange(i, "organization", e.target.value)}
                                    fullWidth
                                />
                                <TextField
                                    label="Position/Title"
                                    value={xp.position}
                                    required
                                    onChange={(e) => handleExperienceChange(i, "position", e.target.value)}
                                    fullWidth
                                />
                            </Box>
                            <Box display="flex" gap={2} mt={2}>
                                <TextField
                                    label="Location"
                                    value={xp.location}
                                    onChange={(e) => handleExperienceChange(i, "location", e.target.value)}
                                    fullWidth
                                />
                            </Box>
                            <Box display="flex" gap={2} mt={2} alignItems="center">
                                <FormControl sx={{ width: 120 }}>
                                    <InputLabel>Start Month</InputLabel>
                                    <Select
                                        label="Start Month"
                                        value={xp.startMonth}
                                        required
                                        onChange={(e) => handleExperienceChange(i, "startMonth", e.target.value)}
                                    >
                                        {[
                                            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                                        ].map((m) => (
                                            <MenuItem key={m} value={m}>{m}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                    label="Start Year"
                                    value={xp.startYear}
                                    required
                                    onChange={(e) => handleExperienceChange(i, "startYear", e.target.value)}
                                    type="number"
                                    sx={{ width: 110 }}
                                    inputProps={{ min: 1940, max: 2100 }}
                                />
                                <FormControl sx={{ width: 120 }}>
                                    <InputLabel>End Month</InputLabel>
                                    <Select
                                        label="End Month"
                                        value={xp.endMonth}
                                        required={!xp.current}
                                        disabled={xp.current}
                                        onChange={(e) => handleExperienceChange(i, "endMonth", e.target.value)}
                                    >
                                        {[
                                            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                                        ].map((m) => (
                                            <MenuItem key={m} value={m}>{m}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                    label="End Year"
                                    value={xp.endYear}
                                    onChange={(e) => handleExperienceChange(i, "endYear", e.target.value)}
                                    type="number"
                                    required={!xp.current}
                                    disabled={xp.current}
                                    sx={{ width: 110 }}
                                    inputProps={{ min: 1940, max: 2100 }}
                                />
                                <FormControl>
                                    <InputLabel shrink>&nbsp;</InputLabel>
                                    <Button
                                        variant={xp.current ? "contained" : "outlined"}
                                        color="info"
                                        size="small"
                                        onClick={() => handleExperienceChange(i, "current", !xp.current)}
                                        sx={{ ml: 2 }}
                                    >
                                        {xp.current ? "Current" : "Past"}
                                    </Button>
                                </FormControl>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoveExperience(i)}
                                    disabled={experience.length === 1}
                                    sx={{ mt: 1.5, ml: 1 }}
                                >
                                    <RemoveCircleOutlineIcon />
                                </IconButton>
                            </Box>
                            <TextField
                                label="Description / Achievements"
                                value={xp.description}
                                onChange={(e) =>
                                    handleExperienceChange(i, "description", e.target.value)
                                }
                                multiline
                                fullWidth
                                rows={2}
                                sx={{ mt: 2 }}
                                placeholder="e.g. Key responsibilities, achievements, projects"
                            />
                        </CardContent>
                    </Card>
                ))}
                <Button
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleAddExperience}
                    sx={{ my: 1 }}
                >
                    Add Experience
                </Button>
            </Box>
        );
    }

    function StepCertifications() {
        return (
            <Box>
                {certifications.map((c, i) => (
                    <Card key={i} sx={{ mb: 2 }}>
                        <CardContent>
                            <Box display="flex" gap={2}>
                                <TextField
                                    label="Certification Name"
                                    value={c.name}
                                    onChange={(e) => handleCertificationChange(i, "name", e.target.value)}
                                    fullWidth
                                />
                                <TextField
                                    label="Issuer"
                                    value={c.issuer}
                                    onChange={(e) => handleCertificationChange(i, "issuer", e.target.value)}
                                    fullWidth
                                />
                            </Box>
                            <Box display="flex" gap={2} mt={2}>
                                <FormControl sx={{ width: 170 }}>
                                    <InputLabel>Issue Month</InputLabel>
                                    <Select
                                        label="Issue Month"
                                        value={c.issueMonth}
                                        onChange={(e) => handleCertificationChange(i, "issueMonth", e.target.value)}
                                    >
                                        {[
                                            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                                        ].map((m) => (
                                            <MenuItem key={m} value={m}>{m}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                    label="Issue Year"
                                    value={c.issueYear}
                                    onChange={(e) => handleCertificationChange(i, "issueYear", e.target.value)}
                                    type="number"
                                    sx={{ width: 120 }}
                                    inputProps={{ min: 1940, max: 2100 }}
                                />
                            </Box>
                            <TextField
                                label="Description"
                                value={c.description}
                                onChange={(e) => handleCertificationChange(i, "description", e.target.value)}
                                fullWidth
                                multiline
                                rows={2}
                                sx={{ mt: 2 }}
                                placeholder="Credential ID, Scope, Skills gained, etc."
                            />
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveCertification(i)}
                                disabled={certifications.length === 1}
                                sx={{ mt: 1.5 }}
                            >
                                <RemoveCircleOutlineIcon />
                            </IconButton>
                        </CardContent>
                    </Card>
                ))}
                <Button
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleAddCertification}
                    sx={{ my: 1 }}
                >
                    Add Certification
                </Button>
            </Box>
        );
    }

    function StepSkillsLanguages() {
        return (
            <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                    Core Skills & Technologies
                    <Tooltip title="Click on a suggested skill to add.">
                        <InfoOutlinedIcon sx={{ ml: 1, fontSize: 19, color: "text.secondary" }} />
                    </Tooltip>
                </Typography>
                <Box display="flex" gap={2} alignItems="center" mt={1}>
                    <TextField
                        label="Skill"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddSkill();
                            }
                        }}
                        placeholder="e.g. Python, Data Analysis"
                        sx={{ width: 280 }}
                    />
                    <Button onClick={handleAddSkill} variant="outlined" size="small">
                        Add Skill
                    </Button>
                </Box>
                <Box mt={1} mb={2} display="flex" flexWrap="wrap" gap={1}>
                    {skills.map((sk) => (
                        <Chip
                            label={sk}
                            key={sk}
                            onDelete={() => handleRemoveSkill(sk)}
                            color="primary"
                            sx={{ mx: 0.5, fontWeight: 500, fontSize: 15 }}
                        />
                    ))}
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                    {skillExamples
                        .filter((ex) => !skills.includes(ex))
                        .map((ex, ix) => (
                            <Chip
                                key={ex + ix}
                                label={ex}
                                variant="outlined"
                                onClick={() => {
                                    if (!skills.includes(ex)) setSkills((sk) => [...sk, ex]);
                                }}
                                size="small"
                                sx={{ cursor: "pointer", mb: 1 }}
                            />
                        ))}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight={700}>
                    Languages
                </Typography>
                {languages.map((l, i) => (
                    <Box key={i} display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                        <TextField
                            label="Language"
                            value={l.name}
                            onChange={(e) => handleLanguageChange(i, "name", e.target.value)}
                            sx={{ width: 220 }}
                        />
                        <FormControl sx={{ width: 200 }}>
                            <InputLabel>Proficiency</InputLabel>
                            <Select
                                label="Proficiency"
                                value={l.proficiency}
                                onChange={(e) => handleLanguageChange(i, "proficiency", e.target.value)}
                            >
                                {proficiencyOptions.map((p) => (
                                    <MenuItem key={p} value={p}>{p}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveLanguage(i)}
                            disabled={languages.length === 1}
                            sx={{ mt: 1.5 }}
                        >
                            <RemoveCircleOutlineIcon />
                        </IconButton>
                    </Box>
                ))}
                <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAddLanguage}>
                    Add Language
                </Button>
            </Box>
        );
    }

    function StepPublications() {
        return (
            <Box>
                {publications.map((pub, i) => (
                    <Card key={i} sx={{ mb: 2 }}>
                        <CardContent>
                            <Box display="flex" gap={2}>
                                <TextField
                                    label="Title"
                                    value={pub.title}
                                    onChange={(e) => handlePublicationChange(i, "title", e.target.value)}
                                    fullWidth
                                />
                                <TextField
                                    label="Journal/Publisher"
                                    value={pub.journal}
                                    onChange={(e) => handlePublicationChange(i, "journal", e.target.value)}
                                    fullWidth
                                />
                            </Box>
                            <Box display="flex" gap={2} mt={2}>
                                <TextField
                                    label="Year"
                                    value={pub.year}
                                    onChange={(e) => handlePublicationChange(i, "year", e.target.value)}
                                    type="number"
                                    sx={{ width: 120 }}
                                    inputProps={{ min: 1940, max: 2100 }}
                                />
                                <TextField
                                    label="Link"
                                    value={pub.link}
                                    onChange={(e) => handlePublicationChange(i, "link", e.target.value)}
                                    fullWidth
                                    placeholder="DOI, arXiv, etc."
                                />
                            </Box>
                            <TextField
                                label="Description"
                                value={pub.description}
                                onChange={(e) => handlePublicationChange(i, "description", e.target.value)}
                                fullWidth
                                multiline
                                rows={2}
                                sx={{ mt: 2 }}
                            />
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemovePublication(i)}
                                disabled={publications.length === 1}
                                sx={{ mt: 1.5 }}
                            >
                                <RemoveCircleOutlineIcon />
                            </IconButton>
                        </CardContent>
                    </Card>
                ))}
                <Button
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleAddPublication}
                    sx={{ my: 1 }}
                >
                    Add Publication
                </Button>
            </Box>
        );
    }

    function StepReview() {
        // Renders a "CV preview" for final review before export
        return (
            <Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    CV Preview
                </Typography>
                <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                        <Box display="flex" alignItems="center" gap={3}>
                            {personal.photo && (
                                <img
                                    src={URL.createObjectURL(personal.photo)}
                                    alt="Profile"
                                    style={{ width: 90, height: 90, borderRadius: "50%" }}
                                />
                            )}
                            <Box>
                                <Typography variant="h5" fontWeight={800} sx={{ mb: 0.3 }}>
                                    {personal.fullName}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    {personal.email} | {personal.phone}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    {personal.address} {personal.country && `| ${personal.country}`}
                                </Typography>
                            </Box>
                        </Box>
                        {personal.summary && (
                            <Typography variant="body1" mt={2} sx={{ color: "text.primary" }}>
                                <span style={{ fontWeight: 600 }}>Summary:</span> {personal.summary}
                            </Typography>
                        )}
                    </CardContent>
                </Card>

                <SectionHeader title="Education" />
                {education.map((ed, i) => (
                    <Box key={i} mb={1.5} pl={1}>
                        <Typography fontWeight={600}>
                            {ed.degree} in {ed.field}
                        </Typography>
                        <Typography variant="body2">
                            {ed.institution}
                            {ed.grade && ` | Result: ${ed.grade}`}
                            {" "}
                            ({ed.startYear}
                            {ed.endYear && ` – ${ed.endYear}`})
                        </Typography>
                        {ed.description && (
                            <Typography variant="body2" color="text.secondary">
                                {ed.description}
                            </Typography>
                        )}
                    </Box>
                ))}

                <SectionHeader title="Professional Experience" />
                {experience.map((xp, i) =>
                    xp.organization && xp.position ? (
                        <Box key={i} mb={1.5} pl={1}>
                            <Typography fontWeight={600}>
                                {xp.position} at {xp.organization}
                            </Typography>
                            <Typography variant="body2">
                                {xp.location && `${xp.location}, `}
                                {xp.startMonth} {xp.startYear}
                                {(xp.endMonth || xp.endYear) ? ` – ${xp.endMonth} ${xp.endYear}` : ""}
                                {xp.current ? " (Current)" : ""}
                            </Typography>
                            {xp.description && (
                                <Typography variant="body2" color="text.secondary">
                                    {xp.description}
                                </Typography>
                            )}
                        </Box>
                    ) : null
                )}

                {!!certifications.filter((c) => c.name).length && (
                    <>
                        <SectionHeader title="Certifications" />
                        <List dense>
                            {certifications
                                .filter((c) => c.name)
                                .map((c, i) => (
                                    <ListItem key={i}>
                                        <ListItemText
                                            primary={
                                                <span>
                                                    <b>{c.name}</b>
                                                    {c.issuer && `, ${c.issuer}`}
                                                    {c.issueMonth && c.issueYear
                                                        ? ` (${c.issueMonth} ${c.issueYear})`
                                                        : ""}
                                                </span>
                                            }
                                            secondary={c.description}
                                        />
                                    </ListItem>
                                ))}
                        </List>
                    </>
                )}

                <SectionHeader title="Skills" />
                <Box my={1.5} display="flex" gap={1} flexWrap="wrap">
                    {skills.map((sk, i) => (
                        <Chip key={i} label={sk} sx={{ m: 0.2, fontWeight: 500, fontSize: 16 }} color="primary" />
                    ))}
                </Box>

                <SectionHeader title="Languages" />
                <Box my={1.5} display="flex" gap={1.5} flexWrap="wrap">
                    {languages.filter((l) => l.name).map((l, i) => (
                        <Chip
                            key={i}
                            label={`${l.name} (${l.proficiency})`}
                            color="info"
                            variant="outlined"
                            sx={{ fontWeight: 500, fontSize: 15 }}
                        />
                    ))}
                </Box>

                {!!publications.filter((p) => p.title).length && (
                    <>
                        <SectionHeader title="Publications" />
                        <List dense>
                            {publications
                                .filter((p) => p.title)
                                .map((p, i) => (
                                    <ListItem key={i}>
                                        <ListItemText
                                            primary={
                                                <span>
                                                    <b>{p.title}</b>
                                                    {p.journal && `, ${p.journal}`}
                                                    {p.year && ` (${p.year})`}
                                                </span>
                                            }
                                            secondary={
                                                <>
                                                    {" "}
                                                    {p.link && (
                                                        <a
                                                            href={/^https?:\/\//.test(p.link) ? p.link : `https://${p.link}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            {p.link}
                                                        </a>
                                                    )}
                                                    {p.description && (
                                                        <>
                                                            <br />
                                                            {p.description}
                                                        </>
                                                    )}
                                                </>
                                            }
                                        />
                                    </ListItem>
                                ))}
                        </List>
                    </>
                )}
            </Box>
        );
    }

    function SectionHeader({ title }: { title: string }) {
        return (
            <Typography
                variant="subtitle1"
                sx={{
                    mt: 2,
                    fontWeight: 700,
                    color: "primary.main",
                    borderLeft: "5px solid #1976d2",
                    pl: 1,
                    mb: 0.5,
                }}
            >
                {title}
            </Typography>
        );
    }

    // Main render
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
                <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
                    Professional & Academic CV Builder
                </Typography>
                <Typography
                    variant="body1"
                    sx={{ mb: 3, color: "text.secondary" }}
                >
                    Build a comprehensive, recruiter-friendly CV: fill in details, review, and export.
                </Typography>

            </CustomerPageHeader>

            <Card>
                <CardContent>
                    <Stepper activeStep={step} alternativeLabel sx={{ mb: 2 }}>
                        {steps.map((label, _i) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {cvGenerated ? (
                        <Box textAlign="center" py={6}>
                            <Alert
                                severity="success"
                                sx={{ mb: 3, mx: "auto", maxWidth: 470, fontSize: "1.1rem" }}
                            >
                                <b>Your CV export is ready!</b>
                                <br />
                                For a downloadable file, use browser print or PDF plugins (custom download/export coming soon).
                            </Alert>
                            <Button
                                variant="outlined"
                                onClick={handleEdit}
                                sx={{ mr: 2, fontWeight: 600 }}
                            >
                                Edit CV
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => window.print()}
                                sx={{
                                    fontWeight: 600,
                                    bgcolor: "#1976d2",
                                    ":hover": { bgcolor: "#1256a6" },
                                }}
                            >
                                Print/Save as PDF
                            </Button>
                        </Box>
                    ) : (
                        <Box>
                            {/* Dynamic Stepper Content */}
                            {step === 0 && <StepPersonal />}
                            {step === 1 && <StepEducation />}
                            {step === 2 && <StepExperience />}
                            {step === 3 && <StepCertifications />}
                            {step === 4 && <StepSkillsLanguages />}
                            {step === 5 && <StepPublications />}
                            {step === 6 && <StepReview />}

                            {/* Stepper Actions */}
                            {!generating && (
                                <Box display="flex" justifyContent="space-between" mt={4} gap={2}>
                                    <Button
                                        onClick={handleBack}
                                        variant="outlined"
                                        disabled={step === 0}
                                        sx={{ minWidth: 110 }}
                                    >
                                        Back
                                    </Button>
                                    {step < steps.length - 1 ? (
                                        <Button
                                            onClick={handleNext}
                                            variant="contained"
                                            color="primary"
                                            sx={{ minWidth: 160, fontWeight: 600 }}
                                        >
                                            Next
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => setSubmissionDialog(true)}
                                            variant="contained"
                                            color="success"
                                            sx={{ minWidth: 180, fontWeight: 700 }}
                                        >
                                            Generate & Export CV
                                        </Button>
                                    )}
                                </Box>
                            )}
                            {generating && (
                                <Box display="flex" alignItems="center" mt={4} justifyContent="center">
                                    <CircularProgress size={36} color="success" sx={{ mr: 2 }} />
                                    <Typography variant="h6" fontWeight={600}>
                                        Generating your CV...
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Final Export Confirmation Dialog */}
            <Dialog open={submissionDialog} onClose={() => setSubmissionDialog(false)}>
                <DialogTitle>Export CV</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to export your CV? You will be able to print or save it as a PDF.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSubmissionDialog(false)} variant="outlined">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleGenerateCV}
                        variant="contained"
                        color="success"
                        sx={{ fontWeight: 700 }}
                    >
                        Export
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default CVBuilder;
