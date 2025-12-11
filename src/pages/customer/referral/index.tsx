import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  IconButton,
  Snackbar,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import { CustomerPageHeader } from "../../../components/CustomerPageHeader";
import { useAuth } from '../../../context/AuthContext';
import authService from "../../../services/authService";

// You can type this more specifically when you know the structure
type RefereeType = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  full_name?: string;
  [key: string]: any;
};

const ReferralPage: React.FC = () => {
  const [, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  // State for referees
  const [referees, setReferees] = useState<RefereeType[]>([]);
  const [loadingReferees, setLoadingReferees] = useState(false);
  const [refereesError, setRefereesError] = useState<string | null>(null);

  const { user } = useAuth();

  // Compose the referral link using the user's custom_id if present, fallback to "unknown"
  const referralId = user?.custom_id || "unknown";
  const REFERRAL_LINK = useMemo(
    () => `${window.location.origin}/register?ref=${encodeURIComponent(referralId)}`,
    [referralId]
  );

  // Fetch the referees
  useEffect(() => {
    setLoadingReferees(true);
    setRefereesError(null);

    authService.getMyreferees()
      .then((data) => {
        // Simulate paginated API response ("results" array holds referees)
        if (
          data &&
          typeof data === "object" &&
          Array.isArray(data.results)
        ) {
          setReferees(data.results);
        } else {
          setReferees([]);
        }
      })
      .catch(() => {
        setRefereesError("Could not fetch referrees.");
        setReferees([]);
      })
      .finally(() => setLoadingReferees(false));
  }, []);




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

      {/* Start: Referred friends list */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            Your Referrals ({referees.length})
          </Typography>
          {loadingReferees ? (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 60 }}>
              <CircularProgress size={32} />
            </Box>
          ) : refereesError ? (
            <Alert severity="error">{refereesError}</Alert>
          ) : referees.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              You have not referred anyone yet.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    {/* Add more fields as needed */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {referees.map((ref, idx) => (
                    <TableRow key={ref.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        {ref.full_name
                          || [ref.first_name, ref.last_name].filter(Boolean).join(" ")
                          || ref.email
                          || "Unknown"}
                      </TableCell>
                      <TableCell>{ref.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
