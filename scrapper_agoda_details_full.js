const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const CONCURRENCY = 6; // Bật 6 tab song song cùng cày

async function scrapeAgodaDetails() {
    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: false,
            channel: 'chrome',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080', '--disable-dev-shm-usage']
        });

        if (!fs.existsSync('master_hotels_merged.json')) {
            console.log("Không tìm thấy master_hotels_merged.json. Vui lòng chạy merge_hotels.js trước!");
            return;
        }

        const rawData = JSON.parse(fs.readFileSync('master_hotels_merged.json', 'utf8'));
        
        // 1. CHỈ lôi ra các khách sạn ĐỘC QUYỀN của Agoda (Khuyết Booking)
        const targetHotels = rawData.filter(h => h.providers && h.providers.agoda && h.providers.agoda.url && !h.providers.booking);
        
        let detailedData = [];
        const existingSlugs = new Set();
        
        if (fs.existsSync('hotel_agoda_details_full.json')) {
            try {
                const existing = JSON.parse(fs.readFileSync('hotel_agoda_details_full.json', 'utf8'));
                detailedData.push(...existing);
                existing.forEach(h => {
                    if (h.slug) existingSlugs.add(h.slug);
                });
            } catch(e) {}
        }

        console.log(`Bắt đầu Cào Turbo: ${targetHotels.length} Độc quyền Agoda. Bỏ qua các hotel trùng Booking.`);
        console.log(`Đã cào trước đó: ${detailedData.length}`);

        // Chunk array to process N at a time
        for (let i = 0; i < targetHotels.length; i += CONCURRENCY) {
            const chunk = targetHotels.slice(i, i + CONCURRENCY);
            console.log(`\n--- Phóng mẻ ${Math.floor(i/CONCURRENCY) + 1}/${Math.ceil(targetHotels.length/CONCURRENCY)} [Tiến trình: ${i}/${targetHotels.length}] ---`);

            await Promise.all(chunk.map(async (hotel) => {
                const hotelSlug = hotel.slug;
                const hotelName = hotel.name && typeof hotel.name === 'object' ? hotel.name.en : hotel.name;
                
                if (existingSlugs.has(hotelSlug)) {
                    console.log(`[Bỏ qua] ${hotelName} (Đã có sẵn trong file JSON)`);
                    return;
                }

                if(detailedData.some(d => d.slug === hotelSlug)) {
                    return;
                }

                console.log(`[Đang bào Tab rễ] -> ${hotelName}`);
                let page;
                try {
                    page = await browser.newPage();
                    await page.setDefaultNavigationTimeout(45000); 
                } catch(err) {
                    console.log(`[Lỗi Trình Duyệt] Không thể mở tab mới cho ${hotelName}: ${err.message}`);
                    return; // Skip this one for now to avoid crashing the whole batch
                }

                try {
                    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
                    await page.goto(hotel.providers.agoda.url, { waitUntil: 'domcontentloaded', timeout: 35000 });
                    
                    // Fast Fail: Chỉ cho nó 20s để tìm load. Nếu mạng lag/xoay quá 20s -> Giết tab để load hotel khác!
                    try {
                        await page.waitForSelector('.hotel-description, #hotel-description, [data-element-name="property-short-description"], .sc-dntaoT', { timeout: 20000 });
                    } catch(e) {
                        console.log(`[Timeout Fast-fail] Mạng chậm hoặc Datadome chặn tại ${hotelName}. Bỏ qua cào sau.`);
                        return;
                    }

                    // Cuộn nhanh qua React/Vue Components
                    await page.evaluate(async () => {
                        for(let t=0; t<5; t++){ window.scrollBy(0,800); await new Promise(r=>setTimeout(r,400)); }
                    });
                    
                    const details = await page.evaluate(() => {
                        let overview = null;
                        const descEl = document.querySelector('[data-selenium="hotel-description"], .hotel-description, #hotel-description, [data-element-name="property-short-description"]');
                        if (descEl) overview = descEl.innerText.trim();
                        else {
                            const ps = document.querySelectorAll('p, span, div');
                            for (let p of ps) {
                                if (!p.children || p.children.length === 0) {
                                    const txt = p.innerText ? p.innerText.trim() : (p.textContent ? p.textContent.trim() : '');
                                    if (txt.length > 200 && !txt.includes('{') && !txt.includes('function') && !txt.includes('Nhập tên')) {
                                        overview = txt; break;
                                    }
                                }
                            }
                        }

                        const targetKeywords = ['wifi', 'hồ bơi', 'bể bơi', 'spa', 'lễ tân', 'phòng gym', 'thể dục', 'nhà hàng', 'đưa đón', 'bãi đậu xe', 'biển', 'giặt', 'bar', 'thang máy', 'buffet', 'điều hòa', 'an ninh', 'internet'];
                        const amenities = [];
                        const otherAmenities = [];
                        const amNodes = document.querySelectorAll('[data-selenium="facility-item"], [data-element-name="facility-title"], [data-element-name="property-feature"], .property-amenities li, li span, div span');
                        amNodes.forEach(n => {
                            const txt = n.innerText ? n.innerText.trim() : (n.textContent ? n.textContent.trim() : '');
                            if(txt && txt.length > 2 && txt.length < 50 && !amenities.includes(txt) && !otherAmenities.includes(txt)) {
                                if (targetKeywords.some(k => txt.toLowerCase().includes(k))) amenities.push(txt);
                                else otherAmenities.push(txt);
                            }
                        });
                        for (let txt of otherAmenities) {
                            if (amenities.length >= 8) break;
                            if (!txt.match(/\d+\s*(m|km)/i) && !txt.toLowerCase().includes('tiếng')) amenities.push(txt);
                        }

                        const gallery = [];
                        const allImgs = document.querySelectorAll('img');
                        allImgs.forEach(img => {
                            let src = img.src || img.getAttribute('data-src');
                            if (src && src.includes('hotelImages')) {
                                src = src.replace(/square\d+/g, 'max1024x768').replace(/max\d+/g, 'max1024x768').replace(/\?ce=\d+/, '?ce=0');
                                if (!gallery.includes(src)) gallery.push(src);
                            }
                        });

                        return { overview, amenities: amenities.slice(0,18), gallery: gallery.slice(0, 10) };
                    });

                    if (details.overview || (details.gallery && details.gallery.length > 0)) {
                        detailedData.push({ slug: hotelSlug, name: hotelName, ...details });
                        existingSlugs.add(hotelSlug);
                        console.log(`   [OK] Lấy được ${details.gallery.length} ảnh từ ${hotelName}`);
                    } else {
                        console.log(`   [FAILED] Cào dính data Null tại ${hotelName}`);
                    }
                } catch (err) {
                    console.log(`   [Lỗi Tải Trang] ${hotelName} -> ${err.message.substring(0,60)}...`);
                } finally {
                    await page.close(); // Giải phóng RAM triệt để
                }
            }));
            
            // Xong cả 4 tabs thì mới save vào file json 1 lần (Tránh Crash fs lock)
            fs.writeFileSync('hotel_agoda_details_full.json', JSON.stringify(detailedData, null, 2));
        }

        console.log("+++ HOÀN TẤT CHIẾN DỊCH TURBO SCRAPE TOÀN BỘ AGODA ! +++");

    } catch (e) {
        console.error(e);
    } finally {
        if (browser) await browser.close();
    }
}

scrapeAgodaDetails();
