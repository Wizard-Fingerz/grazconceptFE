import React from "react";
import { Box, Card, CardContent, Typography, Button, Stack } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import LanguageIcon from "@mui/icons-material/Language";
import WorkIcon from "@mui/icons-material/Work";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import { useNavigate } from "react-router-dom";

const services = [
  {
    icon: <SchoolIcon color="primary" fontSize="large" />,
    title: "Tech & Digital Skills",
    description: "Learn tech, coding, data, and AI skills—beginner to advanced.",
    to: "#tech-digital-skills",
    color: "#e3f2fd",
  },
  {
    icon: <LanguageIcon color="success" fontSize="large" />,
    title: "Language & Communication Courses",
    description: "Prepare for IELTS, Duolingo and other language proficiency exams.",
    to: "#language-courses",
    color: "#e8f5e9",
  },
  {
    icon: <WorkIcon color="warning" fontSize="large" />,
    title: "Career & Soft Skills Development",
    description: "Sharpen leadership, CV writing, interview prep, and workplace skills.",
    to: "#career-soft-skills",
    color: "#fff8e1",
  },
  {
    icon: <VideoLibraryIcon sx={{ color: "#9b59b6" }} fontSize="large" />,
    title: "Webinars, Tutorials & Certification",
    description: "Attend online seminars, tutorials and earn certificates.",
    to: "#webinars-certification",
    color: "#f3e5f5",
  },
];

const EducationServicesHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1400, mx: 'auto' }}>
      <CustomerPageHeader>
        <Typography
          variant="h4"
          className="font-bold mb-6"
          sx={{ display: "flex", alignItems: "center", gap: 1.5, lineHeight: 1.1 }}
        >
          Education & Skill Development
        </Typography>
      </CustomerPageHeader>

      <Typography
        variant="body1"
        mb={3}
        className="text-gray-700"
        sx={{ maxWidth: 700 }}
      >
        Access quality courses, certification programs, and expert-led trainings to grow your career, language proficiency, tech knowledge, and essential workplace skills—all in one place.
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={3}
        useFlexGap
        flexWrap="wrap"
        sx={{
          alignItems: "stretch", 
          justifyContent: { xs: "flex-start", sm: "flex-start", md: "flex-start" },
        }}
      >
        {services.map((service) => (
          <Card
            key={service.title}
            onClick={() => {
              if (service.to.startsWith("#")) {
                const section = document.querySelector(service.to);
                if (section) {
                  section.scrollIntoView({ behavior: "smooth" });
                }
              } else {
                navigate(service.to);
              }
            }}
            sx={{
              flex: '1 1 220px',
              minWidth: 220,
              maxWidth: 330,
              background: service.color,
              borderRadius: 3,
              boxShadow: 2,
              cursor: "pointer",
              transition: "box-shadow 0.2s, transform 0.1s",
              "&:hover": {
                boxShadow: 6,
                transform: "translateY(-2px) scale(1.03)",
              },
              mb: { xs: 2, sm: 0 },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  mb: 1,
                  minHeight: 48,
                }}
              >
                {service.icon}
                <Typography variant="h6" sx={{ fontWeight: 700, ml: 2 }}>
                  {service.title}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                {service.description}
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                sx={{
                  mt: 1,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 500,
                }}
                fullWidth
              >
                Learn More
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default EducationServicesHome;
