# Báo cáo hoàn thành phần nhiệm vụ của Tuệ

## 1. Các màn hình đã làm
- Đăng nhập
- Đăng ký
- Dashboard
- My Slide
- Template List
- Template Detail
- Slide Editor
- Shared Materials
- Settings

## 2. Các chức năng chính đã hoàn thành
- Điều hướng đầy đủ giữa các mục sidebar.
- Dashboard cập nhật tên giáo viên sau khi đổi trong cài đặt.
- Template có dữ liệu tiếng Nhật, có nhiều slide mẫu và có hình ảnh.
- Slide Editor hỗ trợ thêm, sửa, kéo thả, resize, xóa text và ảnh.
- Slide Editor hỗ trợ định dạng chữ: B, I, U, cỡ chữ và căn lề.
- Slide Editor hỗ trợ xuất toàn bộ bộ slide sang PDF hoặc PPTX.
- My Slide lưu đúng logic: tạo mới thì thêm bản mới, sửa bản cũ thì cập nhật bản cũ.
- Shared Materials có PDF mẫu, preview PDF, download PDF mở được và upload tài liệu từ thiết bị.

## 3. Công nghệ sử dụng
- React
- Vite
- CSS thuần
- lucide-react cho icon
- html2canvas để chụp layout slide khi xuất file
- jsPDF để xuất PDF
- pptxgenjs để xuất PowerPoint PPTX
- localStorage cho dữ liệu demo
- File PDF mẫu đặt trong `frontend/public/materials`

## 4. Ghi chú
Bản này là frontend demo. Khi nhóm có backend, nên thay phần localStorage bằng API thật theo tài liệu `API_SPEC.md`.
