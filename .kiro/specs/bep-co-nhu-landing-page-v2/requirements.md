# Tài liệu Yêu cầu — Landing Page Bếp Cô Như V2

## Giới thiệu

Nâng cấp Landing Page bán hàng cho thương hiệu "Bếp Cô Như" với 10 sản phẩm đa dạng (chà bông, tép hành phi, rong biển, cơm cháy chay, khô bò...). Phiên bản V2 bổ sung hệ thống biến thể sản phẩm (loại gạo, vị cay, trọng lượng), logic phí vận chuyển theo khu vực (HCM / Tỉnh khác), giao diện mới theo phong cách Mobile First với bảng màu cam cháy / vàng nắng, giỏ hàng nổi, Hero Section, nhãn sản phẩm (Best Seller, Bán chạy, Yêu thích), bộ chọn biến thể đa bước, nút CTA liên kết Zalo/Shopee, và trang quản trị nội dung (hotline, link Shopee, banner khuyến mãi).

## Thuật ngữ

- **Landing_Page**: Trang web chính hiển thị cho khách hàng, bao gồm Hero Section, danh sách sản phẩm, giỏ hàng nổi và form đặt hàng
- **CMS_Dashboard**: Trang quản trị dành cho chủ cửa hàng để quản lý sản phẩm, biến thể, nội dung trang và đơn hàng
- **Sản_Phẩm**: Mặt hàng bán trên Landing_Page bao gồm tên, mô tả, hình ảnh, nhãn hiển thị và danh sách Biến_Thể
- **Biến_Thể**: Một phiên bản cụ thể của Sản_Phẩm được xác định bởi tổ hợp loại gạo, vị cay và trọng lượng, mỗi Biến_Thể có giá riêng
- **Bộ_Chọn_Biến_Thể**: Giao diện đa bước cho phép khách hàng chọn lần lượt loại gạo, vị cay, trọng lượng trước khi thêm vào Giỏ_Hàng
- **Giỏ_Hàng**: Danh sách sản phẩm và biến thể mà khách hàng đã chọn mua, được lưu trên trình duyệt
- **Giỏ_Hàng_Nổi**: Biểu tượng giỏ hàng hiển thị cố định trên màn hình (floating), cho phép truy cập nhanh vào Giỏ_Hàng từ mọi vị trí trên trang
- **Đơn_Hàng**: Thông tin đặt hàng bao gồm tên, SĐT, địa chỉ, khu vực giao hàng, danh sách sản phẩm với biến thể và số lượng
- **Khu_Vực**: Vùng giao hàng của khách, gồm hai giá trị: "HCM" (TP. Hồ Chí Minh) hoặc "Tỉnh khác" (các tỉnh thành còn lại)
- **Phí_Vận_Chuyển**: Phí giao hàng được tính dựa trên tổng số túi sản phẩm và Khu_Vực giao hàng
- **Nhãn_Sản_Phẩm**: Thẻ hiển thị trên thẻ sản phẩm để đánh dấu đặc điểm, bao gồm "Best Seller", "Bán chạy", "Yêu thích"
- **Hero_Section**: Phần banner lớn đầu trang hiển thị hình ảnh sản phẩm nổi bật và slogan thương hiệu
- **Sticky_Header**: Thanh header cố định trên đầu trang khi cuộn, chứa logo, hotline và Giỏ_Hàng_Nổi
- **Nội_Dung_Trang**: Các thông tin cấu hình hiển thị trên Landing_Page bao gồm số hotline, link Shopee và banner khuyến mãi
- **Turso_Database**: Cơ sở dữ liệu Turso (libSQL) lưu trữ dữ liệu sản phẩm, biến thể, đơn hàng, cấu hình vận chuyển và nội dung trang
- **Telegram_Notifier**: Module gửi thông báo đơn hàng mới đến Telegram thông qua Bot Token và Chat ID

## Yêu cầu

### Yêu cầu 1: Hệ thống biến thể sản phẩm

**User Story:** Là chủ cửa hàng, tôi muốn mỗi sản phẩm có nhiều biến thể (loại gạo, vị cay, trọng lượng) với giá riêng, để tôi có thể bán đa dạng phiên bản của cùng một sản phẩm.

#### Tiêu chí chấp nhận

1. THE Turso_Database SHALL lưu trữ Biến_Thể của Sản_Phẩm với các thuộc tính: loại gạo (Gạo Thường, Gạo Lứt hoặc không áp dụng), vị cay (Cay nhiều, Cay vừa, Không cay hoặc không áp dụng), trọng lượng (đơn vị gram) và giá (đơn vị VNĐ)
2. WHEN chủ cửa hàng tạo hoặc chỉnh sửa Sản_Phẩm trên CMS_Dashboard, THE CMS_Dashboard SHALL cho phép thêm, sửa và xóa nhiều Biến_Thể cho Sản_Phẩm đó
3. THE CMS_Dashboard SHALL yêu cầu mỗi Biến_Thể có ít nhất trọng lượng và giá hợp lệ (giá lớn hơn 0, trọng lượng lớn hơn 0)
4. WHEN Sản_Phẩm có nhiều Biến_Thể, THE Landing_Page SHALL hiển thị khoảng giá (giá thấp nhất đến giá cao nhất) trên thẻ sản phẩm

### Yêu cầu 2: Bộ chọn biến thể đa bước

**User Story:** Là khách hàng, tôi muốn chọn loại gạo, vị cay và trọng lượng theo từng bước, để tôi có thể dễ dàng tìm đúng phiên bản sản phẩm mình muốn mua.

#### Tiêu chí chấp nhận

1. WHEN khách hàng xem chi tiết Sản_Phẩm có nhiều Biến_Thể, THE Bộ_Chọn_Biến_Thể SHALL hiển thị các bước chọn theo thứ tự: loại gạo, vị cay, trọng lượng
2. WHEN Sản_Phẩm chỉ có một giá trị cho một thuộc tính (ví dụ chỉ có một loại gạo), THE Bộ_Chọn_Biến_Thể SHALL tự động chọn giá trị đó và bỏ qua bước chọn tương ứng
3. WHEN khách hàng chọn xong tất cả các bước, THE Bộ_Chọn_Biến_Thể SHALL hiển thị giá chính xác của Biến_Thể đã chọn
4. WHEN khách hàng chưa hoàn thành tất cả các bước chọn, THE Bộ_Chọn_Biến_Thể SHALL vô hiệu hóa nút thêm vào Giỏ_Hàng
5. WHEN khách hàng thay đổi lựa chọn ở một bước trước, THE Bộ_Chọn_Biến_Thể SHALL cập nhật các tùy chọn khả dụng ở các bước sau dựa trên Biến_Thể còn tồn tại

### Yêu cầu 3: Giỏ hàng hỗ trợ biến thể

**User Story:** Là khách hàng, tôi muốn giỏ hàng lưu đúng biến thể sản phẩm tôi đã chọn, để tôi có thể đặt hàng chính xác phiên bản mong muốn.

#### Tiêu chí chấp nhận

1. WHEN khách hàng thêm Sản_Phẩm vào Giỏ_Hàng, THE Giỏ_Hàng SHALL lưu thông tin Biến_Thể đã chọn bao gồm loại gạo, vị cay, trọng lượng và giá của Biến_Thể
2. WHEN Giỏ_Hàng đã có cùng Sản_Phẩm với cùng Biến_Thể, THE Giỏ_Hàng SHALL cộng dồn số lượng thay vì tạo dòng mới
3. WHEN Giỏ_Hàng có cùng Sản_Phẩm nhưng khác Biến_Thể, THE Giỏ_Hàng SHALL tạo dòng riêng biệt cho mỗi Biến_Thể
4. THE Giỏ_Hàng SHALL hiển thị thông tin Biến_Thể (loại gạo, vị cay, trọng lượng) bên cạnh tên Sản_Phẩm cho mỗi dòng trong giỏ

### Yêu cầu 4: Phí vận chuyển theo khu vực

**User Story:** Là khách hàng, tôi muốn biết chính xác phí vận chuyển dựa trên số lượng túi và khu vực giao hàng, để tôi có thể ước tính tổng chi phí.

#### Tiêu chí chấp nhận

1. WHEN Giỏ_Hàng có 1 túi sản phẩm, THE Landing_Page SHALL tính Phí_Vận_Chuyển là 30.000 VNĐ cho mọi Khu_Vực
2. WHEN Giỏ_Hàng có 2 túi sản phẩm, THE Landing_Page SHALL tính Phí_Vận_Chuyển là 20.000 VNĐ cho mọi Khu_Vực
3. WHEN Giỏ_Hàng có 3 túi sản phẩm, THE Landing_Page SHALL tính Phí_Vận_Chuyển là 15.000 VNĐ cho mọi Khu_Vực
4. WHILE Khu_Vực là "HCM" và Giỏ_Hàng có từ 4 túi sản phẩm trở lên, THE Landing_Page SHALL tính Phí_Vận_Chuyển là 0 VNĐ (miễn phí)
5. WHILE Khu_Vực là "Tỉnh khác" và Giỏ_Hàng có đúng 4 túi sản phẩm, THE Landing_Page SHALL tính Phí_Vận_Chuyển là 10.000 VNĐ
6. WHILE Khu_Vực là "Tỉnh khác" và Giỏ_Hàng có từ 5 túi sản phẩm trở lên, THE Landing_Page SHALL tính Phí_Vận_Chuyển là 0 VNĐ (miễn phí)
7. WHEN Giỏ_Hàng trống (0 sản phẩm), THE Landing_Page SHALL hiển thị Phí_Vận_Chuyển là 0 VNĐ

### Yêu cầu 5: Giao diện Landing Page mới — Hero Section và Sticky Header

**User Story:** Là khách hàng, tôi muốn trang web có giao diện hấp dẫn với hình ảnh sản phẩm nổi bật và thông tin liên hệ dễ tiếp cận, để tôi có trải nghiệm mua sắm tốt hơn.

#### Tiêu chí chấp nhận

1. THE Landing_Page SHALL hiển thị Hero_Section ở đầu trang chủ với hình ảnh sản phẩm nổi bật và slogan "Giòn Rụm Từng Hạt - Đậm Đà Vị Quê"
2. THE Sticky_Header SHALL hiển thị cố định trên đầu trang khi khách hàng cuộn trang, chứa logo thương hiệu "Bếp Cô Như" và số hotline
3. THE Landing_Page SHALL sử dụng bảng màu chính: cam cháy (#FF6600) cho các nút CTA và điểm nhấn, vàng nắng (#FFB800) cho các phần tử phụ, nền trắng hoặc kem cho nội dung
4. THE Landing_Page SHALL có thiết kế Mobile First, tối ưu hiển thị trên thiết bị di động (từ 320px) và mở rộng tốt trên máy tính (đến 1920px)

### Yêu cầu 6: Thẻ sản phẩm với nhãn và hiệu ứng

**User Story:** Là khách hàng, tôi muốn nhận biết nhanh các sản phẩm nổi bật thông qua nhãn hiển thị, để tôi có thể ưu tiên xem các sản phẩm được yêu thích.

#### Tiêu chí chấp nhận

1. THE Landing_Page SHALL hiển thị Sản_Phẩm dưới dạng thẻ (card) có bo góc và đổ bóng nhẹ
2. WHEN Sản_Phẩm có Nhãn_Sản_Phẩm được gán, THE Landing_Page SHALL hiển thị nhãn tương ứng ("Best Seller", "Bán chạy" hoặc "Yêu thích") trên góc thẻ sản phẩm
3. WHEN chủ cửa hàng chỉnh sửa Sản_Phẩm trên CMS_Dashboard, THE CMS_Dashboard SHALL cho phép gán hoặc bỏ Nhãn_Sản_Phẩm cho Sản_Phẩm đó
4. WHEN Sản_Phẩm có nhiều Biến_Thể với giá khác nhau, THE Landing_Page SHALL hiển thị khoảng giá (ví dụ "69K - 138K") trên thẻ sản phẩm

### Yêu cầu 7: Giỏ hàng nổi (Floating Cart)

**User Story:** Là khách hàng, tôi muốn truy cập giỏ hàng nhanh chóng từ mọi vị trí trên trang, để tôi không cần cuộn lên header mỗi khi muốn xem giỏ hàng.

#### Tiêu chí chấp nhận

1. THE Giỏ_Hàng_Nổi SHALL hiển thị cố định ở góc dưới bên phải màn hình dưới dạng biểu tượng giỏ hàng
2. WHEN Giỏ_Hàng có sản phẩm, THE Giỏ_Hàng_Nổi SHALL hiển thị badge số lượng tổng số túi trên biểu tượng
3. WHEN khách hàng nhấn vào Giỏ_Hàng_Nổi, THE Landing_Page SHALL điều hướng đến trang giỏ hàng
4. WHILE khách hàng cuộn trang, THE Giỏ_Hàng_Nổi SHALL giữ nguyên vị trí cố định trên màn hình

### Yêu cầu 8: Form đặt hàng với khu vực giao hàng

**User Story:** Là khách hàng, tôi muốn chọn khu vực giao hàng khi đặt hàng, để phí vận chuyển được tính chính xác cho vùng của tôi.

#### Tiêu chí chấp nhận

1. THE Landing_Page SHALL hiển thị form đặt hàng với các trường: Tên, Số điện thoại, Địa chỉ và Khu_Vực (lựa chọn giữa "HCM" và "Tỉnh khác")
2. THE Landing_Page SHALL yêu cầu bắt buộc các trường: Tên, Số điện thoại, Địa chỉ và Khu_Vực trước khi cho phép gửi Đơn_Hàng
3. WHEN khách hàng thay đổi Khu_Vực trên form đặt hàng, THE Landing_Page SHALL tính lại Phí_Vận_Chuyển và cập nhật bảng tính tiền (Tiền hàng + Phí ship = Tổng cộng) ngay lập tức
4. THE Landing_Page SHALL hiển thị bảng tính tiền gồm: tổng tiền hàng, Phí_Vận_Chuyển và tổng cộng bên cạnh form đặt hàng
5. WHEN khách hàng gửi form đặt hàng hợp lệ, THE Landing_Page SHALL lưu Đơn_Hàng vào Turso_Database bao gồm Khu_Vực đã chọn
6. IF khách hàng gửi form đặt hàng mà chưa chọn Khu_Vực, THEN THE Landing_Page SHALL hiển thị thông báo lỗi yêu cầu chọn khu vực giao hàng

### Yêu cầu 9: Nút CTA liên kết Zalo và Shopee

**User Story:** Là khách hàng, tôi muốn có lựa chọn mua hàng qua Zalo hoặc xem sản phẩm trên Shopee, để tôi có thể chọn kênh mua sắm phù hợp.

#### Tiêu chí chấp nhận

1. THE Landing_Page SHALL hiển thị nút "Mua Ngay qua Zalo" liên kết đến trang Zalo của cửa hàng
2. THE Landing_Page SHALL hiển thị nút "Xem trên Shopee" liên kết đến trang Shopee của cửa hàng
3. WHEN khách hàng nhấn nút "Mua Ngay qua Zalo" hoặc "Xem trên Shopee", THE Landing_Page SHALL mở liên kết trong tab mới của trình duyệt
4. THE Landing_Page SHALL lấy URL Zalo và URL Shopee từ Nội_Dung_Trang đã cấu hình trong Turso_Database

### Yêu cầu 10: Quản lý nội dung trang (CMS)

**User Story:** Là chủ cửa hàng, tôi muốn chỉnh sửa số hotline, link Shopee và banner khuyến mãi từ trang quản trị, để tôi có thể cập nhật thông tin mà không cần sửa mã nguồn.

#### Tiêu chí chấp nhận

1. THE CMS_Dashboard SHALL hiển thị trang quản lý Nội_Dung_Trang với các trường: số hotline, link Zalo, link Shopee và nội dung banner khuyến mãi
2. WHEN chủ cửa hàng cập nhật Nội_Dung_Trang và nhấn lưu, THE CMS_Dashboard SHALL lưu thông tin vào Turso_Database
3. THE Landing_Page SHALL hiển thị số hotline trên Sticky_Header lấy từ Nội_Dung_Trang đã cấu hình
4. WHEN Nội_Dung_Trang có banner khuyến mãi được kích hoạt, THE Landing_Page SHALL hiển thị banner khuyến mãi trên trang chủ
5. IF chủ cửa hàng lưu Nội_Dung_Trang với số hotline rỗng, THEN THE CMS_Dashboard SHALL hiển thị thông báo lỗi yêu cầu nhập số hotline

### Yêu cầu 11: Quản lý đơn hàng với thông tin khu vực

**User Story:** Là chủ cửa hàng, tôi muốn xem danh sách đơn hàng bao gồm khu vực giao hàng và thông tin biến thể, để tôi có thể xử lý đơn hàng chính xác.

#### Tiêu chí chấp nhận

1. THE CMS_Dashboard SHALL hiển thị danh sách Đơn_Hàng với thông tin: tên khách, SĐT, địa chỉ, Khu_Vực, danh sách sản phẩm (bao gồm Biến_Thể), tổng tiền và trạng thái
2. WHEN Đơn_Hàng được tạo, THE Telegram_Notifier SHALL bao gồm thông tin Khu_Vực và chi tiết Biến_Thể của từng sản phẩm trong tin nhắn thông báo
3. THE CMS_Dashboard SHALL cho phép lọc Đơn_Hàng theo khoảng thời gian (ngày bắt đầu và ngày kết thúc)

### Yêu cầu 12: Trạng thái còn hàng / hết hàng

**User Story:** Là chủ cửa hàng, tôi muốn đánh dấu sản phẩm còn hàng hoặc hết hàng, để khách hàng không đặt mua sản phẩm đã hết.

#### Tiêu chí chấp nhận

1. WHEN chủ cửa hàng chỉnh sửa Sản_Phẩm trên CMS_Dashboard, THE CMS_Dashboard SHALL cho phép chuyển trạng thái giữa "Còn hàng" và "Hết hàng"
2. WHILE Sản_Phẩm có trạng thái "Hết hàng", THE Landing_Page SHALL hiển thị nhãn "Hết hàng" trên thẻ sản phẩm và vô hiệu hóa nút thêm vào Giỏ_Hàng
3. THE Landing_Page SHALL chỉ hiển thị Sản_Phẩm đang hoạt động (active) trên danh sách sản phẩm, Sản_Phẩm bị ẩn (inactive) không hiển thị

### Yêu cầu 13: Hiệu năng và định dạng ảnh

**User Story:** Là khách hàng, tôi muốn trang web tải nhanh trên điện thoại, để tôi không phải chờ đợi lâu khi xem sản phẩm.

#### Tiêu chí chấp nhận

1. THE Landing_Page SHALL sử dụng định dạng WebP cho hình ảnh sản phẩm khi hiển thị trên trang
2. THE Landing_Page SHALL tải trang chủ trong thời gian dưới 2 giây trên kết nối 4G tiêu chuẩn
3. THE Landing_Page SHALL sử dụng lazy loading cho hình ảnh sản phẩm nằm ngoài vùng hiển thị ban đầu (viewport)
