/**
 * React-friendly chatServices for customer <-> agent live chat using event-based socket protocol.
 * Handles per-chat and session-list sockets as per backend's command-style interface.
 * Designed for use in React hooks/pages.
 */

const API_BASE_URL = 'https://backend.grazconcept.com.ng/';

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
type EventType =
  | 'open'
  | 'close'
  | 'error'
  | 'message'
  | 'history'
  | 'chats'
  | 'chat_update'
  | 'session_list_open'
  | 'chat_open'
  | 'sessions_raw'
  | 'chat_update_raw';

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
  sessions_raw: [],
  chat_update_raw: [],
};

function on(event: EventType, cb: (data: any) => void) {
  globalListeners[event].push(cb);
}
function off(event: EventType, cb: (data: any) => void) {
  globalListeners[event] = globalListeners[event].filter((fn) => fn !== cb);
}
function emit(event: EventType, data?: any) {
  for (const fn of globalListeners[event]) {
    try {
      fn(data);
    } catch {}
  }
}

// --- Socket State ---
let sessionListSocket: WebSocket | null = null;
let chatSockets: Record<string, WebSocket> = {};
let activeChatId: string | null = null;

// --- React-friendly cache / subscribers ---
let globalChatSessions: any[] = [];
let sessionsSubscribers: Array<(sessions: any[]) => void> = [];

function notifySessionSubscribers() {
  sessionsSubscribers.forEach((cb) => {
    try {
      cb([...globalChatSessions]);
    } catch {}
  });
}

/**
 * Subscribe to chat sessions updates (React-friendly)
 */
export function subscribeSessions(cb: (sessions: any[]) => void) {
  if (!sessionsSubscribers.includes(cb)) sessionsSubscribers.push(cb);
  if (globalChatSessions.length > 0) cb([...globalChatSessions]);
  return () => {
    sessionsSubscribers = sessionsSubscribers.filter((fn) => fn !== cb);
  };
}

// --- Session List WebSocket Management ---
function getSessionListWsUrl(userId: string) {
  return `${getBaseWsUrl()}/ws/chat_sessions/${userId}/`;
}

function connectToSessionList(userIdFromCaller?: string | number) {
  if (
    sessionListSocket &&
    sessionListSocket.readyState !== WebSocket.CLOSING &&
    sessionListSocket.readyState !== WebSocket.CLOSED
  ) {
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
    emit('session_list_open');
    listSessions();
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

    console.log('[SessionList WS] Received from backend:', data);

    if (data.type === 'connection_successful') {
      emit('open');
      return;
    }

    // Store & broadcast sessions
    if (data.type === 'chats') {
      let sessionsArr: any[] = [];
      if (Array.isArray(data.sessions)) sessionsArr = data.sessions.filter(Boolean);
      else if (data.sessions && typeof data.sessions === 'object') sessionsArr = [data.sessions];
      else sessionsArr = [];

      sessionsArr = sessionsArr.map((s: any) => ({
        ...s,
        id: String(s.id),
      }));

      console.log('[chatServices] Updating globalChatSessions:', sessionsArr);
      globalChatSessions = sessionsArr;
      notifySessionSubscribers();

      emit('sessions_raw', data);
      emit('session_list_open', sessionsArr);
    } else if (data.type === 'chat_update') {
      emit('chat_update_raw', data);
      emit('chat_update', data.session);
    } else if (data.error) {
      emit('error', { error: data.error });
    }
  };
}

// --- Chat WebSocket Management ---
function getChatWsUrl(chatId: string, userId: string) {
  return `${getBaseWsUrl()}/ws/chat/${chatId}/${userId}/`;
}

function connectToChat(chatId: string, userIdFromCaller?: string | number) {
  if (
    chatSockets[chatId] &&
    chatSockets[chatId].readyState !== WebSocket.CLOSING &&
    chatSockets[chatId].readyState !== WebSocket.CLOSED
  ) {
    activeChatId = chatId;
    return;
  }

  const userId = userIdFromCaller ? String(userIdFromCaller) : currentUserId();
  if (!userId) {
    emit('error', { error: 'No user id for chat connection' });
    return;
  }
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
    emit('chat_open', { chatId });
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
    console.log('[Chat WS] Received from backend (chatId:', chatId + '):', data);

    if (data.type === 'message' || data.type === 'history' || data.error) {
      emit('message', data);
    }

    if (data.type === 'message') {
      emit('message', data.message);
    } else if (data.type === 'history') {
      emit('history', data.messages);
    } else if (data.error) {
      emit('error', { error: data.error });
    }
  };
}

function disconnectChat(chatId: string) {
  if (chatSockets[chatId]) {
    try {
      chatSockets[chatId].close();
    } catch {}
    delete chatSockets[chatId];
    if (activeChatId === chatId) activeChatId = null;
  }
}

function disconnectSessionList() {
  if (sessionListSocket) {
    try {
      sessionListSocket.close();
    } catch {}
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
  console.log('[chatServices.listSessions] Called. sessionListSocket:', sessionListSocket);

  if (!sessionListSocket || sessionListSocket.readyState !== WebSocket.OPEN) {
    console.warn('[chatServices.listSessions] Not connected. Reconnecting...');
    connectToSessionList();
    setTimeout(() => {
      if (sessionListSocket && sessionListSocket.readyState === WebSocket.OPEN) {
        sessionListSocket.send(JSON.stringify({ command: 'sessions_list' }));
      }
    }, 500);
    return;
  }

  const message = { command: 'sessions_list' };
  console.log('[chatServices.listSessions] Sending to backend via sessionListSocket:', message);
  sessionListSocket.send(JSON.stringify(message));
}

const chatServices = {
  on,
  off,
  connectToSessionList,
  connectToChat,
  disconnectChat,
  disconnectSessionList,
  disconnectAll,
  sendMessage,
  getMessages,
  listSessions,
  getCurrentUserId: currentUserId,
  globalListeners,
};

export default chatServices;
