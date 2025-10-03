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
} from "@mui/material";
import { capitalizeWords } from "../../utils";

/**
 * OfferCard - Professional, compact card for displaying a study visa offer.
 * Uses the new offer API structure.
 * 
 * Layout: Horizontal (row) for main info, to reduce height and increase width.
 */
export const OfferCard: React.FC<{
  offer: any;
  onViewOffer?: () => void;
}> = ({ offer, onViewOffer }) => {
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

  return (
    <Card
      className="rounded-xl shadow-md transition-transform hover:scale-[1.015] hover:shadow-lg"
      sx={{
        borderLeft: `5px solid #6a1b9a`,
        margin: "auto",
        background: "#f7f3ff",
        minHeight: 0,
        maxWidth: 650,
        minWidth: 420,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        position: "relative",
        p: 0,
      }}
      elevation={2}
    >
      <CardContent
        className="flex flex-col gap-2"
        sx={{
          p: 2.2,
          "&:last-child": { pb: 2.2 },
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
                  fontSize: "1.05rem",
                  color: "#6a1b9a",
                  lineHeight: 1.2,
                  maxWidth: 320,
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
                  fontSize: "0.93rem",
                  color: "#3d2956",
                  lineHeight: 1.2,
                  maxWidth: 320,
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
              fontSize: "0.82rem",
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

        {/* Main Info - Horizontal Layout */}
        <Box
          className="flex flex-row gap-4"
          sx={{
            columnGap: 4,
            rowGap: 0.5,
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          {/* Left Column: Program, Course, Tuition */}
          <Box className="flex flex-col gap-1" sx={{ minWidth: 180, flex: 1 }}>
            <Box className="flex items-center" sx={{ gap: 1 }}>
              <Typography
                variant="body2"
                className="text-gray-600"
                sx={{ fontWeight: 500, minWidth: 80, fontSize: "0.93rem" }}
              >
                Program:
              </Typography>
              <Typography
                variant="body2"
                className="text-gray-800 font-semibold truncate"
                sx={{ fontSize: "0.93rem", maxWidth: 140 }}
              >
                {offer.program_type_name || "N/A"}
              </Typography>
            </Box>
            <Box className="flex items-center" sx={{ gap: 1 }}>
              <Typography
                variant="body2"
                className="text-gray-600"
                sx={{ fontWeight: 500, minWidth: 80, fontSize: "0.93rem" }}
              >
                Course:
              </Typography>
              <Tooltip title={offer.course_of_study_name || "N/A"} arrow>
                <Typography
                  variant="body2"
                  className="text-gray-800 truncate"
                  sx={{ fontSize: "0.93rem", maxWidth: 140 }}
                >
                  {offer.course_of_study_name || "N/A"}
                </Typography>
              </Tooltip>
            </Box>
            <Box className="flex items-center" sx={{ gap: 1 }}>
              <Typography
                variant="body2"
                className="text-gray-600"
                sx={{ fontWeight: 500, minWidth: 80, fontSize: "0.93rem" }}
              >
                Tuition:
              </Typography>
              <Typography
                variant="body2"
                className="text-gray-800"
                sx={{ fontSize: "0.93rem" }}
              >
                {tuitionFee}
              </Typography>
            </Box>
          </Box>

          {/* Middle Column: Deadline, End Date, Min Qual */}
          <Box className="flex flex-col gap-1" sx={{ minWidth: 180, flex: 1 }}>
            <Box className="flex items-center" sx={{ gap: 1 }}>
              <Typography
                variant="body2"
                className="text-gray-600"
                sx={{ fontWeight: 500, minWidth: 80, fontSize: "0.93rem" }}
              >
                Deadline:
              </Typography>
              <Typography
                variant="body2"
                className="text-gray-800"
                sx={{ fontSize: "0.93rem" }}
              >
                {deadline}
              </Typography>
            </Box>
            {endDate && (
              <Box className="flex items-center" sx={{ gap: 1 }}>
                <Typography
                  variant="body2"
                  className="text-gray-600"
                  sx={{ fontWeight: 500, minWidth: 80, fontSize: "0.93rem" }}
                >
                  End Date:
                </Typography>
                <Typography
                  variant="body2"
                  className="text-gray-800"
                  sx={{ fontSize: "0.93rem" }}
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
                  sx={{ fontWeight: 500, minWidth: 80, fontSize: "0.93rem" }}
                >
                  Min. Qual.:
                </Typography>
                <Typography
                  variant="body2"
                  className="text-gray-800"
                  sx={{ fontSize: "0.93rem" }}
                >
                  {offer.minimum_qualification}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Right Column: Description, Created, Button */}
          <Box
            className="flex flex-col gap-1"
            sx={{
              minWidth: 180,
              flex: 1,
              alignItems: { xs: "flex-start", md: "flex-end" },
              justifyContent: "space-between",
            }}
          >
            {/* Description */}
            {offer.description && (
              <Box sx={{ mt: 0, mb: 0.5, maxWidth: 200 }}>
                <Typography
                  variant="body2"
                  className="text-gray-700"
                  sx={{
                    fontStyle: "italic",
                    fontSize: "0.92rem",
                    color: "#5a4a6d",
                    lineHeight: 1.3,
                    maxHeight: 38,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {offer.description}
                </Typography>
              </Box>
            )}

            {/* Created At */}
            {createdAt && (
              <Box className="flex items-center" sx={{ gap: 1, mt: 0 }}>
                <Typography
                  variant="caption"
                  className="text-gray-500"
                  sx={{ minWidth: 60, fontSize: "0.85rem" }}
                >
                  Created:
                </Typography>
                <Typography
                  variant="caption"
                  className="text-gray-500"
                  sx={{ fontSize: "0.85rem" }}
                >
                  {createdAt}
                </Typography>
              </Box>
            )}

            {/* View Offer Button */}
            <Box className="flex items-center justify-end" sx={{ mt: 1 }}>
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
                  fontSize: "0.93rem",
                  height: 32,
                  lineHeight: 1,
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
