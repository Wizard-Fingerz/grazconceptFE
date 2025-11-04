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
import NotificationsIcon from "@mui/icons-material/Notifications";
import api from "../../../../services/api";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";

// Updated type: support "notification_type" and "is_read" fields, and fallback for previous structure
type NotificationMessage = {
    id: string | number;
    title: string;
    message: string;
    notification_type?: string;
    type?: "email" | "sms" | "push" | string;
    is_read?: boolean;
    read?: boolean;
    created_at: string;
};

const getTypeIcon = (_type?: NotificationMessage["type"] | string) => {
    // You can expand to SMS/Email if needed
    return <NotificationsIcon color="primary" />;
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
            .get("/notification/notifications/")
            .then((res) => {
                // API may send data in .results, or as an array directly
                let fetchedNotifications: NotificationMessage[] = [];
                if (isMounted && res.data && Array.isArray(res.data.results)) {
                    fetchedNotifications = res.data.results;
                } else if (isMounted && Array.isArray(res.data)) {
                    fetchedNotifications = res.data;
                }
                // Filter out falsy values and ensure each notification has an id, title, message, created_at
                if (
                    isMounted &&
                    Array.isArray(fetchedNotifications) &&
                    fetchedNotifications.length > 0
                ) {
                    setNotifications(
                        fetchedNotifications.filter(
                            (n) =>
                                n &&
                                (typeof n.id === "string" || typeof n.id === "number") &&
                                n.title &&
                                n.message &&
                                n.created_at
                        )
                    );
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
            await api.post("/notification/notifications/mark-all-read/");
            setNotifications((prev) =>
                prev.map((n) => ({
                    ...n,
                    is_read: true,
                    read: true,
                }))
            );
            setSuccess("All notifications marked as read.");
        } catch {
            setError("Failed to mark notifications as read.");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fix hydration error:
     * Avoid a <p> inside another <p>.
     * Material-UI <Typography> with `variant="body2"` renders as <p> by default,
     * and the ListItemText.secondary also renders as <p>. Nesting would cause <p><p>...</p></p>.
     * Solution: Render inner Typography (for message body) as <span>.
     */

    // Distinguish unread and read in the UI, but show ALL notifications
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
                            {notifications.map((n, idx) => {
                                // is_read: boolean (API), read: boolean (legacy/frontend)
                                const isRead =
                                    typeof n.is_read === "boolean"
                                        ? n.is_read
                                        : typeof n.read === "boolean"
                                        ? n.read
                                        : false;
                                return (
                                    <React.Fragment key={n.id}>
                                        <ListItem
                                            alignItems="flex-start"
                                            sx={{
                                                opacity: isRead ? 0.64 : 1,
                                                bgcolor: !isRead ? "#FFFAE8" : undefined,
                                                borderRadius: 1,
                                                mb: 0.5,
                                            }}
                                        >
                                            <ListItemIcon>{getTypeIcon(n.notification_type || n.type)}</ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Box display="flex" alignItems="center">
                                                        <Typography
                                                            sx={{
                                                                fontWeight: isRead ? 500 : 700,
                                                                fontSize: "1rem",
                                                                mr: 1,
                                                            }}
                                                        >
                                                            {n.title}
                                                        </Typography>
                                                        {!isRead && (
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
                                                            component="span"
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
                                );
                            })}
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
