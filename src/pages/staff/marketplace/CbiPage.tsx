import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  LinearProgress,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";

type CbiProgram = {
  country: string;
  minimumInvestment: number;
  processingTime: string;
  benefits: string[];
};

const programs: CbiProgram[] = [
  {
    country: "St. Kitts & Nevis",
    minimumInvestment: 150000,
    processingTime: "4–6 months",
    benefits: [
      "Visa-free to 150+ countries",
      "No income tax",
      "Dual citizenship allowed",
    ],
  },
  {
    country: "Dominica",
    minimumInvestment: 100000,
    processingTime: "3–4 months",
    benefits: ["Affordable investment", "Family inclusion", "Stable economy"],
  },
  {
    country: "Grenada",
    minimumInvestment: 200000,
    processingTime: "5–6 months",
    benefits: [
      "E-2 Visa access (USA)",
      "Low tax regime",
      "Attractive Caribbean lifestyle",
    ],
  },
];

export default function CbiDashboard() {
  const [selectedProgram, setSelectedProgram] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [investment, setInvestment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFullName("");
      setEmail("");
      setInvestment("");
      setSelectedProgram("");
    }, 2000);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Citizenship by Investment (CBI)
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Explore investment programs that grant citizenship and apply directly
        through the dashboard.
      </Typography>

      {/* Programs Section */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          mb: 2,
        }}
      >
        {programs.map((program) => (
          <Box
            key={program.country}
            sx={{
              flex: "1 1 300px",
              minWidth: { xs: "100%", md: "calc(33% - 24px)" },
              maxWidth: { xs: "100%", md: "calc(33% - 24px)" },
              boxSizing: "border-box",
              display: "flex",
            }}
          >
            <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 2, width: "100%" }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {program.country}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Minimum Investment: $
                  {program.minimumInvestment.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Processing Time: {program.processingTime}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" fontWeight="medium">
                  Benefits:
                </Typography>
                <ul style={{ marginTop: 8 }}>
                  {program.benefits.map((b) => (
                    <li key={b}>
                      <Typography variant="body2">{b}</Typography>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Application Form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          maxWidth: 500,
          mx: "auto",
          p: 3,
          border: "1px solid #e0e0e0",
          borderRadius: 3,
          boxShadow: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Apply for Citizenship
        </Typography>

        <TextField
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          fullWidth
          required
          margin="normal"
        />

        <TextField
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          margin="normal"
        />

        <TextField
          select
          label="Select Program"
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
          fullWidth
          required
          margin="normal"
        >
          {programs.map((program) => (
            <MenuItem key={program.country} value={program.country}>
              {program.country}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Proposed Investment (USD)"
          type="number"
          value={investment}
          onChange={(e) => setInvestment(e.target.value)}
          fullWidth
          required
          margin="normal"
        />

        <Box mt={3}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ py: 1.2, fontWeight: "bold" }}
          >
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
          {loading && <LinearProgress sx={{ mt: 1 }} />}
        </Box>
      </Box>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Application submitted successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
