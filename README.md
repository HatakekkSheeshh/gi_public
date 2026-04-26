# GI

Ứng dụng web kỷ niệm gồm frontend React/Vite và backend FastAPI. Người dùng đăng nhập bằng tài khoản được cấu hình ở backend, sau đó được chuyển tới trang sách ảnh 3D hoặc trang hoa động.

## Tính năng chính

- Trang đăng nhập có chuyển đổi ngôn ngữ Anh, Đức, Việt.
- API đăng nhập bằng FastAPI tại `POST /api/login`.
- Chuyển hướng sau đăng nhập theo `redirectUrl` trong `backend/users.json`.
- Trang `/book` hiển thị sách ảnh 3D, lật trang, xem ảnh phóng to và phát video.
- Trang `/flower` nhúng hiệu ứng hoa động từ `frontend/public/flower/index.html`, có ảnh trung tâm, lời chúc và nhạc nền.

## Công nghệ sử dụng

- Frontend: React, Vite, CSS.
- Backend: FastAPI, Uvicorn, Pydantic.
- Media tĩnh: ảnh, video và audio đặt trong `frontend/public`.

## Cấu trúc thư mục

```text
.
├── backend
│   ├── main.py              # FastAPI app và API đăng nhập
│   ├── requirements.txt     # Dependencies Python
│   ├── users.json           # Danh sách tài khoản và URL chuyển hướng
│   └── Procfile             # Lệnh chạy backend khi deploy
└── frontend
    ├── src
    │   ├── App.jsx
    │   ├── config.js        # Cấu hình API backend
    │   ├── translations.json
    │   └── pages
    │       ├── LoginPage.jsx
    │       ├── BookPage.jsx
    │       └── FlowerPage.jsx
    ├── public
    │   ├── flower           # Trang hoa động
    │   ├── images           # Ảnh và video
    │   └── media/audio      # Nhạc nền
    ├── package.json
    └── vercel.json
```

## Yêu cầu cài đặt

- Node.js và npm.
- Python 3.10 trở lên.

## Chạy backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

Backend sẽ chạy tại:

```text
http://127.0.0.1:8001
```

API đăng nhập:

```text
POST http://127.0.0.1:8001/api/login
```

Body mẫu:

```json
{
  "username": "ten_dang_nhap",
  "password": "mat_khau"
}
```

## Chạy frontend

Mở terminal khác:

```powershell
cd frontend
npm install
npm run dev
```

Frontend mặc định chạy tại:

```text
http://localhost:5173
```

Các đường dẫn chính:

- `/`: trang đăng nhập.
- `/book`: trang sách ảnh.
- `/flower`: trang hoa động.

## Cấu hình API

Frontend đọc URL backend từ biến môi trường `VITE_API_BASE_URL`. Nếu không cấu hình, app dùng mặc định:

```text
http://127.0.0.1:8001
```

Có thể tạo file `frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8001
```

Khi deploy frontend riêng với backend, nhớ đổi `VITE_API_BASE_URL` sang URL backend thật.

## Cấu hình tài khoản

Danh sách tài khoản nằm trong:

```text
backend/users.json
```

Mỗi tài khoản có dạng:

```json
{
  "username": "ten_dang_nhap",
  "password": "mat_khau",
  "redirectUrl": "/book"
}
```

`redirectUrl` có thể trỏ tới `/book`, `/flower` hoặc đường dẫn khác trong frontend.

Lưu ý: file `users.json` hiện lưu mật khẩu dạng plain text. Nếu dùng cho môi trường thật, nên chuyển sang cơ sở dữ liệu, hash mật khẩu và không commit thông tin nhạy cảm vào repository.

## Lệnh hữu ích

Trong thư mục `frontend`:

```powershell
npm run dev      # Chạy frontend dev server
npm run build    # Build production
npm run preview  # Xem thử bản build
npm run lint     # Kiểm tra lint
```

Trong thư mục `backend`:

```powershell
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

## Deploy

Frontend có `frontend/vercel.json` để hỗ trợ SPA routing trên Vercel.

Backend có `backend/Procfile`:

```text
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

Khi deploy:

- Deploy backend trước và lấy URL public.
- Cấu hình `VITE_API_BASE_URL` cho frontend bằng URL backend.
- Đảm bảo backend cho phép CORS từ domain frontend.
- Trang hoa sử dụng một số thư viện tải từ CDN, nên trình duyệt cần truy cập internet để hiệu ứng hoạt động đầy đủ.

## Ghi chú media

Ảnh, video và audio nằm trong `frontend/public`, vì vậy có thể được tham chiếu trực tiếp bằng đường dẫn bắt đầu bằng `/`, ví dụ:

```text
/images/class_1.jpg
/flower/index.html
/media/audio/ten-file.mp3
```
