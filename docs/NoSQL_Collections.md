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

## 6. activitylogs
Lưu lịch sử hoạt động (audit log).

Trường đề xuất:
- `_id`
- `user_id`
- `action`
- `target_type`
- `target_id`
- `details`
- `snapshot`
- `createdAt`
- `updatedAt`
- `__v`

Ví dụ document:
```json
{
	"user_id": {
		"$oid": "6a01ca9460c7f2ffe99eff9b"
	},
	"action": "update_presentation",
	"target_type": "presentation",
	"target_id": {
		"$oid": "6a01ceb93f807b9c41de3af8"
	},
	"details": {
		"title": "Konnichiwa"
	},
	"snapshot": {
		"title": "Konnichiwa",
		"slides": [
			{
				"id": "s_blank_1778503347040",
				"title": "Konnichiwa",
				"backgroundImage": "",
				"elements": [
					{
						"id": "el_text_konnichiwa_1778503347040",
						"type": "text",
						"content": "Konnichiwa",
						"fontSize": 32,
						"bold": true,
						"italic": false,
						"underline": false,
						"align": "left",
						"x": 12,
						"y": 22,
						"w": 54,
						"h": 18,
						"z_index": 0
					}
				]
			}
		]
	},
	"createdAt": {
		"$date": "2026-05-11T12:42:35.211Z"
	},
	"updatedAt": {
		"$date": "2026-05-11T12:42:35.211Z"
	},
	"__v": 0
}
```
