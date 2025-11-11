/**
 * Service for connecting to PilgrimageVisaApplication comments websocket,
 * sending/receiving real-time comments.
 *
 * Uses Django Channels ASGI websocket service.
 * Reads websocket base URL from base REST API url in api.ts.
 */

import { API_BASE_URL } from "./api";
import { useRef, useEffect } from "react";

// Comment, event and callback types
export type CommentData = {
  id: number;
  text: string;
  created_at: string;
  applicant: any | null;
  admin: any | null;
  visa_application: number;
  attachment?: string | null;
  sender_type: "applicant" | "admin";
  sender_display?: string;
};

export type WSCommentEvent = {
  action?: string;
  error?: string;
} & Partial<CommentData>;

export type WSCommentCallback = (event: WSCommentEvent) => void;

export class PilgrimageCommentsWebSocket {
  ws: WebSocket | null = null;
  applicationId: number | string;
  onMessage: WSCommentCallback;
  onOpen?: () => void;
  onClose?: (e: CloseEvent) => void;
  onError?: (err: Event) => void;
  connected: boolean = false;

  constructor(
    applicationId: number | string,
    onMessage: WSCommentCallback,
    opts?: {
      onOpen?: () => void;
      onClose?: (e: CloseEvent) => void;
      onError?: (err: Event) => void;
    }
  ) {
    this.applicationId = applicationId;
    this.onMessage = onMessage;
    this.onOpen = opts?.onOpen;
    this.onClose = opts?.onClose;
    this.onError = opts?.onError;
  }

  /**
   * Builds a websocket URL using the API_BASE_URL from api.ts
   * and the current window protocol.
   **/
  private buildWebSocketUrl(): string {
    // API_BASE_URL might be e.g.: https://backend.grazconcept.com.ng/api/
    // We want: wss://backend.grazconcept.com.ng/ws/pilgrimage/visa-application/:id/
    let restUrl = API_BASE_URL;

    // Remove trailing /api/ or /api or /
    restUrl = restUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

    // Pick protocol for ws/wss
    let wsProtocol = restUrl.startsWith("https") ? "wss" : "ws";

    // Use absolute path for ws endpoint:
    // e.g. /ws/pilgrimage/visa-application/:id/
    const wsPath = `/ws/pilgrimage/visa-application/${this.applicationId}/`;

    // Remove protocol from restUrl
    const host = restUrl.replace(/^https?:\/\//, "");

    return `${wsProtocol}://${host}${wsPath}`;
  }

  connect() {
    if (this.ws) return;

    const wsUrl = this.buildWebSocketUrl();

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.connected = true;
      if (this.onOpen) this.onOpen();
    };

    this.ws.onclose = (e) => {
      this.connected = false;
      if (this.onClose) this.onClose(e);
      this.ws = null;
    };

    this.ws.onerror = (e) => {
      if (this.onError) this.onError(e);
    };

    this.ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        this.onMessage(data);
      } catch {
        // Ignore invalid JSON
      }
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendComment(text: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(
      JSON.stringify({
        action: "send_comment",
        text,
      })
    );
  }

  // If you want to support attachments/files: use the REST API, not websocket.
}

/**
 * React hook for pilgrimage comments websocket.
 * Automatically (re)connects websocket on applicationId/deps change.
 * Disposes on unmount.
 */
export function usePilgrimageCommentsSocket(
  applicationId: number | string,
  onMessage: WSCommentCallback,
  deps: any[] = []
) {
  const socketRef = useRef<PilgrimageCommentsWebSocket | null>(null);

  useEffect(() => {
    const socket = new PilgrimageCommentsWebSocket(applicationId, onMessage);
    socketRef.current = socket;
    socket.connect();
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, ...deps]);

  return socketRef;
}

