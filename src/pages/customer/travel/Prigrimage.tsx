import React from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Box,
  useMediaQuery,
  useTheme,
  Stack,
} from "@mui/material";
import { CustomerPageHeader } from "../../../components/CustomerPageHeader";
import { ImageCard } from "../../../components/ImageCard";

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
 * ApplyPilgrimageVisa - Page for applying for a Pilgrimage visa.
 * Uses reusable ApplicationCard and GuideCard components.
 */
export const ApplyPilgrimageVisa: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.down('md'));

  console.log(isXs, isSm)

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1400, mx: 'auto' }}>
<CustomerPageHeader>
  {/* Page Header */}
  <Typography variant="h4" className="font-bold mb-2">
    Apply for
  </Typography>
  <Typography variant="h4" className="font-bold mb-6">
    Pilgrimage visa
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Destination */}
        <Card className="rounded-2xl shadow-md">
          <CardContent className="flex flex-col items-center justify-center" sx={{ height: { xs: 180, sm: 200, md: 220 } }}>
            <Typography variant="subtitle1" className="font-semibold mb-2">
              Destination
            </Typography>
            <Button className="bg-[#f5ebe1] rounded-xl normal-case">
              Choose a country &gt;
            </Button>
          </CardContent>
        </Card>

        {/* Institution */}
        <Card className="rounded-2xl shadow-md">
          <CardContent className="flex flex-col items-center justify-center" sx={{ height: { xs: 180, sm: 200, md: 220 } }}>
            <Typography variant="subtitle1" className="font-semibold mb-2">
              Institution
            </Typography>
            <Button className="bg-[#f5ebe1] rounded-xl normal-case">
              Select Institution
            </Button>
          </CardContent>
        </Card>

        {/* Program Type */}
        <Card className="rounded-2xl shadow-md">
          <CardContent className="flex flex-col justify-center" sx={{ height: { xs: 180, sm: 200, md: 220 } }}>
            <Typography variant="subtitle1" className="font-semibold mb-2" sx={{ fontSize: '1rem' }}>
              Program Type
            </Typography>
            <RadioGroup defaultValue="fully-funded">
              <FormControlLabel
                value="fully-funded"
                control={<Radio />}
                label={
                  <Typography sx={{ fontSize: '0.95rem' }}>
                    Fully Funded
                  </Typography>
                }
              />
              <FormControlLabel
                value="partially-funded"
                control={<Radio />}
                label={
                  <Typography sx={{ fontSize: '0.95rem' }}>
                    Partially Funded
                  </Typography>
                }
              />
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      {/* Start Application Button */}
      <Button
        variant="contained"
        fullWidth
        className="bg-purple-700 hover:bg-purple-800 text-white rounded-full py-3 font-semibold normal-case"
      >
        Start Application
      </Button>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        sx={{ mt: 4 }}
      >
        <Box sx={{ flex: 1 }}>
          <ImageCard title="Summer in London 20% Off" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <ImageCard title="Apply for Study Visa" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <ImageCard title="Apply for Vacation Visa" />
        </Box>
      </Stack>


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
        <GuideCard title="Pilgrimage visa Requirements" />
        <GuideCard title="Ultimate guide to Pilgrimage abroad" />
      </div>
    </Box>
  );
};
