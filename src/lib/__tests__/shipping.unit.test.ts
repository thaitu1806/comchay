import { describe, it, expect } from "vitest";
import { calculateShippingFee } from "@/lib/shipping";

describe("ShippingCalculator V2 — Unit tests", () => {
  describe("0-3 bags (same for all regions)", () => {
    it("0 bags → 0 VNĐ (HCM)", () => {
      expect(calculateShippingFee(0, "HCM")).toBe(0);
    });

    it("0 bags → 0 VNĐ (TINH_KHAC)", () => {
      expect(calculateShippingFee(0, "TINH_KHAC")).toBe(0);
    });

    it("1 bag → 30,000 VNĐ (HCM)", () => {
      expect(calculateShippingFee(1, "HCM")).toBe(30000);
    });

    it("1 bag → 30,000 VNĐ (TINH_KHAC)", () => {
      expect(calculateShippingFee(1, "TINH_KHAC")).toBe(30000);
    });

    it("2 bags → 20,000 VNĐ (HCM)", () => {
      expect(calculateShippingFee(2, "HCM")).toBe(20000);
    });

    it("2 bags → 20,000 VNĐ (TINH_KHAC)", () => {
      expect(calculateShippingFee(2, "TINH_KHAC")).toBe(20000);
    });

    it("3 bags → 15,000 VNĐ (HCM)", () => {
      expect(calculateShippingFee(3, "HCM")).toBe(15000);
    });

    it("3 bags → 15,000 VNĐ (TINH_KHAC)", () => {
      expect(calculateShippingFee(3, "TINH_KHAC")).toBe(15000);
    });
  });

  describe("4+ bags HCM — free shipping", () => {
    it("4 bags HCM → 0 VNĐ", () => {
      expect(calculateShippingFee(4, "HCM")).toBe(0);
    });

    it("5 bags HCM → 0 VNĐ", () => {
      expect(calculateShippingFee(5, "HCM")).toBe(0);
    });
  });

  describe("4+ bags TINH_KHAC", () => {
    it("4 bags TINH_KHAC → 10,000 VNĐ", () => {
      expect(calculateShippingFee(4, "TINH_KHAC")).toBe(10000);
    });

    it("5 bags TINH_KHAC → 0 VNĐ (free shipping)", () => {
      expect(calculateShippingFee(5, "TINH_KHAC")).toBe(0);
    });

    it("10 bags TINH_KHAC → 0 VNĐ (free shipping)", () => {
      expect(calculateShippingFee(10, "TINH_KHAC")).toBe(0);
    });
  });

  describe("negative numbers", () => {
    it("negative number → 0 VNĐ (HCM)", () => {
      expect(calculateShippingFee(-1, "HCM")).toBe(0);
    });

    it("negative number → 0 VNĐ (TINH_KHAC)", () => {
      expect(calculateShippingFee(-1, "TINH_KHAC")).toBe(0);
    });
  });
});
