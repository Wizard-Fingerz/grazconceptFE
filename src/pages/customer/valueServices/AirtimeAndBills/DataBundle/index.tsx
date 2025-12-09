import React, { useState, useEffect } from "react";
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
import { CustomerPageHeader } from "../../../../../components/CustomerPageHeader";
import api from "../../../../../services/api";
import { useNavigate } from "react-router-dom";

// Types for plans/provides/categories returned from API
type PlanCategory = "daily" | "weekly" | "monthly" | "quarterly" | "others";
const categoryLabels: Record<PlanCategory, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "3 Months",
  others: "Others",
};

// These shape the raw API result, since the server schema provides direct plans rather than grouped providers
type RawPlan = {
  id: number;
  provider: {
    id: number;
    value: string;
    label: string;
    logo: string;
    accent: string;
    active: boolean;
  };
  label: string;
  value: string;
  category: PlanCategory;
  data: string;
  amount: number;
  logo: string;
  accent: string;
};

type RemotePlan = {
  label: string;
  value: string;
  amount: number;
  data: string;
  category: PlanCategory;
};

type RemoteProvider = {
  label: string;
  value: string;
  logo: string;
  accent?: string;
  plans: RemotePlan[];
};

const ALL_CATEGORIES: PlanCategory[] = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "others",
];

// Helper to transform flat array of plans into a grouped provider object, as UI expects
function groupPlansByProvider(plans: RawPlan[]): RemoteProvider[] {
  const providersMap = new Map<string, RemoteProvider>();
  for (const plan of plans) {
    const providerKey = plan.provider.value;
    if (!providersMap.has(providerKey)) {
      providersMap.set(providerKey, {
        label: plan.provider.label,
        value: plan.provider.value,
        logo: plan.provider.logo || plan.logo || "",
        accent: plan.provider.accent || plan.accent || undefined,
        plans: [],
      });
    }
    providersMap.get(providerKey)!.plans.push({
      label: plan.label,
      value: plan.value,
      amount: plan.amount,
      data: plan.data,
      category: plan.category,
    });
  }
  // return as array, sorted by provider label so UI is stable
  return Array.from(providersMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );
}

export const DataBundleSubscription: React.FC = () => {
  const [provider, setProvider] = useState<string>("");
  const [category, setCategory] = useState<PlanCategory>("daily");
  const [plan, setPlan] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [dataProviders, setDataProviders] = useState<RemoteProvider[]>([]);

  // Add navigate using react-router
  const navigate = useNavigate();

  // Fetch data plan providers and plans from API on mount
  useEffect(() => {
    let mounted = true;
    setFetching(true);
    setFetchError(null);

    (async () => {
      try {
        // Call the endpoint (returns a paginated object as shown, with 'results' array)
        const res = await api.get("/app/airtime-data-plans/");
        // Expect a paginated shape with `results`
        const flatPlans: RawPlan[] = Array.isArray(res.data.results)
          ? res.data.results
          : [];
        const providers = groupPlansByProvider(flatPlans);
        if (mounted) {
          setDataProviders(providers);
        }
      } catch (err: any) {
        if (mounted) {
          setFetchError(
            err?.response?.data?.detail ||
              "Could not load data plans, please refresh."
          );
        }
      }
      if (mounted) setFetching(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Find selected provider
  const selectedProvider = dataProviders.find((p) => p.value === provider);

  // Get active plans for the chosen category
  const plansForCategory =
    selectedProvider?.plans.filter((pl) => pl.category === category) || [];

  // Find the selected plan details
  const selectedPlan = selectedProvider?.plans.find((pl) => pl.value === plan);

  // Compose visible categories for the current provider
  const providerCategories: PlanCategory[] = selectedProvider
    ? ([
        ...new Set(selectedProvider.plans.map((pl) => pl.category)),
      ].filter((cat) => ALL_CATEGORIES.includes(cat as PlanCategory)) as PlanCategory[])
    : ALL_CATEGORIES;

  // If current category is unavailable, fall back to the provider's first
  useEffect(() => {
    if (selectedProvider && !providerCategories.includes(category)) {
      setCategory(providerCategories[0]);
      setPlan("");
    }
    // eslint-disable-next-line
  }, [provider]);

  // If plan is not available in selected category, clear plan selection
  useEffect(() => {
    if (!plansForCategory.find((p) => p.value === plan)) {
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
        {
          provider,
          plan,
          amount: selectedPlan?.amount ?? amount,
          phone,
        },
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
                    ...new Set(p.plans.map((pl) => pl.category)),
                  ].filter((cat) =>
                    ALL_CATEGORIES.includes(cat as PlanCategory)
                  ) as PlanCategory[];
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
                    bgcolor: p.accent ? p.accent + "11" : undefined,
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

  // Handle loading/fetch error state for plans
  if (fetching) {
    return (
      <Box sx={{ py: 7, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <CircularProgress color="primary" size={40} />
        <Typography sx={{ mt: 2, fontWeight: 500 }}>Loading data plans...</Typography>
      </Box>
    );
  }
  if (fetchError) {
    return (
      <Box sx={{ py: 7, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography color="error" sx={{ fontWeight: 500 }}>{fetchError}</Typography>
        <Button
          sx={{ mt: 2 }}
          onClick={() => {
            // force reload page to re-fetch
            window.location.reload();
          }}
          variant="contained"
        >
          Retry
        </Button>
      </Box>
    );
  }

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
          onClick={() => {
            navigate("/support/chat");
          }}
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
          disabled={!provider || !plan || !phone || loading}
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
