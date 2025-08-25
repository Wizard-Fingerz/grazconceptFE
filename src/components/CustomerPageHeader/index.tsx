
import React from "react";
import { Paper, useTheme } from "@mui/material";

interface CustomerPageHeaderProps {
  children: React.ReactNode;
}

export const CustomerPageHeader: React.FC<CustomerPageHeaderProps> = ({ children }) => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        backgroundColor: theme.palette.secondary.light,
        p: { xs: 2, sm: 4 },
        mb: 3,
        borderRadius: 0,
      }}
      elevation={0}
    >
      {children}
    </Paper>
  );
};