import { isValidVietnamesePhone } from "@/lib/phone";

export interface OrderFormData {
  customerName?: string | null;
  address?: string | null;
  phone?: string | null;
  facebookLink?: string | null;
  items?: unknown[];
}

/**
 * Validate order form data. Returns an array of error messages.
 * Empty array means validation passed.
 */
export function validateOrderForm(data: OrderFormData): string[] {
  const errors: string[] = [];

  if (
    !data.customerName ||
    typeof data.customerName !== "string" ||
    !data.customerName.trim()
  ) {
    errors.push("Tên khách hàng là bắt buộc");
  }

  if (
    !data.address ||
    typeof data.address !== "string" ||
    !data.address.trim()
  ) {
    errors.push("Địa chỉ là bắt buộc");
  }

  if (!data.phone || typeof data.phone !== "string" || !data.phone.trim()) {
    errors.push("Số điện thoại là bắt buộc");
  } else if (!isValidVietnamesePhone(data.phone)) {
    errors.push("Số điện thoại không hợp lệ");
  }

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push("Danh sách sản phẩm không được trống");
  }

  return errors;
}
