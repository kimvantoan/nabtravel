const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function scrapeBookingDetails() {
    let browser;
    try {
        // CẤU HÌNH CHO TEST LOCAL
        browser = await puppeteer.launch({ 
            headless: false,
            channel: 'chrome',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        // Đọc danh sách đã cào
        const rawData = fs.readFileSync('all_hotels_booking_mapper.json');
        const hotels = JSON.parse(rawData);
        
        const detailedData = [];
        let startIndex = 0;
        
        if (fs.existsSync('hotel_booking_details_full.json')) {
            try {
                const existing = JSON.parse(fs.readFileSync('hotel_booking_details_full.json', 'utf8'));
                detailedData.push(...existing);
                startIndex = detailedData.length;
            } catch(e) {}
        }

        console.log(`Bắt đầu cào chi tiết: ${hotels.length} hotels. Đã cào trước: ${startIndex}...`);

        for (let i = startIndex; i < hotels.length; i++) {
            const hotel = hotels[i];
            console.log(`[${i+1}/${hotels.length}] Đang chui vào: ${hotel.name}`);
            
            try {
                await page.goto(hotel.source_url, { waitUntil: 'domcontentloaded', timeout: 45000 });
                
                // Trích xuất chi tiết
                const details = await page.evaluate(() => {
                    // 1. Overview (Mô tả)
                    const descEl = document.querySelector('[data-testid="property-description"]');
                    const overview = descEl ? descEl.innerText.trim() : '';

                    // 2. Amenities (Tiện nghi chính)
                    const amenities = [];
                    const amNodes = document.querySelectorAll('[data-testid="property-most-popular-facilities-wrapper"] li');
                    amNodes.forEach(n => amenities.push(n.innerText.trim()));

                    // 3. Room features (Loại phòng)
                    const rooms = [];
                    const roomNodes = document.querySelectorAll('.room-name-wrapper');
                    roomNodes.forEach(n => rooms.push(n.innerText.trim().replace(/\n/g, ' ')));

                    // 4. 10 ẢNH GALLERY ĐỘ PHÂN GIẢI CAO (High-Res)
                    // Bất chấp thay đổi giao diện, cứ nhặt toàn bộ thẻ img chứa link hotel bstatic
                    const gallery = [];
                    const allImgs = document.querySelectorAll('img');
                    allImgs.forEach(img => {
                        let src = img.src;
                        if (src && src.includes('images/hotel')) {
                            // Biến ảnh Thumbnail thành ảnh Full HD
                            src = src.replace(/square\d+|max\d+/g, 'max1024x768');
                            if (!gallery.includes(src)) gallery.push(src);
                        }
                    });

                    // Chỉ lấy 10 ảnh đẹp nhất
                    const top10Gallery = gallery.slice(0, 10);

                    return { overview, amenities, room_features: rooms, gallery: top10Gallery };
                });

                detailedData.push({
                    booking_id: hotel.booking_id,
                    ...details
                });

                // Lưu liên tục để tránh sập (Save continually)
                fs.writeFileSync('hotel_booking_details_full.json', JSON.stringify(detailedData, null, 2));

                // Nghỉ giải lao 2s để không bị Cloudflare phạt
                await new Promise(r => setTimeout(r, 2000));

            } catch (err) {
                console.error(`Lỗi tại khách sạn ${hotel.name}: `, err.message);
            }
        }

        console.log("Hoàn tất cào toàn bộ chi tiết!");

    } catch (e) {
        console.error(e);
    } finally {
        if (browser) await browser.close();
    }
}

scrapeBookingDetails();
