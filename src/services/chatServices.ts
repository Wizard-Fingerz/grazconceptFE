/**
 * React-friendly chatServices for customer <-> agent live chat using event-based socket protocol.
 * Handles per-chat and session-list sockets as per backend's command-style interface.
 * Designed for use in React hooks/pages.
 *
 * Usage:
 *   import chatServices from './chatServices';
 *   chatServices.connectToSessionList()
 *   chatServices.on('sessions', ...)    // Use this to receive list of sessions (all at once)
 *   chatServices.on('chat_update', ...)
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
type EventType = 'open' | 'close' | 'error' | 'message' | 'history' | 'chats' | 'chat_update' | 'session_list_open' | 'chat_open' | 'sessions_raw' | 'chat_update_raw';

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
    // Always log
    console.log("[SessionList WS] Received from backend:", data);

    // Emit the *raw data* as received from the backend
    if (data.type === 'chats') {
      emit('sessions_raw', data); // raw, as received from backend
    } else if (data.type === 'chat_update') {
      emit('chat_update_raw', data); // raw update object from backend
    }

    if (data.type === 'chats') {
      // Defensive: ensure array
      let sessionsArr: any[] = [];
      if (Array.isArray(data.sessions)) {
        sessionsArr = data.sessions.filter(Boolean);
      } else if (data.sessions && typeof data.sessions === "object") {
        sessionsArr = [data.sessions];
      } else {
        sessionsArr = [];
      }
      sessionsArr = sessionsArr
        .filter(Boolean)
        .map((s: any) =>
          s && typeof s === "object"
            ? { ...s, id: String(s.id) }
            : s
        );

      // Emit for React consumption (legacy/events API)
      emit('session_list_open', sessionsArr); // revert to the standard event type 'sessions'
      console.log('sessions', sessionsArr);

      sessionsArr.forEach(sess => {
        emit('chats', sess);


        console.log('chats', sess);
      });

    } else if (data.type === 'chat_update') {
      // Legacy API: Emits just the session object for convenience
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
    console.log("[Chat WS] Received from backend (chatId:", chatId + "):", data);

    // Optionally: Emit the full event data for consumers
    if (data.type === 'message' || data.type === 'history' || data.error) {
      emit('message', data); // Emit raw data for listeners that want full context
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

/**
 * Request the list of sessions from the backend via the session list WebSocket.
 * Will log out the data being sent, and reconnect if not connected.
 */
function listSessions() {
  console.log("[chatServices.listSessions] Called. sessionListSocket:", sessionListSocket);

  if (!sessionListSocket || sessionListSocket.readyState !== WebSocket.OPEN) {
    console.warn('[chatServices.listSessions] Session list socket not connected, attempting to reconnect and will retry...');
    connectToSessionList();
    setTimeout(() => {
      if (sessionListSocket && sessionListSocket.readyState === WebSocket.OPEN) {
        sessionListSocket.send(JSON.stringify({ command: 'sessions_list' }));
        console.log("[chatServices.listSessions] (after reconnect) Sent: ", { command: 'sessions_list' });
      } else {
        emit('error', { error: 'Session list socket still not connected after reconnect attempt.' });
      }
    }, 500);
    return;
  }

  const message = { command: 'sessions_list' };
  console.log("[chatServices.listSessions] Sending to backend via sessionListSocket:", message);
  sessionListSocket.send(JSON.stringify(message));
}



// --- API for React/hooks ---

/** 
 * For event documentation:
 * - 'sessions': emits the sessions array for legacy consumption
 * - 'sessions_raw': emits the *original backend response* for WS sessions, e.g. `{type: 'chats', sessions: [...]}` (for debugging or raw view)
 * - 'chat_update': emits just the updated session (legacy)
 * - 'chat_update_raw': emits the *original backend response* for WS updates, e.g. `{type: 'chat_update', session: {...}}`
 * - 'message': emits message only AND also emits full data if you listen for 'message'
 */

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
  globalListeners, // Expose globalListeners for introspection if needed
};

export default chatServices;

