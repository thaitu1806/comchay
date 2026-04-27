import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore, getCartKey } from "../cart";

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

  describe("getCartKey", () => {
    it("returns productId-default when variantId is null", () => {
      expect(getCartKey({ productId: 1, variantId: null })).toBe("1-default");
    });

    it("returns productId-variantId when variantId is set", () => {
      expect(getCartKey({ productId: 1, variantId: 42 })).toBe("1-42");
    });
  });

  describe("addItem", () => {
    it("adds a new item to empty cart", () => {
      useCartStore.getState().addItem(product1, 2);
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0]).toEqual({
        ...product1,
        quantity: 2,
        variantId: null,
        riceType: null,
        spiceLevel: null,
        weight: null,
      });
    });

    it("increments quantity when adding existing product (same variantId)", () => {
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

    it("adds same product with different variantId as separate lines", () => {
      useCartStore.getState().addItem({ ...product1, variantId: 10, riceType: "Gạo Thường", spiceLevel: "Cay vừa", weight: 250 }, 1);
      useCartStore.getState().addItem({ ...product1, variantId: 20, riceType: "Gạo Lứt", spiceLevel: "Không cay", weight: 500 }, 2);
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(2);
      expect(items[0].variantId).toBe(10);
      expect(items[0].quantity).toBe(1);
      expect(items[1].variantId).toBe(20);
      expect(items[1].quantity).toBe(2);
    });

    it("merges quantity for same product + same variantId", () => {
      useCartStore.getState().addItem({ ...product1, variantId: 10 }, 1);
      useCartStore.getState().addItem({ ...product1, variantId: 10 }, 3);
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(4);
    });

    it("stores variant info correctly", () => {
      useCartStore.getState().addItem({
        ...product1,
        variantId: 5,
        riceType: "Gạo Lứt",
        spiceLevel: "Cay nhiều",
        weight: 300,
      }, 1);
      const item = useCartStore.getState().items[0];
      expect(item.variantId).toBe(5);
      expect(item.riceType).toBe("Gạo Lứt");
      expect(item.spiceLevel).toBe("Cay nhiều");
      expect(item.weight).toBe(300);
    });
  });

  describe("updateQuantity", () => {
    it("updates quantity for an existing item using cart key", () => {
      useCartStore.getState().addItem(product1, 1);
      const key = getCartKey({ productId: 1, variantId: null });
      useCartStore.getState().updateQuantity(key, 5);
      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it("removes item when quantity is 0", () => {
      useCartStore.getState().addItem(product1, 2);
      const key = getCartKey({ productId: 1, variantId: null });
      useCartStore.getState().updateQuantity(key, 0);
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it("removes item when quantity is negative", () => {
      useCartStore.getState().addItem(product1, 2);
      const key = getCartKey({ productId: 1, variantId: null });
      useCartStore.getState().updateQuantity(key, -1);
      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it("updates correct variant line when multiple variants exist", () => {
      useCartStore.getState().addItem({ ...product1, variantId: 10 }, 1);
      useCartStore.getState().addItem({ ...product1, variantId: 20 }, 2);
      const key = getCartKey({ productId: 1, variantId: 20 });
      useCartStore.getState().updateQuantity(key, 5);
      const items = useCartStore.getState().items;
      expect(items[0].quantity).toBe(1); // variantId 10 unchanged
      expect(items[1].quantity).toBe(5); // variantId 20 updated
    });
  });

  describe("removeItem", () => {
    it("removes the specified item using cart key", () => {
      useCartStore.getState().addItem(product1, 1);
      useCartStore.getState().addItem(product2, 1);
      const key = getCartKey({ productId: 1, variantId: null });
      useCartStore.getState().removeItem(key);
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].productId).toBe(2);
    });

    it("removes correct variant line when multiple variants exist", () => {
      useCartStore.getState().addItem({ ...product1, variantId: 10 }, 1);
      useCartStore.getState().addItem({ ...product1, variantId: 20 }, 2);
      const key = getCartKey({ productId: 1, variantId: 10 });
      useCartStore.getState().removeItem(key);
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].variantId).toBe(20);
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
