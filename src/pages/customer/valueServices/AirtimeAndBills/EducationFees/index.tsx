import React, { useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    TextField,
    InputAdornment,
    Avatar,
    Fade,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from "@mui/material";
import { CustomerPageHeader } from "../../../../../components/CustomerPageHeader";
import api from "../../../../../services/api";

type EducationProviderKey = "waec" | "neco" | "nabteb" | "jamb" | "university" | "others";
const educationProviders: {
    value: EducationProviderKey;
    label: string;
    logo: string;
    color?: string;
    feeTypes: { label: string; value: string; min?: number; max?: number; defaultAmount?: number }[];
}[] = [
        {
            value: "waec",
            label: "WAEC",
            logo: "/assets/education/waec.png",
            color: "#14245c",
            feeTypes: [{ label: "WAEC Registration", value: "waec_reg", min: 10000, defaultAmount: 18000 }]
        },
        {
            value: "neco",
            label: "NECO",
            logo: "/assets/education/neco.png",
            color: "#468642",
            feeTypes: [{ label: "NECO Registration", value: "neco_reg", min: 9000, defaultAmount: 17000 }]
        },
        {
            value: "nabteb",
            label: "NABTEB",
            logo: "/assets/education/nabteb.png",
            color: "#b39828",
            feeTypes: [{ label: "NABTEB Registration", value: "nabteb_reg", min: 8500, defaultAmount: 13000 }]
        },
        {
            value: "jamb",
            label: "JAMB/UTME",
            logo: "/assets/education/jamb.png",
            color: "#228c3a",
            feeTypes: [{ label: "JAMB/UTME Registration", value: "jamb_reg", min: 5000, defaultAmount: 9000 }]
        },
        {
            value: "university",
            label: "University",
            logo: "/assets/education/university.png",
            color: "#25437b",
            feeTypes: [
                { label: "Acceptance Fee", value: "uni_accept", min: 20000 },
                { label: "School Fees", value: "uni_tuition", min: 25000 },
                { label: "Departmental Fees", value: "uni_dept", min: 3000 },
                { label: "Other University Fee", value: "uni_other", min: 1000 }
            ]
        },
        {
            value: "others",
            label: "Other Exam Fees",
            logo: "/assets/education/others.png",
            color: "#888",
            feeTypes: [
                { label: "External Exam Fee", value: "other_exam", min: 1000 },
                { label: "Training/Program Fee", value: "other_training", min: 1000 }
            ]
        }
    ];

export const EducationFeePayment: React.FC = () => {
    const [provider, setProvider] = useState<EducationProviderKey | "">("");
    const [feeType, setFeeType] = useState<string>("");
    const [candidateName, setCandidateName] = useState<string>("");
    const [regNo, setRegNo] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Lookup
    const selectedProvider = educationProviders.find(p => p.value === provider);
    const selectedFee = selectedProvider?.feeTypes.find(f => f.value === feeType);

    // Reset feeType if provider changes
    React.useEffect(() => {
        setFeeType("");
    }, [provider]);

    // If feeType changes and it has a default amount, use it
    React.useEffect(() => {
        if (selectedFee?.defaultAmount) setAmount(String(selectedFee.defaultAmount));
        else setAmount("");
    }, [feeType, selectedFee]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMsg(null);
        setErrorMsg(null);
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            await api.post(
                "/value-services/education-fees/pay/",
                {
                    provider,
                    feeType,
                    candidateName,
                    regNo,
                    amount: Number(amount)
                },
                { headers }
            );
            setSuccessMsg("Payment was successful!");
            setProvider("");
            setFeeType("");
            setCandidateName("");
            setRegNo("");
            setAmount("");
        } catch (err: any) {
            setErrorMsg(
                err?.response?.data?.detail ||
                "Failed to process your payment. Please try again."
            );
        }
        setLoading(false);
    };

    /**
     * Provider Selector UI
     */
    const ProviderSelector = () => (
        <Card className="rounded-2xl shadow-md">
            <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "stretch", py: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Select Exam/Education Provider
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
                    {educationProviders.map((p) => (
                        <Button
                            key={p.value}
                            onClick={() => setProvider(p.value)}
                            variant={provider === p.value ? "contained" : "outlined"}
                            sx={{
                                minWidth: 110,
                                maxWidth: 140,
                                bgcolor: provider === p.value ? p.color || "primary.main" : "#fff",
                                color: provider === p.value ? "#fff" : "inherit",
                                border: provider === p.value ? `2px solid ${p.color || "#aaa"}` : "1.5px solid #eee",
                                boxShadow: provider === p.value ? "0 6px 24px 2px rgba(30,60,0,0.10)" : "none",
                                py: 1.5,
                                px: 0,
                                minHeight: 82,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 0.3,
                                borderRadius: 3,
                                "&:hover": { bgcolor: p.color ? p.color + "ec" : undefined }
                            }}
                        >
                            <Avatar
                                src={p.logo}
                                alt={p.label}
                                sx={{ width: 36, height: 36, mb: 0.5, bgcolor: "#fff" }}
                                imgProps={{ style: { objectFit: "contain" } }}
                            />
                            <span style={{ fontSize: 14, fontWeight: 500 }}>{p.label}</span>
                        </Button>
                    ))}
                </Box>
                {!provider && (
                    <Typography color="error" variant="caption" sx={{ mt: 1, textAlign: "center" }}>
                        Please select a provider
                    </Typography>
                )}
            </CardContent>
        </Card>
    );

    /**
     * Fee Type Selector
     */
    const FeeTypeSelector = () => (
        <Card className="rounded-2xl shadow-md">
            <CardContent>
                <FormControl fullWidth>
                    <InputLabel id="fee-type-label">Fee Type</InputLabel>
                    <Select
                        labelId="fee-type-label"
                        label="Fee Type"
                        value={feeType}
                        onChange={(e) => setFeeType(e.target.value)}
                        required
                        disabled={!selectedProvider}
                    >
                        {selectedProvider?.feeTypes.map((ft) => (
                            <MenuItem value={ft.value} key={ft.value}>
                                {ft.label}
                            </MenuItem>
                        ))}
                        {!selectedProvider && (
                            <MenuItem disabled value="">
                                Select provider to see fees
                            </MenuItem>
                        )}
                    </Select>
                </FormControl>
            </CardContent>
        </Card>
    );

    /**
     * Candidate Name Input
     */
    const CandidateNameInput = () => (
        <Card className="rounded-2xl shadow-md">
            <CardContent>
                <TextField
                    fullWidth
                    label="Candidate/Student Name"
                    value={candidateName}
                    onChange={e => setCandidateName(e.target.value)}
                    placeholder="Enter candidate's full name"
                    required
                />
            </CardContent>
        </Card>
    );

    /**
     * Registration/Exam Number Input (optional for some fees)
     */
    const RegNoInput = () => (
        <Card className="rounded-2xl shadow-md">
            <CardContent>
                <TextField
                    fullWidth
                    label="Reg/Exam Number (if applicable)"
                    value={regNo}
                    onChange={e => setRegNo(e.target.value)}
                    placeholder="e.g. 234511099"
                />
            </CardContent>
        </Card>
    );

    /**
     * Amount Input
     */
    const AmountInput = () => (
        <Card className="rounded-2xl shadow-md">
            <CardContent>
                <TextField
                    fullWidth
                    type="number"
                    label="Amount"
                    value={amount}
                    onChange={e => setAmount(e.target.value.replace(/^0+/, ""))}
                    required
                    inputProps={{
                        min: selectedFee?.min || 1000,
                        max: selectedFee?.max || undefined,
                        step: 100,
                    }}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">&#8358;</InputAdornment>
                    }}
                    placeholder={
                        selectedFee?.defaultAmount
                            ? String(selectedFee.defaultAmount)
                            : selectedFee?.min
                                ? "Minimum ₦" + selectedFee?.min
                                : "Enter amount"
                    }
                />
            </CardContent>
        </Card>
    );

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
                <Typography
                    variant="h4"
                    className="font-bold mb-6"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        lineHeight: 1.08,
                    }}
                >
                    Pay Exam &amp; Education Fees
                </Typography>
            </CustomerPageHeader>

            <Typography variant="body1" className="text-gray-700 mb-6">
                Conveniently pay for exam registration, school fees, acceptance and other education-related payments.
            </Typography>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 mb-6">
                    <ProviderSelector />
                    <Fade in={!!provider}>
                        <div>
                            {!!provider && <FeeTypeSelector />}
                        </div>
                    </Fade>
                    <Fade in={!!provider && !!feeType}>
                        <div>
                            <CandidateNameInput />
                        </div>
                    </Fade>
                    <Fade in={!!provider && !!feeType}>
                        <div>
                            <RegNoInput />
                        </div>
                    </Fade>
                    <Fade in={!!provider && !!feeType}>
                        <div>
                            <AmountInput />
                        </div>
                    </Fade>
                </div>
                <Button
                    variant="contained"
                    fullWidth
                    className="bg-blue-700 hover:bg-blue-800 text-white rounded-full py-3 font-semibold normal-case"
                    disabled={
                        !provider ||
                        !feeType ||
                        !candidateName ||
                        !amount ||
                        Number(amount) < (selectedFee?.min || 1000) ||
                        loading
                    }
                    type="submit"
                    sx={{
                        mt: 1,
                        fontSize: 18,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        borderRadius: 999,
                        minHeight: 48,
                    }}
                >
                    {loading ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        <>
                            <span>
                                Pay Now
                            </span>
                            {selectedProvider && (
                                <Avatar
                                    src={selectedProvider.logo}
                                    alt={selectedProvider.label}
                                    sx={{
                                        width: 24,
                                        height: 24,
                                        ml: 1,
                                        bgcolor: "#fff",
                                    }}
                                    variant="rounded"
                                />
                            )}
                        </>
                    )}
                </Button>
            </form>

            {/* Success & error messages */}
            {successMsg && (
                <Typography color="success.main" sx={{ mt: 3 }}>
                    {successMsg}
                </Typography>
            )}
            {errorMsg && (
                <Typography color="error.main" sx={{ mt: 3 }}>
                    {errorMsg}
                </Typography>
            )}

            {/* Guide */}
            <Typography
                variant="h6"
                className="font-bold mb-4"
                sx={{ mt: 4 }}
            >
                How it works
            </Typography>
            <div className="flex flex-col gap-2">
                <Typography variant="body2">
                    1. Choose the exam/education body you wish to pay for (WAEC, NECO, University, etc).
                </Typography>
                <Typography variant="body2">
                    2. Select the fee type (registration, school fee, acceptance, etc).
                </Typography>
                <Typography variant="body2">
                    3. Enter the candidate/student name (as it appears on their form).
                </Typography>
                <Typography variant="body2">
                    4. Provide registration or exam number (if available).
                </Typography>
                <Typography variant="body2">
                    5. Enter the correct amount for your selected fee, then click <b>Pay Now</b>.
                </Typography>
                <Typography variant="body2">
                    6. Follow the prompts to complete payment. Confirmation/receipt will be shown upon success.
                </Typography>
            </div>
        </Box>
    );
};

export default EducationFeePayment;
