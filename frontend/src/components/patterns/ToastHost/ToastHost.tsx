import { useCallback, useState, type ReactNode } from "react";
import {
  Toast,
  ToastProvider,
  ToastViewport,
  type ToastItem,
} from "../../ui/Toast";
import { ToastContext, type ShowToast } from "./ToastContext";

let sequence = 0;

/** 全局轻提示队列：放在应用外壳里一次，业务里用 useToast() 弹提示 */
export function ToastHost({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback<ShowToast>((title, options = {}) => {
    sequence += 1;
    const item: ToastItem = { id: `toast-${sequence}`, title, ...options };
    // 最新的放在最前，叠放时在上
    setItems((prev) => [item, ...prev]);
  }, []);

  const remove = (id: string) =>
    setItems((prev) => prev.filter((item) => item.id !== id));

  return (
    <ToastContext.Provider value={show}>
      <ToastProvider swipeDirection="right">
        {children}
        {items.map((item) => (
          <Toast
            key={item.id}
            tone={item.tone}
            title={item.title}
            description={item.description}
            duration={item.duration}
            onOpenChange={(open) => {
              if (!open) remove(item.id);
            }}
          />
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}
