import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "../cart";

const product1 = {
  productId: 1,
  productName: "Cơm cháy truyền thống",
  productPrice: 50000,
  thumbnailUrl: "https://example.com/img1.jpg",
};

const product2 = {
  productId: 2,
  productName: "Cơm cháy chà bông",
  productPrice: 60000,
  thumbnailUrl: "https://example.com/img2.jpg",
};

describe("CartStore", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  describe("addItem", () => {
    it("adds a new item to empty cart", () => {
      useCartStore.getState().addItem(product1, 2);
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0]).toEqual({ ...product1, quantity: 2 });
    });

    it("increments quantity when adding existing product", () => {
      useCartStore.getState().addItem(product1, 1);
      useCartStore.getState().addItem(product1, 3);
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(4);
    });

    it("adds different products as separate items", () => {
      useCartStore.getState().addItem(product1, 1);
      useCartStore.getState().addItem(product2, 2);
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(2);
    });
  });

  describe("updateQuantity", () => {
    it("updates quantity for an existing item", () => {
      useCartStore.getState().addItem(product1, 1);
      useCartStore.getState().updateQuantity(1, 5);
      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it("removes item when quantity is 0", () => {
      useCartStore.getState().addItem(product1, 2);
      useCartStore.getState().updateQuantity(1, 0);
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it("removes item when quantity is negative", () => {
      useCartStore.getState().addItem(product1, 2);
      useCartStore.getState().updateQuantity(1, -1);
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe("removeItem", () => {
    it("removes the specified item", () => {
      useCartStore.getState().addItem(product1, 1);
      useCartStore.getState().addItem(product2, 1);
      useCartStore.getState().removeItem(1);
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].productId).toBe(2);
    });
  });

  describe("clearCart", () => {
    it("removes all items", () => {
      useCartStore.getState().addItem(product1, 1);
      useCartStore.getState().addItem(product2, 2);
      useCartStore.getState().clearCart();
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe("getters", () => {
    it("getTotalBags returns sum of all quantities", () => {
      useCartStore.getState().addItem(product1, 2);
      useCartStore.getState().addItem(product2, 3);
      expect(useCartStore.getState().getTotalBags()).toBe(5);
    });

    it("getSubtotal returns sum of price * quantity", () => {
      useCartStore.getState().addItem(product1, 2); // 50000 * 2
      useCartStore.getState().addItem(product2, 1); // 60000 * 1
      expect(useCartStore.getState().getSubtotal()).toBe(160000);
    });

    it("getShippingFee uses calculateShippingFee", () => {
      // 1 bag → 30000
      useCartStore.getState().addItem(product1, 1);
      expect(useCartStore.getState().getShippingFee()).toBe(30000);
    });

    it("getShippingFee returns 0 for empty cart", () => {
      expect(useCartStore.getState().getShippingFee()).toBe(0);
    });

    it("getTotal returns subtotal + shippingFee", () => {
      useCartStore.getState().addItem(product1, 2); // subtotal: 100000, 2 bags → shipping: 20000
      expect(useCartStore.getState().getTotal()).toBe(120000);
    });
  });
});
