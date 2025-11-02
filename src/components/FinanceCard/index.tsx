import React from "react";
import { Paper, CardContent, Typography, Button, Box, Stack, Divider } from "@mui/material";

interface Transaction {
    title: string;
    amount: string;
    currency?: string;
}

interface FinanceCardProps {
    title: string;
    amount: string | number;
    currency?: string;
    buttonText?: string;
    transactions?: Transaction[];
    onButtonClick?: () => void;
}

const FinanceCard: React.FC<FinanceCardProps> = ({
    title,
    amount,
    currency = "",
    buttonText,
    transactions = [],
    onButtonClick,
}) => {
    return (
        <Paper
            elevation={4}
            sx={{
                width: 280,
                minHeight: 250,
                borderRadius: 1.5,
                background: "#fff",
                position: "relative",
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                    {/* Show the currency before the amount, e.g., NGN 5,000 */}
                    {currency ? `${currency} ` : ""}
                    {amount}
                </Typography>

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
                            backgroundColor: "#f5be52",
                            color: "#292100",
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
                            <span>
                                {/* Show currency per transaction if provided, else use card currency */}
                                {item.currency ? `${item.currency} ` : (currency ? `${currency} ` : "")}
                                {item.amount}
                            </span>
                        </Box>
                    ))}
                </Stack>
            </CardContent>
        </Paper>
    );
};

export default FinanceCard;
