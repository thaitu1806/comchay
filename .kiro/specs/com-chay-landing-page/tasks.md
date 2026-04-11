# Danh sách Công việc - Cơm Cháy Bếp Cô Như

- [x] 1. Khởi tạo dự án và cấu hình cơ sở
  - [x] 1.1 Khởi tạo Next.js 14 (App Router) với TypeScript, Tailwind CSS, ESLint
  - [x] 1.2 Cài đặt dependencies: drizzle-orm, @libsql/client, next-auth, cloudinary, zustand, fast-check, vitest, @testing-library/react, msw
  - [x] 1.3 Cấu hình Turso database connection và Drizzle ORM
  - [x] 1.4 Tạo schema Drizzle cho các bảng: products, product_media, orders, order_items, page_visits
  - [x] 1.5 Cấu hình Cloudinary SDK với environment variables
  - [x] 1.6 Cấu hình Vitest và fast-check cho testing

- [x] 2. Module tiện ích (Pure Functions)
  - [x] 2.1 Implement ShippingCalculator: calculateShippingFee(totalBags) → phí vận chuyển theo bảng giá
  - [x] 2.2 Implement PhoneValidator: isValidVietnamesePhone(phone) → boolean (10 số, bắt đầu 0)
  - [x] 2.3 Implement SlugGenerator: generateSlug(name) → slug ASCII từ tiếng Việt
  - [x] 2.4 Implement TelegramNotifier: formatOrderMessage(order) → string và sendOrderNotification(order) với retry 3 lần
  - [x] 2.5 [PBT] Property 7: Miễn phí vận chuyển từ 4 túi — *For any* n ≥ 4, calculateShippingFee(n) === 0
  - [x] 2.6 [PBT] Property 8: Xác thực SĐT Việt Nam — *For any* string, isValidVietnamesePhone trả về true khi và chỉ khi 10 chữ số bắt đầu bằng '0'
  - [x] 2.7 [PBT] Property 11: Slug generation hợp lệ — *For any* tên tiếng Việt, slug chỉ chứa lowercase ASCII, số, gạch ngang hợp lệ
  - [x] 2.8 [PBT] Property 10: Tin nhắn Telegram đầy đủ — *For any* đơn hàng, message chứa tên, SĐT, địa chỉ, sản phẩm, tổng tiền
  - [x] 2.9 Unit tests cho ShippingCalculator: test cụ thể 0→0, 1→30k, 2→20k, 3→15k túi

- [x] 3. Cart Store (Zustand + localStorage)
  - [x] 3.1 Implement CartStore với Zustand: addItem, updateQuantity, removeItem, clearCart, getters (totalBags, subtotal, shippingFee, total)
  - [x] 3.2 Implement localStorage persistence middleware cho CartStore
  - [x] 3.3 [PBT] Property 3: Thêm sản phẩm — *For any* product + quantity, cart chứa item đúng và items khác không đổi
  - [x] 3.4 [PBT] Property 4: Xóa sản phẩm — *For any* cart có items, xóa 1 item thì item đó biến mất, còn lại giữ nguyên
  - [x] 3.5 [PBT] Property 5: Round-trip localStorage — *For any* cart state, serialize → deserialize giữ nguyên state
  - [x] 3.6 [PBT] Property 6: Tổng tiền luôn đúng — *For any* cart, subtotal = Σ(price×qty), shippingFee = calculateShippingFee(totalBags), total = subtotal + shippingFee

- [x] 4. API Routes - Sản phẩm
  - [x] 4.1 GET /api/products — lấy danh sách sản phẩm active
  - [x] 4.2 GET /api/products/[id] — lấy chi tiết sản phẩm với media
  - [x] 4.3 GET /api/products/by-slug/[slug] — lấy sản phẩm theo slug
  - [x] 4.4 POST /api/products — tạo sản phẩm mới (CMS)
  - [x] 4.5 PUT /api/products/[id] — cập nhật sản phẩm (CMS)
  - [x] 4.6 DELETE /api/products/[id] — xóa sản phẩm (CMS)
  - [x] 4.7 [PBT] Property 1: Chỉ sản phẩm active — *For any* mix products active/inactive, query chỉ trả về active

- [x] 5. API Routes - Đơn hàng & Thống kê
  - [x] 5.1 POST /api/orders — tạo đơn hàng mới với validation (tên, địa chỉ, SĐT bắt buộc), lưu DB, gửi Telegram
  - [x] 5.2 GET /api/orders — lấy danh sách đơn hàng (CMS) với filter khoảng thời gian
  - [x] 5.3 GET /api/stats — lấy thống kê lượt truy cập và đơn hàng theo ngày/tuần/tháng
  - [x] 5.4 POST /api/stats/visit — ghi nhận lượt truy cập
  - [x] 5.5 [PBT] Property 9: Validate trường bắt buộc — *For any* form data thiếu trường bắt buộc, API trả về validation error
  - [x] 5.6 [PBT] Property 12: Lọc đơn hàng theo thời gian — *For any* orders + date range, chỉ orders trong range được trả về
  - [x] 5.7 Integration test: tạo đơn hàng → lưu DB → gửi Telegram (mock)

- [x] 6. Upload & Cloudinary
  - [x] 6.1 POST /api/upload — upload file lên Cloudinary, validate dung lượng, trả về URL
  - [x] 6.2 Integration test: upload flow với Cloudinary mock, test giới hạn dung lượng

- [x] 7. Facebook Authentication
  - [x] 7.1 Cấu hình NextAuth với Facebook Provider, lưu tên + link Facebook vào session
  - [x] 7.2 Integration test: Facebook OAuth flow (mock)

- [x] 8. Landing Page - Giao diện
  - [x] 8.1 Layout chung: Header (logo, nav, giỏ hàng badge, login Facebook), Footer (Zalo, Facebook links target="_blank")
  - [x] 8.2 Trang chủ `/`: hiển thị danh sách ProductCard (ảnh, tên, giá), link đến `/san-pham/[slug]`
  - [x] 8.3 Trang chi tiết `/san-pham/[slug]`: gallery ảnh/video, mô tả, giá, quantity selector, nút thêm giỏ hàng, trang 404 cho slug không tồn tại
  - [x] 8.4 Trang giỏ hàng `/gio-hang`: danh sách items, quantity edit, xóa, subtotal, phí vận chuyển, tổng thanh toán
  - [x] 8.5 Trang đặt hàng `/dat-hang`: form (tên, link FB, địa chỉ, SĐT), auto-fill từ Facebook session, validation, success/error messages
  - [x] 8.6 [PBT] Property 2: Chi tiết sản phẩm đầy đủ — *For any* product, rendered output chứa tất cả media URLs, mô tả, giá
  - [x] 8.7 Responsive design: mobile (320px) đến desktop (1920px), tông màu ấm thân thiện
  - [x] 8.8 Ghi nhận lượt truy cập khi load trang (POST /api/stats/visit)

- [x] 9. CMS Dashboard
  - [x] 9.1 Trang dashboard `/cms`: StatsOverview — tổng lượt truy cập, đơn hàng theo ngày/tuần/tháng, bộ lọc khoảng thời gian
  - [x] 9.2 Trang sản phẩm `/cms/san-pham`: ProductTable — danh sách sản phẩm, actions sửa/xóa (xác nhận trước khi xóa)
  - [x] 9.3 Form sản phẩm `/cms/san-pham/tao-moi` và `/cms/san-pham/[id]/chinh-sua`: upload ảnh/video, mô tả, giá, slug (auto-generate), lỗi slug trùng
  - [x] 9.4 Trang đơn hàng `/cms/don-hang`: OrderList — danh sách đơn hàng với chi tiết
