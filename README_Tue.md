# SmartSlide JP Frontend

## 1. Giới thiệu
SmartSlide JP là giao diện frontend hỗ trợ giáo viên tiếng Nhật tạo, chỉnh sửa, quản lý và trình chiếu slide bài giảng. Giao diện được thiết kế theo phong cách hiện đại, sử dụng tiếng Nhật làm ngôn ngữ chính và có tùy chọn hiển thị song ngữ Nhật + Việt.

## 2. Chức năng đã hoàn thành

### Đăng nhập, đăng ký và quên mật khẩu
- Đăng nhập bằng email và mật khẩu.
- Đăng ký tài khoản mới với xác nhận lại mật khẩu.
- Hiển thị lỗi khi mật khẩu nhập lại không trùng khớp.
- Màn hình quên mật khẩu cho phép nhập email và hiển thị thông báo phù hợp.

### Dashboard
- Hiển thị lời chào theo tên giáo viên.
- Có nút tạo slide mới.
- Hiển thị thống kê template, slide đã lưu và tài liệu dùng chung.

### Template
- Danh sách template bằng tiếng Nhật.
- Tìm kiếm template theo từ khóa.
- Preview template trước khi sử dụng.
- Mỗi template có nhiều trang slide mẫu, có văn bản và hình ảnh.

### My Slide và trình chỉnh sửa slide
- Tạo slide mới với một trang trắng mặc định có tiêu đề `こんにちは`, trong đó tiêu đề là một text box có thể chỉnh sửa.
- Lưu slide mới và cập nhật slide đã có mà không tạo bản trùng lặp.
- Thêm, xóa, kéo thả và đổi thứ tự các trang slide.
- Thêm text box, thêm ảnh bằng link hoặc upload ảnh từ thiết bị.
- Xóa đối tượng text/ảnh, kéo thả và thay đổi kích thước.
- Chỉnh chữ: in đậm, in nghiêng, gạch chân, cỡ chữ, căn trái/giữa/phải.
- Đổi màu chữ bằng bảng màu trực quan trên thanh công cụ, áp dụng cho cả tiêu đề và các text box thường.
- Tiêu đề slide cũng là một text box: có thể đổi nội dung, màu chữ, in đậm, in nghiêng, gạch chân, đổi cỡ chữ, căn lề, kéo thả và resize.
- Đặt ảnh đã chọn làm hình nền slide và gỡ hình nền.
- Trình chiếu slide toàn màn hình.
- Xuất slide ra PDF hoặc PowerPoint.

### Tài liệu dùng chung
- Hiển thị 4 tài liệu PDF mẫu.
- Xem trước nội dung tài liệu trước khi tải.
- Tải tài liệu xuống máy.
- Upload tài liệu từ thiết bị.
- Xóa tài liệu không cần dùng.

### Cài đặt
- Cập nhật tên, email và cấp độ giảng dạy.
- Chọn ngôn ngữ hiển thị: `日本語` hoặc `日本語 + Tiếng Việt`.
- Khi chọn Nhật + Việt, giao diện chính hiển thị tiếng Nhật trước và chú thích tiếng Việt bên dưới.

## 3. Cách chạy project
Mở CMD tại thư mục frontend:

```cmd
cd frontend
npm install
npm run dev
```

Sau đó mở:

```text
http://localhost:5173
```

## 4. Lưu ý
- Đây là bản frontend demo, dữ liệu được lưu tạm bằng localStorage.
- Khi muốn kiểm thử sạch, có thể xóa Local Storage của `localhost:5173` trong trình duyệt.
- Không push thư mục `node_modules` lên GitHub; thư mục này đã được đưa vào `.gitignore`.


## Cập nhật v15

- Thanh trên cùng đã được chỉnh lại theo giao diện mới: chữ SmartSlide JP màu đen, có ô tìm kiếm kèm biểu tượng kính lúp, nút hồng chuyển thành Upload template, bỏ nút logout và thêm bộ chuyển ngôn ngữ JP / JP + VI.
- Phần chọn ngôn ngữ đã được chuyển từ trang Cài đặt lên thanh trên cùng. Trang Cài đặt chỉ còn thông tin hồ sơ giáo viên.
- Trang マイスライド được đổi từ dạng card vuông sang dạng danh sách chữ nhật, gồm tên slide, trạng thái, thời gian chỉnh sửa, số trang và các nút chỉnh sửa, tải xuống, sao chép, xóa.
- Trang マイスライド bổ sung nút import, export, tạo mới, thanh tìm kiếm, bộ lọc trạng thái và sắp xếp.


## Cập nhật v16

- Thanh header được căn lại theo bố cục mới, ô tìm kiếm kéo dài linh hoạt để giảm khoảng trống bên phải.
- Nút avatar được đặt sát về phía phải của header.
- Đảm bảo nút chuyển ngôn ngữ JP / JP + VI hoạt động ổn định ở tất cả các trang.
- Trang Dashboard được đổi sang bố cục dự án gần đây dạng lưới giống mẫu: tiêu đề chào mừng, nút tạo slide mới, danh sách các project/template gần đây dạng card chữ nhật.


## Cập nhật v17

- Nút DL trong trang `マイスライド` đã được đổi để mặc định tải slide dưới dạng PDF thay vì file JSON.
- Trang Dashboard được khôi phục về bố cục v15 vì bố cục này phù hợp hơn với giao diện tổng quan ban đầu.
- Header mới của v16 vẫn được giữ nguyên, bao gồm ô tìm kiếm dài, nút upload template, nút chuyển ngôn ngữ JP / JP + VI và avatar.


## Cập nhật v18

- Nút `テンプレートをアップロード` trên header đã hoạt động đúng theo yêu cầu.
- Khi giáo viên upload file PPTX/PPT/PDF/JSON, hệ thống sẽ thêm một template mới vào trang `テンプレート`.
- Template được upload luôn có tiêu đề tiếng Nhật là `新しいテンプレート`.
- Template upload có thể preview, sử dụng để tạo slide và chỉnh sửa giống các template có sẵn.
- Dữ liệu template upload được lưu tạm bằng localStorage trong bản frontend demo.
