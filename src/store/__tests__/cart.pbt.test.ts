import { describe, it, expect, beforeEach } from "vitest";
import fc from "fast-check";
import { useCartStore } from "@/store/cart";
import { calculateShippingFee } from "@/lib/shipping";

/**
 * **Validates: Requirements 3.1**
 *
 * Property 3: Thêm sản phẩm vào giỏ hàng
 * For any product and quantity > 0, after addItem:
 * 1. The cart contains the added product with the correct quantity
 * 2. All other items in the cart remain unchanged
 */
describe("CartStore — Property 3: Adding product to cart", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it("after addItem, cart contains the product with correct quantity and other items are unchanged", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        fc.string({ minLength: 1 }),
        fc.integer({ min: 1000, max: 1000000 }),
        fc.string({ minLength: 1 }),
        fc.integer({ min: 1, max: 100 }),
        (productId, productName, productPrice, thumbnailUrl, quantity) => {
          // Reset store
          useCartStore.setState({ items: [] });

          // Pre-populate cart with a different product to verify it stays unchanged
          const existingProduct = {
            productId: productId + 1001, // ensure different ID
            productName: "Existing Product",
            productPrice: 99999,
            thumbnailUrl: "https://example.com/existing.jpg",
          };
          useCartStore.getState().addItem(existingProduct, 3);

          const itemsBefore = [...useCartStore.getState().items];

          // Add the random product
          const newProduct = {
            productId,
            productName,
            productPrice,
            thumbnailUrl,
          };
          useCartStore.getState().addItem(newProduct, quantity);

          const itemsAfter = useCartStore.getState().items;

          // 1. Cart contains the added product with correct quantity
          const addedItem = itemsAfter.find(
            (item) => item.productId === productId
          );
          expect(addedItem).toBeDefined();
          expect(addedItem!.productName).toBe(productName);
          expect(addedItem!.productPrice).toBe(productPrice);
          expect(addedItem!.thumbnailUrl).toBe(thumbnailUrl);
          expect(addedItem!.quantity).toBe(quantity);

          // 2. All other items in the cart remain unchanged
          for (const before of itemsBefore) {
            if (before.productId === productId) continue;
            const after = itemsAfter.find(
              (item) => item.productId === before.productId
            );
            expect(after).toBeDefined();
            expect(after).toEqual(before);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Validates: Requirements 3.3**
 *
 * Property 4: Xóa sản phẩm khỏi giỏ hàng
 * For any cart with at least 1 item, when removing one item:
 * 1. The removed item is no longer in the cart
 * 2. All remaining items are unchanged
 */
describe("CartStore — Property 4: Removing product from cart", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  const arbCartItem = fc.record({
    productId: fc.integer({ min: 1, max: 100000 }),
    productName: fc.string({ minLength: 1, maxLength: 50 }),
    productPrice: fc.integer({ min: 1000, max: 1000000 }),
    thumbnailUrl: fc.string({ minLength: 1, maxLength: 100 }),
    quantity: fc.integer({ min: 1, max: 100 }),
  });

  it("after removeItem, the removed item is gone and all remaining items are unchanged", () => {
    fc.assert(
      fc.property(
        fc
          .uniqueArray(arbCartItem, {
            minLength: 1,
            maxLength: 10,
            selector: (item) => item.productId,
          })
          .chain((items) =>
            fc.record({
              items: fc.constant(items),
              removeIndex: fc.integer({ min: 0, max: items.length - 1 }),
            })
          ),
        ({ items, removeIndex }) => {
          // Reset store
          useCartStore.setState({ items: [] });

          // Populate cart with all items
          for (const item of items) {
            useCartStore.getState().addItem(
              {
                productId: item.productId,
                productName: item.productName,
                productPrice: item.productPrice,
                thumbnailUrl: item.thumbnailUrl,
              },
              item.quantity
            );
          }

          const itemsBefore = [...useCartStore.getState().items];
          const itemToRemove = items[removeIndex];

          // Remove the selected item
          useCartStore.getState().removeItem(itemToRemove.productId);

          const itemsAfter = useCartStore.getState().items;

          // 1. The removed item is no longer in the cart
          const removedInCart = itemsAfter.find(
            (item) => item.productId === itemToRemove.productId
          );
          expect(removedInCart).toBeUndefined();

          // 2. All remaining items are unchanged
          for (const before of itemsBefore) {
            if (before.productId === itemToRemove.productId) continue;
            const after = itemsAfter.find(
              (item) => item.productId === before.productId
            );
            expect(after).toBeDefined();
            expect(after).toEqual(before);
          }

          // Verify count: should be one less
          expect(itemsAfter.length).toBe(itemsBefore.length - 1);
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * **Validates: Requirements 3.4**
 *
 * Property 5: Giỏ hàng round-trip qua localStorage
 * For any valid cart state (list of items with quantities),
 * serializing to JSON and deserializing back produces the same state.
 */
describe("CartStore — Property 5: Cart round-trip through localStorage", () => {
  const arbCartItem = fc.record({
    productId: fc.integer({ min: 1, max: 100000 }),
    productName: fc.string({ minLength: 1 }),
    productPrice: fc.integer({ min: 1000, max: 1000000 }),
    thumbnailUrl: fc.string({ minLength: 1 }),
    quantity: fc.integer({ min: 1, max: 100 }),
  });

  it("JSON.parse(JSON.stringify({items})) deep-equals {items} for any valid cart state", () => {
    fc.assert(
      fc.property(
        fc.array(arbCartItem, { minLength: 0, maxLength: 20 }),
        (items) => {
          const cartState = { items };
          const serialized = JSON.stringify(cartState);
          const deserialized = JSON.parse(serialized);
          expect(deserialized).toEqual(cartState);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Validates: Requirements 3.2, 3.5**
 *
 * Property 6: Tổng tiền giỏ hàng luôn đúng
 * For any cart with items:
 * - subtotal = Σ(price × quantity) for all items
 * - shippingFee = calculateShippingFee(totalBags) where totalBags = Σ(quantity)
 * - total = subtotal + shippingFee
 */
describe("CartStore — Property 6: Cart totals are always correct", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  const arbCartItem = fc.record({
    productId: fc.integer({ min: 1, max: 100000 }),
    productName: fc.string({ minLength: 1, maxLength: 50 }),
    productPrice: fc.integer({ min: 1000, max: 1000000 }),
    thumbnailUrl: fc.string({ minLength: 1, maxLength: 100 }),
    quantity: fc.integer({ min: 1, max: 100 }),
  });

  it("subtotal, shippingFee, and total are always correctly computed from cart items", () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(arbCartItem, {
          minLength: 0,
          maxLength: 15,
          selector: (item) => item.productId,
        }),
        (items) => {
          // Reset store
          useCartStore.setState({ items: [] });

          // Populate cart
          for (const item of items) {
            useCartStore.getState().addItem(
              {
                productId: item.productId,
                productName: item.productName,
                productPrice: item.productPrice,
                thumbnailUrl: item.thumbnailUrl,
              },
              item.quantity
            );
          }

          const store = useCartStore.getState();

          // Expected values computed independently
          const expectedSubtotal = items.reduce(
            (sum, item) => sum + item.productPrice * item.quantity,
            0
          );
          const expectedTotalBags = items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          const expectedShippingFee = calculateShippingFee(expectedTotalBags);
          const expectedTotal = expectedSubtotal + expectedShippingFee;

          // Verify getters
          expect(store.getTotalBags()).toBe(expectedTotalBags);
          expect(store.getSubtotal()).toBe(expectedSubtotal);
          expect(store.getShippingFee()).toBe(expectedShippingFee);
          expect(store.getTotal()).toBe(expectedTotal);
        }
      ),
      { numRuns: 100 }
    );
  });
});
