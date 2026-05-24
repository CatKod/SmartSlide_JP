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


## Cập nhật v15

### Nội dung đã sửa
- Cập nhật thanh header theo yêu cầu mới của giao diện SmartSlide JP.
- Đổi nút tạo slide trên header thành nút upload template.
- Thêm biểu tượng kính lúp trong ô tìm kiếm toàn cục.
- Bỏ nút logout khỏi header để giao diện gọn hơn.
- Thêm lựa chọn ngôn ngữ Nhật / Nhật + Việt trực tiếp trên header.
- Bỏ phần chọn ngôn ngữ khỏi trang Cài đặt.
- Thiết kế lại trang My Slides theo dạng danh sách chữ nhật chuyên nghiệp hơn.
- Bổ sung các thao tác quản lý slide: edit, download, copy, delete.
- Bổ sung import/export slide, tìm kiếm, lọc và sắp xếp trong trang My Slides.

### Ghi chú
Các cập nhật này giúp giao diện giống hệ thống quản lý slide thực tế hơn và thuận tiện hơn cho giáo viên khi quản lý nhiều bộ slide.


## Cập nhật v16

### Nội dung đã sửa
1. Căn chỉnh lại thanh trên cùng để ô tìm kiếm chiếm không gian còn lại và avatar nằm sát bên phải.
2. Giữ nút upload template, ô chuyển ngôn ngữ và avatar cùng hàng, hạn chế khoảng trắng thừa.
3. Sửa cơ chế truyền `setProfile` vào toàn bộ layout để chuyển đổi ngôn ngữ JP / JP + VI ổn định ở mọi màn hình.
4. Thiết kế lại Dashboard theo dạng danh sách dự án gần đây giống mẫu giao diện:
   - Có lời chào giáo viên.
   - Có nút tạo slide mới.
   - Có khu vực `最近のプロジェクト`.
   - Các project/template hiển thị dạng card chữ nhật có preview xám, icon tài liệu, tên và thời gian chỉnh sửa.


## Cập nhật v17

### Nội dung đã sửa
1. Sửa nút `DL` tại trang `マイスライド`:
   - Trước đây tải file JSON.
   - Hiện tại mặc định xuất và tải slide dưới dạng PDF.

2. Khôi phục Dashboard:
   - Bố cục Dashboard được đưa về dạng v15.
   - Vẫn giữ thanh header mới đã ổn định ở v16.

3. Giữ nguyên các phần đang hoạt động tốt:
   - Ô tìm kiếm trên header.
   - Nút upload template.
   - Bộ chuyển ngôn ngữ JP / JP + VI.
   - Avatar bên phải.


## Cập nhật v18

### Nội dung đã sửa
1. Sửa chức năng upload template:
   - Trước đây sau khi upload chỉ chuyển sang trang template nhưng template mới chưa xuất hiện.
   - Hiện tại file upload sẽ được thêm vào danh sách template.

2. Quy tắc template upload:
   - Tên template luôn là `新しいテンプレート`.
   - Có nhãn `アップロード`.
   - Có nhiều slide mẫu để giáo viên tiếp tục chỉnh sửa.
   - Có đầy đủ chức năng preview, sử dụng mẫu, chỉnh sửa text/ảnh, lưu và xuất file.

3. Lưu trữ:
   - Bản demo frontend lưu template upload trong `localStorage`.
   - Khi tích hợp backend, phần này có thể nối với API upload template thật.


## Cập nhật v19

### Nội dung đã sửa
1. Cố định sidebar bên trái:
   - Menu điều hướng không bị trượt khi người dùng lăn chuột.
   - Giúp giáo viên luôn có thể chuyển trang nhanh.

2. Cải thiện giao diện chỉnh sửa slide:
   - Bố cục được làm lại theo phong cách Canva.
   - Vùng slide nằm chính giữa màn hình để dễ thiết kế.
   - Thanh công cụ được đưa lên phía trên, dạng nổi.
   - Danh sách slide chuyển xuống dưới theo dạng thumbnail ngang.
   - Panel thuộc tính nằm bên phải và có cuộn riêng.

3. Giữ nguyên chức năng:
   - Không thay đổi logic thêm/xóa/kéo thả text và ảnh.
   - Không thay đổi chức năng trình chiếu, lưu, xuất PDF/PPTX.


## Cập nhật v20

### Nội dung đã sửa
1. Trang chỉnh sửa slide:
   - Bỏ thanh header trên cùng gồm tìm kiếm, upload template, chuyển ngôn ngữ và avatar.
   - Tăng không gian hiển thị slide để giáo viên dễ thao tác hơn.
   - Giữ nguyên các chức năng chỉnh sửa hiện có.

2. Các trang còn lại:
   - Header vẫn giữ nguyên để tìm kiếm, upload template và chuyển ngôn ngữ.


## Cập nhật v21

### Nội dung đã sửa
1. Thanh công cụ:
   - Ép toàn bộ công cụ chỉnh sửa nằm trên một hàng.
   - Giảm padding và cỡ nút để tăng không gian thiết kế slide.

2. Hình nền slide:
   - Sửa lỗi ảnh nền không hiển thị do CSS nền trắng ghi đè.
   - Nút đặt hình ảnh làm hình nền hoạt động lại bình thường.

3. Thumbnail slide:
   - Thumbnail phía dưới hiển thị preview thu nhỏ của slide.
   - Nếu slide có hình nền, thumbnail cũng hiển thị hình nền tương ứng.
   - Nội dung text và ảnh được thu nhỏ theo tỷ lệ phù hợp.

4. Text box:
   - Bỏ thanh kéo/scroll không cần thiết trong text box tiêu đề.
   - Text box tiêu đề hiển thị giống các text box bình thường khác.
