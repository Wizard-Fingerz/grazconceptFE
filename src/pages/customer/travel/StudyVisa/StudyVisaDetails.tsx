import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Paper,
  Divider,
  Button,
  TextField,
} from "@mui/material";
import { getStudyVisaOfferById } from "../../../../services/studyVisa";

// Placeholder for fetching a single offer by ID
// In real implementation, move this to services/studyVisa.ts

// Placeholder for application form submission
async function submitApplication(_offerId: string, _formData: any) {
  // Replace with actual API call
  return new Promise((resolve) => setTimeout(resolve, 1200));
}

const StudyVisaDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Application form state
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getStudyVisaOfferById(id)
      .then((data) => {
        setOffer(data);
        setLoading(false);
      })
      .catch((_err) => {
        setError("Failed to load offer details.");
        setLoading(false);
      });
  }, [id]);

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitSuccess(false);
    try {
      await submitApplication(id as string, {
        name: applicantName,
        email: applicantEmail,
      });
      setSubmitSuccess(true);
      setApplicantName("");
      setApplicantEmail("");
    } catch (err) {
      // Handle error
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-[300px]">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex items-center justify-center min-h-[300px]">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!offer) {
    return (
      <Box className="flex items-center justify-center min-h-[300px]">
        <Typography>No offer details found.</Typography>
      </Box>
    );
  }

  // Extract institution details, requirements, images, etc.
  const institution = offer.university || offer.institution_name || {};
  const requirements = offer.requirements || [];
  const images = offer.images || offer.institution_images || [];
  const institutionLogo =
    offer.institution_logo ||
    (typeof institution === "object" && institution.logo) ||
    null;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 4,
        px: { xs: 1, sm: 2, md: 4 },
        py: { xs: 2, md: 4 },
        maxWidth: 1400,
        mx: "auto",
      }}
    >
      {/* Main Details Section */}
      <Box sx={{ flex: 2, minWidth: 0 }}>
        <Card className="mb-4 rounded-2xl shadow-md">
          <CardContent>
            <Box className="flex items-center gap-4 mb-4">
              {institutionLogo && (
                <CardMedia
                  component="img"
                  image={institutionLogo}
                  alt="Institution Logo"
                  sx={{ width: 64, height: 64, borderRadius: 2, objectFit: "contain", bgcolor: "#f5f5f5" }}
                />
              )}
              <Box>
                <Typography variant="h5" className="font-bold">
                  {typeof institution === "object"
                    ? institution.name || offer.institution_name
                    : institution || offer.institution_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {offer.country || (typeof institution === "object" && institution.country)}
                </Typography>
              </Box>
            </Box>
            <Typography variant="h6" className="font-semibold mb-2">
              Program: {offer.program_name || offer.program}
            </Typography>
            <Typography variant="body1" className="mb-2">
              {offer.description || offer.program_description || "No description available."}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" className="font-semibold mb-1">
              Requirements
            </Typography>
            {Array.isArray(requirements) && requirements.length > 0 ? (
              <ul className="list-disc pl-6">
                {requirements.map((req: any, idx: number) => (
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
            <Typography variant="subtitle1" className="font-semibold mb-1">
              Institution Images
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
              {Array.isArray(images) && images.length > 0 ? (
                images.map((img: string, idx: number) => (
                  <CardMedia
                    key={idx}
                    component="img"
                    image={img}
                    alt={`Institution Image ${idx + 1}`}
                    sx={{
                      width: 120,
                      height: 80,
                      borderRadius: 2,
                      objectFit: "cover",
                      bgcolor: "#f5f5f5",
                    }}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No images available.
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
        {/* Additional details can go here */}
        <Paper className="p-4 mt-4" elevation={0} sx={{ bgcolor: "#f9f9f9" }}>
          <Typography variant="subtitle1" className="font-semibold mb-1">
            More about the Institution
          </Typography>
          <Typography variant="body2">
            {offer.institution_description ||
              (typeof institution === "object" && institution.description) ||
              "No additional information provided."}
          </Typography>
        </Paper>
      </Box>

      {/* Application Form Section */}
      <Box
        sx={{
          flex: 1,
          minWidth: 320,
          maxWidth: 400,
          alignSelf: "flex-start",
          bgcolor: "#fff",
          borderRadius: 3,
          boxShadow: 2,
          p: 3,
        }}
      >
        <Typography variant="h6" className="font-bold mb-2">
          Apply for this Offer
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mb-3">
          Fill in your details to start your application for this study visa offer.
        </Typography>
        <form onSubmit={handleApplicationSubmit}>
          <TextField
            label="Full Name"
            value={applicantName}
            onChange={(e) => setApplicantName(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Email Address"
            type="email"
            value={applicantEmail}
            onChange={(e) => setApplicantEmail(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className="rounded-full mt-2"
            disabled={submitting || !applicantName || !applicantEmail}
          >
            {submitting ? <CircularProgress size={22} color="inherit" /> : "Submit Application"}
          </Button>
          {submitSuccess && (
            <Typography color="success.main" className="mt-2">
              Application submitted successfully!
            </Typography>
          )}
        </form>
      </Box>
    </Box>
  );
};

export default StudyVisaDetails;
