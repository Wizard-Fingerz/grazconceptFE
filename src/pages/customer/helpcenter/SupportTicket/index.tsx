import React, { useState, useEffect, type ChangeEvent } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    TextField,
    CircularProgress,
    Chip,
    Divider,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton
} from "@mui/material";
import { toast } from "react-toastify";
import { Close as CloseIcon } from "@mui/icons-material";
import { CustomerPageHeader } from "../../../../components/CustomerPageHeader";

// Type Definitions
type TicketMessage = {
    sender: "user" | "support";
    text: string;
    timestamp: string;
};

type TicketStatus = "Open" | "Closed" | "Pending" | "Resolved";

interface Ticket {
    id: number | string;
    subject: string;
    status: TicketStatus;
    created_at: string;
    last_reply: string;
    messages: TicketMessage[];
}

type TabValue = "open" | "closed" | "all";

// Dummy services (replace with actual API calls)
const fetchTickets = async (): Promise<Ticket[]> => {
    // Simulate API call delay
    return new Promise((resolve) =>
        setTimeout(
            () =>
                resolve([
                    {
                        id: 1,
                        subject: "Issue with payment",
                        status: "Open",
                        created_at: "2024-05-10T10:00:00Z",
                        last_reply: "2024-06-02T12:00:00Z",
                        messages: [
                            {
                                sender: "user",
                                text: "I was charged twice for my subscription.",
                                timestamp: "2024-05-10T10:01:00Z"
                            },
                            {
                                sender: "support",
                                text: "Thank you for reaching out. We are investigating.",
                                timestamp: "2024-05-10T12:30:00Z"
                            }
                        ]
                    },
                    {
                        id: 2,
                        subject: "Cannot log in to my account",
                        status: "Closed",
                        created_at: "2024-04-13T16:22:00Z",
                        last_reply: "2024-04-15T09:00:00Z",
                        messages: [
                            {
                                sender: "user",
                                text: "I'm unable to log in after resetting my password.",
                                timestamp: "2024-04-13T16:23:00Z"
                            },
                            {
                                sender: "support",
                                text: "We have reset your account. Please try again.",
                                timestamp: "2024-04-15T09:00:00Z"
                            }
                        ]
                    }
                ]),
            1000
        )
    );
};

const createTicket = async ({
    subject,
    message
}: {
    subject: string;
    message: string;
}): Promise<Ticket> => {
    // Simulate API call delay
    return new Promise((resolve) =>
        setTimeout(
            () =>
                resolve({
                    id: Math.random().toString(36).slice(2),
                    subject,
                    status: "Open",
                    created_at: new Date().toISOString(),
                    last_reply: new Date().toISOString(),
                    messages: [
                        {
                            sender: "user",
                            text: message,
                            timestamp: new Date().toISOString()
                        }
                    ]
                }),
            1300
        )
    );
};

const replyToTicket = async (
    _id: number | string,
    message: string
): Promise<TicketMessage> => {
    // Simulate API call delay
    return new Promise<TicketMessage>((resolve) =>
        setTimeout(
            () =>
                resolve({
                    sender: "user",
                    text: message,
                    timestamp: new Date().toISOString()
                }),
            1000
        )
    );
};

function statusColor(status: TicketStatus | undefined): "primary" | "default" | "warning" | "success" {
    switch (status) {
        case "Open":
            return "primary";
        case "Closed":
            return "default";
        case "Pending":
            return "warning";
        case "Resolved":
            return "success";
        default:
            return "default";
    }
}

function formatDate(dateStr: string | undefined): string {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleString();
}

const SupportTicket: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [newDialogOpen, setNewDialogOpen] = useState<boolean>(false);
    const [selectedTab, setSelectedTab] = useState<TabValue>("open"); // open, closed, all
    const [createLoading, setCreateLoading] = useState<boolean>(false);
    const [subject, setSubject] = useState<string>("");
    const [message, setMessage] = useState<string>("");

    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [replyMsg, setReplyMsg] = useState<string>("");
    const [replyLoading, setReplyLoading] = useState<boolean>(false);

    useEffect(() => {
        setLoading(true);
        fetchTickets()
            .then((fetchedTickets) => {
                if (Array.isArray(fetchedTickets)) {
                    setTickets(fetchedTickets);
                } else {
                    setTickets([]);
                }
            })
            .catch(() => setTickets([]))
            .finally(() => setLoading(false));
    }, []);

    const handleOpenNewDialog = () => {
        setSubject("");
        setMessage("");
        setNewDialogOpen(true);
    };

    const handleCreateTicket = async () => {
        if (!subject.trim() || !message.trim()) {
            toast.error("Subject and message are required");
            return;
        }
        setCreateLoading(true);
        try {
            const ticket = await createTicket({ subject: subject.trim(), message: message.trim() });
            setTickets((prev) => [ticket, ...prev]);
            setNewDialogOpen(false);
            toast.success("Support ticket created successfully!");
        } catch {
            toast.error("Failed to create support ticket. Please try again.");
        }
        setCreateLoading(false);
    };

    const handleReply = async (ticketId: number | string) => {
        if (!replyMsg.trim()) {
            toast.error("Message is required");
            return;
        }
        setReplyLoading(true);
        try {
            const reply = await replyToTicket(ticketId, replyMsg.trim());
            setTickets((prev) =>
                prev.map((t) =>
                    t.id === ticketId
                        ? {
                            ...t,
                            last_reply: reply.timestamp,
                            messages: [...t.messages, reply]
                        }
                        : t
                )
            );
            // Also update selectedTicket's messages if open
            if (selectedTicket && selectedTicket.id === ticketId) {
                setSelectedTicket({
                    ...selectedTicket,
                    last_reply: reply.timestamp,
                    messages: [...selectedTicket.messages, reply]
                });
            }
            setReplyMsg("");
            toast.success("Your reply was sent.");
        } catch {
            toast.error("Failed to send reply. Please try again.");
        }
        setReplyLoading(false);
    };

    function filterTickets(tab: TabValue): Ticket[] {
        if (tab === "open") return tickets.filter((t) => t.status === "Open" || t.status === "Pending");
        if (tab === "closed") return tickets.filter((t) => t.status === "Closed" || t.status === "Resolved");
        return tickets;
    }

    const handleSubjectChange = (e: ChangeEvent<HTMLInputElement>) => setSubject(e.target.value);
    const handleMessageChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setMessage(e.target.value);
    const handleReplyMsgChange = (e: ChangeEvent<HTMLInputElement>) => setReplyMsg(e.target.value);

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
                    Suport Center
                </Typography>
              
            </CustomerPageHeader>


            {/* Sub Header */}
            <Box
                display="flex"
                flexDirection={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                mb={8}
                gap={2}
            >
                <Typography
                    variant="body1"
                    className="text-gray-700"
                    sx={{
                        maxWidth: { xs: "100%",  md: "80%", },
                        mb: { xs: 2, md: 0 }
                    }}
                >
                    Welcome to the Customer Support Center. If you are experiencing an issue or have a question about your account or our services, please submit a ticket and our team will be happy to help.
                </Typography>
                <Button variant="contained" color="primary" onClick={handleOpenNewDialog}>
                    Create Ticket
                </Button>
            </Box>



            <Tabs
                value={selectedTab}
                onChange={(_, v) => setSelectedTab(v)}
                sx={{ mb: 2 }}
            >
                <Tab value="open" label="Open" />
                <Tab value="closed" label="Closed" />
                <Tab value="all" label="All" />
            </Tabs>

            {loading ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 1 }}>Loading your tickets...</Typography>
                </Box>
            ) : filterTickets(selectedTab).length === 0 ? (
                <Typography sx={{ color: "#b17820", py: 5, textAlign: "center" }}>
                    No tickets found in this category.
                </Typography>
            ) : (
                filterTickets(selectedTab).map((ticket) => (
                    <Card
                        key={ticket.id}
                        className="rounded-2xl shadow"
                        sx={{ mb: 2, background: "#fcf8f4", borderLeft: "5px solid #F7A44A" }}
                        onClick={() => setSelectedTicket(ticket)}
                        style={{ cursor: "pointer" }}
                    >
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {ticket.subject}
                                </Typography>
                                <Chip
                                    size="small"
                                    color={statusColor(ticket.status)}
                                    label={ticket.status}
                                    sx={{ fontWeight: 500, textTransform: "capitalize" }}
                                />
                            </Box>
                            <Typography variant="body2" sx={{ color: "#966200" }}>
                                Opened: {formatDate(ticket.created_at)}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#4d2a01" }}>
                                Last update: {formatDate(ticket.last_reply)}
                            </Typography>
                        </CardContent>
                    </Card>
                ))
            )}

            {/* New Ticket Dialog */}
            <Dialog open={newDialogOpen} onClose={() => setNewDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Submit a New Support Ticket
                    <IconButton
                        aria-label="close"
                        onClick={() => setNewDialogOpen(false)}
                        sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Subject"
                        value={subject}
                        onChange={handleSubjectChange}
                        fullWidth
                        sx={{ mb: 2 }}
                        disabled={createLoading}
                        inputProps={{ maxLength: 80 }}
                        required
                    />
                    <TextField
                        label="Please describe your issue or question"
                        value={message}
                        onChange={handleMessageChange}
                        fullWidth
                        multiline
                        minRows={4}
                        required
                        disabled={createLoading}
                        inputProps={{ maxLength: 1000 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNewDialogOpen(false)} disabled={createLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={createLoading}
                        onClick={handleCreateTicket}
                    >
                        {createLoading ? <CircularProgress size={22} /> : "Submit Ticket"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Ticket Details Dialog */}
            <Dialog open={!!selectedTicket} onClose={() => setSelectedTicket(null)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedTicket?.subject}
                    <IconButton
                        aria-label="close"
                        onClick={() => setSelectedTicket(null)}
                        sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {selectedTicket && (
                        <>
                            <Box sx={{ mb: 2 }}>
                                <Chip color={statusColor(selectedTicket.status)} size="small" label={selectedTicket.status} />
                                <Typography variant="body2" sx={{ mt: 1, color: "#4d2a01" }}>
                                    Opened: {formatDate(selectedTicket.created_at)}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#4d2a01" }}>
                                    Last update: {formatDate(selectedTicket.last_reply)}
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {selectedTicket.messages.map((msg, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                                            maxWidth: "80%",
                                            bgcolor: msg.sender === "user" ? "#fff5ec" : "#e7f4f8",
                                            borderRadius: 2,
                                            p: 2,
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: "1rem",
                                                color: "#321501",
                                                fontWeight: msg.sender === "user" ? 500 : 400,
                                                wordBreak: "break-word"
                                            }}
                                        >
                                            {msg.text}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{ color: "#946d36", display: "block", mt: 1, textAlign: "right" }}
                                        >
                                            {msg.sender === "user" ? "You" : "Support"} &middot; {formatDate(msg.timestamp)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ display: selectedTicket?.status === "Closed" ? "none" : "flex" }}>
                    <Box sx={{ flex: 1, display: "flex", gap: 2, alignItems: "center" }}>
                        <TextField
                            placeholder="Reply to support..."
                            value={replyMsg}
                            onChange={handleReplyMsgChange}
                            size="small"
                            fullWidth
                            disabled={replyLoading}
                            inputProps={{ maxLength: 800 }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={replyLoading || !replyMsg.trim() || !selectedTicket}
                            onClick={() => selectedTicket && handleReply(selectedTicket.id)}
                        >
                            {replyLoading ? <CircularProgress size={20} /> : "Send"}
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SupportTicket;
