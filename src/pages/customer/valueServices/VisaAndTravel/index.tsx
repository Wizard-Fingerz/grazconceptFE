import React from "react";
import { Box, Card, CardContent, Typography, Button, Stack } from "@mui/material";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import DescriptionIcon from "@mui/icons-material/Description";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import { useNavigate } from "react-router-dom";

const services = [
  {
    icon: <FindInPageIcon color="primary" fontSize="large" />,
    title: "Visa & Document Review",
    description: "Let an expert review your visa application or travel documents before submission.",
    to: "#visa-review",
    color: "#e3f2fd",
  },
  {
    icon: <EventAvailableIcon color="success" fontSize="large" />,
    title: "Embassy Appointment & Tracking",
    description: "Get appointments with embassies and easily track your application status.",
    to: "#embassy-appointment",
    color: "#e8f5e9",
  },
  {
    icon: <DescriptionIcon color="warning" fontSize="large" />,
    title: "POF Assistance & Document Writing",
    description: "Professional help with Proof of Funds (POF), cover letters, and supporting documents.",
    to: "#pof-assistance",
    color: "#fff8e1",
  },
  {
    icon: <SupportAgentIcon sx={{ color: "#9b59b6" }} fontSize="large" />,
    title: "Travel Insurance & Pre-Departure Guide",
    description: "Travel safely with insurance and get practical guides before you depart.",
    to: "#insurance-predeparture",
    color: "#f3e5f5",
  },
];

const VisaAndTravelHome: React.FC = () => {
  const navigate = useNavigate();

  // If later you have dedicated routes, change navigate(service.to) accordingly
  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1400, mx: 'auto' }}>
      <CustomerPageHeader>
        <Typography
          variant="h4"
          className="font-bold mb-6"
          sx={{ display: "flex", alignItems: "center", gap: 1.5, lineHeight: 1.1 }}
        >
          Visa & Travel Services
        </Typography>
      </CustomerPageHeader>
      
      <Typography
        variant="body1"
        mb={3}
        className="text-gray-700"
        sx={{ maxWidth: 700 }}
      >
        Get expert assistance with your visa application, document review, embassy appointments, and travel preparations. Start your journey confidently with professional guidance at every step.
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
              // In a real app, replace below navigation
              if (service.to.startsWith("#")) {
                // simple scroll to section if present or could anchor
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

export default VisaAndTravelHome;
