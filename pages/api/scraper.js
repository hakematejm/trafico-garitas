// pages/api/scraper.js
import puppeteer from 'puppeteer';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

const db = admin.firestore();

const GARITAS = [
  {
    nombre: "San Ysidro",
    url: "https://bwt.cbp.gov/details/09250601/POV",
  },
  {
    nombre: "Otay Mesa",
    url: "https://bwt.cbp.gov/details/250601/POV",
  },
];

export default async function handler(req, res) {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const resultados = [];

    for (const garita of GARITAS) {
      await page.goto(garita.url, { waitUntil: 'networkidle2', timeout: 60000 });
      const tiempo = await page.$eval('.curr-wait', el => el.innerText.trim());

      const data = {
        garita: garita.nombre,
        tiempo_espera: tiempo,
        timestamp: new Date()
      };

      resultados.push(data);
      await db.collection('tiempos_garitas').add(data);
    }

    await browser.close();
    res.status(200).json({ status: '✅ Datos guardados', resultados });

  } catch (error) {
    console.error('❌ Error en el scraping:', error);
    res.status(500).json({ error: error.message });
  }
}
