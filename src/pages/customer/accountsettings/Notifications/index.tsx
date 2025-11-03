import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Paper,
    Divider,
    Snackbar,
    Alert,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Button,
} from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import SmsIcon from "@mui/icons-material/Sms";
import NotificationsIcon from "@mui/icons-material/Notifications";
import api from "../../../../services/api";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";

type NotificationMessage = {
    id: string | number;
    title: string;
    message: string;
    type: "email" | "sms" | "push";
    read: boolean;
    created_at: string;
};

const getTypeIcon = (type: NotificationMessage["type"]) => {
    switch (type) {
        case "email":
            return <MarkEmailReadIcon color="primary" />;
        case "sms":
            return <SmsIcon color="primary" />;
        case "push":
            return <NotificationsIcon color="primary" />;
        default:
            return <NotificationsIcon />;
    }
};

const NotificationSettingsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Fetch all user's notifications/messages from API
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        api
            .get("/users/notifications/")
            .then((res) => {
                if (isMounted && res.data && Array.isArray(res.data.results)) {
                    setNotifications(res.data.results);
                } else if (isMounted && Array.isArray(res.data)) {
                    setNotifications(res.data);
                } else {
                    setNotifications([]);
                }
            })
            .catch(() => {
                setError("Failed to load your notifications.");
                setNotifications([]);
            })
            .finally(() => isMounted && setLoading(false));
        return () => {
            isMounted = false;
        };
    }, []);

    // Optional: mark all as read
    const markAllAsRead = async () => {
        setLoading(true);
        setError(null);
        try {
            await api.post("/users/notifications/mark-all-read/");
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true }))
            );
            setSuccess("All notifications marked as read.");
        } catch {
            setError("Failed to mark notifications as read.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                px: { xs: 1, sm: 2, md: 4 },
                py: { xs: 1, sm: 2 },
                width: "100%",
                maxWidth: 1400,
                mx: "auto",
            }}
        >
            
            <CustomerPageHeader>
                <Typography variant="h4" className="font-bold mb-2">
                My Notifications
                </Typography>
            </CustomerPageHeader>
          
            <Typography variant="body1" mb={3} color="text.secondary">
                Here are your latest messages, updates, and important alerts across all channels.
            </Typography>
            <Box display="flex" justifyContent="flex-end" mb={1}>
                <Button
                    variant="text"
                    color="primary"
                    size="small"
                    disabled={loading || notifications.length === 0}
                    onClick={markAllAsRead}
                >
                    Mark all as read
                </Button>
            </Box>
            {loading ? (
                <Box display="flex" justifyContent="center" py={6}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper sx={{ p: 2, mb: 2 }} elevation={1}>
                    {notifications.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                            You have no notifications yet.
                        </Typography>
                    ) : (
                        <List sx={{ width: "100%" }}>
                            {notifications.map((n, idx) => (
                                <React.Fragment key={n.id}>
                                    <ListItem
                                        alignItems="flex-start"
                                        sx={{
                                            opacity: n.read ? 0.64 : 1,
                                            bgcolor: n.read ? undefined : "#FFFAE8",
                                            borderRadius: 1,
                                        }}
                                    >
                                        <ListItemIcon>{getTypeIcon(n.type)}</ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Box display="flex" alignItems="center">
                                                    <Typography
                                                        sx={{
                                                            fontWeight: n.read ? 500 : 700,
                                                            fontSize: "1rem",
                                                            mr: 1,
                                                        }}
                                                    >
                                                        {n.title}
                                                    </Typography>
                                                    {!n.read && (
                                                        <Chip
                                                            label="NEW"
                                                            color="warning"
                                                            size="small"
                                                            sx={{ ml: 0.5, fontWeight: 600, height: 20 }}
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ whiteSpace: "pre-line" }}
                                                    >
                                                        {n.message}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.disabled"
                                                        sx={{ display: "block", mt: 0.5 }}
                                                    >
                                                        {new Date(n.created_at).toLocaleString()}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    {idx !== notifications.length - 1 && <Divider sx={{ my: 1 }} />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Paper>
            )}
            <Snackbar
                open={!!success}
                autoHideDuration={4000}
                onClose={() => setSuccess(null)}
            >
                <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: "100%" }}>
                    {success}
                </Alert>
            </Snackbar>
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
            >
                <Alert onClose={() => setError(null)} severity="error" sx={{ width: "100%" }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default NotificationSettingsPage;
