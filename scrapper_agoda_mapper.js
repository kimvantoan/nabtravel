const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function scrapeAgodaHotels(url) {
    let browser;
    try {
        console.log("Khởi động Puppeteer (Chế độ ẩn danh Stealth)...");
        browser = await puppeteer.launch({ 
            headless: false, // Để False xem tận mắt Bot chạy
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        console.log(`Đang truy cập URL Agoda: ${url}`);
        
        // Agoda chặn bot khá rát nên phải có user agent xịn
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        await page.goto(url, { waitUntil: 'load', timeout: 60000 });

        // Chờ Agoda load các lưới Khách sạn. Agoda dùng JTSX class hoặc data-selenium="hotel-item"
        console.log("Đang quét DOM chờ thẻ Hotel Item hiển thị...");
        await page.waitForSelector('li.PropertyCardItem, [data-selenium="hotel-item"]', { timeout: 30000 }).catch(() => console.log("Không tìm thấy theo Selector nhanh, sẽ thử cuộn trang."));

        // Cuộn trang để kích hoạt Lazy Load của Agoda
        console.log("Đang tiến hành cuộn trang từ từ để load toàn bộ (Lazy load)...");
        for(let i=0; i<15; i++) {
            await page.evaluate(() => window.scrollBy(0, 400));
            await new Promise(r => setTimeout(r, 800));
        }

        // Bắt đầu cào
        console.log("Tiến hành bóc tách Dữ liệu Agoda...");
        const hotels = await page.evaluate(() => {
            const items = document.querySelectorAll('li.PropertyCardItem, [data-selenium="hotel-item"]');
            const data = [];

            items.forEach((e) => {
                // Tên khách sạn
                const nameEl = e.querySelector('h3[data-selenium="hotel-name"]') || e.querySelector('h3');
                const name = nameEl ? nameEl.innerText.trim() : null;
                
                // URL
                const anchor = e.querySelector('a.PropertyCard__Link, a[data-selenium="hotel-link"]') || e.querySelector('a');
                let source_url = anchor ? anchor.href : null;
                if(source_url && !source_url.startsWith('http')) {
                    source_url = "https://www.agoda.com" + source_url;
                }
                // Cắt bỏ tracking id lằng nhằng của AgodaURL
                if (source_url && source_url.includes('?')) {
                     source_url = source_url.split('?')[0]; 
                }

                // Điểm đánh giá (Review Score) & Số review
                const scoreEl = e.querySelector('[data-selenium="rating-wrapper"] .Box-sc-kv6pi1-0') || e.querySelector('.ReviewScore-Number');
                const score = scoreEl ? parseFloat(scoreEl.innerText.replace(',', '.')) || null : null;
                
                const reviewCountEl = e.querySelector('[data-selenium="reviews-count"]') || e.querySelector('.ReviewScore-TextCount');
                let reviews = null;
                if (reviewCountEl) {
                    const rText = reviewCountEl.innerText.trim();
                    const rMatch = rText.replace(/,/g, '').match(/\d+/);
                    if(rMatch) reviews = parseInt(rMatch[0]);
                }

                // Giá tiền
                const priceEl = e.querySelector('[data-selenium="display-price"]') || e.querySelector('.PropertyCardPrice__Value');
                let price = null;
                if (priceEl) {
                    const pText = priceEl.innerText.trim();
                    const pMatch = pText.replace(/\./g, '').replace(/,/g, '').match(/\d+/); // 1.500.000 -> 1500000
                    if (pMatch) price = parseInt(pMatch[0]);
                }
                
                // Cố định base Location từ URL truyền vào (hoặc chích xuất)
                const locEl = e.querySelector('[data-selenium="area-city-text"]') || e.querySelector('.PropertyCardItem__Area');
                const location = locEl ? locEl.innerText.trim() : "Hà Giang";

                if (name && source_url) {
                    data.push({
                        platform: "agoda",
                        name: name,
                        agoda_url: source_url,
                        price: price,
                        rating: score,
                        reviews: reviews,
                        location: location
                    });
                }
            });
            return data;
        });

        console.log(`Tìm thấy ${hotels.length} khách sạn trên trang này của Agoda.`);

        fs.writeFileSync('all_hotels_agoda_mapper.json', JSON.stringify(hotels, null, 2));
        console.log("XONG! Đã lưu kết quả vào all_hotels_agoda_mapper.json");

    } catch (e) {
        console.error("Lỗi cào Agoda: ", e);
    } finally {
        if (browser) await browser.close();
    }
}

// Bắt đầu cào Agoda với URL Client đưa
const TARGET_URL = "https://www.agoda.com/vi-vn/search?guid=999e60e8-0489-4fff-9394-2063598b8f7a&lastSearchedCity=204060&asq=DGdSYo0CvFm6Ih0NBpaAPpufa9Vwpz6XltTHq4n%2B9gN5ZZLftax4Zadaq%2Flw%2FZyNNbgam3mvoD5rz0KxG9WMMzxkkzM9ts4lwl1p9yKRqf5b9ffxbkneE%2FZ0zuclMBj7hjtxPlKr6IBg244BbYOe1G0t3c82nJ%2Fp%2B0GXkwK5hQ%2FMfbNApeOOpgQdWbpjpH%2FgADO3woCmKZz8U0VduBT1wFur%2Ftc%2B54Iv4fnCDM4f8d8%3D&city=204060&tick=639112561722&locale=vi-vn&ckuid=a7ca1070-82f3-4117-83ed-64165f41ea55&prid=0&gclid=CjwKCAjw-dfOBhAjEiwAq0RwI3-o_AnJ6262ZrFHCTyGu0Vv1UE78JfTRGh05sd5q9TTxWU-eFGALhoC8YAQAvD_BwE&currency=VND&correlationId=f8f0b2ff-01bc-4d50-894f-b30494ff2301&analyticsSessionId=778770588115438118&pageTypeId=103&realLanguageId=24&languageId=24&origin=VN&stateCode=HN&cid=1922896&tag=7adbeb35-4108-414c-9559-32893b4cdfe5&userId=a7ca1070-82f3-4117-83ed-64165f41ea55&whitelabelid=1&loginLvl=0&storefrontId=3&currencyId=7&currencyCode=VND&htmlLanguage=vi-vn&cultureInfoName=vi-vn&machineName=hk-pc-2f-acm-web-user-75fdd84df9-ccx77&trafficGroupId=5&trafficSubGroupId=122&aid=82361&useFullPageLogin=true&cttp=4&isRealUser=true&mode=production&browserFamily=Chrome&cdnDomain=agoda.net&checkIn=2026-04-13&checkOut=2026-04-14&rooms=1&adults=2&children=0&priceCur=VND&los=1&textToSearch=H%C3%A0+Giang&travellerType=1&familyMode=off&ds=eCJrLlPTA1vCPGu4&hotelStarRating=4,5&hotelReviewScore=9&productType=-1";

scrapeAgodaHotels(TARGET_URL);
