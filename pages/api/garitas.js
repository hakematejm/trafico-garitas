export default async function handler(req, res) {
  const baseUrl = req.headers.host.startsWith('localhost')
    ? 'http://localhost:3000'
    : `https://${req.headers.host}`;

  try {
    const [otayRes, sydRes] = await Promise.all([
      fetch(`${baseUrl}/api/otay`).then(r => r.json()),
      fetch(`${baseUrl}/api/sanysidro`).then(r => r.json())
    ]);

    res.status(200).json({
      "Otay Mesa": otayRes,
      "San Ysidro": sydRes
    });
  } catch (error) {
    console.error('❌ Error combinando APIs:', error.message);
    res.status(500).json({ error: 'Error al obtener datos combinados' });
  }
}
