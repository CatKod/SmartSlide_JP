# Báo cáo cập nhật SmartSlide JP - Bản hoàn chỉnh

## 1. Phạm vi cập nhật
Bản cập nhật này hoàn thiện phần frontend SmartSlide JP theo yêu cầu của nhóm, tập trung vào các màn hình đăng nhập, đăng ký, quên mật khẩu, dashboard, quản lý slide, template, tài liệu dùng chung, cài đặt và trình chỉnh sửa slide.

## 2. Các chức năng chính đã hoàn thành
- Đăng nhập, đăng ký tài khoản và giao diện quên mật khẩu.
- Kiểm tra xác nhận mật khẩu khi đăng ký.
- Dashboard sau đăng nhập.
- Danh sách template, tìm kiếm template và preview template.
- Mỗi template có nhiều trang slide mẫu, có nội dung và hình ảnh minh họa.
- Tạo slide mới với một trang trắng mặc định có tiêu đề tiếng Nhật `こんにちは`.
- Quản lý My Slide: lưu, sửa, xóa slide.
- Trình chỉnh sửa slide: thêm văn bản, thêm ảnh bằng link, upload ảnh từ thiết bị, xóa đối tượng, kéo thả, phóng to/thu nhỏ, chỉnh cỡ chữ, in đậm, in nghiêng, gạch chân, căn lề, đổi màu chữ bằng bảng màu trực quan, đặt ảnh làm hình nền.
- Tiêu đề của mỗi slide được chuyển thành text box đặc biệt, có thể chỉnh nội dung, màu chữ, cỡ chữ, định dạng, căn lề, kéo thả và resize như các text box khác.
- Quản lý trang slide: thêm trang, xóa trang, kéo thả để đổi thứ tự trang.
- Trình chiếu slide toàn màn hình, có chuyển slide bằng click trái/phải hoặc phím mũi tên.
- Xuất toàn bộ slide ra PDF hoặc PPTX.
- Trang tài liệu dùng chung: preview PDF, tải xuống, upload tài liệu từ thiết bị và xóa tài liệu.
- Trang cài đặt: đổi tên giáo viên, email, cấp độ giảng dạy và chọn ngôn ngữ hiển thị.
- Chế độ ngôn ngữ gồm `日本語` và `日本語 + Tiếng Việt`.

## 3. Cập nhật mới nhất
- Thay nút chọn màu chữ dạng khó nhìn bằng bảng màu trực quan giống công cụ soạn thảo văn bản.
- Bảng màu gồm màu tự động, màu chủ đề, màu chuẩn, màu nhạt và tùy chọn màu khác.
- Khi chọn text box, giáo viên có thể đổi màu chữ nhanh bằng bảng màu trên thanh công cụ.
- Màu chữ được áp dụng trong màn hình chỉnh sửa, trình chiếu và khi xuất PDF/PPTX.
- Cập nhật tiêu đề slide thành text box có thuộc tính `isTitle`, giúp giáo viên tùy chỉnh tiêu đề linh hoạt nhưng vẫn giữ được tên slide trong danh sách bên trái.

## 4. Ghi chú kỹ thuật
- Dữ liệu demo đang lưu bằng `localStorage` để thuận tiện kiểm thử frontend.
- Các file tài liệu mẫu nằm trong `frontend/public/materials`.
- Khi kết nối backend thật, có thể thay localStorage bằng API theo tài liệu `docs/API_SPEC.md`.

## 5. Cách chạy frontend
```cmd
cd frontend
npm install
npm run dev
```

Sau đó mở trình duyệt tại:

```text
http://localhost:5173
```
