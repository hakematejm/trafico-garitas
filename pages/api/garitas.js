import admin from 'firebase-admin';
import serviceAccount from '../../../serviceAccountKey.json'; // ajusta si está en otro lugar

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

export default async function handler(req, res) {
  const baseUrl = req.headers.host.startsWith('localhost')
    ? 'http://localhost:3000'
    : `https://${req.headers.host}`;

  try {
    const [otayRes, sydRes] = await Promise.all([
      fetch(`${baseUrl}/api/otay`).then(r => r.json()),
      fetch(`${baseUrl}/api/sanysidro`).then(r => r.json())
    ]);

    const timestamp = new Date();

    // Guardar en Firestore
    await db.collection('garitas').add({
      timestamp,
      otay: otayRes,
      sanYsidro: sydRes
    });

    res.status(200).json({
      mensaje: 'Datos actualizados y guardados en Firebase',
      otay: otayRes,
      sanYsidro: sydRes
    });
  } catch (error) {
    console.error('❌ Error al guardar datos:', error.message);
    res.status(500).json({ error: 'Error al obtener o guardar datos combinados' });
  }
}
