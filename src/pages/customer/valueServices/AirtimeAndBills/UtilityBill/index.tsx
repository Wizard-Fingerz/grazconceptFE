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
 * Utility providers
 */
const utilities: {
  label: string;
  value: string;
  logo: string;
  accent?: string;
}[] = [
    {
      label: "Ikeja Electric",
      value: "ikeja_electric",
      logo: "/assets/utilities/ikeja-electric.png",
      accent: "#9f791d",
    },
    {
      label: "Eko Electric",
      value: "eko_electric",
      logo: "/assets/utilities/eko-electric.png",
      accent: "#009ee3",
    },
    {
      label: "Abuja Electric",
      value: "abuja_electric",
      logo: "/assets/utilities/abuja-electric.png",
      accent: "#7f0081",
    },
    {
      label: "Ibadan Electric",
      value: "ibadan_electric",
      logo: "/assets/utilities/ibadan-electric.png",
      accent: "#17355b",
    },
    {
      label: "Kano Electric",
      value: "kano_electric",
      logo: "/assets/utilities/kano-electric.png",
      accent: "#49a02c",
    },
  ];

/**
 * Available meter types
 */
const meterTypes = [
  { label: "Prepaid", value: "prepaid" },
  { label: "Postpaid", value: "postpaid" },
];

export const PayUtilityBill: React.FC = () => {
  const [utility, setUtility] = useState<string>("");
  const [meterType, setMeterType] = useState<string>("");
  const [meterNumber, setMeterNumber] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Add navigate using react-router
  const navigate = useNavigate();
  // Find selected utility details
  const selectedUtility = utilities.find((ut) => ut.value === utility);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await api.post(
        "/value-services/bills/pay/",
        { utility, meterType, meterNumber, amount },
        { headers }
      );
      setSuccessMsg("Utility bill payment successful!");
      setUtility("");
      setMeterType("");
      setMeterNumber("");
      setAmount("");
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.detail ||
        "Failed to process your bill payment. Please try again."
      );
    }
    setLoading(false);
  };

  /**
   * Custom Utility Provider Selector
   */
  const UtilitySelector = () => (
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
          Select Utility Provider
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
          {utilities.map((ut) => (
            <div
              key={ut.value}
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
                onClick={() => setUtility(ut.value)}
                variant={utility === ut.value ? "contained" : "outlined"}
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  bgcolor:
                    utility === ut.value ? ut.accent || "primary.main" : "#fff",
                  color: utility === ut.value ? "#222" : "inherit",
                  border:
                    utility === ut.value
                      ? `2px solid ${ut.accent || "#aaa"}`
                      : "1.5px solid #eee",
                  boxShadow:
                    utility === ut.value
                      ? "0 6px 24px 2px rgba(60,60,0,0.06)"
                      : "none",
                  transition: "all 0.18s",
                  borderRadius: 3,
                  py: 1.5,
                  px: 0,
                  minHeight: 80,
                  gap: 0.5,
                  "&:hover": {
                    borderColor: ut.accent,
                    bgcolor: ut.accent + "11",
                  },
                }}
              >
                <Avatar
                  src={ut.logo}
                  alt={ut.label}
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
                <span style={{ fontSize: 15, fontWeight: 500 }}>{ut.label}</span>
              </Button>
            </div>
          ))}
        </div>
        {!utility && (
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
   * Meter Type Selector
   */
  const MeterTypeSelector = () => (
    <Card className="rounded-2xl shadow-md">
      <CardContent
        className="flex flex-col items-center justify-center"
        sx={{ height: { xs: 120, sm: 140 }, width: "100%" }}
      >
        <FormControl fullWidth>
          <InputLabel id="meter-type-label">Meter Type</InputLabel>
          <Select
            labelId="meter-type-label"
            label="Meter Type"
            value={meterType}
            onChange={(e) => setMeterType(e.target.value as string)}
            required
          >
            {meterTypes.map((m) => (
              <MenuItem value={m.value} key={m.value}>
                {m.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  );

  /**
   * Meter Number Input
   */
  const MeterNumberInput = () => (
    <Card className="rounded-2xl shadow-md">
      <CardContent
        className="flex flex-col items-center justify-center"
        sx={{ height: { xs: 120, sm: 140 }, width: "100%" }}
      >
        <TextField
          fullWidth
          label="Meter Number"
          value={meterNumber}
          onChange={(e) => setMeterNumber(e.target.value.replace(/[^0-9a-zA-Z]/g, ""))}
          variant="outlined"
          InputProps={{
            sx: { fontWeight: 500 },
          }}
          InputLabelProps={{
            sx: { fontWeight: 500 },
          }}
          required
          placeholder="Enter your meter number"
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
          selectedUtility && selectedUtility.accent
            ? `2px solid ${selectedUtility.accent}`
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
          Pay Utility & Electricity Bills
        </Typography>
      </CustomerPageHeader>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <Typography variant="body1" className="text-gray-700 max-w-md">
          Instantly pay for your electricity or utility bills across major Nigerian providers. Safe and seamless, with your meter token delivered right here!
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
          <UtilitySelector />
          <Fade in={!!utility}>
            <div>
              <MeterTypeSelector />
            </div>
          </Fade>
          <Fade in={!!utility && !!meterType}>
            <div>
              <MeterNumberInput />
            </div>
          </Fade>
          <Fade in={!!utility && !!meterType}>
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
            !utility ||
            !meterType ||
            !meterNumber ||
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
              <span>Pay Bill</span>
              {selectedUtility && (
                <Avatar
                  src={selectedUtility.logo}
                  alt={selectedUtility.label}
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
          1. Select your electricity provider above.
        </Typography>
        <Typography variant="body2">
          2. Pick meter type (Prepaid or Postpaid).
        </Typography>
        <Typography variant="body2">
          3. Enter your meter number as shown on your device/bill.
        </Typography>
        <Typography variant="body2">
          4. Enter the amount you wish to pay (&#8358;500 minimum).
        </Typography>
        <Typography variant="body2">
          5. Click "Pay Bill" and follow prompts. Your token (for prepaid) will be shown after payment.
        </Typography>
      </div>
    </Box>
  );
};

export default PayUtilityBill;
