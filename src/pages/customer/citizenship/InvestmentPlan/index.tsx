import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  LinearProgress,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Tooltip,
  IconButton,
  Avatar,
  CircularProgress,
} from "@mui/material";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DownloadIcon from "@mui/icons-material/Download";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import { getInvestmentPlans, createInvestment, getInvestments } from "../../../../services/citizenshipServices";

// Map plan "iconType"/"slug" to icon and colors
const iconMap = {
  starter: <MonetizationOnOutlinedIcon sx={{ fontSize: 34, color: "#3f51b5" }} />,
  growth: <TrendingUpOutlinedIcon sx={{ fontSize: 34, color: "#00bfae" }} />,
  elite: <CalendarMonthOutlinedIcon sx={{ fontSize: 34, color: "#f9a825" }} />,
  blue: <MonetizationOnOutlinedIcon sx={{ fontSize: 34, color: "#2587e7" }} />,
};
const colorMap: Record<string, string> = {
  starter: "#3f51b5",
  growth: "#00bfae",
  elite: "#f9a825",
  blue: "#2587e7", // Custom color per sample data
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// NGN currency formatter (Nigerian Naira)
function formatNGN(amount: number | undefined | null): string {
  if (amount === null || amount === undefined) return "₦0";
  return `₦${amount.toLocaleString("en-NG")}`;
}

const InvestmentChart: React.FC<{ progress: number; color?: string }> = ({ progress, color }) => (
  <Box sx={{ px: 2, pt: 1, pb: 1.5 }}>
    <Typography variant="body2" mb={0.5} color="textSecondary">
      Investment Progress
    </Typography>
    <LinearProgress
      variant="determinate"
      value={progress}
      sx={{
        height: 14,
        borderRadius: 2,
        backgroundColor: (theme) => theme.palette.grey[300],
        "& .MuiLinearProgress-bar": {
          backgroundColor: color || "#1976d2"
        },
      }}
    />
    <Stack direction="row" justifyContent="space-between" mt={1}>
      <Typography variant="caption" color="text.secondary">Start</Typography>
      <Typography variant="caption" color="text.secondary">{progress}%</Typography>
      <Typography variant="caption" color="text.secondary">Maturity</Typography>
    </Stack>
  </Box>
);

// Types for API investment packages
type InvestmentPackage = {
  id: string | number;
  name: string;
  description: string;
  price: number;
  roi: string;
  period: string;
  progress?: number;
  withdrawAvailable: boolean;
  benefits: string[];
  warning?: string | null;
  docsUrl?: string;
  slug?: string;
  iconType?: string;
  color?: string;
};

// Types for API user investments
type UserInvestment = {
  id: string | number;
  plan: string;
  invested: number;
  roi: number;
  startDate: string;
  maturity: string;
  withdrawable: boolean;
  nextWithdraw: string;
};

const PlanOverviewDialog: React.FC<{
  open: boolean;
  pkg: InvestmentPackage | null;
  onClose: () => void;
  onStartInvest: () => void;
}> = ({ open, pkg, onClose, onStartInvest }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>
      {pkg?.name}
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <MoreVertIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent dividers>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        {/* icon */}
        {pkg ? resolvePlanIcon(pkg) : null}
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>{pkg?.name}</Typography>
          <Typography variant="body2">{pkg?.description}</Typography>
        </Box>
      </Stack>
      <Divider sx={{ my: 1 }} />
      <Stack direction="row" spacing={3} mb={2}>
        <Box>
          <Typography variant="caption" color="text.secondary">Price</Typography>
          <Typography fontWeight={700}>{formatNGN(pkg?.price)}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">ROI</Typography>
          <Typography fontWeight={700}>{pkg?.roi}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Period</Typography>
          <Typography fontWeight={700}>{pkg?.period}</Typography>
        </Box>
      </Stack>
      <InvestmentChart progress={pkg?.progress ?? 0} color={pkg ? resolvePlanColor(pkg) : undefined} />
      <Box mt={2}>
        <Typography variant="caption" sx={{ fontWeight: 500 }}>Benefits:</Typography>
        <ul style={{ margin: "6px 0 0 20px", padding: 0 }}>
          {pkg?.benefits?.map((b, i) => (
            <li key={i} style={{ fontSize: 13, marginBottom: 2 }}>{b}</li>
          ))}
        </ul>
      </Box>
      <Divider sx={{ my: 2 }} />
      {pkg?.warning && <Alert severity="warning" sx={{ mb: 1 }}>{pkg.warning}</Alert>}
      {pkg?.docsUrl &&
        <Button
          component="a"
          href={pkg?.docsUrl}
          startIcon={<DownloadIcon />}
          color="secondary"
          sx={{ mt: 1 }}
          target="_blank"
        >
          Download Plan Details
        </Button>
      }
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="inherit" variant="text">Cancel</Button>
      <Button onClick={onStartInvest} color="primary" variant="contained" startIcon={<ArrowForwardIcon />}>
        Invest Now
      </Button>
    </DialogActions>
  </Dialog>
);

const NewInvestmentDialog: React.FC<{
  open: boolean;
  pkg: InvestmentPackage | null;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  loading?: boolean;
}> = ({ open, pkg, onClose, onSubmit, loading }) => {
  const [amount, setAmount] = useState(pkg?.price || 0);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setAmount(pkg?.price || 0);
    setError(null);
  }, [open, pkg]);

  function handleSubmit() {
    if (!amount || amount < (pkg?.price || 0)) {
      setError(`Minimum amount is ${formatNGN(pkg?.price)}`);
    } else {
      setError(null);
      onSubmit(amount);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Start Investment</DialogTitle>
      <DialogContent>
        <Typography mb={1}>
          You're starting the <b>{pkg?.name}</b>.<br />
          Enter your investment amount:
        </Typography>
        <TextField
          type="number"
          value={amount}
          fullWidth
          label="Amount (NGN)"
          onChange={e => setAmount(Number(e.target.value))}
          InputProps={{ inputProps: { min: pkg?.price || 0 } }}
          error={!!error}
          helperText={error}
          sx={{ my: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={22} /> : "Confirm & Start"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const MyInvestmentCard: React.FC<{ inv: UserInvestment }> = ({ inv }) => (
  <Card sx={{ p: 2, borderRadius: 2, boxShadow: 1, mb: 2, bgcolor: "#fbfbfc" }}>
    <Stack direction="row" alignItems="center" spacing={2}>
      <Avatar sx={{ bgcolor: "#e7f1fc", color: "#1976d2", width: 48, height: 48 }}>
        <TrendingUpOutlinedIcon />
      </Avatar>
      <Box flex={1}>
        <Typography fontWeight={700}>{inv.plan}</Typography>
        <Typography variant="body2" color="text.secondary">
          Invested: <b>{formatNGN(inv.invested)}</b> | ROI: {formatNGN(inv.roi)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {`Date: ${formatDate(inv.startDate)} - ${formatDate(inv.maturity)}`}
        </Typography>
        <LinearProgress value={70} variant="determinate" sx={{ my: 1, height: 8, borderRadius: 1 }} />
      </Box>
      <Tooltip title={inv.withdrawable ? "Available" : "Locked until maturity"}>
        <Chip
          label={inv.withdrawable ? "Withdraw" : "Locked"}
          color={inv.withdrawable ? "success" : "warning"}
          icon={<MonetizationOnOutlinedIcon />}
          size="small"
        />
      </Tooltip>
    </Stack>
  </Card>
);

const AnalyticsWidget: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <Box sx={{
    borderRadius: 2,
    bgcolor: "#fff",
    p: 2.3,
    boxShadow: 1,
    display: "flex",
    alignItems: "center",
    minWidth: 160,
  }}>
    <Box sx={{ mr: 2 }}>{icon}</Box>
    <Box>
      <Typography fontWeight={600} variant="subtitle2">{label}</Typography>
      <Typography variant="h6" sx={{ color }}>
        {typeof value === "number" ? formatNGN(value) : value}
      </Typography>
    </Box>
  </Box>
);

// Helper function for icon and color - expanded to support "blue"
function resolvePlanIcon(pkg: Partial<InvestmentPackage>): React.ReactNode {
  const key = (pkg.slug || pkg.iconType || pkg.name || pkg.color || "").toLowerCase();
  if (key.includes("starter")) return iconMap.starter;
  if (key.includes("elite")) return iconMap.elite;
  if (key.includes("growth")) return iconMap.growth;
  if (key.includes("blue")) return iconMap.blue;
  return <MonetizationOnOutlinedIcon sx={{ fontSize: 34, color: "#1976d2" }} />;
}
function resolvePlanColor(pkg: Partial<InvestmentPackage>): string {
  const key = (pkg.slug || pkg.iconType || pkg.name || pkg.color || "").toLowerCase();
  if (key.includes("starter")) return colorMap.starter;
  if (key.includes("elite")) return colorMap.elite;
  if (key.includes("growth")) return colorMap.growth;
  if (key.includes("blue")) return colorMap.blue;
  return pkg.color || "#1976d2";
}

// Utility to handle both array and object API shape, and map to UI's InvestmentPackage
function mapApiPlan(plan: any): InvestmentPackage {
  let benefits: string[] = [];
  if (Array.isArray(plan.benefits) && plan.benefits.length > 0 && typeof plan.benefits[0] === "object" && "text" in plan.benefits[0]) {
    benefits = [...plan.benefits]
      .sort((a, b) => (typeof a.order === "number" && typeof b.order === "number") ? a.order - b.order : 0)
      .map((b) => b.text);
  } else if (Array.isArray(plan.benefits)) {
    benefits = plan.benefits;
  }
  let price = plan.price;
  if (typeof price === "string") price = parseFloat(price);
  let roi: string;
  if (plan.roi_percentage) {
    roi = `${parseFloat(plan.roi_percentage)}%`;
  } else if (typeof plan.roi === "number" || (typeof plan.roi === "string" && plan.roi.trim().endsWith("%"))) {
    roi = plan.roi.toString();
  } else {
    roi = plan.roi ? `${plan.roi}` : "";
  }
  let period = plan.period;
  if (plan.period_months) {
    period = `${plan.period_months} months`;
  } else if (!period) {
    period = "";
  }

  // Backend conventions: snake_case, frontend: camelCase
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price: price ?? 0,
    roi,
    period,
    progress: typeof plan.progress === "number" ? plan.progress : 0,
    withdrawAvailable: 'withdraw_available' in plan ? !!plan.withdraw_available : (plan.withdrawAvailable ?? false),
    benefits,
    warning: plan.warning_note ?? plan.warning ?? null,
    docsUrl: plan.docs_url ?? plan.docsUrl,
    slug: plan.slug,
    iconType: plan.iconType || plan.slug || plan.name || plan.color,
    color: (plan.color && colorMap[plan.color.toLowerCase()]) ? colorMap[plan.color.toLowerCase()] : undefined,
  };
}

// Map API user investment object to UserInvestment type for our UI
// IMPORTANT: Fix rendering bug for `plan` being an object in API response
function mapApiUserInvestment(inv: any): UserInvestment {
  // If `inv.plan` is an object, use values from it.
  let planName = inv.plan_name;
  let roi = inv.roi;
  let invested = inv.amount;
  // If plan is object (not id string or number), extract info from object itself.
  if (inv.plan && typeof inv.plan === "object" && inv.plan !== null) {
    planName = inv.plan.name || planName;
    // Fallback: try to parse ROI from roi_percentage if not present
    if (typeof inv.plan.roi_percentage === "string" || typeof inv.plan.roi_percentage === "number") {
      roi = typeof inv.plan.roi_percentage === "string"
        ? (parseFloat(inv.plan.roi_percentage) / 100) * parseFloat(inv.amount || "0")
        : (inv.plan.roi_percentage / 100) * parseFloat(inv.amount || "0");
    }
    // Amount, roi, price are all strings - parse
    invested = typeof inv.amount === "string" ? parseFloat(inv.amount) : inv.amount ?? 0;
  }
  // Also support case where ROI is stringified amount, or use roi_amount (from sample JSON)
  let roiAmount: number = 0;
  if (typeof inv.roi === "string") {
    roiAmount = parseFloat(inv.roi);
  } else if (typeof roi === "number") {
    roiAmount = roi;
  }
  if (inv.roi_amount) {
    roiAmount = typeof inv.roi_amount === "string" ? parseFloat(inv.roi_amount) : inv.roi_amount;
  }

  return {
    id: inv.id,
    plan: planName ?? (typeof inv.plan === "object" && inv.plan?.name ? inv.plan.name : inv.plan ?? ""),
    invested: typeof invested === "string" ? parseFloat(invested) : invested ?? 0,
    roi: roiAmount,
    startDate: inv.start_date ?? inv.startDate ?? "",
    maturity: inv.maturity_date ?? inv.maturity ?? "",
    withdrawable:
      "withdrawable" in inv ? !!inv.withdrawable
        : "can_withdraw" in inv ? !!inv.can_withdraw
        : "is_withdrawable" in inv ? !!inv.is_withdrawable
        : typeof inv.plan === "object" && typeof inv.plan.withdraw_available !== "undefined"
          ? !!inv.plan.withdraw_available
          : false,
    nextWithdraw: inv.next_withdraw_date ?? inv.nextWithdraw ?? "",
  };
}

// Utility: calculate start, maturity, and next withdraw date (ISO format) based on today and period string
function getInvestmentDates(periodString: string): {
  start_date: string,
  maturity_date: string,
  next_withdraw_date: string,
} {
  // Expect periodString like "6 months" or "12 months"
  const durationMonthsMatch = periodString.match(/(\d+)\s*month/);
  const months = durationMonthsMatch ? parseInt(durationMonthsMatch[1]) : 0;

  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const maturityDate = new Date(startDate);
  maturityDate.setMonth(maturityDate.getMonth() + months);

  // Assume next_withdraw_date is one day after maturity (adjust as needed)
  const nextWithdrawDate = new Date(maturityDate);
  nextWithdrawDate.setDate(maturityDate.getDate() + 1);

  // return ISO date strings
  return {
    start_date: startDate.toISOString().slice(0, 10),
    maturity_date: maturityDate.toISOString().slice(0, 10),
    next_withdraw_date: nextWithdrawDate.toISOString().slice(0, 10),
  };
}

const InvestmentPlanPage: React.FC = () => {
  const [investmentPackages, setInvestmentPackages] = useState<InvestmentPackage[]>([]);
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingInvestments, setLoadingInvestments] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [planDialog, setPlanDialog] = useState<{ open: boolean, pkg: InvestmentPackage | null }>({
    open: false, pkg: null
  });
  const [investDialog, setInvestDialog] = useState<{ open: boolean, pkg: InvestmentPackage | null }>({
    open: false, pkg: null
  });
  const [showSuccess, setShowSuccess] = useState(false);

  // Add local loading for submitting investment
  const [investLoading, setInvestLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getInvestmentPlans()
      .then((resp: any) => {
        let rawList = Array.isArray(resp) ? resp : (resp?.results ?? []);
        if (!Array.isArray(rawList)) {
          setError("No investment plan data available.");
          setLoading(false);
          return;
        }
        const prepared = rawList
          .filter(item => item && (item.name || item.id))
          .map(mapApiPlan)
          .map((plan) => ({
            ...plan,
            color: plan.color || resolvePlanColor(plan),
          }));
        setInvestmentPackages(prepared);
        setLoading(false);
        setError(null);
      })
      .catch(() => {
        setError("Failed to load investment packages.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setLoadingInvestments(true);
    getInvestments()
      .then((resp: any) => {
        // Accept both {results: [...]} (pagination) and straight arrays
        let rawList = Array.isArray(resp) ? resp : (resp?.results ?? []);
        if (!Array.isArray(rawList)) {
          setUserInvestments([]);
          setLoadingInvestments(false);
          return;
        }
        const result = rawList
          .filter(item =>
            item && (
              (typeof item.plan === "object" && item.plan && item.plan.name)
              || item.plan_name
              || typeof item.plan === "string"
              || typeof item.plan === "number"
              || item.id
            )
          )
          .map(mapApiUserInvestment);
        setUserInvestments(result);
        setLoadingInvestments(false);
      })
      .catch(() => {
        setUserInvestments([]);
        setLoadingInvestments(false);
      });
  }, [showSuccess]);

  const totalInvested = userInvestments.reduce((acc, inv) => acc + (inv.invested || 0), 0);
  const totalROI = userInvestments.reduce((acc, inv) => acc + (inv.roi || 0), 0);
  const nextWithdraw =
    userInvestments
      .filter(i => !!i.nextWithdraw)
      .map(i => i.nextWithdraw)
      .sort()[0];

  const cardBg = "#fff";
  const textPrimary = "#141828";
  const textSecondary = "#667085";

  function handlePlanSelect(idx: number) {
    setActiveIndex(idx);
    setPlanDialog({ open: true, pkg: investmentPackages[idx] });
  }
  function handleStartInvest() {
    setInvestDialog({ open: true, pkg: planDialog.pkg });
    setPlanDialog({ open: false, pkg: null });
  }

  async function handleSubmitInvestment(amount: number) {
    if (!investDialog.pkg) return;
    setInvestLoading(true);
    setError(null);

    try {
      // Compute required dates and build full payload for investment creation
      const { start_date, maturity_date, next_withdraw_date } = getInvestmentDates(investDialog.pkg.period);

      // Send the required fields per new requirements
      await createInvestment({
        plan_id: investDialog.pkg.id,
        amount: amount,
        start_date: start_date,
        maturity_date: maturity_date,
        next_withdraw_date: next_withdraw_date,
      });

      setInvestDialog({ open: false, pkg: null });
      setShowSuccess(true);
      // Investments will refetch due to [showSuccess] being a dep of useEffect
    } catch (err: any) {
      setError(err?.message || "Failed to start investment.");
    }
    setInvestLoading(false);
  }

  const getResponsiveColumns = () => ({
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      sm: "repeat(2, 1fr)",
      md: "repeat(3, 1fr)"
    },
    gap: (theme: any) => theme.spacing(4),
    mb: 3,
  });

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
        <Typography variant="h4" className="font-bold mb-2">
          Investment Plans
        </Typography>
        <Typography variant="body1" className="text-gray-700 mb-4">
          Invest in our solution through one of our curated packages. Track returns, view history, and manage your portfolio effortlessly.
        </Typography>
      </CustomerPageHeader>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      {/* Loading State */}
      {loading ? (
        <Box display="flex" alignItems="center" justifyContent="center" minHeight={300}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={getResponsiveColumns()}>
          {investmentPackages.map((pkg, idx) => (
            <Box key={pkg.id || pkg.name} sx={{ width: "100%" }}>
              <Card
                sx={{
                  background: cardBg,
                  border: (activeIndex === idx)
                    ? `3px solid ${resolvePlanColor(pkg)}`
                    : "1px solid #ececec",
                  borderRadius: 3,
                  boxShadow: activeIndex === idx ? 6 : 2,
                  transition: "box-shadow .2s, border .2s",
                  position: "relative",
                  cursor: "pointer",
                  minHeight: 380,
                  "&:hover": { boxShadow: 12 },
                }}
                onClick={() => handlePlanSelect(idx)}
                aria-label={`View details for: ${pkg.name}`}
              >
                {/* Plan Icon */}
                <Box
                  sx={{
                    position: "absolute",
                    right: 16,
                    top: 14,
                  }}
                >
                  {resolvePlanIcon(pkg)}
                </Box>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} color={resolvePlanColor(pkg)} gutterBottom>
                    {pkg.name}
                  </Typography>
                  <Typography variant="body2" color={textSecondary} mb={0.9}>
                    {pkg.description}
                  </Typography>
                  <Divider sx={{ my: 1.3 }} />
                  <Stack direction="row" alignItems="center" spacing={2} mb={1.3}>
                    <Box>
                      <Typography variant="caption" color={textSecondary}>
                        Price
                      </Typography>
                      <Typography fontWeight={700} color={textPrimary}>{formatNGN(pkg.price)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color={textSecondary}>
                        ROI
                      </Typography>
                      <Typography fontWeight={700} color={textPrimary}>{pkg.roi}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color={textSecondary}>
                        Period
                      </Typography>
                      <Typography fontWeight={700} color={textPrimary}>{pkg.period}</Typography>
                    </Box>
                  </Stack>
                  <InvestmentChart progress={pkg.progress ?? 0} color={resolvePlanColor(pkg)} />
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="caption" sx={{ fontWeight: 500 }} color={textPrimary}>Benefits:</Typography>
                  <ul style={{ margin: "6px 0 0 20px", padding: 0 }}>
                    {(pkg.benefits || []).map((b, i) => (
                      <li key={i} style={{ fontSize: 13, marginBottom: 2, color: textSecondary }}>{b}</li>
                    ))}
                  </ul>
                </CardContent>
                <CardActions sx={{ flexDirection: "column", alignItems: "stretch", p: 2, pt: 0, gap: 1 }}>
                  <Button
                    variant={activeIndex === idx ? "contained" : "outlined"}
                    sx={{
                      bgcolor: activeIndex === idx ? resolvePlanColor(pkg) : undefined,
                      color: activeIndex === idx ? "#fff" : undefined,
                    }}
                    color="primary"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlanDialog({ open: true, pkg });
                    }}
                  >
                    {activeIndex === idx
                      ? "Selected"
                      : "View & Invest"}
                    <ArrowForwardIcon sx={{ ml: 1, fontSize: 18 }} />
                  </Button>
                  <Button
                    variant="text"
                    color="secondary"
                    fullWidth
                    disabled={!pkg.withdrawAvailable}
                    startIcon={<MonetizationOnOutlinedIcon />}
                    sx={{ opacity: pkg.withdrawAvailable ? 1 : 0.7 }}
                    onClick={e => e.stopPropagation()}
                  >
                    Withdraw {pkg.withdrawAvailable ? "" : "(Locked)"}
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {/* Dialogs */}
      <PlanOverviewDialog
        open={planDialog.open}
        pkg={planDialog.pkg}
        onClose={() => setPlanDialog({ open: false, pkg: null })}
        onStartInvest={handleStartInvest}
      />
      <NewInvestmentDialog
        open={investDialog.open}
        pkg={investDialog.pkg}
        onClose={() => setInvestDialog({ open: false, pkg: null })}
        onSubmit={handleSubmitInvestment}
        loading={investLoading}
      />
      <Snackbar
        open={showSuccess}
        autoHideDuration={3500}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          icon={false}
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ minWidth: 250 }}
        >
          Investment started successfully!
        </Alert>
      </Snackbar>

      {/* Analytics Section */}
      <Box mt={6} borderRadius={4} bgcolor={cardBg} boxShadow={2} p={3}>
        <Typography fontWeight={600} variant="h6" mb={1.4} color={textPrimary}>
          Dashboard Analytics
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          alignItems="center"
          justifyContent="space-between"
          divider={<Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />}
          mb={3}
        >
          <AnalyticsWidget
            label="Total Invested"
            value={totalInvested}
            color="#1565c0"
            icon={<MonetizationOnOutlinedIcon sx={{ color: "#1565c0", fontSize: 28 }} />}
          />
          <AnalyticsWidget
            label="Cumulative ROI"
            value={totalROI}
            color="#f9a825"
            icon={<TrendingUpOutlinedIcon sx={{ color: "#f9a825", fontSize: 28 }} />}
          />
          <AnalyticsWidget
            label="Next Withdraw"
            value={nextWithdraw ? formatDate(nextWithdraw) : "N/A"}
            color="#009688"
            icon={<CalendarMonthOutlinedIcon sx={{ color: "#009688", fontSize: 28 }} />}
          />
        </Stack>
        {/* Summary */}
        <Box>
          <Typography fontWeight={600} mb={1} color={textPrimary}>My Investments</Typography>
          {loadingInvestments ? (
            <Box display="flex" alignItems="center" justifyContent="center" minHeight={70}>
              <CircularProgress size={22} />
            </Box>
          ) : userInvestments.length ? (
            userInvestments.map((inv, i) => <MyInvestmentCard inv={inv} key={inv.id || i} />)
          ) : (
            <Typography color={textSecondary} variant="body2">No investments yet.</Typography>
          )}
        </Box>
      </Box>
      <Typography
        variant="caption"
        color={textSecondary}
        sx={{ mt: 5, display: "block", textAlign: "center" }}
      >
        Withdrawals become available once the investment period is completed for each plan. View plan documents for complete policy details.
      </Typography>
    </Box>
  );
};

export default InvestmentPlanPage;
