# Báo cáo cập nhật SmartSlide JP bản hoàn chỉnh

## Mục tiêu
Bản cập nhật này hoàn thiện các chức năng còn thiếu trong giao diện SmartSlide JP theo góp ý kiểm thử của Tuệ. Toàn bộ tài liệu ngoài frontend được viết bằng tiếng Việt để dễ theo dõi và nộp kèm project.

## Những chức năng đã hoàn thiện

### 1. Trang chỉnh sửa slide
- Thêm trang slide mới.
- Xóa từng trang slide bằng nút thùng rác ở danh sách bên trái.
- Không cho xóa khi chỉ còn 1 trang để tránh bộ slide rỗng.
- Kéo thả các trang slide ở danh sách bên trái để đổi thứ tự.
- Sau khi đổi thứ tự, số trang tự đánh lại từ trên xuống dưới.
- Thêm văn bản dạng text box riêng.
- Thêm ảnh bằng link.
- Tải ảnh từ thiết bị lên.
- Thêm nhiều ảnh mà không làm mất ảnh cũ.
- Kéo thả text box và ảnh trong trang slide.
- Phóng to, thu nhỏ text box và ảnh bằng tay nắm ở góc.
- Xóa text box hoặc ảnh đã chọn.
- Định dạng chữ: B, I, U, cỡ chữ, căn trái, căn giữa, căn phải.
- Lưu slide vào My Slide mà không bị tạo bản trùng khi lưu nhiều lần.
- Xuất toàn bộ slide ra PDF hoặc PPTX.
- Đặt ảnh đang chọn làm hình nền cho trang slide bằng nút この画像を背景に設定.
- Bỏ hình nền của trang slide bằng nút 背景画像を解除.
- Khi xuất PDF/PPTX, hình nền của từng trang slide được xuất kèm theo bố cục.

### 2. Tạo slide mới
- Khi bấm 新しいスライドを作成 hoặc 新規作成, hệ thống tạo một bộ slide mới hoàn toàn.
- Bộ slide mới chỉ có 1 trang trắng duy nhất với tiêu đề Konnichiwa.
- Khi bấm このテンプレートで作成 ở trang template, hệ thống vẫn tạo bộ slide theo đúng template đã chọn.

### 3. Trang chia sẻ tài liệu
- Hiển thị 4 tài liệu mẫu dạng PDF.
- Bấm プレビュー để xem trước nội dung PDF.
- Bấm ダウンロード để tải PDF thật về máy.
- Thêm nút 教材をアップロード để giáo viên tải tài liệu từ thiết bị lên.
- Tài liệu tải lên có thể xem trước nếu là PDF, ảnh hoặc text.
- Thêm nút 削除 để xóa từng tài liệu khỏi danh sách.

### 4. Các trang khác
- Dashboard hiển thị tên giáo viên theo phần cài đặt.
- Có nút ログアウト để quay về màn hình đăng nhập.
- Template dùng dữ liệu tiếng Nhật và có nhiều trang slide mẫu.
- My Slide cho phép sửa, xóa và quản lý slide đã lưu.

## Ghi chú kỹ thuật
- Đây là frontend demo chạy bằng React + Vite.
- Dữ liệu slide và tài liệu upload đang lưu tạm bằng localStorage hoặc bộ nhớ trình duyệt.
- Khi nối backend NoSQL thật, các chức năng lưu slide, upload tài liệu và xóa tài liệu nên chuyển sang API.


## Cập nhật bổ sung cuối cùng
- Khi chọn một ảnh trong slide, bảng Properties bên phải hiển thị nút この画像を背景に設定 ở dưới phần メモ.
- Nút này giúp giáo viên dùng chính ảnh đã chọn làm hình nền của trang slide hiện tại.
- Sau khi đặt làm hình nền, ảnh sẽ không còn là một đối tượng nổi trên slide nữa để tránh bị trùng hình.
- Nếu muốn đổi nền, giáo viên có thể thêm/chọn ảnh khác rồi đặt lại làm nền.
- Nếu muốn bỏ nền, giáo viên bấm 背景画像を解除.
