import { supabase } from '@/lib/supabase'

// Recipient names may be a person ("Jane Smith") or a company — mask
// everything after the first word so a customer's last name never
// reaches the browser.
function maskLastName(name) {
  if (!name) return name
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 1) return name
  return `${parts[0]} ***`
}

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

  const results = data.map(row => ({ ...row, recipient_name: maskLastName(row.recipient_name) }))

  return Response.json({ results })
}
