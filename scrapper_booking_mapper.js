const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const DESTINATIONS = [
  "Hà Nội", "Hạ Long", "Sa Pa", "Hà Giang", "Ninh Bình",
  "Đà Nẵng", "Hội An", "Huế", "Phong Nha", "Nha Trang",
  "Hồ Chí Minh", "Phú Quốc", "Đà Lạt", "Cần Thơ", "Vũng Tàu"
];

// URL do người dùng cung cấp (đã cắt phần rác ssne và dest_id để tìm tự do cho mọi tỉnh)
const BASE_URL = "https://www.booking.com/searchresults.vi.html?label=gen173nr-10CAEoggI46AdIM1gEaPQBiAEBmAEzuAEXyAEM2AED6AEB-AEBiAIBqAIBuALL0sHOBsACAdICJGI0NzE0YzQ3LTc1NzAtNGE2My1iM2Y1LTMyMTc0ZjQ5MmQ3MdgCAeACAQ&aid=304142&lang=vi&src=index&checkin=2026-04-15&checkout=2026-04-18&group_adults=2&no_rooms=1&group_children=0&nflt=class%3D4%3Bclass%3D5%3Breview_score%3D90&ss=";

async function scrapeBookingMaster() {
    let browser;
    try {
        console.log("Khởi động Puppeteer (Chế độ Stealth Booking đa khu vực)...");
        browser = await puppeteer.launch({ 
            headless: false, // Hiện Browser để vượt Captcha thủ công nếu bị Cloudflare làm khó
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        const allHotels = [];

        for (let i = 0; i < DESTINATIONS.length; i++) {
            const dest = DESTINATIONS[i];
            console.log(`\n======================================================`);
            console.log(`[${i + 1}/${DESTINATIONS.length}] BOOKING -> Đang cào khu vực: ${dest}`);
            console.log(`======================================================`);
            
            const url = BASE_URL + encodeURIComponent(dest + ", Việt Nam");
            console.log(`Truy cập: ${url}`);
            
            try {
                await page.goto(url, { waitUntil: 'load', timeout: 60000 });
                
                // Tắt các popup làm phiền của Booking (nếu có)
                await page.evaluate(() => {
                    const btn = document.querySelector('button[aria-label="Bỏ qua thông báo đăng nhập"], button[aria-label="Dismiss sign-in info."]');
                    if (btn) btn.click();
                }).catch(() => {});
                
            } catch (err) {
                console.error(`Lỗi tải trang cho ${dest}, bỏ qua...`);
                continue;
            }

            console.log("Đang chờ DOM Hotel Item...");
            await page.waitForSelector('[data-testid="property-card"]', { timeout: 30000 }).catch(() => console.log("Không tìm thấy Box, chuyển sang Lazy load..."));

            console.log("Đang cuộn trang để kích hoạt Lazy load...");
            for (let k = 0; k < 12; k++) {
                await page.evaluate(() => window.scrollBy(0, 600));
                await new Promise(r => setTimeout(r, 800));
            }

            console.log("Tiến hành bóc tách Dữ liệu Booking...");
            const hotels = await page.evaluate((destinationName) => {
                const items = document.querySelectorAll('[data-testid="property-card"]');
                const data = [];

                items.forEach((e) => {
                    const nameEl = e.querySelector('[data-testid="title"]');
                    const name = nameEl ? nameEl.innerText.trim() : null;
                    
                    const anchor = e.querySelector('a[data-testid="title-link"]');
                    let source_url = anchor ? anchor.href : null;
                    if (source_url && source_url.includes('?')) {
                         source_url = source_url.split('?')[0]; 
                    }

                    const scoreEl = e.querySelector('[data-testid="review-score"] > div:first-child');
                    const score = scoreEl ? parseFloat(scoreEl.innerText.replace(',', '.')) : null;
                    
                    const reviewCountEl = e.querySelector('[data-testid="review-score"]');
                    let reviews = null;
                    if (reviewCountEl && reviewCountEl.innerText.includes('đánh giá')) {
                        const t = reviewCountEl.innerText.match(/(\d[\d\.]*)\s+đánh giá/);
                        if(t) reviews = parseInt(t[1].replace(/\./g, ''));
                    }

                    const priceEl = e.querySelector('[data-testid="price-and-discounted-price"]');
                    let price = null;
                    if (priceEl) {
                        const pText = priceEl.innerText.trim();
                        const pMatch = pText.replace(/\./g, '').replace(/,/g, '').match(/\d+/);
                        if (pMatch) price = parseInt(pMatch[0]);
                    }
                    
                    const imgEl = e.querySelector('[data-testid="image"]');
                    let photo_url = null;
                    if (imgEl) {
                        photo_url = imgEl.src || imgEl.getAttribute('data-src');
                        if (photo_url && photo_url.includes('square')) {
                            photo_url = photo_url.replace(/square\d+/g, 'max1024x768');
                        }
                    }

                    if (name && source_url) {
                        // Trích xuất Slug tự động
                        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                        // Sinh mã định danh BKG_ + Slug ngắn + Mã màu ngẫu nhiên (chống trùng map)
                        const id = "BKG_" + slug.substring(0, 15) + "_" + Math.floor(Math.random() * 9000 + 1000);
                        
                        data.push({
                            booking_id: id,
                            name: name,
                            slug: slug,
                            city_location: destinationName,
                            photoUrl: photo_url,
                            rating: score,
                            totalReviews: reviews,
                            price_per_night: price,
                            source_url: source_url
                        });
                    }
                });
                return data;
            }, dest);

            // Xoá bớt trùng lặp trên cùng 1 trang (đôi khi Booking render 2 khung)
            const uniqueHotels = [];
            hotels.forEach(h => {
                if(!allHotels.find(ex => ex.name === h.name) && !uniqueHotels.find(u => u.name === h.name)) {
                   uniqueHotels.push(h);
                }
            });

            console.log(`-> Kéo thêm được: ${uniqueHotels.length} khách sạn Booking tại ${dest}.`);
            allHotels.push(...uniqueHotels);

            fs.writeFileSync('all_hotels_booking_mapper.json', JSON.stringify(allHotels, null, 2));
            console.log(`-> Tổng tích lũy Booking: ${allHotels.length} khách sạn đã được cào!`);

            console.log("Đang nghỉ 8s tránh Booking chặn Captcha...");
            await new Promise(r => setTimeout(r, 8000));
        }

        console.log("\n🎉 HOÀN TẤT CÀO BOOKING 15 TỈNH! File tổng hợp là: all_hotels_booking_mapper.json");

    } catch (e) {
        console.error("LỖI SYSTEM: ", e);
    } finally {
        if (browser) await browser.close();
    }
}

scrapeBookingMaster();
