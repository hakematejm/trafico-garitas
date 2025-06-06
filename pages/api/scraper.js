import puppeteer from 'puppeteer';
import admin from 'firebase-admin';
import serviceAccount from '../../serviceAccountKey.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const garita = 'Otay Mesa';
const url = 'https://bwt.cbp.gov/details/250601/POV';

export default async function handler(req, res) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    await page.waitForFunction(() => {
      const el = document.querySelector('.loading-message') || document.body;
      return !el.innerText.includes('Loading data');
    }, { timeout: 30000 });

    const resultados = await page.evaluate(() => {
      const filas = Array.from(document.querySelectorAll('.table tbody tr'));
      return filas.map(fila => {
        const celdas = fila.querySelectorAll('td');
        return {
          tipo: celdas[0]?.innerText.trim(),
          tiempo: celdas[1]?.innerText.trim()
        };
      });
    });

    for (const resultado of resultados) {
      const tipo = resultado.tipo.toUpperCase();
      const minutos = parseInt(resultado.tiempo) || 0;

      await db.collection('cruces').add({
        garita,
        tipoLinea: tipo,
        tiempoMinutos: minutos,
        timestamp: new Date()
      });

      console.log(`✅ ${tipo}: ${minutos} min`);
    }

    res.status(200).json({ mensaje: 'Tiempos guardados correctamente.' });
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    await browser.close();
  }
}
