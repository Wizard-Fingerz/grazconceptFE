import React from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { capitalizeWords } from "../../utils";

/**
 * OfferCard - Professional, compact card for displaying a study visa offer.
 * Uses the new offer API structure.
 * 
 * Now fully responsive for mobile: width, direction, and spacing adapt to screen size.
 */
export const OfferCard: React.FC<{
  offer: any;
  onViewOffer?: () => void;
}> = ({ offer, onViewOffer }) => {
  // For responsive truncation
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Format tuition fee
  const tuitionFee =
    offer.tuition_fee && !isNaN(Number(offer.tuition_fee))
      ? `£${Number(offer.tuition_fee).toLocaleString()}`
      : offer.tuition_fee || "N/A";

  // Format application deadline
  const deadline = offer.application_deadline
    ? new Date(offer.application_deadline).toLocaleDateString()
    : "N/A";

  // Format end date
  const endDate = offer.end_date
    ? new Date(offer.end_date).toLocaleDateString()
    : null;

  // Format created date
  const createdAt = offer.created_at
    ? new Date(offer.created_at).toLocaleDateString()
    : null;

  // Truncate description for display: shorter on mobile, longer on desktop
  const truncateDescription = (desc: string, maxMobile: number = 55, maxDesktop: number = 80) => {
    if (!desc) return "";
    const max = isMobile ? maxMobile : maxDesktop;
    return desc.length > max ? desc.slice(0, max).trim() + "..." : desc;
  };

  return (
    <Card
      className="rounded-xl shadow-md transition-transform hover:scale-[1.015] hover:shadow-lg"
      sx={{
        borderLeft: `5px solid #6a1b9a`,
        margin: "auto",
        background: "#f7f3ff",
        minHeight: 0,
        maxWidth: { xs: "100%", sm: 500, md: 650 },
        minWidth: { xs: "0", sm: 340, md: 420 },
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        position: "relative",
        p: 0,
        boxSizing: "border-box",
      }}
      elevation={2}
    >
      <CardContent
        className="flex flex-col gap-2"
        sx={{
          p: { xs: 1.2, sm: 2.2 },
          "&:last-child": { pb: { xs: 1.2, sm: 2.2 } },
        }}
      >
        {/* Header: University and Offer Title */}
        <Box className="flex items-center justify-between mb-1" sx={{ gap: 1 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Tooltip title={offer.institution_name || "Unknown Institution"} arrow>
              <Typography
                variant="subtitle1"
                className="font-bold truncate"
                sx={{
                  fontSize: { xs: "1rem", sm: "1.05rem" },
                  color: "#6a1b9a",
                  lineHeight: 1.2,
                  maxWidth: { xs: 220, sm: 320 },
                }}
              >
                {capitalizeWords(offer.institution_name || "Unknown Institution")}
              </Typography>
            </Tooltip>
            <Tooltip title={offer.offer_title || ""} arrow>
              <Typography
                variant="body2"
                className="text-gray-700 truncate"
                sx={{
                  fontWeight: 500,
                  fontSize: { xs: "0.9rem", sm: "0.93rem" },
                  color: "#3d2956",
                  lineHeight: 1.2,
                  maxWidth: { xs: 220, sm: 320 },
                }}
              >
                {offer.offer_title}
              </Typography>
            </Tooltip>
          </Box>
          <Chip
            label="Offer"
            sx={{
              fontWeight: 600,
              fontSize: { xs: "0.78rem", sm: "0.82rem" },
              color: "#6a1b9a",
              background: "#ede7f6",
              px: 1.5,
              py: 0.2,
              borderRadius: 1.5,
              pointerEvents: "none",
              height: 24,
              ml: 1,
            }}
          />
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Main Info - Responsive Layout */}
        <Box
          className="gap-4"
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            columnGap: 4,
            rowGap: 2,
            flexWrap: { xs: "nowrap", sm: "wrap" },
            alignItems: { xs: "stretch", sm: "flex-start" },
            justifyContent: { xs: "flex-start", sm: "space-between" },
          }}
        >
          {/* Left Column */}
          <Box
            className="flex flex-col gap-1"
            sx={{
              minWidth: { xs: 0, sm: 160, md: 180 },
              flex: 1,
              mb: { xs: 1, sm: 0 },
              pr: { sm: 2, md: 0 },
            }}
          >
            <Box className="flex items-center" sx={{ gap: 1 }}>
              <Typography
                variant="body2"
                className="text-gray-600"
                sx={{
                  fontWeight: 500,
                  minWidth: 68,
                  fontSize: { xs: "0.91rem", sm: "0.93rem" },
                }}
              >
                Program:
              </Typography>
              <Typography
                variant="body2"
                className="text-gray-800 font-semibold truncate"
                sx={{
                  fontSize: { xs: "0.91rem", sm: "0.93rem" },
                  maxWidth: { xs: 100, sm: 140 },
                }}
              >
                {offer.program_type_name || "N/A"}
              </Typography>
            </Box>
            <Box className="flex items-center" sx={{ gap: 1 }}>
              <Typography
                variant="body2"
                className="text-gray-600"
                sx={{
                  fontWeight: 500,
                  minWidth: 68,
                  fontSize: { xs: "0.91rem", sm: "0.93rem" },
                }}
              >
                Course:
              </Typography>
              <Tooltip title={offer.course_of_study_name || "N/A"} arrow>
                <Typography
                  variant="body2"
                  className="text-gray-800 truncate"
                  sx={{
                    fontSize: { xs: "0.91rem", sm: "0.93rem" },
                    maxWidth: { xs: 100, sm: 140 },
                  }}
                >
                  {offer.course_of_study_name || "N/A"}
                </Typography>
              </Tooltip>
            </Box>
            <Box className="flex items-center" sx={{ gap: 1 }}>
              <Typography
                variant="body2"
                className="text-gray-600"
                sx={{
                  fontWeight: 500,
                  minWidth: 68,
                  fontSize: { xs: "0.91rem", sm: "0.93rem" },
                }}
              >
                Tuition:
              </Typography>
              <Typography
                variant="body2"
                className="text-gray-800"
                sx={{ fontSize: { xs: "0.91rem", sm: "0.93rem" } }}
              >
                {tuitionFee}
              </Typography>
            </Box>
          </Box>

          {/* Middle Column */}
          <Box
            className="flex flex-col gap-1"
            sx={{
              minWidth: { xs: 0, sm: 160, md: 180 },
              flex: 1,
              mb: { xs: 1, sm: 0 },
              pr: { sm: 2, md: 0 },
            }}
          >
            <Box className="flex items-center" sx={{ gap: 1 }}>
              <Typography
                variant="body2"
                className="text-gray-600"
                sx={{
                  fontWeight: 500,
                  minWidth: 68,
                  fontSize: { xs: "0.91rem", sm: "0.93rem" },
                }}
              >
                Deadline:
              </Typography>
              <Typography
                variant="body2"
                className="text-gray-800"
                sx={{ fontSize: { xs: "0.91rem", sm: "0.93rem" } }}
              >
                {deadline}
              </Typography>
            </Box>
            {endDate && (
              <Box className="flex items-center" sx={{ gap: 1 }}>
                <Typography
                  variant="body2"
                  className="text-gray-600"
                  sx={{
                    fontWeight: 500,
                    minWidth: 68,
                    fontSize: { xs: "0.91rem", sm: "0.93rem" },
                  }}
                >
                  End Date:
                </Typography>
                <Typography
                  variant="body2"
                  className="text-gray-800"
                  sx={{ fontSize: { xs: "0.91rem", sm: "0.93rem" } }}
                >
                  {endDate}
                </Typography>
              </Box>
            )}
            {offer.minimum_qualification && (
              <Box className="flex items-center" sx={{ gap: 1 }}>
                <Typography
                  variant="body2"
                  className="text-gray-600"
                  sx={{
                    fontWeight: 500,
                    minWidth: 68,
                    fontSize: { xs: "0.91rem", sm: "0.93rem" },
                  }}
                >
                  Min. Qual.:
                </Typography>
                <Typography
                  variant="body2"
                  className="text-gray-800"
                  sx={{ fontSize: { xs: "0.91rem", sm: "0.93rem" } }}
                >
                  {offer.minimum_qualification}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Right Column */}
          <Box
            className="flex flex-col gap-1"
            sx={{
              minWidth: { xs: 0, sm: 160, md: 180 },
              flex: 1,
              // On mobile align everything to start; on sm+ align end
              alignItems: { xs: "flex-start", sm: "flex-end" },
              justifyContent: "space-between",
              mb: { xs: 1, sm: 0 },
            }}
          >
            {/* Description */}
            {offer.description && (
              <Box sx={{ mt: 0, mb: 0.5, maxWidth: { xs: "100%", sm: 200 } }}>
                <Tooltip title={offer.description} arrow>
                  <Typography
                    variant="body2"
                    className="text-gray-700"
                    sx={{
                      fontStyle: "italic",
                      fontSize: { xs: "0.89rem", sm: "0.92rem" },
                      color: "#5a4a6d",
                      lineHeight: 1.3,
                      maxHeight: 38,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: { xs: "98vw", sm: 200 },
                    }}
                  >
                    {truncateDescription(offer.description)}
                  </Typography>
                </Tooltip>
              </Box>
            )}

            {/* Created At */}
            {createdAt && (
              <Box className="flex items-center" sx={{ gap: 1, mt: 0 }}>
                <Typography
                  variant="caption"
                  className="text-gray-500"
                  sx={{ minWidth: 48, fontSize: { xs: "0.8rem", sm: "0.85rem" } }}
                >
                  Created:
                </Typography>
                <Typography
                  variant="caption"
                  className="text-gray-500"
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.85rem" } }}
                >
                  {createdAt}
                </Typography>
              </Box>
            )}

            {/* View Offer Button */}
            <Box
              className="flex items-center"
              sx={{
                justifyContent: { xs: "flex-start", sm: "flex-end" },
                mt: 1,
                width: "100%",
              }}
            >
              <Button
                size="small"
                variant="outlined"
                sx={{
                  borderColor: "#6a1b9a",
                  color: "#6a1b9a",
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: "none",
                  px: 2,
                  py: 0.2,
                  minWidth: 0,
                  fontSize: { xs: "0.91rem", sm: "0.93rem" },
                  height: 32,
                  lineHeight: 1,
                  width: { xs: "100%", sm: "auto" },
                }}
                onClick={onViewOffer}
              >
                View Offer
              </Button>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
