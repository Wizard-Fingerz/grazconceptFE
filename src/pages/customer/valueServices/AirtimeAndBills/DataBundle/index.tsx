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
 * Types for plans/provides/categories returned from API
 */
type PlanCategory = "daily" | "weekly" | "monthly" | "quarterly" | "others";
const categoryLabels: Record<PlanCategory, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "3 Months",
  others: "Others",
};
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
  id?: number; // Added for internal reference (not needed in Select UI but useful for mapping)
};
type RemoteProvider = {
  label: string;
  value: string;
  logo: string;
  accent?: string;
  plans: RemotePlan[];
  id?: number; // Add id for reference to the API payload
};

const ALL_CATEGORIES: PlanCategory[] = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "others",
];

// Group plans as expected for UI
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
        id: plan.provider.id, // store database id for payload
      });
    }
    providersMap.get(providerKey)!.plans.push({
      label: plan.label,
      value: plan.value,
      amount: plan.amount,
      data: plan.data,
      category: plan.category,
      id: plan.id, // store plan id for payload
    });
  }
  return Array.from(providersMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );
}

/**
 * Phone number input is losing keystroke... seems something is rerendering everything I type.
 * 
 * - Issue: Input re-mounts because of how it's rendered inside <Fade> with a component reference that always changes (closure).
 * - Solution: Memoize PhoneNumberInput STABLY, and crucially, don't render the wrapper <div> IN the <Fade>
 *   each time but move <Fade> itself INSIDE the always-present wrapper <div> so React doesn't
 *   trash and recreate the subtree (which causes input to lose keystrokes/focus).
 *   See: https://github.com/mui/material-ui/issues/21010 & Fade docs.
 */
const PhoneNumberInput: React.FC<{
  phone: string;
  setPhone: (phone: string) => void;
  error?: string | null;
}> = React.memo(({ phone, setPhone, error }) => {
  // Unlike before, no local useRef for value tracking, just direct state update
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

  const navigate = useNavigate();

  // Fetch data plan providers and plans (unchanged)
  useEffect(() => {
    let mounted = true;
    setFetching(true);
    setFetchError(null);

    (async () => {
      try {
        const res = await api.get("/app/airtime-data-plans/");
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

  // Memoize computations to avoid rerenders
  const selectedProvider = useMemo(
    () => dataProviders.find((p) => p.value === provider),
    [dataProviders, provider]
  );

  const plansForCategory = useMemo(
    () =>
      selectedProvider?.plans.filter((pl) => pl.category === category) || [],
    [selectedProvider, category]
  );

  const selectedPlan = useMemo(
    () => selectedProvider?.plans.find((pl) => pl.value === plan),
    [selectedProvider, plan]
  );

  const providerCategories: PlanCategory[] = useMemo(
    () =>
      selectedProvider
        ? ([
            ...new Set(selectedProvider.plans.map((pl) => pl.category)),
          ].filter((cat) =>
            ALL_CATEGORIES.includes(cat as PlanCategory)
          ) as PlanCategory[])
        : ALL_CATEGORIES,
    [selectedProvider]
  );

  // Maintain category/plan state
  useEffect(() => {
    if (selectedProvider && !providerCategories.includes(category)) {
      setCategory(providerCategories[0]);
      setPlan("");
    }
    // eslint-disable-next-line
  }, [provider]);

  useEffect(() => {
    if (!plansForCategory.find((p) => p.value === plan)) {
      setPlan("");
    }
    // eslint-disable-next-line
  }, [category, provider]);

  // Find provider_id and plan_id for current selection
  const provider_id: number | undefined = selectedProvider?.id;
  const plan_id: number | undefined = selectedPlan?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // The API expects provider_id and plan_id numeric fields,
      // not string value fields.
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
    } catch (err: any) {
      // API may return validation errors in this format:
      // {
      //     "provider_id": ["This field is required."],
      //     "plan_id": ["This field is required."]
      // }
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

  // -- UI Sub-components (memoized for perf) --

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
  ), [dataProviders, provider, setProvider, setCategory, setPlan]);

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
            disabled={!plansForCategory.length}
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
  ), [plansForCategory, plan, setPlan, setAmount]);

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

      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="grid grid-cols-1 gap-6 mb-6">
          <ProviderSelector />
          <div>
            <Fade in={!!provider} unmountOnExit mountOnEnter>
              <div>
                {!!provider && <CategoryTabs />}
              </div>
            </Fade>
          </div>
          <div>
            <Fade in={!!provider} unmountOnExit mountOnEnter>
              <div>
                <PlanSelector />
              </div>
            </Fade>
          </div>
          {/* 
            IMPORTANT: To avoid remounting the PhoneNumberInput,
            always keep the wrapper div in the DOM.
            Only fade the actual contents inside, so input state/focus is preserved.
          */}
          <div>
            <Fade in={!!provider && !!plan} unmountOnExit mountOnEnter>
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
