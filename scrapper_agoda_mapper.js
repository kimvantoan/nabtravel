const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const DESTINATIONS = [
    { name: "Hà Nội", city: 2758 },
    { name: "Hạ Long", city: 17190 },
    { name: "Sa Pa", city: 22352 },
    { name: "Hà Giang", city: 204060 },
    { name: "Ninh Bình", city: 18274 },
    { name: "Đà Nẵng", city: 16440 },
    { name: "Hội An", city: 16430 },
    { name: "Huế", city: 16434 },
    { name: "Phong Nha", city: 102434 },
    { name: "Nha Trang", city: 2679 },
    { name: "Hồ Chí Minh", city: 13170 },
    { name: "Phú Quốc", city: 17188 },
    { name: "Đà Lạt", city: 15932 },
    { name: "Cần Thơ", city: 17182 },
    { name: "Vũng Tàu", city: 17198 }
];

// Custom authenticated URL dynamically generated in the loop

async function scrapeAllDestinations() {
    let browser;
    try {
        console.log("Khởi động Puppeteer (Chế độ Stealth đa tỉnh thành)...");
        browser = await puppeteer.launch({
            headless: false,
            executablePath: '/usr/bin/google-chrome',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        const allHotels = [];

        for (let i = 0; i < DESTINATIONS.length; i++) {
            const destObj = DESTINATIONS[i];
            const dest = destObj.name;
            const cityId = destObj.city;
            console.log(`\n======================================================`);
            console.log(`[${i + 1}/${DESTINATIONS.length}] Đang cào khu vực: ${dest} (City ID: ${cityId})`);
            console.log(`======================================================`);

            const url = `https://www.agoda.com/search?city=${cityId}&locale=vi-vn&ckuid=ac842da0-7b5a-4529-a5ed-bda39ad136d0&prid=0&gclid=CjwKCAjw-dfOBhAjEiwAq0RwI9wOEa0kcIO7raxBOp6P5Nh2PBBuKgpkcNthsDmyhd26BSLro521XxoCCU4QAvD_BwE&currency=VND&correlationId=62b49a87-b055-4f37-bb36-d1cafc976dfd&analyticsSessionId=843916968329029012&pageTypeId=1&realLanguageId=24&languageId=24&origin=VN&stateCode=HN&cid=1922896&tag=7adbeb35-4108-414c-9559-32893b4cdfe5&userId=ac842da0-7b5a-4529-a5ed-bda39ad136d0&whitelabelid=1&loginLvl=0&storefrontId=3&currencyId=78&currencyCode=VND&htmlLanguage=vi-vn&cultureInfoName=vi-vn&memberId=601026204&machineName=hk-pc-2h-acm-web-user-5cb4b6db96-whvxf&trafficGroupId=5&trafficSubGroupId=122&aid=82361&useFullPageLogin=true&cttp=4&isRealUser=true&mode=production&browserFamily=Chrome&cdnDomain=agoda.net&checkIn=2026-04-17&checkOut=2026-04-18&rooms=1&adults=2&children=0&priceCur=VND&los=1&textToSearch=${encodeURIComponent(dest)}&travellerType=1&familyMode=off&ds=mXhG%2BJ3mSizRsG%2Bp&hotelStarRating=4,5&hotelReviewScore=9&productType=-1`;
            console.log(`Truy cập: ${url}`);

            try {
                await page.goto(url, { waitUntil: 'load', timeout: 60000 });
            } catch (err) {
                console.error(`Lỗi tải trang cho ${dest}, bỏ qua...`);
                continue;
            }

            console.log("Đang chờ DOM Hotel Item (Nếu thấy Captcha bảo mật trên màn hình Chrome, hãy giải trong 60s)...");
            await page.waitForSelector('h3[data-selenium="hotel-name"]', { timeout: 60000 }).catch(() => console.log("Hết thời gian chờ Captcha (hoặc mốc hotel-name), chuyển sang Lazy load..."));

            console.log("Đang cuộn trang để kích hoạt Lazy load...");
            for (let k = 0; k < 15; k++) {
                try {
                    await page.evaluate(() => window.scrollBy(0, 400));
                    await new Promise(r => setTimeout(r, 800));
                } catch (error) {
                    console.log("Trang đang refresh (Datadome đang chuyển hướng), chờ 3s...");
                    await new Promise(r => setTimeout(r, 3000));
                }
            }

            console.log("Tiến hành bóc tách Dữ liệu Agoda...");
            let hotels = [];
            try {
                hotels = await page.evaluate((destinationName) => {
                const items = document.querySelectorAll('li.PropertyCardItem, [data-selenium="hotel-item"]');
                const data = [];

                items.forEach((e) => {
                    const nameEl = e.querySelector('h3[data-selenium="hotel-name"]') || e.querySelector('h3');
                    const name = nameEl ? nameEl.innerText.trim() : null;

                    const anchor = e.querySelector('a.PropertyCard__Link, a[data-selenium="hotel-link"]') || e.querySelector('a');
                    let source_url = anchor ? anchor.href : null;
                    if (source_url && !source_url.startsWith('http')) {
                        source_url = "https://www.agoda.com" + source_url;
                    }
                    if (source_url && source_url.includes('?')) {
                        source_url = source_url.split('?')[0];
                    }

                    let score = null;
                    const rMatch = e.innerText.match(/(\d[\.,]\d+)\s*(?:Tuyệt hảo|Xuất sắc|Trên cả tuyệt vời|Tuyệt vời|Rất tốt|Tốt|Đặc biệt|Hoàn hảo|Khá|Hài lòng|Xuất chúng)/i);
                    if (rMatch) score = parseFloat(rMatch[1].replace(',', '.'));

                    let reviews = null;
                    const revMatch = e.innerText.match(/([\d\.,]+)\s*(?:bài đánh giá|đánh giá|nhận xét)/i);
                    if (revMatch) reviews = parseInt(revMatch[1].replace(/[\.,]/g, ''));

                    let price = null;
                    const allNumbers = e.innerText.match(/(?:\d{1,3}(?:[\.,]\d{3})+)/g);
                    if (allNumbers) {
                        const maxVal = Math.max(...allNumbers.map(n => parseInt(n.replace(/[\.,]/g, ''))));
                        if (maxVal > 50000) price = maxVal;
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
            } catch (err) {
                console.error("Lỗi khi đánh giá evaluate (có thể do load trang lúc đang tính toán):", err.message);
            }

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
