import React, { useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    CircularProgress,
    Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import { CountrySelect } from "../../../../components/CountrySelect";


const availableJobs = [
    "Software Engineer",
    "Healthcare Assistant",
    "Construction Worker",
    "Hospitality Staff",
    "Teacher",
    "Driver",
    "Warehouse Operative",
    "Other",
];

export const ScheduleInterview: React.FC = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        country: "",
        job: "",
        date: "",
        time: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name as string]: value,
        }));
    };

    // Handler for CountrySelect
    const handleCountryChange = (value: string) => {
        setForm((prev) => ({
            ...prev,
            country: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        // Simulate API call
        setTimeout(() => {
            setSubmitting(false);
            setSuccess("Your interview has been scheduled! You will receive a confirmation email shortly.");
            // Optionally, navigate to another page after a delay
            // setTimeout(() => navigate("/customer/travel/work-visa/track-progress"), 2000);
        }, 1500);
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
                    Schedule Interview
                </Typography>
                <Typography variant="body1" className="text-gray-700 mb-4">
                    Book a date for your work visa job interview. Please fill in your details and select your preferred country, job, and interview slot.
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
                            {/* Replace Country with CountrySelect */}
                            <CountrySelect
                                label="Country"
                                value={form.country}
                                onChange={(value: string | null) => handleCountryChange(value ?? "")}
                                required
                                fullWidth
                            />
                            <FormControl fullWidth required>
                                <InputLabel>Job</InputLabel>
                                <Select
                                    label="Job"
                                    name="job"
                                    value={form.job}
                                    onChange={(event) => {
                                        const { name, value } = event.target;
                                        handleChange({
                                            target: { name, value }
                                        } as React.ChangeEvent<HTMLInputElement>);
                                    }}
                                >
                                    {availableJobs.map((job) => (
                                        <MenuItem key={job} value={job}>
                                            {job}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                label="Interview Date"
                                name="date"
                                type="date"
                                value={form.date}
                                onChange={handleChange}
                                required
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                            <TextField
                                label="Interview Time"
                                name="time"
                                type="time"
                                value={form.time}
                                onChange={handleChange}
                                required
                                InputLabelProps={{ shrink: true }}
                                fullWidth
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
                                {submitting ? <CircularProgress size={24} /> : "Schedule Interview"}
                            </Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>
            <Box mt={3} textAlign="center">
                <Button
                    variant="text"
                    onClick={() => navigate("/travel/work-visa")}
                    sx={{ textTransform: "none" }}
                >
                    &larr; Back to Work Visa Home
                </Button>
            </Box>
        </Box>
    );
};

export default ScheduleInterview;
