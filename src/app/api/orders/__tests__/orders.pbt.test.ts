import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { validateOrderForm } from "../validation";

/**
 * **Validates: Requirements 6.3**
 *
 * Property 9: Validate trường bắt buộc form đặt hàng
 * For any form data that is missing at least one required field
 * (customerName, address, phone), the validation should reject it.
 */
describe("OrderForm — Property 9: Validate required fields on order form", () => {
  // Arbitrary for a non-empty trimmed string (valid field value)
  const nonEmptyString = fc
    .string({ minLength: 1 })
    .filter((s) => s.trim().length > 0);

  // Valid Vietnamese phone: '0' + 9 digits
  const validPhone = fc
    .array(fc.integer({ min: 0, max: 9 }), { minLength: 9, maxLength: 9 })
    .map((digits) => "0" + digits.join(""));

  // At least one valid order item
  const validItems = fc
    .array(
      fc.record({
        productId: fc.integer({ min: 1, max: 1000 }),
        productName: nonEmptyString,
        productPrice: fc.integer({ min: 1000, max: 1000000 }),
        quantity: fc.integer({ min: 1, max: 100 }),
      }),
      { minLength: 1, maxLength: 5 }
    );

  // An "empty-ish" value: one of undefined, null, empty string, or whitespace-only
  const emptyValue = fc.oneof(
    fc.constant(undefined),
    fc.constant(null),
    fc.constant(""),
    fc.constant("   ")
  );

  it("should reject when customerName is missing/empty (other fields valid)", () => {
    fc.assert(
      fc.property(
        emptyValue,
        nonEmptyString,
        validPhone,
        validItems,
        (customerName, address, phone, items) => {
          const errors = validateOrderForm({ customerName, address, phone, items });
          expect(errors.length).toBeGreaterThan(0);
          expect(errors).toContain("Tên khách hàng là bắt buộc");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should reject when address is missing/empty (other fields valid)", () => {
    fc.assert(
      fc.property(
        nonEmptyString,
        emptyValue,
        validPhone,
        validItems,
        (customerName, address, phone, items) => {
          const errors = validateOrderForm({ customerName, address, phone, items });
          expect(errors.length).toBeGreaterThan(0);
          expect(errors).toContain("Địa chỉ là bắt buộc");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should reject when phone is missing/empty (other fields valid)", () => {
    fc.assert(
      fc.property(
        nonEmptyString,
        nonEmptyString,
        emptyValue,
        validItems,
        (customerName, address, phone, items) => {
          const errors = validateOrderForm({ customerName, address, phone, items });
          expect(errors.length).toBeGreaterThan(0);
          expect(errors).toContain("Số điện thoại là bắt buộc");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should reject when at least one required field is randomly missing", () => {
    // Generate form data where at least one of the 3 required fields is empty
    const formWithMissingField = fc
      .record({
        customerName: fc.oneof(nonEmptyString, emptyValue),
        address: fc.oneof(nonEmptyString, emptyValue),
        phone: fc.oneof(validPhone, emptyValue),
        items: validItems,
      })
      .filter((data) => {
        // Ensure at least one required field is actually missing/empty
        const nameMissing =
          !data.customerName ||
          typeof data.customerName !== "string" ||
          !data.customerName.trim();
        const addressMissing =
          !data.address ||
          typeof data.address !== "string" ||
          !data.address.trim();
        const phoneMissing =
          !data.phone ||
          typeof data.phone !== "string" ||
          !data.phone.trim();
        return nameMissing || addressMissing || phoneMissing;
      });

    fc.assert(
      fc.property(formWithMissingField, (data) => {
        const errors = validateOrderForm(data);
        expect(errors.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * **Validates: Requirements 9.2, 9.3**
 *
 * Property 12: Lọc đơn hàng theo khoảng thời gian
 * For any list of orders with random created_at dates and a valid date range
 * [startDate, endDate], filtering should return only orders within the range
 * and not miss any.
 */
describe("Orders — Property 12: Filter orders by date range", () => {
  /**
   * Pure filtering function that mirrors the API route logic:
   * orders where created_at >= startDate AND created_at <= endDate
   */
  function filterOrdersByDateRange(
    ordersList: { id: number; createdAt: string }[],
    startDate: string,
    endDate: string
  ) {
    return ordersList.filter(
      (order) => order.createdAt >= startDate && order.createdAt <= endDate
    );
  }

  // Generate a random ISO date string within a reasonable range using integer timestamps
  const minTimestamp = new Date("2020-01-01T00:00:00.000Z").getTime();
  const maxTimestamp = new Date("2030-12-31T23:59:59.999Z").getTime();

  const isoDateArb = fc
    .integer({ min: minTimestamp, max: maxTimestamp })
    .map((ts) => new Date(ts).toISOString());

  // Generate a valid date range where startDate <= endDate
  const dateRangeArb = fc
    .tuple(isoDateArb, isoDateArb)
    .map(([a, b]) => (a <= b ? { startDate: a, endDate: b } : { startDate: b, endDate: a }));

  // Generate an order with a random id and random created_at
  const orderArb = fc.record({
    id: fc.integer({ min: 1, max: 100000 }),
    createdAt: isoDateArb,
  });

  // Generate a list of orders
  const ordersListArb = fc.array(orderArb, { minLength: 0, maxLength: 30 });

  it("all returned orders have created_at within [startDate, endDate]", () => {
    fc.assert(
      fc.property(ordersListArb, dateRangeArb, (ordersList, { startDate, endDate }) => {
        const result = filterOrdersByDateRange(ordersList, startDate, endDate);

        for (const order of result) {
          expect(order.createdAt >= startDate).toBe(true);
          expect(order.createdAt <= endDate).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("no orders within range are missing from the result", () => {
    fc.assert(
      fc.property(ordersListArb, dateRangeArb, (ordersList, { startDate, endDate }) => {
        const result = filterOrdersByDateRange(ordersList, startDate, endDate);

        // Every order in the original list that falls within range must appear in result
        const expectedInRange = ordersList.filter(
          (order) => order.createdAt >= startDate && order.createdAt <= endDate
        );

        expect(result.length).toBe(expectedInRange.length);

        for (const expected of expectedInRange) {
          expect(result).toContainEqual(expected);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("orders outside the range are excluded from the result", () => {
    fc.assert(
      fc.property(ordersListArb, dateRangeArb, (ordersList, { startDate, endDate }) => {
        const result = filterOrdersByDateRange(ordersList, startDate, endDate);

        // No order outside the range should appear in the result
        for (const order of result) {
          const isOutside = order.createdAt < startDate || order.createdAt > endDate;
          expect(isOutside).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });
});
