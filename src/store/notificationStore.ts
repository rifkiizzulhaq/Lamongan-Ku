import { create } from "zustand";

interface NotificationStore {
  hasNewBungkus: boolean;
  hasNewMeja: boolean;
  newMejaIds: number[];
  unseenUpdatedOrders: number[];
  highlightedOrders: number[];
  highlightTimeouts: Record<number, NodeJS.Timeout | undefined>;
  setHasNewBungkus: (val: boolean) => void;
  setHasNewMeja: (val: boolean) => void;
  addNewMejaId: (id: number) => void;
  clearNewMejaId: (id: number) => void;
  addUnseenUpdatedOrder: (orderId: number) => void;
  clearUnseenUpdatedOrder: (orderId: number) => void;
  activateHighlight: (orderId: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  hasNewBungkus: false,
  hasNewMeja: false,
  newMejaIds: [],
  unseenUpdatedOrders: [],
  highlightedOrders: [],
  highlightTimeouts: {} as Record<number, NodeJS.Timeout>,
  setHasNewBungkus: (val) => set({ hasNewBungkus: val }),
  setHasNewMeja: (val) => set({ hasNewMeja: val }),
  addNewMejaId: (id) =>
    set((state) => ({
      newMejaIds: state.newMejaIds.includes(id)
        ? state.newMejaIds
        : [...state.newMejaIds, id],
    })),
  clearNewMejaId: (id) =>
    set((state) => ({
      newMejaIds: state.newMejaIds.filter((existingId) => existingId !== id),
    })),
  addUnseenUpdatedOrder: (orderId) =>
    set((state) => ({
      unseenUpdatedOrders: state.unseenUpdatedOrders.includes(orderId)
        ? state.unseenUpdatedOrders
        : [...state.unseenUpdatedOrders, orderId],
    })),
  clearUnseenUpdatedOrder: (orderId) =>
    set((state) => ({
      unseenUpdatedOrders: state.unseenUpdatedOrders.filter(
        (id) => id !== orderId,
      ),
    })),
  activateHighlight: (orderId) => {
    set((state) => {
      // 1. Bersihkan timer lama jika ada agar tidak bentrok (timer refresh)
      if (state.highlightTimeouts[orderId]) {
        clearTimeout(state.highlightTimeouts[orderId]);
      }

      // 2. Set timer baru 10 detik
      const newTimeout = setTimeout(() => {
        set((s) => ({
          highlightedOrders: s.highlightedOrders.filter((id) => id !== orderId),
          highlightTimeouts: { ...s.highlightTimeouts, [orderId]: undefined },
        }));
      }, 10000);

      return {
        unseenUpdatedOrders: state.unseenUpdatedOrders.filter(
          (id) => id !== orderId,
        ),
        highlightedOrders: state.highlightedOrders.includes(orderId)
          ? state.highlightedOrders
          : [...state.highlightedOrders, orderId],
        highlightTimeouts: {
          ...state.highlightTimeouts,
          [orderId]: newTimeout,
        },
      };
    });
  },
}));
