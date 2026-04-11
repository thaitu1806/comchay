import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { isValidVietnamesePhone } from "@/lib/phone";

/**
 * **Validates: Requirements 6.4**
 *
 * Property 8: Xác thực số điện thoại Việt Nam
 * For any string, isValidVietnamesePhone returns true if and only if
 * the string has exactly 10 digits starting with '0'.
 */
describe("PhoneValidator — Property 8: Vietnamese phone number validation", () => {
  it("should return true for valid phones: '0' + 9 random digits", () => {
    const validPhone = fc
      .array(fc.integer({ min: 0, max: 9 }), { minLength: 9, maxLength: 9 })
      .map((digits) => "0" + digits.join(""));

    fc.assert(
      fc.property(validPhone, (phone) => {
        expect(isValidVietnamesePhone(phone)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("should return true for arbitrary strings only if they match the 10-digit-starting-with-0 pattern", () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        const expected = /^0\d{9}$/.test(s);
        expect(isValidVietnamesePhone(s)).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  it("should return false for digit strings of length != 10", () => {
    const wrongLengthDigits = fc
      .integer({ min: 0, max: 20 })
      .filter((len) => len !== 10)
      .chain((len) =>
        fc
          .array(fc.integer({ min: 0, max: 9 }), {
            minLength: len,
            maxLength: len,
          })
          .map((digits) => digits.join(""))
      );

    fc.assert(
      fc.property(wrongLengthDigits, (s) => {
        expect(isValidVietnamesePhone(s)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it("should return false for 10-digit strings not starting with 0", () => {
    const notStartingWithZero = fc
      .integer({ min: 1, max: 9 })
      .chain((firstDigit) =>
        fc
          .array(fc.integer({ min: 0, max: 9 }), {
            minLength: 9,
            maxLength: 9,
          })
          .map((rest) => String(firstDigit) + rest.join(""))
      );

    fc.assert(
      fc.property(notStartingWithZero, (phone) => {
        expect(isValidVietnamesePhone(phone)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});
