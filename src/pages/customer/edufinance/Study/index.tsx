import React, { useEffect, useState } from "react";
import {
    Button,
    Card,
    CardContent,
    Typography,
    Box,
    CircularProgress,
    Tabs,
    Tab,
    useMediaQuery,
    useTheme,
    Divider,
    Tooltip,
    Collapse,
    IconButton,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import { getAddBanners } from '../../../../services/studyVisa';
import { toast } from "react-toastify";
import { ImageCard } from "../../../../components/ImageCard";
import { useNavigate } from "react-router-dom";
import FinanceCard from "../../../../components/FinanceCard";
import { getRecentStudyLoanOffers, getLoanAnalyticsSummary, getStudyLoanOffers } from "../../../../services/edufinanceService";

// Proper OfferCard for Study Loan Offers (rewritten from ApplicationCard)
export const OfferCard: React.FC<{
    id: string | number;
    name: string;
    description: string;
    min_amount: string | number;
    max_amount: string | number;
    currency: string;
    interest_rate: string | number;
    duration_months: number;
    required_documents?: string;
    requirements?: string;
    onApply?: () => void;
}> = ({
    name,
    description,
    min_amount,
    max_amount,
    currency,
    interest_rate,
    duration_months,
    required_documents,
    requirements,
    onApply,
}) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <Card
            className="rounded-2xl shadow-md transition-transform hover:scale-[1.025] hover:shadow-lg"
            sx={{
                borderLeft: `6px solid #1976d2`,
                margin: "auto",
                background: "#fffdfa",
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <CardContent className="flex flex-col gap-2" sx={{ flex: 1 }}>
                <Box className="flex items-start justify-between gap-4 mb-1">
                    <Box className="flex flex-col">
                        <Typography
                            variant="subtitle1"
                            className="font-bold"
                            sx={{ fontSize: "1.1rem", mb: 0.2 }}
                        >
                            {name}
                        </Typography>
                        <Typography
                            variant="body2"
                            className="text-gray-600"
                            sx={{ fontWeight: 500, fontSize: "0.95rem" }}
                        >
                            {description}
                        </Typography>
                    </Box>
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
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box className="flex flex-col gap-2">
                    <Box className="flex items-center gap-2">
                        <Typography
                            variant="body2"
                            className="text-gray-600"
                            sx={{ fontWeight: 500, minWidth: 100 }}
                        >
                            Loan Range:
                        </Typography>
                        <Typography variant="body2" className="text-gray-800 font-semibold">
                            {min_amount} - {max_amount} {currency}
                        </Typography>
                    </Box>
                    <Box className="flex items-center gap-2">
                        <Typography
                            variant="body2"
                            className="text-gray-600"
                            sx={{ fontWeight: 500, minWidth: 100 }}
                        >
                            Interest Rate:
                        </Typography>
                        <Typography variant="body2" className="text-gray-800 font-semibold">
                            {interest_rate}% p.a.
                        </Typography>
                    </Box>
                    <Box className="flex items-center gap-2">
                        <Typography
                            variant="body2"
                            className="text-gray-600"
                            sx={{ fontWeight: 500, minWidth: 100 }}
                        >
                            Duration:
                        </Typography>
                        <Typography variant="body2" className="text-gray-800 font-semibold">
                            {duration_months} months
                        </Typography>
                    </Box>
                </Box>

                {(requirements || required_documents) && (
                    <>
                        <Collapse in={expanded} timeout="auto" unmountOnExit>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ mt: 1 }}>
                                <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600, mb: 0.5 }}
                                >
                                    Requirements / Documents
                                </Typography>
                                <ul style={{ margin: 0, paddingLeft: 18 }}>
                                    {(
                                        (requirements || required_documents || "")
                                            .split(/[\r\n]+/)
                                            .filter(line => line && line.trim())
                                    ).map((req, idx) => (
                                        <li key={idx}>
                                            <Typography variant="body2" color="text.secondary">
                                                {req}
                                            </Typography>
                                        </li>
                                    ))}
                                </ul>
                            </Box>
                        </Collapse>
                        <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                            <Tooltip title={expanded ? "Hide requirements" : "Show requirements"}>
                                <IconButton
                                    onClick={() => setExpanded(exp => !exp)}
                                    size="small"
                                    sx={{
                                        ml: -0.5,
                                        color: "#1976d2",
                                        transition: "transform 0.2s",
                                        transform: expanded ? "rotate(180deg)" : undefined,
                                    }}
                                >
                                    <ExpandMoreIcon />
                                </IconButton>
                            </Tooltip>
                            <Typography
                                variant="body2"
                                sx={{ ml: 0.5, color: "#1976d2", cursor: "pointer" }}
                                onClick={() => setExpanded(exp => !exp)}
                            >
                                {expanded ? "Hide requirements" : "View requirements"}
                            </Typography>
                        </Box>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export const GuideCard: React.FC<{ title: string }> = ({ title }) => (
    <Button className="bg-[#f5ebe1] rounded-xl px-6 py-3 font-semibold normal-case shadow-sm hover:bg-[#f3e1d5]">
        {title}
    </Button>
);

export const StudyAbroadLoanPage: React.FC = () => {
    const navigate = useNavigate();

    // ---- DATA STATES ----
    const [recentApplications, setRecentApplications] = useState<any[]>([]);
    const [loadingApplications, setLoadingApplications] = useState<boolean>(true);

    const [banners, setBanners] = useState<any[]>([]);
    const [loadingBanners, setLoadingBanners] = useState<boolean>(true);

    const [offers, setOffers] = useState<any[]>([]);
    const [loadingOffers, setLoadingOffers] = useState<boolean>(true);

    const [loanAnalytics, setLoanAnalytics] = useState<any>(null);
    const [loanAnalyticsLoading, setLoanAnalyticsLoading] = useState<boolean>(true);
    const [loanAnalyticsError, setLoanAnalyticsError] = useState<string | null>(null);

    // Tab - 0: Offers, 1: Recent Applications          <<<< CHANGED ORDER
    const [tabIndex, setTabIndex] = useState<number>(0);

    const [walletLoading] = useState(false);

    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down("sm"));

    // --- API: Banners ---
    useEffect(() => {
        let ignore = false;
        setLoadingBanners(true);
        getAddBanners().then((data: any) => {
            if (ignore) return;
            if (data && Array.isArray(data.results)) {
                setBanners(data.results);
            } else {
                setBanners([]);
            }
        }).catch(() => {
            if (!ignore) setBanners([]);
        }).finally(() => {
            if (!ignore) setLoadingBanners(false);
        });

        return () => { ignore = true; };
    }, []);

    // --- API: Offers (replace dummy data with real API call) ---
    useEffect(() => {
        let ignore = false;
        setLoadingOffers(true);
        getStudyLoanOffers()
            .then((data: any) => {
                if (ignore) return;
                if (Array.isArray(data)) {
                    setOffers(data);
                } else if (data && Array.isArray(data.results)) {
                    setOffers(data.results);
                } else {
                    setOffers([]);
                }
            })
            .catch(() => {
                if (!ignore) setOffers([]);
            })
            .finally(() => {
                if (!ignore) setLoadingOffers(false);
            });

        return () => { ignore = true; };
    }, []);

    // --- API: Recent Applications ---
    useEffect(() => {
        async function fetchApplications() {
            setLoadingApplications(true);
            try {
                const data = await getRecentStudyLoanOffers();
                setRecentApplications(Array.isArray(data) ? data : (data?.results ?? []));
            } catch {
                setRecentApplications([]);
            }
            setLoadingApplications(false);
        }
        fetchApplications();
    }, []);

    // --- API: Analytics ---
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

    // --- Helper: Application <-> Offer match ---
    function getLoanById(id: number | string) {
        return offers.find((loan: any) => `${loan.id}` === `${id}`);
    }

    // ---- IDs for applied offers ----
    const appliedLoanIds = recentApplications.map(app => app.loan_id);

    // --- Helper: Col width ---
    const getColumnWidth = (breakpoints: any) => ({
        flex: `0 0 auto`,
        minWidth: breakpoints.xs || "100%",
        maxWidth: breakpoints.max || 380,
        width: breakpoints.xs || "100%",
        ...(breakpoints.sm && { [`@media (min-width:600px)`]: { minWidth: breakpoints.sm, width: breakpoints.sm } }),
        ...(breakpoints.md && { [`@media (min-width:900px)`]: { minWidth: breakpoints.md, width: breakpoints.md } }),
    });

    // --- Render Analytics Cards (fixed) ---
    function renderAnalyticsCards() {
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
                    Study Abroad Loan
                </Typography>
            </CustomerPageHeader>

            {/* Sub Header */}
            <Box
                display="flex"
                flexDirection={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                mb={8}
                gap={2}
            >
                <Typography
                    variant="body1"
                    className="text-gray-700"
                    sx={{
                        maxWidth: { xs: "100%", md: 380 },
                        mb: { xs: 2, md: 0 }
                    }}
                >
                    Get low-rate loans and tailored support for your international study ambitions.
                </Typography>
                <Button
                    variant="contained"
                    className="bg-[#f5ebe1] text-black shadow-sm rounded-xl normal-case"
                    sx={{
                        mt: { xs: 2, md: 0 }
                    }}
                    fullWidth={isXs}
                    onClick={() => {
                        // Use navigate hook to navigate programmatically
                        navigate("/support/chat");
                    }}
                >
                    Chat with Agent
                </Button>
            </Box>

            {/* WALLET / ANALYTICS CARDS */}
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
                ) : renderAnalyticsCards()}
            </Box>

            {/* Banner/Promotional Area */}
            {!loadingBanners && banners && banners.length > 0 && (
                <>
                    <Typography variant="h6" sx={{ mt: 6, mb: 2, fontWeight: 700 }}>
                        Start a New Loan Application
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            gap: 2,
                            mb: 2,
                        }}
                    >
                        {banners.slice(0, 3).map((banner, idx) => (
                            <Box
                                key={banner.id || idx}
                                sx={{
                                    flex: 1,
                                    minWidth: { xs: "100%", md: 0 }
                                }}
                            >
                                <ImageCard
                                    title={banner.title || banner.name || `Banner ${idx + 1}`}
                                    onClick={() => {
                                        if (banner.link_url) {
                                            window.open(banner.link_url, '_blank', 'noopener,noreferrer');
                                        } else if (banner.onClick) {
                                            banner.onClick();
                                        } else if (banner.actionLabel) {
                                            // handleActionClick(banner.actionLabel);
                                        } else {
                                            toast.info("No action defined for this banner.");
                                        }
                                    }}
                                    image={banner.image}
                                />
                            </Box>
                        ))}
                    </Box>
                </>
            )}

            {/* Tabs for Offers and Applications -- Changed order */}
            <Box sx={{ mt: 4, mb: 2 }}>
                <Tabs
                    value={tabIndex}
                    onChange={(_, newValue) => setTabIndex(newValue)}
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        mb: 0,
                        pt: 0,
                    }}
                    aria-label="Offers and Applications Tabs"
                    variant={isXs ? "scrollable" : "standard"}
                    scrollButtons={isXs ? "auto" : undefined}
                >
                    <Tab label="Available Offers" />
                    <Tab label="Recent Applications" />
                </Tabs>
            </Box>
            {/* Tab Panels */}
            {tabIndex === 0 && (
                <>
                    <Box sx={{
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexDirection: { xs: "column", sm: "row" } // keep for offer
                    }}>
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
                            {loadingOffers ? (
                                <Box sx={{ width: "100%" }}>
                                    <Box className="flex items-center justify-center w-full py-8">
                                        <CircularProgress size={32} />
                                    </Box>
                                </Box>
                            ) : offers.length === 0 ? (
                                <Box sx={{ width: "100%" }}>
                                    <Typography
                                        variant="body2"
                                        className="text-gray-500 flex items-center"
                                    >
                                        No available offers at this time.
                                    </Typography>
                                </Box>
                            ) : (
                                offers
                                    .filter((loan: any) => !appliedLoanIds.includes(loan.id))
                                    .map((loan: any) => (
                                        <Box
                                            key={loan.id}
                                            sx={getColumnWidth({
                                                xs: "100%",
                                                sm: 280,
                                                md: 320,
                                                max: 380
                                            })}
                                        >
                                            <OfferCard
                                                id={loan.id}
                                                name={loan.name}
                                                description={loan.description}
                                                min_amount={loan.min_amount}
                                                max_amount={loan.max_amount}
                                                currency={loan.currency}
                                                interest_rate={loan.interest_rate}
                                                duration_months={loan.duration_months}
                                                required_documents={loan.required_documents}
                                                requirements={loan.requirements}
                                                onApply={() => {
                                                    navigate(`/edufinance/study-abroad-loan/offers/${loan.id}`);
                                                }}
                                            />
                                        </Box>
                                    ))
                            )}
                            {!loadingOffers && offers.filter((loan: any) => !appliedLoanIds.includes(loan.id)).length === 0 && (
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
            {tabIndex === 1 && (
                <>
                    <Box sx={{
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between"
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: { xs: 1, sm: 0 } }}>
                            Recent Applications
                        </Typography>
                        <Button
                            size="small"
                            variant="text"
                            sx={{
                                ml: { xs: 0, sm: 2 },
                                mt: { xs: 1, sm: 0 },
                                width: { xs: '100%', sm: 'auto' },
                                textTransform: "none",
                                fontWeight: 600
                            }}
                            onClick={() => {
                                navigate("/edufinance/study-abroad-loan/applications");
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
                                                max: 380
                                            })}
                                        >
                                            {/* Legacy: Show legacy ApplicationCard for now for applications */}
                                            {/* You may refactor it using OfferCard for homogeneity if apps data matches offer data structure. */}
                                            <Card
                                                className="rounded-2xl shadow-md transition-transform hover:scale-[1.025] hover:shadow-lg"
                                                sx={{
                                                    borderLeft: `6px solid ${
                                                        app.status
                                                            ? app.status === "Disbursed"
                                                                ? "#4caf50"
                                                                : app.status === "Under Review"
                                                                ? "#ff9800"
                                                                : app.status === "Rejected"
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
                                                            {loan.name || loan.loan_title || loan.title || "Study Abroad Loan"}
                                                        </Typography>
                                                        <Button
                                                            size="small"
                                                            className="bg-[#f5ebe1] rounded-xl normal-case w-fit"
                                                            sx={{
                                                                fontWeight: 600,
                                                                fontSize: "0.85rem",
                                                                color:
                                                                    app.status === "Disbursed"
                                                                        ? "#388e3c"
                                                                        : app.status === "Under Review"
                                                                        ? "#ff9800"
                                                                        : app.status === "Rejected"
                                                                        ? "#d32f2f"
                                                                        : "#616161",
                                                                background:
                                                                    app.status === "Disbursed"
                                                                        ? "#e8f5e9"
                                                                        : app.status === "Under Review"
                                                                        ? "#fff3e0"
                                                                        : app.status === "Rejected"
                                                                        ? "#ffebee"
                                                                        : "#f5ebe1",
                                                                px: 2,
                                                                py: 0.5,
                                                                boxShadow: "none",
                                                                pointerEvents: "none",
                                                            }}
                                                            disableElevation
                                                        >
                                                            {app.status}
                                                        </Button>
                                                    </Box>
                                                    <Box className="flex flex-col gap-1">
                                                        <Box className="flex items-center gap-2">
                                                            <Typography
                                                                variant="body2"
                                                                className="text-gray-600"
                                                                sx={{ fontWeight: 500, minWidth: 100 }}
                                                            >
                                                                Loan Range:
                                                            </Typography>
                                                            <Typography variant="body2" className="text-gray-800 font-semibold">
                                                                {loan.min_amount} - {loan.max_amount} {loan.currency}
                                                            </Typography>
                                                        </Box>
                                                        <Box className="flex items-center gap-2">
                                                            <Typography
                                                                variant="body2"
                                                                className="text-gray-600"
                                                                sx={{ fontWeight: 500, minWidth: 100 }}
                                                            >
                                                                Interest Rate:
                                                            </Typography>
                                                            <Typography variant="body2" className="text-gray-800 font-semibold">
                                                                {loan.interest_rate}% p.a.
                                                            </Typography>
                                                        </Box>
                                                        <Box className="flex items-center gap-2">
                                                            <Typography
                                                                variant="body2"
                                                                className="text-gray-600"
                                                                sx={{ fontWeight: 500, minWidth: 100 }}
                                                            >
                                                                Duration:
                                                            </Typography>
                                                            <Typography variant="body2" className="text-gray-800 font-semibold">
                                                                {loan.duration_months} months
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Box>
                                    );
                                })
                            )}
                        </Box>
                    </Box>
                </>
            )}

            {/* Guides & Resources */}
            {/* <Typography
                variant="h6"
                className="font-bold mb-4"
                sx={{ mt: 4 }}
            >
                Guide and Resources
            </Typography>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                }}
            >
                <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: 0 } }}>
                    <GuideCard title="Study Abroad Loan Requirements" />
                </Box>
                <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: 0 } }}>
                    <GuideCard title="Ultimate Guide to Financing Overseas Education" />
                </Box>
            </Box> */}
        </Box>
    );
};

export default StudyAbroadLoanPage;
