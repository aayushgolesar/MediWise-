/**
 * src/utils/toastStore.ts
 * Lightweight reactive toast notification store for MediWise.
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  durationMs?: number;
}

type Listener = (toasts: ToastItem[]) => void;

class ToastStore {
  private toasts: ToastItem[] = [];
  private listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.toasts);
    }
  }

  show(toast: Omit<ToastItem, 'id'>): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newItem: ToastItem = {
      ...toast,
      id,
      durationMs: toast.durationMs ?? 4500,
    };

    // Keep at most 4 toasts active at once
    this.toasts = [newItem, ...this.toasts.slice(0, 3)];
    this.notify();

    if (newItem.durationMs && newItem.durationMs > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, newItem.durationMs);
    }

    return id;
  }

  dismiss(id: string) {
    const prevLen = this.toasts.length;
    this.toasts = this.toasts.filter(t => t.id !== id);
    if (this.toasts.length !== prevLen) {
      this.notify();
    }
  }

  clear() {
    this.toasts = [];
    this.notify();
  }
}

export const toastStore = new ToastStore();

export const showSuccessToast = (message: string, title = 'Success') =>
  toastStore.show({ type: 'success', title, message });

export const showErrorToast = (message: string, title = 'Error') =>
  toastStore.show({ type: 'error', title, message, durationMs: 6000 });

export const showWarningToast = (message: string, title = 'Warning') =>
  toastStore.show({ type: 'warning', title, message });

export const showInfoToast = (message: string, title = 'Notice') =>
  toastStore.show({ type: 'info', title, message });
