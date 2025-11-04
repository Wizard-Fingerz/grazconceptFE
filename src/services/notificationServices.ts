// Notification WebSocket client for subscribing and receiving notifications using user id as query parameter
// Handles backend notification payload structure ({message, notifications:[...]})

const API_BASE_URL = 'https://backend.grazconcept.com.ng/';
// const API_BASE_URL = 'http://localhost:8002/';

let notificationSocket: WebSocket | null = null;
let listeners: Array<(data: any) => void> = [];
let reconnectTimeout: any = null;

// Helper to get user id from localStorage
function getUserIdFromStorage(): string | null {
  try {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) return null;
    const user = JSON.parse(rawUser);
    if (user && (user.id || user.user_id)) {
      return user.id || user.user_id;
    }
    if (typeof user === "string" && user) return user;
  } catch {}
  return null;
}

// Get WebSocket endpoint; pass user id as a query param
function getWSEndpoint(): string {
  let apiUrl = API_BASE_URL.replace(/\/+$/, "");
  let wsScheme = apiUrl.startsWith("https") ? "wss" : "ws";
  let [, urlRest] = apiUrl.split("://");
  const userId = getUserIdFromStorage();
  let query = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
  return `${wsScheme}://${urlRest}/ws/notifications/${query}`;
}

function connectNotificationWebSocket() {
  if (notificationSocket) return;

  const userId = getUserIdFromStorage();
  const WS_ENDPOINT = getWSEndpoint();

  if (!userId) {
    if (notificationSocket) {
      try {
        (notificationSocket as WebSocket).close();
      } catch {}
    }
    notificationSocket = null;
    return;
  }


  try {
    notificationSocket = new WebSocket(WS_ENDPOINT);
  } catch (e) {
    notificationSocket = null;
    if (!reconnectTimeout) {
      reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null;
        connectNotificationWebSocket();
      }, 5000);
    }
    return;
  }

  notificationSocket.onopen = () => {
    if (notificationSocket && typeof notificationSocket.send === 'function') {
      notificationSocket.send(JSON.stringify({ action: "get_notifications" }));
    }
    console.log("Notification WebSocket connected. Requested notifications.");
  };

  notificationSocket.onmessage = (event: MessageEvent) => {
    let msgData: any;
    try {
      msgData = JSON.parse(event.data);
    } catch (e) {
      msgData = event.data;
    }
    // Example msgData:
    // { message: "Connected to notifications socket!", notifications: [ ... ] }
    console.log('Notification WebSocket received:', msgData);

    // Route either a full list or a single notification message, always expecting notifications field
    if (
      typeof msgData === "object" &&
      msgData !== null &&
      ("notifications" in msgData || "message" in msgData)
    ) {
      listeners.forEach((cb) => cb(msgData));
    } else {
      // fallback to legacy or unexpected format
      listeners.forEach((cb) => cb({ message: msgData }));
    }
  };

  notificationSocket.onclose = () => {
    notificationSocket = null;
    if (!reconnectTimeout && getUserIdFromStorage()) {
      reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null;
        connectNotificationWebSocket();
      }, 5000);
    }
  };

  notificationSocket.onerror = () => {
    if (notificationSocket) {
      notificationSocket.close();
    }
  };
}

export function subscribeToNotifications(cb: (data: any) => void) {
  if (!listeners.includes(cb)) {
    listeners.push(cb);
  }
  if (getUserIdFromStorage()) {
    connectNotificationWebSocket();
  }
  return () => {
    listeners = listeners.filter((fn) => fn !== cb);
    if (listeners.length === 0 && notificationSocket) {
      notificationSocket.close();
      notificationSocket = null;
    }
  };
}

// Explicitly request latest notifications from backend via WebSocket
export function requestUserNotifications() {
  if (notificationSocket && notificationSocket.readyState === WebSocket.OPEN) {
    notificationSocket.send(JSON.stringify({ action: "get_notifications" }));
  }
}

export function sendNotificationWebSocket(data: any) {
  if (notificationSocket && notificationSocket.readyState === WebSocket.OPEN) {
    notificationSocket.send(JSON.stringify(data));
  }
}

export function closeNotificationWebSocket() {
  if (notificationSocket) {
    notificationSocket.close();
    notificationSocket = null;
  }
  listeners = [];
}
