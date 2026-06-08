export default async function handler(req, res) {
  // Allow requests from our own app
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const webhookUrl = process.env.APPS_SCRIPT_WEBHOOK_URL
  if (!webhookUrl) {
    return res.status(500).json({ 
      error: 'APPS_SCRIPT_WEBHOOK_URL not configured in Vercel environment variables' 
    })
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      redirect: 'follow',
    })
    const text = await response.text()
    let data
    try { data = JSON.parse(text) } catch { data = { result: text } }
    return res.status(200).json({ success: true, ...data })
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message })
  }
}
