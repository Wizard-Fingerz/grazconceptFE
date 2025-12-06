import React, { useState, useRef, useCallback, useEffect } from "react";
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
} from "@mui/material";
import { CustomerPageHeader } from "../../../../../components/CustomerPageHeader";
import api from "../../../../../services/api";
import { useNavigate } from "react-router-dom";

/**
 * Fetch available airtime network providers from the new endpoint:
 * /api/airtime-network-providers/
 */
function useAirtimeNetworkProviders() {
  const [providers, setProviders] = useState<
    { id: number; name: string; slug: string; logo?: string; accent?: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/app/airtime-network-providers/")
      .then((res) => {
        if (mounted) {
          let data = res.data.results || [];
          const adapted = data.map((item: any) => {
            if ("value" in item && "label" in item) {
              return {
                id: item.id,
                name: item.label,
                slug: item.value,
                logo: item.logo,
                accent: item.accent,
              };
            }
            return item;
          });
          setProviders(adapted);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(
            err?.response?.data?.detail ||
            "Failed to load network providers. Please refresh."
          );
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { providers, loading, error };
}

const NetworkSelector = React.memo(function NetworkSelector({
  network,
  setNetwork,
  providers,
  loading,
  error,
}: {
  network: string;
  setNetwork: (network: string) => void;
  providers: { id: number; name: string; slug: string; logo?: string; accent?: string }[];
  loading: boolean;
  error: string | null;
}) {
  return (
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
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Select Network
        </Typography>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" variant="caption" sx={{ mt: 1, textAlign: "center" }}>
            {error}
          </Typography>
        ) : providers.length === 0 ? (
          <Typography color="error" variant="caption" sx={{ mt: 1, textAlign: "center" }}>
            No network providers found. Please check back soon.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              justifyContent: { xs: "flex-start", sm: "center" },
              marginBottom: 0,
              width: "100%",
            }}
          >
            {providers.map((nt) => {
              const isSelected = network === nt.slug;
              return (
                <Button
                  key={nt.id ?? nt.slug}
                  onClick={() => setNetwork(nt.slug)}
                  sx={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    minWidth: 0,
                    px: 1.3,
                    py: 1.1,
                    width: { xs: "100%", sm: 175 },
                    maxWidth: 220,
                    borderRadius: 3,
                    bgcolor: isSelected ? (nt.accent || "primary.main") : "#fff",
                    color: isSelected ? "#252525" : "inherit",
                    border: isSelected
                      ? `2.5px solid ${nt.accent || "#aaa"}`
                      : "1.5px solid #eee",
                    boxShadow: isSelected
                      ? "0 6px 32px 0.5px rgba(60,60,0,0.09)"
                      : "none",
                    fontWeight: 600,
                    fontSize: 17,
                    textTransform: "none",
                    gap: 1.3,
                    transition: "all 0.19s cubic-bezier(.25,.8,.25,1)",
                    "&:hover": {
                      borderColor: nt.accent,
                      bgcolor: nt.accent ? nt.accent + "18" : "#fafafa",
                    },
                    mb: 1,
                  }}
                  disableElevation
                >
                  <Avatar
                    src={nt.logo}
                    alt={nt.name}
                    sx={{
                      width: 37,
                      height: 37,
                      bgcolor: "#fff",
                      border: isSelected
                        ? `2px solid ${nt.accent || "#cfb"}`
                        : "1px solid #e8e8e8",
                      boxShadow: isSelected
                        ? `0 2px 7px 0 ${nt.accent || "#aaa"}33`
                        : "none",
                      mr: 1.5,
                      ml: 0.5,
                      my: 0,
                    }}
                    imgProps={{ style: { objectFit: "contain" } }}
                  />
                  <span
                    style={{
                      fontWeight: isSelected ? 800 : 600,
                      color: isSelected ? "#212126" : "#36393c",
                      fontSize: 15.5,
                      letterSpacing: "0.01em",
                      textShadow: isSelected ? "0 1.5px 0 #fff5" : "none",
                    }}
                  >
                    {nt.name}
                  </span>
                </Button>
              );
            })}
          </Box>
        )}
        {(!network && !loading && !error && providers.length > 0) && (
          <Typography
            color="error"
            variant="caption"
            sx={{ mt: 1.5, textAlign: "center", fontWeight: 500 }}
          >
            Please select a network.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
});


const PhoneInput = React.memo(function PhoneInput({
  phone,
  setPhone,
  error,
}: {
  phone: string;
  setPhone: (phone: string) => void;
  error?: string | null;
}) {
  const lastValue = useRef(phone || "");

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
            // Do not remove leading zero, just take up to 11
            lastValue.current = val;
            setPhone(val);
          }}
          InputProps={{
            sx: { fontWeight: 500 },
            // Removed the +234 adornment
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

const AmountInput = React.memo(function AmountInput({
  amount,
  setAmount,
  accent,
}: {
  amount: string;
  setAmount: (amt: string) => void;
  accent?: string;
}) {
  const lastValue = useRef(amount || "");

  return (
    <Card
      className="rounded-2xl shadow-md"
      sx={{
        border: accent ? `2px solid ${accent}` : undefined,
        transition: "border 0.2s",
      }}
    >
      <CardContent
        className="flex flex-col items-center justify-center"
        sx={{ height: { xs: 120, sm: 140 }, width: "100%" }}
      >
        <TextField
          fullWidth
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => {
            let val = e.target.value.replace(/[^0-9]/g, "");
            if (val && val.length > 1 && val.startsWith("0")) val = val.replace(/^0+/, "");
            if (parseInt(val, 10) > 20000) val = "20000";
            lastValue.current = val;
            setAmount(val);
          }}
          variant="outlined"
          InputProps={{
            sx: { fontWeight: 500 },
            startAdornment: (
              <InputAdornment position="start">&#8358;</InputAdornment>
            ),
            inputProps: { min: 50, max: 20000 },
          }}
          InputLabelProps={{
            sx: { fontWeight: 500 },
          }}
          required
          placeholder="Minimum 50"
        />
      </CardContent>
    </Card>
  );
});

export const BuyAirtime: React.FC = () => {
  const [network, setNetwork] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New: Field-level error state to show specific field errors from API
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string } | null>(null);

  const navigate = useNavigate();

  const {
    providers: networkProviders,
    loading: providersLoading,
    error: providersError,
  } = useAirtimeNetworkProviders();

  // Find the selected network provider object (by slug)
  const selectedNetwork = networkProviders.find((p) => p.slug === network);

  const setNetworkStable = useCallback(setNetwork, []);
  const setPhoneStable = useCallback(setPhone, []);
  const setAmountStable = useCallback(setAmount, []);

  // --------- FIXED SUBMIT LOGIC with field-level error handling ---------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setFieldErrors(null);

    // Validate: phone should be exactly 11 digits (Nigerian full format)
    if (!network || !phone || phone.length !== 11 || !amount) {
      setErrorMsg("All fields are required and must be valid.");
      return;
    }
    const amtNum = Number(amount);
    if (isNaN(amtNum) || amtNum < 50 || amtNum > 20000) {
      setErrorMsg("Amount must be between ₦50 and ₦20,000.");
      return;
    }

    // Find the provider object by slug and get its id (pk)
    const selectedProvider = networkProviders.find((p) => p.slug === network);
    const providerId = selectedProvider?.id;

    // Provider id is required for posting
    if (!providerId) {
      setErrorMsg("Invalid network selected. Please choose another.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // This time, send phone number as entered by user (11 digits, may start with zero), no +234 prefix/cleaning
      const phoneToSend = phone;

      // Try main endpoint first, then fallback to /airtime-purchases/ if needed
      let response = null;

      try {
        response = await api.post(
          "/app/airtime-purchases/",
          {
            provider_id: providerId, // Use the id, not the slug
            network: network,
            phone: phoneToSend, // Send phone as plain 11 digits (with initial zero)
            amount: amtNum,
          },
          { headers }
        );
      } catch (err: any) {
        // Check for 4xx (especially 400) only, otherwise fallback to /airtime-purchases/
        if (
          err?.response &&
          err.response.status >= 400 &&
          err.response.status < 500
        ) {
          throw err;
        }
        try {
          response = await api.post(
            "app/airtime-purchases/",
            {
              network_provider: providerId, // Use the id, not the slug
              network: network,
              phone_number: phoneToSend, // Send phone_number as plain 11 digits (with initial zero)
              amount: amtNum,
            },
            { headers }
          );
        } catch (err2: any) {
          throw err2;
        }
      }

      if (
        response &&
        (response.status === 201 ||
          response.status === 200 ||
          response.data?.status === "success")
      ) {
        setSuccessMsg("Airtime purchase successful!");
        setNetwork("");
        setPhone("");
        setAmount("");
      } else {
        // Try to surface field errors
        if (response?.data && typeof response.data === "object") {
          if (
            response.data.provider_id?.length > 0 ||
            response.data.phone?.length > 0
          ) {
            const fieldErrs: { [key: string]: string } = {};
            if (response.data.provider_id?.length > 0) {
              fieldErrs['network'] = response.data.provider_id[0];
            }
            if (response.data.phone?.length > 0) {
              fieldErrs['phone'] = response.data.phone[0];
            }
            setFieldErrors(fieldErrs);
            setErrorMsg(null);
            setLoading(false);
            return;
          }
        }
        setErrorMsg(
          response?.data?.detail ||
          "Failed to process airtime purchase. Please try again."
        );
      }
    } catch (err: any) {
      // Trap and map field errors from err.response?.data
      const errData = err?.response?.data;
      if (errData && typeof errData === "object") {
        // Check for server field errors
        if (
          errData.provider_id?.length > 0 ||
          errData.phone?.length > 0
        ) {
          const fieldErrs: { [key: string]: string } = {};
          if (errData.provider_id?.length > 0) {
            fieldErrs['network'] = errData.provider_id[0];
          }
          if (errData.phone?.length > 0) {
            fieldErrs['phone'] = errData.phone[0];
          }
          setFieldErrors(fieldErrs);
          setErrorMsg(null);
          setLoading(false);
          return;
        }
      }
      setErrorMsg(
        errData?.detail ||
        errData?.message ||
        err?.message ||
        "Failed to process airtime purchase. Please try again."
      );
    }
    setLoading(false);
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1400, mx: 'auto' }}>
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
          Buy Instant Airtime
        </Typography>
      </CustomerPageHeader>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <Typography variant="body1" className="text-gray-700 max-w-md">
          Top-up airtime instantly to any Nigerian network. Fast, reliable, and secure, with no extra charges. Select your provider to continue.
        </Typography>
        <Button
          variant="contained"
          className="bg-[#f5ebe1] text-black shadow-sm rounded-xl normal-case mt-4 md:mt-0"
          onClick={() => navigate("/support/chat")}
        >
          Chat with Agent
        </Button>
      </div>

      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="grid grid-cols-1 gap-6 mb-6">
          <NetworkSelector
            network={network}
            setNetwork={setNetworkStable}
            providers={networkProviders}
            loading={providersLoading}
            error={providersError || (fieldErrors?.network ?? null)}
          />
          <Fade in={!!network}>
            <div>
              <PhoneInput phone={phone} setPhone={setPhoneStable} error={fieldErrors?.phone} />
            </div>
          </Fade>
          <Fade in={!!network}>
            <div>
              <AmountInput amount={amount} setAmount={setAmountStable} accent={selectedNetwork?.accent} />
            </div>
          </Fade>
        </div>

        <Button
          variant="contained"
          fullWidth
          className="bg-purple-700 hover:bg-purple-800 text-white rounded-full py-3 font-semibold normal-case"
          disabled={
            !network ||
            !phone ||
            phone.length !== 11 ||
            !amount ||
            loading ||
            providersLoading ||
            !!providersError ||
            networkProviders.length === 0
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
              <span>Buy Airtime</span>
              {selectedNetwork && (
                <Avatar
                  src={selectedNetwork.logo}
                  alt={selectedNetwork.name}
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
          1. Tap your preferred network above.
        </Typography>
        <Typography variant="body2">
          2. Enter the 11-digit phone number (e.g. 08012345678) – use the full number, including the initial zero.
        </Typography>
        <Typography variant="body2">
          3. Enter the amount to buy (&#8358;50 minimum).
        </Typography>
        <Typography variant="body2">
          4. Click "Buy Airtime" and follow prompts.
        </Typography>
      </div>
    </Box>
  );
};

export default BuyAirtime;
