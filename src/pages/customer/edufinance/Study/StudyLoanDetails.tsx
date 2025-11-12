import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Divider,
  Button,
  TextField,
  InputLabel,
  Stack,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { useAuth } from "../../../../context/AuthContext";
import api from "../../../../services/api";
import { getLoanOfferById } from "../../../../services/edufinanceService";

// Helper to parse newline-separated strings to lists
function parseLines(str?: string) {
  if (!str) return [];
  return str.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
}

function prettyStatus(status: any) {
  if (typeof status === "boolean") return status ? "Active" : "Inactive";
  if (!status) return "Active";
  if (typeof status === "string")
    return status.charAt(0).toUpperCase() + status.slice(1);
  return String(status);
}

const applicationFields = [
  { name: "purpose", label: "Purpose", type: "textarea", required: true },
  { name: "amount", label: "Amount", type: "number", required: true },
  { name: "currency", label: "Currency", type: "text", required: true },
  { name: "filled_details", label: "Additional Details", type: "textarea", required: false },
];

const StudyLoanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [offer, setOffer] = useState<any>(null);
  const [ , setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Application state
  const [form, setForm] = useState({
    amount: "",
    currency: "",
    purpose: "",
    filled_details: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Existing application state
  const [latestApplication, setLatestApplication] = useState<any>(null);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);

  // Fetch offer & prefill form (currency from offer)
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getLoanOfferById(id)
      .then((data) => {
        setOffer(data);
        setLoading(false);
        setForm((prev) => ({
          ...prev,
          currency: data?.currency ? String(data.currency) : "",
        }));
      })
      .catch((_err) => {
        setError("Failed to load offer details.");
        setLoading(false);
      });
  }, [id]);

  // Check if user already has an application for this offer
  useEffect(() => {
    if (!id || !user) {
      setApplicationLoading(false);
      setLatestApplication(null);
      setApplicationError(null);
      return;
    }
    setApplicationLoading(true);
    setApplicationError(null);

    api.get("/wallet/loan-applications/", {
      params: { loan_offer: id, user: user.id }, // if API supports filtering
    })
      .then((res) => {
        let results = Array.isArray(res.data?.results)
          ? res.data.results
          : Array.isArray(res.data)
            ? res.data
            : [];
        if (!Array.isArray(results)) results = [];
        const mine = results.find((app: any) => String(app.loan_offer) === String(id));
        setLatestApplication(mine || null);
        setApplicationLoading(false);
      })
      .catch(() => {
        setLatestApplication(null);
        setApplicationError("Failed to check previous applications.");
        setApplicationLoading(false);
      });
  }, [id, user]);

  // Form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Form submit
  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSubmitSuccess(false);

    try {
      const payload: any = {
        loan_offer: id,
        amount: form.amount,
        currency: form.currency,
        purpose: form.purpose,
        filled_details: form.filled_details,
      };

      // Assume DRF defaults user from authentication context; don't send user explicitly unless required

      await api.post("/wallet/loan-applications/", payload);
      setSubmitSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setSubmitSuccess(false);
      setError("Failed to submit loan application. Please check your details.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helpers for offer details visualization
  const offerName = offer?.name || "Study Loan Offer";
  const offerDesc = offer?.description || "";
  const offerMinAmount = offer?.min_amount ? `${offer.min_amount} ${offer.currency || ""}`.trim() : "";
  const offerMaxAmount = offer?.max_amount ? `${offer.max_amount} ${offer.currency || ""}`.trim() : "";
  const offerInterest = offer?.interest_rate ? `${offer.interest_rate}% per annum` : "";
  const offerDuration = offer?.duration_months ? `${offer.duration_months} months` : "";
  const offerActiveStatus = prettyStatus(offer?.is_active);
  const createdAt = offer?.created_at ? new Date(offer.created_at).toLocaleString() : "";
  const updatedAt = offer?.updated_at ? new Date(offer.updated_at).toLocaleString() : "";
  const requirementsArr = parseLines(offer?.requirements);
  const requiredDocsArr = parseLines(offer?.required_documents);

  const renderApplicationDetails = (app: any) => (
    <Box>
      <Typography variant="h6" className="font-semibold mb-2">
        Your Application
      </Typography>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>Amount</Typography>
          <Typography variant="body2">{app.amount}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>Currency</Typography>
          <Typography variant="body2">{app.currency}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>Purpose</Typography>
          <Typography variant="body2">{app.purpose}</Typography>
        </Box>
        {app.filled_details && (
          <Box>
            <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>Details</Typography>
            <Typography variant="body2">{app.filled_details}</Typography>
          </Box>
        )}
        <Box>
          <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>Status</Typography>
          <Typography variant="body2">{prettyStatus(app.status)}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>Created At</Typography>
          <Typography variant="body2">{app.created_at ? new Date(app.created_at).toLocaleString() : "--"}</Typography>
        </Box>
      </Stack>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => navigate("/customer/applications")}
      >
        View all Applications
      </Button>
    </Box>
  );
  
  // form validation
  const isFormValid = () => {
    for (const f of applicationFields) {
      if (f.required && !String(form[f.name as keyof typeof form]).trim()) {
        return false;
      }
    }
    return true;
  };
  
  return (
    <Box sx={{ flex: 1, alignSelf: "flex-start", p: 1, width: "100%", minWidth: 0 }}>
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          <Link
            color="inherit"
            component="button"
            underline="hover"
            onClick={() => navigate(-1)}
            sx={{ fontWeight: 500, cursor: "pointer" }}
          >
            Back
          </Link>
          <Typography color="text.primary">
            Loan Details
          </Typography>
        </Breadcrumbs>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
          px: { xs: 1, sm: 2, md: 4 },
          py: { xs: 2, md: 4 },
          mx: "auto",
        }}
      >
        {/* Main offer details */}
        <Box sx={{ flex: 2, minWidth: 0 }}>
          <Card className="mb-4 rounded-2xl shadow-md">
            <CardContent>
              <Box className="flex items-center gap-4 mb-4">
                <Box>
                  <Typography variant="h5" className="font-bold">{offerName}</Typography>
                  <Typography variant="body2" color="text.secondary">{offer?.currency || ""}</Typography>
                </Box>
              </Box>
              <Typography variant="h6" className="font-semibold mb-2">{offerDesc}</Typography>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap sx={{ mb: 2 }}>
                {offerMinAmount && (
                  <Box sx={{ flex: "1 1 250px", mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">Minimum Amount</Typography>
                    <Typography variant="body2">{offerMinAmount}</Typography>
                  </Box>
                )}
                {offerMaxAmount && (
                  <Box sx={{ flex: "1 1 250px", mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">Maximum Amount</Typography>
                    <Typography variant="body2">{offerMaxAmount}</Typography>
                  </Box>
                )}
                {offerInterest && (
                  <Box sx={{ flex: "1 1 250px", mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">Interest Rate</Typography>
                    <Typography variant="body2">{offerInterest}</Typography>
                  </Box>
                )}
                {offerDuration && (
                  <Box sx={{ flex: "1 1 250px", mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">Duration</Typography>
                    <Typography variant="body2">{offerDuration}</Typography>
                  </Box>
                )}
                <Box sx={{ flex: "1 1 250px", mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Typography variant="body2">{offerActiveStatus}</Typography>
                </Box>
                <Box sx={{ flex: "1 1 250px", mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
                  <Typography variant="body2">{createdAt || "N/A"}</Typography>
                </Box>
                <Box sx={{ flex: "1 1 250px", mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Updated At</Typography>
                  <Typography variant="body2">{updatedAt || "N/A"}</Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" className="font-semibold mb-1">Requirements</Typography>
              {requirementsArr.length > 0 ? (
                <ul className="list-disc pl-6">
                  {requirementsArr.map((req, idx) => (
                    <li key={idx}>
                      <Typography variant="body2">{req}</Typography>
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No specific requirements listed.
                </Typography>
              )}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" className="font-semibold mb-1">Required Documents</Typography>
              {requiredDocsArr.length > 0 ? (
                <ul className="list-disc pl-6">
                  {requiredDocsArr.map((doc, idx) => (
                    <li key={idx}>
                      <Typography variant="body2">{doc}</Typography>
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No required documents listed.
                </Typography>
              )}
            </CardContent>
          </Card>
          <Paper className="p-4 mt-4" elevation={0} sx={{ bgcolor: "#f9f9f9" }}>
            <Typography variant="subtitle1" className="font-semibold mb-1">
              More Information
            </Typography>
            <Typography variant="body2">
              Contact support for more information.
            </Typography>
          </Paper>
        </Box>
        {/* Application Section */}
        <Box
          sx={{
            flex: 1,
            alignSelf: "flex-start",
            bgcolor: "#fff",
            borderRadius: 3,
            boxShadow: 2,
            p: 3,
          }}
        >
          {applicationLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", minHeight: 130, mb: 2 }}>
              <CircularProgress size={28} sx={{ mr: 2 }} />
              <Typography>Loading your application...</Typography>
            </Box>
          ) : latestApplication ? (
            renderApplicationDetails(latestApplication)
          ) : (
            <>
              {applicationError && (
                <Typography color="error" sx={{ mb: 1 }}>
                  {applicationError}
                </Typography>
              )}
              <Typography variant="h6" className="font-bold mb-2">
                Apply for this Loan
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mb-3">
                Fill in your details to start your study loan application.
              </Typography>
              <form
                onSubmit={handleApplicationSubmit}
                autoComplete="off"
              >
                {applicationFields.map((field) => (
                  <Box key={field.name} sx={{ mb: 2 }}>
                    <InputLabel shrink>
                      {field.label}{field.required ? " *" : ""}
                    </InputLabel>
                    {field.type === "textarea" ? (
                      <TextField
                        name={field.name}
                        value={form[field.name as keyof typeof form]}
                        onChange={handleInputChange}
                        fullWidth
                        required={field.required}
                        margin="normal"
                        multiline
                        minRows={3}
                      />
                    ) : (
                      <TextField
                        name={field.name}
                        value={form[field.name as keyof typeof form]}
                        onChange={handleInputChange}
                        fullWidth
                        required={field.required}
                        margin="normal"
                        type={field.type}
                        disabled={field.name === "currency" && !!offer?.currency}
                      />
                    )}
                  </Box>
                ))}
                <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={submitting || !isFormValid()}
                  >
                    {submitting ? (
                      <CircularProgress size={22} color="inherit" />
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </Box>
                {submitSuccess && (
                  <Typography color="success.main" className="mt-2">
                    Application submitted successfully!
                  </Typography>
                )}
                {error && (
                  <Typography color="error" className="mt-2">
                    {error}
                  </Typography>
                )}
              </form>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default StudyLoanDetails;
