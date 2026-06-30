import { supabase } from '@/lib/supabase'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q) {
    return Response.json({ results: [] })
  }

  const { data, error } = await supabase
    .from('shipments')
    .select('tracking_number, ship_date, service_type, weight, negotiated_charge, published_charge, recipient_name')
    .ilike('tracking_number', `%${q}%`)
    .order('ship_date', { ascending: false })
    .limit(50)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ results: data })
}
