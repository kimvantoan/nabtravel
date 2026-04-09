import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('hotel_name');
  const arrival_date = searchParams.get('arrival_date');
  const departure_date = searchParams.get('departure_date');
  const adults = searchParams.get('adults') || '2';
  const rooms = searchParams.get('rooms') || '1';
  const lang = searchParams.get('lang') || 'en-us';

  if (!name || !arrival_date || !departure_date) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  const rapidApiKey = '98deebd14bmshfe2c94696bb0db1p1b634bjsnd1dc46b841f3';
  const rapidApiHost = 'agoda-com.p.rapidapi.com';

  try {
    // 1. Search for hotel ID
    const searchRes = await fetch(`https://agoda-com.p.rapidapi.com/hotels/auto-complete?query=${encodeURIComponent(name)}`, {
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': rapidApiHost
      },
      next: { revalidate: 86400 } // Cache id search
    });

    if (!searchRes.ok) throw new Error('Agoda autocomplete failed');
    const searchData = await searchRes.json();
    const hotel = searchData.places?.find((p: any) => p.typeId === 4) || searchData.places?.[0];

    if (!hotel || (!hotel.id && !hotel.city?.id)) {
      return NextResponse.json({ error: 'Hotel not found on Agoda' }, { status: 404 });
    }

    // 2. Fetch prices
    // Agoda RapidAPI primarily supports City IDs for availability search (e.g. 1_318).
    // We try to use the city ID if available, otherwise fallback to the hotel ID (with prefix 1_ or 0_)
    const searchId = hotel.city?.id ? `1_${hotel.city.id}` : (hotel.typeId === 1 ? hotel.id : `1_${hotel.id}`);

    let priceData: any = {};
    const priceRes = await fetch(`https://agoda-com.p.rapidapi.com/hotels/search-overnight?id=${searchId}&checkinDate=${arrival_date}&checkoutDate=${departure_date}&adults=${adults}&rooms=${rooms}&currency=VND`, {
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': rapidApiHost
      },
      next: { revalidate: 60 } // Cache price 60s
    });

    if (priceRes.ok) {
      priceData = await priceRes.json();
    } else {
      // Fallback: try raw ID if searchId failed
      const fallbackRes = await fetch(`https://agoda-com.p.rapidapi.com/hotels/search-overnight?id=${hotel.id}&checkinDate=${arrival_date}&checkoutDate=${departure_date}&adults=${adults}&rooms=${rooms}&currency=VND`, {
        headers: { 'x-rapidapi-key': rapidApiKey, 'x-rapidapi-host': rapidApiHost },
        next: { revalidate: 60 }
      });
      if (fallbackRes.ok) priceData = await fallbackRes.json();
    }


    // Recursive find price (since Agoda JSON structure is complex)
    let bestPrice: number | null = null;
    let currency = 'VND';

    function extractPrice(obj: any, path: string = '') {
      if (!obj) return;
      // Prefer perRoomPerNight -> perNight -> price
      if (typeof obj.perRoomPerNight === 'number' && obj.perRoomPerNight > 0) {
        if (!bestPrice || obj.perRoomPerNight < bestPrice) bestPrice = obj.perRoomPerNight;
      } else if (path.includes('perRoomPerNight') && typeof obj.display === 'number' && obj.display > 0) {
        if (!bestPrice || obj.display < bestPrice) bestPrice = obj.display;
      } else if (typeof obj.taxInclusive === 'number' && obj.taxInclusive > 0) {
        if (!bestPrice || obj.taxInclusive < bestPrice) bestPrice = obj.taxInclusive;
      } else if (typeof obj.price === 'number' && obj.price > 0) {
        if (!bestPrice || obj.price < bestPrice) bestPrice = obj.price;
      } else if (typeof obj.display === 'number' && obj.display > 0) {
        if (!bestPrice || obj.display < bestPrice) bestPrice = obj.display;
      }

      for (const k in obj) {
        if (k === 'currency' && typeof obj[k] === 'string' && obj[k].length === 3) {
          currency = obj[k];
        }
        if (typeof obj[k] === 'object' && obj[k] !== null) {
          extractPrice(obj[k], path + '.' + k);
        }
      }
    }

    // Agoda API returns data in .data.citySearch.properties or .data.properties
    const allProperties = priceData?.data?.citySearch?.properties || priceData?.data?.properties || [];

    // Try to find the exact property first
    let targetProperty = allProperties.find((p: any) => p.propertyId === hotel.id);

    // Fallback: If not found, use name similarity
    if (!targetProperty && allProperties.length > 0) {
      const cleanName = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
      const targetClean = cleanName(name);

      targetProperty = allProperties.find((p: any) => {
        const pName = p.content?.informationSummary?.displayName || p.content?.informationSummary?.defaultName || '';
        const pClean = cleanName(pName);
        return pClean.includes(targetClean) || targetClean.includes(pClean);
      });
    }

    // If no matching property is found (due to Agoda's City API pagination), we throw an error 
    // to let the frontend simulate a structurally accurate Agoda price instead of pulling a random cheap hostel
    // We attach the direct Agoda Hotel link so the simulated UI can still redirect seamlessly to the actual place
    const agodaDirectUrl = `https://www.agoda.com/partners/partnersearch.aspx?cid=1&hid=${hotel.agoda_id || hotel.id}&checkin=${arrival_date}&checkout=${departure_date}&adults=${adults}&rooms=${rooms}`;

    if (!targetProperty) {
      return NextResponse.json({
        error: 'Price not found for these dates on Agoda',
        url: agodaDirectUrl
      }, { status: 404 });
    }

    const realPropertyName = targetProperty?.content?.informationSummary?.displayName
      || targetProperty?.content?.informationSummary?.defaultName
      || name;

    const propertyToExtract = [targetProperty];
    extractPrice(propertyToExtract);

    if (bestPrice) {
      // Fire & Forget DB Sync (Optional)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      fetch(`${backendUrl}/api/hotels/sync-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          agoda_id: hotel.id.toString(),
          agoda_price: bestPrice
        })
      }).catch(err => console.error("Failed to sync Agoda price to DB:", err));

      return NextResponse.json({
        price_per_night: bestPrice,
        total_price: bestPrice,
        currency: currency,
        url: agodaDirectUrl,
        has_breakfast: false,
        is_free_cancellable: false
      });
    }

    return NextResponse.json({ error: 'Price not found for these dates on Agoda' }, { status: 404 });
  } catch (error) {
    console.error("Agoda Pricing API Error:", error);
    const fallbackUrl = `https://www.agoda.com/search?text=${encodeURIComponent(name || 'Hotel')}`;
    return NextResponse.json({
      error: 'Failed to fetch Agoda price (Quota/API Error)',
      url: fallbackUrl
    }, { status: 404 });
  }
}
