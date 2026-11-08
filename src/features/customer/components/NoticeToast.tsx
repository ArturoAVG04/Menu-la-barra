export function NoticeToast({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-[80] -translate-x-1/2 px-4">
      <div className="min-w-[240px] rounded-full border border-success/30 bg-panel px-6 py-3 text-center text-sm font-semibold text-success shadow-glow">
        {message}
      </div>
    </div>
  );
}
