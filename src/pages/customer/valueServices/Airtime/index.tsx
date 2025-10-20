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
} from "@mui/material";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";
import api from "../../../../services/api";

/**
 * Network providers and logos (public assets assumed to exist)
 */
const networks: { label: string; value: string; logo: string; accent?: string }[] = [
  {
    label: "MTN",
    value: "mtn",
    logo: "/assets/networks/mtn.png",
    accent: "#ffe600",
  },
  {
    label: "Airtel",
    value: "airtel",
    logo: "/assets/networks/airtel.png",
    accent: "#ee1c25",
  },
  {
    label: "Glo",
    value: "glo",
    logo: "/assets/networks/glo.png",
    accent: "#21b04b",
  },
  {
    label: "9mobile",
    value: "9mobile",
    logo: "/assets/networks/9mobile.png",
    accent: "#36b32b",
  },
];

export const BuyAirtime: React.FC = () => {
  const [network, setNetwork] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Find selected network details
  const selectedNetwork = networks.find((nt) => nt.value === network);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await api.post(
        "/value-services/airtime/buy/",
        { network, phone, amount },
        { headers }
      );
      setSuccessMsg("Airtime purchase successful!");
      setNetwork("");
      setPhone("");
      setAmount("");
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.detail ||
          "Failed to process airtime purchase. Please try again."
      );
    }
    setLoading(false);
  };

  /**
   * Custom Network Selector (uses flex grid, not MUI's Grid)
   */
  const NetworkSelector = () => (
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
          Select Network
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
          {networks.map((nt) => (
            <div
              key={nt.value}
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
                onClick={() => setNetwork(nt.value)}
                variant={network === nt.value ? "contained" : "outlined"}
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  bgcolor:
                    network === nt.value
                      ? nt.accent || "primary.main"
                      : "#fff",
                  color:
                    network === nt.value
                      ? "#222"
                      : "inherit",
                  border:
                    network === nt.value
                      ? `2px solid ${nt.accent || "#aaa"}`
                      : "1.5px solid #eee",
                  boxShadow:
                    network === nt.value
                      ? "0 6px 24px 2px rgba(60,60,0,0.06)"
                      : "none",
                  transition: "all 0.18s",
                  borderRadius: 3,
                  py: 1.5,
                  px: 0,
                  minHeight: 80,
                  gap: 0.5,
                  "&:hover": {
                    borderColor: nt.accent,
                    bgcolor: nt.accent + "11",
                  },
                }}
              >
                <Avatar
                  src={nt.logo}
                  alt={nt.label}
                  sx={{
                    width: 36,
                    height: 36,
                    mb: 0.5,
                    bgcolor: "white",
                    border: nt.value === "mtn" ? "1px solid #eee" : undefined,
                  }}
                  imgProps={{
                    style: { objectFit: "contain" },
                  }}
                />
                <span style={{ fontSize: 15, fontWeight: 500 }}>{nt.label}</span>
              </Button>
            </div>
          ))}
        </div>
        {!network && (
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
   * Phone input UI
   */
  const PhoneInput = () => (
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
          onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
          InputProps={{
            sx: { fontWeight: 500 },
            startAdornment: (
              <InputAdornment position="start">
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: "#888",
                    fontSize: "16px",
                  }}
                >
                  +234
                </Typography>
              </InputAdornment>
            ),
          }}
          inputProps={{ maxLength: 11, pattern: "^[0-9]{11}$" }}
          InputLabelProps={{
            sx: { fontWeight: 500 },
          }}
          variant="outlined"
          required
          placeholder="e.g 8012345678"
        />
      </CardContent>
    </Card>
  );

  /**
   * Amount input with accent border on selected network
   */
  const AmountInput = () => (
    <Card
      className="rounded-2xl shadow-md"
      sx={{
        border:
          selectedNetwork && selectedNetwork.accent
            ? `2px solid ${selectedNetwork.accent}`
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
        >
          Chat with Agent
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 mb-6">
          <NetworkSelector />
          <Fade in={!!network}>
            <div>
              <PhoneInput />
            </div>
          </Fade>
          <Fade in={!!network}>
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
            !network ||
            !phone ||
            phone.length !== 11 ||
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
              <span>Buy Airtime</span>
              {selectedNetwork && (
                <Avatar
                  src={selectedNetwork.logo}
                  alt={selectedNetwork.label}
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
          2. Enter the 11-digit phone number (without +234).
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
