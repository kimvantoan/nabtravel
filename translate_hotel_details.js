const fs = require('fs');

const env = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
const keyMatch = env.match(/GEMINI_API_KEY=(.*)/);
const apiKey = keyMatch ? keyMatch[1].trim() : '';

if(!apiKey) {
    console.error("Missing GEMINI_API_KEY in .env");
    process.exit(1);
}

// 1. Data load
const masterHotels = JSON.parse(fs.readFileSync('master_hotels_merged.json', 'utf8'));
const bookingDetails = fs.existsSync('hotel_booking_details_full.json') ? JSON.parse(fs.readFileSync('hotel_booking_details_full.json', 'utf8')) : [];
const agodaDetails = fs.existsSync('hotel_agoda_details_full.json') ? JSON.parse(fs.readFileSync('hotel_agoda_details_full.json', 'utf8')) : [];

// Map
const bookingMap = new Map();
bookingDetails.forEach(d => bookingMap.set(d.booking_id, d));
const agodaMap = new Map();
agodaDetails.forEach(d => agodaMap.set(d.slug, d));

function removeAccents(str) {
    if(!str) return "";
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

let pendingList = [];
masterHotels.forEach(h => {
    let targetRaw = null;
    if (h.providers && h.providers.booking && bookingMap.has(h.providers.booking.id)) {
        targetRaw = bookingMap.get(h.providers.booking.id);
    } else if (h.providers && h.providers.agoda && agodaMap.has(h.slug)) {
        targetRaw = agodaMap.get(h.slug);
    }

    if (targetRaw) {
        h.gallery = targetRaw.gallery || [];
        
        // If not translated yet
        if (!h.overview || typeof h.overview === 'string' || !h.overview.en || h.overview.en === h.overview.vi || h.overview.en === removeAccents(h.overview.vi) || h.overview.en === h.raw_overview) {
             const rawOverview = targetRaw.overview || "";
             h.raw_overview = rawOverview.substring(0, 1500); // Truncate safety
             h.raw_amenities = (targetRaw.amenities || []).slice(0, 20); // Top 20

             // fallback
             h.overview = {en: removeAccents(h.raw_overview), vi: h.raw_overview};
             h.amenities = h.raw_amenities.map(a => ({en: removeAccents(a), vi: a}));

             pendingList.push({
                 id: h.slug,
                 overview: h.raw_overview,
                 amenities: h.raw_amenities
             });
        }
    }
});

fs.writeFileSync('master_hotels_merged.json', JSON.stringify(masterHotels, null, 2));
console.log(`Prepared master list. Added galleries and raw overviews. Total pending to translate: ${pendingList.length}`);

async function translateBatch(batch) {
    const prompt = `You are a professional travel copywriter and translator.
Translate the following array of hotel Overviews and Amenities.
CRITICAL RULES:
1. Return ONLY a valid JSON array matching the exact structure. No markdown formatting, no comments.
2. Output structure: [{ "id": "hotel-slug", "overview": {"en": "...", "vi": "..."}, "amenities": [{"en": "...", "vi": "..."}, ...] }]
3. Evaluate the language of the source text:
   - If the original text is primarily Vietnamese, keep it for "vi" and translate it into English for "en".
   - If the original text is primarily English, keep it for "en" and translate it into Vietnamese for "vi".
4. Ensure professional travel tone. For "vi", add "Khách sạn", "Resort", or appropriate designation if it's describing the property.

RAW BATCH:
${JSON.stringify(batch)}`;

    try {
        const fetch = (await import('node-fetch')).default || globalThis.fetch;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.1 }
            })
        });
        const json = await res.json();
        
        if (json.error) {
           console.error("API Error", json.error.message);
           return null;
        }

        const text = json.candidates[0].content.parts[0].text;
        let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch(err) {
        console.error("API/Parsing Error:", err.message);
        return null;
    }
}

async function run() {
    let chunkSize = 8; // Flash token output limit safe threshold
    
    for(let i=0; i<pendingList.length; i+=chunkSize) {
        let batch = pendingList.slice(i, i+chunkSize);
        console.log(`Translating batch ${Math.floor(i/chunkSize)+1}/${Math.ceil(pendingList.length/chunkSize)}...`);
        
        let attempts = 0;
        let transRes = null;
        
        while(!transRes && attempts < 3) {
            transRes = await translateBatch(batch);
            if(!transRes) {
                console.log("Retrying in 5 seconds...");
                attempts++;
                await new Promise(r => setTimeout(r, 5000));
            }
        }
        
        if(transRes) {
            transRes.forEach(t => {
                let target = masterHotels.find(h => h.slug === t.id);
                if(target) {
                    if(t.overview) target.overview = t.overview;
                    if(t.amenities) target.amenities = t.amenities;
                    delete target.raw_overview;
                    delete target.raw_amenities;
                }
            });
            
            let saveArr = masterHotels.map(h => {
                let c = {...h};
                delete c.raw_overview;
                delete c.raw_amenities;
                return c;
            });
            fs.writeFileSync('master_hotels_merged.json', JSON.stringify(saveArr, null, 2));
            console.log("-> Progress saved.");
        }
        
        await new Promise(r => setTimeout(r, 2000));
    }
    
    console.log("FULLY COMPLETED OVERVIEW & AMENITIES BILINGUAL TRANSLATION!");
}

run();
