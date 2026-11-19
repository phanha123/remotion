# Gieo điều lành

Phim hoạt hình về luật nhân quả, 60 giây, 1920×1080, 30 fps.
Workflow lời kể mới dùng ElevenLabs, giọng nam trầm ấm, ưu tiên miền Bắc.
Giọng cụ thể cần nghe thử và duyệt; không tự dùng lại Edge/Google TTS.
Năm cảnh giữ nhạc nền gốc từ phim Alex.
Không có chữ trên hình. Lời kể và timing nằm trong `story.json`.

Tái sử dụng `Alex/Nature.tsx` (cây, trời, mây, chim) và `Alex/Limb.tsx`
(rig IK). Hai module thuần được tách từ phim Alex, giữ nguyên hình học
và chuyển động; gradient bầu trời dùng ID riêng cho từng instance.
Rig nhân vật mới hỗ trợ cúi gieo hạt, nhặt túi, trao bánh, tưới cây và cầm ô.

Từ thư mục gốc:

```sh
python -X utf8 packages/example/src/NhanQua/prepare.py --dry-run
# Sau khi cấu hình .env, nghe mẫu và duyệt giọng:
python -X utf8 packages/example/src/NhanQua/prepare.py --generate --confirm-spend
node packages/cli/remotion-cli.js studio packages/example/src/NhanQua/entry.tsx --public-dir="<release-dir>" --no-open
python -X utf8 packages/example/src/NhanQua/render.py --public-dir "<release-dir>"
```

Mở URL Studio được CLI in ra, chọn `LuatNhanQua`, nhấn Play hoặc Space.
Preview và render dùng cùng composition có âm thanh, không gọi API.
`<release-dir>` là thư mục ElevenLabs có hash được bước chuẩn bị in ra.
MP4 gốc `out/nhan-qua/Gieo-dieu-lanh.mp4` và audio cũ được giữ nguyên;
không phải bản ElevenLabs. Chưa tạo bản giọng mới khi chưa có key/voice mới.
Hướng dẫn bảo mật, chọn giọng, cache và tính phí:
[ElevenLabs voiceover](../../scripts/voiceover/README.md).
