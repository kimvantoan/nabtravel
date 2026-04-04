import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const checkin = searchParams.get('checkin');
  const checkout = searchParams.get('checkout');
  const adults = searchParams.get('adults') || '2';
  const rooms = searchParams.get('rooms') || '1';
  
  if (!name) return NextResponse.json({ error: 'Missing name param' }, { status: 400 });

  try {
    const tmr = new Date(); tmr.setDate(tmr.getDate() + 8); // +8 days to ensure availability
    const dayAfter = new Date(); dayAfter.setDate(dayAfter.getDate() + 9);
    
    // Use selected checkin/checkout or default to +8/+9 days
    const arr = checkin || tmr.toISOString().split('T')[0];
    const dep = checkout || dayAfter.toISOString().split('T')[0];

    let priceVal = null;
    let currency = 'VND';
    let hotelIdForSync = '';

    const rapidKey = process.env.RAPID_API_KEY || "";

    // 1. TIER 1: Booking.com Search
    try {
      const destRes = await fetch(`https://apidojo-booking-v1.p.rapidapi.com/locations/auto-complete?text=${encodeURIComponent(name)}&languagecode=en-us`, {
        headers: { "X-RapidAPI-Key": rapidKey, "X-RapidAPI-Host": "apidojo-booking-v1.p.rapidapi.com" },
        next: { revalidate: 2592000 }
      });
      
      if (destRes.ok) {
        const destData = await destRes.json();
        const hotel = destData?.find((d: any) => d.dest_type === 'hotel');
        if (hotel && hotel.dest_id) {
          hotelIdForSync = hotel.dest_id.toString();
          
          const priceRes = await fetch(`https://apidojo-booking-v1.p.rapidapi.com/properties/detail?hotel_id=${hotel.dest_id}&arrival_date=${arr}&departure_date=${dep}&adults=${adults}&room_qty=${rooms}&languagecode=en-us&currency_code=VND`, {
            headers: { "X-RapidAPI-Key": rapidKey, "X-RapidAPI-Host": "apidojo-booking-v1.p.rapidapi.com" },
            next: { revalidate: 3600 }
          });
          
          if (priceRes.ok) {
            const priceData = await priceRes.json();
            const hotelP = priceData[0];
            priceVal = hotelP?.composite_price_breakdown?.gross_amount?.value 
                || hotelP?.composite_price_breakdown?.gross_amount_per_night?.value
                || hotelP?.product_price_breakdowns?.[0]?.gross_amount?.value;
            currency = hotelP?.composite_price_breakdown?.gross_amount_per_night?.currency || 'VND';
          }
        }
      }
    } catch (e) {
      console.error("Booking API Error:", e);
    }

    // 2. TIER 2: Agoda API Fallback
    if (!priceVal) {
      try {
        const agodaSearch = await fetch(`https://agoda-com.p.rapidapi.com/hotels/auto-complete?query=${encodeURIComponent(name)}`, {
          headers: { "X-RapidAPI-Key": rapidKey, "X-RapidAPI-Host": "agoda-com.p.rapidapi.com" },
          next: { revalidate: 86400 }
        });

        if (agodaSearch.ok) {
          const searchData = await agodaSearch.json();
          const hotelA = searchData.places?.find((p: any) => p.typeId === 4) || searchData.places?.[0];
          
          if (hotelA && hotelA.city?.id) {
            hotelIdForSync = hotelA.id?.toString() || "";
            const searchId = `1_${hotelA.city.id}`;
            const agodaRes = await fetch(`https://agoda-com.p.rapidapi.com/hotels/search-overnight?id=${searchId}&checkinDate=${arr}&checkoutDate=${dep}&adults=${adults}&rooms=${rooms}&currency=VND`, {
              headers: { "X-RapidAPI-Key": rapidKey, "X-RapidAPI-Host": "agoda-com.p.rapidapi.com" },
              next: { revalidate: 3600 }
            });
            
            if (agodaRes.ok) {
              const agodaData = await agodaRes.json();
              const props = agodaData?.data?.citySearch?.properties || [];
              
              // Find precise match
              const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
              const nameNorm = normalize(name);
              const matched = props.find((p:any) => normalize(p.content?.informationSummary?.displayName || "").includes(nameNorm));
              
              if (matched) {
                priceVal = matched.pricing?.priceAsPerPricingSummary?.price?.exactPrice;
                currency = matched.pricing?.priceAsPerPricingSummary?.price?.currency || 'VND';
              }
            }
          }
        }
      } catch (e) {
        console.error("Agoda API Error:", e);
      }
    }

    // 3. Sync & Return
    if (priceVal) {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
      fetch(`${backendUrl}/api/hotels/sync-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          booking_id: hotelIdForSync,
          agoda_id: hotelIdForSync, // We pass what we have
          price: priceVal
        })
      }).catch(err => console.error("Failed to sync price to DB:", err));

      return NextResponse.json({ price: priceVal, currency });
    }

    return NextResponse.json({ error: 'No price found on either Booking or Agoda' }, { status: 404 });
  } catch (error) {
    console.error("List Pricing API Error:", error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
