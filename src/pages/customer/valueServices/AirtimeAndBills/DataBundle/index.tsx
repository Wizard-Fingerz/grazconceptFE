import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  TextField,
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

/**
 * TYPES -- Providers and Plans
 */
type PlanCategory = "daily" | "weekly" | "monthly" | "quarterly" | "others";
const categoryLabels: Record<PlanCategory, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "3 Months",
  others: "Others",
};

type RemotePlan = {
  id: number;
  label: string;
  value: string;
  amount: number;
  data: string;
  category: PlanCategory;
};

type RemoteProvider = {
  id: number;
  label: string;
  value: string;
  accent?: string;
  logo: string;
  active: boolean;
};

const ALL_CATEGORIES: PlanCategory[] = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "others",
];

/**
 * PHONE NUMBER INPUT
 */
const PhoneNumberInput: React.FC<{
  phone: string;
  setPhone: (phone: string) => void;
  error?: string | null;
}> = React.memo(({ phone, setPhone, error }) => {
  return (
    <Card className="rounded-2xl shadow-md">
      <CardContent
        className="flex flex-col items-center justify-center"
        sx={{ height: { xs: 120, sm: 140 }, width: "100%" }}
      >
        <TextField
          fullWidth
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => {
            let val = e.target.value.replace(/[^0-9]/g, "");
            if (val.length > 11) val = val.substring(0, 11);
            setPhone(val);
          }}
          InputProps={{
            sx: { fontWeight: 500 },
          }}
          inputProps={{ maxLength: 11, pattern: "^[0-9]{11}$" }}
          InputLabelProps={{
            sx: { fontWeight: 500 },
          }}
          variant="outlined"
          required
          placeholder="e.g 08012345678"
          error={!!error}
          helperText={error}
        />
      </CardContent>
    </Card>
  );
});
PhoneNumberInput.displayName = "PhoneNumberInput";

/**
 * MAIN COMPONENT
 */
export const DataBundleSubscription: React.FC = () => {
  const [provider, setProvider] = useState<string>("");
  const [category, setCategory] = useState<PlanCategory>("daily");
  const [plan, setPlan] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // For fetching providers and related state
  const [fetchingProviders, setFetchingProviders] = useState(true);
  const [providersError, setProvidersError] = useState<string | null>(null);
  const [dataProviders, setDataProviders] = useState<RemoteProvider[]>([]);

  // For fetching plans of the selected provider and related state
  const [fetchingPlans, setFetchingPlans] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [providerPlans, setProviderPlans] = useState<RemotePlan[]>([]);

  const navigate = useNavigate();

  // --- FETCH PROVIDERS ONCE ---
  useEffect(() => {
    let mounted = true;
    setFetchingProviders(true);
    setProvidersError(null);

    (async () => {
      try {
        // The API response is assumed to be an array, not wrapped in .results
        const res = await api.get("/app/airtime-data-plans/providers-with-plans/");
        let content: any[] = Array.isArray(res.data) ? res.data : [];
        // Defensive shape-mapping, assumes { id, value, label, accent, logo, active }
        const mappedProviders: RemoteProvider[] = content.map((p: any) => ({
          id: p.id,
          label: p.label,
          value: p.value,
          accent: p.accent,
          logo: p.logo,
          active: p.active,
        }));
        if (mounted) {
          setDataProviders(mappedProviders);
        }
      } catch (err: any) {
        if (mounted) setProvidersError(
          err?.response?.data?.detail ||
          "Could not load providers. Please refresh."
        );
      }
      if (mounted) setFetchingProviders(false);
    })();

    return () => { mounted = false; };
  }, []);

  // --- FETCH PLANS FOR PROVIDER WHEN SELECTED ---
  useEffect(() => {
    if (!provider) {
      setProviderPlans([]);
      setPlansError(null);
      setFetchingPlans(false);
      setCategory("daily");
      setPlan("");
      return;
    }
    const foundProvider = dataProviders.find(p => p.value === provider);
    if (!foundProvider) {
      setProviderPlans([]);
      setCategory("daily");
      setPlansError(null);
      setFetchingPlans(false);
      setPlan("");
      return;
    }

    let mounted = true;
    setFetchingPlans(true);
    setPlansError(null);
    setProviderPlans([]);
    setPlan("");
    setCategory("daily");
    (async () => {
      try {
        // Note: GET /app/airtime-data-plans/?provider_id=<id>
        const res = await api.get("/app/airtime-data-plans/", {
          params: { provider_id: foundProvider.id }
        });
        let plans: any[] = Array.isArray(res.data?.results) ? res.data.results : [];
        // Defensive mapping
        const mappedPlans: RemotePlan[] = plans.map(pl => ({
          id: pl.id,
          label: pl.label,
          value: pl.value,
          amount: pl.amount,
          data: pl.data,
          category: pl.category,
        }));
        if (mounted) {
          setProviderPlans(mappedPlans);
          // Select the first available category for this provider
          const catSet = new Set((mappedPlans.map(pl => pl.category)).filter(Boolean));
          const firstCat = [...catSet].filter(cat => ALL_CATEGORIES.includes(cat as PlanCategory))[0] as PlanCategory || "daily";
          setCategory(firstCat);
        }
      } catch (err: any) {
        if (mounted)
          setPlansError(
            err?.response?.data?.detail || "Could not load data plans for this provider."
          );
      }
      if (mounted) setFetchingPlans(false);
    })();

    return () => { mounted = false; };
    // eslint-disable-next-line
  }, [provider, dataProviders]);

  // Memoize objects for rendering, filtering, etc
  const selectedProvider = useMemo(
    () => dataProviders.find((p) => p.value === provider),
    [dataProviders, provider]
  );

  const plansForCategory = useMemo(
    () => providerPlans.filter((pl) => pl.category === category) || [],
    [providerPlans, category]
  );

  const selectedPlan = useMemo(
    () => providerPlans.find((pl) => pl.value === plan),
    [providerPlans, plan]
  );

  const providerCategories: PlanCategory[] = useMemo(
    () =>
      providerPlans.length
        ? ([
            ...new Set(providerPlans.map((pl) => pl.category)),
          ].filter((cat) =>
            ALL_CATEGORIES.includes(cat as PlanCategory)
          ) as PlanCategory[])
        : ALL_CATEGORIES,
    [providerPlans]
  );

  // Maintain category/plan state
  useEffect(() => {
    if (!!providerPlans.length && !providerCategories.includes(category)) {
      setCategory(providerCategories[0]);
      setPlan("");
    }
    // eslint-disable-next-line
  }, [providerPlans, providerCategories, category]);

  useEffect(() => {
    if (!plansForCategory.find((p) => p.value === plan)) {
      setPlan("");
    }
    // eslint-disable-next-line
  }, [category, plansForCategory, providerPlans, provider]);

  // Find provider_id and plan_id for current selection
  const provider_id: number | undefined = selectedProvider?.id;
  const plan_id: number | undefined = selectedPlan?.id;

  // --- FORM SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const payload: Record<string, any> = {
        provider_id,
        plan_id,
        amount: selectedPlan?.amount ?? amount,
        phone,
      };
      await api.post(
        "/app/airtime-data-purchases/",
        payload,
        { headers }
      );
      setSuccessMsg("Data bundle purchased successfully!");
      setProvider("");
      setPlan("");
      setAmount("");
      setPhone("");
      setProviderPlans([]);
    } catch (err: any) {
      if (
        err?.response?.data &&
        (err.response.data.provider_id || err.response.data.plan_id)
      ) {
        const msgs = [];
        if (Array.isArray(err.response.data.provider_id)) {
          msgs.push(...err.response.data.provider_id);
        }
        if (Array.isArray(err.response.data.plan_id)) {
          msgs.push(...err.response.data.plan_id);
        }
        setErrorMsg(msgs.join(" "));
      } else {
        setErrorMsg(
          err?.response?.data?.detail ||
          "Failed to process your data bundle purchase. Please try again."
        );
      }
    }
    setLoading(false);
  };

  // --- UI SUBCOMPONENTS ---

  const ProviderSelector = useCallback(() => (
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
            position: "relative",
          }}
        >
          {dataProviders.filter(p => p.active).map((p) => (
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
                position: "relative",
              }}
            >
              <Button
                onClick={() => {
                  setProvider(p.value);
                  setPlan("");
                  setCategory("daily");
                  setSuccessMsg(null);
                  setErrorMsg(null);
                  setPlansError(null);
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
                  position: "relative",
                }}
                disabled={fetchingPlans && provider === p.value}
              >
                {/* If this button is the selected provider and fetchingPlans is true, show loading spinner */}
                {fetchingPlans && provider === p.value && (
                  <CircularProgress
                    size={28}
                    color="primary"
                    sx={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      zIndex: 2,
                    }}
                  />
                )}
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
  ), [dataProviders, provider, setProvider, setCategory, setPlan, setSuccessMsg, setErrorMsg, setPlansError, fetchingPlans]);

  const CategoryTabs = useCallback(() => (
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
  ), [category, providerCategories, setCategory]);

  const PlanSelector = useCallback(() => (
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
            disabled={!!plansError || !plansForCategory.length || fetchingPlans}
            MenuProps={{
              disableRestoreFocus: true,
            }}
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
  ), [plansForCategory, plan, setPlan, setAmount, plansError, fetchingPlans]);

  // --- LOADING/FAIL STATES ---
  if (fetchingProviders) {
    return (
      <Box sx={{ py: 7, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <CircularProgress color="primary" size={40} />
        <Typography sx={{ mt: 2, fontWeight: 500 }}>Loading data providers...</Typography>
      </Box>
    );
  }
  if (providersError) {
    return (
      <Box sx={{ py: 7, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography color="error" sx={{ fontWeight: 500 }}>{providersError}</Typography>
        <Button
          sx={{ mt: 2 }}
          onClick={() => {
            window.location.reload();
          }}
          variant="contained"
        >
          Retry
        </Button>
      </Box>
    );
  }

  // Show plan loading/error for per-provider plan fetch
  let plansFeedback = null;
  if (fetchingPlans) {
    plansFeedback = (
      <Box sx={{ py: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <CircularProgress color="primary" size={36} />
        <Typography sx={{ mt: 1, fontWeight: 400, fontSize: 16 }}>
          Loading plans...
        </Typography>
      </Box>
    );
  } else if (plansError) {
    plansFeedback = (
      <Box sx={{ py: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography color="error" sx={{ fontWeight: 500 }}>{plansError}</Typography>
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

      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="grid grid-cols-1 gap-6 mb-6">
          <ProviderSelector />
          <div>
            {/* Show a centered loader when fetchingPlans, after a provider is selected but before plans are loaded */}
            <Fade in={!!provider && fetchingPlans} unmountOnExit mountOnEnter>
              <Box sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                py: 3
              }}>
                <CircularProgress color="primary" size={36} />
                <Typography sx={{ ml: 2, fontWeight: 400, fontSize: 16 }}>
                  Loading plans...
                </Typography>
              </Box>
            </Fade>

            <Fade in={!!provider && !!providerPlans.length && !fetchingPlans && !plansError} unmountOnExit mountOnEnter>
              <div>
                {!!provider && !!providerPlans.length && <CategoryTabs />}
              </div>
            </Fade>
          </div>
          <div>
            <Fade in={!!provider && !!providerPlans.length && !fetchingPlans} unmountOnExit mountOnEnter>
              <div>
                {plansFeedback || <PlanSelector />}
              </div>
            </Fade>
          </div>
          {/* 
            IMPORTANT: To avoid remounting the PhoneNumberInput,
            always keep the wrapper div in the DOM.
            Only fade the actual contents inside, so input state/focus is preserved.
          */}
          <div>
            <Fade in={!!provider && !!plan && !!providerPlans.length && !fetchingPlans && !plansError} unmountOnExit mountOnEnter>
              <div>
                <PhoneNumberInput
                  phone={phone}
                  setPhone={setPhone}
                  error={
                    typeof errorMsg === "string"
                      ? errorMsg
                      : (
                          errorMsg && typeof errorMsg === "object" && "phone" in errorMsg
                            ? (errorMsg as { phone?: string })?.phone
                            : undefined
                        )
                  }
                />
              </div>
            </Fade>
          </div>
        </div>

        <Button
          variant="contained"
          fullWidth
          className="bg-blue-700 hover:bg-blue-800 text-white rounded-full py-3 font-semibold normal-case"
          disabled={!provider || !plan || !phone || loading || !!plansError}
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
