import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hotel_id = searchParams.get('hotel_id');
  const arrival_date = searchParams.get('arrival_date');
  const departure_date = searchParams.get('departure_date');
  const adults = searchParams.get('adults') || '2';
  const room_qty = searchParams.get('room_qty') || '1';
  const hotel_name = searchParams.get('hotel_name') || '';
  const lang = searchParams.get('lang') || 'en-us';

  if (!hotel_id || !arrival_date || !departure_date) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://apidojo-booking-v1.p.rapidapi.com/properties/detail?hotel_id=${hotel_id}&arrival_date=${arrival_date}&departure_date=${departure_date}&adults=${adults}&room_qty=${room_qty}&languagecode=${lang}&currency_code=VND`, {
      headers: {
        'X-RapidAPI-Key': process.env.RAPID_API_KEY || '',
        'X-RapidAPI-Host': 'apidojo-booking-v1.p.rapidapi.com'
      },
      next: { revalidate: 60 } // cache for 1 minute
    });

    if (!res.ok) {
      throw new Error(`RapidAPI Error: ${res.status}`);
    }

    const data = await res.json();
    
    // Extract price from the first item
    if (data && data.length > 0) {
      const hotelData = data[0];
      const priceVal = hotelData.composite_price_breakdown?.gross_amount_per_night?.value 
        || hotelData.composite_price_breakdown?.gross_amount?.value
        || hotelData.product_price_breakdowns?.[0]?.gross_amount_per_night?.value;
        
      const totalVal = hotelData.composite_price_breakdown?.gross_amount?.value 
        || hotelData.product_price_breakdowns?.[0]?.gross_amount?.value;
        
      const currency = hotelData.composite_price_breakdown?.gross_amount_per_night?.currency || 'VND';

      if (priceVal) {
        // Fire & Forget DB Sync
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
        fetch(`${backendUrl}/api/hotels/sync-price`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: hotel_name, // Important to match and update DB correctly!
            booking_id: hotel_id,
            price: priceVal
          })
        }).catch(err => console.error("Failed to sync price to DB:", err));

        
        const block = hotelData.block?.[0] || {};
        
        return NextResponse.json({ 
          price_per_night: priceVal, 
          total_price: totalVal,
          currency: currency,
          url: hotelData.url || null,
          has_breakfast: hotelData.hotel_include_breakfast === 1 || block.breakfast_included === 1,
          has_lunch: block.lunch_included === 1,
          has_dinner: block.dinner_included === 1,
          all_inclusive: block.all_inclusive === 1,
          free_parking: block.can_reserve_free_parking === 1,
          no_prepayment: block.paymentterms?.prepayment?.type_extended?.includes('no_prepayment') || block.paymentterms?.prepayment?.type_translation?.toLowerCase()?.includes('no prepayment') || false,
          max_occupancy: block.max_occupancy || null,
          cancellation_text: block.paymentterms?.cancellation?.timeline?.stages?.[0]?.text || null,
          is_free_cancellable: block.paymentterms?.cancellation?.type === "free_cancellation" || false
        });
      }
    }

    return NextResponse.json({ error: 'Price not found for these dates' }, { status: 404 });
  } catch (error) {
    console.error("Pricing API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch price' }, { status: 500 });
  }
}
