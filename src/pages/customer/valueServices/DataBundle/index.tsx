import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  TextField,
  InputAdornment,
  Avatar,
  Fade,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from "@mui/material";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import api from "../../../../services/api";

/**
 * Extended data bundles with category
 */
type PlanCategory = "daily" | "weekly" | "monthly" | "quarterly" | "others";
const categoryLabels: Record<PlanCategory, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "3 Months",
  others: "Others",
};

const dataProviders: {
  label: string;
  value: string;
  logo: string;
  accent?: string;
  plans: {
    label: string;
    value: string;
    amount: number;
    data: string;
    category: PlanCategory;
  }[];
}[] = [
  {
    label: "MTN Data",
    value: "mtn",
    logo: "/assets/networks/mtn.png",
    accent: "#fae300",
    plans: [
      { label: "1GB (1 Day)", value: "mtn_1gb_1day", amount: 350, data: "1GB", category: "daily" },
      { label: "1.5GB (7 Days)", value: "mtn_1.5gb_7days", amount: 500, data: "1.5GB", category: "weekly" },
      { label: "2GB (30 Days)", value: "mtn_2gb_30days", amount: 1000, data: "2GB", category: "monthly" },
      { label: "5GB (30 Days)", value: "mtn_5gb_30days", amount: 2400, data: "5GB", category: "monthly" },
      { label: "24GB (3 Months)", value: "mtn_24gb_3months", amount: 6500, data: "24GB", category: "quarterly" },
    ],
  },
  {
    label: "Airtel Data",
    value: "airtel",
    logo: "/assets/networks/airtel.png",
    accent: "#ee2737",
    plans: [
      { label: "500MB (1 Day)", value: "airtel_500mb_1day", amount: 200, data: "500MB", category: "daily" },
      { label: "1.5GB (30 Days)", value: "airtel_1.5gb_30days", amount: 1000, data: "1.5GB", category: "monthly" },
      { label: "3.5GB (30 Days)", value: "airtel_3.5gb_30days", amount: 2000, data: "3.5GB", category: "monthly" },
      { label: "5GB (30 Days)", value: "airtel_5gb_30days", amount: 2700, data: "5GB", category: "monthly" },
      { label: "12GB (3 Months)", value: "airtel_12gb_3months", amount: 6000, data: "12GB", category: "quarterly" },
    ],
  },
  {
    label: "Glo Data",
    value: "glo",
    logo: "/assets/networks/glo.png",
    accent: "#008a13",
    plans: [
      { label: "1GB (1 Day)", value: "glo_1gb_1day", amount: 300, data: "1GB", category: "daily" },
      { label: "2GB (7 Days)", value: "glo_2gb_7days", amount: 500, data: "2GB", category: "weekly" },
      { label: "4.5GB (30 Days)", value: "glo_4.5gb_30days", amount: 1200, data: "4.5GB", category: "monthly" },
      { label: "7GB (30 Days)", value: "glo_7gb_30days", amount: 1500, data: "7GB", category: "monthly" },
      { label: "24GB (3 Months)", value: "glo_24gb_3months", amount: 6000, data: "24GB", category: "quarterly" },
    ],
  },
  {
    label: "9mobile Data",
    value: "9mobile",
    logo: "/assets/networks/9mobile.png",
    accent: "#36b44a",
    plans: [
      { label: "650MB (1 Day)", value: "9mobile_650mb_1day", amount: 200, data: "650MB", category: "daily" },
      { label: "1.5GB (7 Days)", value: "9mobile_1.5gb_7days", amount: 500, data: "1.5GB", category: "weekly" },
      { label: "2GB (30 Days)", value: "9mobile_2gb_30days", amount: 1200, data: "2GB", category: "monthly" },
      { label: "5GB (30 Days)", value: "9mobile_5gb_30days", amount: 2500, data: "5GB", category: "monthly" },
      { label: "10GB (3 Months)", value: "9mobile_10gb_3months", amount: 5500, data: "10GB", category: "quarterly" },
    ],
  },
];

const ALL_CATEGORIES: PlanCategory[] = ["daily", "weekly", "monthly", "quarterly", "others"];

export const DataBundleSubscription: React.FC = () => {
  const [provider, setProvider] = useState<string>("");
  const [category, setCategory] = useState<PlanCategory>("daily");
  const [plan, setPlan] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Find selected provider
  const selectedProvider = dataProviders.find((p) => p.value === provider);

  // Get active plans for the chosen category
  const plansForCategory = selectedProvider?.plans.filter(pl => pl.category === category) || [];

  // Find the selected plan details
  const selectedPlan = selectedProvider?.plans.find((pl) => pl.value === plan);

  // Compose visible categories for the current provider
  const providerCategories: PlanCategory[] = (
    selectedProvider
      ? [
          ...new Set(selectedProvider.plans.map(pl => pl.category)),
        ].filter(cat => ALL_CATEGORIES.includes(cat as PlanCategory)) as PlanCategory[]
      : ALL_CATEGORIES
  );

  // If current category is unavailable, fall back to the provider's first
  React.useEffect(() => {
    if (selectedProvider && !providerCategories.includes(category)) {
      setCategory(providerCategories[0]);
      setPlan("");
    }
    // eslint-disable-next-line
  }, [provider]);

  // If plan is not available in selected category, clear plan selection
  React.useEffect(() => {
    if (!plansForCategory.find(p => p.value === plan)) {
      setPlan("");
    }
    // eslint-disable-next-line
  }, [category, provider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await api.post(
        "/value-services/data-bundle/purchase/",
        { provider, plan, amount: selectedPlan?.amount ?? amount, phone },
        { headers }
      );
      setSuccessMsg("Data bundle purchased successfully!");
      setProvider("");
      setPlan("");
      setAmount("");
      setPhone("");
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.detail ||
          "Failed to process your data bundle purchase. Please try again."
      );
    }
    setLoading(false);
  };

  /**
   * Provider Selector UI
   */
  const ProviderSelector = () => (
    <Card className="rounded-2xl shadow-md">
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "center",
          py: { xs: 1.5, sm: 2 },
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Select Network Provider
        </Typography>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            justifyContent: "center",
            marginBottom: 4,
          }}
        >
          {dataProviders.map((p) => (
            <div
              key={p.value}
              style={{
                flex: "1 1 40%",
                minWidth: 100,
                maxWidth: 140,
                marginBottom: 8,
                boxSizing: "border-box",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button
                onClick={() => {
                  setProvider(p.value);
                  // select the first category available for this provider
                  const categories = [
                    ...new Set(
                      p.plans.map((pl) => pl.category)
                    ),
                  ].filter(cat => ALL_CATEGORIES.includes(cat as PlanCategory)) as PlanCategory[];
                  setCategory(categories[0] || "daily");
                  setPlan("");
                }}
                variant={provider === p.value ? "contained" : "outlined"}
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  bgcolor:
                    provider === p.value ? p.accent || "primary.main" : "#fff",
                  color: provider === p.value ? "#222" : "inherit",
                  border:
                    provider === p.value
                      ? `2px solid ${p.accent || "#aaa"}`
                      : "1.5px solid #eee",
                  boxShadow:
                    provider === p.value
                      ? "0 6px 24px 2px rgba(60,60,0,0.08)"
                      : "none",
                  transition: "all 0.18s",
                  borderRadius: 3,
                  py: 1.5,
                  px: 0,
                  minHeight: 80,
                  gap: 0.5,
                  "&:hover": {
                    borderColor: p.accent,
                    bgcolor: p.accent + "11",
                  },
                }}
              >
                <Avatar
                  src={p.logo}
                  alt={p.label}
                  sx={{
                    width: 38,
                    height: 38,
                    mb: 0.5,
                    bgcolor: "white",
                  }}
                  imgProps={{
                    style: { objectFit: "contain" },
                  }}
                />
                <span style={{ fontSize: 15, fontWeight: 500 }}>
                  {p.label}
                </span>
              </Button>
            </div>
          ))}
        </div>
        {!provider && (
          <Typography
            color="error"
            variant="caption"
            sx={{ mt: 1, textAlign: "center" }}
          >
            Please select a network.
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  /**
   * Category Tabs UI
   */
  const CategoryTabs = () => (
    <Card className="rounded-2xl shadow-md">
      <CardContent
        sx={{
          pt: 1,
          px: 0,
          pb: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Tabs
          value={category}
          onChange={(_e, newVal) => setCategory(newVal)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Data Plan Category"
        >
          {providerCategories.map((cat) => (
            <Tab
              key={cat}
              value={cat}
              label={categoryLabels[cat] || cat}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: { xs: 14, sm: 16 },
                color: category === cat ? "primary.main" : "inherit",
              }}
              disableRipple
            />
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );

  /**
   * Data Plan Selector — show plans as a single select for the current tab/category
   */
  const PlanSelector = () => (
    <Card className="rounded-2xl shadow-md">
      <CardContent
        className="flex flex-col items-center justify-center"
        sx={{ height: { xs: 120, sm: 140 }, width: "100%" }}
      >
        <FormControl fullWidth>
          <InputLabel id="plan-label">Data Plan</InputLabel>
          <Select
            labelId="plan-label"
            label="Data Plan"
            value={plan}
            onChange={(e) => {
              setPlan(e.target.value as string);
              setAmount("");
            }}
            required
            disabled={!plansForCategory.length}
          >
            {plansForCategory.map((pl) => (
              <MenuItem value={pl.value} key={pl.value}>
                {pl.label} &mdash; <b>&#8358;{pl.amount}</b>
              </MenuItem>
            ))}
            {plansForCategory.length === 0 && (
              <MenuItem disabled value="">
                No plans available in this category
              </MenuItem>
            )}
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  );

  /**
   * Phone Number Input
   */
  const PhoneNumberInput = () => (
    <Card className="rounded-2xl shadow-md">
      <CardContent
        className="flex flex-col items-center justify-center"
        sx={{ height: { xs: 120, sm: 140 }, width: "100%" }}
      >
        <TextField
          fullWidth
          label="Recipient Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
          variant="outlined"
          InputProps={{
            sx: { fontWeight: 500 },
            inputProps: { maxLength: 12 },
            startAdornment: (
              <InputAdornment position="start">+234</InputAdornment>
            ),
          }}
          InputLabelProps={{
            sx: { fontWeight: 500 },
          }}
          required
          placeholder="e.g. 8012345678"
        />
      </CardContent>
    </Card>
  );

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
        <Typography
          variant="h4"
          className="font-bold mb-6"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            lineHeight: 1.1,
          }}
        >
          Buy Data Bundle
        </Typography>
      </CustomerPageHeader>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <Typography variant="body1" className="text-gray-700 max-w-md">
          Purchase affordable data bundles for all networks. Instant delivery to any phone number in Nigeria!
        </Typography>
        <Button
          variant="contained"
          className="bg-[#e8f8fa] text-black shadow-sm rounded-xl normal-case mt-4 md:mt-0"
        >
          Chat with Agent
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 mb-6">
          <ProviderSelector />
          <Fade in={!!provider}>
            <div>
              {!!provider && <CategoryTabs />}
            </div>
          </Fade>
          <Fade in={!!provider}>
            <div>
              <PlanSelector />
            </div>
          </Fade>
          <Fade in={!!provider && !!plan}>
            <div>
              <PhoneNumberInput />
            </div>
          </Fade>
        </div>

        <Button
          variant="contained"
          fullWidth
          className="bg-blue-700 hover:bg-blue-800 text-white rounded-full py-3 font-semibold normal-case"
          disabled={
            !provider || !plan || !phone || loading
          }
          type="submit"
          sx={{
            mt: 1,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 0.5,
            borderRadius: 999,
            minHeight: 48,
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <>
              <span>
                {selectedPlan
                  ? `Buy (${selectedPlan.data} for ₦${selectedPlan.amount})`
                  : "Buy Data"}
              </span>
              {selectedProvider && (
                <Avatar
                  src={selectedProvider.logo}
                  alt={selectedProvider.label}
                  sx={{
                    width: 24,
                    height: 24,
                    ml: 1,
                    bgcolor: "#fff",
                  }}
                  variant="rounded"
                />
              )}
            </>
          )}
        </Button>
      </form>

      {/* Success & error messages */}
      {successMsg && (
        <Typography color="success.main" sx={{ mt: 3 }}>
          {successMsg}
        </Typography>
      )}
      {errorMsg && (
        <Typography color="error.main" sx={{ mt: 3 }}>
          {errorMsg}
        </Typography>
      )}

      {/* Guide */}
      <Typography
        variant="h6"
        className="font-bold mb-4"
        sx={{ mt: 4 }}
      >
        How it works
      </Typography>
      <div className="flex flex-col gap-2">
        <Typography variant="body2">
          1. Select your preferred network provider above.
        </Typography>
        <Typography variant="body2">
          2. Choose a category (Daily, Weekly, Monthly, etc.).
        </Typography>
        <Typography variant="body2">
          3. Select the data bundle you would like to buy in that category.
        </Typography>
        <Typography variant="body2">
          4. Enter the Nigerian phone number to receive data.
        </Typography>
        <Typography variant="body2">
          5. Click "Buy Data" and follow prompts. Data is typically delivered instantly!
        </Typography>
      </div>
    </Box>
  );
};

export default DataBundleSubscription;
