/**
 * React-friendly chatServices for customer <-> agent live chat using event-based socket protocol.
 * Handles per-chat and session-list sockets as per backend's command-style interface.
 * Designed for use in React hooks/pages.
 *
 * Usage:
 *   import chatServices from './chatServices';
 *   chatServices.connectToSessionList()
 *   chatServices.on('chats', ...)
 *   chatServices.connectToChat(chatId)
 *   chatServices.on('message', ...)
 *   chatServices.sendMessage(chatId, message)
 *   chatServices.disconnectAll()
 */

// --------- SOCKET URL CONFIG ---------
const API_BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:8002'
    : 'https://backend.grazconcept.com.ng';

function getBaseWsUrl() {
  const cleaned = API_BASE_URL.replace(/\/+$/, '');
  const wsScheme = cleaned.startsWith('https') ? 'wss' : 'ws';
  const urlRest = cleaned.split('://')[1];
  return `${wsScheme}://${urlRest}`;
}

// --- Storage helpers ---
function currentUserId(): string | null {
  try {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) return null;
    const user = JSON.parse(rawUser);
    if (user && (user.id || user.user_id)) return user.id || user.user_id;
    if (typeof user === "string" && user) return user;
  } catch {}
  return null;
}

// --- Event System ---
// NOTE: Add distinct "session_list_open" and "chat_open" events so UI can differentiate socket readiness.
type EventType = 'open' | 'close' | 'error' | 'message' | 'history' | 'chats' | 'chat_update' | 'session_list_open' | 'chat_open';

const globalListeners: Record<EventType, Array<(data: any) => void>> = {
  open: [],
  close: [],
  error: [],
  message: [],
  history: [],
  chats: [],
  chat_update: [],
  session_list_open: [],
  chat_open: [],
};

// Utility event methods
function on(event: EventType, cb: (data: any) => void) {
  globalListeners[event].push(cb);
}
function off(event: EventType, cb: (data: any) => void) {
  globalListeners[event] = globalListeners[event].filter(fn => fn !== cb);
}
function emit(event: EventType, data?: any) {
  for (const fn of globalListeners[event]) {
    try { fn(data); } catch {}
  }
}

// --- Socket State ---
let sessionListSocket: WebSocket | null = null;
let chatSockets: Record<string, WebSocket> = {};
let activeChatId: string | null = null;

// --- Session List WebSocket Management ---
function getSessionListWsUrl(userId: string) {
  return `${getBaseWsUrl()}/ws/chat_sessions/${userId}/`;
}

function connectToSessionList(userIdFromCaller?: string | number) {
  if (sessionListSocket && sessionListSocket.readyState !== WebSocket.CLOSING && sessionListSocket.readyState !== WebSocket.CLOSED) {
    return;
  }
  const userId = userIdFromCaller ? String(userIdFromCaller) : currentUserId();
  if (!userId) {
    emit('error', { error: 'No user id for session list connection' });
    return;
  }

  const wsUrl = getSessionListWsUrl(userId);
  try {
    sessionListSocket = new WebSocket(wsUrl);
  } catch (err) {
    sessionListSocket = null;
    emit('error', { error: 'Failed to open session list WebSocket', detail: err });
    return;
  }

  sessionListSocket.onopen = () => {
    emit('open');
    emit('session_list_open'); // NEW: Notify specifically that session list ws is open
  };
  sessionListSocket.onclose = () => emit('close');
  sessionListSocket.onerror = () => emit('error', { error: 'Session list WebSocket error.' });
  sessionListSocket.onmessage = (event: MessageEvent) => {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch {
      emit('error', { error: 'Failed to parse session list message', raw: event.data });
      return;
    }
    // Log every backend response for session list socket
    console.log("[SessionList WS] Received from backend:", data);

    if (data.type === 'chats') {
      emit('chats', data.sessions);
    } else if (data.type === 'chat_update') {
      emit('chat_update', data.session);
    } else if (data.error) {
      emit('error', { error: data.error });
    }
  };
}

// --- Chat WebSocket Management (per chat session) ---
function getChatWsUrl(chatId: string, userId: string) {
  return `${getBaseWsUrl()}/ws/chat/${chatId}/${userId}/`;
}

function connectToChat(chatId: string, userIdFromCaller?: string | number) {
  if (chatSockets[chatId] && chatSockets[chatId].readyState !== WebSocket.CLOSING && chatSockets[chatId].readyState !== WebSocket.CLOSED) {
    // Already connected to this chat
    activeChatId = chatId;
    return;
  }

  const userId = userIdFromCaller ? String(userIdFromCaller) : currentUserId();
  if (!userId) {
    emit('error', { error: 'No user id for chat connection' });
    return;
  }
  // Disconnect current activeChat if any
  if (activeChatId && chatSockets[activeChatId]) {
    disconnectChat(activeChatId);
  }
  const wsUrl = getChatWsUrl(chatId, userId);
  let ws: WebSocket;
  try {
    ws = new WebSocket(wsUrl);
  } catch (err) {
    emit('error', { error: 'Failed to open chat WebSocket', chatId, detail: err });
    return;
  }

  chatSockets[chatId] = ws;
  activeChatId = chatId;

  ws.onopen = () => {
    emit('open');
    emit('chat_open', { chatId }); // NEW: Notify specifically that chat ws is open
    // Request message history when connected
    ws.send(JSON.stringify({ command: 'get_messages' }));
  };
  ws.onclose = () => emit('close');
  ws.onerror = () => emit('error', { error: 'Chat WebSocket error.' });
  ws.onmessage = (event: MessageEvent) => {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch {
      emit('error', { error: 'Failed to parse chat message', raw: event.data });
      return;
    }
    // Log every backend response for chat socket
    console.log("[Chat WS] Received from backend (chatId:", chatId + "):", data);

    // Dispatch by backend message type
    if (data.type === 'message') {
      emit('message', data.message);
    } else if (data.type === 'history') {
      emit('history', data.messages);
    } else if (data.error) {
      emit('error', { error: data.error });
    }
  };

  // NOTE: The initial fetch of message history is now sent inside onopen above.
}

function disconnectChat(chatId: string) {
  if (chatSockets[chatId]) {
    try { chatSockets[chatId].close(); } catch {}
    delete chatSockets[chatId];
    if (activeChatId === chatId) activeChatId = null;
  }
}

function disconnectSessionList() {
  if (sessionListSocket) {
    try { sessionListSocket.close(); } catch {}
    sessionListSocket = null;
  }
}

function disconnectAll() {
  disconnectSessionList();
  Object.keys(chatSockets).forEach(disconnectChat);
}

// --- Client commands ---
function sendMessage(chatId: string, message: string) {
  const ws = chatSockets[chatId];
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    emit('error', { error: 'Chat WebSocket not connected', chatId });
    return;
  }
  ws.send(JSON.stringify({ command: 'send_message', message }));
}

function getMessages(chatId: string) {
  const ws = chatSockets[chatId];
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    emit('error', { error: 'Chat WebSocket not connected', chatId });
    return;
  }
  ws.send(JSON.stringify({ command: 'get_messages' }));
}

function listSessions() {
  if (!sessionListSocket || sessionListSocket.readyState !== WebSocket.OPEN) {
    emit('error', { error: 'Session list socket not connected' });
    return;
  }
  sessionListSocket.send(JSON.stringify({ command: 'sessions_list' }));
}

// --- API for React/hooks ---
const chatServices = {
  // Event subscription
  on,
  off,
  // Connections and commands
  connectToSessionList,
  connectToChat,
  disconnectChat,
  disconnectSessionList,
  disconnectAll,
  sendMessage,
  getMessages,
  listSessions,
  getCurrentUserId: currentUserId,
};

export default chatServices;
