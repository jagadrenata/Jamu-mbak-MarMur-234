import { useEffect } from "react";
import { useGuestCartStore } from "@/store/useGuestCartStore";

export function useCartSync() {
  const syncWithServer = useGuestCartStore((s) => s.syncWithServer);

  useEffect(() => {
    syncWithServer();
  }, []);
}