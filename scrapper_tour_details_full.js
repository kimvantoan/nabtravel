const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const sharp = require('sharp');

async function downloadImage(url, filename, imageDir) {
    try {
        const localPath = path.join(imageDir, filename);
        if (fs.existsSync(localPath)) return `storage/tours/${filename}`;

        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!res.ok) return null;
        const buffer = Buffer.from(await res.arrayBuffer());

        try {
            const metadata = await sharp(buffer).metadata();
            if (metadata.height > 60) {
                await sharp(buffer)
                    .extract({ left: 0, top: 0, width: metadata.width, height: metadata.height - 40 })
                    .toFile(localPath);
                return `storage/tours/${filename}`;
            } else {
                fs.writeFileSync(localPath, buffer);
                return `storage/tours/${filename}`;
            }
        } catch (e) {
            fs.writeFileSync(localPath, buffer);
            return `storage/tours/${filename}`;
        }
    } catch(err) {
        return null;
    }
}

async function scrapeTour(t, imageDir) {
    const url = t.source_url;
    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36' }
        });

        if (!response.ok) return null;

        const html = await response.text();
        const $ = cheerio.load(html);

        let group_size = '';
        let meals_summary = '';
        let operator = 'BestPrice Travel';

        $('li, .tour-info, .tour-info-list div, p').each((i, el) => {
            const text = $(el).text().replace(/\s+/g, ' ').trim();
            if (text.startsWith('Meals:') || text.includes('Breakfasts') || text.includes('Lunches')) {
                if(!meals_summary && text.length < 100) meals_summary = text.replace('Meals:', '').trim();
            }
            if (/group size/i.test(text) || /pax/i.test(text)) {
                const gMatch = text.match(/Group Size\s*:\s*([^<]+)/i);
                if (gMatch && !group_size && gMatch[1].length < 100) group_size = gMatch[1].trim();
                else if (!group_size && text.length < 50) group_size = text.replace(/Group size\s*:/i, '').trim();
            }
        });

        if (!meals_summary) {
            const bodyText = $('body').text().replace(/\s+/g, ' ');
            const mMatch = bodyText.match(/Meals:\s*([^G]+)(Group Size|Route|Duration|$)/i);
            if (mMatch) meals_summary = mMatch[1].trim();
        }

        if(meals_summary.startsWith('Meals:')) meals_summary = meals_summary.replace('Meals:', '').trim();
        if(group_size.startsWith('Group Size:')) group_size = group_size.replace('Group Size:', '').trim();

        const overview = $('.tour_overview').text().trim() || $('.cruise_overview__info').text().trim();
        
        const rawImages = new Set();
        $('img').each((idx, el) => {
            const src = $(el).attr('data-src') || $(el).attr('src') || $(el).attr('data-original');
            if (src && src.includes('bestprice') && src.includes('.jpg')) rawImages.add(src);
            else if (src && src.includes('cloudfront.net') && src.includes('.jpg')) rawImages.add(src);
        });
        const imgUrls = Array.from(rawImages).slice(0, 15);
        const localPaths = [];
        for (let j = 0; j < imgUrls.length; j++) {
            const l = await downloadImage(imgUrls[j], `${t.id}_img_${j}.jpg`, imageDir);
            if (l) localPaths.push(l);
        }

        const itinerary = [];
        $('.itinerary-box').each((idx, el) => {
            const title = $(el).find('.itinerary-title').text().trim().split('\n')[0];
            const content = $(el).find('.itinerary-content').text().trim().replace(/\s+/g, ' ');
            if (title && content) itinerary.push({ day: idx + 1, title: title, description: content });
        });

        const inclusions = [];
        $('.list-inclusions li, .inclusions ul li, .tour-inclusions li').each((idx, el) => {
            const t = $(el).text().trim();
            if(t && t.length > 5) inclusions.push(t);
        });

        const exclusions = [];
        $('.list-exclusions li, .exclusions ul li, .tour-exclusions li, .exclusion-list li').each((idx, el) => {
            const t = $(el).text().trim();
            if(t && t.length > 5) exclusions.push(t);
        });
        if (exclusions.length === 0) {
            exclusions.push("Visa stamping fee at the embassy");
            exclusions.push("International flight tickets");
            exclusions.push("Personal expenses, tips and gratuities");
        }

        const highlights = [];
        $('.list-highlights li, .highlights ul li, .tour-highlights li').each((idx, el) => {
            const t = $(el).text().trim();
            if(t && t.length > 5) highlights.push(t);
        });
        if (highlights.length === 0 && itinerary.length > 0) {
            itinerary.slice(0, 4).forEach(it => highlights.push(it.title));
        }

        const policies = [];
        $('.list-policies li, .policies ul li, .tour-policy p').each((idx, el) => {
            const t = $(el).text().trim();
            if(t && t.length > 5) policies.push(t);
        });
        if (policies.length === 0) {
            policies.push("Cancellations within 30 days of departure are subject to a fee.");
            policies.push("Children under 4 years old share bed with parents.");
        }

        const faqs = [];
        $('.faq-item, .accordion-item, .qa-item').each((idx, el) => {
            const q = $(el).find('h3, .question, .accordion-header').text().trim();
            const a = $(el).find('.answer, .accordion-body, p').text().trim();
            if (q && a) faqs.push({ question: q, answer: a });
        });
        if (faqs.length === 0) {
            faqs.push({ question: "Is this tour customizable?", answer: "Yes, our travel experts can tailor this itinerary to your needs." });
            faqs.push({ question: "Are international flights included?", answer: "No, you will need to book your own international flights." });
        }

        const prices = [];
        $('table.table-striped tbody tr, #price-table tr, table.table-price-inclusion tbody tr').each((i, el) => {
            const cells = $(el).find('td');
            if (cells.length > 0) {
                const tierName = $(cells[0]).text().trim();
                const priceText = $(cells[cells.length - 1]).text().replace(/\s+/g, ' ').trim();
                if (tierName && priceText && tierName.length > 3) {
                    prices.push({ tier: tierName, price: priceText });
                }
            }
        });

        return {
            tour_id: t.tour_id,
            overview_text: overview || 'Wonderful Vietnam Tour.',
            highlights: JSON.stringify(highlights),
            inclusions: JSON.stringify(inclusions),
            exclusions: JSON.stringify(exclusions),
            policies_json: JSON.stringify(policies),
            faqs_json: JSON.stringify(faqs),
            prices_json: JSON.stringify(prices),
            itinerary_json: JSON.stringify(itinerary),
            gallery_json: JSON.stringify(localPaths),
            meals_summary: meals_summary || 'Depends on itinerary',
            group_size: group_size || 'Private or Small Group',
            meeting_point: 'Hotel in city center',
            end_point: 'Hotel in city center',
            operator: operator
        };

    } catch (e) {
        return null;
    }
}

async function scrapeAll() {
    const rawData = fs.readFileSync('tours_to_scrape.json', 'utf8');
    const toursInfo = JSON.parse(rawData);
    const imageDir = path.join(__dirname, 'be-nabravel/storage/app/public/tours');
    if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

    console.log(`Bắt đầu cào data cho ${toursInfo.length} tours (concurrency 10)...`);

    const scrapedDetails = [];
    
    // Process in chunks of 20
    const chunkSize = 20;
    for (let i = 0; i < toursInfo.length; i += chunkSize) {
        console.log(`Tiến độ: ${i}/${toursInfo.length}...`);
        const chunk = toursInfo.slice(i, i + chunkSize);
        const results = await Promise.all(chunk.map(t => scrapeTour(t, imageDir)));
        results.filter(r => r !== null).forEach(r => scrapedDetails.push(r));
    }

    fs.writeFileSync('tour_details_full.json', JSON.stringify(scrapedDetails, null, 2));
    console.log(`Đã xuất ra tour_details_full.json với ${scrapedDetails.length} dòng.`);
}

scrapeAll();
