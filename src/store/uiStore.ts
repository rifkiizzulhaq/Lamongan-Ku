import { create } from "zustand";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
}

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface UiState {
  toasts: ToastProps[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;

  confirmModal: ConfirmModalProps;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
  ) => void;
  closeConfirm: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  toasts: [],
  addToast: (message, type = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  confirmModal: {
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
  },
  showConfirm: (title, message, onConfirm, onCancel) => {
    set({
      confirmModal: {
        isOpen: true,
        title,
        message,
        onConfirm: () => {
          onConfirm();
          get().closeConfirm();
        },
        onCancel: () => {
          if (onCancel) onCancel();
          get().closeConfirm();
        },
      },
    });
  },
  closeConfirm: () => {
    set((state) => ({
      confirmModal: { ...state.confirmModal, isOpen: false },
    }));
  },
}));
