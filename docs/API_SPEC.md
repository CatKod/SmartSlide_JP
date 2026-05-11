# Đặc tả API đề xuất cho SmartSlide JP

## 1. Mục tiêu
Tài liệu này mô tả các API nên có khi chuyển bản frontend demo sang hệ thống thật có backend và cơ sở dữ liệu NoSQL.

## 2. Nhóm API tài khoản

### Đăng nhập
`POST /api/auth/login`

Body:
```json
{
  "email": "teacher@example.com",
  "password": "password"
}
```

Response:
```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "name": "Tue",
    "email": "teacher@example.com",
    "level": "N3/N4",
    "language": "日本語"
  }
}
```

### Đăng ký
`POST /api/auth/register`

### Lấy thông tin người dùng hiện tại
`GET /api/users/me`

### Cập nhật hồ sơ giáo viên
`PUT /api/users/me`

Body:
```json
{
  "name": "Tue",
  "email": "teacher@example.com",
  "level": "N3/N4",
  "language": "日本語"
}
```

## 3. Nhóm API template

### Lấy danh sách template
`GET /api/templates?keyword=&category=&level=`

### Lấy chi tiết template
`GET /api/templates/:id`

Một template nên có cấu trúc:
```json
{
  "id": "tpl_001",
  "title": "N3文法：〜てくる・〜ていく",
  "category": "grammar",
  "level": "N3",
  "author": "佐々木先生",
  "thumbnailUrl": "https://...",
  "description": "...",
  "tags": ["N3", "文法"],
  "slidesData": []
}
```

## 4. Nhóm API slide cá nhân

### Lấy danh sách slide của tôi
`GET /api/slides/my`

### Tạo slide mới
`POST /api/slides`

### Cập nhật slide đã có
`PUT /api/slides/:id`

Điểm quan trọng: khi người dùng sửa slide cũ và bấm lưu, frontend phải gọi API cập nhật theo `id`, không gọi API tạo mới. Như vậy sẽ không bị sinh nhiều bản trùng lặp.

### Xóa slide
`DELETE /api/slides/:id`

### Xuất slide sang PDF hoặc PPTX
Có thể xử lý ở frontend như bản demo hoặc xử lý ở backend nếu muốn đảm bảo đồng nhất môi trường.

Đề xuất nếu làm backend:
`POST /api/slides/:id/export`

Body:
```json
{
  "format": "pdf"
}
```

Response:
```json
{
  "downloadUrl": "/exports/deck_id.pdf"
}
```

Giá trị `format` có thể là:
- `pdf`
- `pptx`

## 5. Cấu trúc slide đề xuất

```json
{
  "id": "deck_id",
  "ownerId": "user_id",
  "title": "Tên bộ slide",
  "templateId": "tpl_001",
  "slides": [
    {
      "id": "slide_id",
      "title": "Tiêu đề trang",
      "backgroundImage": "https://... hoặc đường dẫn ảnh nền đã upload",
      "elements": [
        {
          "id": "element_text_id",
          "type": "text",
          "content": "Nội dung văn bản",
          "x": 12,
          "y": 30,
          "w": 45,
          "h": 16,
          "fontSize": 18,
          "bold": true,
          "italic": false,
          "underline": false,
          "align": "left"
        },
        {
          "id": "element_image_id",
          "type": "image",
          "src": "https://... hoặc đường dẫn file upload",
          "x": 10,
          "y": 48,
          "w": 42,
          "h": 30
        }
      ]
    }
  ],
  "createdAt": "2026-05-11T00:00:00.000Z",
  "updatedAt": "2026-05-11T00:00:00.000Z"
}
```

Ghi chú: trong frontend demo, `x`, `y`, `w`, `h` được lưu theo phần trăm kích thước canvas để dễ responsive và dễ xuất file. Trường `backgroundImage` lưu ảnh nền riêng của từng trang slide. Nếu không có nền thì để chuỗi rỗng hoặc bỏ qua trường này.

## 6. Nhóm API upload

### Upload ảnh dùng trong slide
`POST /api/uploads/images`

Form data:
```text
file: image file
```

Response:
```json
{
  "url": "/uploads/images/file_name.png"
}
```

### Upload tài liệu giảng dạy
`POST /api/materials/upload`

Form data:
```text
file: pdf, image, text hoặc tài liệu khác
```

Response:
```json
{
  "id": "material_id",
  "title": "Tên tài liệu",
  "type": "PDF",
  "fileUrl": "/materials/file.pdf",
  "previewUrl": "/materials/file.pdf",
  "mimeType": "application/pdf"
}
```

## 7. Nhóm API tài liệu chia sẻ

### Lấy danh sách tài liệu
`GET /api/materials?keyword=&type=&level=`

### Xem trước tài liệu
`GET /api/materials/:id/preview`

Với PDF, API có thể trả về chính file PDF hoặc một URL preview.

### Tải tài liệu
`GET /api/materials/:id/download`

Yêu cầu backend trả đúng header để tránh lỗi file tải về không mở được:

```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="n5_vocab_image_set.pdf"
```

Nên dùng tên file ASCII ở phần `filename` để tránh lỗi mã hóa tên file trên một số máy.


## Ghi chú về thứ tự và xóa trang slide
- Thứ tự các trang slide được xác định theo vị trí của từng phần tử trong mảng `slides`.
- Khi giáo viên kéo thả đổi thứ tự trang, frontend gửi lại mảng `slides` đã được sắp xếp mới.
- Khi giáo viên xóa một trang, frontend gửi lại mảng `slides` sau khi đã loại bỏ trang đó.
- Backend NoSQL chỉ cần lưu nguyên mảng `slides` theo thứ tự mới để lần mở sau hiển thị đúng.


## Bổ sung API tài liệu
- `POST /api/materials/upload`: tải tài liệu từ thiết bị lên hệ thống.
- `GET /api/materials/:id/preview`: xem trước tài liệu.
- `GET /api/materials/:id/download`: tải tài liệu xuống.
- `DELETE /api/materials/:id`: xóa tài liệu khỏi danh sách chia sẻ.

## Bổ sung API tạo slide mới
- `POST /api/slides/blank`: tạo bộ slide trắng gồm 1 trang với tiêu đề mặc định Konnichiwa.
- `POST /api/slides/from-template/:templateId`: tạo bộ slide mới từ template đã chọn.


## Bổ sung dữ liệu hình nền trang slide
- Mỗi phần tử trong mảng `slides` có thể có trường `backgroundImage`.
- Khi giáo viên chọn một ảnh và bấm この画像を背景に設定, frontend cập nhật `backgroundImage` của trang slide hiện tại.
- Nếu backend xử lý xuất PDF/PPTX, cần render `backgroundImage` trước rồi mới render title và các elements lên trên.
