import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Rating,
} from "@mui/material";

interface HotelCardProps {
  image: string;
  name: string;
  rating: number;
  reviews?: string;
  price: string;
  description: string;
  onReserve: () => void;
}

const HotelCard: React.FC<HotelCardProps> = ({
  image,
  name,
  rating,
  reviews,
  price,
  description,
  onReserve,
}) => {
  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: { xs: "flex-start", sm: "space-between" },
        alignItems: { xs: "stretch", sm: "center" },
        borderRadius: 1,
        boxShadow: 1,
        p: 2,
        mb: 2,
        gap: { xs: 2, sm: 0 },
      }}
    >
      {/* Image with background for white images */}
      <Box
        sx={{
          width: { xs: "100%", sm: 160 },
          height: { xs: "auto", sm: "100%" },
          borderRadius: 2,
          background: "#f5f5f5", // subtle gray background to help white images stand out
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mr: { xs: 0, sm: 2 },
          mb: { xs: 2, sm: 0 },
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src={image}
          alt={name}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            background: "transparent",
            boxShadow: "0 0 0 1px #e0e0e0", // subtle border for extra contrast
          }}
        />
      </Box>

      {/* Hotel Info */}
      <CardContent
        sx={{
          flex: 1,
          p: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minWidth: 0,
        }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
          {name}
        </Typography>

        {/* Rating */}
        <Box display="flex" alignItems="center" mb={1}>
          <Rating value={rating} precision={0.5} readOnly size="small" />
          <Typography variant="body2" ml={1}>
            {rating} {reviews && `(${reviews})`}
          </Typography>
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1, lineHeight: 1.4 }}
        >
          {description}
        </Typography>
      </CardContent>

      {/* Price + Reserve */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems={{ xs: "flex-start", sm: "flex-end" }}
        justifyContent="space-between"
        height={{ xs: "auto", sm: "100%" }}
        mt={{ xs: 2, sm: 0 }}
        sx={{
          minWidth: { xs: "100%", sm: 120 },
          gap: 1,
        }}
      >
        <Typography fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
          {price}
        </Typography>
        <Button
          variant="contained"
          sx={{
            borderRadius: 2,
            backgroundColor: "purple",
            textTransform: "none",
            px: 3,
            width: { xs: "100%", sm: "auto" },
          }}
          onClick={onReserve}
        >
          Reserve
        </Button>
      </Box>
    </Card>
  );
};

export default HotelCard;
