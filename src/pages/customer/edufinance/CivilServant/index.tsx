import React, { useState, useEffect } from "react";
import {
    Button,
    Card,
    CardContent,
    Typography,
    Box,
    CircularProgress,
    Tabs,
    Tab,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import { toast } from "react-toastify";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import FinanceCard from "../../../../components/FinanceCard";

// --- Mock Data (unchanged) ---
const MOCK_CIVIL_LOANS = [
    {
        id: 1,
        loan_title: "Civil Servant Cash Advance",
        description: "Short-term advance for wage earners in the public sector.",
        employer: "Any Verified Public Sector Employer",
        amount: 200000,
        currency: "NGN",
        type: "Salary-backed",
    },
    {
        id: 2,
        loan_title: "Home Renovation Loan",
        description: "Upgrade or renovate your residence with support for civil workers.",
        employer: "Federal & State Employees",
        amount: 350000,
        currency: "NGN",
        type: "Secured",
    },
    {
        id: 3,
        loan_title: "Auto Loan for Public Servants",
        description: "Acquire a new or used car with flexible repayment.",
        employer: "Government Workers",
        amount: 1000000,
        currency: "NGN",
        type: "Secured",
    },
];

function getLoanById(id: number) {
    return MOCK_CIVIL_LOANS.find((loan) => loan.id === id);
}

// --- Application Card ---
const ApplicationCard: React.FC<{
    title: string;
    description?: string;
    employer: string;
    status?: string;
    amount: string | number;
    currency: string;
    type?: string;
    onApply?: () => void;
}> = ({
    title,
    description,
    employer,
    status,
    amount,
    currency,
    type,
    onApply,
}) => (
        <Card
            className="rounded-2xl shadow-md transition-transform hover:scale-[1.025] hover:shadow-lg"
            sx={{
                borderLeft: `6px solid ${status
                    ? status === "Disbursed"
                        ? "#4caf50"
                        : status === "Under Review"
                            ? "#ff9800"
                            : status === "Rejected"
                                ? "#f44336"
                                : "#bdbdbd"
                    : "#1976d2"
                    }`,
                margin: "auto",
                background: "#fffdfa",
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <CardContent className="flex flex-col gap-2" sx={{ flex: 1 }}>
                <Box className="flex items-center justify-between gap-4 mb-1">
                    <Typography
                        variant="subtitle1"
                        className="font-bold"
                        sx={{ fontSize: "1.1rem" }}
                    >
                        {title}
                    </Typography>
                    {status ? (
                        <Button
                            size="small"
                            className="bg-[#f5ebe1] rounded-xl normal-case w-fit"
                            sx={{
                                fontWeight: 600,
                                fontSize: "0.85rem",
                                color:
                                    status === "Disbursed"
                                        ? "#388e3c"
                                        : status === "Under Review"
                                            ? "#ff9800"
                                            : status === "Rejected"
                                                ? "#d32f2f"
                                                : "#616161",
                                background:
                                    status === "Disbursed"
                                        ? "#e8f5e9"
                                        : status === "Under Review"
                                            ? "#fff3e0"
                                            : status === "Rejected"
                                                ? "#ffebee"
                                                : "#f5ebe1",
                                px: 2,
                                py: 0.5,
                                boxShadow: "none",
                                pointerEvents: "none",
                            }}
                            disableElevation
                        >
                            {status}
                        </Button>
                    ) : (
                        onApply && (
                            <Button
                                size="small"
                                className="bg-[#f5ebe1] rounded-xl normal-case w-fit font-semibold hover:bg-[#f3e1d5]"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: "0.90rem",
                                    px: 2,
                                    py: 0.5,
                                    boxShadow: "none",
                                }}
                                onClick={onApply}
                            >
                                Apply
                            </Button>
                        )
                    )}
                </Box>
                {description && (
                    <Typography variant="body2" sx={{ mb: 1, color: "#714300" }}>
                        {description}
                    </Typography>
                )}
                <Box className="flex flex-col gap-1">
                    <Box className="flex items-center gap-2">
                        <Typography
                            variant="body2"
                            className="text-gray-600"
                            sx={{ fontWeight: 500, minWidth: 88 }}
                        >
                            Employer:
                        </Typography>
                        <Typography variant="body2" className="text-gray-800">
                            {employer}
                        </Typography>
                    </Box>
                    <Box className="flex items-center gap-2">
                        <Typography
                            variant="body2"
                            className="text-gray-600"
                            sx={{ fontWeight: 500, minWidth: 70 }}
                        >
                            Amount:
                        </Typography>
                        <Typography variant="body2" className="text-gray-800">
                            {amount} {currency}
                        </Typography>
                    </Box>
                    {type && (
                        <Box className="flex items-center gap-2">
                            <Typography
                                variant="body2"
                                className="text-gray-600"
                                sx={{ fontWeight: 500, minWidth: 70 }}
                            >
                                Type:
                            </Typography>
                            <Typography variant="body2" className="text-gray-800">
                                {type}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );

const GuideCard: React.FC<{ title: string }> = ({ title }) => (
    <Button className="bg-[#f5ebe1] rounded-xl px-6 py-3 font-semibold normal-case shadow-sm hover:bg-[#f3e1d5]">
        {title}
    </Button>
);

export const CivilServantLoanPage: React.FC = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const [recentApplications, setRecentApplications] = useState<any[]>([]);
    const [loadingApplications, setLoadingApplications] = useState(true);

    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down("sm"));
    const [walletLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        setLoadingApplications(true);
        setTimeout(() => {
            if (!mounted) return;
            setRecentApplications([
                {
                    id: "civapp1",
                    loan_id: 1,
                    status: "Under Review",
                    created_at: "2024-06-01T09:00:00.000Z",
                    amount: 100000,
                    currency: "NGN",
                },
                {
                    id: "civapp2",
                    loan_id: 2,
                    status: "Disbursed",
                    created_at: "2024-05-10T10:30:00.000Z",
                    amount: 350000,
                    currency: "NGN",
                },
            ]);
            setLoadingApplications(false);
        }, 500);
        return () => { mounted = false; };
    }, []);

    const appliedLoanIds = recentApplications.map((app) => app.loan_id);
    const transactions = [
        { title: "Flight to Accra", amount: "#25.00" },
        { title: "Saving deposit", amount: "#25.00" },
    ];
    const getColumnWidth = (breakpoints: any) => ({
        flex: `0 0 auto`,
        minWidth: breakpoints.xs || "100%",
        maxWidth: breakpoints.max || 380,
        width: breakpoints.xs || "100%",
        ...(breakpoints.sm && {
            [`@media (min-width:600px)`]: {
                minWidth: breakpoints.sm,
                width: breakpoints.sm,
            },
        }),
        ...(breakpoints.md && {
            [`@media (min-width:900px)`]: {
                minWidth: breakpoints.md,
                width: breakpoints.md,
            },
        }),
    });

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
                    Civil Servant Loan
                </Typography>
            </CustomerPageHeader>


            <Box
                display="flex"
                flexDirection={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                mb={6}
                gap={2}
            >
                <Typography
                    variant="body2"
                    className="text-gray-600"
                    sx={{
                        maxWidth: { xs: "100%", md: 350 },
                        mb: { xs: 2, md: 0 },
                    }}
                >
                    Loans tailored for civil servants – flexible terms, quick disbursal, minimal documentation.
                </Typography>
                <Button
                    variant="contained"
                    className="bg-[#f5ebe1] text-black shadow-sm rounded-xl normal-case"
                    sx={{ mt: { xs: 2, md: 0 } }}
                    fullWidth={isXs}
                >
                    Chat with Agent
                </Button>
            </Box>

            {/* Wallet Card Area */}
            <Box sx={{ mb: 2 }}>
                {walletLoading ? (
                    <Card
                        className="rounded-2xl shadow-md"
                        sx={{
                            mb: 3,
                            background: "linear-gradient(90deg, #fbe5d6 75%, #fffdfa 120%)",
                            minWidth: 300,
                            maxWidth: 420,
                            py: 2,
                            px: { xs: 2, sm: 4 },
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <CardContent sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <CircularProgress color="secondary" />
                            <Typography sx={{ ml: 2 }}>Loading Wallet...</Typography>
                        </CardContent>
                    </Card>
                ) : (
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            gap: { xs: 2, md: 8 }, // significantly increase horizontal gap on desktop
                            flexWrap: { xs: "wrap", md: "nowrap" },
                            alignItems: "stretch",
                        }}
                    >
                        {[
                            {
                                title: "Travel Wallet",
                                amount: "#125,000,000",
                                buttonText: "Fund wallet"
                            },
                            {
                                title: "Loan Amount",
                                amount: "#1,425,000,000",
                                buttonText: "Make Payment"
                            },
                            {
                                title: "Amount Paid",
                                amount: "#425,000,000",
                                buttonText: "Make Payment"
                            }
                        ].map((item, _idx) => (
                            <Box
                                key={item.title}
                                sx={{
                                    ...getColumnWidth({
                                        xs: "100%",
                                        sm: 260,
                                        md: 260,
                                        max: 420
                                    }),
                                    mb: { xs: 2, md: 0 },
                                    flex: { xs: "unset", md: 1 }, // ensure items grow equally
                                }}
                            >
                                <FinanceCard
                                    title={item.title}
                                    amount={item.amount}
                                    buttonText={item.buttonText}
                                    transactions={transactions}
                                />
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>


            {/* Tabs */}
            <Box sx={{ mt: 2, mb: 2 }}>
                <Tabs
                    value={tabIndex}
                    onChange={(_, newValue) => setTabIndex(newValue)}
                    sx={{
                        borderBottom: 1,
                        borderColor: "divider",
                        mb: 0,
                        pt: 0,
                    }}
                    aria-label="Applications and Offers Tabs"
                    variant={isXs ? "scrollable" : "standard"}
                    scrollButtons={isXs ? "auto" : undefined}
                >
                    <Tab label="Recent Applications" />
                    <Tab label="Available Offers" />
                </Tabs>
            </Box>
            {/* Tab Panels */}
            {tabIndex === 0 && (
                <>
                    <Box
                        sx={{
                            mb: 2,
                            display: "flex",
                            alignItems: "center",
                            flexDirection: { xs: "column", sm: "row" },
                            justifyContent: "space-between",
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: { xs: 1, sm: 0 } }}>
                            Recent Applications
                        </Typography>
                        <Button
                            size="small"
                            variant="text"
                            sx={{
                                ml: { xs: 0, sm: 2 },
                                mt: { xs: 1, sm: 0 },
                                width: { xs: "100%", sm: "auto" },
                                textTransform: "none",
                                fontWeight: 600,
                            }}
                            onClick={() => {
                                toast.info("Application history coming soon.");
                            }}
                        >
                            View all
                        </Button>
                    </Box>
                    <Box
                        sx={{
                            overflowX: "auto",
                            width: "100%",
                            pb: 1,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                                gap: 2,
                                flexWrap: "nowrap",
                            }}
                        >
                            {loadingApplications ? (
                                <Box sx={{ width: "100%" }}>
                                    <Box className="flex items-center justify-center w-full py-8">
                                        <CircularProgress size={32} />
                                    </Box>
                                </Box>
                            ) : recentApplications.length === 0 ? (
                                <Box sx={{ width: "100%" }}>
                                    <Typography
                                        variant="body2"
                                        className="text-gray-500 flex items-center"
                                    >
                                        No recent applications found.
                                    </Typography>
                                </Box>
                            ) : (
                                recentApplications.map((app: any) => {
                                    const loan = getLoanById(app.loan_id);
                                    if (!loan) return null;
                                    return (
                                        <Box
                                            key={app.id}
                                            sx={getColumnWidth({
                                                xs: "100%",
                                                sm: 280,
                                                md: 320,
                                                max: 380,
                                            })}
                                        >
                                            <ApplicationCard
                                                title={loan.loan_title}
                                                description={loan.description}
                                                employer={loan.employer}
                                                status={app.status}
                                                amount={app.amount || loan.amount}
                                                currency={app.currency || loan.currency}
                                                type={loan.type}
                                            />
                                        </Box>
                                    );
                                })
                            )}
                        </Box>
                    </Box>
                </>
            )}
            {tabIndex === 1 && (
                <>
                    <Box
                        sx={{
                            mb: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexDirection: { xs: "column", sm: "row" },
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: { xs: 1, sm: 0 } }}>
                            Available Offers
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            overflowX: "auto",
                            width: "100%",
                            pb: 1,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                                gap: 2,
                                flexWrap: "nowrap",
                            }}
                        >
                            {MOCK_CIVIL_LOANS.filter(loan => !appliedLoanIds.includes(loan.id))
                                .map((loan) => (
                                    <Box
                                        key={loan.id}
                                        sx={getColumnWidth({
                                            xs: "100%",
                                            sm: 280,
                                            md: 320,
                                            max: 380,
                                        })}
                                    >
                                        <ApplicationCard
                                            title={loan.loan_title}
                                            description={loan.description}
                                            employer={loan.employer}
                                            amount={loan.amount}
                                            currency={loan.currency}
                                            type={loan.type}
                                            onApply={() => {
                                                toast.info(
                                                    "Begin your application for this loan offer."
                                                );
                                            }}
                                        />
                                    </Box>
                                ))}
                            {MOCK_CIVIL_LOANS.filter(loan => !appliedLoanIds.includes(loan.id)).length === 0 && (
                                <Box sx={{ width: "100%" }}>
                                    <Typography
                                        variant="body2"
                                        className="text-gray-500 flex items-center"
                                    >
                                        No available offers at this time.
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </>
            )}

            {/* Guides & Resources */}
            <Typography
                variant="h6"
                className="font-bold mb-4"
                sx={{ mt: 4 }}
            >
                Guides and Resources
            </Typography>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    mb: 4,
                }}
            >
                <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: 0 } }}>
                    <GuideCard title="Civil Servant Loan Requirements" />
                </Box>
                <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: 0 } }}>
                    <GuideCard title="Guide to Salary-backed Advance" />
                </Box>
            </Box>
        </Box>
    );
};

export default CivilServantLoanPage;
