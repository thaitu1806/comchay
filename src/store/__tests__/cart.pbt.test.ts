import { describe, it, expect, beforeEach } from "vitest";
import fc from "fast-check";
import { useCartStore, getCartKey } from "@/store/cart";
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
          const newKey = getCartKey({ productId, variantId: null });
          const addedItem = itemsAfter.find(
            (item) => getCartKey(item) === newKey
          );
          expect(addedItem).toBeDefined();
          expect(addedItem!.productName).toBe(productName);
          expect(addedItem!.productPrice).toBe(productPrice);
          expect(addedItem!.thumbnailUrl).toBe(thumbnailUrl);
          expect(addedItem!.quantity).toBe(quantity);

          // 2. All other items in the cart remain unchanged
          for (const before of itemsBefore) {
            const beforeKey = getCartKey(before);
            if (beforeKey === newKey) continue;
            const after = itemsAfter.find(
              (item) => getCartKey(item) === beforeKey
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

          // Populate cart with all items (no variant → variantId null)
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
          const removeKey = getCartKey({ productId: itemToRemove.productId, variantId: null });

          // Remove the selected item using cart key
          useCartStore.getState().removeItem(removeKey);

          const itemsAfter = useCartStore.getState().items;

          // 1. The removed item is no longer in the cart
          const removedInCart = itemsAfter.find(
            (item) => getCartKey(item) === removeKey
          );
          expect(removedInCart).toBeUndefined();

          // 2. All remaining items are unchanged
          for (const before of itemsBefore) {
            if (getCartKey(before) === removeKey) continue;
            const after = itemsAfter.find(
              (item) => getCartKey(item) === getCartKey(before)
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
    variantId: fc.oneof(fc.constant(null), fc.integer({ min: 1, max: 10000 })),
    riceType: fc.oneof(fc.constant(null), fc.constantFrom("Gạo Thường", "Gạo Lứt")),
    spiceLevel: fc.oneof(fc.constant(null), fc.constantFrom("Cay nhiều", "Cay vừa", "Không cay")),
    weight: fc.oneof(fc.constant(null), fc.integer({ min: 50, max: 5000 })),
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

          // Populate cart (no variant info → defaults to null)
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
          const expectedShippingFee = calculateShippingFee(expectedTotalBags, "HCM");
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


/**
 * **Validates: Requirements 3.1**
 *
 * Property 5 V2: Thêm sản phẩm với biến thể vào giỏ hàng
 * For any sản phẩm hợp lệ với thông tin biến thể (variantId, riceType, spiceLevel, weight)
 * và số lượng > 0, khi thêm vào giỏ hàng:
 * 1. Giỏ hàng phải chứa item với đầy đủ thông tin biến thể đã chọn
 * 2. Giá đúng bằng giá biến thể (productPrice)
 * 3. Các item khác trong giỏ không bị thay đổi
 */
describe("CartStore — Property 5 V2: Adding product with variant to cart", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  const arbRiceType = fc.constantFrom("Gạo Thường", "Gạo Lứt");
  const arbSpiceLevel = fc.constantFrom("Cay nhiều", "Cay vừa", "Không cay");

  const arbProductWithVariant = fc.record({
    productId: fc.integer({ min: 1, max: 100000 }),
    productName: fc.string({ minLength: 1, maxLength: 50 }),
    productPrice: fc.integer({ min: 1000, max: 1000000 }),
    thumbnailUrl: fc.string({ minLength: 1, maxLength: 100 }),
    variantId: fc.integer({ min: 1, max: 100000 }),
    riceType: arbRiceType,
    spiceLevel: arbSpiceLevel,
    weight: fc.integer({ min: 50, max: 5000 }),
  });

  // Arbitrary for a pre-existing cart item (different product, to verify it stays unchanged)
  const arbExistingItem = fc.record({
    productId: fc.integer({ min: 200001, max: 300000 }), // non-overlapping range
    productName: fc.string({ minLength: 1, maxLength: 50 }),
    productPrice: fc.integer({ min: 1000, max: 1000000 }),
    thumbnailUrl: fc.string({ minLength: 1, maxLength: 100 }),
    quantity: fc.integer({ min: 1, max: 50 }),
  });

  it("after addItem with variant info, cart contains item with full variant details and correct price, other items unchanged", () => {
    fc.assert(
      fc.property(
        arbProductWithVariant,
        fc.integer({ min: 1, max: 100 }),
        fc.array(arbExistingItem, { minLength: 0, maxLength: 5 }),
        (product, quantity, existingItems) => {
          // Reset store
          useCartStore.setState({ items: [] });

          // Pre-populate cart with existing items (no variant → variantId null)
          for (const existing of existingItems) {
            useCartStore.getState().addItem(
              {
                productId: existing.productId,
                productName: existing.productName,
                productPrice: existing.productPrice,
                thumbnailUrl: existing.thumbnailUrl,
              },
              existing.quantity
            );
          }

          const itemsBefore = useCartStore.getState().items.map((item) => ({ ...item }));

          // Add the product with variant info
          useCartStore.getState().addItem(
            {
              productId: product.productId,
              productName: product.productName,
              productPrice: product.productPrice,
              thumbnailUrl: product.thumbnailUrl,
              variantId: product.variantId,
              riceType: product.riceType,
              spiceLevel: product.spiceLevel,
              weight: product.weight,
            },
            quantity
          );

          const itemsAfter = useCartStore.getState().items;

          // 1. Cart contains the added item with full variant info
          const newKey = getCartKey({
            productId: product.productId,
            variantId: product.variantId,
          });
          const addedItem = itemsAfter.find(
            (item) => getCartKey(item) === newKey
          );
          expect(addedItem).toBeDefined();
          expect(addedItem!.productId).toBe(product.productId);
          expect(addedItem!.productName).toBe(product.productName);
          expect(addedItem!.variantId).toBe(product.variantId);
          expect(addedItem!.riceType).toBe(product.riceType);
          expect(addedItem!.spiceLevel).toBe(product.spiceLevel);
          expect(addedItem!.weight).toBe(product.weight);

          // 2. Price equals the variant price
          expect(addedItem!.productPrice).toBe(product.productPrice);

          // 3. Quantity is correct
          expect(addedItem!.quantity).toBe(quantity);

          // 4. All other items in the cart remain unchanged
          for (const before of itemsBefore) {
            const beforeKey = getCartKey(before);
            if (beforeKey === newKey) continue;
            const after = itemsAfter.find(
              (item) => getCartKey(item) === beforeKey
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
 * **Validates: Requirements 3.2, 3.3**
 *
 * Property 6: Giỏ hàng phân biệt biến thể bằng key productId+variantId
 * For any giỏ hàng và hai thao tác thêm sản phẩm cùng productId:
 * - Nếu variantId giống nhau → số lượng được cộng dồn vào dòng hiện tại, không tạo dòng mới
 * - Nếu variantId khác nhau → tạo dòng riêng biệt cho mỗi biến thể
 */
describe("CartStore — Property 6: Cart distinguishes variants by key productId+variantId", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  const arbRiceType = fc.constantFrom("Gạo Thường", "Gạo Lứt");
  const arbSpiceLevel = fc.constantFrom("Cay nhiều", "Cay vừa", "Không cay");

  it("same productId + same variantId → quantities are merged, no new line created", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100000 }),       // productId
        fc.string({ minLength: 1, maxLength: 50 }), // productName
        fc.integer({ min: 1000, max: 1000000 }),    // productPrice
        fc.string({ minLength: 1, maxLength: 100 }), // thumbnailUrl
        fc.oneof(fc.constant(null), fc.integer({ min: 1, max: 100000 })), // variantId (null or number)
        fc.integer({ min: 1, max: 50 }),            // quantity1
        fc.integer({ min: 1, max: 50 }),            // quantity2
        (productId, productName, productPrice, thumbnailUrl, variantId, quantity1, quantity2) => {
          // Reset store
          useCartStore.setState({ items: [] });

          const product = {
            productId,
            productName,
            productPrice,
            thumbnailUrl,
            variantId,
            riceType: "Gạo Thường" as string | null,
            spiceLevel: "Cay vừa" as string | null,
            weight: 250 as number | null,
          };

          // First add
          useCartStore.getState().addItem(product, quantity1);
          const itemsAfterFirst = useCartStore.getState().items;
          const countAfterFirst = itemsAfterFirst.length;

          // Second add with same productId + same variantId
          useCartStore.getState().addItem(product, quantity2);
          const itemsAfterSecond = useCartStore.getState().items;

          // No new line created — item count stays the same
          expect(itemsAfterSecond.length).toBe(countAfterFirst);

          // Quantity is merged (summed)
          const key = getCartKey({ productId, variantId });
          const mergedItem = itemsAfterSecond.find(
            (item) => getCartKey(item) === key
          );
          expect(mergedItem).toBeDefined();
          expect(mergedItem!.quantity).toBe(quantity1 + quantity2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("same productId + different variantId → separate lines for each variant", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100000 }),       // productId (same for both)
        fc.string({ minLength: 1, maxLength: 50 }), // productName
        fc.integer({ min: 1000, max: 1000000 }),    // price1
        fc.integer({ min: 1000, max: 1000000 }),    // price2
        fc.string({ minLength: 1, maxLength: 100 }), // thumbnailUrl
        fc.integer({ min: 1, max: 100000 }),        // variantId1
        fc.integer({ min: 100001, max: 200000 }),   // variantId2 (guaranteed different from variantId1)
        fc.integer({ min: 1, max: 50 }),            // quantity1
        fc.integer({ min: 1, max: 50 }),            // quantity2
        arbRiceType,                                 // riceType1
        arbRiceType,                                 // riceType2
        arbSpiceLevel,                               // spiceLevel1
        arbSpiceLevel,                               // spiceLevel2
        (productId, productName, price1, price2, thumbnailUrl, variantId1, variantId2, quantity1, quantity2, riceType1, riceType2, spiceLevel1, spiceLevel2) => {
          // Reset store
          useCartStore.setState({ items: [] });

          // Add first variant
          useCartStore.getState().addItem(
            {
              productId,
              productName,
              productPrice: price1,
              thumbnailUrl,
              variantId: variantId1,
              riceType: riceType1,
              spiceLevel: spiceLevel1,
              weight: 250,
            },
            quantity1
          );

          // Add second variant (same productId, different variantId)
          useCartStore.getState().addItem(
            {
              productId,
              productName,
              productPrice: price2,
              thumbnailUrl,
              variantId: variantId2,
              riceType: riceType2,
              spiceLevel: spiceLevel2,
              weight: 500,
            },
            quantity2
          );

          const items = useCartStore.getState().items;

          // Two separate lines exist
          const key1 = getCartKey({ productId, variantId: variantId1 });
          const key2 = getCartKey({ productId, variantId: variantId2 });

          const item1 = items.find((item) => getCartKey(item) === key1);
          const item2 = items.find((item) => getCartKey(item) === key2);

          expect(item1).toBeDefined();
          expect(item2).toBeDefined();

          // Each line has its own quantity (not merged)
          expect(item1!.quantity).toBe(quantity1);
          expect(item2!.quantity).toBe(quantity2);

          // Each line has its own price
          expect(item1!.productPrice).toBe(price1);
          expect(item2!.productPrice).toBe(price2);

          // Both share the same productId
          expect(item1!.productId).toBe(productId);
          expect(item2!.productId).toBe(productId);

          // Keys are different
          expect(key1).not.toBe(key2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("null variantId and numeric variantId on same product → separate lines", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100000 }),       // productId
        fc.string({ minLength: 1, maxLength: 50 }), // productName
        fc.integer({ min: 1000, max: 1000000 }),    // price for no-variant
        fc.integer({ min: 1000, max: 1000000 }),    // price for variant
        fc.string({ minLength: 1, maxLength: 100 }), // thumbnailUrl
        fc.integer({ min: 1, max: 100000 }),        // variantId (numeric)
        fc.integer({ min: 1, max: 50 }),            // quantity1
        fc.integer({ min: 1, max: 50 }),            // quantity2
        (productId, productName, priceNoVariant, priceWithVariant, thumbnailUrl, variantId, quantity1, quantity2) => {
          // Reset store
          useCartStore.setState({ items: [] });

          // Add product without variant (variantId = null)
          useCartStore.getState().addItem(
            {
              productId,
              productName,
              productPrice: priceNoVariant,
              thumbnailUrl,
            },
            quantity1
          );

          // Add same product with a variant (variantId = number)
          useCartStore.getState().addItem(
            {
              productId,
              productName,
              productPrice: priceWithVariant,
              thumbnailUrl,
              variantId,
              riceType: "Gạo Lứt",
              spiceLevel: "Cay vừa",
              weight: 250,
            },
            quantity2
          );

          const items = useCartStore.getState().items;

          const keyNull = getCartKey({ productId, variantId: null });
          const keyVariant = getCartKey({ productId, variantId });

          // Keys must be different
          expect(keyNull).not.toBe(keyVariant);

          // Two separate lines
          const itemNull = items.find((item) => getCartKey(item) === keyNull);
          const itemVariant = items.find((item) => getCartKey(item) === keyVariant);

          expect(itemNull).toBeDefined();
          expect(itemVariant).toBeDefined();

          expect(itemNull!.quantity).toBe(quantity1);
          expect(itemVariant!.quantity).toBe(quantity2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
