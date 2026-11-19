# Dư một đốt xương

Bản dựng bám theo video mẫu đã cung cấp: 13:16.583, 1024×576 (16:9), 24 fps,
61 cảnh và 195 câu phụ đề. Đoạn mở được dựng lại bằng SVG/Remotion; các cảnh
còn lại giữ hình minh họa và chuyển động của mẫu bằng lớp nền và các vùng
chuyển động đã tách. Lời kể và nhạc gốc nằm trên một track riêng. Composition
không cần đọc lại MP4 nguồn khi xem hay xuất.

| Mốc   | Cảnh và chuyển động giữ lại                                                    |
| ----- | ------------------------------------------------------------------------------ |
| 00:00 | Xương hiện từng đốt trên lá chuối; số 28 chuyển đỏ thành 29.                   |
| 00:11 | Chú Tư dặn Lộc; chuyển từ nền tối sang cảnh gò mộ, rồi trời tối dần.           |
| 02:39 | Lộc xuống huyệt, gom xương và trả lại đốt dư; ánh đèn và nhân vật chuyển động. |
| 06:42 | Đếm và xếp lại hai bàn tay; cởi găng và trở về cảnh trời mưa trong hồi tưởng.  |
| 09:48 | Đóng tiểu, lấp huyệt, trở lại gò lúc sáng; các đốt xương rời khỏi hàng.        |
| 12:58 | Các câu hỏi cuối hiện lần lượt.                                                |

## Mở và chỉnh

Từ `packages/example`, dùng tài nguyên đã tách trong `out/du-mot-dot-xuong/assets`:

```powershell
bunx remotion studio src/DuMotDotXuong/entry.tsx --no-open --public-dir=../../out/du-mot-dot-xuong/assets
```

Mở composition `DuMotDotXuong` theo URL CLI in ra, bấm **Play** hoặc **Space**.
`Film.tsx` chứa track cảnh và tiếng gốc. Nếu đổi thời gian của cảnh, cân nhắc
chỉnh cả track tiếng để giữ đồng bộ. `Opening.tsx` chứa hình xương, số đếm và
keyframe đoạn mở.

Trong **Default Props**, đổi `openingLabel` để sửa nhãn mở đầu hoặc tắt
`showCaptions` để ẩn lớp phụ đề dưới màn hình. Mặc định dùng ảnh chữ tách từ
mẫu để giữ đúng hình dạng và dấu tiếng Việt. Để thay chữ, thêm phần tử vào
`captionOverrides` theo số khung trong tên cue, ví dụ
`[{"frame":73,"text":"Hai bàn tay người ta có hai mươi tám đốt."}]`.
Dùng `text: ""` để ẩn riêng một cue. Các ô thoại nằm trong tranh của mẫu,
không thuộc track phụ đề.

## Tạo lại tài nguyên hoặc xuất

Tài nguyên nằm ngoài Git. Nếu cần tạo lại, chạy từ gốc repo, với Python có
NumPy và Pillow, cùng FFmpeg trên PATH. Dùng đúng tệp nguồn của bản dựng:

```powershell
python -X utf8 packages/example/src/DuMotDotXuong/prepare.py "<video-mau.mp4>" --public-dir out/du-mot-dot-xuong/assets
```

Khi muốn xuất MP4, bấm **Render** trong Studio hoặc chạy từ `packages/example`:

```powershell
bunx remotion render src/DuMotDotXuong/entry.tsx DuMotDotXuong ../../out/du-mot-dot-xuong/Du-mot-dot-xuong.mp4 --public-dir=../../out/du-mot-dot-xuong/assets
```
