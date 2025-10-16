import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  MenuItem,
  CircularProgress,
  TextField,
  Tabs,
  Tab,
} from "@mui/material";
import {
  getAllInstitutions,
  getMyRecentSudyVisaApplicaton,
  getMyRecentSudyVisaOffer,
  getCoursesForInstitutionAndProgramType, // <-- You must implement this in your /services/studyVisa
} from "../../../../services/studyVisa";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import { useNavigate } from "react-router-dom";
import api from "../../../../services/api";
import { capitalizeWords } from "../../../../utils";
import { OfferCard } from "../../../../components/StudyVisaCard";

/**
 * ApplicationCard - Reusable card for displaying application info.
 */
export const ApplicationCard: React.FC<{
  university: string;
  country: string;
  program: string;
  status: string;
}> = ({ university, country, program, status }) => (
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
          {capitalizeWords(university)}
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
            Program:
          </Typography>
          <Typography variant="body2" className="text-gray-800">
            {program}
          </Typography>
        </Box>
      </Box>
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
 * Uses reusable ApplicationCard, OfferCard, and GuideCard components.
 */

export const ApplyStudyVisa: React.FC = () => {
  const navigate = useNavigate();
  // State for institutions and form selections
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedInstitution, setSelectedInstitution] = useState<string>(""); // institution id
  const [selectedProgramType, setSelectedProgramType] = useState<string>(""); // program type id
  const [selectedCourse, setSelectedCourse] = useState<string>(""); // course of study id
  const [submitting, setSubmitting] = useState(false);

  // State for recent applications
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);

  // State for tab selection: 0 = Recent Applications, 1 = Recent Study Visa Offers
  const [tabValue, setTabValue] = useState(0);

  // State for recent study visa offers (for the new tab)
  const [recentStudyVisaOffers, setRecentStudyVisaOffers] = useState<any[]>([]);
  const [loadingRecentStudyVisaOffers, setLoadingRecentStudyVisaOffers] = useState(true);

  // NEW: State for loading and storing the fetched courses
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

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

  // Fetch recent study visa applications on mount
  useEffect(() => {
    setLoadingApplications(true);
    getMyRecentSudyVisaApplicaton()
      .then((data) => {
        // If paginated, use data.results; else fallback
        if (data && Array.isArray(data.results)) {
          setRecentApplications(data.results);
        } else if (Array.isArray(data)) {
          setRecentApplications(data);
        } else {
          setRecentApplications([]);
        }
        setLoadingApplications(false);
      })
      .catch(() => setLoadingApplications(false));
  }, []);

  // Fetch recent study visa offers (for the new tab)
  useEffect(() => {
    setLoadingRecentStudyVisaOffers(true);
    getMyRecentSudyVisaOffer()
      .then((data) => {
        if (data && Array.isArray(data.results)) {
          setRecentStudyVisaOffers(data.results);
        } else if (Array.isArray(data)) {
          setRecentStudyVisaOffers(data);
        } else {
          setRecentStudyVisaOffers([]);
        }
        setLoadingRecentStudyVisaOffers(false);
      })
      .catch(() => setLoadingRecentStudyVisaOffers(false));
  }, []);

  // Derive unique countries from institutions
  const countries = Array.from(
    new Set(institutions.map((inst) => inst.country))
  ).filter(Boolean);

  // Filter institutions by selected country
  const filteredInstitutions = selectedCountry
    ? institutions.filter((inst) => inst.country === selectedCountry)
    : institutions;

  // Derive program types from filtered institutions
  const programTypeObjects: { id: string; name: string }[] = Array.from(
    filteredInstitutions.flatMap((inst) =>
      Array.isArray(inst.program_types)
        ? inst.program_types
            .filter((pt: any) => pt && pt.id && pt.name)
            .map((pt: any) => ({ id: String(pt.id), name: pt.name }))
        : []
    )
  ).filter(
    (pt, idx, arr) =>
      pt.id &&
      arr.findIndex((x) => x.id === pt.id) === idx // unique by id
  );

  // NEW: Fetch courses from API whenever institution and program type are selected and change
  useEffect(() => {
    if (selectedInstitution && selectedProgramType) {
      setLoadingCourses(true);
      setCourses([]);
      getCoursesForInstitutionAndProgramType(selectedInstitution, selectedProgramType)
        .then((data) => {
          // data is assumed to be array of courses { id, name }
          setCourses(
            Array.isArray(data)
              ? data.map((course) => ({ id: String(course.id), name: course.name }))
              : []
          );
          setLoadingCourses(false);
        })
        .catch(() => {
          setCourses([]);
          setLoadingCourses(false);
        });
    } else {
      setCourses([]);
    }
  }, [selectedInstitution, selectedProgramType]);

  // Handle form changes
  const handleCountryChange = (e: any) => {
    setSelectedCountry(e.target.value);
    setSelectedInstitution("");
    setSelectedProgramType("");
    setSelectedCourse("");
    setCourses([]);
  };

  const handleInstitutionChange = (e: any) => {
    setSelectedInstitution(e.target.value); // institution id
    setSelectedProgramType("");
    setSelectedCourse("");
    setCourses([]);
  };

  const handleProgramTypeChange = (e: any) => {
    setSelectedProgramType(e.target.value); // program type id
    setSelectedCourse("");
    // Do not reset courses here - effect will handle
  };

  const handleCourseChange = (e: any) => {
    setSelectedCourse(e.target.value);
  };

  // Handle Start Application
  const handleStartApplication = async () => {
    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        country: selectedCountry,
        institution: selectedInstitution,
        program_type: selectedProgramType,
        course_of_study: selectedCourse,
      };

      // Get the latest token from localStorage
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Send POST request to the application endpoint
      const response = await api.post(
        `/app/study-visa-application/`,
        payload,
        { headers }
      );
      const id = response.data?.id;
      if (id) {
        navigate(`/travel/study-visa/continue/${id}`);
      } else {
        alert("Application submitted but no ID returned.");
      }
    } catch (error: any) {
      alert(
        error?.response?.data?.detail ||
          "Failed to submit application. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Helper: get institution name by id
  const getInstitutionName = (id: number | string) => {
    const inst = institutions.find((i) => String(i.id) === String(id));
    return inst?.name || "Unknown Institution";
  };

  // Helper: get institution country by id
  const getInstitutionCountry = (id: number | string) => {
    const inst = institutions.find((i) => String(i.id) === String(id));
    return inst?.country || "Unknown Country";
  };

  // Helper: get program type name by id
  const getProgramTypeName = (id: number | string) => {
    for (const inst of institutions) {
      if (Array.isArray(inst.program_types)) {
        const pt = inst.program_types.find((pt: any) => String(pt.id) === String(id));
        if (pt) return pt.name;
      }
    }
    return "Unknown Program";
  };

  // Helper: get course name by id
  const getCourseName = (id: number | string | null | undefined) => {
    if (!id) return "";
    // Try to find from loaded courses
    const course = courses.find((c) => String(c.id) === String(id));
    if (course) return course.name;
    // Optionally, fallback to any institution
    for (const inst of institutions) {
      if (Array.isArray(inst.courses)) {
        const cObj = inst.courses.find((c: any) => String(c.id) === String(id));
        if (cObj) return cObj.name;
      }
    }
    return "Unknown Course";
  };

  // Helper: get status label from status code
  const getStatusLabel = (status: number | string | null | undefined) => {
    const statusMap: Record<string, string> = {
      "33": "Draft",
      "34": "Submitted",
      "35": "In Review",
      "36": "Approved",
      "37": "Rejected",
    };
    if (status == null) return "Unknown Status";
    return statusMap[String(status)] || String(status);
  };

  // Helper: get program string for recent applications
  const getProgramString = (app: any) => {
    const courseId = app.course_of_study ?? app.course;
    const programTypeName = getProgramTypeName(app.program_type);
    const courseName = getCourseName(courseId);
    if (courseId && courseName && courseName !== "Unknown Course") {
      return `${programTypeName} - ${courseName}`;
    }
    return programTypeName;
  };

  // Tab change handler
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handler for viewing an offer (could be expanded)
  const handleViewOffer = (offerId: string | number) => {
    navigate(`/travel/study-visa/offer/${offerId}`);
  };

  // Handler for "View More" button click, which depends on the current tab
  const handleViewMore = () => {
    if (tabValue === 0) {
      navigate("/travel/study-visa/applications");
    } else if (tabValue === 1) {
      navigate("/travel/study-visa/offers");
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 1, sm: 2, md: 4 },
        py: { xs: 1, sm: 2 },
        width: "100%",
        mx: "auto",
      }}
    >
      <CustomerPageHeader>
        <Typography variant="h4" className="font-bold mb-6">
          Study visa
        </Typography>
      </CustomerPageHeader>

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                    <MenuItem key={inst.id || inst.name} value={inst.id}>
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
            className="flex flex-col items-center justify-center"
            sx={{ height: { xs: 180, sm: 200, md: 220 }, width: "100%" }}
          >
            {loading ? (
              <CircularProgress size={28} />
            ) : (
              <TextField
                select
                fullWidth
                label="Select Program Type"
                value={selectedProgramType}
                onChange={handleProgramTypeChange}
                variant="outlined"
                disabled={programTypeObjects.length === 0}
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
                {programTypeObjects.length === 0 ? (
                  <MenuItem value="" disabled>
                    No program types available
                  </MenuItem>
                ) : (
                  programTypeObjects.map((pt) => (
                    <MenuItem key={pt.id} value={pt.id}>
                      {pt.name}
                    </MenuItem>
                  ))
                )}
              </TextField>
            )}
          </CardContent>
        </Card>

        {/* Course of Study */}
        <Card className="rounded-2xl shadow-md">
          <CardContent
            className="flex flex-col items-center justify-center"
            sx={{ height: { xs: 180, sm: 200, md: 220 }, width: "100%" }}
          >
            {(loading || loadingCourses) ? (
              <CircularProgress size={28} />
            ) : (
              <TextField
                select
                fullWidth
                label="Select Course"
                value={selectedCourse}
                onChange={handleCourseChange}
                variant="outlined"
                disabled={!selectedInstitution || !selectedProgramType || loadingCourses}
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
                {!selectedInstitution || !selectedProgramType ? (
                  <MenuItem value="" disabled>
                    Select institution and program type first
                  </MenuItem>
                ) : courses.length === 0 ? (
                  <MenuItem value="" disabled>
                    No courses available
                  </MenuItem>
                ) : (
                  courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.name}
                    </MenuItem>
                  ))
                )}
              </TextField>
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
          !selectedCountry ||
          !selectedInstitution ||
          !selectedProgramType ||
          !selectedCourse ||
          submitting
        }
        onClick={handleStartApplication}
      >
        {submitting ? <CircularProgress size={24} color="inherit" /> : "Start Application"}
      </Button>

      {/* Tabs for Recent Applications and Recent Study Visa Offers */}
      <Box sx={{ mt: 4, mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="Recent Applications and Recent Study Visa Offers Tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Recent Applications" />
          <Tab label="Recent Study Visa Offers" />
        </Tabs>
      </Box>

      <Box
        sx={{
          overflowX: "auto",
          width: "100%",
          pb: 1,
        }}
      >
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
                    university={getInstitutionName(app.institution)}
                    country={getInstitutionCountry(app.institution)}
                    program={getProgramString(app)}
                    status={getStatusLabel(app.status)}
                  />
                </Box>
              ))
            )}
          </Box>
        )}

        {/* Recent Study Visa Offers Tab */}
        {tabValue === 1 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
            }}
          >
            {loadingRecentStudyVisaOffers ? (
              <Box className="flex items-center justify-center w-full py-8">
                <CircularProgress size={32} />
              </Box>
            ) : recentStudyVisaOffers.length === 0 ? (
              <Typography variant="body2" className="text-gray-500 flex items-center">
                No recent study visa offers found.
              </Typography>
            ) : (
              recentStudyVisaOffers.map((offer: any) => (
                  <OfferCard
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
        <GuideCard title="Study visa Requirements" />
        <GuideCard title="Ultimate guide to study abroad" />
      </div>
    </Box>
  );
};
