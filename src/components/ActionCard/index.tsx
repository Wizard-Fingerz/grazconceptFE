// components/ActionCard.tsx
import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, description, onClick }) => {
  return (
    <Card
      sx={{
        width: { xs: "100%", sm: 180, md: 220, lg: 240 },
        minWidth: 0,
        borderRadius: 2,
        boxShadow: 3,
        textAlign: "center",
        p: { xs: 1.5, sm: 2 },
        transition: "all 0.3s ease",
        cursor: onClick ? "pointer" : "default",
        "&:hover": onClick
          ? {
              boxShadow: 6,
              transform: "translateY(-5px)",
            }
          : {},
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: { xs: 140, sm: 180, md: 200 },
      }}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
    >
      <CardContent
        sx={{
          p: { xs: 1.5, sm: 2 },
          "&:last-child": { pb: { xs: 1.5, sm: 2 } },
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, mb: { xs: 1.5, sm: 2 }, color: "primary.main" }}>
          {icon}
        </Box>
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          gutterBottom
          sx={{
            fontSize: { xs: "1.08rem", sm: "1.13rem", md: "1.15rem" },
            mb: { xs: 0.5, sm: 1 },
            wordBreak: "break-word",
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: { xs: "0.97rem", sm: "0.99rem" },
            wordBreak: "break-word",
            minHeight: { xs: 36, sm: 40 },
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ActionCard;
