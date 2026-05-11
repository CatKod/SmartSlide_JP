# Thiết kế collection NoSQL cho SmartSlide JP

## 1. users
Lưu thông tin giáo viên.

Trường đề xuất:
- `_id`
- `name`
- `email`
- `passwordHash`
- `level`
- `language`
- `createdAt`
- `updatedAt`

## 2. templates
Lưu các template slide mẫu.

Trường đề xuất:
- `_id`
- `title`
- `category`
- `level`
- `author`
- `thumbnailUrl`
- `description`
- `tags`
- `slidesData`
- `createdAt`
- `updatedAt`

## 3. slideDecks
Lưu các bộ slide giáo viên tạo hoặc chỉnh sửa.

Trường đề xuất:
- `_id`
- `ownerId`
- `title`
- `templateId`
- `slides`
- `createdAt`
- `updatedAt`

Trong `slides`, mỗi trang slide có danh sách `elements`. Element có thể là text hoặc image, có vị trí, kích thước và định dạng riêng.

## 4. materials
Lưu tài liệu giảng dạy chia sẻ.

Trường đề xuất:
- `_id`
- `title`
- `type`
- `level`
- `ownerId`
- `ownerName`
- `fileUrl`
- `previewUrl`
- `mimeType`
- `createdAt`
- `updatedAt`

## 5. assets
Lưu thông tin các ảnh được upload để dùng trong slide.

Trường đề xuất:
- `_id`
- `ownerId`
- `fileName`
- `mimeType`
- `url`
- `size`
- `createdAt`
