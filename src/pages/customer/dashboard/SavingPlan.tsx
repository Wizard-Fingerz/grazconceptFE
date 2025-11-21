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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import api from "../../../services/api";
import { CustomerPageHeader } from "../../../components/CustomerPageHeader";
// --- Charts Imports (using Recharts) ---
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

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

const pieColors = ["#009688", "#1976d2", "#ffc107", "#4caf50", "#ff7043", "#8e24aa", "#00bcd4"];

// Utility functions for frequency calculation
function getDaysDiff(start: string, end: string) {
  // Dates are YYYY-MM-DD or similar
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(
    1,
    Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
  ); // include both start and end day
}
function getWeeksDiff(start: string, end: string) {
  const days = getDaysDiff(start, end);
  return Math.ceil(days / 7);
}
function getMonthsDiff(start: string, end: string) {
  // Compute months between two dates
  const s = new Date(start);
  const e = new Date(end);
  // Months are counted from 0
  return (
    Math.max(
      1,
      e.getFullYear() * 12 +
        e.getMonth() -
        (s.getFullYear() * 12 + s.getMonth()) +
        (e.getDate() >= s.getDate() ? 1 : 0)
    )
  );
}

// Compute deduction amount based on recurrence
function getDeductionInfo({
  isRecurring,
  recurrencePeriod,
  targetAmount,
  startDate,
  endDate,
}: {
  isRecurring: boolean;
  recurrencePeriod: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
}) {
  if (!isRecurring || !recurrencePeriod || !startDate || !endDate || !targetAmount)
    return { label: "", value: null, freqNum: null };
  let freqNum = 1;
  if (recurrencePeriod === "daily") {
    freqNum = getDaysDiff(startDate, endDate);
  } else if (recurrencePeriod === "weekly") {
    freqNum = getWeeksDiff(startDate, endDate);
  } else if (recurrencePeriod === "monthly") {
    freqNum = getMonthsDiff(startDate, endDate);
  }
  if (freqNum <= 0) freqNum = 1;
  const deduction = Math.ceil(targetAmount / freqNum);
  let label = "";
  if (recurrencePeriod === "daily") {
    label = `₦${deduction.toLocaleString()} per day for ${freqNum} days`;
  } else if (recurrencePeriod === "weekly") {
    label = `₦${deduction.toLocaleString()} per week for ${freqNum} weeks`;
  } else if (recurrencePeriod === "monthly") {
    label = `₦${deduction.toLocaleString()} per month for ${freqNum} months`;
  }
  return { label, value: deduction, freqNum };
}

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
  // Cancel modal
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string>("");

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    setError("");
    try {
      const resp = await api.get("/wallet/saving-plans/"); // Adjust endpoint as needed
      setPlans(resp.data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to load savings plans.");
    } finally {
      setLoading(false);
    }
  };

  // --- Handle plan cancellation ---
  const handleCancelRequest = (planId: number) => {
    setCancelling(planId);
    setCancelDialogOpen(true);
    setCancelError("");
  };

  const handleCancelPlan = async () => {
    if (!cancelling) return;
    setCancelError("");
    try {
      await api.post(`/wallet/saving-plans/${cancelling}/cancel/`);
      setCancelDialogOpen(false);
      setCancelling(null);
      fetchPlans();
    } catch (e: any) {
      setCancelError(e?.response?.data?.detail || "Failed to cancel plan.");
    }
  };

  // --- Enhanced CREATE PLAN submit, still works as before ---
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/wallet/saving-plans/", {
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

  // --- Prepare data for Line Chart (Savings Progress Over Time) ---
  // We'll aggregate by created_at date (YYYY-MM-DD), summing all amount_saved for a progressive timeline
  const lineData: { date: string; cumulative: number }[] = [];
  let cumSum = 0;
  [...plans]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .forEach((plan) => {
      cumSum += parseFloat(plan.amount_saved);
      lineData.push({ date: plan.created_at.slice(0, 10), cumulative: cumSum });
    });

  // --- Prepare data for Pie Chart (Plan-wise Contribution) ---
  const pieData =
    plans.length > 0
      ? plans.map((plan) => ({
          name: plan.name,
          value: parseFloat(plan.amount_saved),
        }))
      : [];

  // --- Calculate deduction info for recurring plans ---
  const deductionInfo = getDeductionInfo({
    isRecurring,
    recurrencePeriod,
    targetAmount: parseFloat(targetAmount || "0"),
    startDate,
    endDate,
  });

  // Main dashboard
  return (
    <Box
      sx={{
        px: { xs: 1, sm: 2, md: 4 },
        py: { xs: 1, sm: 2 },
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
      }}
    >      {/* Header */}

      <CustomerPageHeader>
        <Typography variant="h4" className="font-bold mb-2">
          My Savings Dashboard
        </Typography>
        <Typography variant="body1" className="text-gray-700 mb-4">
          Build your savings habit. Create tailored savings plans and watch your financial goals take shape!
        </Typography>
      </CustomerPageHeader>


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
              <Box sx={{ width: '100%', height: 235 }}>
                {lineData && lineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip
                        formatter={(value: any) => `₦${Number(value).toLocaleString()}`}
                        labelFormatter={(label: string) => `Date: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="cumulative"
                        stroke="#1976d2"
                        activeDot={{ r: 6 }}
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#009688", stroke: "#fff", strokeWidth: 2 }}
                        name="Total Saved"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                      height: 195,
                      color: "#bdbdbd",
                      fontWeight: 700,
                      fontSize: 18,
                      background: "#fafbfc",
                      borderRadius: 2,
                      border: "1px dashed #e0e0e0"
                    }}
                  >
                    No data for savings progress.
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box flex={5}>
          <Card sx={{ height: "100%" }}>
            <CardHeader title="Plan-wise Contribution" />
            <CardContent>
              <Box sx={{ width: '100%', height: 235 }}>
                {pieData && pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#1976d2"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} (${percent !== undefined ? (percent * 100).toFixed(0) : 0}%)`
                        }
                      >
                        {pieData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => `₦${Number(value).toLocaleString()}`}
                        />
                      <Legend layout="vertical" align="right" verticalAlign="middle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                      height: 195,
                      color: "#bdbdbd",
                      fontWeight: 700,
                      fontSize: 18,
                      background: "#fafbfc",
                      borderRadius: 2,
                      border: "1px dashed #e0e0e0"
                    }}
                  >
                    No data for plan-wise contribution.
                  </Box>
                )}
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
                      onChange={(e) => {
                        setIsRecurring(e.target.value === "yes");
                        if (e.target.value !== "yes") {
                          setRecurrencePeriod("");
                        }
                      }}
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
                {/* Summary of auto-deduction calculation */}
                {isRecurring && deductionInfo.label && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    <b>Auto-Deduction:</b> {deductionInfo.label}
                  </Alert>
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
                    <TableCell align="center">Action</TableCell>
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
                      <TableCell align="center">
                        {plan.status === "active" && (
                          <>
                            <IconButton
                              aria-label="Cancel Plan"
                              color="error"
                              onClick={() => handleCancelRequest(plan.id)}
                            >
                              <CloseIcon />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
      {/* Cancel Plan Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => {
          setCancelDialogOpen(false);
          setCancelling(null);
        }}
      >
        <DialogTitle>Cancel Savings Plan?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this savings plan? This action can't be undone.
          </Typography>
          {cancelError && (
            <Alert severity="error" sx={{ mt: 2 }}>{cancelError}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCancelDialogOpen(false);
              setCancelling(null);
            }}
          >
            No, keep plan
          </Button>
          <Button
            color="error"
            onClick={handleCancelPlan}
            variant="contained"
          >
            Yes, Cancel Plan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SavingPlan;
