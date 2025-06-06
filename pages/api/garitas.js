// pages/api/garitas.js
import admin from 'firebase-admin';
import serviceAccount from '../../../serviceAccountKey.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  const isLocal = req.headers.host.startsWith('localhost');
  const baseUrl = isLocal ? 'http://localhost:3000' : `https://${req.headers.host}`;

  const fecha = new Date();
  const timestamp = admin.firestore.Timestamp.fromDate(fecha);
  const fecha_local = fecha.toLocaleString('es-MX', { timeZone: 'America/Tijuana' });

  const errores = [];
  const resultados = {};

  // Función para guardar en subcolección
  const guardarDatos = async (garita, datos) => {
    await db.collection(`garitas/${garita}/esperas`).add({
      ...datos,
      nombre: garita === 'otay' ? 'Otay' : 'San Ysidro',
      origen: 'api',
      fecha_local,
      timestamp
    });
  };

  // Otay
  try {
    const otayRes = await fetch(`${baseUrl}/api/otay`);
    if (!otayRes.ok) throw new Error(`Otay API response: ${otayRes.status}`);
    const otayData = await otayRes.json();
    await guardarDatos('otay', otayData);
    resultados.otay = otayData;
  } catch (error) {
    errores.push(`❌ Otay: ${error.message}`);
  }

  // San Ysidro
  try {
    const sydRes = await fetch(`${baseUrl}/api/sanysidro`);
    if (!sydRes.ok) throw new Error(`San Ysidro API response: ${sydRes.status}`);
    const sydData = await sydRes.json();
    await guardarDatos('sanysidro', sydData);
    resultados.sanysidro = sydData;
  } catch (error) {
    errores.push(`❌ San Ysidro: ${error.message}`);
  }

  if (!resultados.otay && !resultados.sanysidro) {
    return res.status(500).json({
      error: 'No se pudieron obtener datos de ninguna garita',
      errores,
    });
  }

  return res.status(200).json({
    mensaje: '✅ Datos guardados correctamente en Firebase por subcolección',
    fecha_local,
    ...resultados,
    errores,
  });
}
