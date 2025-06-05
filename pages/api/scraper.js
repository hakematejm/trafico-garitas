import puppeteer from 'puppeteer';
import admin from 'firebase-admin';
import serviceAccount from '../../../serviceAccountKey.json'; // Ajusta esta ruta según ubicación real

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

export default async function handler(req, res) {
  try {
    console.log('✅ Cron ejecutado');

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto('https://bwt.cbp.gov/details/250601/POV', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    const tiempo = await page.$eval('.curr-wait', (el) => el?.innerText || 'No disponible');
    await browser.close();

    const data = {
      garita: 'Otay',
      tiempo_espera: tiempo,
      timestamp: new Date(),
    };

    await db.collection('tiempos_garitas').add(data);

    console.log('📥 Datos guardados:', data);
    res.status(200).json({ status: 'ok', data });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: 'Error ejecutando scraper', detalle: error.message });
  }
}
