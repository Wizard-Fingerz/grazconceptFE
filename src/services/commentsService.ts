// This file implements the client-side service for REST (HTTP) and websocket comments for visa applications.
// Includes support for work, pilgrimage, study, and vacation visa types.
//
// - REST endpoint for study visa comments uses base: /study-visa-application-comments/
// - WebSocket for study visa is at ws/study/visa-application/:application_id/
//
// NOTE: "sendComment" MUST provide user_id in payload or backend will reject.

import { API_BASE_URL } from "./api";
import { useRef, useEffect } from "react";

export type ApplicationType = "work" | "pilgrimage" | "study" | "vacation";

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

// -------- Helper: REST endpoint builder by visa type --------
function getCommentsEndpoint(opts: {
  application_id: string | number;
  application_type?: ApplicationType;
}): string {
  const { application_id, application_type } = opts || {};
  if (!application_id) throw new Error("application_id required");
  let baseUrl = API_BASE_URL.replace(/\/$/, "");

  if (application_type === "work") {
    return `${baseUrl}/app/work-visa-application-comments/${application_id}/comments/`;
  } else if (application_type === "pilgrimage") {
    return `${baseUrl}/app/pilgrimage-application-comments/${application_id}/comments/`;
  } else if (application_type === "study") {
    // Study visa REST uses DRF viewset: /study-visa-application-comments/
    return `${baseUrl}/app/study-visa-application-comments/${application_id}/comments/`;
  } else if (application_type === "vacation") {
    // Vacation endpoint is its own comments endpoint
    return `${baseUrl}/app/vacation-visa-application-comments/${application_id}/comments/`;
  }
  // fallback to work
  return `${baseUrl}/app/work-visa-application-comments/${application_id}/comments/`;
}

// ----------- REST: Fetch Comments -----------
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
    throw new Error(
      `Failed to fetch comments (${res.status})${
        res.status === 404
          ? ": Not found (invalid endpoint for this visa type or wrong id)"
          : ""
      }`
    );
  }
  return await res.json();
}

// ----------- REST: Post a Comment -----------
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
    throw new Error(
      `Failed to post comment (${res.status})${
        res.status === 404
          ? ": Not found (invalid endpoint for this visa type or wrong id)"
          : ""
      }`
    );
  }

  return await res.json();
}

// ----------- REST: Upload Attachment -----------
export async function uploadAttachment(
  file: File
): Promise<{ id: string; file: string }> {
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

// ----------- WebSocket Utility: get WS URL for comment threads -----------
export function getCommentsWebSocketUrl(
  applicationId: string | number,
  applicationType?: "work" | "pilgrimage" | "study" | "vacation"
): string {
  if (!applicationId) throw new Error("applicationId required");
  let restUrl = API_BASE_URL;
  restUrl = restUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
  let wsProtocol = restUrl.startsWith("https") ? "wss" : "ws";
  let wsPath: string;

  if (applicationType === "pilgrimage") {
    wsPath = `/ws/pilgrimage/visa-application/${applicationId}/`;
  } else if (applicationType === "study") {
    // Study visa WebSocket route: ws/study/visa-application/:application_id/
    wsPath = `/ws/study/visa-application/${applicationId}/`;
  } else if (applicationType === "vacation") {
    // Vacation visa WebSocket shares with work (per comment, or update if backend adds one)
    wsPath = `/ws/vacation/visa-application/${applicationId}/`;
  } else {
    // default to work
    wsPath = `/ws/work/visa-application/${applicationId}/`;
  }

  const host = restUrl.replace(/^https?:\/\//, "");
  return `${wsProtocol}://${host}${wsPath}`;
}

// ----------- WebSocket Class: Handles send with user_id -----------
export class VisaApplicationCommentsWebSocket {
  ws: WebSocket | null = null;
  applicationId: number | string;
  visaType: "pilgrimage" | "work" | "study" | "vacation";
  onMessage: WSCommentCallback;
  onOpen?: () => void;
  onClose?: (e: CloseEvent) => void;
  onError?: (err: Event) => void;
  connected: boolean = false;
  userId: string | number | null = null; // must set for sendComment

  constructor(
    applicationId: number | string,
    visaType: "pilgrimage" | "work" | "study" | "vacation",
    onMessage: WSCommentCallback,
    opts?: {
      onOpen?: () => void;
      onClose?: (e: CloseEvent) => void;
      onError?: (err: Event) => void;
      userId?: string | number;
    }
  ) {
    this.applicationId = applicationId;
    this.visaType = visaType;
    this.onMessage = onMessage;
    this.onOpen = opts?.onOpen;
    this.onClose = opts?.onClose;
    this.onError = opts?.onError;
    if (opts?.userId) {
      this.userId = opts.userId;
    }
  }

  setUserId(userId: string | number) {
    this.userId = userId;
  }

  private buildWebSocketUrl(): string {
    return getCommentsWebSocketUrl(this.applicationId, this.visaType);
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

  /**
   * Sends a comment using the websocket.
   * userId must be set either in constructor opts or by calling setUserId().
   * Backend will reject missing user_id.
   * The send will fail silently if not connected or user_id is missing.
   */
  sendComment(text: string, attachment?: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    if (!this.userId) {
      console.error("VisaApplicationCommentsWebSocket: Can't send comment, userId not set.");
      return;
    }
    const payload: any = {
      action: "send_comment",
      text,
      user_id: this.userId
    };
    if (attachment !== undefined) payload.attachment = attachment;
    this.ws.send(JSON.stringify(payload));
  }
}

// -------- Pilgrimage Comments WebSocket React Hook -----------
export function usePilgrimageCommentsSocket(
  applicationId: number | string,
  onMessage: WSCommentCallback,
  userId?: string | number,
  deps: any[] = []
) {
  const socketRef = useRef<VisaApplicationCommentsWebSocket | null>(null);

  useEffect(() => {
    const socket = new VisaApplicationCommentsWebSocket(applicationId, "pilgrimage", onMessage, { userId });
    socketRef.current = socket;
    socket.connect();
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, userId, ...deps]);

  return socketRef;
}

// -------- Work Visa Comments WebSocket React Hook -----------
export function useWorkVisaCommentsSocket(
  applicationId: number | string,
  onMessage: WSCommentCallback,
  userId?: string | number,
  deps: any[] = []
) {
  const socketRef = useRef<VisaApplicationCommentsWebSocket | null>(null);

  useEffect(() => {
    const socket = new VisaApplicationCommentsWebSocket(applicationId, "work", onMessage, { userId });
    socketRef.current = socket;
    socket.connect();
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, userId, ...deps]);

  return socketRef;
}

// -------- Study Visa Comments WebSocket React Hook -----------
export function useStudyVisaCommentsSocket(
  applicationId: number | string,
  onMessage: WSCommentCallback,
  userId?: string | number,
  deps: any[] = []
) {
  const socketRef = useRef<VisaApplicationCommentsWebSocket | null>(null);

  useEffect(() => {
    const socket = new VisaApplicationCommentsWebSocket(applicationId, "study", onMessage, { userId });
    socketRef.current = socket;
    socket.connect();
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, userId, ...deps]);

  return socketRef;
}

// -------- Vacation Visa Comments WebSocket React Hook -----------
export function useVacationVisaCommentsSocket(
  applicationId: number | string,
  onMessage: WSCommentCallback,
  userId?: string | number,
  deps: any[] = []
) {
  const socketRef = useRef<VisaApplicationCommentsWebSocket | null>(null);

  useEffect(() => {
    const socket = new VisaApplicationCommentsWebSocket(applicationId, "vacation", onMessage, { userId });
    socketRef.current = socket;
    socket.connect();
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, userId, ...deps]);

  return socketRef;
}
