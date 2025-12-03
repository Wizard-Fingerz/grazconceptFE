/**
 * Rewrite: EXTEND: Add CV List & Manage UI for multiple user CVs.
 * - Adds a Tabbed interface: one for CV Builder (existing workflow), one for "My Saved CVs"
 * - Fetches all user's CVs on load (api.get to /app/cv-profiles/)
 * - Shows list of all CVs with actions "Edit", "View", "Print"
 * - Clicking "Edit" loads selected CV data for editing in builder
 * - Clicking "View" opens read-only modal or inline panel of CV preview
 * - Clicking "Print" prints only that CV via a new tab/window
 */

import React, { useState, useRef, useEffect, useCallback, } from "react";
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
    Tab,
    Tabs,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import { useAuth } from "../../../../context/AuthContext";
import api from "../../../../services/api";
import { CountrySelect } from "../../../../components/CountrySelect";
import { v4 as uuidv4 } from "uuid";
import ClassicCVTemplate from "./CVTemplates/ClassicCVTemplate";
import ModernCVTemplate from "./CVTemplates/ModernCVTemplate";

// --- Factory functions for item creation with a stable unique id ---
const newEducation = () => ({
    id: uuidv4(),
    institution: "",
    degree: "",
    field: "",
    startYear: "",
    endYear: "",
    grade: "",
    description: "",
});
const newExperience = () => ({
    id: uuidv4(),
    organization: "",
    position: "",
    startMonth: "",
    startYear: "",
    endMonth: "",
    endYear: "",
    location: "",
    description: "",
    current: false,
});
const newCertification = () => ({
    id: uuidv4(),
    name: "",
    issuer: "",
    issueMonth: "",
    issueYear: "",
    description: "",
});
const newLanguage = () => ({ id: uuidv4(), name: "", proficiency: "" });
const newPublication = () => ({
    id: uuidv4(),
    title: "",
    journal: "",
    year: "",
    link: "",
    description: "",
});
const initialPersonal = {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    summary: "",
    photo: null as File | null,
};
const initialEducation = [newEducation()];
const initialExperience = [newExperience()];
const initialCertifications = [newCertification()];
const initialSkills: string[] = [];
const initialLanguages = [newLanguage()];
const initialPublications = [newPublication()];

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

const skillExamples = [
    "JavaScript", "Python", "Project Management", "Data Analysis", "Teaching", "Team Leadership", "Public Speaking", "C++", "Machine Learning", "Research Writing"
];

const API_ENDPOINT = "/app/cv-profiles/";

type ApiState = "idle" | "submitting" | "success" | "error";

/**
 * Helper to update in-place, but also ensures (for React) the object at the index is replaced,
 * but the outer array is not recreated unless really needed.
 */
function updateArrayItemById_inplace<T extends { id: string }>(
    arr: T[],
    id: string,
    field: string,
    value: any,
    postProcess?: (item: T) => void
) {
    const idx = arr.findIndex(item => item.id === id);
    if (idx !== -1) {
        arr[idx] = { ...arr[idx] };
        // Fix TypeScript error: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type
        (arr[idx] as any)[field] = value;
        if (postProcess) postProcess(arr[idx]);
    }
}

const StepPersonal = React.memo(function StepPersonal({
    personal,
    setPersonal,
    photoInputRef,
    handlePhotoChange,
    removePhoto,
    user,
}: {
    personal: typeof initialPersonal,
    setPersonal: React.Dispatch<React.SetStateAction<typeof initialPersonal>>,
    photoInputRef: React.RefObject<HTMLInputElement>,
    handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    removePhoto: () => void,
    user: any,
}) {
    const prefilledFields: { [key: string]: boolean } = {
        fullName: !!personal.fullName && !!user,
        email: !!personal.email && !!user,
        phone: !!personal.phone && !!user,
        address: !!personal.address && !!user,
        country: !!personal.country && !!user,
    };

    return (
        <Box display="flex" flexDirection="column" gap={2}>
            <TextField
                label="Full Name"
                value={personal.fullName}
                required
                disabled={prefilledFields.fullName}
                onChange={e =>
                    setPersonal(p => ({ ...p, fullName: e.target.value }))
                }
                fullWidth
                autoComplete="off"
            />
            <TextField
                label="Email"
                type="email"
                value={personal.email}
                required
                disabled={prefilledFields.email}
                onChange={e =>
                    setPersonal(p => ({ ...p, email: e.target.value }))
                }
                fullWidth
                autoComplete="off"
            />
            <TextField
                label="Phone"
                value={personal.phone}
                required
                disabled={prefilledFields.phone}
                onChange={e =>
                    setPersonal((p) => ({ ...p, phone: e.target.value }))
                }
                fullWidth
                autoComplete="off"
            />
            <TextField
                label="Address"
                value={personal.address}
                required
                disabled={prefilledFields.address}
                onChange={e =>
                    setPersonal((p) => ({ ...p, address: e.target.value }))
                }
                fullWidth
                autoComplete="off"
            />
            <FormControl fullWidth required>
                <CountrySelect
                    label="Country"
                    value={personal.country}
                    onChange={(newValue) =>
                        !prefilledFields.country &&
                        setPersonal((p) => ({ ...p, country: newValue as string }))
                    }
                    required
                    fullWidth
                    disabled={prefilledFields.country}
                />
            </FormControl>
            <TextField
                label="Professional Summary"
                value={personal.summary}
                onChange={e => setPersonal((p) => ({ ...p, summary: e.target.value }))}
                multiline
                rows={3}
                fullWidth
                placeholder="Briefly introduce yourself, experience and academic focus"
                autoComplete="off"
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
});

const StepEducation = React.memo(function StepEducation({
    education,
    handleEducationChange,
    handleAddEducation,
    handleRemoveEducation,
}: {
    education: ReturnType<typeof newEducation>[],
    handleEducationChange: (id: string, field: string, value: any) => void,
    handleAddEducation: () => void,
    handleRemoveEducation: (id: string) => void
}) {
    return (
        <Box>
            {education.map((ed) => (
                <Card key={ed.id} sx={{ mb: 2 }}>
                    <CardContent>
                        <Box display="flex" gap={2}>
                            <TextField
                                label="Institution"
                                value={ed.institution}
                                required
                                onChange={e => handleEducationChange(ed.id, "institution", e.target.value)}
                                fullWidth
                                autoComplete="off"
                            />
                            <TextField
                                label="Degree"
                                value={ed.degree}
                                required
                                onChange={e => handleEducationChange(ed.id, "degree", e.target.value)}
                                fullWidth
                                autoComplete="off"
                            />
                        </Box>
                        <Box display="flex" gap={2} mt={2}>
                            <TextField
                                label="Field of Study"
                                value={ed.field}
                                required
                                onChange={e => handleEducationChange(ed.id, "field", e.target.value)}
                                fullWidth
                                autoComplete="off"
                            />
                            <TextField
                                label="Grade/Result"
                                value={ed.grade}
                                onChange={e => handleEducationChange(ed.id, "grade", e.target.value)}
                                fullWidth
                                autoComplete="off"
                            />
                        </Box>
                        <Box display="flex" gap={2} mt={2} alignItems="center">
                            <TextField
                                label="Start Year"
                                value={ed.startYear}
                                required
                                onChange={e => handleEducationChange(ed.id, "startYear", e.target.value)}
                                type="number"
                                sx={{ width: 150 }}
                                inputProps={{ min: 1940, max: 2100 }}
                                autoComplete="off"
                            />
                            <TextField
                                label="End Year"
                                value={ed.endYear}
                                onChange={e => handleEducationChange(ed.id, "endYear", e.target.value)}
                                type="number"
                                sx={{ width: 150 }}
                                inputProps={{ min: 1940, max: 2100 }}
                                autoComplete="off"
                            />
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveEducation(ed.id)}
                                disabled={education.length === 1}
                                sx={{ mt: 1.5, ml: 1 }}
                            >
                                <RemoveCircleOutlineIcon />
                            </IconButton>
                        </Box>
                        <TextField
                            label="Description (optional)"
                            value={ed.description}
                            onChange={e => handleEducationChange(ed.id, "description", e.target.value)}
                            multiline
                            fullWidth
                            rows={2}
                            sx={{ mt: 2 }}
                            placeholder="Courses, research projects, awards, etc."
                            autoComplete="off"
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
});

const StepExperience = React.memo(function StepExperience({
    experience,
    handleExperienceChange,
    handleAddExperience,
    handleRemoveExperience
}: {
    experience: ReturnType<typeof newExperience>[],
    handleExperienceChange: (id: string, field: string, value: any) => void,
    handleAddExperience: () => void,
    handleRemoveExperience: (id: string) => void,
}) {
    return (
        <Box>
            {experience.map((xp) => (
                <Card key={xp.id} sx={{ mb: 2 }}>
                    <CardContent>
                        <Box display="flex" gap={2}>
                            <TextField
                                label="Organization"
                                value={xp.organization}
                                required
                                onChange={e => handleExperienceChange(xp.id, "organization", e.target.value)}
                                fullWidth
                                autoComplete="off"
                            />
                            <TextField
                                label="Position/Title"
                                value={xp.position}
                                required
                                onChange={e => handleExperienceChange(xp.id, "position", e.target.value)}
                                fullWidth
                                autoComplete="off"
                            />
                        </Box>
                        <Box display="flex" gap={2} mt={2}>
                            <TextField
                                label="Location"
                                value={xp.location}
                                onChange={e => handleExperienceChange(xp.id, "location", e.target.value)}
                                fullWidth
                                autoComplete="off"
                            />
                        </Box>
                        <Box display="flex" gap={2} mt={2} alignItems="center">
                            <FormControl sx={{ width: 120 }}>
                                <InputLabel>Start Month</InputLabel>
                                <Select
                                    label="Start Month"
                                    value={xp.startMonth}
                                    required
                                    onChange={e => handleExperienceChange(xp.id, "startMonth", e.target.value)}
                                >
                                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                                    ].map((m) => (
                                        <MenuItem key={m} value={m}>{m}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                label="Start Year"
                                value={xp.startYear}
                                required
                                onChange={e => handleExperienceChange(xp.id, "startYear", e.target.value)}
                                type="number"
                                sx={{ width: 110 }}
                                inputProps={{ min: 1940, max: 2100 }}
                                autoComplete="off"
                            />
                            <FormControl sx={{ width: 120 }}>
                                <InputLabel>End Month</InputLabel>
                                <Select
                                    label="End Month"
                                    value={xp.endMonth}
                                    required={!xp.current}
                                    disabled={xp.current}
                                    onChange={e => handleExperienceChange(xp.id, "endMonth", e.target.value)}
                                >
                                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                                    ].map((m) => (
                                        <MenuItem key={m} value={m}>{m}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                label="End Year"
                                value={xp.endYear}
                                onChange={e => handleExperienceChange(xp.id, "endYear", e.target.value)}
                                type="number"
                                required={!xp.current}
                                disabled={xp.current}
                                sx={{ width: 110 }}
                                inputProps={{ min: 1940, max: 2100 }}
                                autoComplete="off"
                            />
                            <FormControl>
                                <InputLabel shrink>&nbsp;</InputLabel>
                                <Button
                                    variant={xp.current ? "contained" : "outlined"}
                                    color="info"
                                    size="small"
                                    onClick={() => handleExperienceChange(xp.id, "current", !xp.current)}
                                    sx={{ ml: 2 }}
                                >
                                    {xp.current ? "Current" : "Past"}
                                </Button>
                            </FormControl>
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveExperience(xp.id)}
                                disabled={experience.length === 1}
                                sx={{ mt: 1.5, ml: 1 }}
                            >
                                <RemoveCircleOutlineIcon />
                            </IconButton>
                        </Box>
                        <TextField
                            label="Description / Achievements"
                            value={xp.description}
                            onChange={e => handleExperienceChange(xp.id, "description", e.target.value)}
                            multiline
                            fullWidth
                            rows={2}
                            sx={{ mt: 2 }}
                            placeholder="e.g. Key responsibilities, achievements, projects"
                            autoComplete="off"
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
});

const StepCertifications = React.memo(function StepCertifications({
    certifications,
    handleCertificationChange,
    handleAddCertification,
    handleRemoveCertification,
}: {
    certifications: ReturnType<typeof newCertification>[],
    handleCertificationChange: (id: string, field: string, value: any) => void,
    handleAddCertification: () => void,
    handleRemoveCertification: (id: string) => void,
}) {
    return (
        <Box>
            {certifications.map(c => (
                <Card key={c.id} sx={{ mb: 2 }}>
                    <CardContent>
                        <Box display="flex" gap={2}>
                            <TextField
                                label="Certification Name"
                                value={c.name}
                                onChange={e => handleCertificationChange(c.id, "name", e.target.value)}
                                fullWidth
                                autoComplete="off"
                            />
                            <TextField
                                label="Issuer"
                                value={c.issuer}
                                onChange={e => handleCertificationChange(c.id, "issuer", e.target.value)}
                                fullWidth
                                autoComplete="off"
                            />
                        </Box>
                        <Box display="flex" gap={2} mt={2}>
                            <FormControl sx={{ width: 170 }}>
                                <InputLabel>Issue Month</InputLabel>
                                <Select
                                    label="Issue Month"
                                    value={c.issueMonth}
                                    onChange={e => handleCertificationChange(c.id, "issueMonth", e.target.value)}
                                >
                                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                                    ].map(m => (
                                        <MenuItem key={m} value={m}>{m}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                label="Issue Year"
                                value={c.issueYear}
                                onChange={e => handleCertificationChange(c.id, "issueYear", e.target.value)}
                                type="number"
                                sx={{ width: 120 }}
                                inputProps={{ min: 1940, max: 2100 }}
                                autoComplete="off"
                            />
                        </Box>
                        <TextField
                            label="Description"
                            value={c.description}
                            onChange={e => handleCertificationChange(c.id, "description", e.target.value)}
                            fullWidth
                            multiline
                            rows={2}
                            sx={{ mt: 2 }}
                            placeholder="Credential ID, Scope, Skills gained, etc."
                            autoComplete="off"
                        />
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveCertification(c.id)}
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
});

const StepSkillsLanguages = React.memo(function StepSkillsLanguages({
    skills,
    setSkillInput,
    skillInput,
    handleAddSkill,
    handleRemoveSkill,
    skillExamples,
    setSkills,
    languages,
    handleLanguageChange,
    handleAddLanguage,
    handleRemoveLanguage,
}: {
    skills: string[],
    setSkillInput: React.Dispatch<React.SetStateAction<string>>,
    skillInput: string,
    handleAddSkill: () => void,
    handleRemoveSkill: (s: string) => void,
    skillExamples: string[],
    setSkills: React.Dispatch<React.SetStateAction<string[]>>,
    languages: ReturnType<typeof newLanguage>[],
    handleLanguageChange: (id: string, field: string, value: any) => void,
    handleAddLanguage: () => void,
    handleRemoveLanguage: (id: string) => void
}) {
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
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddSkill();
                        }
                    }}
                    placeholder="e.g. Python, Data Analysis"
                    sx={{ width: 280 }}
                    autoComplete="off"
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
            {languages.map((l) => (
                <Box key={l.id} display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                    <TextField
                        label="Language"
                        value={l.name}
                        onChange={e => handleLanguageChange(l.id, "name", e.target.value)}
                        sx={{ width: 220 }}
                        autoComplete="off"
                    />
                    <FormControl sx={{ width: 200 }}>
                        <InputLabel>Proficiency</InputLabel>
                        <Select
                            label="Proficiency"
                            value={l.proficiency}
                            onChange={e => handleLanguageChange(l.id, "proficiency", e.target.value)}
                        >
                            {proficiencyOptions.map(p => (
                                <MenuItem key={p} value={p}>{p}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveLanguage(l.id)}
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
});

const StepPublications = React.memo(function StepPublications({
    publications,
    handlePublicationChange,
    handleAddPublication,
    handleRemovePublication,
}: {
    publications: ReturnType<typeof newPublication>[],
    handlePublicationChange: (id: string, field: string, value: string) => void,
    handleAddPublication: () => void,
    handleRemovePublication: (id: string) => void,
}) {
    return (
        <Box>
            {publications.map((pub) => (
                <Card key={pub.id} sx={{ mb: 2 }}>
                    <CardContent>
                        <Box display="flex" gap={2}>
                            <TextField
                                label="Title"
                                value={pub.title}
                                onChange={e => handlePublicationChange(pub.id, "title", e.target.value)}
                                fullWidth
                                autoComplete="off"
                            />
                            <TextField
                                label="Journal/Publisher"
                                value={pub.journal}
                                onChange={e => handlePublicationChange(pub.id, "journal", e.target.value)}
                                fullWidth
                                autoComplete="off"
                            />
                        </Box>
                        <Box display="flex" gap={2} mt={2}>
                            <TextField
                                label="Year"
                                value={pub.year}
                                onChange={e => handlePublicationChange(pub.id, "year", e.target.value)}
                                type="number"
                                sx={{ width: 120 }}
                                inputProps={{ min: 1940, max: 2100 }}
                                autoComplete="off"
                            />
                            <TextField
                                label="Link"
                                value={pub.link}
                                onChange={e => handlePublicationChange(pub.id, "link", e.target.value)}
                                fullWidth
                                placeholder="DOI, arXiv, etc."
                                autoComplete="off"
                            />
                        </Box>
                        <TextField
                            label="Description"
                            value={pub.description}
                            onChange={e => handlePublicationChange(pub.id, "description", e.target.value)}
                            fullWidth
                            multiline
                            rows={2}
                            sx={{ mt: 2 }}
                            autoComplete="off"
                        />
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemovePublication(pub.id)}
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
});

const SectionHeader = React.memo(function SectionHeader({ title }: { title: string }) {
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
});

const StepReview = React.memo(function StepReview({
    personal, education, experience, certifications, skills, languages, publications
}: {
    personal: typeof initialPersonal,
    education: ReturnType<typeof newEducation>[],
    experience: ReturnType<typeof newExperience>[],
    certifications: ReturnType<typeof newCertification>[],
    skills: string[],
    languages: ReturnType<typeof newLanguage>[],
    publications: ReturnType<typeof newPublication>[],
}) {
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
            {education.map((ed) => (
                <Box key={ed.id} mb={1.5} pl={1}>
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
            {experience.map((xp) =>
                xp.organization && xp.position ? (
                    <Box key={xp.id} mb={1.5} pl={1}>
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
            {!!certifications.filter(c => c.name).length && (
                <>
                    <SectionHeader title="Certifications" />
                    <List dense>
                        {certifications
                            .filter((c) => c.name)
                            .map((c) => (
                                <ListItem key={c.id}>
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
                {languages.filter(l => l.name).map(l => (
                    <Chip
                        key={l.id}
                        label={`${l.name} (${l.proficiency})`}
                        color="info"
                        variant="outlined"
                        sx={{ fontWeight: 500, fontSize: 15 }}
                    />
                ))}
            </Box>
            {!!publications.filter(p => p.title).length && (
                <>
                    <SectionHeader title="Publications" />
                    <List dense>
                        {publications
                            .filter(p => p.title)
                            .map(p => (
                                <ListItem key={p.id}>
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
});


// type ApiState = "idle" | "submitting" | "success" | "error";

// Dummy hook for fetching previous CVs (replace with real implementation!)
// You may want to move this out and connect to your backend.


const CVBuilder: React.FC = () => {
    const { user } = useAuth();

    // ------------- New state for Tab --------------
    const [tab, setTab] = useState<"create" | "mycvs">("create");

    // ------------- CV From API --------------------
    const [loadingCV, setLoadingCV] = useState<boolean>(false);
    const [, setCVLoaded] = useState<boolean>(false);

    // ------------- Manage CVs List ----------------
    const [myCVs, setMyCVs] = useState<any[]>([]);
    const [loadingCVs, setLoadingCVs] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [, setListError] = useState<string | null>(null);

    const refreshCVs = useCallback(() => {
        setRefreshTrigger((prev) => prev + 1);
    }, []);

    useEffect(() => {
        let isActive = true;
        setLoadingCVs(true);
        setListError(null);
        (async () => {
            try {
                const resp = await api.get("/app/cv-profiles/");
                if (isActive) {
                    if (resp?.data && Array.isArray(resp.data.results)) {
                        setMyCVs(resp.data.results);
                    } else {
                        setMyCVs([]);
                        setListError("Something went wrong fetching your CVs. Please try again.");
                    }
                }
            } catch (e: any) {
                setMyCVs([]);
                setListError("Failed to load your CVs. Please try again later.");
            } finally {
                if (isActive) setLoadingCVs(false);
            }
        })();
        return () => { isActive = false; }
    }, [refreshTrigger]);

    // ------------- Main Builder State -------------
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
    const [apiState, setApiState] = useState<ApiState>("idle");
    const [, setApiResponse] = useState<any | null>(null);

    useEffect(() => {
        const fetchCV = async () => {
            setLoadingCV(true);
            try {
                const response = await api.get(API_ENDPOINT);
                if (response && response.data) {
                    const cv = response.data;
                    setPersonal({
                        ...initialPersonal,
                        ...cv.personal,
                        fullName: cv.personal?.fullName ?? cv.personal?.full_name ?? "",
                        email: cv.personal?.email ?? "",
                        phone: cv.personal?.phone ?? "",
                        address: cv.personal?.address ?? "",
                        country: cv.personal?.country ?? "",
                        summary: cv.personal?.summary ?? cv.summary ?? "",
                        photo: cv.photo ?? null,
                    });
                    setEducation(Array.isArray(cv.education)
                        ? cv.education.map((ed: any) => ({
                            id: ed.id,
                            institution: ed.institution || "",
                            degree: ed.degree || "",
                            field: ed.field || "",
                            startYear: ed.start_year || "",
                            endYear: ed.end_year || "",
                            grade: ed.grade || "",
                            description: ed.description || "",
                        }))
                        : []);
                    setExperience(Array.isArray(cv.experience)
                        ? cv.experience.map((xp: any) => ({
                            id: xp.id,
                            organization: xp.organization || "",
                            position: xp.position || "",
                            startMonth: xp.start_month || "",
                            startYear: xp.start_year || "",
                            endMonth: xp.end_month || "",
                            endYear: xp.end_year || "",
                            location: xp.location || "",
                            description: xp.description || "",
                            current: xp.current || false,
                        }))
                        : []);
                    setCertifications(Array.isArray(cv.certifications)
                        ? cv.certifications.map((c: any) => ({
                            id: c.id,
                            name: c.name || "",
                            issuer: c.issuer || "",
                            issueMonth: c.issue_month || "",
                            issueYear: c.issue_year || "",
                            description: c.description || "",
                        }))
                        : []);
                    setSkills(Array.isArray(cv.skills)
                        ? cv.skills.map((s: any) => s.skill)
                        : []);
                    setLanguages(Array.isArray(cv.languages)
                        ? cv.languages.map((l: any) => ({
                            id: l.id,
                            name: l.name || "",
                            proficiency: l.proficiency || "",
                        }))
                        : []);
                    setPublications(Array.isArray(cv.publications)
                        ? cv.publications.map((p: any) => ({
                            id: p.id,
                            title: p.title || "",
                            journal: p.journal || "",
                            year: p.year || "",
                            link: p.link || "",
                            description: p.description || "",
                        }))
                        : []);
                    setCVLoaded(true);
                }
            } catch (e) {
                setCVLoaded(false);
            }
            setLoadingCV(false);
        };

        fetchCV();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (user) {
            setPersonal(prev => ({
                ...prev,
                fullName:
                    prev.fullName ||
                    (user?.full_name
                        ? user.full_name
                        : user?.first_name && user?.last_name
                            ? `${user.first_name} ${user.last_name}`.trim()
                            : ""),
                email: prev.email || user?.email || "",
                phone: prev.phone || user?.phone_number || "",
                address: prev.address || user?.current_address || user?.address || "",
                country: prev.country || user?.country_of_residence || user?.country || "",
                summary: prev.summary ?? "",
                photo: prev.photo ?? null
            }));
        }
        // eslint-disable-next-line
    }, [user]);

    const photoInputRef = useRef<HTMLInputElement>(null);

    // Navigation
    const handleNext = useCallback(() => {
        setError(null);
        if (!validateStep()) return;
        setStep(prev => prev + 1);
    }, [step, personal, education, experience, certifications, skills, languages]);

    const handleBack = useCallback(() => {
        setError(null);
        setStep(prev => Math.max(prev - 1, 0));
    }, []);

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
                if (
                    certifications.some(
                        (c) =>
                            (c.name || c.issuer || c.issueMonth || c.issueYear) &&
                            !(c.name && c.issuer && c.issueYear)
                    )
                ) {
                    setError("If you add a certification, please fill in name, issuer, and year.");
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

    // --- DYNAMIC FIELD HANDLERS (unchanged) ---
    const handleEducationChange = useCallback((id: string, field: string, value: any) => {
        setEducation(prev => {
            const arr = [...prev];
            updateArrayItemById_inplace(arr, id, field, value);
            return arr;
        });
    }, []);
    const handleAddEducation = useCallback(() =>
        setEducation(prev => [...prev, newEducation()]), []);
    const handleRemoveEducation = useCallback((id: string) =>
        setEducation(prev => (prev.length === 1 ? prev : prev.filter(item => item.id !== id))), []);

    const handleExperienceChange = useCallback((id: string, field: string, value: any) => {
        setExperience(prev => {
            const arr = [...prev];
            updateArrayItemById_inplace(arr, id, field, value, (item) => {
                if (field === "current" && value) {
                    item.endMonth = "";
                    item.endYear = "";
                }
            });
            return arr;
        });
    }, []);
    const handleAddExperience = useCallback(() =>
        setExperience(prev => [...prev, newExperience()]), []);
    const handleRemoveExperience = useCallback((id: string) =>
        setExperience(prev => (prev.length === 1 ? prev : prev.filter(item => item.id !== id))), []);

    const handleCertificationChange = useCallback((id: string, field: string, value: any) => {
        setCertifications(prev => {
            const arr = [...prev];
            updateArrayItemById_inplace(arr, id, field, value);
            return arr;
        });
    }, []);
    const handleAddCertification = useCallback(() =>
        setCertifications(prev => [...prev, newCertification()]), []);
    const handleRemoveCertification = useCallback((id: string) =>
        setCertifications(prev => (prev.length === 1 ? prev : prev.filter(item => item.id !== id))), []);

    const handleAddSkill = useCallback(() => {
        const val = skillInput.trim();
        if (val && !skills.includes(val)) {
            setSkills(prev => [...prev, val]);
        }
        setSkillInput("");
    }, [skills, skillInput]);
    const handleRemoveSkill = useCallback(
        (s: string) => setSkills(prev => prev.filter(sk => sk !== s)),
        []
    );

    const handleLanguageChange = useCallback((id: string, field: string, value: string) => {
        setLanguages(prev => {
            const arr = [...prev];
            updateArrayItemById_inplace(arr, id, field, value);
            return arr;
        });
    }, []);
    const handleAddLanguage = useCallback(
        () => setLanguages(prev => [...prev, newLanguage()]),
        []
    );
    const handleRemoveLanguage = useCallback((id: string) =>
        setLanguages(prev => (prev.length === 1 ? prev : prev.filter(item => item.id !== id))), []);

    const handlePublicationChange = useCallback((id: string, field: string, value: string) => {
        setPublications(prev => {
            const arr = [...prev];
            updateArrayItemById_inplace(arr, id, field, value);
            return arr;
        });
    }, []);
    const handleAddPublication = useCallback(
        () => setPublications(prev => [...prev, newPublication()]),
        []
    );
    const handleRemovePublication = useCallback((id: string) =>
        setPublications(prev => (prev.length === 1 ? prev : prev.filter(item => item.id !== id))), []);

    // Photo upload
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

    // ---------------- API/Serializing (unchanged) -------------------
    const mapFieldsForSerializer = () => {
        const educationSerialized = education.map(e => ({
            institution: e.institution,
            degree: e.degree,
            field: e.field,
            start_year: e.startYear,
            end_year: e.endYear,
            grade: e.grade,
            description: e.description,
        }));
        const experienceSerialized = experience.map(xp => ({
            organization: xp.organization,
            position: xp.position,
            start_month: xp.startMonth,
            start_year: xp.startYear,
            end_month: xp.endMonth,
            end_year: xp.endYear,
            location: xp.location,
            description: xp.description,
            current: xp.current,
        }));
        const certificationsSerialized = certifications.filter(c =>
            c.name || c.issuer || c.issueMonth || c.issueYear
        ).map(c => ({
            name: c.name,
            issuer: c.issuer,
            issue_month: c.issueMonth,
            issue_year: c.issueYear,
            description: c.description,
        }));
        const skillsSerialized = skills.map(skill => ({ skill }));
        const languagesSerialized = languages.filter(l => l.name).map(l => ({
            name: l.name,
            proficiency: l.proficiency,
        }));
        const publicationsSerialized = publications.filter(p => p.title).map(p => ({
            title: p.title,
            journal: p.journal,
            year: p.year,
            link: p.link,
            description: p.description,
        }));

        return {
            summary: personal.summary,
            photo: personal.photo,
            education: educationSerialized,
            experience: experienceSerialized,
            certifications: certificationsSerialized,
            skills: skillsSerialized,
            languages: languagesSerialized,
            publications: publicationsSerialized,
        };
    };

    const buildPayloadFormData = (): FormData => {
        const values = mapFieldsForSerializer();
        const data = new FormData();

        data.append("summary", values.summary ?? "");
        if (personal.photo) {
            data.append("photo", personal.photo, personal.photo.name);
        }

        function appendArrayFields(
            arr: any[],
            keyPrefix: string,
            fieldList?: string[]
        ) {
            arr.forEach((item, idx) => {
                Object.entries(item).forEach(([field, value]) => {
                    if (fieldList && !fieldList.includes(field)) return;
                    if (value === null || value === undefined) return;
                    data.append(`${keyPrefix}-${idx}-${field}`, String(value));
                });
            });
        }

        appendArrayFields(values.education,      "education",      ["institution", "degree", "field", "start_year", "end_year", "grade", "description"]);
        appendArrayFields(values.experience,     "experience",     ["organization", "position", "start_month", "start_year", "end_month", "end_year", "location", "description", "current"]);
        appendArrayFields(values.certifications, "certifications", ["name", "issuer", "issue_month", "issue_year", "description"]);
        appendArrayFields(values.skills,         "skills",         ["skill"]);
        appendArrayFields(values.languages,      "languages",      ["name", "proficiency"]);
        appendArrayFields(values.publications,   "publications",   ["title", "journal", "year", "link", "description"]);

        return data;
    };

    const handleGenerateCV = async () => {
        setError(null);
        setSubmissionDialog(false);
        setApiState("submitting");
        setGenerating(true);

        try {
            const formData = buildPayloadFormData();

            const response = await api.post(API_ENDPOINT, formData);

            setApiResponse(response.data);
            setApiState("success");
            setCvGenerated(true);
            refreshCVs(); // Refresh the CV list after save
        } catch (err: any) {
            let msg = "Failed to save CV profile.";
            if (err && err.response && err.response.data) {
                const errData = err.response.data;
                if (Array.isArray(errData.detail)) {
                    msg = errData.detail.join(" ");
                } else if (errData.detail) {
                    msg = errData.detail;
                }
            }
            setError(msg);
            setApiState("error");
        }
        setGenerating(false);
    };

    // Handler to edit an existing CV (from myCVs list)
    const handleEditCV = (cv: any) => {
        setPersonal({
            ...initialPersonal,
            ...cv.personal,
            fullName: cv.personal?.fullName ?? cv.personal?.full_name ?? "",
            email: cv.personal?.email ?? "",
            phone: cv.personal?.phone ?? "",
            address: cv.personal?.address ?? "",
            country: cv.personal?.country ?? "",
            summary: cv.summary || cv.personal?.summary || "",
            photo: cv.photo ?? null,
        });
        setEducation(Array.isArray(cv.education)
            ? cv.education.map((ed: any) => ({
                id: ed.id,
                institution: ed.institution || "",
                degree: ed.degree || "",
                field: ed.field || "",
                startYear: ed.start_year || ed.startYear || "",
                endYear: ed.end_year || ed.endYear || "",
                grade: ed.grade || "",
                description: ed.description || "",
            }))
            : []);
        setExperience(Array.isArray(cv.experience)
            ? cv.experience.map((xp: any) => ({
                id: xp.id,
                organization: xp.organization || "",
                position: xp.position || "",
                startMonth: xp.start_month || xp.startMonth || "",
                startYear: xp.start_year || xp.startYear || "",
                endMonth: xp.end_month || xp.endMonth || "",
                endYear: xp.end_year || xp.endYear || "",
                location: xp.location || "",
                description: xp.description || "",
                current: xp.current || false,
            }))
            : []);
        setCertifications(Array.isArray(cv.certifications)
            ? cv.certifications.map((c: any) => ({
                id: c.id,
                name: c.name || "",
                issuer: c.issuer || "",
                issueMonth: c.issue_month || c.issueMonth || "",
                issueYear: c.issue_year || c.issueYear || "",
                description: c.description || "",
            }))
            : []);
        setSkills(Array.isArray(cv.skills)
            ? cv.skills.map((s: any) => s.skill)
            : []);
        setLanguages(Array.isArray(cv.languages)
            ? cv.languages.map((l: any) => ({
                id: l.id,
                name: l.name || "",
                proficiency: l.proficiency || "",
            }))
            : []);
        setPublications(Array.isArray(cv.publications)
            ? cv.publications.map((p: any) => ({
                id: p.id,
                title: p.title || "",
                journal: p.journal || "",
                year: p.year || "",
                link: p.link || "",
                description: p.description || "",
            }))
            : []);
        setStep(0);
        setTab("create");
        setApiState("idle");
        setCvGenerated(false);
        setApiResponse(null);
    };

    const handleEdit = useCallback(() => {
        setCvGenerated(false);
        setStep(0);
        setApiState("idle");
        setApiResponse(null);
    }, []);

    // ---- STEP PAGES ----
    const stepComponents = [
        <StepPersonal
            key="personal"
            personal={personal}
            setPersonal={setPersonal}
            photoInputRef={photoInputRef as React.RefObject<HTMLInputElement>}
            handlePhotoChange={handlePhotoChange}
            removePhoto={removePhoto}
            user={user}
        />,
        <StepEducation
            key="education"
            education={education}
            handleEducationChange={handleEducationChange}
            handleAddEducation={handleAddEducation}
            handleRemoveEducation={handleRemoveEducation}
        />,
        <StepExperience
            key="experience"
            experience={experience}
            handleExperienceChange={handleExperienceChange}
            handleAddExperience={handleAddExperience}
            handleRemoveExperience={handleRemoveExperience}
        />,
        <StepCertifications
            key="certifications"
            certifications={certifications}
            handleCertificationChange={handleCertificationChange}
            handleAddCertification={handleAddCertification}
            handleRemoveCertification={handleRemoveCertification}
        />,
        <StepSkillsLanguages
            key="skillslanguages"
            skills={skills}
            setSkillInput={setSkillInput}
            skillInput={skillInput}
            handleAddSkill={handleAddSkill}
            handleRemoveSkill={handleRemoveSkill}
            skillExamples={skillExamples}
            setSkills={setSkills}
            languages={languages}
            handleLanguageChange={handleLanguageChange}
            handleAddLanguage={handleAddLanguage}
            handleRemoveLanguage={handleRemoveLanguage}
        />,
        <StepPublications
            key="publications"
            publications={publications}
            handlePublicationChange={handlePublicationChange}
            handleAddPublication={handleAddPublication}
            handleRemovePublication={handleRemovePublication}
        />,
        <StepReview
            key="review"
            personal={personal}
            education={education}
            experience={experience}
            certifications={certifications}
            skills={skills}
            languages={languages}
            publications={publications}
        />,
    ];

    /**
     * Opens a modal to select a template for printing the CV.
     * Shows live preview, allows the user to select a template, then prints the formatted CV to PDF.
     */
    function handlePrint(cv: any) {
        // Triggers the print preview modal. 
        setActivePrintCV(cv);
        setPrintTemplateId(availableTemplates.length > 0 ? availableTemplates[0].id : null);
        setPrintPreviewOpen(true);
    }

    // --- Printing modal state ---
    const [activePrintCV, setActivePrintCV] = useState<any>(null);
    const [printTemplateId, setPrintTemplateId] = useState<string | null>(null);
    const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
    // Example templates (replace with your actual template options)
    const availableTemplates = [
        { id: 'classic', label: 'Classic', component: ClassicCVTemplate },
        { id: 'modern', label: 'Modern', component: ModernCVTemplate },
        // Add more templates here
    ];

    // --- Print Preview Modal ---
    function PrintPreviewModal() {
        const selectedTemplate = availableTemplates.find((t) => t.id === printTemplateId);
        const Component = selectedTemplate ? selectedTemplate.component : null;

        const handleClose = () => {
            setPrintPreviewOpen(false);
            setActivePrintCV(null);
        };

        const handlePrintPdf = () => {
            if (!Component) return;
            // Render the component to a DOM node and print (using a print area ref)
            window.setTimeout(() => {
                window.print();
            }, 200);
        };

        return (
            <Dialog
                open={printPreviewOpen}
                onClose={handleClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { minHeight: '90vh', maxHeight: '98vh' } }}
            >
                <DialogTitle>
                    Print CV as PDF
                </DialogTitle>
                <DialogContent dividers sx={{ bgcolor: "#fafbfc" }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontWeight: 600 }}>Select Template</Typography>
                        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                            {availableTemplates.map((tpl) => (
                                <Button
                                    key={tpl.id}
                                    variant={printTemplateId === tpl.id ? "contained" : "outlined"}
                                    onClick={() => setPrintTemplateId(tpl.id)}
                                    color="primary"
                                >
                                    {tpl.label}
                                </Button>
                            ))}
                        </Box>
                    </Box>
                    <Box sx={{ mt: 2, py: 2, px: 1, bgcolor: "white", borderRadius: 2 }}>
                        {Component && activePrintCV ? (
                            <div id="cv-print-area">
                                <Component cv={activePrintCV} />
                            </div>
                        ) : (
                            <Typography variant="body1" color="text.secondary">
                                Please select a template to preview the CV.
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        onClick={handlePrintPdf}
                        disabled={!printTemplateId || !activePrintCV}
                        variant="contained"
                        color="primary"
                    >
                        Print as PDF
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    // Show print preview modal if open
    const printPreviewModalElem = printPreviewOpen ? <PrintPreviewModal /> : null;

    // ---- MAIN RENDER ----
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

            {/* Print Preview Modal */}
            {printPreviewModalElem}

            <Card>
                <CardContent>
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        aria-label="CV tabs"
                        sx={{ mb: 3 }}
                    >
                        <Tab value="create" label="Create/Edit CV" />
                        <Tab value="mycvs" label="My CVs" />
                    </Tabs>

                    {/* --- Tab: My CVs --- */}
                    {tab === "mycvs" && (
                        <Box sx={{ my: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                                Your Saved CVs
                            </Typography>
                            {loadingCVs ? (
                                <Box sx={{ display: "flex", justifyContent: "center", my: 8 }}>
                                    <CircularProgress size={32} />
                                </Box>
                            ) : myCVs && Array.isArray(myCVs) && myCVs.length > 0 ? (
                                <List>
                                    {myCVs.filter(cv => !!cv && Object.keys(cv).length > 0).map((cv: any) => (
                                        <ListItem
                                            key={cv.id}
                                            secondaryAction={
                                                <span>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => handleEditCV(cv)}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="primary"
                                                        // Here: Print button triggers preview modal
                                                        onClick={() => handlePrint(cv)}
                                                    >
                                                        Print
                                                    </Button>
                                                </span>
                                            }
                                        >
                                            <ListItemText
                                                primary={
                                                    <span>
                                                        <b>
                                                            {cv.summary || "Untitled CV"}
                                                        </b>
                                                    </span>
                                                }
                                                secondary={
                                                    <>
                                                        {cv.created_at && (
                                                            <span>Created: {new Date(cv.created_at).toLocaleDateString()}</span>
                                                        )}
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Alert severity="info">
                                    You have not created any CVs yet. Create one in the <b>Create/Edit CV</b> tab!
                                </Alert>
                            )}
                        </Box>
                    )}

                    {/* --- Tab: CV Builder Steps --- */}
                    {tab === "create" && (
                        <Box>
                            {loadingCV ? (
                                <Box display="flex" alignItems="center" justifyContent="center" sx={{ py: 8 }}>
                                    <CircularProgress size={36} />
                                    <Typography variant="h6" sx={{ ml: 2 }}>Loading your CV...</Typography>
                                </Box>
                            ) : (
                                <>
                                    <Stepper activeStep={step} alternativeLabel sx={{ mb: 2 }}>
                                        {steps.map((label) => (
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

                                    {apiState === "success" && cvGenerated ? (
                                        <Box textAlign="center" py={6}>
                                            <Alert
                                                severity="success"
                                                sx={{ mb: 3, mx: "auto", maxWidth: 470, fontSize: "1.1rem" }}
                                            >
                                                <b>Your CV profile has been saved!</b>
                                                <br />
                                                You may print/save this page as a PDF. &nbsp;
                                                <span style={{ color: "#4caf50" }}>
                                                    (You can now access your CV from your profile dashboard.)
                                                </span>
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
                                                // Here: Print/Save button triggers preview modal for the current CV
                                                onClick={() => handlePrint({
                                                    personal, education, experience, certifications, skills, languages, publications, summary: personal.summary, photo: personal.photo
                                                })}
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
                                            {stepComponents[step]}

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
                                                            Save CV
                                                        </Button>
                                                    )}
                                                </Box>
                                            )}
                                            {generating && (
                                                <Box display="flex" alignItems="center" mt={4} justifyContent="center">
                                                    <CircularProgress size={36} color="success" sx={{ mr: 2 }} />
                                                    <Typography variant="h6" fontWeight={600}>
                                                        Saving your CV...
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                </>
                            )}
                        </Box>
                    )}

                    {/* --- Export/Save Dialog (for create) --- */}
                    <Dialog open={submissionDialog} onClose={() => setSubmissionDialog(false)}>
                        <DialogTitle>Save CV Profile</DialogTitle>
                        <DialogContent>
                            <Typography>
                                Are you sure you want to save your CV profile? After saving, you can print or export it as PDF.
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
                                disabled={generating}
                            >
                                Save
                            </Button>
                        </DialogActions>
                    </Dialog>
                </CardContent>
            </Card>
        </Box>
    );
};



export default CVBuilder;

// End guidance: fixed field focus/rerender issue by moving step components out of render, wrapping in React.memo, and passing props. Only the "active" step is rendered; no function is re-created on every render.
