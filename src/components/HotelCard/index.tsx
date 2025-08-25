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
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: 1, // Reduced borderRadius
        boxShadow: 1,    // Reduced elevation
        p: 2,
        mb: 2,
      }}
    >
      {/* Image */}
      <Box
        component="img"
        src={image}
        alt={name}
        sx={{
          width: 160,
          height: 120,
          borderRadius: 2,
          objectFit: "cover",
          mr: 2,
        }}
      />

      {/* Hotel Info */}
      <CardContent
        sx={{
          flex: 1,
          p: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
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
        alignItems="flex-end"
        justifyContent="space-between"
        height="100%"
      >
        <Typography fontWeight="bold" color="text.primary">
          {price}
        </Typography>
        <Button
          variant="contained"
          sx={{
            mt: "auto",
            borderRadius: 2,
            backgroundColor: "purple",
            textTransform: "none",
            px: 3,
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
