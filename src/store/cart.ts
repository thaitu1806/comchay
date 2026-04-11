import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateShippingFee } from "@/lib/shipping";

export interface CartItem {
  productId: number;
  productName: string;
  productPrice: number;
  thumbnailUrl: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (
    product: {
      productId: number;
      productName: string;
      productPrice: number;
      thumbnailUrl: string;
    },
    quantity: number
  ) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  getTotalBags: () => number;
  getSubtotal: () => number;
  getShippingFee: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
  items: [],

  addItem: (product, quantity) => {
    set((state) => {
      const existing = state.items.find(
        (item) => item.productId === product.productId
      );
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.productId === product.productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            productId: product.productId,
            productName: product.productName,
            productPrice: product.productPrice,
            thumbnailUrl: product.thumbnailUrl,
            quantity,
          },
        ],
      };
    });
  },

  updateQuantity: (productId, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((item) => item.productId !== productId) };
      }
      return {
        items: state.items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        ),
      };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    }));
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotalBags: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.productPrice * item.quantity,
      0
    );
  },

  getShippingFee: () => {
    return calculateShippingFee(get().getTotalBags());
  },

  getTotal: () => {
    return get().getSubtotal() + get().getShippingFee();
  },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
