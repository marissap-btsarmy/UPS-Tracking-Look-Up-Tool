import { getAdminClient } from '@/lib/supabase'

// Flexible column detection — handles different WorldShip export configurations
const COL_MAP = {
  tracking:   ['tracking number', 'trackingnumber', 'tracking_number', 'tracking#', 'tracking no', 'trackingno', '1z'],
  shipdate:   ['ship date', 'shipdate', 'date shipped', 'dateshipped', 'ship_date'],
  service:    ['service type', 'servicetype', 'service_type', 'service level', 'service', 'ups service'],
  weight:     ['weight', 'billed weight', 'actual weight', 'pkg weight'],
  zone:       ['zone', 'ups zone', 'shipping zone'],
  negotiated: ['negotiated charge', 'negotiatedcharge', 'net charge', 'netchg', 'amount billed', 'billed charge', 'total charge'],
  published:  ['published charge', 'publishedcharge', 'list rate', 'list price'],
  recipient:  ['ship to name', 'recipient', 'recipient name', 'company', 'ship to company', 'consignee'],
}

function findCol(headers, key) {
  const lower = headers.map(h => h.toLowerCase().trim())
  for (const candidate of COL_MAP[key]) {
    const idx = lower.findIndex(h => h.includes(candidate))
    if (idx !== -1) return idx
  }
  return -1
}

function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  return lines.filter(l => l.trim()).map(line => {
    const row = []
    let inQuote = false, cur = ''
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; continue }
      if (ch === ',' && !inQuote) { row.push(cur.trim()); cur = ''; continue }
      cur += ch
    }
    row.push(cur.trim())
    return row
  })
}

function parseNum(val) {
  if (!val) return null
  const n = parseFloat(val.replace(/[^0-9.\-]/g, ''))
  return isNaN(n) ? null : n
}

export async function POST(request) {
  const password = request.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

  const text = await file.text()
  const rows = parseCSV(text)

  if (rows.length < 2) {
    return Response.json({ error: 'CSV appears empty or could not be read' }, { status: 400 })
  }

  const headers = rows[0]
  const colIdx = {}
  for (const key of Object.keys(COL_MAP)) {
    colIdx[key] = findCol(headers, key)
  }

  const get = (row, key) => colIdx[key] >= 0 ? (row[colIdx[key]] || '') : ''

  const shipments = rows.slice(1)
    .filter(row => row.some(c => c))
    .map(row => ({
      tracking_number: get(row, 'tracking') || null,
      ship_date:       get(row, 'shipdate') || null,
      service_type:    get(row, 'service') || null,
      weight:          get(row, 'weight') || null,
      zone:            get(row, 'zone') || null,
      negotiated_charge: parseNum(get(row, 'negotiated')),
      published_charge:  parseNum(get(row, 'published')),
      recipient_name:  get(row, 'recipient') || null,
    }))

  const supabaseAdmin = getAdminClient()

  // Upsert in batches of 500 — updates existing tracking numbers, inserts new ones
  const batchSize = 500
  for (let i = 0; i < shipments.length; i += batchSize) {
    const batch = shipments.slice(i, i + batchSize)
    const { error } = await supabaseAdmin
      .from('shipments')
      .upsert(batch, { onConflict: 'tracking_number' })
    if (error) return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ imported: shipments.length })
}
