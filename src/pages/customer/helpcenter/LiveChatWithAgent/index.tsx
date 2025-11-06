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
  useMediaQuery,
  useTheme,
  Slide,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Chat as ChatIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import chatServices, { subscribeSessions } from '../../../../services/chatServices';

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
  const [sending, setSending] = useState(false); // New state for message sending
  const [connected, setConnected] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to chat sessions
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
    // NOTE: purposely omitting selectedChat from deps to avoid infinite session overwrite loop.
    // eslint-disable-next-line
  }, []);

  // Connection events
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

  // Messages for selected chat
  useEffect(() => {
    if (selectedChat && connected) {
      setMessages([]);
      chatServices.getMessages(selectedChat.id);
      if (isMobile) setShowChatPanel(true);
    }
  }, [selectedChat, connected, isMobile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // FIX: Send message to the backend using chatServices.sendMessage and ensure message is pushed only
  // after confirmation from the backend or using a mechanism to sync new messages.

  // We will listen for new messages from the backend in real-time using an event handler
  useEffect(() => {
    if (!selectedChat) return;

    // Handler for new messages from backend (simulate push from websocket or polling)
    const handleNewMessage = (msg: any) => {
      // Only append messages for the current chat session
      if (msg.chat_id === selectedChat.id) {
        setMessages(prev => {
          // Avoid duplication by id
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };

    chatServices.on && chatServices.on('message', handleNewMessage);

    return () => {
      chatServices.off && chatServices.off('message', handleNewMessage);
    };
  }, [selectedChat]);

  // Updated send message logic
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !connected || sending) return;
    setSending(true);

    const tempId = `msg-${Date.now()}-${Math.round(Math.random() * 10000)}`;
    const tempMsg = {
      id: tempId, // temporary id for optimistic UI
      chat_id: selectedChat.id,
      sender_id: 101,
      sender_name: 'You',
      sender_type: 'customer',
      message: newMessage,
      timestamp: new Date().toISOString(),
      read: true,
      status: 'pending',
    };
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage('');

    try {
      // Call the backend and await for the response
      // If backend returns the saved message (with real id & info), update local messages accordingly
      const sentMsg = await chatServices.sendMessage(selectedChat.id, tempMsg.message);

      // If chatServices.sendMessage returns the created message object, merge it
      if (typeof sentMsg === 'object' && sentMsg !== null && 'id' in sentMsg) {
        setMessages(prev =>
          prev.map(m =>
            m.id === tempId
              ? { ...(sentMsg as Record<string, any>), status: 'sent' }
              : m
          )
        );
      
      } else {
        // Fallback: just mark as sent
        setMessages(prev => prev.map(m =>
          m.id === tempId ? { ...m, status: 'sent' } : m
        ));
      }

      setSending(false);
    } catch (err: any) {
      setError("Message failed to send. Please try again.");
      // Mark last "pending" message as errored
      setMessages(prev =>
        prev.map(m =>
          m.id === tempId
            ? { ...m, status: 'error' }
            : m
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

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, height: { md: 'calc(100vh - 100px)' } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Live Chat With Agent{' '}
          {connected ? (
            <Chip label="Connected" size="small" color="success" sx={{ ml: 2, fontWeight: 600 }} />
          ) : (
            <Chip label="Disconnected" size="small" color="error" sx={{ ml: 2, fontWeight: 600 }} />
          )}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={chatServices.listSessions}
          disabled={!connected}
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
                        key={session.id}
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
                      {messages.map((msg) => (
                        <Box
                          key={msg.id}
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
                              {/* Sending/Delivered/Error indicator */}
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
                    <Stack direction="row" spacing={1}>
                      <TextField
                        fullWidth
                        placeholder={connected ? 'Type your message...' : 'WebSocket not connected'}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => (e.key === 'Enter' && !e.shiftKey ? (handleSendMessage(), e.preventDefault()) : undefined)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton disabled>
                                <AttachFileIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        disabled={!connected || sending}
                      />
                      <Button
                        variant="contained"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || !connected || sending}
                        sx={{ minWidth: 48 }}
                      >
                        {sending ? (
                          <CircularProgress size={24} sx={{ color: 'white' }} />
                        ) : (
                          <SendIcon />
                        )}
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
        </Slide>
      </Box>
    </Box>
  );
};

export default LiveChatWithAgent;
