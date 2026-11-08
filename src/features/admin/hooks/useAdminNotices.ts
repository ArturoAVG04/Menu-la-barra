"use client";

import { useCallback, useState } from "react";

export type Notice = { id: string; message: string };
export type Notify = (message: string) => void;

const NOTICE_DURATION_MS = 2600;

/** Avisos flotantes ("toasts") del panel: cada uno desaparece solo. */
export function useAdminNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);

  const notify = useCallback<Notify>((message) => {
    const id = crypto.randomUUID();
    setNotices((current) => [...current, { id, message }]);
    window.setTimeout(() => {
      setNotices((current) => current.filter((notice) => notice.id !== id));
    }, NOTICE_DURATION_MS);
  }, []);

  return { notices, notify };
}
