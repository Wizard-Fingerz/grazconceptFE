import React from "react";
import { Box, Card, CardContent, Typography, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import TvIcon from "@mui/icons-material/Tv";
import DataSaverOnIcon from "@mui/icons-material/DataSaverOn";
import SchoolIcon from "@mui/icons-material/School";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";


const services = [
  {
    icon: <PhoneIphoneIcon color="primary" fontSize="large" />,
    title: "Buy Airtime",
    description: "Buy airtime instantly for all networks",
    to: "/services/airtime",
    color: "#e3f2fd",
  },
  {
    icon: <LightbulbOutlinedIcon color="warning" fontSize="large" />,
    title: "Pay Utility & Electricity Bills",
    description: "Pay utility and electricity bills with ease",
    to: "/services/bills",
    color: "#fff3e0",
  },
  {
    icon: <TvIcon sx={{ color: "#9b59b6" }} fontSize="large" />,
    title: "Cable & Internet Renewal",
    description: "Renew your cable and internet subscriptions",
    to: "/services/cable-internet",
    color: "#f3e5f5",
  },
  {
    icon: <DataSaverOnIcon color="success" fontSize="large" />,
    title: "Buy Data Bundle",
    description: "Purchase data bundles at discounted rates",
    to: "/services/data-bundle",
    color: "#e8f5e9",
  },
  {
    icon: <SchoolIcon color="secondary" fontSize="large" />,
    title: "Pay Education & Exam Fees",
    description: "Pay education and exam fees conveniently",
    to: "/services/education-fees",
    color: "#fce4ec",
  },
];

const AirtimeAndBillsHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1400, mx: 'auto' }}>

      <CustomerPageHeader>
        <Typography
          variant="h4"
          className="font-bold mb-6"
          sx={{ display: "flex", alignItems: "center", gap: 1.5, lineHeight: 1.1 }}
        >
          Airtime & Bills Payment
        </Typography>
      </CustomerPageHeader>

      <Typography
        variant="body1"
        mb={3}
        className="text-gray-700"
        sx={{ maxWidth: 600 }}
      >
        Pay for all your essential services in one place. Enjoy instant, secure, and seamless payments for yourself and loved ones.
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
            onClick={() => navigate(service.to)}
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
                Proceed
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default AirtimeAndBillsHome;
