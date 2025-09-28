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
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  Avatar,
  Badge,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Assignment as AssignmentIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { mockMarketplaceData } from '../../../services/marketplaceService';
import type { ChatSession, ChatMessage } from '../../../types/marketplace';

const ChatManagementPage: React.FC = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat sessions
  useEffect(() => {
    loadChatSessions();
  }, [statusFilter, priorityFilter]);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use mock data. Replace with actual API call
      const data = mockMarketplaceData.chatSessions;
      setChatSessions(data);
    } catch (err) {
      setError('Failed to load chat sessions');
      console.error('Error loading chat sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      // await marketplaceApi.getChatMessages(chatId);
      
      // Mock messages for development
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          chat_id: chatId,
          sender_id: 101,
          sender_name: 'John Doe',
          sender_type: 'customer',
          message: 'Hi, I\'m interested in the iPhone 15 Pro Max. Is it still available?',
          message_type: 'text',
          product_id: '1',
          timestamp: '2024-01-15T08:00:00Z',
          read: true
        },
        {
          id: '2',
          chat_id: chatId,
          sender_id: 1,
          sender_name: 'Agent Smith',
          sender_type: 'agent',
          message: 'Hello! Yes, the iPhone 15 Pro Max is still available. We have 4 units in stock.',
          message_type: 'text',
          product_id: '1',
          timestamp: '2024-01-15T08:05:00Z',
          read: true
        },
        {
          id: '3',
          chat_id: chatId,
          sender_id: 101,
          sender_name: 'John Doe',
          sender_type: 'customer',
          message: 'Great! What\'s the best price you can offer?',
          message_type: 'text',
          product_id: '1',
          timestamp: '2024-01-15T08:10:00Z',
          read: false
        },
        {
          id: '4',
          chat_id: chatId,
          sender_id: 1,
          sender_name: 'Agent Smith',
          sender_type: 'agent',
          message: 'I can offer you a 5% discount, bringing the price down to ₦1,140,000. Would that work for you?',
          message_type: 'text',
          product_id: '1',
          timestamp: '2024-01-15T08:15:00Z',
          read: false
        }
      ];
      
      setMessages(mockMessages);
    } catch (err) {
      setError('Failed to load messages');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const message: Omit<ChatMessage, 'id' | 'timestamp' | 'read'> = {
        chat_id: selectedChat.id,
        sender_id: 1, // Current agent ID
        sender_name: 'Agent Smith',
        sender_type: 'agent',
        message: newMessage,
        message_type: 'text',
        product_id: selectedChat.product_id
      };

      // await marketplaceApi.sendMessage(selectedChat.id, message);
      
      // Add message to local state
      const newMsg: ChatMessage = {
        ...message,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: true
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const handleAssignChat = async () => {
    if (!selectedChat || !selectedAgent) return;

    try {
      // await marketplaceApi.assignChat(selectedChat.id, selectedAgent);
      
      setChatSessions(prev => prev.map(chat => 
        chat.id === selectedChat.id 
          ? { ...chat, agent_id: selectedAgent, agent_name: `Agent ${selectedAgent}` }
          : chat
      ));
      
      setAssignDialogOpen(false);
      setSelectedAgent(null);
    } catch (err) {
      setError('Failed to assign chat');
    }
  };

  // const handleUpdateChatStatus = async (chatId: string, status: string) => {
  //   try {
  //     // await marketplaceApi.updateChatStatus(chatId, status);
      
  //     setChatSessions(prev => prev.map(chat => 
  //       chat.id === chatId ? { ...chat, status: status as any } : chat
  //     ));
  //   } catch (err) {
  //     setError('Failed to update chat status');
  //   }
  // };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  const filteredSessions = chatSessions.filter(session => {
    if (searchTerm && !session.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !session.product_title?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (statusFilter && session.status !== statusFilter) {
      return false;
    }
    if (priorityFilter && session.priority !== priorityFilter) {
      return false;
    }
    return true;
  });

  const stats = {
    total: chatSessions.length,
    active: chatSessions.filter(s => s.status === 'active').length,
    unassigned: chatSessions.filter(s => !s.agent_id).length,
    unread: chatSessions.reduce((sum, s) => sum + s.unread_count, 0)
  };

  // Helper for filter menu
  const handleFilterChange = (type: string, value: string | null) => {
    if (type === 'status') {
      setStatusFilter(value || '');
      setFilterMenuAnchor(null);
    } else if (type === 'priority') {
      setPriorityFilter(value || '');
      setFilterMenuAnchor(null);
    } else if (type === 'clear') {
      setStatusFilter('');
      setPriorityFilter('');
      setFilterMenuAnchor(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, height: 'calc(100vh - 100px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Client-Product Chat
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
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ flex: '1 1 200px', minWidth: 200, maxWidth: 400 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Chats
                  </Typography>
                  <Typography variant="h4">{stats.total}</Typography>
                </Box>
                <ChatIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 200, maxWidth: 400 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Active
                  </Typography>
                  <Typography variant="h4" color="success.main">{stats.active}</Typography>
                </Box>
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 200, maxWidth: 400 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Unassigned
                  </Typography>
                  <Typography variant="h4" color="warning.main">{stats.unassigned}</Typography>
                </Box>
                <Badge badgeContent={stats.unassigned} color="warning">
                  <PersonIcon color="warning" sx={{ fontSize: 40 }} />
                </Badge>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 200px', minWidth: 200, maxWidth: 400 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Unread Messages
                  </Typography>
                  <Typography variant="h4" color="primary.main">{stats.unread}</Typography>
                </Box>
                <Badge badgeContent={stats.unread} color="primary">
                  <ChatIcon color="primary" sx={{ fontSize: 40 }} />
                </Badge>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Main Content Layout */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          height: 'calc(100% - 200px)',
        }}
      >
        {/* Chat Sessions List */}
        <Box
          sx={{
            flex: { xs: '1 1 100%', md: '0 0 33.3333%' },
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  size="small"
                  placeholder="Search chats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  size="small"
                  startIcon={<FilterIcon />}
                  onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                >
                  Filter
                </Button>
              </Stack>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <List>
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
                          {session.customer_name.charAt(0)}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">
                            {session.customer_name}
                          </Typography>
                          <Chip
                            label={session.priority}
                            size="small"
                            color={getPriorityColor(session.priority)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {session.product_title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(session.last_message_at).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                    {/* Instead of ListItemSecondaryAction, use a Box for right-aligned chip */}
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
            flex: { xs: '1 1 100%', md: '0 0 66.6666%' },
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6">
                        {selectedChat.customer_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedChat.product_title}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
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
                      <IconButton
                        onClick={() => setAssignDialogOpen(true)}
                        disabled={!!selectedChat.agent_id}
                      >
                        <AssignmentIcon />
                      </IconButton>
                    </Stack>
                  </Box>
                </Box>

                {/* Messages */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                  <Stack spacing={2}>
                    {messages.map((message) => (
                      <Box
                        key={message.id}
                        sx={{
                          display: 'flex',
                          justifyContent: message.sender_type === 'agent' ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <Paper
                          sx={{
                            p: 2,
                            maxWidth: '70%',
                            bgcolor: message.sender_type === 'agent' ? 'primary.main' : 'grey.100',
                            color: message.sender_type === 'agent' ? 'white' : 'text.primary'
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                            {message.sender_name}
                          </Typography>
                          <Typography variant="body2">
                            {message.message}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {new Date(message.timestamp).toLocaleTimeString()}
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
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
                  Select a chat to start messaging
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleFilterChange('status', 'active')}>
          Active Only
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('status', 'resolved')}>
          Resolved Only
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('priority', 'urgent')}>
          Urgent Priority
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('priority', 'high')}>
          High Priority
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('clear', null)}>
          Clear Filters
        </MenuItem>
      </Menu>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
        <DialogTitle>Assign Chat</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Agent</InputLabel>
            <Select
              value={selectedAgent || ''}
              onChange={(e) => setSelectedAgent(Number(e.target.value))}
            >
              <MenuItem value={1}>Agent Smith</MenuItem>
              <MenuItem value={2}>Agent Johnson</MenuItem>
              <MenuItem value={3}>Agent Brown</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignChat} variant="contained">
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatManagementPage;
