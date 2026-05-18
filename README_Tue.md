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
