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
import chatServices from '../../../../services/chatServices';

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'urgent':
            return 'error';
        case 'high':
            return 'warning';
        case 'medium':
            return 'info';
        case 'low':
            return 'success';
        default:
            return 'default';
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active':
            return 'success';
        case 'resolved':
            return 'info';
        case 'closed':
            return 'default';
        default:
            return 'default';
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
    const [connected, setConnected] = useState(false);
    const [firstSessionListReceived, setFirstSessionListReceived] = useState(false);
    const [tryingToConnect, setTryingToConnect] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTryingToConnect(true);
        chatServices.connectToSessionList();
        return () => {
            chatServices.disconnectAll?.();
        };
    }, []);

    useEffect(() => {
        let didUnmount = false;

        const handleOpen = () => {
            if (!didUnmount) {
                setConnected(true);
                setTryingToConnect(false);
                setError(null);
                chatServices.listSessions();
            }
        };
        const handleClose = () => {
            if (!didUnmount) {
                setConnected(false);
                setTryingToConnect(true);
            }
        };
        const handleError = () => {
            if (!didUnmount) {
                if (!connected) {
                    setTryingToConnect(true);
                    setError(null);
                }
            }
        };

        const handleMessage = (msg: any) => {
            // Accept 'sessions_list', 'chats', or 'chat' as main session list updates
            if (msg.type === 'connection_successful') {
                if (!didUnmount) {
                    setConnected(true);
                    setTryingToConnect(false);
                    setError(null);
                }
            }

            // Accept both 'sessions_list' and 'chats', and also 'chat'
            if (
                ((msg.type === 'sessions_list' || msg.type === 'chats' || msg.type === 'chat') &&
                 Array.isArray(msg.sessions))
            ) {
                if (!didUnmount) {
                    // Defensive: ensure session id is string (sometimes backend sends numbers)
                    // Also, handle possibility that msg.sessions is an array-like object (some APIs send NodeList, etc)
                    let sessions: any[] = [];
                    try {
                        // Try to convert msg.sessions to a true array if not already
                        sessions = Array.isArray(msg.sessions)
                            ? msg.sessions
                            : Array.from(msg.sessions);
                    } catch (e) {
                        sessions = [];
                    }
                    // Defensive: also filter out empty objects/null
                    sessions = sessions.filter(Boolean).map((sess: any) => ({
                        ...sess,
                        id: String(sess.id),
                    }));

                    setChatSessions(sessions);

                    // If nothing selected or selectedChat id not in new data, pick first one
                    const existing = selectedChat && sessions.find((s: any) => s.id === selectedChat.id);
                    if (!existing && sessions.length > 0) {
                        setSelectedChat(sessions[0]);
                    } else if (existing) {
                        setSelectedChat(sessions.find((s: any) => s.id === selectedChat.id));
                    }

                    if (!firstSessionListReceived) {
                        setLoading(false);
                        setFirstSessionListReceived(true);
                    }
                }
            }

            if (msg.type === "session_messages" && selectedChat && msg.chat_id === selectedChat.id) {
                setMessages(msg.messages || []);
                setLoading(false);
            }
            if (msg.type === "new_message" && selectedChat && msg.message && msg.message.chat_id === selectedChat.id) {
                setMessages(prev => [...prev, msg.message]);
            }
            if (msg.type === "session_updated") {
                setChatSessions(prev =>
                    prev.map(sess => sess.id === String(msg.session.id) ? { ...sess, ...msg.session, id: String(msg.session.id) } : sess)
                );
            }
        };

        chatServices.on('open', handleOpen);
        chatServices.on('close', handleClose);
        chatServices.on('error', handleError);
        chatServices.on('message', handleMessage);

        setLoading(true);
        setFirstSessionListReceived(false);

        return () => {
            didUnmount = true;
            chatServices.off('open', handleOpen);
            chatServices.off('close', handleClose);
            chatServices.off('error', handleError);
            chatServices.off('message', handleMessage);
        };
        // We intentionally do NOT add selectedChat/firstSessionListReceived as deps:
        // The handler always refers to the latest value.
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            // @ts-ignore
            if (chatServices.ws) {
                // @ts-ignore
                if (chatServices.ws.readyState === 1 && !connected) {
                    setConnected(true);
                    setTryingToConnect(false);
                }
                else if (
                    // @ts-expect-error: ws may not exist on chatServices type
                    (!chatServices.ws || chatServices.ws.readyState !== 1) && connected
                ) {
                    setConnected(false);
                    setTryingToConnect(true);
                }
            }
        }, 1500);
        return () => clearInterval(interval);
    }, [connected]);

    useEffect(() => {
        if (selectedChat && connected) {
            setMessages([]);
            setLoading(true);
            chatServices.getMessages(selectedChat.id);
        }
    }, [selectedChat, connected]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (connected && error) {
            setError(null);
        }
        if (connected) {
            setTryingToConnect(false);
        }
    }, [connected, error]);

    useEffect(() => {
        if (connected && tryingToConnect) {
            setTryingToConnect(false);
        }
    }, [connected, tryingToConnect]);

    const loadChatSessions = () => {
        if (connected && !loading) {
            setLoading(true);
            setFirstSessionListReceived(false);
            chatServices.listSessions();
        } else if (!connected) {
            setTryingToConnect(true);
            setError(null);
            chatServices.connectToSessionList();
        }
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedChat || !connected) return;
        try {
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
            chatServices.sendMessage(selectedChat.id, newMessage);
            setNewMessage('');
        } catch (err) {
            setError('Could not send your message.');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // New: In case all sessions have blank agent_name or service_title, fallback to show them all
    let filteredSessions = [];
    const search = searchTerm.trim().toLowerCase();
    if (!search) {
        filteredSessions = chatSessions;
    } else {
        filteredSessions = chatSessions.filter(session =>
            (session.agent_name ? session.agent_name.toLowerCase() : '').includes(search) ||
            (session.service_title ?? '').toLowerCase().includes(search)
        );
    }

    const stats = {
        total: chatSessions.length,
        active: chatSessions.filter(s => s.status === 'active').length,
        unread: chatSessions.reduce((sum, s) => sum + (s.unread_count || 0), 0),
    };

    return (
        <Box sx={{ p: { xs: 1, md: 2 }, height: { md: 'calc(100vh - 100px)' } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Live Chat With Agent {connected ? (
                        <Chip label="Connected" size="small" color="success" sx={{ ml: 2, fontWeight: 600 }} />
                    ) : (
                        <Chip label="Disconnected" size="small" color="error" sx={{ ml: 2, fontWeight: 600 }} />
                    )}
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={loadChatSessions}
                    // Enable the button if disconnected, disable only when connected
                    disabled={connected}
                >
                    Refresh
                </Button>
            </Box>

            {tryingToConnect && !connected && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Trying to connect...
                </Alert>
            )}
            {error && !tryingToConnect && (
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
                                        {chatSessions.length === 0 && !loading
                                            ? "No chats found."
                                            // If chats exist, the filter matched nothing:
                                            : (searchTerm.trim() ? "No chats matching your search." : "No chats found.")
                                        }
                                    </Typography>
                                )}
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
                                                invisible={!session.unread_count}
                                            >
                                                <Avatar>
                                                    {session.agent_name
                                                        ? session.agent_name.trim().length > 0
                                                            ? session.agent_name.charAt(0).toUpperCase()
                                                            : "A"
                                                        : "A"}
                                                </Avatar>
                                            </Badge>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="subtitle2" noWrap sx={{ maxWidth: '180px' }}>
                                                        {(session.agent_name && session.agent_name.trim().length > 0)
                                                            ? session.agent_name
                                                            : 'Agent'}
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
                                                        {session.service_title ? session.service_title : ''}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {session.last_message_at ? (new Date(session.last_message_at).toLocaleString()) : ""}
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
                                                {(selectedChat.agent_name && selectedChat.agent_name.trim().length > 0)
                                                    ? selectedChat.agent_name
                                                    : "Agent"}
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
                                                        {msg.timestamp
                                                            ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                            : ''}
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
                                            placeholder={connected ? "Type your message..." : "WebSocket not connected"}
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
                                            disabled={!connected}
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim() || !connected}
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
