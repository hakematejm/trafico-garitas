const puppeteer = require('puppeteer');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const GARITAS = [
  {
    nombre: "San Ysidro",
    url: "https://bwt.cbp.gov/details/09250601/POV"
  },
  {
    nombre: "Otay Mesa",
    url: "https://bwt.cbp.gov/details/250601/POV"
  }
];

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  const resultados = [];

  for (const garita of GARITAS) {
    try {
      await page.goto(garita.url, { waitUntil: "networkidle2", timeout: 60000 });
      await page.waitForSelector('.curr-wait', { timeout: 60000 });

      const exists = await page.$('.curr-wait');
      if (!exists) {
        console.log(`[${garita.nombre}] Selector .curr-wait NO encontrado`);
        continue;
      }

      const tiempo = await page.$eval('.curr-wait', el => el.innerText.trim());

      if (!tiempo || tiempo === '') {
        console.log(`[${garita.nombre}] Tiempo no válido`);
        continue;
      }

      const data = {
        garita: garita.nombre,
        tiempo_espera: tiempo,
        timestamp: new Date()
      };

      resultados.push(data);

      try {
        await db.collection('tiempos_garitas').add(data);
        console.log(`[${garita.nombre}] Datos guardados en Firestore.`);
      } catch (e) {
        console.error(`[${garita.nombre}] ❌ Error al guardar en Firestore:`, e.message);
      }

    } catch (err) {
      console.error(`[${garita.nombre}] ❌ Error en scraping:`, err.message);
    }
  }

  await browser.close();

  console.log('✅ Resultados:', resultados);
})();
