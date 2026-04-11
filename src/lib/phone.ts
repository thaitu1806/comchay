/**
 * Xác thực số điện thoại Việt Nam.
 *
 * - Phải có đúng 10 chữ số
 * - Phải bắt đầu bằng '0'
 * - Chỉ chứa chữ số (không có khoảng trắng, dấu gạch ngang, v.v.)
 */
export function isValidVietnamesePhone(phone: string): boolean {
  return /^0\d{9}$/.test(phone);
}
