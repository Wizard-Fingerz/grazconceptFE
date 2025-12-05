// This file implements the client-side service for REST (HTTP) and websocket comments for visa applications.
// Includes support for work, pilgrimage, study, and vacation visa types.
//
// - REST endpoint for study visa comments uses base: /study-visa-application-comments/
// - WebSocket for study visa is at ws/study/visa-application/:application_id/
//
// NOTE: "sendComment" MUST provide user_id in payload or backend will reject.
// NOTE: "create" endpoint is used for work visa comments POST, not .../comments/

import api, { API_BASE_URL } from "./api";
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
    return `${baseUrl}/app/study-visa-application-comments/${application_id}/comments/`;
  } else if (application_type === "vacation") {
    return `${baseUrl}/app/vacation-visa-application-comments/${application_id}/comments/`;
  }
  return `${baseUrl}/app/work-visa-application-comments/${application_id}/comments/`;
}

// Returns the correct CREATE endpoint for POSTing a new comment
function getCreateCommentEndpoint(opts: {
  application_id: string | number;
  application_type?: ApplicationType;
}): string {
  const { application_id, application_type } = opts || {};
  let baseUrl = API_BASE_URL.replace(/\/$/, "");

  if (!application_id) throw new Error("application_id required");

  if (application_type === "work") {
    return `${baseUrl}/app/work-visa-application-comments/${application_id}/create/`;
  } else if (application_type === "pilgrimage") {
    return `${baseUrl}/app/pilgrimage-application-comments/${application_id}/create/`;
  } else if (application_type === "study") {
    return `${baseUrl}/app/study-visa-application-comments/${application_id}/create/`;
  } else if (application_type === "vacation") {
    return `${baseUrl}/app/vacation-visa-application-comments/${application_id}/create/`;
  }
  return `${baseUrl}/app/work-visa-application-comments/${application_id}/create/`;
}

// ----------- REST: Fetch Comments -----------
export async function fetchComments(opts: {
  application_id: string | number;
  application_type?: ApplicationType;
}) {
  const url = getCommentsEndpoint(opts);
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers
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

// ----------- REST: Post a Comment (with text and/or attachment) -----------
// Make sure the payload is always FormData, so attachments are sent correctly.
// Never set manual Content-Type headers; let the browser set multipart boundaries.
export async function postComment(opts: {
  application_id: string | number;
  application_type?: ApplicationType;
  text?: string;
  attachment?: File;
  sender_type?: "applicant" | "admin";
}) {
  const { text, attachment, sender_type } = opts;
  if (!opts.application_id) throw new Error("application_id required");
  if ((!text || text.trim() === "") && !attachment)
    throw new Error("No comment text or attachment.");

  const url = getCreateCommentEndpoint(opts);

  // Always use FormData for this endpoint.
  const formData = new FormData();
  if (text && text.trim()) formData.append("text", text.trim());
  if (attachment instanceof File) {
    formData.append("attachment", attachment, attachment.name);
  }
  if (sender_type) formData.append("sender_type", sender_type);

  try {
    // Use axios config that ensures FormData is sent correctly
    // The interceptor in api.ts will remove Content-Type header for FormData
    const res = await api.post(url.replace(API_BASE_URL, ""), formData, {
      withCredentials: true,
    });
    return res.data;
  } catch (err: any) {
    if (
      err?.response &&
      (err.response.status === 404 || err.response.status === 400)
    ) {
      throw new Error(
        `Failed to post comment with attachment (${err.response.status})${
          err.response.status === 404
            ? ": Not found (invalid endpoint for this visa type or wrong id)"
            : ""
        }`
      );
    }
    throw new Error(
      err?.message || "Failed to post comment with attachment"
    );
  }
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
    wsPath = `/ws/study/visa-application/${applicationId}/`;
  } else if (applicationType === "vacation") {
    wsPath = `/ws/vacation/visa-application/${applicationId}/`;
  } else {
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
   * NOTE: For attachments, pass the *file URL or handle* as "attachment" (not a File instance).
   */
  sendComment(text: string, attachment?: any, sender_type?: "applicant" | "admin") {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    if (!this.userId) {
      console.error("VisaApplicationCommentsWebSocket: Can't send comment, userId not set.");
      return;
    }
    // Only include attachment in payload if it is a non-empty string, otherwise don't include or set to null
    const payload: any = {
      action: "send_comment",
      text,
      user_id: this.userId
    };

    if (attachment !== undefined && attachment !== null && attachment !== "") {
      payload.attachment = attachment;
    }
    if (sender_type) {
      payload.sender_type = sender_type;
    }
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
