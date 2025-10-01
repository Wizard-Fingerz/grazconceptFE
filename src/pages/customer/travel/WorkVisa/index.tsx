import React from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import ActionCard from "../../../../components/ActionCard";
import { useNavigate } from "react-router-dom";

import PublicIcon from "@mui/icons-material/Public";
import EventIcon from "@mui/icons-material/Event";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import AssignmentIcon from "@mui/icons-material/Assignment";
/**
 * ApplicationCard - Reusable card for displaying application info.
 */
export const ApplicationCard: React.FC<{
  university: string;
  country: string;
  program: string;
  status: string;
}> = ({ university, country, program, status }) => (
  <Card className="rounded-2xl shadow-md">
    <CardContent className="flex flex-col gap-2">
      <Typography variant="subtitle1" className="font-bold">
        {university}
      </Typography>
      <Typography variant="body2" className="text-gray-600">
        {country}
      </Typography>
      <Typography variant="body2" className="text-gray-600">
        {program}
      </Typography>
      <Button
        size="small"
        className="bg-[#f5ebe1] rounded-xl normal-case w-fit mt-2"
      >
        {status}
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
 * Uses reusable ApplicationCard and GuideCard components.
 */
export const ApplyWorkVisa: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  console.log(isXs, isSm)

  // Define navigation handlers for each ActionCard
  const handleViewCountriesJobs = () => {
    navigate("/travel/work-visa/countries-jobs");
  };
  const handleScheduleInterview = () => {
    navigate("/customer/travel/work-visa/schedule-interview");
  };
  const handleTrackProgress = () => {
    navigate("/customer/travel/work-visa/track-progress");
  };
  const handleSubmitCV = () => {
    navigate("/customer/travel/work-visa/submit-cv");
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1400, mx: 'auto' }}>


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
          Get assistance with your student visa application from our experienced
          travel advisors
        </Typography>
        <Button
          variant="contained"
          className="bg-[#f5ebe1] text-black shadow-sm rounded-xl normal-case mt-4 md:mt-0"
        >
          Chat with Agent
        </Button>
      </div>

      {/* Application Form */}
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
        <ActionCard
          icon={<TrackChangesIcon fontSize="inherit" />}
          title="Track Progress"
          description="Monitor the status of the application"
          onClick={handleTrackProgress}
        />
        <ActionCard
          icon={<AssignmentIcon fontSize="inherit" />}
          title="Submit CV And Apply"
          description="Upload your CV and apply for the job."
          onClick={handleSubmitCV}
        />
      </div>
      {/* Start Application Button */}
      <Button
        variant="contained"
        fullWidth
        className="bg-purple-700 hover:bg-purple-800 text-white rounded-full py-3 font-semibold normal-case"
      >
        Start Application
      </Button>

      {/* Recent Applications */}
      <Typography
        variant="h6"
        className="font-bold mb-4"
        sx={{ mt: 4 }}
      >
        Recent Applications
      </Typography>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ApplicationCard
          university="Calford University"
          country="Norway"
          program="Course: Dilence"
          status="Under Review"
        />
        <ApplicationCard
          university="University of Toronto"
          country="Canada"
          program="Program: Intern"
          status="Completed"
        />
      </div>

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
