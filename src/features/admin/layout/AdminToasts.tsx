"use client";

import type { Notice } from "@/features/admin/hooks/useAdminNotices";

/** Avisos flotantes; siempre arriba del todo en z-index. */
export function AdminToasts({ notices }: { notices: Notice[] }) {
  return (
    <div className="pointer-events-none fixed bottom-10 left-0 right-0 z-[60] flex flex-col items-center gap-2 px-4">
      {notices.map((notice) => (
        <div
          key={notice.id}
          className="pointer-events-auto min-w-[220px] rounded-full border border-success/30 bg-panel px-6 py-3 text-center text-sm font-bold text-success shadow-2xl backdrop-blur-md"
        >
          {notice.message}
        </div>
      ))}
    </div>
  );
}
