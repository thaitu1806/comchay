import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateShippingFee, type Region } from "@/lib/shipping";

export interface CartItem {
  productId: number;
  productName: string;
  productPrice: number;
  thumbnailUrl: string;
  quantity: number;
  variantId: number | null;   // null if product has no variants
  riceType: string | null;
  spiceLevel: string | null;
  weight: number | null;       // gram
}

/**
 * Generate a unique cart key for an item based on productId and variantId.
 * Same productId + same variantId → same key (merge quantities).
 * Same productId + different variantId → different key (separate lines).
 */
export function getCartKey(item: Pick<CartItem, "productId" | "variantId">): string {
  return `${item.productId}-${item.variantId ?? "default"}`;
}

interface CartState {
  items: CartItem[];
  addItem: (
    product: {
      productId: number;
      productName: string;
      productPrice: number;
      thumbnailUrl: string;
      variantId?: number | null;
      riceType?: string | null;
      spiceLevel?: string | null;
      weight?: number | null;
    },
    quantity: number
  ) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  removeItem: (cartKey: string) => void;
  clearCart: () => void;
  getTotalBags: () => number;
  getSubtotal: () => number;
  getShippingFee: (region?: Region) => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
  items: [],

  addItem: (product, quantity) => {
    const newItemKey = getCartKey({
      productId: product.productId,
      variantId: product.variantId ?? null,
    });

    set((state) => {
      const existing = state.items.find(
        (item) => getCartKey(item) === newItemKey
      );
      if (existing) {
        return {
          items: state.items.map((item) =>
            getCartKey(item) === newItemKey
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
            variantId: product.variantId ?? null,
            riceType: product.riceType ?? null,
            spiceLevel: product.spiceLevel ?? null,
            weight: product.weight ?? null,
          },
        ],
      };
    });
  },

  updateQuantity: (cartKey, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((item) => getCartKey(item) !== cartKey) };
      }
      return {
        items: state.items.map((item) =>
          getCartKey(item) === cartKey ? { ...item, quantity } : item
        ),
      };
    });
  },

  removeItem: (cartKey) => {
    set((state) => ({
      items: state.items.filter((item) => getCartKey(item) !== cartKey),
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

  getShippingFee: (region: Region = "HCM") => {
    return calculateShippingFee(get().getTotalBags(), region);
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
