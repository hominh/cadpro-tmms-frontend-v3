import { Button } from "@/components/ui/button";

export function SidebarUnavailableStatus({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss: () => void;
}) {
  if (!message) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[110] flex max-w-sm items-start gap-3 rounded-md border border-[#d1d5db] bg-white px-4 py-3 text-sm text-[#374151] shadow-xl"
      role="status"
      aria-live="polite"
    >
      <span className="min-w-0 flex-1">{message}</span>
      <Button
        variant="outline"
        className="h-7 shrink-0 px-2 text-xs"
        onClick={onDismiss}
        aria-label="Đóng thông báo"
      >
        Đóng
      </Button>
    </div>
  );
}
