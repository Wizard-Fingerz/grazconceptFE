import React from "react";
import { Paper, CardContent, Typography, Button, Box, Stack, Divider } from "@mui/material";

interface Transaction {
    title: string;
    amount: string;
}

interface FinanceCardProps {
    title: string;
    amount: string;
    buttonText?: string;
    transactions?: Transaction[];
    onButtonClick?: () => void;
}

const FinanceCard: React.FC<FinanceCardProps> = ({
    title,
    amount,
    buttonText,
    transactions = [],
    onButtonClick,
}) => {
    return (
        <Paper
            elevation={4}
            sx={{
                width: 280,
                minHeight: 250,         // Increased card height
                borderRadius: 1.5,      // Reduced border radius (from 3)
                background: "#fff",
                position: "relative",
            }}
        >
            <CardContent sx={{ p: 3 }}> {/* Increased padding (was default) */}
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                    {amount}
                </Typography>

                {/* Reduced/reuse button with non-white color */}
                {buttonText && (
                    <Button
                        variant="contained"
                        size="small"
                        onClick={onButtonClick}
                        sx={{
                            textTransform: "none",
                            mt: 1.2,
                            mb: 1.2,
                            py: 0.35,
                            px: 2,
                            minWidth: "unset",
                            fontSize: "0.9rem",
                            backgroundColor: "#f5be52", // Use a gold-like color (not white)
                            color: "#292100", // Dark contrasting text
                            boxShadow: "none",
                            borderRadius: "8px",
                            "&:hover": { backgroundColor: "#dca90f" },
                        }}
                    >
                        {buttonText}
                    </Button>
                )}

                <Divider sx={{ mb: 4, mt: 4 }} />
                <Typography variant="subtitle2" gutterBottom>
                    Recent {title.includes("Wallet") ? "Transactions" : "Loans"}
                </Typography>

                <Stack spacing={0.5}>
                    {transactions.map((item, index) => (
                        <Box
                            key={index}
                            display="flex"
                            justifyContent="space-between"
                            sx={{ color: "#444", fontSize: "0.875rem" }}
                        >
                            <span>{item.title}</span>
                            <span>{item.amount}</span>
                        </Box>
                    ))}
                </Stack>
            </CardContent>
        </Paper>
    );
};

export default FinanceCard;
