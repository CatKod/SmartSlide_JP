# Đặc tả dữ liệu và API đề xuất cho SmartSlide JP

## 1. User
Thông tin giáo viên nên lưu trong collection `users`.

Các trường chính:
- `id`: mã người dùng
- `name`: tên giáo viên
- `email`: email đăng nhập
- `passwordHash`: mật khẩu đã mã hóa
- `mainLevel`: cấp độ giảng dạy chính
- `language`: ngôn ngữ hiển thị, ví dụ `日本語` hoặc `日本語 + ベトナム語`
- `createdAt`, `updatedAt`: thời gian tạo và cập nhật

API đề xuất:
- `POST /api/auth/login`: đăng nhập
- `POST /api/auth/register`: đăng ký
- `POST /api/auth/forgot-password`: gửi email khôi phục mật khẩu
- `GET /api/users/me`: lấy thông tin người dùng hiện tại
- `PUT /api/users/me`: cập nhật thông tin cá nhân

## 2. Slide Deck
Thông tin bộ slide nên lưu trong collection `slideDecks`.

Cấu trúc đề xuất:

```json
{
  "id": "deck_001",
  "ownerId": "user_001",
  "title": "N3文法：〜てくる・〜ていく",
  "templateId": "tpl_001",
  "slides": [
    {
      "id": "slide_001",
      "title": "こんにちは",
      "backgroundImage": "",
      "elements": [
        {
          "id": "el_text_001",
          "type": "text",
      "isTitle": true,
          "x": 12,
          "y": 22,
          "w": 54,
          "h": 18,
          "content": "こんにちは",
          "bold": true,
          "italic": false,
          "underline": false,
          "fontSize": 32,
          "align": "left"
        },
        {
          "id": "el_img_001",
          "type": "image",
          "x": 10,
          "y": 48,
          "w": 42,
          "h": 30,
          "src": "https://example.com/image.jpg"
        }
      ]
    }
  ],
  "createdAt": "2026-05-13T00:00:00.000Z",
  "updatedAt": "2026-05-13T00:00:00.000Z"
}
```

API đề xuất:
- `GET /api/slides`: lấy danh sách slide của giáo viên
- `GET /api/slides/:id`: lấy chi tiết một bộ slide
- `POST /api/slides`: tạo bộ slide mới
- `PUT /api/slides/:id`: cập nhật bộ slide đã có
- `DELETE /api/slides/:id`: xóa bộ slide
- `POST /api/slides/:id/export`: xuất slide PDF/PPTX nếu xử lý ở backend

## 3. Template
Template nên lưu trong collection `templates`.

Các trường chính:
- `id`
- `title`
- `teacher`
- `level`
- `category`
- `tags`
- `thumbnail`
- `slidesData`: danh sách slide mẫu

API đề xuất:
- `GET /api/templates`: lấy danh sách template
- `GET /api/templates/:id`: lấy chi tiết template

## 4. Shared Materials
Tài liệu giảng dạy nên lưu trong collection `materials`.

Các trường chính:
- `id`
- `title`
- `type`: PDF, image, text...
- `level`
- `teacher`
- `fileUrl`
- `createdAt`, `updatedAt`

API đề xuất:
- `GET /api/materials`: lấy danh sách tài liệu
- `POST /api/materials`: upload tài liệu
- `GET /api/materials/:id/preview`: xem trước tài liệu
- `GET /api/materials/:id/download`: tải tài liệu
- `DELETE /api/materials/:id`: xóa tài liệu

## 5. Upload
API upload nên dùng cho ảnh trong slide và tài liệu giảng dạy.

API đề xuất:
- `POST /api/uploads/images`: upload ảnh dùng trong slide
- `POST /api/uploads/materials`: upload tài liệu giảng dạy

Kết quả trả về nên có:
- `fileUrl`
- `fileName`
- `mimeType`
- `size`

## Cập nhật v12

### Thuộc tính màu chữ trong slide elements
Đối tượng text trong `slides.elements` có thêm trường:

```json
{
  "type": "text",
      "isTitle": true,
  "content": "こんにちは",
  "fontSize": 18,
  "bold": false,
  "italic": false,
  "underline": false,
  "align": "left",
  "color": "#201827"
}
```

Trường `color` dùng để lưu màu chữ của từng khung văn bản. Frontend sử dụng trường này khi hiển thị trong editor, trình chiếu và khi xuất PDF/PPTX.

### Cấu hình ngôn ngữ người dùng
Trường `language` trong user profile hỗ trợ 2 giá trị:

```json
"日本語"
```

hoặc:

```json
"日本語 + Tiếng Việt"
```

Khi chọn `日本語 + Tiếng Việt`, frontend sẽ hiển thị tiếng Nhật kèm chú thích tiếng Việt bên dưới ở các khu vực giao diện chính.


## Ghi chú cập nhật tiêu đề slide
- Mỗi slide nên có một element loại `text` với `isTitle: true`.
- Element này dùng làm tiêu đề slide, đồng thời vẫn hỗ trợ các thuộc tính chỉnh sửa như `fontSize`, `bold`, `italic`, `underline`, `align`, `color`, `x`, `y`, `w`, `h`.
- Khi người dùng đổi nội dung của title element, trường `title` của slide cần được cập nhật tương ứng để danh sách slide bên trái hiển thị đúng tên.
