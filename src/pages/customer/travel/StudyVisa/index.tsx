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
  ListSubheader,
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

// ApplicationCard and GuideCard remain unchanged...

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

export const GuideCard: React.FC<{ title: string }> = ({ title }) => (
  <Button className="bg-[#f5ebe1] rounded-xl px-6 py-3 font-semibold normal-case shadow-sm hover:bg-[#f3e1d5]">
    {title}
  </Button>
);

export const ApplyStudyVisa: React.FC = () => {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [institutionsRaw, setInstitutionsRaw] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingNext, setFetchingNext] = useState(false);

  const [institutionsNext, setInstitutionsNext] = useState<string | null>(null);
  const [institutionsCount, setInstitutionsCount] = useState<number | null>(null);

  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedInstitution, setSelectedInstitution] = useState<string>("");
  const [selectedProgramType, setSelectedProgramType] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);

  const [tabValue, setTabValue] = useState(0);

  const [recentStudyVisaOffers, setRecentStudyVisaOffers] = useState<any[]>([]);
  const [loadingRecentStudyVisaOffers, setLoadingRecentStudyVisaOffers] = useState(true);

  // Revised: Track full API response for courses to handle both array and paginated object
  const [coursesRaw, setCoursesRaw] = useState<any>(null);
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAllInstitutions()
      .then((data) => {
        let _results = data && data.results ? data.results : Array.isArray(data) ? data : [];
        setInstitutions(_results || []);
        setInstitutionsRaw(data || {});
        setInstitutionsNext(data && data.next ? data.next : null);
        setInstitutionsCount(data && typeof data.count === "number" ? data.count : null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const fetchMoreInstitutions = async () => {
    if (!institutionsNext) return;
    setFetchingNext(true);
    try {
      let resp;
      if (institutionsNext.startsWith("/")) {
        resp = await api.get(institutionsNext);
        resp = resp.data;
      } else {
        const fetchResp = await fetch(institutionsNext, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        });
        resp = await fetchResp.json();
      }
      if (resp && Array.isArray(resp.results)) {
        setInstitutions((prev) => [...prev, ...resp.results]);
        setInstitutionsRaw(resp);
        setInstitutionsNext(resp.next || null);
        setInstitutionsCount(
          typeof resp.count === "number" ? resp.count : institutionsCount
        );
      }
    } finally {
      setFetchingNext(false);
    }
  };

  useEffect(() => {
    setLoadingApplications(true);
    getMyRecentSudyVisaApplicaton()
      .then((data) => {
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

  const countries = Array.from(
    new Set(Array.isArray(institutions) ? institutions.map((inst) => inst.country) : [])
  ).filter(Boolean);

  const filteredInstitutions = selectedCountry
    ? (institutions || []).filter((inst) => inst.country === selectedCountry)
    : institutions || [];

  const programTypeObjects: { id: string; name: string }[] = Array.from(
    (filteredInstitutions || []).flatMap((inst) =>
      Array.isArray(inst.program_types)
        ? inst.program_types
            .filter((pt: any) => pt && pt.id && pt.name)
            .map((pt: any) => ({ id: String(pt.id), name: pt.name }))
        : []
    )
  ).filter(
    (pt, idx, arr) =>
      pt.id &&
      arr.findIndex((x) => x.id === pt.id) === idx
  );

  // --- KEY CHANGE: Robustly handle both paginated and array for courses API response
  useEffect(() => {
    if (selectedInstitution && selectedProgramType) {
      setLoadingCourses(true);
      setCourses([]);
      setCoursesRaw(null);
      getCoursesForInstitutionAndProgramType(selectedInstitution, selectedProgramType)
        .then((data) => {
          setCoursesRaw(data);

          // Defensive: Check if response is a paginated object with .results as array
          if (data && Array.isArray(data.results)) {
            setCourses(data.results.map((course: any) => ({
              id: String(course.id),
              name: course.name
            })));
          }
          // Or if response itself is an array of course objects
          else if (Array.isArray(data)) {
            setCourses(data.map((course: any) => ({
              id: String(course.id),
              name: course.name
            })));
          } else {
            setCourses([]);
          }
          setLoadingCourses(false);
        })
        .catch(() => {
          setCourses([]);
          setCoursesRaw(null);
          setLoadingCourses(false);
        });
    } else {
      setCourses([]);
      setCoursesRaw(null);
    }
  }, [selectedInstitution, selectedProgramType]);

  const handleCountryChange = (e: any) => {
    setSelectedCountry(e.target.value);
    setSelectedInstitution("");
    setSelectedProgramType("");
    setSelectedCourse("");
    setCourses([]);
    setCoursesRaw(null);
  };

  const handleInstitutionChange = (e: any) => {
    setSelectedInstitution(e.target.value);
    setSelectedProgramType("");
    setSelectedCourse("");
    setCourses([]);
    setCoursesRaw(null);
  };

  const handleProgramTypeChange = (e: any) => {
    setSelectedProgramType(e.target.value);
    setSelectedCourse("");
    // Do not reset courses here - effect will handle
  };

  const handleCourseChange = (e: any) => {
    setSelectedCourse(e.target.value);
  };

  const handleSeeMoreInstitutions = () => {
    fetchMoreInstitutions();
  };

  const handleStartApplication = async () => {
    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        country: selectedCountry,
        institution: selectedInstitution,
        program_type: selectedProgramType,
        course_of_study: selectedCourse,
      };

      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

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

  const getInstitutionName = (id: number | string) => {
    const inst = (institutions || []).find((i) => String(i.id) === String(id));
    return inst?.name || "Unknown Institution";
  };

  const getInstitutionCountry = (id: number | string) => {
    const inst = (institutions || []).find((i) => String(i.id) === String(id));
    return inst?.country || "Unknown Country";
  };

  const getProgramTypeName = (id: number | string) => {
    for (const inst of institutions || []) {
      if (Array.isArray(inst.program_types)) {
        const pt = inst.program_types.find((pt: any) => String(pt.id) === String(id));
        if (pt) return pt.name;
      }
    }
    return "Unknown Program";
  };

  // Patch getCourseName to correctly look in paginated and array courses responses
  const getCourseName = (id: number | string | null | undefined) => {
    if (!id) return "";
    // Try loaded courses
    const course = courses.find((c) => String(c.id) === String(id));
    if (course) return course.name;
    // Try raw data if available and it is paginated
    if (coursesRaw && Array.isArray(coursesRaw.results)) {
      const cObj = coursesRaw.results.find((c: any) => String(c.id) === String(id));
      if (cObj) return cObj.name;
    }
    // Fallback: try flattened institution.courses
    for (const inst of institutions || []) {
      if (Array.isArray(inst.courses)) {
        const cObj = inst.courses.find((c: any) => String(c.id) === String(id));
        if (cObj) return cObj.name;
      }
    }
    return "Unknown Course";
  };

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

  const getProgramString = (app: any) => {
    const courseId = app.course_of_study ?? app.course;
    const programTypeName = getProgramTypeName(app.program_type);
    const courseName = getCourseName(courseId);
    if (courseId && courseName && courseName !== "Unknown Course") {
      return `${programTypeName} - ${courseName}`;
    }
    return programTypeName;
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewOffer = (offerId: string | number) => {
    navigate(`/travel/study-visa/offer/${offerId}`);
  };

  const handleViewMore = () => {
    if (tabValue === 0) {
      navigate("/travel/study-visa/applications");
    } else if (tabValue === 1) {
      navigate("/travel/study-visa/offers");
    }
  };

  const renderDestinationMenuItems = () => {
    if (countries.length === 0) {
      return [
        <MenuItem value="" disabled key="no-countries">
          No countries available
        </MenuItem>
      ];
    }
    const menuItems = [
      ...countries.map((country) => (
        <MenuItem key={country} value={country}>
          {country}
        </MenuItem>
      )),
    ];
    if (institutionsNext) {
      menuItems.push(
        <ListSubheader
          disableSticky
          key="see-more-countries"
          style={{
            marginTop: 6,
            paddingTop: 4,
            paddingBottom: 4,
            background: "transparent",
            color: "#7855FF"
          }}
        >
          <Button
            size="small"
            style={{
              color: "#7855FF",
              fontWeight: 600,
              fontSize: "0.93rem",
              margin: 0,
              padding: "6px 2px",
              width: "100%",
              justifyContent: "flex-start",
              textAlign: "left",
              background: "none",
              border: "none",
              minHeight: 0,
            }}
            onClick={handleSeeMoreInstitutions}
            disabled={fetchingNext}
          >
            {fetchingNext ? <CircularProgress size={16} /> : "See more destinations"}
          </Button>
        </ListSubheader>
      );
    }
    return menuItems;
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
                {renderDestinationMenuItems()}
              </TextField>
            )}
            {institutionsCount !== null && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  {`Loaded: ${institutions.length} of ${institutionsCount} institutions`}
                </Typography>
              </Box>
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
              <>
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
                {institutionsRaw && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      {`Current page: ${institutionsRaw.results && Array.isArray(institutionsRaw.results) ? institutionsRaw.results.length : 0}${institutionsRaw.count ? ` / ${institutionsRaw.count}` : ""}`}
                    </Typography>
                  </Box>
                )}
              </>
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
