# Kế hoạch Triển khai: Landing Page Bếp Cô Như V2

## Tổng quan

Nâng cấp hệ thống Landing Page hiện tại với hệ thống biến thể sản phẩm, phí vận chuyển theo khu vực, giao diện mới (cam cháy / vàng nắng), giỏ hàng nổi, Hero Section, Sticky Header, bộ chọn biến thể đa bước, form đặt hàng V2, Telegram V2, CMS quản lý nội dung trang, và nút CTA Zalo/Shopee. Tất cả thay đổi được xây dựng trên codebase hiện tại, giữ backward compatible.

## Tasks

- [x] 1. Cập nhật Database Schema và Drizzle ORM
  - [x] 1.1 Thêm cột `badge` (TEXT, nullable) và `stockStatus` (TEXT, default 'in_stock') vào bảng `products` trong `src/lib/schema.ts`
    - Thêm cột `region` (TEXT, NOT NULL, default 'HCM') vào bảng `orders`
    - Thêm cột `variantId` (INTEGER, nullable) và `variantLabel` (TEXT, nullable) vào bảng `order_items`
    - _Requirements: 1.1, 6.2, 6.3, 8.5, 11.1, 12.1_
  - [x] 1.2 Tạo bảng mới `productVariants` trong `src/lib/schema.ts` với các cột: id, productId (FK → products.id), riceType, spiceLevel, weight, price, createdAt
    - Thêm relations cho `productVariants` (belongs to product)
    - Cập nhật `productsRelations` để thêm `many(productVariants)`
    - _Requirements: 1.1_
  - [x] 1.3 Tạo bảng mới `siteSettings` trong `src/lib/schema.ts` với các cột: id, key (UNIQUE, NOT NULL), value (NOT NULL), updatedAt
    - _Requirements: 10.1, 10.2_
  - [x] 1.4 Chạy `drizzle-kit generate` và `drizzle-kit push` để áp dụng schema mới lên database
    - _Requirements: 1.1, 10.1_

- [x] 2. Variant Logic — Pure functions và Property Tests
  - [x] 2.1 Tạo file `src/lib/variants.ts` với 3 pure functions: `getAvailableOptions`, `findMatchingVariant`, `getPriceRange`
    - `getAvailableOptions(variants, selectedRiceType?, selectedSpiceLevel?)` trả về `{ riceTypes, spiceLevels, weights }` — chỉ các giá trị tồn tại trong biến thể khớp lựa chọn trước đó
    - `findMatchingVariant(variants, riceType, spiceLevel, weight)` trả về biến thể khớp hoặc `undefined`
    - `getPriceRange(variants)` trả về `{ min, max }` hoặc `null` nếu danh sách rỗng
    - Tạo interface `Variant` với id, riceType, spiceLevel, weight, price
    - Tạo hàm `validateVariant(variant)` kiểm tra price > 0 và weight > 0
    - _Requirements: 1.3, 1.4, 2.1, 2.2, 2.3, 2.5_
  - [x]* 2.2 Viết property test cho validate biến thể sản phẩm
    - **Property 1: Validate biến thể sản phẩm**
    - **Validates: Requirements 1.3**
    - Tạo file `src/lib/__tests__/variants.pbt.test.ts`
    - Dùng fast-check sinh ngẫu nhiên đối tượng biến thể, kiểm tra validation chấp nhận khi và chỉ khi price > 0 VÀ weight > 0
  - [x]* 2.3 Viết property test cho khoảng giá biến thể
    - **Property 2: Khoảng giá biến thể**
    - **Validates: Requirements 1.4, 6.4**
    - Trong file `src/lib/__tests__/variants.pbt.test.ts`
    - Dùng fast-check sinh danh sách biến thể, kiểm tra getPriceRange trả về min = giá thấp nhất, max = giá cao nhất; danh sách rỗng → null
  - [x]* 2.4 Viết property test cho lọc tùy chọn biến thể khả dụng
    - **Property 3: Lọc tùy chọn biến thể khả dụng**
    - **Validates: Requirements 2.2, 2.5**
    - Trong file `src/lib/__tests__/variants.pbt.test.ts`
    - Kiểm tra getAvailableOptions chỉ trả về giá trị tồn tại trong biến thể khớp, mỗi giá trị dẫn đến ít nhất 1 biến thể hợp lệ
  - [x]* 2.5 Viết property test cho tìm biến thể khớp lựa chọn
    - **Property 4: Tìm biến thể khớp lựa chọn**
    - **Validates: Requirements 2.3**
    - Trong file `src/lib/__tests__/variants.pbt.test.ts`
    - Kiểm tra findMatchingVariant trả về biến thể có đúng thuộc tính khớp, giá chính xác; hoặc undefined nếu không tồn tại

- [x] 3. ShippingCalculator V2 và Property Test
  - [x] 3.1 Cập nhật `src/lib/shipping.ts` — thêm tham số `region: "HCM" | "TINH_KHAC"` vào hàm `calculateShippingFee`
    - Export type `Region = "HCM" | "TINH_KHAC"`
    - Logic mới: 0 túi → 0đ; 1 túi → 30k; 2 túi → 20k; 3 túi → 15k; ≥4 túi HCM → 0đ; 4 túi Tỉnh khác → 10k; ≥5 túi Tỉnh khác → 0đ
    - Cập nhật tất cả call sites: `src/store/cart.ts` (getShippingFee), `src/app/api/orders/route.ts` (POST handler)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  - [x]* 3.2 Viết property test cho phí vận chuyển V2 theo khu vực
    - **Property 7: Phí vận chuyển V2 theo khu vực**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7**
    - Cập nhật file `src/lib/__tests__/shipping.pbt.test.ts`
    - Dùng fast-check sinh totalBags (≥0) và region (HCM/TINH_KHAC), kiểm tra kết quả đúng theo bảng phí và luôn ≥ 0

- [x] 4. Cart Store V2 — Hỗ trợ biến thể và Property Tests
  - [x] 4.1 Cập nhật `src/store/cart.ts` — mở rộng `CartItem` thêm `variantId`, `riceType`, `spiceLevel`, `weight`
    - Tạo hàm `getCartKey(item)` trả về `${productId}-${variantId ?? "default"}`
    - Cập nhật `addItem` để nhận thêm thông tin biến thể, dùng `getCartKey` để phân biệt item
    - Cập nhật `updateQuantity` và `removeItem` để dùng cart key thay vì chỉ productId
    - Cập nhật `getShippingFee` để nhận tham số `region` (default "HCM")
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x]* 4.2 Viết property test cho thêm sản phẩm với biến thể vào giỏ hàng
    - **Property 5: Thêm sản phẩm với biến thể vào giỏ hàng**
    - **Validates: Requirements 3.1**
    - Cập nhật file `src/store/__tests__/cart.pbt.test.ts`
    - Kiểm tra giỏ hàng chứa item với đầy đủ thông tin biến thể, giá đúng, các item khác không bị thay đổi
  - [x]* 4.3 Viết property test cho giỏ hàng phân biệt biến thể bằng key
    - **Property 6: Giỏ hàng phân biệt biến thể bằng key productId+variantId**
    - **Validates: Requirements 3.2, 3.3**
    - Trong file `src/store/__tests__/cart.pbt.test.ts`
    - Kiểm tra cùng productId + cùng variantId → cộng dồn; cùng productId + khác variantId → dòng riêng

- [x] 5. Checkpoint — Đảm bảo tất cả tests pass
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có thắc mắc.

- [x] 6. Telegram Notifier V2 và Property Test
  - [x] 6.1 Cập nhật `src/lib/telegram.ts` — mở rộng interface `TelegramOrder` thêm `region`, cập nhật `OrderItem` thêm `variantLabel`
    - Cập nhật `formatOrderMessage` để bao gồm khu vực giao hàng và chi tiết biến thể cho mỗi sản phẩm
    - Giữ backward compatible: nếu `variantLabel` là undefined thì không hiển thị dòng biến thể
    - _Requirements: 11.2_
  - [x]* 6.2 Viết property test cho tin nhắn Telegram V2
    - **Property 9: Tin nhắn Telegram V2 chứa đầy đủ thông tin**
    - **Validates: Requirements 11.2**
    - Cập nhật file `src/lib/__tests__/telegram.pbt.test.ts`
    - Kiểm tra tin nhắn chứa: tên, SĐT, địa chỉ, khu vực, tên SP, mô tả biến thể (nếu có), số lượng, thành tiền, tổng tiền hàng, phí ship, tổng thanh toán

- [x] 7. Order Validation V2 và Property Test
  - [x] 7.1 Cập nhật `src/app/api/orders/validation.ts` — thêm validate trường `region` bắt buộc (phải là 'HCM' hoặc 'TINH_KHAC')
    - Cập nhật interface `OrderFormData` thêm `region`
    - Thêm validation: nếu thiếu region hoặc region không hợp lệ → trả lỗi "Vui lòng chọn khu vực giao hàng"
    - _Requirements: 8.2, 8.6_
  - [x]* 7.2 Viết property test cho validate form đặt hàng V2
    - **Property 8: Validate form đặt hàng V2**
    - **Validates: Requirements 8.2, 8.6**
    - Cập nhật file `src/app/api/orders/__tests__/orders.pbt.test.ts`
    - Kiểm tra: thiếu tên/địa chỉ/SĐT/region hoặc items rỗng → từ chối; tất cả hợp lệ → chấp nhận

- [x] 8. API Routes V2 — Products, Variants, Settings, Orders
  - [x] 8.1 Cập nhật `src/app/api/products/route.ts` — GET trả về kèm variants, badge, stockStatus cho mỗi sản phẩm; POST nhận thêm variants[], badge, stockStatus
    - Cập nhật `src/app/api/products/[id]/route.ts` — GET trả về kèm variants; PUT nhận thêm badge, stockStatus
    - Cập nhật `src/app/api/products/by-slug/[slug]/route.ts` — GET trả về kèm variants, badge, stockStatus
    - _Requirements: 1.1, 1.2, 1.4, 6.2, 6.3, 12.1_
  - [x] 8.2 Tạo API route mới `src/app/api/products/[id]/variants/route.ts` — CRUD biến thể
    - GET: lấy danh sách biến thể theo productId
    - POST: thêm biến thể mới (validate price > 0, weight > 0)
    - PUT: cập nhật biến thể (nhận variantId trong body)
    - DELETE: xóa biến thể (nhận variantId trong body hoặc query param)
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 8.3 Tạo API route mới `src/app/api/settings/route.ts` — GET và PUT site settings
    - GET: trả về tất cả settings dưới dạng object `{ hotline, zalo_url, shopee_url, promo_banner, promo_banner_active }`
    - PUT: cập nhật settings (upsert theo key), validate hotline không rỗng
    - _Requirements: 10.1, 10.2, 10.5_
  - [x] 8.4 Cập nhật `src/app/api/orders/route.ts` — POST nhận thêm `region`, items có `variantId` + `variantLabel`
    - Lưu region vào bảng orders, lưu variantId + variantLabel vào order_items
    - Gọi `calculateShippingFee(totalBags, region)` với region từ request
    - Cập nhật Telegram notification với thông tin region và variant
    - GET trả về kèm region và variant info cho mỗi order item
    - _Requirements: 8.5, 11.1, 11.2_

- [x] 9. Checkpoint — Đảm bảo tất cả tests pass
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có thắc mắc.

- [x] 10. Cập nhật Tailwind Config và Bảng màu
  - [x] 10.1 Cập nhật `tailwind.config.ts` — thêm màu cam cháy (#FF6600) và vàng nắng (#FFB800) vào theme
    - Cập nhật `src/app/globals.css` nếu cần thêm CSS variables cho bảng màu mới
    - _Requirements: 5.3_

- [x] 11. Sticky Header V2 và Floating Cart
  - [x] 11.1 Cập nhật `src/components/Header.tsx` thành Sticky Header V2
    - Đổi bảng màu từ amber sang cam cháy (#FF6600)
    - Thêm hiển thị số hotline (fetch từ `/api/settings` hoặc nhận qua props)
    - Bỏ nút đăng nhập Facebook (chuyển sang CMS only)
    - Giữ logo "Bếp Cô Như", giữ sticky behavior
    - _Requirements: 5.2, 5.3, 10.3_
  - [x] 11.2 Tạo component `src/components/FloatingCart.tsx`
    - Icon giỏ hàng cố định góc dưới phải (fixed position)
    - Badge hiển thị tổng số túi khi > 0
    - Link đến `/gio-hang` khi nhấn
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [x] 11.3 Thêm `FloatingCart` vào `src/app/layout.tsx` (bên trong Providers, sau Footer)
    - _Requirements: 7.1_

- [x] 12. Hero Section và Landing Page V2
  - [x] 12.1 Tạo component `src/components/HeroSection.tsx`
    - Banner lớn đầu trang với hình ảnh sản phẩm nổi bật
    - Slogan "Giòn Rụm Từng Hạt - Đậm Đà Vị Quê"
    - Nút CTA dẫn đến section sản phẩm
    - Responsive: mobile first (320px+) đến desktop (1920px)
    - _Requirements: 5.1, 5.4_
  - [x] 12.2 Tạo component `src/components/ProductBadge.tsx`
    - Nhãn hiển thị trên góc thẻ sản phẩm: "Best Seller", "Bán chạy", "Yêu thích"
    - Nhận prop `badge: string | null`
    - _Requirements: 6.2_
  - [x] 12.3 Cập nhật `src/components/ProductCard.tsx` thành V2
    - Thêm props: `badge`, `priceRange` (min-max), `stockStatus`
    - Hiển thị `ProductBadge` khi có badge
    - Hiển thị khoảng giá (VD: "69K - 138K") khi có priceRange, giá đơn khi không có biến thể
    - Hiển thị nhãn "Hết hàng" khi stockStatus = 'out_of_stock'
    - Bo góc và đổ bóng nhẹ (giữ nguyên style hiện tại, cập nhật màu)
    - _Requirements: 6.1, 6.2, 6.4, 12.2_
  - [x] 12.4 Tạo component `src/components/PromoBanner.tsx`
    - Banner khuyến mãi lấy nội dung từ site_settings (promo_banner, promo_banner_active)
    - Chỉ hiển thị khi promo_banner_active = 'true'
    - _Requirements: 10.4_
  - [x] 12.5 Cập nhật `src/app/page.tsx` — trang chủ V2
    - Thêm HeroSection ở đầu trang
    - Thêm PromoBanner (nếu active)
    - Cập nhật ProductCard V2 với badge, priceRange, stockStatus
    - Fetch variants cho mỗi sản phẩm để tính priceRange (dùng getPriceRange)
    - Thêm nút CTA Zalo và Shopee (lấy URL từ site_settings)
    - Sử dụng lazy loading cho hình ảnh ngoài viewport
    - _Requirements: 5.1, 6.1, 6.4, 9.1, 9.2, 9.3, 9.4, 10.4, 13.1, 13.3_

- [x] 13. Bộ Chọn Biến Thể và Trang Chi Tiết Sản Phẩm V2
  - [x] 13.1 Tạo component `src/components/VariantSelector.tsx`
    - Bộ chọn đa bước: loại gạo → vị cay → trọng lượng
    - Sử dụng `getAvailableOptions` để lấy tùy chọn khả dụng theo lựa chọn trước đó
    - Tự động bỏ qua bước nếu chỉ có 1 giá trị
    - Hiển thị giá biến thể đã chọn khi chọn xong tất cả bước
    - Disable nút "Thêm giỏ hàng" khi chưa chọn xong
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [x] 13.2 Cập nhật `src/components/AddToCart.tsx` thành V2
    - Nhận thêm props: `variantId`, `variantLabel`, `riceType`, `spiceLevel`, `weight`, `disabled`, `stockStatus`
    - Disable khi chưa chọn biến thể hoặc hết hàng
    - Truyền thông tin biến thể khi gọi `addItem`
    - _Requirements: 2.4, 3.1, 12.2_
  - [x] 13.3 Cập nhật `src/app/san-pham/[slug]/page.tsx` — trang chi tiết V2
    - Fetch variants kèm product data
    - Hiển thị VariantSelector nếu sản phẩm có biến thể
    - Hiển thị giá theo biến thể đã chọn (hoặc khoảng giá nếu chưa chọn)
    - Hiển thị trạng thái hết hàng nếu stockStatus = 'out_of_stock'
    - Cập nhật bảng màu sang cam cháy
    - _Requirements: 1.4, 2.1, 2.3, 12.2_

- [x] 14. Giỏ Hàng V2 và Form Đặt Hàng V2
  - [x] 14.1 Cập nhật `src/app/gio-hang/page.tsx` — hiển thị thông tin biến thể
    - Hiển thị loại gạo, vị cay, trọng lượng bên cạnh tên sản phẩm cho mỗi dòng
    - Dùng cart key (productId+variantId) cho key prop và các thao tác update/remove
    - Cập nhật bảng màu sang cam cháy
    - _Requirements: 3.4_
  - [x] 14.2 Cập nhật `src/app/dat-hang/page.tsx` — form đặt hàng V2
    - Thêm trường chọn khu vực (dropdown/radio: "HCM" / "Tỉnh khác")
    - Tính lại phí ship realtime khi thay đổi khu vực (gọi `calculateShippingFee(totalBags, region)`)
    - Hiển thị bảng tính tiền: tổng tiền hàng + phí ship = tổng cộng
    - Validate khu vực bắt buộc trước khi submit
    - Gửi region + variantId + variantLabel trong request body
    - Hiển thị thông tin biến thể trong order summary
    - Cập nhật bảng màu sang cam cháy
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 15. Checkpoint — Đảm bảo tất cả tests pass
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có thắc mắc.

- [x] 16. CMS — Quản lý Nội dung trang
  - [x] 16.1 Tạo trang CMS mới `src/app/cms/noi-dung/page.tsx`
    - Form quản lý: số hotline, link Zalo, link Shopee, nội dung banner khuyến mãi, toggle bật/tắt banner
    - Fetch settings từ GET `/api/settings`, lưu bằng PUT `/api/settings`
    - Validate hotline không rỗng khi lưu
    - _Requirements: 10.1, 10.2, 10.5_
  - [x] 16.2 Cập nhật `src/app/cms/layout.tsx` — thêm mục "Nội dung" vào sidebar navigation
    - Thêm `{ href: "/cms/noi-dung", label: "Nội dung" }` vào `navItems`
    - _Requirements: 10.1_

- [x] 17. CMS — Product Form V2 (Biến thể, Badge, Stock Status)
  - [x] 17.1 Cập nhật `src/components/ProductForm.tsx` — thêm section quản lý biến thể
    - Thêm UI thêm/sửa/xóa biến thể (loại gạo, vị cay, trọng lượng, giá)
    - Validate mỗi biến thể: price > 0, weight > 0
    - Thêm dropdown chọn nhãn sản phẩm (badge): Best Seller, Bán chạy, Yêu thích, hoặc không có
    - Thêm toggle còn hàng / hết hàng (stockStatus)
    - Cập nhật onSubmit để gửi variants[], badge, stockStatus
    - _Requirements: 1.2, 1.3, 6.3, 12.1_
  - [x] 17.2 Cập nhật `src/app/cms/san-pham/tao-moi/page.tsx` — gửi variants, badge, stockStatus khi tạo sản phẩm
    - _Requirements: 1.2_
  - [x] 17.3 Cập nhật `src/app/cms/san-pham/[id]/chinh-sua/page.tsx` — fetch và hiển thị variants, badge, stockStatus khi chỉnh sửa
    - Fetch variants từ API khi load product
    - Truyền initialData bao gồm variants, badge, stockStatus vào ProductForm
    - _Requirements: 1.2, 6.3, 12.1_

- [x] 18. CMS — Đơn hàng V2
  - [x] 18.1 Cập nhật `src/app/cms/don-hang/page.tsx` — hiển thị thêm cột khu vực và thông tin biến thể
    - Thêm cột "Khu vực" trong danh sách đơn hàng
    - Hiển thị variantLabel bên cạnh tên sản phẩm trong chi tiết đơn hàng
    - _Requirements: 11.1, 11.3_

- [x] 19. Footer V2 và CTA Buttons
  - [x] 19.1 Cập nhật `src/components/Footer.tsx` — đổi bảng màu sang cam cháy, lấy link Zalo/Shopee từ site_settings
    - Fetch settings hoặc nhận qua props từ layout
    - Thêm nút "Mua Ngay qua Zalo" và "Xem trên Shopee" với target="_blank"
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 20. Layout V2 — Cập nhật Root Layout
  - [x] 20.1 Cập nhật `src/app/layout.tsx`
    - Đổi bảng màu body từ amber sang cam cháy / vàng nắng
    - Cập nhật metadata title/description cho "Bếp Cô Như"
    - Đảm bảo FloatingCart được render (đã thêm ở task 11.3)
    - _Requirements: 5.3, 5.4_

- [x] 21. Hiệu năng và Định dạng ảnh
  - [x] 21.1 Cập nhật các component hiển thị ảnh để sử dụng WebP format
    - Cấu hình Next.js Image component với format WebP (qua next.config.js nếu cần)
    - Đảm bảo lazy loading cho ảnh ngoài viewport (Next.js Image mặc định đã hỗ trợ)
    - _Requirements: 13.1, 13.3_

- [x] 22. Final Checkpoint — Đảm bảo tất cả tests pass
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có thắc mắc.

## Ghi chú

- Tasks đánh dấu `*` là tùy chọn và có thể bỏ qua để triển khai MVP nhanh hơn
- Mỗi task tham chiếu đến yêu cầu cụ thể để đảm bảo truy xuất nguồn gốc
- Checkpoints đảm bảo kiểm tra tăng dần sau mỗi nhóm thay đổi
- Property tests kiểm tra tính đúng đắn phổ quát, unit tests kiểm tra ví dụ cụ thể và edge cases
- Tất cả thay đổi giữ backward compatible: sản phẩm không có biến thể vẫn hoạt động bình thường
