const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const DESTINATIONS = [
  "Hà Nội", "Hạ Long", "Sa Pa", "Hà Giang", "Ninh Bình",
  "Đà Nẵng", "Hội An", "Huế", "Phong Nha", "Nha Trang",
  "Hồ Chí Minh", "Phú Quốc", "Đà Lạt", "Cần Thơ", "Vũng Tàu"
];

// URL chuẩn loại bỏ rác textToSearch cũ ở đuôi, ta sẽ nối thẳng tên tỉnh vào
const BASE_URL = "https://www.agoda.com/vi-vn/search?guid=999e60e8-0489-4fff-9394-2063598b8f7a&lastSearchedCity=204060&asq=DGdSYo0CvFm6Ih0NBpaAPpufa9Vwpz6XltTHq4n%2B9gN5ZZLftax4Zadaq%2Flw%2FZyNNbgam3mvoD5rz0KxG9WMMzxkkzM9ts4lwl1p9yKRqf5b9ffxbkneE%2FZ0zuclMBj7hjtxPlKr6IBg244BbYOe1G0t3c82nJ%2Fp%2B0GXkwK5hQ%2FMfbNApeOOpgQdWbpjpH%2FgADO3woCmKZz8U0VduBT1wFur%2Ftc%2B54Iv4fnCDM4f8d8%3D&city=204060&tick=639112561722&locale=vi-vn&ckuid=a7ca1070-82f3-4117-83ed-64165f41ea55&prid=0&gclid=CjwKCAjw-dfOBhAjEiwAq0RwI3-o_AnJ6262ZrFHCTyGu0Vv1UE78JfTRGh05sd5q9TTxWU-eFGALhoC8YAQAvD_BwE&currency=VND&correlationId=f8f0b2ff-01bc-4d50-894f-b30494ff2301&analyticsSessionId=778770588115438118&pageTypeId=103&realLanguageId=24&languageId=24&origin=VN&stateCode=HN&cid=1922896&tag=7adbeb35-4108-414c-9559-32893b4cdfe5&userId=a7ca1070-82f3-4117-83ed-64165f41ea55&whitelabelid=1&loginLvl=0&storefrontId=3&currencyId=7&currencyCode=VND&htmlLanguage=vi-vn&cultureInfoName=vi-vn&machineName=hk-pc-2f-acm-web-user-75fdd84df9-ccx77&trafficGroupId=5&trafficSubGroupId=122&aid=82361&useFullPageLogin=true&cttp=4&isRealUser=true&mode=production&browserFamily=Chrome&cdnDomain=agoda.net&checkIn=2026-04-13&checkOut=2026-04-14&rooms=1&adults=2&children=0&priceCur=VND&los=1&hotelStarRating=4,5&hotelReviewScore=9&productType=-1&textToSearch=";

async function scrapeAllDestinations() {
    let browser;
    try {
        console.log("Khởi động Puppeteer (Chế độ Stealth đa tỉnh thành)...");
        browser = await puppeteer.launch({ 
            headless: false, // Để False xem tận mắt Bot chạy
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
            console.log(`[${i + 1}/${DESTINATIONS.length}] Đang cào khu vực: ${dest}`);
            console.log(`======================================================`);
            
            const url = BASE_URL + encodeURIComponent(dest);
            console.log(`Truy cập: ${url}`);
            
            try {
                await page.goto(url, { waitUntil: 'load', timeout: 60000 });
            } catch (err) {
                console.error(`Lỗi tải trang cho ${dest}, bỏ qua...`);
                continue;
            }

            console.log("Đang chờ DOM Hotel Item...");
            await page.waitForSelector('li.PropertyCardItem, [data-selenium="hotel-item"]', { timeout: 30000 }).catch(() => console.log("Không tìm thấy Box, chuyển sang Lazy load..."));

            console.log("Đang cuộn trang để kích hoạt Lazy load...");
            for(let k=0; k<15; k++) {
                await page.evaluate(() => window.scrollBy(0, 400));
                await new Promise(r => setTimeout(r, 800));
            }

            console.log("Tiến hành bóc tách Dữ liệu Agoda...");
            const hotels = await page.evaluate((destinationName) => {
                const items = document.querySelectorAll('li.PropertyCardItem, [data-selenium="hotel-item"]');
                const data = [];

                items.forEach((e) => {
                    const nameEl = e.querySelector('h3[data-selenium="hotel-name"]') || e.querySelector('h3');
                    const name = nameEl ? nameEl.innerText.trim() : null;
                    
                    const anchor = e.querySelector('a.PropertyCard__Link, a[data-selenium="hotel-link"]') || e.querySelector('a');
                    let source_url = anchor ? anchor.href : null;
                    if(source_url && !source_url.startsWith('http')) {
                        source_url = "https://www.agoda.com" + source_url;
                    }
                    if (source_url && source_url.includes('?')) {
                         source_url = source_url.split('?')[0]; 
                    }

                    const scoreEl = e.querySelector('[data-selenium="rating-wrapper"] .Box-sc-kv6pi1-0') || e.querySelector('.ReviewScore-Number');
                    const score = scoreEl ? parseFloat(scoreEl.innerText.replace(',', '.')) || null : null;
                    
                    const reviewCountEl = e.querySelector('[data-selenium="reviews-count"]') || e.querySelector('.ReviewScore-TextCount');
                    let reviews = null;
                    if (reviewCountEl) {
                        const rText = reviewCountEl.innerText.trim();
                        const rMatch = rText.replace(/,/g, '').match(/\d+/);
                        if(rMatch) reviews = parseInt(rMatch[0]);
                    }

                    const priceEl = e.querySelector('[data-selenium="display-price"]') || e.querySelector('.PropertyCardPrice__Value');
                    let price = null;
                    if (priceEl) {
                        const pText = priceEl.innerText.trim();
                        const pMatch = pText.replace(/\./g, '').replace(/,/g, '').match(/\d+/); // 1.500.000 -> 1500000
                        if (pMatch) price = parseInt(pMatch[0]);
                    }
                    
                    const locEl = e.querySelector('[data-selenium="area-city-text"]') || e.querySelector('.PropertyCardItem__Area');
                    const location = locEl ? locEl.innerText.trim() : destinationName;

                    const imgEl = e.querySelector('img.SquareImage, .PropertyCardImage img') || e.querySelector('img');
                    let photo_url = null;
                    if (imgEl) {
                        photo_url = imgEl.src || imgEl.getAttribute('data-src') || null;
                        if (photo_url && photo_url.includes('square')) {
                            photo_url = photo_url.replace(/square\d+/g, 'max1024x768');
                        }
                    }

                    if (name && source_url) {
                        data.push({
                            platform: "agoda",
                            name: name,
                            agoda_url: source_url,
                            price: price,
                            rating: score,
                            reviews: reviews,
                            location: location,
                            photo_url: photo_url
                        });
                    }
                });
                return data;
            }, dest);

            console.log(`-> Tìm thấy ${hotels.length} khách sạn tại ${dest}.`);
            allHotels.push(...hotels);

            // Ghi file liên tục phòng trừ sự cố crash ngang
            fs.writeFileSync('all_hotels_agoda_mapper.json', JSON.stringify(allHotels, null, 2));
            console.log(`-> Tổng tích lũy: ${allHotels.length} khách sạn đã được cào!`);

            // Giải lao 10s để Agoda không khóa cổ
            console.log("Đang nghỉ 10s tránh CAPTCHA...");
            await new Promise(r => setTimeout(r, 10000));
        }

        console.log("\n🎉 XONG TOÀN TẬP! Đã lưu mọi dữ liệu vào all_hotels_agoda_mapper.json");

    } catch (e) {
        console.error("LỖI SYSTEM: ", e);
    } finally {
        if (browser) await browser.close();
    }
}

scrapeAllDestinations();
