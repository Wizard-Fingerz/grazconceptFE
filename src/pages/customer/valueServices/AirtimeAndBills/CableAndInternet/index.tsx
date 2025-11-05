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
} from "@mui/material";
import { CustomerPageHeader } from "../../../../../components/CustomerPageHeader";
import api from "../../../../../services/api";
import { useNavigate } from "react-router-dom"; // <-- Added import

/**
 * Cable & Internet Providers
 */
const cableInternetProviders: {
  label: string;
  value: string;
  logo: string;
  accent?: string;
}[] = [
    {
      label: "DSTV",
      value: "dstv",
      logo: "/assets/cable/dstv.png",
      accent: "#273467",
    },
    {
      label: "GOTV",
      value: "gotv",
      logo: "/assets/cable/gotv.png",
      accent: "#c11119",
    },
    {
      label: "Startimes",
      value: "startimes",
      logo: "/assets/cable/startimes.png",
      accent: "#fd8d22",
    },
    {
      label: "Showmax",
      value: "showmax",
      logo: "/assets/cable/showmax.png",
      accent: "#1A0841",
    },
    {
      label: "Spectranet",
      value: "spectranet",
      logo: "/assets/cable/spectranet.png",
      accent: "#2c2e83",
    },
    {
      label: "Smile",
      value: "smile",
      logo: "/assets/cable/smile.png",
      accent: "#7bc900",
    },
    {
      label: "Swift",
      value: "swift",
      logo: "/assets/cable/swift.png",
      accent: "#f3121b",
    },
    {
      label: "Others",
      value: "others",
      logo: "/assets/cable/others.png",
      accent: "#868686",
    },
  ];

/**
 * Example Bouquets for demonstration.
 * In real use, you'd want to fetch bouquet/plans based on provider, etc.
 */
const bouquetsByProvider: Record<string, { label: string; value: string }[]> = {
  dstv: [
    { label: "DSTV Access", value: "access" },
    { label: "DSTV Family", value: "family" },
    { label: "DSTV Compact", value: "compact" },
    { label: "DSTV Compact Plus", value: "compact_plus" },
    { label: "DSTV Premium", value: "premium" },
  ],
  gotv: [
    { label: "GOTV Lite", value: "lite" },
    { label: "GOTV Value", value: "value" },
    { label: "GOTV Jolli", value: "jolli" },
    { label: "GOTV Max", value: "max" },
    { label: "GOTV Supa", value: "supa" },
  ],
  startimes: [
    { label: "Nova", value: "nova" },
    { label: "Basic", value: "basic" },
    { label: "Smart", value: "smart" },
    { label: "Classic", value: "classic" },
    { label: "Super", value: "super" },
  ],
  showmax: [
    { label: "Showmax Monthly", value: "monthly" },
    { label: "Showmax Mobile Only", value: "mobile" },
  ],
  spectranet: [
    { label: "Spectranet Weekly", value: "weekly" },
    { label: "Spectranet Monthly", value: "monthly" },
    { label: "Spectranet Unlimited", value: "unlimited" },
  ],
  smile: [
    { label: "Smile 7GB", value: "7gb" },
    { label: "Smile 30GB", value: "30gb" },
    { label: "Smile Unlimited", value: "unlimited" },
  ],
  swift: [
    { label: "Swift Mini", value: "mini" },
    { label: "Swift Plus", value: "plus" },
    { label: "Swift Mega", value: "mega" },
  ],
  others: [
    { label: "Other Plans", value: "other" },
  ],
};

export const CableAndInternetRenewal: React.FC = () => {
  const [provider, setProvider] = useState<string>("");
  const [bouquet, setBouquet] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Add navigate using react-router
  const navigate = useNavigate();

  // Find selected provider details
  const selectedProvider = cableInternetProviders.find((p) => p.value === provider);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await api.post(
        "/value-services/cable-internet/renew/",
        { provider, bouquet, accountNumber, amount },
        { headers }
      );
      setSuccessMsg("Subscription renewal successful!");
      setProvider("");
      setBouquet("");
      setAccountNumber("");
      setAmount("");
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.detail ||
        "Failed to process your cable/internet renewal. Please try again."
      );
    }
    setLoading(false);
  };

  /**
   * Provider Selector
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
          Select Service Provider
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
          {cableInternetProviders.map((prov) => (
            <div
              key={prov.value}
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
                  setProvider(prov.value);
                  setBouquet('');
                }}
                variant={provider === prov.value ? "contained" : "outlined"}
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  bgcolor:
                    provider === prov.value ? prov.accent || "primary.main" : "#fff",
                  color: provider === prov.value ? "#222" : "inherit",
                  border:
                    provider === prov.value
                      ? `2px solid ${prov.accent || "#aaa"}`
                      : "1.5px solid #eee",
                  boxShadow:
                    provider === prov.value
                      ? "0 6px 24px 2px rgba(60,60,0,0.06)"
                      : "none",
                  transition: "all 0.18s",
                  borderRadius: 3,
                  py: 1.5,
                  px: 0,
                  minHeight: 80,
                  gap: 0.5,
                  "&:hover": {
                    borderColor: prov.accent,
                    bgcolor: prov.accent + "11",
                  },
                }}
              >
                <Avatar
                  src={prov.logo}
                  alt={prov.label}
                  sx={{
                    width: 36,
                    height: 36,
                    mb: 0.5,
                    bgcolor: "white",
                  }}
                  imgProps={{
                    style: { objectFit: "contain" },
                  }}
                />
                <span style={{ fontSize: 15, fontWeight: 500 }}>{prov.label}</span>
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
            Please select a provider.
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  /**
   * Bouquet/Plan Selector
   */
  const BouquetSelector = () => (
    <Card className="rounded-2xl shadow-md">
      <CardContent
        className="flex flex-col items-center justify-center"
        sx={{ height: { xs: 120, sm: 140 }, width: "100%" }}
      >
        <FormControl fullWidth>
          <InputLabel id="bouquet-type-label">
            {selectedProvider ? "Plan/Bouquet" : "Plan/Bouquet (Select Provider First)"}
          </InputLabel>
          <Select
            labelId="bouquet-type-label"
            label="Plan/Bouquet"
            value={bouquet}
            onChange={(e) => setBouquet(e.target.value as string)}
            disabled={!provider}
            required
          >
            {provider &&
              (bouquetsByProvider[provider] || [{ label: 'Other', value: 'other' }]).map((b) => (
                <MenuItem value={b.value} key={b.value}>
                  {b.label}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  );

  /**
   * Account Number/Smartcard/Username Input
   */
  const AccountInput = () => (
    <Card className="rounded-2xl shadow-md">
      <CardContent
        className="flex flex-col items-center justify-center"
        sx={{ height: { xs: 120, sm: 140 }, width: "100%" }}
      >
        <TextField
          fullWidth
          label={
            provider === "dstv" || provider === "gotv"
              ? "Smartcard/IUC Number"
              : provider === "startimes"
                ? "Smartcard Number"
                : provider === "spectranet" || provider === "smile" || provider === "swift"
                  ? "Username/Account Number"
                  : "Account/Identification Number"
          }
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9a-zA-Z]/g, ""))}
          variant="outlined"
          InputProps={{
            sx: { fontWeight: 500 },
          }}
          InputLabelProps={{
            sx: { fontWeight: 500 },
          }}
          required
          placeholder="Enter your Unique Number"
        />
      </CardContent>
    </Card>
  );

  /**
   * Amount Input
   */
  const AmountInput = () => (
    <Card
      className="rounded-2xl shadow-md"
      sx={{
        border:
          selectedProvider && selectedProvider.accent
            ? `2px solid ${selectedProvider.accent}`
            : undefined,
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
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
          variant="outlined"
          InputProps={{
            sx: { fontWeight: 500 },
            startAdornment: (
              <InputAdornment position="start">&#8358;</InputAdornment>
            ),
            inputProps: { min: 500, max: 500000 },
          }}
          InputLabelProps={{
            sx: { fontWeight: 500 },
          }}
          required
          placeholder="Minimum 500"
        />
      </CardContent>
    </Card>
  );

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
          Cable & Internet Renewal
        </Typography>
      </CustomerPageHeader>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <Typography variant="body1" className="text-gray-700 max-w-md">
          Renew your TV cable (DSTV, GOTV, Startimes, etc) or Internet subscriptions instantly, safe and reliable. Your viewing or browsing continues with no delay!
        </Typography>
        <Button
          variant="contained"
          className="bg-[#f5ebe1] text-black shadow-sm rounded-xl normal-case mt-4 md:mt-0"
          onClick={() => {
            // Use navigate hook to navigate programmatically
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
              <BouquetSelector />
            </div>
          </Fade>
          <Fade in={!!provider && !!bouquet}>
            <div>
              <AccountInput />
            </div>
          </Fade>
          <Fade in={!!provider && !!bouquet && !!accountNumber}>
            <div>
              <AmountInput />
            </div>
          </Fade>
        </div>

        <Button
          variant="contained"
          fullWidth
          className="bg-purple-700 hover:bg-purple-800 text-white rounded-full py-3 font-semibold normal-case"
          disabled={
            !provider ||
            !bouquet ||
            !accountNumber ||
            !amount ||
            loading
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
              <span>Renew Now</span>
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
          1. Select your Cable/Internet provider above.
        </Typography>
        <Typography variant="body2">
          2. Choose your plan or bouquet.
        </Typography>
        <Typography variant="body2">
          3. Enter your smartcard, IUC, username, or account number as appropriate.
        </Typography>
        <Typography variant="body2">
          4. Enter the amount corresponding to your selected plan (&#8358;500 minimum).
        </Typography>
        <Typography variant="body2">
          5. Click "Renew Now" and follow prompts. Your renewal will take effect instantly!
        </Typography>
      </div>
    </Box>
  );
};

export default CableAndInternetRenewal;
