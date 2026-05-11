# SmartSlide JP - Bản hoàn chỉnh cho phần nhiệm vụ của Tuệ

## 1. Mục đích
SmartSlide JP là bản frontend demo phục vụ đồ án tạo slide giảng dạy tiếng Nhật cho giáo viên. Bản này tập trung vào các nhiệm vụ của Tuệ: đăng nhập/đăng ký, dashboard, template, my slide, trình chỉnh sửa slide, tài liệu chia sẻ và cài đặt tài khoản.

## 2. Cách chạy project

```bash
cd frontend
npm install
npm run dev
```

Sau đó mở trình duyệt tại:

```bash
http://localhost:5173
```

Tài khoản demo đã được điền sẵn ở màn hình đăng nhập. Chỉ cần bấm đăng nhập là vào được hệ thống.

## 3. Các chức năng đã hoàn thiện

### Đăng nhập và đăng ký
- Giao diện nền trái có hình ảnh minh họa sinh động.
- Có thể chuyển giữa đăng nhập và đăng ký.
- Sau khi đăng nhập sẽ vào dashboard.

### Dashboard
- Hiển thị lời chào theo tên giáo viên.
- Nếu đổi tên trong cài đặt và lưu, dashboard sẽ cập nhật tên mới.
- Có thống kê template, my slide, tài liệu chia sẻ và trạng thái lưu gần đây.

### My Slide
- Hiển thị các slide đã lưu.
- Tạo slide mới được thêm vào danh sách.
- Khi chỉnh sửa slide cũ và bấm lưu, hệ thống cập nhật đúng slide đó, không sinh bản trùng lặp.
- Có thể xóa slide.

### Template
- Có nhiều template thật, mỗi template có khoảng 8 đến 9 trang slide mẫu.
- Nội dung giao diện được viết bằng tiếng Nhật.
- Template có hình ảnh trong slide.
- Bấm preview để xem chi tiết template.
- Bấm sử dụng template sẽ mở đúng bộ slide của template đó.

### Trình chỉnh sửa slide
- Có thể thêm slide mới.
- Có thể xóa từng trang slide không cần dùng nữa.
- Có thể kéo thả các trang slide ở danh sách bên trái để đổi thứ tự; số thứ tự được cập nhật lại từ trên xuống dưới.
- Có thể thêm khung văn bản.
- Có thể thêm ảnh bằng URL.
- Có thể tải ảnh từ thiết bị lên.
- Có thể thêm nhiều ảnh, ảnh cũ không bị mất.
- Text box và ảnh có thể kéo thả tự do trong canvas.
- Text box và ảnh có thể phóng to, thu nhỏ bằng nút kéo ở góc.
- Text box và ảnh có thể xóa bằng nút x hoặc nút xóa trên toolbar.
- Có các chức năng định dạng chữ: in đậm, in nghiêng, gạch chân, cỡ chữ, căn trái, căn giữa, căn phải.
- Có thể xuất toàn bộ bộ slide sau khi chỉnh sửa dưới dạng PDF hoặc PowerPoint PPTX.
- Khi chọn một ảnh trong slide, bảng Properties có nút この画像を背景に設定 để đặt ảnh đó làm hình nền của trang slide.
- Có thể解除 hình nền bằng nút 背景画像を解除 trong bảng Properties.
- Chức năng xuất slide dùng ảnh chụp từng trang slide để giữ nguyên bố cục, chữ tiếng Nhật, hình ảnh và hình nền.

### Tài liệu chia sẻ
- 4 tài liệu mặc định hiện tại đều là file PDF thật.
- Tên file PDF dùng ký tự ASCII để tránh lỗi khi tải xuống trên Windows hoặc trình duyệt khác nhau.
- Nút kính lúp có thể mở preview để xem trước nội dung tài liệu.
- Nút download tải file PDF thật về máy và có thể mở được bằng trình đọc PDF.
- Có nút tải tài liệu từ thiết bị lên để giáo viên thêm tài liệu tùy ý.
- Tài liệu upload từ thiết bị có thể preview nếu là PDF, ảnh hoặc file text.

### Cài đặt
- Có thể chỉnh tên, email, trình độ giảng dạy chính.
- Sau khi lưu tên, header và dashboard cập nhật theo tên mới.

## 4. Lưu ý kỹ thuật
- Bản demo đang lưu dữ liệu slide bằng localStorage của trình duyệt.
- Nếu test nhiều lần và thấy dữ liệu cũ, có thể xóa slide trong My Slide hoặc clear localStorage.
- Tài liệu upload từ thiết bị hiện được lưu tạm trong phiên trình duyệt bằng object URL. Khi tích hợp backend, phần này nên chuyển sang API upload file thật.
- Khi xuất PDF/PPTX, nếu ảnh lấy từ URL ngoài không cho phép đọc dữ liệu ảnh do CORS, nên dùng chức năng upload ảnh từ thiết bị để kết quả xuất ổn định hơn.

## 5. Cấu trúc thư mục chính

```text
frontend/
  public/materials/        Chứa 4 file PDF mẫu
  src/components/          Layout chung
  src/data/                Dữ liệu mock template và tài liệu
  src/pages/               Các màn hình chính
  src/styles.css           Style toàn hệ thống
docs/
  API_SPEC.md              Đặc tả API đề xuất
  NoSQL_Collections.md     Thiết kế collection NoSQL
  QA_TemplateSearch_Checklist.md
  Completion_Report_Tue.md
  Update_Report_Tue.md
```

## Cập nhật cuối cùng trong bản v10
- Bổ sung nút この画像を背景に設定 trong bảng Properties khi giáo viên chọn một ảnh trên slide.
- Khi bấm nút này, ảnh đã chọn sẽ trở thành hình nền của trang slide hiện tại và ảnh gốc được đưa xuống nền để tránh bị trùng đối tượng.
- Có thêm nút 背景画像を解除 để bỏ hình nền nếu giáo viên muốn đổi lại.
- Khi xuất PDF/PPTX, hình nền cũng được đưa vào file xuất.
- Các chức năng của bản trước vẫn giữ nguyên: xóa tài liệu, tạo slide trắng 1 trang Konnichiwa, dùng template nhiều trang, thêm/xóa trang, kéo thả đổi thứ tự trang, thêm text, thêm ảnh, kéo thả đối tượng, resize, định dạng chữ và xuất PDF/PPTX.
