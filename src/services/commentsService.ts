/**
 * Service for REST (HTTP) and websocket comments for visa applications.
 * Includes fetch (GET), post (POST), attachment, and websocket.
 * Reads API base URL from ./api.
 *
 * NOTE: The REST endpoints for comments are different for WORK and PILGRIMAGE visa types.
 * - For "work" -> `/app/work-visa-application/:id/comments/`
 * - For "pilgrimage" -> `/app/pilgrimage-visa-application/:id/comments/`
 * - If you try `/work/visa-application/:id/comments/` it will 404 (no such endpoint!).
 */

import { API_BASE_URL } from "./api";
import { useRef, useEffect } from "react";

type ApplicationType = "work" | "pilgrimage" | "study" | "vacation";

/**
 * --- Helper to build correct comments REST endpoint for a visa application ---
 * @param opts application_id and application_type
 * @returns full API URL string
 *
 * WARNING: 404s will occur if you use the wrong endpoint!
 */
function getCommentsEndpoint(opts: {
  application_id: string | number;
  application_type?: ApplicationType;
}): string {
  const { application_id, application_type } = opts || {};
  if (!application_id) throw new Error("application_id required");

  // Map types to real API endpoint.
  // For "work" comments, use `/app/work-visa-application/:id/comments/`
  // For "pilgrimage", use `/app/pilgrimage-visa-application/:id/comments/`
  // For "study", use `/study/visa-application/:id/comments/`
  // For "vacation", use `/vacation/application/:id/comments/`
  let baseUrl = API_BASE_URL.replace(/\/$/, "");

  if (application_type === "work") {
    return `${baseUrl}/app/work-visa-application/${application_id}/comments/`;
  } else if (application_type === "pilgrimage") {
    return `${baseUrl}/app/pilgrimage-visa-application/${application_id}/comments/`;
  } else if (application_type === "study") {
    return `${baseUrl}/study/visa-application/${application_id}/comments/`;
  } else if (application_type === "vacation") {
    return `${baseUrl}/vacation/application/${application_id}/comments/`;
  } else {
    // Heuristic fallback: try work first
    return `${baseUrl}/app/work-visa-application/${application_id}/comments/`;
  }
}

/**
 * --- REST API: fetch comments for an application ---
 * @param opts { application_id, application_type }
 * @returns {Promise<{results: CommentData[]}>}
 */
export async function fetchComments(opts: {
  application_id: string | number;
  application_type?: ApplicationType;
}) {
  const url = getCommentsEndpoint(opts);

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });

  if (!res.ok) {
    // 404 means invalid endpoint, likely wrong application_type or no such comments support
    throw new Error(`Failed to fetch comments (${res.status})${res.status === 404 ? ": Not found (invalid endpoint for this visa type or wrong id)" : ""}`);
  }

  return await res.json();
}

/**
 * --- REST API: post a comment ---
 * @param opts { application_id, application_type, text, attachment?, sender_type? }
 */
export async function postComment(opts: {
  application_id: string | number;
  application_type?: ApplicationType;
  text: string;
  attachment?: string | number | null;
  sender_type?: "applicant" | "admin";
}) {
  const { text, attachment, sender_type } = opts;
  if (!opts.application_id) throw new Error("application_id required");
  if (!text && !attachment) throw new Error("No comment text or attachment.");

  const url = getCommentsEndpoint(opts);

  const payload: any = { text };
  if (attachment != null) payload.attachment = attachment;
  if (sender_type) payload.sender_type = sender_type;

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Failed to post comment (${res.status})${res.status === 404 ? ": Not found (invalid endpoint for this visa type or wrong id)" : ""}`);
  }

  return await res.json();
}

/**
 * --- REST API: upload an attachment ---
 * Accepts File, returns {id, file}
 */
export async function uploadAttachment(file: File): Promise<{ id: string; file: string }> {
  let url = `${API_BASE_URL.replace(/\/$/, "")}/comments/attachments/`;
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    body: formData
  });
  if (!res.ok) {
    throw new Error(`Failed to upload attachment (${res.status})`);
  }
  return await res.json();
}

// ------------- Shared types for app comments -------------
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

// ------- General WebSocket class for both Pilgrimage and Work Visa -------
export class VisaApplicationCommentsWebSocket {
  ws: WebSocket | null = null;
  applicationId: number | string;
  visaType: "pilgrimage" | "work";
  onMessage: WSCommentCallback;
  onOpen?: () => void;
  onClose?: (e: CloseEvent) => void;
  onError?: (err: Event) => void;
  connected: boolean = false;

  constructor(
    applicationId: number | string,
    visaType: "pilgrimage" | "work",
    onMessage: WSCommentCallback,
    opts?: {
      onOpen?: () => void;
      onClose?: (e: CloseEvent) => void;
      onError?: (err: Event) => void;
    }
  ) {
    this.applicationId = applicationId;
    this.visaType = visaType;
    this.onMessage = onMessage;
    this.onOpen = opts?.onOpen;
    this.onClose = opts?.onClose;
    this.onError = opts?.onError;
  }

  /**
   * Builds a websocket URL using the API_BASE_URL from api.ts
   * and the current window protocol.
   * WARNING: Only "work" and "pilgrimage" types are supported for WS
   **/
  private buildWebSocketUrl(): string {
    // API_BASE_URL might be: https://backend.grazconcept.com.ng/api/
    // We want for pilgrimage: wss://backend/ws/pilgrimage/visa-application/:id/
    // For work:              wss://backend/ws/work/visa-application/:id/
    let restUrl = API_BASE_URL;

    // Remove trailing /api/ or /api or /
    restUrl = restUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

    // Pick protocol for ws/wss
    let wsProtocol = restUrl.startsWith("https") ? "wss" : "ws";

    // Compose endpoint path per visaType
    let wsPath: string;
    if (this.visaType === "pilgrimage") {
      wsPath = `/ws/pilgrimage/visa-application/${this.applicationId}/`;
    } else if (this.visaType === "work") {
      wsPath = `/ws/work/visa-application/${this.applicationId}/`;
    } else {
      throw new Error("WebSocket only supported for 'work' or 'pilgrimage' visa types");
    }

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

  // For handling files/attachments, use REST API (see uploadAttachment and postComment).
}

// --------- Pilgrimage WebSocket HOOK ----------
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
  const socketRef = useRef<VisaApplicationCommentsWebSocket | null>(null);

  useEffect(() => {
    const socket = new VisaApplicationCommentsWebSocket(applicationId, "pilgrimage", onMessage);
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

// --------- Work Visa WebSocket HOOK ----------
/**
 * React hook for work visa comments websocket.
 * Automatically (re)connects websocket on applicationId/deps change.
 * Disposes on unmount.
 */
export function useWorkVisaCommentsSocket(
  applicationId: number | string,
  onMessage: WSCommentCallback,
  deps: any[] = []
) {
  const socketRef = useRef<VisaApplicationCommentsWebSocket | null>(null);

  useEffect(() => {
    const socket = new VisaApplicationCommentsWebSocket(applicationId, "work", onMessage);
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
