import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import ActionCard from "../../../../components/ActionCard";
import { useNavigate } from "react-router-dom";

import PublicIcon from "@mui/icons-material/Public";
import EventIcon from "@mui/icons-material/Event";
// import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import AssignmentIcon from "@mui/icons-material/Assignment";
// You must implement these in your /services/workVisa
import {
  getMyRecentWorkVisaApplications,
  getMyRecentWorkVisaOffers,
} from "../../../../services/workVisaService";

/**
 * ApplicationCard - Reusable card for displaying application info.
 */
export const ApplicationCard: React.FC<{
  company: string;
  country: string;
  job: string;
  status: string;
}> = ({ company, country, job, status }) => (
  <Card
    className="rounded-2xl shadow-md transition-transform hover:scale-[1.025] hover:shadow-lg"
    sx={{
      borderLeft: `6px solid ${
        status === "Approved"
          ? "#4caf50"
          : status === "Pending"
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
          {company}
        </Typography>
        <Button
          size="small"
          className="bg-[#f5ebe1] rounded-xl normal-case w-fit"
          sx={{
            fontWeight: 600,
            fontSize: "0.85rem",
            color:
              status === "Approved"
                ? "#388e3c"
                : status === "Pending"
                ? "#ff9800"
                : status === "Rejected"
                ? "#d32f2f"
                : "#616161",
            background:
              status === "Approved"
                ? "#e8f5e9"
                : status === "Pending"
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
            sx={{ fontWeight: 500, minWidth: 70 }}
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
            Job:
          </Typography>
          <Typography variant="body2" className="text-gray-800">
            {job}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

/**
 * OfferCard - Reusable card for displaying a work visa offer.
 */
export const OfferCard: React.FC<{
  offer: any;
  onViewOffer: () => void;
}> = ({ offer, onViewOffer }) => (
  <Card
    className="rounded-2xl shadow-md hover:shadow-lg transition"
    sx={{ minWidth: 280, maxWidth: 360, background: "#fbf9f1" }}
  >
    <CardContent>
      <Typography variant="subtitle1" className="font-bold mb-2">
        Offer: {offer.company_name || "Company"}
      </Typography>
      <Typography variant="body2" className="mb-1">
        Job: {offer.job_title || "Job Title"}
      </Typography>
      <Typography variant="body2" className="mb-1">
        Country: {offer.country || "Country"}
      </Typography>
      <Typography
        variant="body2"
        className="mb-2"
        sx={{
          color:
            offer.status === "Active"
              ? "#388e3c"
              : offer.status === "Expired"
              ? "#d32f2f"
              : "#616161",
        }}
      >
        Status: {offer.status || ""}
      </Typography>
      <Button
        size="small"
        onClick={onViewOffer}
        className="bg-purple-700 hover:bg-purple-800 text-white rounded-xl normal-case"
        sx={{ mt: 1 }}
      >
        View Offer
      </Button>
    </CardContent>
  </Card>
);

/**
 * GuideCard - Reusable card for displaying a guide/resource.
 */
export const GuideCard: React.FC<{ title: string }> = ({ title }) => (
  <Button className="bg-[#f5ebe1] rounded-xl px-6 py-3 font-semibold normal-case shadow-sm hover:bg-[#f3e1d5]">
    {title}
  </Button>
);

/**
 * ApplyWorkVisa - Page for applying for a Work visa.
 * Uses reusable ApplicationCard, OfferCard and GuideCard components.
 */
export const ApplyWorkVisa: React.FC = () => {
  const navigate = useNavigate();

  // Navigation handlers for each ActionCard
  const handleViewCountriesJobs = () => {
    navigate("/travel/work-visa/countries-jobs");
  };
  const handleScheduleInterview = () => {
    navigate("/travel/work-visa/schedule-interview");
  };
  // const handleTrackProgress = () => {
  //   navigate("/travel/work-visa/track-progress");
  // };
  const handleSubmitCV = () => {
    navigate("/travel/work-visa/submit-cv");
  };

  // --- Recent Applications and Offers State ---
  const [tabValue, setTabValue] = useState(0);

  // Applications
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);

  // Offers
  const [recentOffers, setRecentOffers] = useState<any[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);

  useEffect(() => {
    setLoadingApplications(true);
    getMyRecentWorkVisaApplications?.()
      .then((data: any) => {
        if (data && Array.isArray(data.results)) {
          setRecentApplications(data.results);
        } else if (Array.isArray(data)) {
          setRecentApplications(data);
        } else {
          setRecentApplications([]);
        }
      })
      .catch(() => setRecentApplications([]))
      .finally(() => setLoadingApplications(false));
  }, []);

  useEffect(() => {
    setLoadingOffers(true);
    getMyRecentWorkVisaOffers?.()
      .then((data: any) => {
        if (data && Array.isArray(data.results)) {
          setRecentOffers(data.results);
        } else if (Array.isArray(data)) {
          setRecentOffers(data);
        } else {
          setRecentOffers([]);
        }
      })
      .catch(() => setRecentOffers([]))
      .finally(() => setLoadingOffers(false));
  }, []);

  // Tab change handler
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handler for viewing an offer (expand as needed)
  const handleViewOffer = (offerId: string | number) => {
    navigate(`/travel/work-visa/offer/${offerId}`);
  };
  // Handler for "View More" button click, depends on tab
  const handleViewMore = () => {
    if (tabValue === 0) {
      navigate("/travel/work-visa/applications");
    } else if (tabValue === 1) {
      navigate("/travel/work-visa/offers");
    }
  };

  // Application status label mapping
  const getStatusLabel = (status: number | string | null | undefined) => {
    const statusMap: Record<string, string> = {
      "33": "Draft",
      "34": "Submitted",
      "35": "Pending",
      "36": "Approved",
      "37": "Rejected",
      // For demo/status text fallback
      "Under Review": "Under Review",
      "Completed": "Completed"
    };
    if (status == null) return "Unknown Status";
    return statusMap[String(status)] || String(status);
  };

  // Helper for sensible company name fallback if missing
  const getCompanyName = (item: any) =>
    item?.company_name || item?.company || "Unknown Company";
  const getJobName = (item: any) =>
    item?.job_title || item?.job || "Unknown Job";
  const getCountryName = (item: any) =>
    item?.country || "Unknown Country";

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: "100%", maxWidth: 1400, mx: "auto" }}>
      <CustomerPageHeader>
        {/* Page Header */}
        <Typography variant="h4" className="font-bold mb-2">
          Apply for
        </Typography>
        <Typography variant="h4" className="font-bold mb-6">
          Work visa
        </Typography>
      </CustomerPageHeader>

      {/* Sub Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <Typography variant="body1" className="text-gray-700 max-w-md">
          Get assistance with your work visa application from our experienced
          travel advisors
        </Typography>
        <Button
          variant="contained"
          className="bg-[#f5ebe1] text-black shadow-sm rounded-xl normal-case mt-4 md:mt-0"
        >
          Chat with Agent
        </Button>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <ActionCard
          icon={<PublicIcon fontSize="inherit" />}
          title="View Available Countries and Jobs"
          description="Complete your work visa application"
          onClick={handleViewCountriesJobs}
        />
        <ActionCard
          icon={<EventIcon fontSize="inherit" />}
          title="Schedule Interview"
          description="Book a date for your Job interview"
          onClick={handleScheduleInterview}
        />
        {/* <ActionCard
          icon={<TrackChangesIcon fontSize="inherit" />}
          title="Track Progress"
          description="Monitor the status of the application"
          onClick={handleTrackProgress}
        /> */}
        <ActionCard
          icon={<AssignmentIcon fontSize="inherit" />}
          title="Submit CV And Apply"
          description="Upload your CV and apply for the job."
          onClick={handleSubmitCV}
        />
      </div>
      {/* Start Application Button */}
      {/* Optionally: add a button for starting application */}

      {/* Tabs for Recent Applications / Offers */}
      <Box sx={{ mt: 4, mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="Recent Applications and Recent Work Visa Offers Tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Recent Applications" />
          <Tab label="Recent Work Visa Offers" />
        </Tabs>
      </Box>

      <Box sx={{ overflowX: "auto", width: "100%", pb: 1 }}>
        {/* Recent Applications Tab */}
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
              <Typography variant="body2" className="text-gray-500 flex items-center">
                No recent applications found.
              </Typography>
            ) : (
              recentApplications.map((app: any) => (
                <Box key={app.id} sx={{ minWidth: 280, maxWidth: 340, flex: "0 0 auto" }}>
                  <ApplicationCard
                    company={getCompanyName(app)}
                    country={getCountryName(app)}
                    job={getJobName(app)}
                    status={getStatusLabel(app.status)}
                  />
                </Box>
              ))
            )}
          </Box>
        )}

        {/* Recent Work Visa Offers Tab */}
        {tabValue === 1 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
            }}
          >
            {loadingOffers ? (
              <Box className="flex items-center justify-center w-full py-8">
                <CircularProgress size={32} />
              </Box>
            ) : recentOffers.length === 0 ? (
              <Typography variant="body2" className="text-gray-500 flex items-center">
                No recent work visa offers found.
              </Typography>
            ) : (
              recentOffers.map((offer: any) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onViewOffer={() => handleViewOffer(offer.id)}
                />
              ))
            )}
          </Box>
        )}
      </Box>

      {/* View More Button */}
      <Box className="flex items-center justify-end mb-4" sx={{ mt: 2 }}>
        <Button
          size="small"
          variant="text"
          className="text-primary-1 font-semibold normal-case"
          onClick={handleViewMore}
        >
          View More
        </Button>
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
        <GuideCard title="Work visa Requirements" />
        <GuideCard title="Ultimate guide to Work abroad" />
      </div>
    </Box>
  );
};
