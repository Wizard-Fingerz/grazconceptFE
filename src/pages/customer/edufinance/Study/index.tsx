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
} from "@mui/material";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import { getAddBanners } from '../../../../services/studyVisa';
import { toast } from "react-toastify";
import { ImageCard } from "../../../../components/ImageCard";
import { useNavigate } from "react-router-dom";
import FinanceCard from "../../../../components/FinanceCard";

/**
 * Hardcoded loan offers just for display mapping,
 * since getLoanById is being used below and previously caused errors.
 */
const MOCK_LOANS = [
    {
        id: 1,
        loan_title: "Masters Loan at Harvard",
        country: "USA",
        institution: "Harvard University",
        amount: 70000,
        currency: "USD",
        type: "Unsecured",
    },
    {
        id: 2,
        loan_title: "Masters Loan at University of Toronto",
        country: "Canada",
        institution: "University of Toronto",
        amount: 55000,
        currency: "CAD",
        type: "Secured",
    },
    {
        id: 3,
        loan_title: "Undergraduate Loan at Imperial College London",
        country: "UK",
        institution: "Imperial College London",
        amount: 45000,
        currency: "GBP",
        type: "Unsecured",
    },
];

// Helper to get loan offer by ID for mapping application to details
function getLoanById(id: number) {
    return MOCK_LOANS.find((loan) => loan.id === id);
}

// ApplicationCard for Study Abroad Loan offers/applications
export const ApplicationCard: React.FC<{
    title: string;
    country: string;
    institution: string;
    status?: string;
    amount: string | number;
    currency: string;
    type?: string;
    onApply?: () => void;
}> = ({
    title,
    country,
    institution,
    status,
    amount,
    currency,
    type,
    onApply,
}) => (
    <Card
        className="rounded-2xl shadow-md transition-transform hover:scale-[1.025] hover:shadow-lg"
        sx={{
            borderLeft: `6px solid ${
                status
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
            <Box className="flex flex-col gap-1">
                <Box className="flex items-center gap-2">
                    <Typography
                        variant="body2"
                        className="text-gray-600"
                        sx={{ fontWeight: 500, minWidth: 88 }}
                    >
                        Country:
                    </Typography>
                    <Typography variant="body2" className="text-gray-800">
                        {country}
                    </Typography>
                </Box>
                <Box className="flex items-center gap-2">
                    <Typography
                        variant="body2"
                        className="text-gray-600"
                        sx={{ fontWeight: 500, minWidth: 70 }}
                    >
                        Institution:
                    </Typography>
                    <Typography variant="body2" className="text-gray-800">
                        {institution}
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
                            Loan Type:
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

export const GuideCard: React.FC<{ title: string }> = ({ title }) => (
    <Button className="bg-[#f5ebe1] rounded-xl px-6 py-3 font-semibold normal-case shadow-sm hover:bg-[#f3e1d5]">
        {title}
    </Button>
);

export const StudyAbroadLoanPage: React.FC = () => {
    const navigate = useNavigate();
    const [recentApplications, setRecentApplications] = useState<any[]>([]);
    const [loadingApplications, setLoadingApplications] = useState(true);

    const [banners, setBanners] = useState<any[]>([]);
    const [loadingBanners, setLoadingBanners] = useState(true);

    // Offers Tab state
    const [tabIndex, setTabIndex] = useState(0);

    // Mock wallet state
    const [walletLoading] = useState(false);

    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down("sm"));

    useEffect(() => {
        let mounted = true;
        setLoadingBanners(true);
        getAddBanners()
            .then((data: any) => {
                if (mounted) {
                    if (data && Array.isArray(data.results)) {
                        setBanners(data.results);
                    } else {
                        setBanners([]);
                    }
                }
            })
            .catch(() => {
                if (mounted) setBanners([]);
            })
            .finally(() => {
                if (mounted) setLoadingBanners(false);
            });
        return () => {
            mounted = false;
        };
    }, []);

    const transactions = [
        { title: "Flight to Accra", amount: "#25.00" },
        { title: "Saving deposit", amount: "#25.00" },
    ];

    // Fake fetching recent applications
    useEffect(() => {
        async function fetchApplications() {
            setLoadingApplications(true);
            try {
                await new Promise((r) => setTimeout(r, 400));
                setRecentApplications([
                    {
                        id: "loanapp1",
                        loan_id: 1,
                        status: "Under Review",
                        created_at: "2024-06-01T12:00:00.000Z",
                        amount: 5000,
                        currency: "USD"
                    },
                    {
                        id: "loanapp2",
                        loan_id: 3,
                        status: "Disbursed",
                        created_at: "2024-05-01T09:00:00.000Z",
                        amount: 15000,
                        currency: "USD"
                    },
                ]);
            } catch {
                setRecentApplications([]);
            }
            setLoadingApplications(false);
        }
        fetchApplications();
    }, []);

    // Check offer loan ID in recent app to hide from the offers list (optional)
    const appliedLoanIds = recentApplications.map(app => app.loan_id);

    // Responsive columns helper replacement
    const getColumnWidth = (breakpoints: any) => ({
        flex: `0 0 auto`,
        minWidth: breakpoints.xs || "100%",
        maxWidth: breakpoints.max || 380,
        width: breakpoints.xs || "100%",
        ...(breakpoints.sm && { [`@media (min-width:600px)`]: { minWidth: breakpoints.sm, width: breakpoints.sm } }),
        ...(breakpoints.md && { [`@media (min-width:900px)`]: { minWidth: breakpoints.md, width: breakpoints.md } }),
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

            {/* Banner/Promotional Area */}
            {!loadingBanners && banners && banners.length > 0 && (
                <>
                    <Typography variant="h6" sx={{ mt: 6, mb: 2, fontWeight: 700 }}>
                        Start a New Loan Application
                    </Typography>
                    {/* Responsive banners using Flexbox */}
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

            {/* Tabs for Applications and Offers */}
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
                                            <ApplicationCard
                                                title={loan.loan_title || "Study Abroad Loan"}
                                                country={loan.country}
                                                institution={loan.institution}
                                                status={app.status}
                                                amount={app.amount || loan.amount || "-"}
                                                currency={app.currency || loan.currency || ""}
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
                    <Box sx={{
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexDirection: { xs: "column", sm: "row" }
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
                            {MOCK_LOANS
                                .filter(loan => !appliedLoanIds.includes(loan.id))
                                .map((loan) => (
                                    <Box
                                        key={loan.id}
                                        sx={getColumnWidth({
                                            xs: "100%",
                                            sm: 280,
                                            md: 320,
                                            max: 380
                                        })}
                                    >
                                        <ApplicationCard
                                            title={loan.loan_title}
                                            country={loan.country}
                                            institution={loan.institution}
                                            amount={loan.amount}
                                            currency={loan.currency}
                                            type={loan.type}
                                            onApply={() => {
                                                toast.info(
                                                    "Begin your application for this loan offer."
                                                );
                                                // Place navigation or application logic here
                                            }}
                                        />
                                    </Box>
                                ))}
                            {/* Empty message if all offers taken */}
                            {MOCK_LOANS.filter(loan => !appliedLoanIds.includes(loan.id)).length === 0 && (
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
            </Box>
        </Box>
    );
};

export default StudyAbroadLoanPage;
