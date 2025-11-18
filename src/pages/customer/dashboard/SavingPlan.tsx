import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Stack,
} from "@mui/material";
import { Pie, Line } from "react-chartjs-2";
// Chart.js modules for charts support:
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import api from "../../../services/api";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

type SavingsPlan = {
  id: number;
  name: string;
  target_amount: string;
  amount_saved: string;
  currency: string;
  start_date: string;
  end_date: string;
  is_recurring: boolean;
  recurrence_period: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  meta?: any;
};

const recurrencePeriods = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const statusColor = (status: string) => {
  switch (status) {
    case "active":
      return "success";
    case "completed":
      return "primary";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

const SavingPlan: React.FC = () => {
  // Form states
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePeriod, setRecurrencePeriod] = useState("");
  // Data
  const [loading, setLoading] = useState<boolean>(true);
  const [plans, setPlans] = useState<SavingsPlan[]>([]);
  const [error, setError] = useState<string>("");
  const [creating, setCreating] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    setError("");
    try {
      const resp = await api.get("/wallet/savings-plans/"); // Adjust endpoint as needed
      setPlans(resp.data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to load savings plans.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/wallet/savings-plans/", {
        name,
        target_amount: targetAmount,
        currency,
        start_date: startDate,
        end_date: endDate,
        is_recurring: isRecurring,
        recurrence_period: isRecurring ? recurrencePeriod : null,
      });
      setSuccess("Savings plan created successfully!");
      setName("");
      setTargetAmount("");
      setCurrency("NGN");
      setStartDate("");
      setEndDate("");
      setIsRecurring(false);
      setRecurrencePeriod("");
      fetchPlans();
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to create savings plan.");
    }
    setCreating(false);
  };

  // Chart data processing
  const totalSaved = plans.reduce((sum, item) => sum + parseFloat(item.amount_saved), 0);
  const totalTarget = plans.reduce((sum, item) => sum + parseFloat(item.target_amount), 0);

  const pieData = {
    labels: plans.map((p) => p.name),
    datasets: [
      {
        data: plans.map((p) => parseFloat(p.amount_saved)),
        backgroundColor: [
          "#009688", "#00bcd4", "#1976d2", "#4caf50", "#ffc107", "#f44336", "#7c4dff", "#ec407a",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare line data for savings over time (mock if not available)
  const lineDates = [...Array(7).keys()].map(i => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().slice(0, 10);
  });

  const aggregateByDate: { [date: string]: number } = {};
  plans.forEach((p) => {
    // Simulate "amount_saved" per date spread linearly between start and end
    if (p.start_date && p.end_date) {
      const s = new Date(p.start_date);
      const e = new Date(p.end_date);
      const days = Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
      for (let d = 0; d < days; d++) {
        const currDate = new Date(s);
        currDate.setDate(currDate.getDate() + d);
        const dayStr = currDate.toISOString().slice(0, 10);
        // Uniform distribution
        const amount = parseFloat(p.amount_saved) / days;
        aggregateByDate[dayStr] = (aggregateByDate[dayStr] || 0) + amount;
      }
    }
  });
  const lineData = {
    labels: lineDates,
    datasets: [
      {
        label: "Total Saved",
        data: lineDates.map(date => Math.round((aggregateByDate[date] || 0) * 100) / 100),
        borderColor: "#1976d2",
        backgroundColor: "rgba(25, 118, 210, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Main dashboard
  return (
    <Box sx={{ px: { xs: 1, sm: 3, md: 6 }, pt: 3, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Typography variant="h4" fontWeight={700} color="primary" mb={1}>
        My Savings Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Build your savings habit. Create tailored savings plans and watch your financial goals take shape!
      </Typography>

      {/* Summary cards & graphs */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        sx={{ mb: 3 }}
        useFlexGap
      >
        <Box flex={1}>
          <Card sx={{ boxShadow: "0 2px 10px 0 #e3e4ee" }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Saved
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#009688" }}>
                ₦{totalSaved.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box flex={1}>
          <Card sx={{ boxShadow: "0 2px 10px 0 #e3e4ee" }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Target
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#1976d2" }}>
                ₦{totalTarget.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box flex={1}>
          <Card sx={{ boxShadow: "0 2px 10px 0 #e3e4ee" }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Active Plans
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#4caf50" }}>
                {plans.filter((p) => p.status === "active").length}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* Charts Row */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        sx={{ mb: 2 }}
        useFlexGap
      >
        <Box flex={7}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Savings Progress Over Time" />
            <CardContent>
              <Box sx={{ height: 230 }}>
                <Line data={lineData} options={{ plugins: { legend: { display: false } } }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box flex={5}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Plan-wise Contribution" />
            <CardContent>
              <Box sx={{ height: 230 }}>
                <Pie data={pieData} options={{ plugins: { legend: { position: "bottom" } } }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* Create plan form */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        sx={{ mb: 2, mt: 2 }}
        useFlexGap
        alignItems="stretch"
      >
        <Box flex={6}>
          <Card>
            <CardHeader title="Create New Savings Plan" sx={{ background: "#f7f8fa" }} />
            <CardContent>
              {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 1 }}>{success}</Alert>}
              <Box component="form" onSubmit={handleCreate}>
                <TextField
                  fullWidth
                  label="Plan Name"
                  required
                  margin="normal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Target Amount (₦)"
                  type="number"
                  required
                  margin="normal"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  inputProps={{ min: 0 }}
                />
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ width: '100%' }}
                >
                  <Box flex={1}>
                    <TextField
                      fullWidth
                      label="Currency"
                      margin="normal"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      select
                    >
                      <MenuItem value="NGN">NGN</MenuItem>
                      <MenuItem value="USD">USD</MenuItem>
                    </TextField>
                  </Box>
                  <Box flex={1}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      margin="normal"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </Box>
                </Stack>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ width: '100%' }}
                >
                  <Box flex={1}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      margin="normal"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </Box>
                  <Box flex={1}>
                    <TextField
                      fullWidth
                      label="Recurring?"
                      margin="normal"
                      select
                      value={isRecurring ? "yes" : "no"}
                      onChange={(e) => setIsRecurring(e.target.value === "yes")}
                    >
                      <MenuItem value="no">No</MenuItem>
                      <MenuItem value="yes">Yes</MenuItem>
                    </TextField>
                  </Box>
                </Stack>
                {isRecurring && (
                  <TextField
                    fullWidth
                    label="Recurrence Period"
                    margin="normal"
                    select
                    value={recurrencePeriod}
                    onChange={(e) => setRecurrencePeriod(e.target.value)}
                    required
                  >
                    {recurrencePeriods.map((period) => (
                      <MenuItem key={period.value} value={period.value}>
                        {period.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={creating}
                  sx={{ mt: 2, fontWeight: 700, borderRadius: 2, boxShadow: "0 2px 8px #e0e6f7" }}
                  fullWidth
                  size="large"
                >
                  {creating ? <CircularProgress size={22} color="inherit" /> : "Create Plan"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box flex={6} display="flex" alignItems="center">
          <Box width="100%" px={2}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Start your next goal <span role="img" aria-label="target">🎯</span>
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Whether you’re saving for school, a new gadget, or an emergency fund, create a plan that fits your needs!
            </Typography>
            <Box
              sx={{
                background: "linear-gradient(90deg,#009688,#1976d2 80%)",
                borderRadius: 3,
                px: 3,
                py: 2,
                mt: 2,
                boxShadow: "0 0 10px #e0e0e0",
                color: "#fff",
              }}
            >
              <Typography variant="h6" fontWeight={700}>Your Money, Your Goals!</Typography>
            </Box>
          </Box>
        </Box>
      </Stack>

      {/* Table */}
      <Card sx={{ my: 3, boxShadow: "0 2px 10px 0 #e3e4ee" }}>
        <CardHeader title="Savings Plans History" sx={{ background: "#f7f8fa" }} />
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : plans.length === 0 ? (
            <Typography variant="body2" color="text.secondary">You have not created any savings plans yet.</Typography>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Plan Name</TableCell>
                    <TableCell>Saved</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Recurring</TableCell>
                    <TableCell>Start</TableCell>
                    <TableCell>End</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <Typography fontWeight={700}>{plan.name}</Typography>
                      </TableCell>
                      <TableCell>₦{parseFloat(plan.amount_saved).toLocaleString()}</TableCell>
                      <TableCell>₦{parseFloat(plan.target_amount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={plan.status[0].toUpperCase() + plan.status.slice(1)}
                          color={statusColor(plan.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {plan.is_recurring ? (
                          <Chip label={plan.recurrence_period} size="small" color="secondary" />
                        ) : (
                          <span>One-time</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {plan.start_date}
                      </TableCell>
                      <TableCell>
                        {plan.end_date}
                      </TableCell>
                      <TableCell>
                        {plan.created_at.slice(0, 10)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SavingPlan;
