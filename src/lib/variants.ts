/**
 * Variant logic — Pure functions cho hệ thống biến thể sản phẩm.
 *
 * Mỗi sản phẩm có thể có nhiều biến thể (loại gạo, vị cay, trọng lượng)
 * với giá riêng. Các hàm ở đây xử lý logic lọc, tìm kiếm và tính giá.
 */

export interface Variant {
  id: number;
  riceType: string | null; // "Gạo Thường", "Gạo Lứt", null
  spiceLevel: string | null; // "Cay nhiều", "Cay vừa", "Không cay", null
  weight: number; // gram
  price: number; // VNĐ
}

/**
 * Kiểm tra biến thể hợp lệ: price > 0 VÀ weight > 0.
 */
export function validateVariant(variant: Variant): boolean {
  return variant.price > 0 && variant.weight > 0;
}

/**
 * Lấy các giá trị khả dụng cho mỗi bước chọn biến thể,
 * dựa trên lựa chọn trước đó.
 *
 * - Nếu chưa chọn gì: trả về tất cả riceTypes, spiceLevels, weights
 * - Nếu đã chọn riceType: lọc spiceLevels và weights theo riceType
 * - Nếu đã chọn cả riceType và spiceLevel: lọc weights theo cả hai
 */
export function getAvailableOptions(
  variants: Variant[],
  selectedRiceType?: string | null,
  selectedSpiceLevel?: string | null
): {
  riceTypes: string[];
  spiceLevels: string[];
  weights: number[];
} {
  // Bước 1: Lấy tất cả riceTypes (không phụ thuộc lựa chọn)
  const riceTypes = Array.from(
    new Set(
      variants
        .map((v) => v.riceType)
        .filter((rt): rt is string => rt !== null)
    )
  );

  // Bước 2: Lọc biến thể theo riceType đã chọn (nếu có)
  let filteredForSpice = variants;
  if (selectedRiceType !== undefined) {
    filteredForSpice = variants.filter(
      (v) => v.riceType === selectedRiceType
    );
  }

  const spiceLevels = Array.from(
    new Set(
      filteredForSpice
        .map((v) => v.spiceLevel)
        .filter((sl): sl is string => sl !== null)
    )
  );

  // Bước 3: Lọc biến thể theo cả riceType và spiceLevel (nếu có)
  let filteredForWeight = filteredForSpice;
  if (selectedSpiceLevel !== undefined) {
    filteredForWeight = filteredForSpice.filter(
      (v) => v.spiceLevel === selectedSpiceLevel
    );
  }

  const weights = Array.from(new Set(filteredForWeight.map((v) => v.weight)));

  return { riceTypes, spiceLevels, weights };
}

/**
 * Tìm biến thể khớp chính xác với lựa chọn (riceType, spiceLevel, weight).
 * Trả về biến thể đầu tiên khớp hoặc undefined nếu không tìm thấy.
 */
export function findMatchingVariant(
  variants: Variant[],
  riceType: string | null,
  spiceLevel: string | null,
  weight: number
): Variant | undefined {
  return variants.find(
    (v) =>
      v.riceType === riceType &&
      v.spiceLevel === spiceLevel &&
      v.weight === weight
  );
}

/**
 * Tính khoảng giá (min, max) từ danh sách biến thể.
 * Trả về null nếu danh sách rỗng.
 */
export function getPriceRange(
  variants: Variant[]
): { min: number; max: number } | null {
  if (variants.length === 0) return null;

  let min = variants[0].price;
  let max = variants[0].price;

  for (const v of variants) {
    if (v.price < min) min = v.price;
    if (v.price > max) max = v.price;
  }

  return { min, max };
}
