import { Spinner } from "@/components/ui/spinner"

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingOverlay({ isVisible, message = "Carregando..." }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
    >
      <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-lg shadow-lg border">
        <Spinner className="size-8 text-blue-600" />
        <p className="text-sm font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
}