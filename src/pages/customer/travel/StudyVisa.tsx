import React, { useEffect, useState } from "react";
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
  MenuItem,
  CircularProgress,
  TextField,
} from "@mui/material";
import { getAllInstitutions } from "../../../services/studyVisa";
import { CustomerPageHeader } from "../../../components/CustomerPageHeader";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

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
 * ApplyStudyVisa - Page for applying for a study visa.
 * Uses reusable ApplicationCard and GuideCard components.
 */

export const ApplyStudyVisa: React.FC = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  console.log(isXs,isSm )

  // State for institutions and form selections
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedInstitution, setSelectedInstitution] = useState<string>("");
  const [selectedProgramType, setSelectedProgramType] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch institutions on mount
  useEffect(() => {
    setLoading(true);
    getAllInstitutions()
      .then((data) => {
        setInstitutions(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Derive unique countries and program types from institutions
  const countries = Array.from(
    new Set(institutions.map((inst) => inst.country))
  ).filter(Boolean);

  // Filter institutions by selected country
  const filteredInstitutions = selectedCountry
    ? institutions.filter((inst) => inst.country === selectedCountry)
    : institutions;

  // Derive program types from filtered institutions (using new API structure)
  const programTypes = Array.from(
    new Set(
      filteredInstitutions.flatMap((inst) =>
        Array.isArray(inst.program_types)
          ? inst.program_types.map((pt: { name: any }) => pt.name)
          : []
      )
    )
  ).filter(Boolean);

  // Handle form changes
  const handleCountryChange = (e: any) => {
    setSelectedCountry(e.target.value);
    setSelectedInstitution("");
    setSelectedProgramType("");
  };

  const handleInstitutionChange = (e: any) => {
    setSelectedInstitution(e.target.value);
    setSelectedProgramType("");
  };

  const handleProgramTypeChange = (e: any) => {
    setSelectedProgramType(e.target.value);
  };

  // Handle Start Application
  const handleStartApplication = async () => {
    setSubmitting(true);
    try {
      // Find the selected institution object to get its id (if needed)
      const institutionObj = filteredInstitutions.find(
        (inst) => inst.name === selectedInstitution
      );

      // Prepare payload
      const payload: Record<string, any> = {
        country: selectedCountry,
        institution: selectedInstitution,
        program_type: selectedProgramType,
        institution_id: institutionObj?.id,
      };

  // Get the latest token from localStorage
  const token = localStorage.getItem('token');
  const headers = token
    ? { Authorization: `Bearer ${token}` }
    : {};

      // Send POST request to the application endpoint
      const response = await api.post(
        `/visa/apply/`,
        payload,
        { headers }
      );

      // On success, get the id from response data and navigate
      const id = response.data?.id;
      if (id) {
        navigate(`/customer/travel/study-visa/continue/${id}`);
      } else {
        // Optionally handle missing id
        alert("Application submitted but no ID returned.");
      }
    } catch (error: any) {
      // Optionally handle error
      alert(
        error?.response?.data?.detail ||
          "Failed to submit application. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
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
        {/* Page Header */}
        <Typography variant="h4" className="font-bold mb-2">
          Apply for
        </Typography>
        <Typography variant="h4" className="font-bold mb-6">
          Study visa
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
          <CardContent
            className="flex flex-col items-center justify-center"
            sx={{ height: { xs: 180, sm: 200, md: 220 }, width: "100%" }}
          >
            {loading ? (
              <CircularProgress size={28} />
            ) : (
              <TextField
                select
                fullWidth
                label="Choose a destination"
                value={selectedCountry}
                onChange={handleCountryChange}
                variant="outlined"
                InputProps={{
                  sx: {
                    fontWeight: 500,
                  },
                }}
                InputLabelProps={{
                  sx: {
                    fontWeight: 500,
                  },
                }}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        borderRadius: 1,
                      },
                    },
                  },
                }}
              >
                {countries.length === 0 ? (
                  <MenuItem value="" disabled>
                    No countries available
                  </MenuItem>
                ) : (
                  countries.map((country) => (
                    <MenuItem key={country} value={country}>
                      {country}
                    </MenuItem>
                  ))
                )}
              </TextField>
            )}
          </CardContent>
        </Card>

        {/* Institution */}
        <Card className="rounded-2xl shadow-md">
          <CardContent
            className="flex flex-col items-center justify-center"
            sx={{ height: { xs: 180, sm: 200, md: 220 }, width: "100%" }}
          >
            {loading ? (
              <CircularProgress size={28} />
            ) : (
              <TextField
                select
                fullWidth
                label="Select Institution"
                value={selectedInstitution}
                onChange={handleInstitutionChange}
                variant="outlined"
                disabled={!selectedCountry}
                InputProps={{
                  sx: {
                    fontWeight: 500,
                  },
                }}
                InputLabelProps={{
                  sx: {
                    fontWeight: 500,
                  },
                }}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        borderRadius: 1,
                      },
                    },
                  },
                }}
              >
                {filteredInstitutions.length === 0 ? (
                  <MenuItem value="" disabled>
                    No institutions available
                  </MenuItem>
                ) : (
                  filteredInstitutions.map((inst) => (
                    <MenuItem key={inst.id || inst.name} value={inst.name}>
                      {inst.name}
                    </MenuItem>
                  ))
                )}
              </TextField>
            )}
          </CardContent>
        </Card>

        {/* Program Type */}
        <Card className="rounded-2xl shadow-md">
          <CardContent
            className="flex flex-col justify-center"
            sx={{ height: { xs: 180, sm: 200, md: 220 }, width: "100%" }}
          >
            <Typography
              variant="subtitle1"
              className="font-semibold mb-2"
              sx={{ fontSize: "1rem", width: "100%" }}
            >
              Program Type
            </Typography>
            {loading ? (
              <CircularProgress size={28} />
            ) : (
              <RadioGroup
                value={selectedProgramType}
                onChange={handleProgramTypeChange}
                name="program-type"
              >
                {programTypes.length === 0 && (
                  <FormControlLabel
                    value=""
                    control={<Radio disabled />}
                    label={
                      <Typography sx={{ fontSize: "0.95rem" }}>
                        No program types available
                      </Typography>
                    }
                  />
                )}
                {programTypes.map((type) => (
                  <FormControlLabel
                    key={type}
                    value={type}
                    control={<Radio />}
                    label={
                      <Typography sx={{ fontSize: "0.95rem" }}>
                        {type}
                      </Typography>
                    }
                  />
                ))}
              </RadioGroup>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Start Application Button */}
      <Button
        variant="contained"
        fullWidth
        className="bg-purple-700 hover:bg-purple-800 text-white rounded-full py-3 font-semibold normal-case"
        disabled={
          !selectedCountry || !selectedInstitution || !selectedProgramType || submitting
        }
        onClick={handleStartApplication}
      >
        {submitting ? <CircularProgress size={24} color="inherit" /> : "Start Application"}
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
        <GuideCard title="Study visa Requirements" />
        <GuideCard title="Ultimate guide to study abroad" />
      </div>
    </Box>
  );
};
