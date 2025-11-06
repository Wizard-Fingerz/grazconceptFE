import React, { useState, useEffect, useRef, type ChangeEvent } from 'react';
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
    useMediaQuery,
    useTheme,
    Slide,
    CircularProgress,
    Tooltip
} from '@mui/material';
import {
    Send as SendIcon,
    AttachFile as AttachFileIcon,
    Refresh as RefreshIcon,
    Person as PersonIcon,
    Chat as ChatIcon,
    ArrowBack as ArrowBackIcon,
    InsertDriveFile as InsertDriveFileIcon,
    Close as CloseIcon,
    Download as DownloadIcon
} from '@mui/icons-material';
import chatServices, { subscribeSessions } from '../../../../services/chatServices';
import { API_BASE_URL } from '../../../../services/api';


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

const makeUniqueMsgKey = (msg: any, idx: number) => {
    return typeof msg.id === 'string'
        ? msg.id
        : `msg-${msg.id}-${msg.timestamp || ''}-${msg.sender_type || ''}-${msg.sender_id || ''}-${idx}`;
};

// Helper function: ensure URL is absolute if needed
const makeAbsoluteUrl = (path?: string | null): string | undefined => {
    if (!path || typeof path !== 'string' || path === '') return undefined;
    // Already absolute (http, https, or data:)
    if (/^(https?:)?\/\//.test(path) || /^data:/.test(path)) return path;
    // Don't prepend API_BASE_URL if path is missing or not a relative path
    if (API_BASE_URL && path.startsWith('/')) {
        // Remove trailing slash from base url for safety
        const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        return `${base}${path}`;
    }
    return path;
};

const LiveChatWithAgent: React.FC = () => {
    const [chatSessions, setChatSessions] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [connected, setConnected] = useState(false);
    const [showChatPanel, setShowChatPanel] = useState(false);

    // New attachment state
    const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
    const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState<string | null>(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = subscribeSessions((sessions) => {
            setChatSessions(sessions);
            setLoading(false);
            if (!selectedChat && sessions.length > 0) {
                setSelectedChat(sessions[0]);
            }
        });
        chatServices.connectToSessionList();
        chatServices.listSessions();
        return unsubscribe;
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        const handleOpen = () => setConnected(true);
        const handleClose = () => setConnected(false);
        chatServices.on('open', handleOpen);
        chatServices.on('close', handleClose);
        return () => {
            chatServices.off('open', handleOpen);
            chatServices.off('close', handleClose);
        };
    }, []);

    useEffect(() => {
        if (!selectedChat || !connected) return;

        setMessages([]); // Clear old messages

        // Step 1: open chat WebSocket for this chatId
        chatServices.connectToChat(selectedChat.id);

        // Step 2: once connected, request message history
        chatServices.getMessages(selectedChat.id);

        // Step 3: listen for backend 'history' event
        const handleHistory = (msgs: any[]) => {
            if (!Array.isArray(msgs)) return;
            setMessages(
                msgs.sort(
                    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                )
            );
        };

        chatServices.on('history', handleHistory);

        // Step 4: show chat panel on mobile
        if (isMobile) setShowChatPanel(true);

        return () => {
            chatServices.off('history', handleHistory);
        };
    }, [selectedChat, connected, isMobile]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Deduplication logic for handling new messages
    useEffect(() => {
        if (!selectedChat) return;

        const handleNewMessage = (msg: any) => {
            if (msg.chat_id === selectedChat.id) {
                setMessages(prev => {
                    // Already have backend's id in state? Ignore.
                    if (prev.some(m => m.id === msg.id)) return prev;

                    // Try to match against any pending message for this chat with the same message content, sender, & sent very recently
                    const duplicateIdx = prev.findIndex(
                        m =>
                            m.status === 'pending' &&
                            m.sender_type === msg.sender_type &&
                            m.sender_id === msg.sender_id &&
                            m.message === msg.message &&
                            Math.abs(new Date(m.timestamp).getTime() - new Date(msg.timestamp).getTime()) < 15000
                    );

                    if (duplicateIdx !== -1) {
                        // Remove the optimistic pending, insert the backend (with sent status), preserving sort order
                        const merged = [...prev];
                        merged[duplicateIdx] = { ...msg, status: 'sent' };
                        return merged;
                    }

                    // General: Only push if not a dupe
                    return [...prev, msg];
                });
            }
        };

        chatServices.on && chatServices.on('history', handleNewMessage);
        return () => {
            chatServices.off && chatServices.off('message', handleNewMessage);
        };
    }, [selectedChat]);

    // Handle file input changes
    const handleAttachmentChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setAttachmentFile(file);
        if (file) {
            setAttachmentPreviewUrl(URL.createObjectURL(file));
        } else {
            setAttachmentPreviewUrl(null);
        }
    };

    const handleRemoveAttachment = () => {
        setAttachmentFile(null);
        setAttachmentPreviewUrl(null);
    };

    // Ensure when sending a message, we do not append the backend-sent message if it's already in state (to avoid duplicates)
    const handleSendMessage = async () => {
        if ((!newMessage.trim() && !attachmentFile) || !selectedChat || !connected || sending) return;
        setSending(true);

        const tempId = `msg-${Date.now()}-${Math.round(Math.random() * 10000)}`;
        const now = new Date();
        const tempMsg: any = {
            id: tempId,
            chat_id: selectedChat.id,
            sender_id: 101,
            sender_name: 'You',
            sender_type: 'customer',
            message: newMessage,
            timestamp: now.toISOString(),
            read: true,
            status: 'pending',
        };

        // Add optimistic attachment preview if present
        if (attachmentFile) {
            tempMsg.attachment_name = attachmentFile.name;
            tempMsg.attachment_url = attachmentPreviewUrl;
        }

        setMessages(prev => [...prev, tempMsg]);
        setNewMessage('');

        try {
            let sentMsg: any;
            // Use single `sendMessage` for both file and non-file case,
            // since chatServices.sendMessage handles optional attachment param now
            sentMsg = await chatServices.sendMessage(
                selectedChat.id,
                tempMsg.message,
                attachmentFile ? attachmentFile : undefined
            );

            if (typeof sentMsg === 'object' && sentMsg !== null && 'id' in sentMsg) {
                setMessages(prev => {
                    const tempIdx = prev.findIndex(m => m.id === tempId);
                    if (prev.some(m => m.id === sentMsg.id)) {
                        // Already present, just remove optimistic pending
                        return prev.filter(m => m.id !== tempId);
                    }

                    if (tempIdx !== -1) {
                        const newArr = [...prev];
                        newArr[tempIdx] = { ...sentMsg, status: 'sent' };
                        return newArr;
                    }
                    // Not found: add new
                    return [...prev, { ...sentMsg, status: 'sent' }];
                });
            } else {
                setMessages(prev =>
                    prev.map(m =>
                        m.id === tempId ? { ...m, status: 'sent' } : m
                    )
                );
            }

            setAttachmentFile(null);
            setAttachmentPreviewUrl(null);
            setSending(false);
        } catch (err: any) {
            console.error('Send message error:', err);
            setError("Message failed to send. Please try again.");
            setMessages(prev =>
                prev.map(m =>
                    m.id === tempId ? { ...m, status: 'error' } : m
                )
            );
            setSending(false);
        }
    };

    const filteredSessions = searchTerm
        ? chatSessions.filter(s =>
            (s.agent_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (s.service_title?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        )
        : chatSessions;

    const stats = {
        total: chatSessions.length,
        active: chatSessions.filter(s => s.status === 'active').length,
        unread: chatSessions.reduce((sum, s) => sum + (s.unread_count || 0), 0),
    };

    // Helper to render file preview/download icon for a message with an attachment
    function renderAttachment(msg: any) {
        // If we have an attachment_url (for optimistic messages or server-supplied link)
        if (msg.attachment_url) {
            const url = makeAbsoluteUrl(msg.attachment_url);
            const renderFileTypeIcon = (
                <InsertDriveFileIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: 18 }} />
            );
            return (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                    {renderFileTypeIcon}
                    <Typography
                        variant="body2"
                        color="inherit"
                        component="a"
                        href={url}
                        download={msg.attachment_name || 'file'}
                        target="_blank"
                        sx={{ textDecoration: 'underline', wordBreak: 'break-all' }}
                    >
                        {msg.attachment_name || 'File'}
                        <DownloadIcon sx={{ fontSize: 16, ml: 0.5, verticalAlign: 'middle' }} />
                    </Typography>
                </Stack>
            );
        }

        // Fallback: maybe backend returns a link in "attachment" (Message.attachment is a FileField)
        if (msg.attachment) {
            let fileUrl: string | undefined = undefined;
            if (typeof msg.attachment === 'string' && msg.attachment !== '') {
                fileUrl = msg.attachment;
            }
            if (msg.attachment_url) {
                fileUrl = msg.attachment_url;
            }
            const url = makeAbsoluteUrl(fileUrl);
            if (url) {
                return (
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                        <InsertDriveFileIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: 18 }} />
                        <Typography
                            variant="body2"
                            color="inherit"
                            component="a"
                            href={url}
                            download={msg.attachment_name || 'file'}
                            target="_blank"
                            sx={{ textDecoration: 'underline', wordBreak: 'break-all' }}
                        >
                            {msg.attachment_name || (typeof msg.attachment === 'string' ? msg.attachment.split('/').pop() : 'Attachment')}
                            <DownloadIcon sx={{ fontSize: 16, ml: 0.5, verticalAlign: 'middle' }} />
                        </Typography>
                    </Stack>
                );
            }
        }
        return null;
    }

    return (
        <Box sx={{ p: { xs: 1, md: 2 }, height: { md: 'calc(100vh - 100px)' } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Live Chat With Agent{' '}
                    {connected ? (
                        <Chip label="Online" size="small" color="success" sx={{ ml: 2, fontWeight: 600 }} />
                    ) : (
                        <Chip label="Offline" size="small" color="error" sx={{ ml: 2, fontWeight: 600 }} />
                    )}
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={chatServices.listSessions}
                    // Only enable refresh when disconnected
                    disabled={connected}
                >
                    Refresh
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Stats */}
            {!isMobile && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    <Box sx={{ flex: '1 1 180px', minWidth: 170, maxWidth: 320 }}>
                        <Paper sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom>Total Chats</Typography>
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
                                    <Typography color="text.secondary" gutterBottom>Active</Typography>
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
                                    <Typography color="text.secondary" gutterBottom>Unread</Typography>
                                    <Typography variant="h5" color="primary.main">{stats.unread}</Typography>
                                </Box>
                                <Badge badgeContent={stats.unread} color="primary">
                                    <ChatIcon color="primary" sx={{ fontSize: 34 }} />
                                </Badge>
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            )}

            {/* Layout */}
            <Box
                sx={{
                    display: 'flex',
                    gap: 2,
                    height: { xs: 'auto', md: 'calc(100% - 170px)' },
                    flexDirection: isMobile ? 'column' : 'row',
                }}
            >
                {/* Sessions List */}
                <Slide direction="right" in={!isMobile || !showChatPanel} mountOnEnter unmountOnExit>
                    <Box sx={{ width: { xs: '100%', md: '32%' }, display: 'flex', flexDirection: 'column' }}>
                        <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                                <TextField
                                    size="small"
                                    placeholder="Search chats..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
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
                                    {filteredSessions.length === 0 && !loading ? (
                                        <Typography variant="body2" sx={{ p: 2 }} color="text.secondary">
                                            No chats found.
                                        </Typography>
                                    ) : (
                                        filteredSessions.map((session) => (
                                            <ListItem
                                                key={String(session.id)}
                                                onClick={() => setSelectedChat(session)}
                                                sx={{
                                                    cursor: 'pointer',
                                                    borderBottom: 1,
                                                    borderColor: 'divider',
                                                    bgcolor: selectedChat?.id === session.id ? 'action.selected' : 'transparent',
                                                    '&:hover': { bgcolor: 'action.hover' },
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Badge
                                                        badgeContent={session.unread_count}
                                                        color="primary"
                                                        invisible={!session.unread_count}
                                                    >
                                                        <Avatar>
                                                            {(session.agent_name && session.agent_name.trim().length > 0)
                                                                ? session.agent_name.charAt(0).toUpperCase()
                                                                : 'A'}
                                                        </Avatar>
                                                    </Badge>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Typography variant="subtitle2" noWrap sx={{ maxWidth: '180px' }}>
                                                                {session.agent_name || 'Agent'}
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
                                                        <Box component="span">
                                                            <Typography variant="body2" color="text.secondary" noWrap component="span">
                                                                {session.service_title || ''}
                                                            </Typography>
                                                            <br />
                                                            <Typography variant="caption" color="text.secondary" component="span">
                                                                {session.last_message_at
                                                                    ? new Date(session.last_message_at).toLocaleString()
                                                                    : ''}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                                <Box sx={{ ml: 2 }}>
                                                    <Chip label={session.status} size="small" color={getStatusColor(session.status)} />
                                                </Box>
                                            </ListItem>
                                        ))
                                    )}
                                </List>
                            </Box>
                        </Paper>
                    </Box>
                </Slide>

                {/* Chat Window */}
                <Slide direction="left" in={!isMobile || showChatPanel} mountOnEnter unmountOnExit>
                    <Box sx={{ width: { xs: '100%', md: '68%' }, display: 'flex', flexDirection: 'column' }}>
                        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 350 }}>
                            {selectedChat ? (
                                <>
                                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {isMobile && (
                                            <IconButton onClick={() => setShowChatPanel(false)}>
                                                <ArrowBackIcon />
                                            </IconButton>
                                        )}
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6">{selectedChat.agent_name || 'Agent'}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {selectedChat.service_title || ''}
                                            </Typography>
                                        </Box>
                                        <Stack direction="row" spacing={1}>
                                            <Chip label={selectedChat.priority} size="small" color={getPriorityColor(selectedChat.priority)} />
                                            <Chip label={selectedChat.status} size="small" color={getStatusColor(selectedChat.status)} />
                                        </Stack>
                                    </Box>

                                    <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: 'grey.50' }}>
                                        <Stack spacing={2}>
                                            {messages.map((msg, idx) => (
                                                <Box
                                                    key={makeUniqueMsgKey(msg, idx)}
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: msg.sender_type === 'customer' ? 'flex-end' : 'flex-start',
                                                    }}
                                                >
                                                    <Paper
                                                        sx={{
                                                            p: 2,
                                                            maxWidth: '75%',
                                                            bgcolor: msg.sender_type === 'customer'
                                                                ? (msg.status === 'error' ? 'error.main' : 'primary.main')
                                                                : 'grey.100',
                                                            color: msg.sender_type === 'customer'
                                                                ? (msg.status === 'error' ? 'white' : 'white')
                                                                : 'text.primary',
                                                            opacity: msg.status === 'pending' ? 0.6 : 1,
                                                            border: msg.status === 'error' ? '2px solid #d32f2f' : undefined,
                                                        }}
                                                    >
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                                                {msg.sender_type === 'customer' ? 'You' : msg.sender_name}
                                                            </Typography>
                                                            {msg.sender_type === 'customer' && msg.status === 'pending' && (
                                                                <CircularProgress size={14} sx={{ color: 'white' }} />
                                                            )}
                                                            {msg.sender_type === 'customer' && msg.status === 'error' && (
                                                                <Typography variant="caption" color="error" sx={{ fontWeight: 700 }}>
                                                                    Failed
                                                                </Typography>
                                                            )}
                                                        </Stack>
                                                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                                            {msg.message}
                                                        </Typography>
                                                        {renderAttachment(msg)}
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

                                    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                                        <Stack direction="row" spacing={1} alignItems="flex-end">
                                            <TextField
                                                fullWidth
                                                multiline
                                                minRows={1}
                                                placeholder={connected ? 'Type your message...' : 'WebSocket not connected'}
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyDown={(e) => (e.key === 'Enter' && !e.shiftKey ? (handleSendMessage(), e.preventDefault()) : undefined)}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <input
                                                                accept="*"
                                                                style={{ display: 'none' }}
                                                                id="chat-attachment-input"
                                                                type="file"
                                                                onChange={handleAttachmentChange}
                                                                disabled={!connected || sending}
                                                            />
                                                            <label htmlFor="chat-attachment-input">
                                                                <Tooltip title="Attach a file">
                                                                    <span>
                                                                        <IconButton
                                                                            component="span"
                                                                            disabled={!connected || sending}
                                                                            color={attachmentFile ? "primary" : undefined}
                                                                        >
                                                                            <AttachFileIcon />
                                                                        </IconButton>
                                                                    </span>
                                                                </Tooltip>
                                                            </label>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                disabled={!connected || sending}
                                            />
                                            <Button
                                                variant="contained"
                                                onClick={handleSendMessage}
                                                disabled={(!newMessage.trim() && !attachmentFile) || !connected || sending}
                                                sx={{ minWidth: 48 }}
                                            >
                                                {sending ? (
                                                    <CircularProgress size={24} sx={{ color: 'white' }} />
                                                ) : (
                                                    <SendIcon />
                                                )}
                                            </Button>
                                        </Stack>

                                        {/* Attachment Preview */}
                                        {attachmentFile && (
                                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1, ml: 0.5 }}>
                                                <InsertDriveFileIcon color="primary" />
                                                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                                    {attachmentFile.name}
                                                </Typography>
                                                <Tooltip title="Remove file">
                                                    <IconButton size="small" onClick={handleRemoveAttachment}>
                                                        <CloseIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        )}
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
                </Slide>
            </Box>
        </Box>
    );
};

export default LiveChatWithAgent;
