import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Snackbar,
  Tooltip,
  Paper
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import EmailIcon from "@mui/icons-material/Email";
import { CustomerPageHeader } from "../../../components/CustomerPageHeader";
import { useAuth } from '../../../context/AuthContext';

const ReferralPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const { user } = useAuth();

  // Compose the referral link using the user's custom_id if present, fallback to "unknown"
  const referralId = user?.custom_id || "unknown";
  const REFERRAL_LINK = useMemo(
    () => `${window.location.origin}/register?ref=${encodeURIComponent(referralId)}`,
    [referralId]
  );

  const validateEmail = (email: string) => {
    // Basic email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailSent(false);
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setSending(true);
    // Simulate API call
    setTimeout(() => {
      setSending(false);
      setEmailSent(true);
      setEmail("");
    }, 1200);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(REFERRAL_LINK);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setError("Could not copy link to clipboard.");
    }
  };

  const handleShare = async () => {
    setShareError(null);
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Referral Link",
          text: "Sign up using my referral link:",
          url: REFERRAL_LINK,
        });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setShareError("Failed to share link.");
        }
      }
    } else {
      setShareError("Sharing not supported on this device.");
    }
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 1, sm: 2 }, width: '100%', maxWidth: 1400, mx: 'auto' }}>

      <CustomerPageHeader>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
          Refer a Friend
        </Typography>
        <Typography variant="body1" sx={{ mb: 1.5, color: "text.secondary" }}>
          Invite your friends and earn rewards! Share your unique referral link below by email, copy, or share.
        </Typography>
      </CustomerPageHeader>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            Your Referral Link
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              display: "flex",
              alignItems: "center",
              p: "6px 10px",
              mb: 2,
              bgcolor: "#f9f9f9",
              borderRadius: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                wordBreak: "break-all",
                fontFamily: "monospace",
                flex: 1,
                pr: 1,
              }}
            >
              {REFERRAL_LINK}
            </Typography>
            <Tooltip title="Copy link">
              <IconButton size="small" onClick={handleCopy} color={copied ? "success" : "primary"}>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={typeof navigator.share === "function" ? "Share" : "Sharing not supported"}
            >
              <span>
                <IconButton
                  size="small"
                  onClick={handleShare}
                  color="primary"
                  disabled={!navigator.share}
                  sx={{ ml: 0.5 }}
                >
                  <ShareIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Paper>
          <Typography variant="body2" sx={{ mb: 0.5, color: "text.secondary" }}>
            You can copy and paste the above link anywhere, or share directly!
          </Typography>
          {copied && (
            <Alert severity="success" sx={{ mt: 1, py: 0.3, fontSize: "1rem" }}>
              Copied to clipboard!
            </Alert>
          )}
          {shareError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {shareError}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            Send Referral Link by Email
          </Typography>
          <form onSubmit={handleSendEmail} autoComplete="off">
            <TextField
              type="email"
              label="Friend's Email"
              placeholder="friend@example.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              disabled={sending}
              fullWidth
              margin="normal"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={sending}
                sx={{ flex: 1, fontWeight: 600 }}
              >
                {sending ? "Sending..." : "Send Referral"}
              </Button>
            </Box>
          </form>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {emailSent && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Email sent successfully!
            </Alert>
          )}
        </CardContent>
      </Card>
      <Snackbar
        open={copied}
        message="Link copied!"
        autoHideDuration={1100}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => setCopied(false)}
      />
    </Box>
  );
};

export default ReferralPage;
