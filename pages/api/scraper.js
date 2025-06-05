import puppeteer from 'puppeteer';
import admin from 'firebase-admin';
import path from 'path';
import { readFileSync } from 'fs';

const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

// Inicializar Firebase una sola vez
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.goto('https://bwt.cbp.gov/details/250601/POV', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    const tiempo = await page.$eval('.curr-wait', el => el.innerText);

    await db.collection('cruces').add({
      garita: 'Otay',
      tiempo_espera: tiempo,
      timestamp: admin.firestore.Timestamp.now()
    });

    await browser.close();

    res.status(200).json({ garita: 'Otay', tiempo_espera: tiempo });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: 'Error al obtener o guardar tiempo de espera' });
  }
}
