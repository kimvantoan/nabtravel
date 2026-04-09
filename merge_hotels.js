const fs = require('fs');

// ==== 1. Jaro-Winkler Distance Implementation ====
function jaroWinkler(s1, s2) {
    if (s1 === s2) return 1.0;
    
    let len1 = s1.length, len2 = s2.length;
    if (len1 === 0 || len2 === 0) return 0.0;
    
    let matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;
    let s1Matches = new Array(len1).fill(false);
    let s2Matches = new Array(len2).fill(false);
    
    let matches = 0;
    let transpositions = 0;
    
    for (let i = 0; i < len1; i++) {
        let start = Math.max(0, i - matchDistance);
        let end = Math.min(i + matchDistance + 1, len2);
        
        for (let j = start; j < end; j++) {
            if (s2Matches[j]) continue;
            if (s1[i] !== s2[j]) continue;
            s1Matches[i] = true;
            s2Matches[j] = true;
            matches++;
            break;
        }
    }
    
    if (matches === 0) return 0.0;
    
    let k = 0;
    for (let i = 0; i < len1; i++) {
        if (!s1Matches[i]) continue;
        while (!s2Matches[k]) k++;
        if (s1[i] !== s2[k]) transpositions++;
        k++;
    }
    transpositions /= 2.0;
    
    let jaro = ((matches / len1) + (matches / len2) + ((matches - transpositions) / matches)) / 3.0;
    
    let prefix = 0;
    for (let i = 0; i < Math.min(4, Math.min(len1, len2)); i++) {
        if (s1[i] === s2[i]) prefix++;
        else break;
    }
    
    return jaro + prefix * 0.1 * (1 - jaro);
}

function cleanString(str) {
    if (!str) return "";
    return str.toLowerCase()
        .replace(/hotel|resort|spa|boutique|halong|ha long|cruise|bay|luxury/g, '')
        .replace(/[^a-z0-9]/g, '');
}

function isMatch(name1, name2) {
    let cl1 = cleanString(name1);
    let cl2 = cleanString(name2);
    if(cl1.length < 3 || cl2.length < 3) return false;
    let score = jaroWinkler(cl1, cl2);
    return score > 0.85;
}

// ==== 2. Core Variables ====
const bookingFile = 'all_hotels_booking_mapper.json';
const agodaFile = 'all_hotels_agoda_mapper.json';

const bookingData = JSON.parse(fs.readFileSync(bookingFile, 'utf8'));
const agodaData = JSON.parse(fs.readFileSync(agodaFile, 'utf8'));

// Slugify func
function slugify(text) {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')           
      .replace(/[^\w\-]+/g, '')       
      .replace(/\-\-+/g, '-');        
}

let masterArray = [];

console.log(`Starting merge process -> Booking: ${bookingData.length} items | Agoda: ${agodaData.length} items`);

// Push Booking First
bookingData.forEach(b => {
    masterArray.push({
        raw_name: b.name,
        slug: b.slug || slugify(b.name),
        raw_location: b.city_location,
        image: b.image_url,
        average_rating: b.rating,
        providers: {
            booking: {
                id: b.booking_id,
                url: b.source_url,
                price: b.price_per_night,
                rating: b.rating,
                reviews: b.totalReviews
            }
        }
    });
});

let duplicateCount = 0;
let uniqueAgoda = 0;

// Reconcile Agoda
agodaData.forEach(a => {
    let matchedIndex = -1;
    let highestScore = 0;
    
    const clA = cleanString(a.name);
    
    // Attempt match
    for(let i=0; i<masterArray.length; i++) {
        const clB = cleanString(masterArray[i].raw_name);
        if(clA.length > 3 && clB.length > 3) {
            let score = jaroWinkler(clA, clB);
            if(score > 0.88 && score > highestScore) {
                highestScore = score;
                matchedIndex = i;
            }
        }
    }
    
    if(matchedIndex !== -1) {
        // MATCH FOUND! Combine into Master Array
        masterArray[matchedIndex].providers.agoda = {
            url: a.agoda_url,
            price: a.price,
            rating: a.rating,
            reviews: a.reviews
        };
        duplicateCount++;
    } else {
        // UNIQUE AGODA HOTEL!
        masterArray.push({
            raw_name: a.name,
            slug: slugify(a.name),
            raw_location: a.location,
            image: a.photo_url,
            average_rating: a.rating,
            providers: {
                agoda: {
                    url: a.agoda_url,
                    price: a.price,
                    rating: a.rating,
                    reviews: a.reviews
                }
            }
        });
        uniqueAgoda++;
    }
});

console.log(`Merge finished! Duplicates merged: ${duplicateCount}. Unique Agoda added: ${uniqueAgoda}. Total unique Master properties: ${masterArray.length}`);


// ==== 3. Gemini Translation Runner ====
const env = fs.readFileSync('.env', 'utf8');
const keyMatch = env.match(/GEMINI_API_KEY=(.*)/);
const apiKey = keyMatch ? keyMatch[1].trim() : '';

if(!apiKey) {
    console.error("Missing API Key");
    process.exit(1);
}

async function translateChunk(chunkId, list) {
    const prompt = `Translate this batch of Hotel Names and Locations into English and Vietnamese.
CRITICAL RULES:
1. Return ONLY a pure JSON array (no markdown, no backticks).
2. Format: [{ "id": ID, "name": {"en": "...", "vi": "..."}, "location": {"en": "...", "vi": "..."} }]
3. For name.vi: YOU MUST add an appropriate Vietnamese designation like "Khách sạn", "Khu nghỉ dưỡng", "Homestay", "Tiệm" etc. at the beginning, even if the English name is kept (e.g. "Bungalow Tam Coc Sweet Shelter").
4. For location.en: YOU MUST REMOVE all Vietnamese tones and diacritics! For example, "Ninh Bình" becomes "Ninh Binh", "Hà Nội" becomes "Hanoi".
5. For location.vi: Keep the proper Vietnamese tones!

RAW DATA BATCH:
${JSON.stringify(list.map(l => ({id: l.id, name: l.name, loc: l.loc})), null, 2)}`;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45000); // 45 seconds timeout
        
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.1 }
            }),
            signal: controller.signal
        });
        clearTimeout(timeout);
        
        const json = await res.json();
        const text = json.candidates[0].content.parts[0].text;
        
        let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch(err) {
        console.error(`Chunk ${chunkId} error:`, err.message);
        return null;
    }
}

function removeAccents(str) {
    if(!str) return "";
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

function saveProgress() {
    let output = masterArray.map(h => {
        let copy = {...h};
        delete copy.temp_id;
        delete copy.raw_name;
        delete copy.raw_location;
        // fallback if AI hasn't translated yet
        if(!copy.name) copy.name = {en: h.raw_name, vi: h.raw_name};
        if(!copy.location) copy.location = {en: removeAccents(h.raw_location || ""), vi: h.raw_location || ""};
        return copy;
    });
    fs.writeFileSync('master_hotels_merged.json', JSON.stringify(output, null, 2));
}

async function run() {
    console.log("Saving initial merged master file...");
    masterArray.forEach((h, i) => h.temp_id = i + 1);
    saveProgress();

    console.log("Starting bilingual translation process using Gemini...");
    
    let chunkSize = 150; // Increased batch size for speed
    for(let i = 0; i < masterArray.length; i += chunkSize) {
        let sli = masterArray.slice(i, i + chunkSize);
        console.log(`Translating batch ${Math.floor(i/chunkSize)+1}/${Math.ceil(masterArray.length/chunkSize)}...`);
        
        let chunkData = sli.map(s => ({id: s.temp_id, name: s.raw_name, loc: s.raw_location}));
        let attempts = 0;
        let transRes = null;
        
        while(!transRes && attempts < 3) {
            transRes = await translateChunk(Math.floor(i/chunkSize)+1, chunkData);
            if(!transRes) {
                console.log("Retrying...");
                attempts++;
                await new Promise(r => setTimeout(r, 6000));
            }
        }
        
        if(transRes) {
            // Reconcile translations back to masterArray
            transRes.forEach(t => {
                let target = masterArray.find(m => m.temp_id === t.id);
                if(target) {
                    target.name = t.name;
                    target.location = t.location;
                }
            });
            saveProgress();
            console.log("Progress continuously saved to master_hotels_merged.json");
        }
        // Small rate limit throttle
        await new Promise(r => setTimeout(r, 2000)); 
    }
    
    console.log("SUCCESS! Saved nicely to master_hotels_merged.json.");
}

run();
