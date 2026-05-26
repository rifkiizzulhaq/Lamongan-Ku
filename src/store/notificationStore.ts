import { create } from "zustand";

interface NotificationStore {
  hasNewBungkus: boolean;
  hasNewMeja: boolean;
  newMejaIds: number[];
  unseenUpdatedOrders: number[];
  highlightedOrders: number[];
  highlightTimeouts: Record<number, NodeJS.Timeout | undefined>;
  manualChangedItems: Record<number, string[]>;
  ignoredUpdateOrders: number[];
  setHasNewBungkus: (val: boolean) => void;
  setHasNewMeja: (val: boolean) => void;
  addNewMejaId: (id: number) => void;
  clearNewMejaId: (id: number) => void;
  addUnseenUpdatedOrder: (orderId: number) => void;
  clearUnseenUpdatedOrder: (orderId: number) => void;
  activateHighlight: (orderId: number) => void;
  setManualChangedItems: (orderId: number, items: string[]) => void;
  ignoreNextUpdateForOrder: (orderId: number) => void;
  removeIgnoredUpdateOrder: (orderId: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  hasNewBungkus: false,
  hasNewMeja: false,
  newMejaIds: [],
  unseenUpdatedOrders: [],
  highlightedOrders: [],
  highlightTimeouts: {} as Record<number, NodeJS.Timeout>,
  manualChangedItems: {},
  ignoredUpdateOrders: [],
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
  ignoreNextUpdateForOrder: (orderId) =>
    set((state) => ({
      ignoredUpdateOrders: state.ignoredUpdateOrders.includes(orderId)
        ? state.ignoredUpdateOrders
        : [...state.ignoredUpdateOrders, orderId],
    })),
  removeIgnoredUpdateOrder: (orderId) =>
    set((state) => ({
      ignoredUpdateOrders: state.ignoredUpdateOrders.filter((id) => id !== orderId),
    })),
  activateHighlight: (orderId) => {
    set((state) => {
      if (state.highlightTimeouts[orderId]) {
        clearTimeout(state.highlightTimeouts[orderId]);
      }

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
  setManualChangedItems: (orderId, items) =>
    set((state) => ({
      manualChangedItems: {
        ...state.manualChangedItems,
        [orderId]: items,
      },
    })),
}));
