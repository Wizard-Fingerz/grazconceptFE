import React, { useState, useEffect, useCallback } from "react";
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
    Divider,
    Tooltip,
    Chip
} from "@mui/material";
import { toast } from "react-toastify";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import FinanceCard from "../../../../components/FinanceCard";
import { getRecentCivilServantLoanOffers, getLoanAnalyticsSummary } from "../../../../services/edufinanceService";
import { useNavigate } from "react-router-dom"; // <-- Added import

// --- Application Card ---
// Enhanced to show all details of an offer
const ApplicationCard: React.FC<{
    title: string;
    description?: string;
    employer?: string;
    status?: string;
    amount?: string | number;
    currency?: string;
    type?: string;
    minAmount?: string | number;
    maxAmount?: string | number;
    durationMonths?: number;
    interestRate?: string | number;
    requirements?: string;
    requiredDocuments?: string;
    onApply?: () => void;
}> = ({
    title,
    description,
    employer,
    status,
    amount,
    currency,
    type,
    minAmount,
    maxAmount,
    durationMonths,
    interestRate,
    requirements,
    requiredDocuments,
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

            <Divider sx={{ my: 1 }} />

            <Box className="flex flex-col gap-1">
                {employer && (
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
                )}
                {(minAmount || maxAmount) && (
                    <Box className="flex items-center gap-2">
                        <Typography
                            variant="body2"
                            className="text-gray-600"
                            sx={{ fontWeight: 500, minWidth: 88 }}
                        >
                            Amount Range:
                        </Typography>
                        <Typography variant="body2" className="text-gray-800">
                            {minAmount ? Intl.NumberFormat("en-NG", { style: "currency", currency: currency || "NGN", maximumFractionDigits: 0 }).format(Number(minAmount)) : "-"}
                            {" - "}
                            {maxAmount ? Intl.NumberFormat("en-NG", { style: "currency", currency: currency || "NGN", maximumFractionDigits: 0 }).format(Number(maxAmount)) : "-"}
                        </Typography>
                    </Box>
                )}
                {/* For past applications, show exact amount */}
                {amount && (!minAmount && !maxAmount) && (
                    <Box className="flex items-center gap-2">
                        <Typography
                            variant="body2"
                            className="text-gray-600"
                            sx={{ fontWeight: 500, minWidth: 88 }}
                        >
                            Amount:
                        </Typography>
                        <Typography variant="body2" className="text-gray-800">
                            {amount} {currency}
                        </Typography>
                    </Box>
                )}
                {durationMonths && (
                    <Box className="flex items-center gap-2">
                        <Typography
                            variant="body2"
                            className="text-gray-600"
                            sx={{ fontWeight: 500, minWidth: 88 }}
                        >
                            Duration:
                        </Typography>
                        <Typography variant="body2" className="text-gray-800">
                            {durationMonths} month{durationMonths === 1 ? "" : "s"}
                        </Typography>
                    </Box>
                )}
                {interestRate && (
                    <Box className="flex items-center gap-2">
                        <Typography
                            variant="body2"
                            className="text-gray-600"
                            sx={{ fontWeight: 500, minWidth: 88 }}
                        >
                            Interest Rate:
                        </Typography>
                        <Typography variant="body2" className="text-gray-800">
                            {interestRate}% per month
                        </Typography>
                    </Box>
                )}
                {type && (
                    <Box className="flex items-center gap-2">
                        <Typography
                            variant="body2"
                            className="text-gray-600"
                            sx={{ fontWeight: 500, minWidth: 88 }}
                        >
                            Type:
                        </Typography>
                        <Typography variant="body2" className="text-gray-800">
                            {type}
                        </Typography>
                    </Box>
                )}
                {requirements && (
                    <Box className="flex items-center gap-2">
                        <Tooltip
                            title={
                                <Box sx={{ whiteSpace: "pre-line" }}>
                                    {requirements.trim()}
                                </Box>
                            }
                            arrow
                        >
                            <Typography
                                variant="body2"
                                className="text-gray-600"
                                sx={{ fontWeight: 500, minWidth: 88, cursor: "pointer", textDecoration: "underline" }}
                            >
                                Requirements
                            </Typography>
                        </Tooltip>
                        <Typography variant="body2" className="text-gray-800" sx={{ whiteSpace: "pre-line" }}>
                            {requirements.split("\n").map((req, idx) => {
                                const item = req.replace(/\r/g, '').trim();
                                if (item.length === 0) return null;
                                return <Chip label={item} size="small" sx={{ mr: 0.5, mb: 0.5 }} key={idx} />;
                            })}
                        </Typography>
                    </Box>
                )}
                {/* Also show documents if available and not shown already in requirements */}
                {requiredDocuments && !requirements && (
                    <Box className="flex items-center gap-2">
                        <Tooltip
                            title={
                                <Box sx={{ whiteSpace: "pre-line" }}>
                                    {requiredDocuments.trim()}
                                </Box>
                            }
                            arrow
                        >
                            <Typography
                                variant="body2"
                                className="text-gray-600"
                                sx={{ fontWeight: 500, minWidth: 88, cursor: "pointer", textDecoration: "underline" }}
                            >
                                Documents
                            </Typography>
                        </Tooltip>
                        <Typography variant="body2" className="text-gray-800" sx={{ whiteSpace: "pre-line" }}>
                            {requiredDocuments.split("\n").map((doc, idx) => {
                                const item = doc.replace(/\r/g, '').trim();
                                if (item.length === 0) return null;
                                return <Chip label={item} size="small" sx={{ mr: 0.5, mb: 0.5 }} key={idx} />;
                            })}
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

    // State for offers loaded from API
    const [offers, setOffers] = useState<any[] | null>(null);
    const [offersLoading, setOffersLoading] = useState(true);
    const [offersError, setOffersError] = useState<string | null>(null);

    // --- Loan Analytics State & Logic ---
    const [loanAnalyticsLoading, setLoanAnalyticsLoading] = useState(true);
    const [loanAnalytics, setLoanAnalytics] = useState<any>(null);
    const [loanAnalyticsError, setLoanAnalyticsError] = useState<string | null>(null);

    useEffect(() => {
        setLoanAnalyticsLoading(true);
        setLoanAnalyticsError(null);
        getLoanAnalyticsSummary()
            .then((summary: any) => {
                setLoanAnalytics(summary);
            })
            .catch((_err) => {
                setLoanAnalyticsError("Failed to load loan analytics");
            })
            .finally(() => {
                setLoanAnalyticsLoading(false);
            });
    }, []);

    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down("sm"));
    const [walletLoading] = useState(false);

    // Add navigate using react-router
    const navigate = useNavigate();

    // Utility to extract array of offers from API response, with tolerance for paginated structure
    const extractOffersArray = (resp: any): any[] => {
        if (Array.isArray(resp)) {
            return resp;
        }
        if (resp && Array.isArray(resp.results)) {
            return resp.results;
        }
        return [];
    };

    // Fetch civil servant loan offers
    const fetchOffers = useCallback(async () => {
        setOffersLoading(true);
        setOffersError(null);
        try {
            const resp = await getRecentCivilServantLoanOffers();
            // The API may return an array, or a paginated object with "results"
            setOffers(extractOffersArray(resp));
        } catch (err: any) {
            setOffersError("Failed to load loan offers. Please try again later.");
            setOffers([]);
        } finally {
            setOffersLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

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

    // Get applied loan IDs
    const appliedLoanIds = recentApplications.map((app) => app.loan_id);

    // Find a loan offer by ID from loaded offers (robust to offers being null or not an array)
    function getLoanByIdFromOffers(id: number) {
        if (!Array.isArray(offers)) return undefined;
        return offers.find((loan: any) => String(loan.id) === String(id));
    }

    // Util for column widths
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

    // Render helper for analytics-based cards using FinanceCard
    const renderAnalyticsCards = () => {
        if (loanAnalyticsLoading) {
            return (
                <Box sx={{ width: "100%" }}>
                    <Card className="rounded-2xl shadow-md"
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
                            <Typography sx={{ ml: 2 }}>Loading analytics...</Typography>
                        </CardContent>
                    </Card>
                </Box>
            );
        }

        if (loanAnalyticsError) {
            return (
                <Box sx={{ width: "100%" }}>
                    <Card className="rounded-2xl shadow-md"
                        sx={{
                            background: "#fffdfa",
                            minWidth: 300,
                            maxWidth: 420,
                            py: 2,
                            px: { xs: 2, sm: 4 },
                        }}>
                        <CardContent>
                            <Typography color="error">
                                {loanAnalyticsError}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            );
        }

        // Always provide a fallback default value of 0 for amounts, and "NGN" for currency if not present

        const summary = loanAnalytics || {};

        // Default currency to "NGN" if not present
        const currency = summary.currency || "NGN";

        // Get all amounts as floats with fallback to 0.0
        const walletBalance = typeof summary.wallet_balance === "number"
            ? summary.wallet_balance
            : parseFloat(summary.wallet_balance) || 0.0;
        const totalLoanAmount = typeof summary.total_loan_amount === "number"
            ? summary.total_loan_amount
            : parseFloat(summary.total_loan_amount) || 0.0;
        const totalAmountPaid = typeof summary.total_amount_paid === "number"
            ? summary.total_amount_paid
            : parseFloat(summary.total_amount_paid) || 0.0;

        return (
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: { xs: 2, md: 8 },
                    flexWrap: { xs: "wrap", md: "nowrap" },
                    alignItems: "stretch",
                }}
            >
                <Box
                    sx={{
                        ...getColumnWidth({
                            xs: "100%",
                            sm: 260,
                            md: 260,
                            max: 420,
                        }),
                        mb: { xs: 2, md: 0 },
                        flex: { xs: "unset", md: 1 },
                    }}
                >
                    <FinanceCard
                        title="Travel Wallet"
                        amount={walletBalance}
                        currency={currency}
                        buttonText="Fund wallet"
                        transactions={
                            Array.isArray(summary.wallet_transactions)
                                ? summary.wallet_transactions
                                : []
                        }
                    />
                </Box>
                <Box
                    sx={{
                        ...getColumnWidth({
                            xs: "100%",
                            sm: 260,
                            md: 260,
                            max: 420,
                        }),
                        mb: { xs: 2, md: 0 },
                        flex: { xs: "unset", md: 1 },
                    }}
                >
                    <FinanceCard
                        title="Loan Amount"
                        amount={totalLoanAmount}
                        currency={currency}
                        buttonText="Make Payment"
                        transactions={
                            Array.isArray(summary.recent_loan_application)
                                ? summary.recent_loan_application
                                : []
                        }
                    />
                </Box>
                <Box
                    sx={{
                        ...getColumnWidth({
                            xs: "100%",
                            sm: 260,
                            md: 260,
                            max: 420,
                        }),
                        mb: { xs: 2, md: 0 },
                        flex: { xs: "unset", md: 1 },
                    }}
                >
                    <FinanceCard
                        title="Amount Paid"
                        amount={totalAmountPaid}
                        currency={currency}
                        buttonText="Make Payment"
                        transactions={
                            Array.isArray(summary.recent_loan_repayment)
                                ? summary.recent_loan_repayment
                                : []
                        }
                    />
                </Box>
            </Box>
        );
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
                    onClick={() => {
                        // Use navigate hook to navigate programmatically
                        navigate("/support/chat");
                    }}
                >
                    Chat with Agent
                </Button>
            </Box>

            {/* Wallet/Loan Analytics Card Area */}
            <Box sx={{ mb: 2 }}>
                {walletLoading
                    ? (
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
                    )
                    : renderAnalyticsCards()
                }
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
                            {loadingApplications || offersLoading ? (
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
                                    const loan = getLoanByIdFromOffers(app.loan_id);
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
                                                title={loan.loan_title || loan.title}
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
                            {offersLoading ? (
                                <Box sx={{ width: "100%" }}>
                                    <Box className="flex items-center justify-center w-full py-8">
                                        <CircularProgress size={32} />
                                    </Box>
                                </Box>
                            ) : offersError ? (
                                <Box sx={{ width: "100%" }}>
                                    <Typography
                                        variant="body2"
                                        color="error"
                                        className="flex items-center"
                                    >
                                        {offersError}
                                    </Typography>
                                </Box>
                            ) : (Array.isArray(offers) && offers.filter(loan => !appliedLoanIds.includes(loan.id)).length > 0) ? (
                                offers
                                    .filter(loan => !appliedLoanIds.includes(loan.id))
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
                                                title={loan.name || loan.loan_title || loan.title}
                                                description={loan.description}
                                                employer={loan.employer}
                                                currency={loan.currency}
                                                minAmount={loan.min_amount}
                                                maxAmount={loan.max_amount}
                                                durationMonths={loan.duration_months}
                                                interestRate={loan.interest_rate}
                                                requirements={loan.requirements}
                                                requiredDocuments={loan.required_documents}
                                                type={loan.type}
                                                onApply={() => {
                                                    toast.info(
                                                        "Begin your application for this loan offer."
                                                    );
                                                }}
                                            />
                                        </Box>
                                    ))
                            ) : (
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
