import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  
  if (!name) return NextResponse.json({ error: 'Missing name param' }, { status: 400 });

  try {
    // 1. Locate hotel dest_id by name
    const destRes = await fetch(`https://apidojo-booking-v1.p.rapidapi.com/locations/auto-complete?text=${encodeURIComponent(name)}&languagecode=en-us`, {
      headers: {
        "X-RapidAPI-Key": process.env.RAPID_API_KEY || "",
        "X-RapidAPI-Host": "apidojo-booking-v1.p.rapidapi.com"
      },
      next: { revalidate: 2592000 } // Cache 1 tháng — dest_id của hotel không bao giờ đổi
    });
    
    if (!destRes.ok) throw new Error("Autocomplete API failed");
    
    const destData = await destRes.json();
    const hotel = destData?.find((d: any) => d.dest_type === 'hotel');
    if (!hotel || !hotel.dest_id) {
       return NextResponse.json({ error: 'Hotel not found on Booking' }, { status: 404 });
    }
    
    // 2. Fetch price for tomorrow
    const tmr = new Date(); tmr.setDate(tmr.getDate() + 8); // +8 days to ensure availability
    const dayAfter = new Date(); dayAfter.setDate(dayAfter.getDate() + 9);
    
    const arr = tmr.toISOString().split('T')[0];
    const dep = dayAfter.toISOString().split('T')[0];
    
    const priceRes = await fetch(`https://apidojo-booking-v1.p.rapidapi.com/properties/detail?hotel_id=${hotel.dest_id}&arrival_date=${arr}&departure_date=${dep}&adults=2&room_qty=1&languagecode=en-us&currency_code=VND`, {
      headers: {
        "X-RapidAPI-Key": process.env.RAPID_API_KEY || "",
        "X-RapidAPI-Host": "apidojo-booking-v1.p.rapidapi.com"
      },
      next: { revalidate: 3600 } // Cache price for 1 hour to prevent API exhausting during viewings
    });
    
    if (!priceRes.ok) throw new Error("Price API failed");

    const priceData = await priceRes.json();
    const hotelP = priceData[0];
    
    const priceVal = hotelP?.composite_price_breakdown?.gross_amount_per_night?.value 
        || hotelP?.composite_price_breakdown?.gross_amount?.value
        || hotelP?.product_price_breakdowns?.[0]?.gross_amount_per_night?.value;

    if (priceVal) {
      // 3. Fire & Forget: Sync price to DB asynchronously
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
      fetch(`${backendUrl}/api/hotels/sync-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          booking_id: hotel.dest_id,
          price: priceVal
        })
      }).catch(err => console.error("Failed to sync price to DB:", err));

      return NextResponse.json({ 
        price: priceVal,
        currency: hotelP?.composite_price_breakdown?.gross_amount_per_night?.currency || 'VND'
      });
    }

    return NextResponse.json({ error: 'No price found' }, { status: 404 });
  } catch (error) {
    console.error("List Pricing API Error:");
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
