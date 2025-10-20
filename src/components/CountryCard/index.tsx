import React from "react";
import { Card, CardContent, Box, Typography, Stack } from "@mui/material";

export interface CountryCardProps {
  country: string;
  quote: string;
  type: string;
  minimumInvestment: string;
  visaFreeAccess: string;
  dualCitizenship: string;
  flagUrl: string;
  gradient?: string; // optional for customization
}

const CountryCard: React.FC<CountryCardProps> = ({
  country,
  quote,
  type,
  minimumInvestment,
  visaFreeAccess,
  dualCitizenship,
  flagUrl,
  gradient = "linear-gradient(135deg, #ffffff 30%, #c471ed 100%)",
}) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        width: 360, // increased from 300 to 360
        minWidth: 0,
        boxShadow: 2,
        background: gradient,
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
      }}
    >
      <CardContent sx={{ flex: 1, p: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
          {country}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: "italic", mb: 1 }}
        >
          {quote}
        </Typography>

        <Stack spacing={0.5}>
          <Typography variant="body2">
            <strong>Type:</strong> {type}
          </Typography>
          <Typography variant="body2">
            <strong>Minimum investment:</strong> {minimumInvestment}
          </Typography>
          <Typography variant="body2">
            <strong>Visa-Free Access:</strong> {visaFreeAccess}
          </Typography>
          <Typography variant="body2">
            <strong>Dual Citizenship:</strong> {dualCitizenship}
          </Typography>
        </Stack>
      </CardContent>

      <Box
        sx={{
          width: 70,
          backgroundImage: `url(${flagUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </Card>
  );
};

export default CountryCard;
