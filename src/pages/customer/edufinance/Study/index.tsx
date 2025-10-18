import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  TextField,
  Tabs,
  Tab,
  Stack,
  Autocomplete,
} from "@mui/material";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
// import { getAllStudyAbroadLoans } from "../../../../services/edufinanceServices";
import { getAddBanners } from '../../../../services/studyVisa';
import { toast } from "react-toastify";
import { ImageCard } from "../../../../components/ImageCard";
import { useNavigate } from "react-router-dom";
import FinanceCard from "../../../../components/FinanceCard";


// ApplicationCard for Study Abroad Loan offers/applications
export const ApplicationCard: React.FC<{
  title: string;
  country: string;
  institution: string;
  status: string;
  amount: string | number;
  currency: string;
  type?: string;
}> = ({
  title,
  country,
  institution,
  status,
  amount,
  currency,
  type,
}) => (
  <Card
    className="rounded-2xl shadow-md transition-transform hover:scale-[1.025] hover:shadow-lg"
    sx={{
      borderLeft: `6px solid ${
        status === "Disbursed"
          ? "#4caf50"
          : status === "Under Review"
          ? "#ff9800"
          : status === "Rejected"
          ? "#f44336"
          : "#bdbdbd"
      }`,
      margin: "auto",
      background: "#fffdfa",
    }}
  >
    <CardContent className="flex flex-col gap-2">
      <Box className="flex items-center justify-between gap-4 mb-1">
        <Typography
          variant="subtitle1"
          className="font-bold"
          sx={{ fontSize: "1.1rem" }}
        >
          {title}
        </Typography>
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

  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedInstitution, setSelectedInstitution] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);

  const [tabValue, setTabValue] = useState(0);

  const [banners, setBanners] = useState<any[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);

  // Mock wallet state
  const [wallet, setWallet] = useState<{ balance: number; currency: string; lastUpdated: string }>({
    balance: 1200.5,
    currency: "USD",
    lastUpdated: "just now"
  });
  const [walletLoading, setWalletLoading] = useState(false);

  // Simulate fetching wallet data
  useEffect(() => {
    setWalletLoading(true);
    setTimeout(() => {
      setWallet({
        balance: 1200.5,
        currency: "USD",
        lastUpdated: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
      });
      setWalletLoading(false);
    }, 950);
  }, []);

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

  //   useEffect(() => {
  //     async function fetchLoans() {
  //       setLoading(true);
  //       try {
  //         const res = await getAllStudyAbroadLoans();
  //         setLoans(res?.results || []);
  //       } catch {
  //         setLoans([]);
//       }
//       setLoading(false);
//     }
//     fetchLoans();
//   }, []);
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

  // Helper functions for selection changes
  const handleCountryChange = (_: any, newValue: any) => {
    setSelectedCountry(newValue || "");
    setSelectedInstitution("");
    setSelectedType("");
  };

  const handleInstitutionChange = (_: any, newValue: any) => {
    setSelectedInstitution(newValue || "");
    setSelectedType("");
  };

  const handleTypeChangeAutocomplete = (_: any, newValue: any) => {
    setSelectedType(newValue ? newValue.type : "");
  };

  const handleTabChange = (_: any, newVal: number) => setTabValue(newVal);

  // Start Loan Application Handler
  const handleStartApplication = () => {
    const selectedLoan = filteredOffers[0]; // Simplification: take first matching as selected
    if (selectedLoan && selectedLoan.id) {
      navigate(`/edufinance/study-abroad-loan/offers/${selectedLoan.id}`);
    }
  };

  // Utility: Get loan by id
  const getLoanById = (id: number | string) => loans.find((l) => String(l.id) === String(id));

  // Loan countries/options
  const countryOptions = React.useMemo(() => {
    const set = new Set<string>();
    loans.forEach((l) => {
      if (l.country) set.add(l.country);
    });
    return Array.from(set);
  }, [loans]);

  const institutionOptions = React.useMemo(() => {
    return loans
      .filter((l) => !selectedCountry || l.country === selectedCountry)
      .map((l) => l.institution)
      .filter((val, idx, arr) => val && arr.indexOf(val) === idx);
  }, [loans, selectedCountry]);

  // Loan types (e.g., 'Undergraduate', 'Masters', etc)
  const loanTypeOptions = React.useMemo(() => {
    let filtered = loans.filter(
      (l) =>
        (!selectedCountry || l.country === selectedCountry) &&
        (!selectedInstitution || l.institution === selectedInstitution)
    );
    const set = new Set<string>();
    filtered.forEach((l) => {
      if (l.type) set.add(l.type);
      // Optionally, support multiple types array
      if (Array.isArray(l.loan_types)) {
        l.loan_types.forEach((t: string) => set.add(t));
      }
    });
    return Array.from(set).map((type) => ({ type, display: type }));
  }, [loans, selectedCountry, selectedInstitution]);

  // Filtered offers list
  const filteredOffers = React.useMemo(() => {
    return loans.filter((l) => {
      if (selectedCountry && l.country !== selectedCountry) return false;
      if (selectedInstitution && l.institution !== selectedInstitution) return false;
      if (
        selectedType &&
        l.type !== selectedType &&
        (!l.loan_types || !l.loan_types.includes(selectedType))
      )
        return false;
      return true;
    });
  }, [loans, selectedCountry, selectedInstitution, selectedType]);

  // For display, transform code to readable or just show as is
  const countryDisplay = (country: string) => country;

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <Typography variant="body1" className="text-gray-700 max-w-md">
          Get low-rate loans and tailored support for your international study ambitions.
        </Typography>
        <Button
          variant="contained"
          className="bg-[#f5ebe1] text-black shadow-sm rounded-xl normal-case mt-4 md:mt-0"
        >
          Chat with Agent
        </Button>
      </div>

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
            <Stack direction="row" spacing={3}>
      <FinanceCard
        title="Travel Wallet"
        amount="#125,000,000"
        buttonText="Fund wallet"
        transactions={transactions}
      />
      <FinanceCard
        title="Loan Amount"
        amount="#1,425,000,000"
        buttonText="Make Payment"
        transactions={transactions}
      />
      <FinanceCard
        title="Amount Paid"
        amount="#425,000,000"
        buttonText="Make Payment"
        transactions={transactions}
      />
    </Stack>
        )}
      </Box>


      {/* Banner/Promotional Area */}
      {!loadingBanners && banners && banners.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mt: 6, mb: 2, fontWeight: 700 }}>
            Start a New Loan Application
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            sx={{ mb: 2 }}
          >
            {banners.slice(0, 3).map((banner, idx) => (
              <Box sx={{ flex: 1 }} key={banner.id || idx}>
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
          </Stack>
        </>
      )}

      {/* Application Tabs */}
      <Box sx={{ mt: 4, mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="Applications and Offers"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Recent Applications" />
          <Tab label="Recent Offers" />
        </Tabs>
        {/* View all button, changes based on tab */}
        {tabValue === 0 ? (
          <Button
            size="small"
            variant="text"
            sx={{ ml: 2, textTransform: "none", fontWeight: 600 }}
            onClick={() => {
              navigate("/edufinance/study-abroad-loan/applications");
            }}
          >
            View all
          </Button>
        ) : (
          <Button
            size="small"
            variant="text"
            sx={{ ml: 2, textTransform: "none", fontWeight: 600 }}
            onClick={() => {
              navigate("/edufinance/study-abroad-loan/offers");
            }}
          >
            View all
          </Button>
        )}
      </Box>
      <Box
        sx={{
          overflowX: "auto",
          width: "100%",
          pb: 1,
        }}
      >
        {tabValue === 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
            }}
          >
            {loadingApplications ? (
              <Box className="flex items-center justify-center w-full py-8">
                <CircularProgress size={32} />
              </Box>
            ) : recentApplications.length === 0 ? (
              <Typography
                variant="body2"
                className="text-gray-500 flex items-center"
              >
                No recent applications found.
              </Typography>
            ) : (
              recentApplications.map((app: any) => {
                const loan = getLoanById(app.loan_id);
                if (!loan) return null;
                return (
                  <Box
                    key={app.id}
                    sx={{ minWidth: 280, maxWidth: 340, flex: "0 0 auto" }}
                  >
                    <ApplicationCard
                      title={loan.loan_title || loan.title || "Study Abroad Loan"}
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
        )}
        {/* Recent Offers Tab */}
        {tabValue === 1 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
            }}
          >
            {loading ? (
              <Box className="flex items-center justify-center w-full py-8">
                <CircularProgress size={32} />
              </Box>
            ) : loans?.length === 0 ? (
              <Typography
                variant="body2"
                className="text-gray-500 flex items-center"
              >
                No recent offers found.
              </Typography>
            ) : (
              loans
                .slice(0, 7)
                .map((loan: any) => (
                  <Box
                    key={loan.id}
                    sx={{ minWidth: 280, maxWidth: 340, flex: "0 0 auto" }}
                  >
                    <ApplicationCard
                      title={loan.loan_title || loan.title || "Study Abroad Loan"}
                      country={loan.country}
                      institution={loan.institution}
                      status={loan.status || "Open"}
                      amount={loan.amount || "-"}
                      currency={loan.currency || ""}
                      type={loan.type}
                    />
                  </Box>
                ))
            )}
          </Box>
        )}
      </Box>

      {/* Guides & Resources */}
      <Typography
        variant="h6"
        className="font-bold mb-4"
        sx={{ mt: 4 }}
      >
        Guide and Resources
      </Typography>
      <div className="flex flex-col md:flex-row gap-4">
        <GuideCard title="Study Abroad Loan Requirements" />
        <GuideCard title="Ultimate Guide to Financing Overseas Education" />
      </div>
    </Box>
  );
};

export default StudyAbroadLoanPage;
