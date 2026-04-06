import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const checkin = searchParams.get('checkin');
  const checkout = searchParams.get('checkout');
  const adults = searchParams.get('adults') || '2';
  const rooms = searchParams.get('rooms') || '1';

  if (!city) {
    return NextResponse.json({ error: 'Missing city param' }, { status: 400 });
  }

  try {
    const rapidKey = process.env.RAPID_API_KEY || "";
    
    // 1. Fetch Destination ID for the city
    const destRes = await fetch(`https://apidojo-booking-v1.p.rapidapi.com/locations/auto-complete?text=${encodeURIComponent(city)}&languagecode=en-us`, {
      headers: { "X-RapidAPI-Key": rapidKey, "X-RapidAPI-Host": "apidojo-booking-v1.p.rapidapi.com" },
      // Cache this mapping for a month to save requests!
      next: { revalidate: 2592000 }
    });

    if (!destRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch destination ID', bulkPrices: [] }, { status: destRes.status });
    }

    const destData = await destRes.json();
    // Find the city or region to get bulk listings
    const location = destData?.find((d: any) => d.dest_type === 'city' || d.dest_type === 'region') || destData?.[0];

    if (!location || !location.dest_id) {
      return NextResponse.json({ error: 'City not found', bulkPrices: [] }, { status: 404 });
    }

    const destId = location.dest_id;
    const destType = location.dest_type || 'city';
    
    let arr = checkin;
    let dep = checkout;
    
    if (!arr || !dep) {
       const tmr = new Date(); tmr.setDate(tmr.getDate() + 8);
       const dayAfter = new Date(); dayAfter.setDate(dayAfter.getDate() + 9);
       arr = tmr.toISOString().split('T')[0];
       dep = dayAfter.toISOString().split('T')[0];
    }

    // 2. Fetch Bulk Properties List for that destination (1 Request fetches ~30-50 hotels!)
    // Note: If you are using v2/list, the endpoint is properties/v2/list. Otherwise properties/list.
    const priceRes = await fetch(`https://apidojo-booking-v1.p.rapidapi.com/properties/list?dest_id=${destId}&search_type=${destType}&arrival_date=${arr}&departure_date=${dep}&adults=${adults}&room_qty=${rooms}&languagecode=en-us&currency_code=VND`, {
      headers: { "X-RapidAPI-Key": rapidKey, "X-RapidAPI-Host": "apidojo-booking-v1.p.rapidapi.com" },
      // Cache list results for 15 minutes to prevent rapid reload drain
      next: { revalidate: 900 }
    });

    if (!priceRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch bulk prices', bulkPrices: [] }, { status: priceRes.status });
    }

    const priceData = await priceRes.json();
    const hotels = priceData.result || priceData.results || [];
    
    // Map the bloated RapidAPI data down to exactly what the frontend needs
    const bulkPrices = hotels.map((h: any) => {
       // Support multiple possible fields from different Booking API versions
       const rawPrice = h.composite_price_breakdown?.gross_amount?.value || h.price_breakdown?.gross_price || h.min_total_price;
       return {
         id: h.hotel_id,
         name: h.hotel_name || h.name,
         price: rawPrice,
         currency: h.composite_price_breakdown?.gross_amount?.currency || h.currencycode || 'VND'
       };
    }).filter((h: any) => h.price);

    return NextResponse.json({ 
      bulkPrices,
      metadata: {
        destination_id: destId,
        destination_name: location.name,
        total_found: bulkPrices.length
      }
    });

  } catch (error) {
    console.error("Bulk Pricing API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', bulkPrices: [] }, { status: 500 });
  }
}
