// components/ActionCard.tsx
import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, description }) => {
  return (
    <Card
      sx={{
        width: { xs: 140, sm: 180, md: 220, lg: 240 },
        minWidth: 0,
        borderRadius: 1,
        boxShadow: 3,
        textAlign: "center",
        p: { xs: 1, sm: 2 },
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: 6,
          transform: "translateY(-5px)",
        },
      }}
    >
      <CardContent sx={{ p: { xs: 1, sm: 2 }, "&:last-child": { pb: { xs: 1, sm: 2 } } }}>
        <Box sx={{ fontSize: { xs: 28, sm: 32, md: 40 }, mb: { xs: 1, sm: 2 }, color: "primary.main" }}>
          {icon}
        </Box>
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          gutterBottom
          sx={{ fontSize: { xs: "1rem", sm: "1.1rem", md: "1.15rem" } }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: { xs: "0.85rem", sm: "0.95rem" } }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ActionCard;
