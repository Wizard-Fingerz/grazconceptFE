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
    Chip,
    Avatar,
    Paper,
    Stack
} from "@mui/material";
import { toast } from "react-toastify";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
// Removed: import FinanceCard from "../../../../components/FinanceCard";
import { getRecentCivilServantLoanOffers, getLoanAnalyticsSummary } from "../../../../services/edufinanceService";
import { useNavigate } from "react-router-dom";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PieChartOutlineIcon from "@mui/icons-material/PieChartOutline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PaidIcon from "@mui/icons-material/Paid";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";

const GradientPaper = ({ children, sx = {}, ...props }: any) => (
    <Paper
        elevation={0}
        sx={{
            background: "linear-gradient(120deg, #f5ebe1 0%, #e0e7ff 100%)",
            borderRadius: 3,
            boxShadow: "0 2px 16px 0 rgba(40,39,91,0.06)",
            p: 3,
            ...sx,
        }}
        {...props}
    >
        {children}
    </Paper>
);

const FinanceFeatureCard: React.FC<{
    icon?: React.ReactNode;
    title: string;
    description?: string;
    actions?: React.ReactNode;
    highlight?: boolean;
}> = ({ icon, title, description, actions, highlight }) => (
    <Card
        className="rounded-2xl shadow-md transition-transform hover:scale-[1.025] hover:shadow-lg"
        sx={{
            border: highlight ? `2px solid #1976d2` : undefined,
            margin: "auto",
            background:
                highlight
                    ? "linear-gradient(90deg, #1976d2 20%, #e4e8fa 90%)"
                    : "#fffdfa",
            color: highlight ? "#fff" : "#3a295a",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            minHeight: 180,
            transition: "box-shadow 0.25s, transform 0.18s",
            overflow: "visible"
        }}
    >
        <CardContent className="flex flex-col gap-2" sx={{ flex: 1 }}>
            <Box className="flex items-center justify-between gap-4 mb-1">
                <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{
                        bgcolor: highlight ? "#fff" : "#fbe5d6",
                        color: highlight ? "#1976d2" : "#3a295a",
                        width: 38, height: 38,
                    }}>
                        {icon}
                    </Avatar>
                    <Typography
                        variant="subtitle1"
                        className="font-bold"
                        sx={{
                            fontSize: "1.17rem",
                            ml: 1,
                            color: highlight ? "#fff" : "#000"
                        }}
                    >
                        {title}
                    </Typography>
                </Box>
                {actions}
            </Box>
            {description && (
                <Typography
                    variant="body2"
                    sx={{
                        mb: 1,
                        color: highlight ? "#e2f0fb" : "#714300"
                    }}
                >
                    {description}
                </Typography>
            )}
        </CardContent>
    </Card>
);

const GuideCard: React.FC<{ title: string, icon?: React.ReactNode }> = ({
    title,
    icon
}) => (
    <GradientPaper sx={{
        display: "flex",
        alignItems: "center",
        minHeight: 80,
        transition: "box-shadow 0.22s",
        ":hover": {
            boxShadow: 4,
        }
    }}>
        <Avatar sx={{
            bgcolor: "#fbe5d6",
            color: "#4f3b21",
            width: 44,
            height: 44,
            mr: 2,
        }}>
            {icon || <LocalLibraryIcon />}
        </Avatar>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {title}
        </Typography>
    </GradientPaper>
);

export const CivilServantFinancePage: React.FC = () => {
    // Tabs: 0 = Overview, 1 = Loans, 2 = Wallet
    const [tabIndex, setTabIndex] = useState(0);

    // Loan and wallet analytics
    const [loanAnalyticsLoading, setLoanAnalyticsLoading] = useState(true);
    const [loanAnalytics, setLoanAnalytics] = useState<any>(null);
    const [loanAnalyticsError, setLoanAnalyticsError] = useState<string | null>(null);

    useEffect(() => {
        setLoanAnalyticsLoading(true);
        setLoanAnalyticsError(null);
        getLoanAnalyticsSummary()
            .then((summary: any) => setLoanAnalytics(summary))
            .catch(() => setLoanAnalyticsError("Failed to load finance summary"))
            .finally(() => setLoanAnalyticsLoading(false));
    }, []);

    // Loan offers for civil servants
    const [offers, setOffers] = useState<any[] | null>(null);
    const [offersLoading, setOffersLoading] = useState(true);
    const [offersError, setOffersError] = useState<string | null>(null);

    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down("sm"));

    const navigate = useNavigate();

    // extract array from response
    const extractOffersArray = (resp: any): any[] => {
        if (Array.isArray(resp)) return resp;
        if (resp && Array.isArray(resp.results)) return resp.results;
        return [];
    };

    const fetchOffers = useCallback(async () => {
        setOffersLoading(true);
        setOffersError(null);
        try {
            const resp = await getRecentCivilServantLoanOffers();
            setOffers(extractOffersArray(resp));
        } catch {
            setOffers([]);
            setOffersError("Failed to load civil servant finance products.");
        } finally {
            setOffersLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    // Recent applications (simulate for now)
    const [recentApplications, setRecentApplications] = useState<any[]>([]);
    const [loadingApplications, setLoadingApplications] = useState(true);

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

    // For mapping loans to applications:
    const appliedLoanIds = recentApplications.map(app => app.loan_id);
    function getLoanByIdFromOffers(id: number) {
        if (!Array.isArray(offers)) return undefined;
        return offers.find((loan: any) => String(loan.id) === String(id));
    }

    // Utilities
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

    // Finance analytics top cards
    const renderAnalyticsTopCards = () => {
        if (loanAnalyticsLoading) {
            return (
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                flex: 1,
                                minWidth: { xs: "100%", md: 0 }
                            }}
                        >
                            <GradientPaper
                                sx={{
                                    textAlign: "center",
                                    minHeight: 90,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    display: "flex"
                                }}
                            >
                                <CircularProgress size={34} color="secondary" />
                            </GradientPaper>
                        </Box>
                    ))}
                </Stack>
            );
        }
        if (loanAnalyticsError) {
            return (
                <Box sx={{ width: "100%" }}>
                    <GradientPaper sx={{ textAlign: "center" }}>
                        <Typography color="error">{loanAnalyticsError}</Typography>
                    </GradientPaper>
                </Box>
            );
        }
        const summary = loanAnalytics || {};
        const currency = summary.currency || "NGN";
        const format = (val: any) => {
            if (typeof val === "number") return Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(val);
            return Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(parseFloat(val) || 0.0);
        };

        return (
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
                <Box sx={{ flex: 1, minWidth: { xs: "100%", md: 0 } }}>
                    <GradientPaper sx={{ height: "100%" }}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: "#e8f5e9", color: "#388e3c" }}>
                                <AccountBalanceWalletIcon />
                            </Avatar>
                            <Box>
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#3c3c3c" }}>
                                    Wallet Balance
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: 22, color: "#11501f" }}>
                                    {format(summary.wallet_balance)}
                                </Typography>
                            </Box>
                        </Box>
                    </GradientPaper>
                </Box>
                <Box sx={{ flex: 1, minWidth: { xs: "100%", md: 0 } }}>
                    <GradientPaper sx={{ height: "100%" }}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: "#fff3e0", color: "#ff9800" }}>
                                <PaidIcon />
                            </Avatar>
                            <Box>
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#3c3c3c" }}>
                                    Active Loan Balances
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: 22, color: "#d16700" }}>
                                    {format(summary.total_loan_amount)}
                                </Typography>
                            </Box>
                        </Box>
                    </GradientPaper>
                </Box>
                <Box sx={{ flex: 1, minWidth: { xs: "100%", md: 0 } }}>
                    <GradientPaper sx={{ height: "100%" }}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: "#e3f2fd", color: "#1976d2" }}>
                                <TrendingUpIcon />
                            </Avatar>
                            <Box>
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#3c3c3c" }}>
                                    Amount Repaid
                                </Typography>
                                <Typography sx={{ fontWeight: 700, fontSize: 22, color: "#1976d2" }}>
                                    {format(summary.total_amount_paid)}
                                </Typography>
                            </Box>
                        </Box>
                    </GradientPaper>
                </Box>
            </Stack>
        );
    };

    // Finance summary proper (removed FinanceCard, display simple summary instead)
    const renderFinanceSummary = () => {
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
                            <Typography sx={{ ml: 2 }}>Loading finance summary...</Typography>
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
        const summary = loanAnalytics || {};
        const currency = summary.currency || "NGN";
        const walletBalance = typeof summary.wallet_balance === "number"
            ? summary.wallet_balance
            : parseFloat(summary.wallet_balance) || 0.0;
        const totalLoanAmount = typeof summary.total_loan_amount === "number"
            ? summary.total_loan_amount
            : parseFloat(summary.total_loan_amount) || 0.0;
        const totalAmountPaid = typeof summary.total_amount_paid === "number"
            ? summary.total_amount_paid
            : parseFloat(summary.total_amount_paid) || 0.0;

        // Simple summary display, not using FinanceCard
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
                <Card
                    className="rounded-2xl shadow-md"
                    sx={{
                        background: "#fffdfa",
                        minWidth: 200,
                        maxWidth: 320,
                        py: 2,
                        px: 3,
                        flex: 1,
                        mb: { xs: 2, md: 0 },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start"
                    }}
                >
                    <CardContent>
                        <Typography sx={{ color: "#3c3c3c", fontWeight: 600, fontSize: "1rem" }}>Wallet Balance</Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: 22, color: "#11501f", mt: 1, mb: 0.7 }}>
                            {Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(walletBalance)}
                        </Typography>
                    </CardContent>
                </Card>
                <Card
                    className="rounded-2xl shadow-md"
                    sx={{
                        background: "#fffdfa",
                        minWidth: 200,
                        maxWidth: 320,
                        py: 2,
                        px: 3,
                        flex: 1,
                        mb: { xs: 2, md: 0 },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start"
                    }}
                >
                    <CardContent>
                        <Typography sx={{ color: "#3c3c3c", fontWeight: 600, fontSize: "1rem" }}>Loan Amount</Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: 22, color: "#d16700", mt: 1, mb: 0.7 }}>
                            {Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(totalLoanAmount)}
                        </Typography>
                    </CardContent>
                </Card>
                <Card
                    className="rounded-2xl shadow-md"
                    sx={{
                        background: "#fffdfa",
                        minWidth: 200,
                        maxWidth: 320,
                        py: 2,
                        px: 3,
                        flex: 1,
                        mb: { xs: 2, md: 0 },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start"
                    }}
                >
                    <CardContent>
                        <Typography sx={{ color: "#3c3c3c", fontWeight: 600, fontSize: "1rem" }}>Amount Paid</Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: 22, color: "#1976d2", mt: 1, mb: 0.7 }}>
                            {Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(totalAmountPaid)}
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        );
    };

    // Cards to present civil servant financial features (finance-specific visual appearance)
    const renderFinanceFeatures = () => (
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ my: 1 }}>
            <Box sx={{ flex: 1, minWidth: { xs: "100%", md: 0 } }}>
                <FinanceFeatureCard
                    icon={<AccountBalanceWalletIcon fontSize="large" />}
                    title="Salary Wallet"
                    description="Your secure wallet: receive, save, and manage all your civil service earnings and benefits. Track every naira."
                    actions={
                        <Button
                            size="small"
                            sx={{
                                bgcolor: "#eee",
                                borderRadius: 2,
                                fontWeight: 600,
                                fontSize: "0.95rem",
                                textTransform: "none",
                                px: 2,
                                color: "#1976d2"
                            }}
                            onClick={() => navigate("/wallet")}
                        >
                            Go to Wallet
                        </Button>
                    }
                    highlight
                />
            </Box>
            <Box sx={{ flex: 1, minWidth: { xs: "100%", md: 0 } }}>
                <FinanceFeatureCard
                    icon={<CreditScoreIcon fontSize="large" />}
                    title="Loan Options"
                    description="Quick, flexible advances and salary loans built for civil servants. Less paperwork, rapid payout."
                    actions={
                        <Button
                            size="small"
                            sx={{
                                bgcolor: "#eee",
                                borderRadius: 2,
                                fontWeight: 600,
                                fontSize: "0.95rem",
                                textTransform: "none",
                                px: 2,
                                color: "#1976d2"
                            }}
                            onClick={() => setTabIndex(1)}
                        >
                            Browse Loans
                        </Button>
                    }
                />
            </Box>
            <Box sx={{ flex: 1, minWidth: { xs: "100%", md: 0 } }}>
                <FinanceFeatureCard
                    icon={<PieChartOutlineIcon fontSize="large" />}
                    title="Finance Overview"
                    description="Instant snapshot of your wallet, loans, and repayments—all in one place."
                    actions={
                        <Button
                            size="small"
                            sx={{
                                bgcolor: "#eee",
                                borderRadius: 2,
                                fontWeight: 600,
                                fontSize: "0.95rem",
                                textTransform: "none",
                                px: 2,
                                color: "#1976d2"
                            }}
                            onClick={() => setTabIndex(0)}
                        >
                            View Overview
                        </Button>
                    }
                />
            </Box>
        </Stack>
    );

    // ApplicationCard for listing loans
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
                    borderTop: `3.5px solid ${status
                        ? status === "Disbursed"
                            ? "#4caf50"
                            : status === "Under Review"
                                ? "#ff9800"
                                : status === "Rejected"
                                    ? "#f44336"
                                    : "#bdbdbd"
                        : "#1976d2"
                        }`,
                    background: "#fff",
                    minHeight: 215,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative"
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
                                    sx={{
                                        bgcolor: "#e0e7ff",
                                        borderRadius: 2,
                                        fontWeight: 600,
                                        fontSize: "0.92rem",
                                        textTransform: "none",
                                        px: 2,
                                        color: "#1976d2",
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
                                    {Intl.NumberFormat("en-NG", { style: "currency", currency: currency || "NGN", maximumFractionDigits: 0 }).format(Number(amount))} {currency}
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
                    Civil Servant Finance Hub
                </Typography>
                <Typography variant="body1" className="text-gray-700 mb-4">
                    Streamline your finances as a Nigerian civil servant. Access wallet, apply for fast, flexible advances, track repayment, and take control of your income—all in one place.
                </Typography>
            </CustomerPageHeader>
            {/* Hero section with light background and call-to-action */}

            {/* Top Analytics Section */}
            {renderAnalyticsTopCards()}

            {/* Finance Feature quick access cards */}
            {renderFinanceFeatures()}

            {/* Tabs for finance overview, loans, wallet */}
            <Box sx={{ mt: 3, mb: 3 }}>
                <Tabs
                    value={tabIndex}
                    onChange={(_, newValue) => setTabIndex(newValue)}
                    sx={{
                        borderBottom: 2,
                        borderColor: "#e4e8fa",
                        "& .MuiTabs-indicator": { bgcolor: "#1976d2" },
                        mb: 0,
                        pt: 0,
                    }}
                    aria-label="Finance Tabs"
                    variant={isXs ? "scrollable" : "standard"}
                    scrollButtons={isXs ? "auto" : undefined}
                >
                    <Tab label="Finance Overview" />
                    <Tab label="Loan Offers" />
                    <Tab label="My Wallet" />
                </Tabs>
            </Box>

            {/* Tab Content Areas */}
            {tabIndex === 0 && (
                <>
                    <Box sx={{ mb: 2 }}>
                        {renderFinanceSummary()}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 1.5, color: "#304168" }}>
                        Recent Loan Applications
                    </Typography>
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
                                        color="#c6c6c6"
                                        className="flex items-center"
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
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, mt: 2, color: "#304168" }}>
                        Civil Servant Loan Offers
                    </Typography>
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
                                                        "Begin your application for this finance product."
                                                    );
                                                }}
                                            />
                                        </Box>
                                    ))
                            ) : (
                                <Box sx={{ width: "100%" }}>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: "#b9bac6" }}
                                        className="flex items-center"
                                    >
                                        No available loans at this time.
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </>
            )}
            {tabIndex === 2 && (
                <>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "#304168" }}>
                        My Civil Servant Wallet
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                                gap: { xs: 2, sm: 6 },
                                alignItems: "stretch",
                            }}
                        >
                            {renderFinanceSummary()}
                        </Box>
                    </Box>
                </>
            )}

            {/* Guides & Resources - refine layout for a finance portal look */}
            <Typography
                variant="h6"
                className="font-bold"
                sx={{ mt: 5, mb: 1, letterSpacing: 0.5, color: "#304168" }}
            >
                Guides & Resources
            </Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ width: "100%", mb: 6, mt: 1 }}>
                <Box sx={{ flex: 1, minWidth: { xs: "100%", md: 0 } }}>
                    <GuideCard title="Finance Requirements for Civil Servant Loans" icon={<AttachMoneyIcon />} />
                </Box>
                <Box sx={{ flex: 1, minWidth: { xs: "100%", md: 0 } }}>
                    <GuideCard title="Guide to Salary-backed Advances" icon={<LocalLibraryIcon />} />
                </Box>
            </Stack>
        </Box>
    );
};

export default CivilServantFinancePage;
