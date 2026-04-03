# 🚀 Hướng Dẫn Deploy NabTravel lên Namecheap Shared Hosting

> **Hosting**: Namecheap Shared Hosting (cPanel + Phusion Passenger)  
> **Frontend**: Next.js 16 — Standalone Build  
> **Backend**: Laravel 11 — PHP native trên hosting  

---

## 📋 Yêu cầu

- **Máy local**: Node.js >= 18, npm
- **Hosting**: Namecheap Shared Hosting với "Setup Node.js App" trong cPanel
- **Node.js trên hosting**: Chọn version `20.x` hoặc `22.x`

---

## I. DEPLOY FRONTEND (Next.js)

### Bước 1: Build & Đóng gói — Chạy trên máy local

Chạy script tự động:

```powershell
.\scripts\deploy.ps1
```

Script sẽ tự động:
1. ✅ Build Next.js ở chế độ `standalone`
2. ✅ Copy `public/` và `.next/static/` vào package
3. ✅ Copy `app.js` (Passenger entry point)
4. ✅ Tạo file `nabtravel-deploy.zip`

**Hoặc build thủ công:**

```powershell
# 1. Build
npm run build

# 2. Copy static assets vào standalone
Copy-Item -Recurse -Force "public" ".next\standalone\public"
Copy-Item -Recurse -Force ".next\static" ".next\standalone\.next\static"

# 3. Copy entry point cho Passenger
Copy-Item -Force "app.js" ".next\standalone\app.js"

# 4. Nén thành ZIP
Compress-Archive -Path ".next\standalone\*" -DestinationPath "nabtravel-deploy.zip" -Force
```

---

### Bước 2: Upload lên Hosting

1. Đăng nhập **cPanel** Namecheap
2. Mở **File Manager**
3. Tạo folder mới: `/home/username/nabtravel`
   > ⚠️ **NGOÀI `public_html`** — không upload vào public_html!
4. Upload `nabtravel-deploy.zip` vào `/home/username/nabtravel`
5. Click phải → **Extract** → giải nén tại chỗ

Sau khi giải nén:
```
/home/username/nabtravel/
├── app.js              ← Passenger entry point
├── server.js           ← Next.js server (tự động tạo bởi build)
├── package.json
├── node_modules/       ← Chỉ chứa deps cần thiết
├── public/
│   └── images/         ← 20 ảnh PNG
└── .next/
    └── static/         ← CSS, JS bundles
```

---

### Bước 3: Setup Node.js App trong cPanel

1. Mở **"Setup Node.js App"** trong cPanel
2. Click **"+ CREATE APPLICATION"**
3. Điền:

| Trường | Giá trị |
|---|---|
| Node.js Version | `20.20` (hoặc cao hơn, tối thiểu 18.x) |
| Application Mode | `Production` |
| Application Root | `nabtravel` |
| Application URL | Chọn domain (vd: `nabtravel.vn`) |
| Application Startup File | `app.js` |

4. Click **"CREATE"**

---

### Bước 4: Thêm Environment Variables

Trong giao diện "Setup Node.js App", phần **"Environment Variables"**, thêm:

| Variable | Value | Ghi chú |
|---|---|---|
| `NODE_ENV` | `production` | Bắt buộc |
| `RAPID_API_KEY` | `your_key` | API key cho Travel Advisor |
| `NEXT_PUBLIC_BACKEND_URL` | `https://api.nabtravel.vn` | URL đến backend Laravel |
| `FRONTEND_URL` | `https://nabtravel.vn` | URL frontend |

> 💡 `PORT` KHÔNG cần thêm — Passenger tự quản lý.

---

### Bước 5: Start App

Click **"START APP"** → Truy cập domain để kiểm tra.

---

## II. DEPLOY BACKEND (Laravel)

Backend Laravel chạy PHP native trên Namecheap (không cần Node.js).

### Cách 1: Subdomain (Khuyến nghị)

1. Trong cPanel → **Subdomains** → Tạo `api.nabtravel.vn`
2. Document Root trỏ đến: `/home/username/api.nabtravel.vn/public`
3. Upload toàn bộ code `be-nabravel/` vào `/home/username/api.nabtravel.vn/`
4. Cấu hình `.env`:
   ```env
   APP_NAME=NabTravel-API
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://api.nabtravel.vn
   
   DB_CONNECTION=mysql
   DB_HOST=localhost
   DB_DATABASE=your_db_name
   DB_USERNAME=your_db_user
   DB_PASSWORD=your_db_pass
   
   OPENAI_API_KEY=your_openai_key
   ```
5. Chạy migration qua **Terminal** trong cPanel (hoặc SSH):
   ```bash
   cd ~/api.nabtravel.vn
   php artisan migrate --force
   php artisan config:cache
   php artisan route:cache
   ```

### Cách 2: Subfolder

Nếu không muốn tạo subdomain, có thể đặt backend trong subfolder của domain chính và cấu hình proxy. Tuy nhiên **cách subdomain** đơn giản và sạch hơn.

---

## III. CẬP NHẬT CODE (Re-deploy)

Mỗi lần có thay đổi code:

```powershell
# 1. Chạy script deploy
.\scripts\deploy.ps1

# 2. Upload nabtravel-deploy.zip mới lên cPanel
# 3. Extract đè lên folder cũ
# 4. Trong "Setup Node.js App" → click "RESTART"
```

Hoặc restart nhanh qua SSH:
```bash
mkdir -p ~/nabtravel/tmp && touch ~/nabtravel/tmp/restart.txt
```

---

## IV. TROUBLESHOOTING

### Lỗi 503 — Service Unavailable
- App chưa start hoặc bị crash
- **Fix**: Vào "Setup Node.js App" → Stop → đợi 5 giây → Start

### Lỗi 500 — Internal Server Error
- Kiểm tra `app.js` và `server.js` có tồn tại trong Application Root
- Kiểm tra Node.js version >= 18
- Xem logs: cPanel → **Errors** hoặc `/home/username/logs/`

### Ảnh / CSS không load
- Chưa copy `public/` và `.next/static/` → chạy lại script deploy
- Kiểm tra file có trong `/home/username/nabtravel/public/` không

### API calls thất bại
- Kiểm tra `NEXT_PUBLIC_BACKEND_URL` đúng URL
- Kiểm tra backend Laravel đã online chưa
- Kiểm tra CORS: thêm middleware CORS trong Laravel nếu FE/BE khác domain

### App chạy chậm (Cold Start)
- **Đây là hạn chế của shared hosting** — Passenger "ngủ" app khi không có traffic
- Request đầu tiên sau idle có thể mất 5-10 giây
- Không có cách fix trên shared hosting — cần VPS nếu muốn tốc độ tốt hơn

---

## V. LƯU Ý VỀ SHARED HOSTING

| Giới hạn | Ảnh hưởng |
|---|---|
| RAM ~1-2GB | App nặng có thể bị kill |
| Không build trên server | Phải build local, upload ZIP |
| Cold start 5-10s | Request đầu tiên chậm |
| Không hỗ trợ WebSocket | Không dùng được real-time features |
| Image Optimization hạn chế | Đã tắt (`unoptimized: true`) trong config |

> 💡 **Khi nào nên nâng cấp lên VPS?**
> - Khi traffic > 1000 visits/ngày
> - Khi cần WebSocket / real-time
> - Khi cold start gây ảnh hưởng UX
> - Khi cần CI/CD tự động
