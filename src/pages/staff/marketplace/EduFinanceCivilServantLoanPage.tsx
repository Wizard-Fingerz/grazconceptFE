import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  TextField,
  MenuItem,
  Button,
  LinearProgress,
  Snackbar,
  Alert,
} from "@mui/material";

type LoanProgram = {
  title: string;
  interestRate: string;
  maxAmount: number;
  duration: string;
  description: string;
};

const loanPrograms: LoanProgram[] = [
  {
    title: "EduFinance Student Loan",
    interestRate: "8% per annum",
    maxAmount: 2000000,
    duration: "Up to 24 months",
    description:
      "Tailored for university and college students to cover tuition, accommodation, and learning materials.",
  },
  {
    title: "Civil Servant Loan",
    interestRate: "10% per annum",
    maxAmount: 3000000,
    duration: "Up to 36 months",
    description:
      "Special low-interest loan for verified government employees, repayable through salary deductions.",
  },
  {
    title: "Teacher Empowerment Loan",
    interestRate: "9% per annum",
    maxAmount: 1500000,
    duration: "Up to 18 months",
    description:
      "Support for educators in public or private schools to fund personal or professional development goals.",
  },
];

export default function EduFinanceDashboard() {
  const [program, setProgram] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
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
      setAmount("");
      setProgram("");
    }, 2000);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        EduFinance / Civil Servant Loan Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Apply for educational or civil service-friendly loans with flexible
        repayment and low interest rates.
      </Typography>

      {/* Loan Program List */}
      <Grid container spacing={3}>
        {loanPrograms.map((loan) => (
          <Grid item xs={12} md={4} key={loan.title}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                boxShadow: 2,
                height: "100%",
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {loan.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {loan.description}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2">
                  <strong>Interest Rate:</strong> {loan.interestRate}
                </Typography>
                <Typography variant="body2">
                  <strong>Max Amount:</strong> ₦
                  {loan.maxAmount.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Duration:</strong> {loan.duration}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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
          Apply for a Loan
        </Typography>

        <TextField
          label="Full Name"
          fullWidth
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Email Address"
          type="email"
          fullWidth
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
        />
        <TextField
          select
          label="Select Loan Type"
          fullWidth
          required
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          margin="normal"
        >
          {loanPrograms.map((loan) => (
            <MenuItem key={loan.title} value={loan.title}>
              {loan.title}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Requested Amount (₦)"
          type="number"
          fullWidth
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          margin="normal"
        />

        <Box mt={3}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
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
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Loan application submitted successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
