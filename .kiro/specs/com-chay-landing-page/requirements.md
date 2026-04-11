# Tài liệu Yêu cầu

## Giới thiệu

Landing page thương mại điện tử cho thương hiệu "Cơm cháy bếp cô Như", cho phép khách hàng xem sản phẩm cơm cháy, thêm vào giỏ hàng và đặt hàng. Hệ thống bao gồm trang khách hàng (storefront) và trang quản trị (CMS dashboard) để quản lý sản phẩm, đơn hàng và thống kê. Đơn hàng được gửi thông báo qua Telegram. Hệ thống sử dụng Cloudinary để lưu trữ hình ảnh/video, Turso làm cơ sở dữ liệu và hỗ trợ đăng nhập Facebook.

## Thuật ngữ

- **Landing_Page**: Trang web chính hiển thị cho khách hàng, bao gồm danh sách sản phẩm, chi tiết sản phẩm, giỏ hàng và đặt hàng
- **CMS_Dashboard**: Trang quản trị dành cho chủ cửa hàng để quản lý sản phẩm, xem thống kê đơn hàng và lượt truy cập
- **Giỏ_Hàng**: Danh sách sản phẩm và số lượng mà khách hàng đã chọn mua, được lưu trên trình duyệt
- **Đơn_Hàng**: Thông tin đặt hàng bao gồm tên, link Facebook, địa chỉ, số điện thoại, danh sách sản phẩm và số lượng
- **Sản_Phẩm**: Mặt hàng cơm cháy bao gồm hình ảnh, video, thông tin mô tả, giá và slug
- **Telegram_Notifier**: Module gửi thông báo đơn hàng mới đến Telegram thông qua Bot Token và Chat ID
- **Cloudinary_Storage**: Dịch vụ lưu trữ hình ảnh và video sản phẩm trên Cloudinary
- **Turso_Database**: Cơ sở dữ liệu Turso (libSQL) lưu trữ dữ liệu sản phẩm, đơn hàng và thống kê
- **Facebook_Auth**: Module xác thực đăng nhập qua Facebook cho khách hàng
- **Phí_Vận_Chuyển**: Phí giao hàng được tính theo số lượng túi sản phẩm trong đơn hàng

## Yêu cầu

### Yêu cầu 1: Hiển thị danh sách sản phẩm

**User Story:** Là khách hàng, tôi muốn xem danh sách các sản phẩm cơm cháy, để tôi có thể chọn sản phẩm muốn mua.

#### Tiêu chí chấp nhận

1. WHEN khách hàng truy cập Landing_Page, THE Landing_Page SHALL hiển thị danh sách tất cả Sản_Phẩm đang hoạt động bao gồm hình ảnh đại diện, tên sản phẩm và giá
2. WHEN khách hàng nhấn vào một Sản_Phẩm trong danh sách, THE Landing_Page SHALL điều hướng đến trang chi tiết của Sản_Phẩm đó theo slug
3. THE Landing_Page SHALL hiển thị thông tin thương hiệu "Cơm cháy bếp cô Như" trên header của trang

### Yêu cầu 2: Trang chi tiết sản phẩm

**User Story:** Là khách hàng, tôi muốn xem thông tin chi tiết của một sản phẩm, để tôi có thể quyết định mua hàng.

#### Tiêu chí chấp nhận

1. WHEN khách hàng truy cập trang chi tiết Sản_Phẩm, THE Landing_Page SHALL hiển thị tất cả hình ảnh, video, mô tả, và giá của Sản_Phẩm đó
2. WHEN khách hàng truy cập trang chi tiết Sản_Phẩm, THE Landing_Page SHALL hiển thị nút thêm vào Giỏ_Hàng với bộ chọn số lượng
3. IF khách hàng truy cập trang chi tiết với slug không tồn tại, THEN THE Landing_Page SHALL hiển thị trang lỗi 404 với thông báo "Sản phẩm không tồn tại"

### Yêu cầu 3: Quản lý giỏ hàng

**User Story:** Là khách hàng, tôi muốn thêm và xóa sản phẩm khỏi giỏ hàng, để tôi có thể quản lý đơn hàng trước khi đặt mua.

#### Tiêu chí chấp nhận

1. WHEN khách hàng nhấn nút thêm vào giỏ hàng, THE Giỏ_Hàng SHALL thêm Sản_Phẩm với số lượng đã chọn vào danh sách giỏ hàng
2. WHEN khách hàng thay đổi số lượng của một Sản_Phẩm trong Giỏ_Hàng, THE Giỏ_Hàng SHALL cập nhật số lượng và tính lại tổng tiền
3. WHEN khách hàng nhấn nút xóa một Sản_Phẩm khỏi Giỏ_Hàng, THE Giỏ_Hàng SHALL xóa Sản_Phẩm đó khỏi danh sách
4. THE Giỏ_Hàng SHALL lưu trữ dữ liệu trên trình duyệt (localStorage) để giữ lại khi khách hàng tải lại trang
5. THE Giỏ_Hàng SHALL hiển thị tổng số lượng sản phẩm, tổng tiền hàng, Phí_Vận_Chuyển và tổng thanh toán

### Yêu cầu 4: Tính phí vận chuyển

**User Story:** Là khách hàng, tôi muốn biết phí vận chuyển dựa trên số lượng sản phẩm, để tôi có thể ước tính tổng chi phí.

#### Tiêu chí chấp nhận

1. WHEN Giỏ_Hàng có tổng cộng 1 túi sản phẩm, THE Giỏ_Hàng SHALL tính Phí_Vận_Chuyển là 30.000 VNĐ
2. WHEN Giỏ_Hàng có tổng cộng 2 túi sản phẩm, THE Giỏ_Hàng SHALL tính Phí_Vận_Chuyển là 20.000 VNĐ
3. WHEN Giỏ_Hàng có tổng cộng 3 túi sản phẩm, THE Giỏ_Hàng SHALL tính Phí_Vận_Chuyển là 15.000 VNĐ
4. WHEN Giỏ_Hàng có tổng cộng từ 4 túi sản phẩm trở lên, THE Giỏ_Hàng SHALL tính Phí_Vận_Chuyển là 0 VNĐ (miễn phí)
5. WHEN Giỏ_Hàng trống (0 sản phẩm), THE Giỏ_Hàng SHALL hiển thị Phí_Vận_Chuyển là 0 VNĐ


### Yêu cầu 5: Đăng nhập Facebook

**User Story:** Là khách hàng, tôi muốn đăng nhập bằng tài khoản Facebook, để thông tin cá nhân được tự động điền khi đặt hàng.

#### Tiêu chí chấp nhận

1. THE Landing_Page SHALL hiển thị nút đăng nhập Facebook trên header
2. WHEN khách hàng nhấn nút đăng nhập Facebook, THE Facebook_Auth SHALL khởi tạo luồng xác thực OAuth với Facebook
3. WHEN Facebook_Auth xác thực thành công, THE Landing_Page SHALL lưu tên và link Facebook của khách hàng vào phiên đăng nhập
4. WHEN khách hàng đã đăng nhập qua Facebook, THE Landing_Page SHALL hiển thị tên Facebook của khách hàng trên header thay cho nút đăng nhập
5. IF Facebook_Auth xác thực thất bại, THEN THE Landing_Page SHALL hiển thị thông báo lỗi "Đăng nhập Facebook thất bại, vui lòng thử lại"

### Yêu cầu 6: Đặt hàng

**User Story:** Là khách hàng, tôi muốn đặt hàng với thông tin giao hàng, để cửa hàng có thể xử lý và giao sản phẩm cho tôi.

#### Tiêu chí chấp nhận

1. WHEN khách hàng nhấn nút đặt hàng từ Giỏ_Hàng, THE Landing_Page SHALL hiển thị form đặt hàng với các trường: tên, link Facebook, địa chỉ (trước sát nhập), số điện thoại
2. WHEN khách hàng đã đăng nhập qua Facebook, THE Landing_Page SHALL tự động điền tên Facebook và link Facebook vào form đặt hàng
3. THE Landing_Page SHALL yêu cầu bắt buộc các trường: tên, địa chỉ và số điện thoại trước khi cho phép gửi đơn hàng
4. WHEN khách hàng nhập số điện thoại, THE Landing_Page SHALL xác thực số điện thoại theo định dạng số điện thoại Việt Nam (10 chữ số, bắt đầu bằng 0)
5. WHEN khách hàng gửi form đặt hàng hợp lệ, THE Landing_Page SHALL tạo Đơn_Hàng trong Turso_Database với trạng thái "mới" bao gồm tên, link Facebook, địa chỉ, số điện thoại, danh sách sản phẩm, số lượng, tổng tiền và Phí_Vận_Chuyển
6. WHEN Đơn_Hàng được tạo thành công, THE Landing_Page SHALL xóa toàn bộ Giỏ_Hàng và hiển thị thông báo "Đặt hàng thành công"
7. IF tạo Đơn_Hàng thất bại, THEN THE Landing_Page SHALL hiển thị thông báo lỗi "Đặt hàng thất bại, vui lòng thử lại" và giữ nguyên dữ liệu Giỏ_Hàng

### Yêu cầu 7: Gửi thông báo đơn hàng qua Telegram

**User Story:** Là chủ cửa hàng, tôi muốn nhận thông báo đơn hàng mới qua Telegram, để tôi có thể xử lý đơn hàng kịp thời.

#### Tiêu chí chấp nhận

1. WHEN Đơn_Hàng được tạo thành công trong Turso_Database, THE Telegram_Notifier SHALL gửi tin nhắn đến Telegram chat thông qua Bot Token và Chat ID đã cấu hình
2. THE Telegram_Notifier SHALL bao gồm trong tin nhắn: tên khách hàng, số điện thoại, địa chỉ, link Facebook (nếu có), danh sách sản phẩm với số lượng, tổng tiền hàng, Phí_Vận_Chuyển và tổng thanh toán
3. IF Telegram_Notifier gửi tin nhắn thất bại, THEN THE Telegram_Notifier SHALL ghi log lỗi và thử gửi lại tối đa 3 lần với khoảng cách 5 giây giữa mỗi lần

### Yêu cầu 8: Quản lý sản phẩm (CMS)

**User Story:** Là chủ cửa hàng, tôi muốn thêm, sửa, xóa sản phẩm trên CMS, để tôi có thể quản lý danh mục sản phẩm.

#### Tiêu chí chấp nhận

1. THE CMS_Dashboard SHALL hiển thị danh sách tất cả Sản_Phẩm với hình ảnh đại diện, tên, giá và trạng thái
2. WHEN chủ cửa hàng nhấn nút thêm sản phẩm, THE CMS_Dashboard SHALL hiển thị form tạo Sản_Phẩm với các trường: hình ảnh, video, thông tin mô tả, giá và slug
3. WHEN chủ cửa hàng tải lên hình ảnh hoặc video, THE CMS_Dashboard SHALL tải file lên Cloudinary_Storage và lưu URL trả về vào Turso_Database
4. THE CMS_Dashboard SHALL giới hạn dung lượng file tải lên theo cấu hình tối đa (MB) cho mỗi loại file (hình ảnh và video)
5. WHEN chủ cửa hàng nhấn nút sửa một Sản_Phẩm, THE CMS_Dashboard SHALL hiển thị form chỉnh sửa với dữ liệu hiện tại của Sản_Phẩm đó
6. WHEN chủ cửa hàng lưu form sản phẩm hợp lệ, THE CMS_Dashboard SHALL lưu dữ liệu Sản_Phẩm vào Turso_Database
7. WHEN chủ cửa hàng nhấn nút xóa một Sản_Phẩm, THE CMS_Dashboard SHALL yêu cầu xác nhận trước khi xóa Sản_Phẩm khỏi Turso_Database
8. THE CMS_Dashboard SHALL tự động tạo slug từ tên sản phẩm nếu chủ cửa hàng không nhập slug thủ công
9. IF chủ cửa hàng nhập slug đã tồn tại, THEN THE CMS_Dashboard SHALL hiển thị thông báo lỗi "Slug đã tồn tại, vui lòng chọn slug khác"

### Yêu cầu 9: Thống kê truy cập và đơn hàng (CMS)

**User Story:** Là chủ cửa hàng, tôi muốn xem thống kê lượt truy cập và đơn hàng, để tôi có thể theo dõi hiệu quả kinh doanh.

#### Tiêu chí chấp nhận

1. THE CMS_Dashboard SHALL hiển thị tổng số lượt truy cập Landing_Page
2. THE CMS_Dashboard SHALL hiển thị số lượng Đơn_Hàng đăng ký theo ngày, tuần và tháng
3. WHEN chủ cửa hàng chọn bộ lọc khoảng thời gian (ngày bắt đầu và ngày kết thúc), THE CMS_Dashboard SHALL hiển thị thống kê Đơn_Hàng trong khoảng thời gian đã chọn
4. WHEN khách hàng truy cập Landing_Page, THE Landing_Page SHALL ghi nhận một lượt truy cập vào Turso_Database

### Yêu cầu 10: Liên kết mạng xã hội

**User Story:** Là khách hàng, tôi muốn truy cập nhanh các kênh mạng xã hội của cửa hàng, để tôi có thể liên hệ hoặc theo dõi.

#### Tiêu chí chấp nhận

1. THE Landing_Page SHALL hiển thị liên kết đến trang Zalo và trang Facebook của cửa hàng trong phần footer
2. WHEN khách hàng nhấn vào liên kết Zalo hoặc Facebook, THE Landing_Page SHALL mở liên kết trong tab mới của trình duyệt

### Yêu cầu 11: Lưu trữ media trên Cloudinary

**User Story:** Là chủ cửa hàng, tôi muốn hình ảnh và video sản phẩm được lưu trữ trên Cloudinary, để đảm bảo tốc độ tải trang và quản lý media hiệu quả.

#### Tiêu chí chấp nhận

1. WHEN chủ cửa hàng tải lên hình ảnh sản phẩm qua CMS_Dashboard, THE Cloudinary_Storage SHALL lưu trữ hình ảnh và trả về URL công khai
2. WHEN chủ cửa hàng tải lên video sản phẩm qua CMS_Dashboard, THE Cloudinary_Storage SHALL lưu trữ video và trả về URL công khai
3. WHEN Landing_Page hiển thị Sản_Phẩm, THE Landing_Page SHALL tải hình ảnh và video từ URL Cloudinary_Storage
4. IF file tải lên vượt quá giới hạn dung lượng đã cấu hình, THEN THE CMS_Dashboard SHALL từ chối file và hiển thị thông báo "File vượt quá dung lượng cho phép (tối đa X MB)"

### Yêu cầu 12: Thiết kế giao diện

**User Story:** Là khách hàng, tôi muốn trang web có giao diện đẹp và dễ sử dụng theo phong cách trang bán đồ ăn vặt, để tôi có trải nghiệm mua sắm tốt.

#### Tiêu chí chấp nhận

1. THE Landing_Page SHALL có thiết kế responsive hiển thị tốt trên cả thiết bị di động (từ 320px) và máy tính (đến 1920px)
2. THE Landing_Page SHALL sử dụng phong cách thiết kế tham khảo từ các trang thương mại điện tử bán đồ ăn vặt với tông màu ấm, thân thiện
3. THE Landing_Page SHALL hiển thị header với logo/tên thương hiệu "Cơm cháy bếp cô Như", navigation và nút giỏ hàng
4. THE Landing_Page SHALL hiển thị footer với thông tin liên hệ và liên kết mạng xã hội
