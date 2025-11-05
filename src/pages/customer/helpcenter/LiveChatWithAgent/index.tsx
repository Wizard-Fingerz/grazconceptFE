import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    Stack,
    TextField,
    Button,
    InputAdornment,
    Chip,
    IconButton,
    Badge,
    Alert,
    CircularProgress,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
} from '@mui/material';
import {
    Send as SendIcon,
    AttachFile as AttachFileIcon,
    Refresh as RefreshIcon,
    Person as PersonIcon,
    Chat as ChatIcon,
} from '@mui/icons-material';

// MOCK DATA (Replace with API integration as needed)
const mockChatSessions = [
    {
        id: 'chat-1',
        agent_id: 1,
        agent_name: 'Agent Smith',
        status: 'active',
        last_message_at: new Date().toISOString(),
        unread_count: 1,
        priority: 'high',
        service_title: 'General Inquiries',
    },
    {
        id: 'chat-2',
        agent_id: 2,
        agent_name: 'Agent Johnson',
        status: 'resolved',
        last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        unread_count: 0,
        priority: 'low',
        service_title: 'Document Upload Help',
    }
];

const mockMessages = [
    {
        id: 'msg-1',
        chat_id: 'chat-1',
        sender_id: 101,
        sender_name: 'You',
        sender_type: 'customer',
        message: "Hi, I need help understanding the next steps for my visa application.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        read: true,
    },
    {
        id: 'msg-2',
        chat_id: 'chat-1',
        sender_id: 1,
        sender_name: 'Agent Smith',
        sender_type: 'agent',
        message: "Hello! Sure, I'd be happy to assist. Have you completed your biometrics?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.5).toISOString(),
        read: true,
    },
    {
        id: 'msg-3',
        chat_id: 'chat-1',
        sender_id: 101,
        sender_name: 'You',
        sender_type: 'customer',
        message: "Yes, completed yesterday. What's next?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        read: false,
    }
];

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'urgent': return 'error';
        case 'high': return 'warning';
        case 'medium': return 'info';
        case 'low': return 'success';
        default: return 'default';
    }
};
const getStatusColor = (status: string) => {
    switch (status) {
        case 'active': return 'success';
        case 'resolved': return 'info';
        case 'closed': return 'default';
        default: return 'default';
    }
};

const LiveChatWithAgent: React.FC = () => {
    const [chatSessions, setChatSessions] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadChatSessions();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (selectedChat) {
            loadMessages(selectedChat.id);
        } else {
            setMessages([]);
        }
        // eslint-disable-next-line
    }, [selectedChat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadChatSessions = async () => {
        try {
            setLoading(true);
            setError(null);
            // Replace with API call
            setChatSessions(mockChatSessions);
            if (!selectedChat && mockChatSessions.length > 0) {
                setSelectedChat(mockChatSessions[0]);
            }
        } catch (err) {
            setError('Failed to load your chats');
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (chatId: string) => {
        try {
            // Replace with API call specific to chatId
            // For demonstration, use mock
            setMessages(mockMessages.filter(msg => msg.chat_id === chatId));
        } catch (err) {
            setError('Could not load your messages');
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;
        try {
            // Simulate sending: append to messages
            const msg = {
                id: `msg-${Date.now()}`,
                chat_id: selectedChat.id,
                sender_id: 101,
                sender_name: 'You',
                sender_type: 'customer',
                message: newMessage,
                timestamp: new Date().toISOString(),
                read: true,
            };
            setMessages(prev => [...prev, msg]);
            setNewMessage('');
            // Optionally, call API here
        } catch (err) {
            setError('Could not send your message.');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const filteredSessions = chatSessions.filter(session =>
        session.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (session.service_title ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: chatSessions.length,
        active: chatSessions.filter(s => s.status === 'active').length,
        unread: chatSessions.reduce((sum, s) => sum + s.unread_count, 0),
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 1, md: 2 }, height: { md: 'calc(100vh - 100px)' } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Live Chat With Agent
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={loadChatSessions}
                >
                    Refresh
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Stats Cards */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box sx={{ flex: '1 1 180px', minWidth: 170, maxWidth: 320 }}>
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography color="text.secondary" gutterBottom>
                                    Total Chats
                                </Typography>
                                <Typography variant="h5">{stats.total}</Typography>
                            </Box>
                            <ChatIcon color="primary" sx={{ fontSize: 38 }} />
                        </Box>
                    </Paper>
                </Box>
                <Box sx={{ flex: '1 1 180px', minWidth: 170, maxWidth: 320 }}>
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography color="text.secondary" gutterBottom>
                                    Active
                                </Typography>
                                <Typography variant="h5" color="success.main">{stats.active}</Typography>
                            </Box>
                            <PersonIcon color="success" sx={{ fontSize: 38 }} />
                        </Box>
                    </Paper>
                </Box>
                <Box sx={{ flex: '1 1 180px', minWidth: 170, maxWidth: 320 }}>
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography color="text.secondary" gutterBottom>
                                    Unread
                                </Typography>
                                <Typography variant="h5" color="primary.main">{stats.unread}</Typography>
                            </Box>
                            <Badge badgeContent={stats.unread} color="primary">
                                <ChatIcon color="primary" sx={{ fontSize: 34 }} />
                            </Badge>
                        </Box>
                    </Paper>
                </Box>
            </Box>

            <Box sx={{
                display: 'flex',
                gap: 2,
                height: { xs: 'auto', md: 'calc(100% - 170px)' }
            }}>
                {/* Chat Sessions List */}
                <Box
                    sx={{
                        width: { xs: '100%', md: '32%' },
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        mb: { xs: 2, md: 0 }
                    }}
                >
                    <Paper sx={{ flex: '1 1 0%', display: 'flex', flexDirection: 'column', height: { md: '100%' } }}>
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                            <TextField
                                size="small"
                                placeholder="Search chats..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                fullWidth
                            />
                        </Box>
                        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                            <List>
                                {filteredSessions.length === 0 && (
                                    <Typography variant="body2" sx={{ p: 2 }} color="text.secondary">
                                        No chats found.
                                    </Typography>
                                )}
                                {/* Fixed ListItem: remove component="div" and do not use non-li container for ListItem */}
                                {filteredSessions.map((session) => (
                                    <ListItem
                                        key={session.id}
                                        component="div"
                                        onClick={() => setSelectedChat(session)}
                                        sx={{
                                            cursor: 'pointer',
                                            borderBottom: 1,
                                            borderColor: 'divider',
                                            display: 'flex',
                                            alignItems: 'center',
                                            bgcolor: selectedChat?.id === session.id ? 'action.selected' : 'transparent',
                                            '&:hover': {
                                                bgcolor: 'action.hover',
                                            },
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Badge
                                                badgeContent={session.unread_count}
                                                color="primary"
                                                invisible={session.unread_count === 0}
                                            >
                                                <Avatar>
                                                    {session.agent_name.charAt(0)}
                                                </Avatar>
                                            </Badge>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="subtitle2">
                                                        {session.agent_name}
                                                    </Typography>
                                                    <Chip
                                                        label={session.priority}
                                                        size="small"
                                                        color={getPriorityColor(session.priority)}
                                                        sx={{ fontSize: 12, height: 22 }}
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" noWrap>
                                                        {session.service_title}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(session.last_message_at).toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <Box sx={{ ml: 2 }}>
                                            <Chip
                                                label={session.status}
                                                size="small"
                                                color={getStatusColor(session.status)}
                                            />
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Paper>
                </Box>
                {/* Chat Messages */}
                <Box
                    sx={{
                        width: { xs: '100%', md: '68%' },
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 350 }}>
                        {selectedChat ? (
                            <>
                                {/* Chat Header */}
                                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="h6">
                                                {selectedChat.agent_name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {selectedChat.service_title || 'Agent'}
                                            </Typography>
                                        </Box>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Chip
                                                label={selectedChat.priority}
                                                size="small"
                                                color={getPriorityColor(selectedChat.priority)}
                                            />
                                            <Chip
                                                label={selectedChat.status}
                                                size="small"
                                                color={getStatusColor(selectedChat.status)}
                                            />
                                        </Stack>
                                    </Box>
                                </Box>
                                {/* Messages */}
                                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: 'grey.50' }}>
                                    <Stack spacing={2}>
                                        {messages.map((msg) => (
                                            <Box
                                                key={msg.id}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: msg.sender_type === 'customer' ? 'flex-end' : 'flex-start'
                                                }}
                                            >
                                                <Paper
                                                    sx={{
                                                        p: 2,
                                                        maxWidth: '75%',
                                                        bgcolor: msg.sender_type === 'customer' ? 'primary.main' : 'grey.100',
                                                        color: msg.sender_type === 'customer' ? 'white' : 'text.primary',
                                                    }}
                                                >
                                                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                                        {msg.sender_type === 'customer' ? "You" : msg.sender_name}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                                        {msg.message}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Typography>
                                                </Paper>
                                            </Box>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </Stack>
                                </Box>
                                {/* Message Input */}
                                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                                    <Stack direction="row" spacing={1}>
                                        <TextField
                                            fullWidth
                                            placeholder="Type your message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton>
                                                            <AttachFileIcon />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim()}
                                        >
                                            <SendIcon />
                                        </Button>
                                    </Stack>
                                </Box>
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <Typography variant="h6" color="text.secondary">
                                    Select a chat to begin talking to your agent.
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default LiveChatWithAgent;
